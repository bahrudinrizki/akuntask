import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { CoaType, LedgerEntry, LedgerResponse } from '@akuntask/shared';
import { PRISMA_CLIENT } from '../prisma/prisma.module';

const round2 = (n: number): number => Math.round(n * 100) / 100;

@Injectable()
export class LedgerService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async get(coaId: string, companyId: string, from: string, to: string): Promise<LedgerResponse> {
    const coa = await this.prisma.chartOfAccount.findFirst({ where: { id: coaId, companyId } });
    if (!coa) throw new NotFoundException('COA not found');

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }
    if (fromDate > toDate) throw new BadRequestException('`from` must be <= `to`');

    // Opening balance: sum(debit - credit) of all lines for this COA before `from`
    const openingAgg = await this.prisma.journalLine.aggregate({
      _sum: { debit: true, credit: true },
      where: {
        coaId,
        journal: { companyId, date: { lt: fromDate } },
      },
    });
    const opening = round2((openingAgg._sum.debit ?? 0) - (openingAgg._sum.credit ?? 0));

    // In-period lines ordered by date
    const lines = await this.prisma.journalLine.findMany({
      where: {
        coaId,
        journal: { companyId, date: { gte: fromDate, lte: toDate } },
      },
      include: {
        journal: { select: { id: true, date: true, referenceNo: true, description: true } },
      },
      orderBy: [{ journal: { date: 'asc' } }, { id: 'asc' }],
    });

    let running = opening;
    const entries: LedgerEntry[] = lines.map((l) => {
      const debit = round2(l.debit);
      const credit = round2(l.credit);
      running = round2(running + debit - credit);
      return {
        journalId: l.journal.id,
        date: l.journal.date.toISOString().slice(0, 10),
        referenceNo: l.journal.referenceNo,
        description: l.description ?? l.journal.description,
        debit,
        credit,
        balance: running,
      };
    });

    const totalDebit = round2(entries.reduce((s, e) => s + e.debit, 0));
    const totalCredit = round2(entries.reduce((s, e) => s + e.credit, 0));
    const closing = round2(opening + totalDebit - totalCredit);

    return {
      coa: {
        id: coa.id,
        code: coa.code,
        name: coa.name,
        type: coa.type as CoaType,
        parentId: coa.parentId,
        level: coa.level,
        isActive: coa.isActive,
        createdAt: coa.createdAt.toISOString(),
        updatedAt: coa.updatedAt.toISOString(),
      },
      from,
      to,
      opening,
      totalDebit,
      totalCredit,
      closing,
      entries,
    };
  }
}
