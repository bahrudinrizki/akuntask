import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { BalanceSheetResponse, CoaType, ProfitLossResponse, ReportSection, TrialBalanceResponse } from '@akuntask/shared';
import { PRISMA_CLIENT } from '../prisma/prisma.module';

const round = (n: number): number => Math.round(n * 100) / 100;
type Balance = { debit: number; credit: number };

@Injectable()
export class ReportsService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  private date(value: string): Date {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    return date;
  }

  private previousMonth(asOf: string): string {
    const d = this.date(asOf);
    d.setUTCMonth(d.getUTCMonth() - 1);
    return d.toISOString().slice(0, 10);
  }

  private previousRange(from: string, to: string): { from: string; to: string } {
    const start = this.date(from);
    const end = this.date(to);
    if (start > end) throw new BadRequestException('`from` must be <= `to`');
    const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
    const prevEnd = new Date(start);
    prevEnd.setUTCDate(prevEnd.getUTCDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setUTCDate(prevStart.getUTCDate() - days + 1);
    return { from: prevStart.toISOString().slice(0, 10), to: prevEnd.toISOString().slice(0, 10) };
  }

  private async balances(companyId: string, until: Date, from?: Date): Promise<Map<string, Balance>> {
    const lines = await this.prisma.journalLine.findMany({
      where: { journal: { companyId, date: from ? { gte: from, lte: until } : { lte: until } } },
      select: { coaId: true, debit: true, credit: true },
    });
    const map = new Map<string, Balance>();
    for (const line of lines) {
      const current = map.get(line.coaId) ?? { debit: 0, credit: 0 };
      current.debit += line.debit;
      current.credit += line.credit;
      map.set(line.coaId, current);
    }
    return map;
  }

  private amount(balance: Balance | undefined, type: CoaType): number {
    if (!balance) return 0;
    return round(['ASSET', 'EXPENSE'].includes(type) ? balance.debit - balance.credit : balance.credit - balance.debit);
  }

  private async sections(companyId: string, types: CoaType[], balances: Map<string, Balance>, previous?: Map<string, Balance>): Promise<ReportSection[]> {
    const accounts = await this.prisma.chartOfAccount.findMany({ where: { companyId, type: { in: types }, isActive: true }, include: { children: { select: { id: true } } }, orderBy: { code: 'asc' } });
    const byId = new Map(accounts.map((a) => [a.id, a]));
    const sections = new Map<string, ReportSection>();
    for (const account of accounts.filter((a) => a.children.length === 0)) {
      if (account.level < 3) continue;
      let root = account;
      while (root.parentId && byId.has(root.parentId)) root = byId.get(root.parentId)!;
      const parent = account.parentId ? byId.get(account.parentId) : undefined;
      const key = parent?.id ?? root.id;
      const category = parent?.name ?? root.name;
      const section = sections.get(key) ?? { category, parentId: key, lines: [], total: 0, previousTotal: previous ? 0 : undefined };
      const amount = this.amount(balances.get(account.id), account.type as CoaType);
      const previousAmount = previous ? this.amount(previous.get(account.id), account.type as CoaType) : undefined;
      if (amount !== 0 || previousAmount !== 0) section.lines.push({ accountId: account.id, code: account.code, name: account.name, amount, ...(previous ? { previousAmount } : {}) });
      section.total += amount;
      if (previous && section.previousTotal !== undefined) section.previousTotal += previousAmount ?? 0;
      sections.set(key, section);
    }
    return [...sections.values()].map((s) => ({ ...s, total: round(s.total), ...(previous ? { previousTotal: round(s.previousTotal ?? 0) } : {}) }));
  }

  async profitLoss(companyId: string, from: string, to: string, comparison: 'off' | 'prev'): Promise<ProfitLossResponse> {
    const start = this.date(from); const end = this.date(to);
    if (start > end) throw new BadRequestException('`from` must be <= `to`');
    const current = await this.balances(companyId, end, start);
    const prevRange = comparison === 'prev' ? this.previousRange(from, to) : undefined;
    const previous = prevRange ? await this.balances(companyId, this.date(prevRange.to), this.date(prevRange.from)) : undefined;
    const revenue = await this.sections(companyId, ['REVENUE'], current, previous);
    const expense = await this.sections(companyId, ['EXPENSE'], current, previous);
    const totalRevenue = round(revenue.reduce((s, x) => s + x.total, 0));
    const totalExpense = round(expense.reduce((s, x) => s + x.total, 0));
    const previousTotalRevenue = previous ? round(revenue.reduce((s, x) => s + (x.previousTotal ?? 0), 0)) : undefined;
    const previousTotalExpense = previous ? round(expense.reduce((s, x) => s + (x.previousTotal ?? 0), 0)) : undefined;
    return { from, to, comparison, revenue, expense, totalRevenue, totalExpense, netProfit: round(totalRevenue - totalExpense), ...(previous ? { previousTotalRevenue, previousTotalExpense, previousNetProfit: round((previousTotalRevenue ?? 0) - (previousTotalExpense ?? 0)) } : {}) };
  }

  async balanceSheet(companyId: string, asOf: string, comparison: 'off' | 'prev'): Promise<BalanceSheetResponse> {
    const current = await this.balances(companyId, this.date(asOf));
    const previous = comparison === 'prev' ? await this.balances(companyId, this.date(this.previousMonth(asOf))) : undefined;
    const [assets, liabilities, equity] = await Promise.all([
      this.sections(companyId, ['ASSET'], current, previous), this.sections(companyId, ['LIABILITY'], current, previous), this.sections(companyId, ['EQUITY'], current, previous),
    ]);
    const assetsTotal = round(assets.reduce((s, x) => s + x.total, 0));
    const liabilitiesTotal = round(liabilities.reduce((s, x) => s + x.total, 0));
    const equityTotal = round(equity.reduce((s, x) => s + x.total, 0));
    const totalLiabilitiesEquity = round(liabilitiesTotal + equityTotal);
    return { asOf, comparison, assets, liabilities, equity, assetsTotal, liabilitiesTotal, equityTotal, totalLiabilitiesEquity, ...(previous ? { previousAssetsTotal: round(assets.reduce((s, x) => s + (x.previousTotal ?? 0), 0)), previousLiabilitiesTotal: round(liabilities.reduce((s, x) => s + (x.previousTotal ?? 0), 0)), previousEquityTotal: round(equity.reduce((s, x) => s + (x.previousTotal ?? 0), 0)) } : {}), balanced: assetsTotal === totalLiabilitiesEquity };
  }

  async trialBalance(companyId: string, asOf: string, comparison: 'off' | 'prev'): Promise<TrialBalanceResponse> {
    const current = await this.balances(companyId, this.date(asOf));
    const previous = comparison === 'prev' ? await this.balances(companyId, this.date(this.previousMonth(asOf))) : undefined;
    const accounts = await this.prisma.chartOfAccount.findMany({ where: { companyId, isActive: true }, orderBy: { code: 'asc' } });
    const lines = accounts.map((a) => {
      const b = current.get(a.id) ?? { debit: 0, credit: 0 };
      const p = previous?.get(a.id) ?? { debit: 0, credit: 0 };
      const net = round(b.debit - b.credit); const previousNet = round(p.debit - p.credit);
      return { accountId: a.id, code: a.code, name: a.name, type: a.type as CoaType, debit: net > 0 ? net : 0, credit: net < 0 ? -net : 0, ...(previous ? { previousDebit: previousNet > 0 ? previousNet : 0, previousCredit: previousNet < 0 ? -previousNet : 0 } : {}) };
    }).filter((l) => l.debit || l.credit || l.previousDebit || l.previousCredit);
    const totalDebit = round(lines.reduce((s, l) => s + l.debit, 0)); const totalCredit = round(lines.reduce((s, l) => s + l.credit, 0));
    return { asOf, comparison, adjusted: true, lines, totalDebit, totalCredit, ...(previous ? { previousTotalDebit: round(lines.reduce((s, l) => s + (l.previousDebit ?? 0), 0)), previousTotalCredit: round(lines.reduce((s, l) => s + (l.previousCredit ?? 0), 0)) } : {}), balanced: totalDebit === totalCredit };
  }
}
