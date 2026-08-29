import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { CreateJournalRequest, JournalDto, JournalLineInput } from '@akuntask/shared';
import { PRISMA_CLIENT } from '../prisma/prisma.module';

const round2 = (n: number): number => Math.round(n * 100) / 100;

function toDto(
  j: {
    id: string;
    referenceNo: string;
    date: Date;
    description: string;
    status: string;
    totalDebit: number;
    totalCredit: number;
    createdAt: Date;
    lines: Array<{
      id: string;
      coaId: string;
      debit: number;
      credit: number;
      description: string | null;
      coa: { code: string; name: string };
    }>;
  },
): JournalDto {
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
export class JournalService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async list(companyId: string): Promise<JournalDto[]> {
    const rows = await this.prisma.journal.findMany({
      where: { companyId },
      orderBy: { date: 'desc' },
      include: { lines: { include: { coa: { select: { code: true, name: true } } } } },
    });
    return rows.map(toDto);
  }

  async get(id: string, companyId: string): Promise<JournalDto> {
    const row = await this.prisma.journal.findFirst({
      where: { id, companyId },
      include: { lines: { include: { coa: { select: { code: true, name: true } } } } },
    });
    if (!row) throw new NotFoundException('Journal not found');
    return toDto(row);
  }

  async create(companyId: string, userId: string, input: CreateJournalRequest): Promise<JournalDto> {
    if (!input.lines || input.lines.length < 2) {
      throw new BadRequestException('Journal must have at least 2 lines');
    }

    const totalDebit = round2(input.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0));
    const totalCredit = round2(input.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0));
    if (totalDebit <= 0 || totalCredit <= 0) {
      throw new BadRequestException('Total debit and credit must be greater than zero');
    }
    if (totalDebit !== totalCredit) {
      throw new BadRequestException(`Journal not balanced: debit ${totalDebit} != credit ${totalCredit}`);
    }

    for (const line of input.lines) {
      const d = Number(line.debit) || 0;
      const c = Number(line.credit) || 0;
      if (d < 0 || c < 0) throw new BadRequestException('Debit/credit cannot be negative');
      if (d > 0 && c > 0) throw new BadRequestException('A line cannot have both debit and credit');
      if (d === 0 && c === 0) throw new BadRequestException('Each line must have either debit or credit');
    }

    const coaIds = [...new Set(input.lines.map((l) => l.coaId))];
    const coas = await this.prisma.chartOfAccount.findMany({
      where: { id: { in: coaIds }, companyId, isActive: true },
      select: { id: true },
    });
    if (coas.length !== coaIds.length) {
      throw new BadRequestException('One or more COA accounts are invalid or inactive');
    }

    const referenceNo = await this.generateReferenceNo(companyId, input.date);
    const date = new Date(input.date);

    const created = await this.prisma.journal.create({
      data: {
        companyId,
        referenceNo,
        date,
        description: input.description,
        status: 'POSTED',
        totalDebit,
        totalCredit,
        createdById: userId,
        lines: {
          create: input.lines.map((l: JournalLineInput) => ({
            coaId: l.coaId,
            debit: Number(l.debit) || 0,
            credit: Number(l.credit) || 0,
            description: l.description,
          })),
        },
      },
      include: { lines: { include: { coa: { select: { code: true, name: true } } } } },
    });
    return toDto(created);
  }

  private async generateReferenceNo(companyId: string, dateStr: string): Promise<string> {
    const date = new Date(dateStr);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const prefix = `JR-${year}${month}-`;
    const count = await this.prisma.journal.count({
      where: { companyId, referenceNo: { startsWith: prefix } },
    });
    return `${prefix}${String(count + 1).padStart(4, '0')}`;
  }
}
