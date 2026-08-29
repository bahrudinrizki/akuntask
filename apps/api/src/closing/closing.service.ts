import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { ClosingResult, JournalDto } from '@akuntask/shared';
import { PRISMA_CLIENT } from '../prisma/prisma.module';

const round = (n: number): number => Math.round(n * 100) / 100;

interface JournalRow {
  id: string;
  referenceNo: string;
  date: Date;
  description: string;
  status: string;
  totalDebit: number;
  totalCredit: number;
  createdAt: Date;
  lines: Array<{ id: string; coaId: string; debit: number; credit: number; description: string | null; coa: { code: string; name: string } }>;
}

function toDto(j: JournalRow): JournalDto {
  return {
    id: j.id,
    referenceNo: j.referenceNo,
    date: j.date.toISOString().slice(0, 10),
    description: j.description,
    status: j.status,
    totalDebit: j.totalDebit,
    totalCredit: j.totalCredit,
    createdAt: j.createdAt.toISOString(),
    lines: j.lines.map((l) => ({
      id: l.id,
      coaId: l.coaId,
      coaCode: l.coa.code,
      coaName: l.coa.name,
      debit: l.debit,
      credit: l.credit,
      description: l.description,
    })),
  };
}

@Injectable()
export class ClosingService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async close(companyId: string, userId: string, from: string, to: string): Promise<ClosingResult> {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }
    if (fromDate > toDate) throw new BadRequestException('`from` must be <= `to`');

    // Idempotency: any existing closing journal that touches period?
    const periodClosing = await this.prisma.journal.findFirst({
      where: {
        companyId,
        status: 'CLOSING',
        date: { gte: fromDate, lte: toDate },
      },
    });
    if (periodClosing) {
      throw new BadRequestException(
        `Periode ini sudah ditutup (closing journal ${periodClosing.referenceNo} pada ${periodClosing.date.toISOString().slice(0, 10)})`,
      );
    }

    const [labaAccount, modalAccount] = await Promise.all([
      this.prisma.chartOfAccount.findFirst({ where: { companyId, code: '3201' } }),
      this.prisma.chartOfAccount.findFirst({ where: { companyId, code: '3101' } }),
    ]);
    if (!labaAccount) throw new NotFoundException('Akun 3201 Laba Tahun Berjalan tidak ditemukan di COA');
    if (!modalAccount) throw new NotFoundException('Akun 3101 Modal Pemilik tidak ditemukan di COA');

    // Aggregate REVENUE (credit) and EXPENSE (debit) balances in period
    const [revenueAgg, expenseAgg] = await Promise.all([
      this.prisma.journalLine.groupBy({
        by: ['coaId'],
        where: { coa: { companyId, type: 'REVENUE', level: 3 }, journal: { companyId, date: { gte: fromDate, lte: toDate } } },
        _sum: { credit: true, debit: true },
      }),
      this.prisma.journalLine.groupBy({
        by: ['coaId'],
        where: { coa: { companyId, type: 'EXPENSE', level: 3 }, journal: { companyId, date: { gte: fromDate, lte: toDate } } },
        _sum: { debit: true, credit: true },
      }),
    ]);

    const revenueAccounts = await this.prisma.chartOfAccount.findMany({ where: { companyId, type: 'REVENUE', level: 3 } });
    const expenseAccounts = await this.prisma.chartOfAccount.findMany({ where: { companyId, type: 'EXPENSE', level: 3 } });

    const lines1: Array<{ coaId: string; debit: number; credit: number }> = [];
    let dr1 = 0; let cr1 = 0;
    for (const acc of revenueAccounts) {
      const agg = revenueAgg.find((a) => a.coaId === acc.id);
      const amount = round((agg?._sum.credit ?? 0) - (agg?._sum.debit ?? 0));
      if (amount > 0) { lines1.push({ coaId: acc.id, debit: amount, credit: 0 }); dr1 += amount; }
    }
    for (const acc of expenseAccounts) {
      const agg = expenseAgg.find((a) => a.coaId === acc.id);
      const amount = round((agg?._sum.debit ?? 0) - (agg?._sum.credit ?? 0));
      if (amount > 0) { lines1.push({ coaId: acc.id, debit: 0, credit: amount }); cr1 += amount; }
    }
    const net = round(dr1 - cr1);
    if (net === 0) {
      throw new BadRequestException('Tidak ada saldo Revenue/Expense di periode ini — closing tidak diperlukan');
    }
    if (net > 0) {
      lines1.push({ coaId: labaAccount.id, debit: 0, credit: net });
      cr1 += net;
    } else {
      lines1.push({ coaId: labaAccount.id, debit: -net, credit: 0 });
      dr1 += -net;
    }
    const ref1 = `JR-CLOSE-${fromDate.toISOString().slice(0, 10).replace(/-/g, '')}-1`;

    const ref2 = `JR-CLOSE-${fromDate.toISOString().slice(0, 10).replace(/-/g, '')}-2`;
    const lines2 = net > 0
      ? [{ coaId: labaAccount.id, debit: net, credit: 0 }, { coaId: modalAccount.id, debit: 0, credit: net }]
      : [{ coaId: modalAccount.id, debit: -net, credit: 0 }, { coaId: labaAccount.id, debit: 0, credit: -net }];
    const absNet = Math.abs(net);

    const created = await this.prisma.$transaction(async (tx) => {
      const j1 = await tx.journal.create({
        data: {
          companyId, referenceNo: ref1, date: toDate,
          description: `Jurnal penutup #1: zeroing revenue & expense ke Laba Tahun Berjalan (net ${net.toLocaleString('id-ID')})`,
          status: 'CLOSING', totalDebit: dr1, totalCredit: cr1, createdById: userId,
          lines: { create: lines1.map((l) => ({ coaId: l.coaId, debit: l.debit, credit: l.credit })) },
        },
        include: { lines: { include: { coa: { select: { code: true, name: true } } } } },
      });
      const j2 = await tx.journal.create({
        data: {
          companyId, referenceNo: ref2, date: toDate,
          description: `Jurnal penutup #2: transfer Laba Tahun Berjalan ke Modal Pemilik`,
          status: 'CLOSING', totalDebit: absNet, totalCredit: absNet, createdById: userId,
          lines: { create: lines2.map((l) => ({ coaId: l.coaId, debit: l.debit, credit: l.credit })) },
        },
        include: { lines: { include: { coa: { select: { code: true, name: true } } } } },
      });
      return [j1, j2] as JournalRow[];
    });

    return {
      closingJournals: created.map(toDto),
      totalRevenue: round(revenueAgg.reduce((s, a) => s + ((a._sum.credit ?? 0) - (a._sum.debit ?? 0)), 0)),
      totalExpense: round(expenseAgg.reduce((s, a) => s + ((a._sum.debit ?? 0) - (a._sum.credit ?? 0)), 0)),
      netProfit: net,
      periodFrom: from,
      periodTo: to,
    };
  }
}
