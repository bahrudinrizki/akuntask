import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { CoaDto, CoaType, CreateCoaRequest, UpdateCoaRequest } from '@akuntask/shared';
import { PRISMA_CLIENT } from '../prisma/prisma.module';

const VALID_TYPES: CoaType[] = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];

function toDto(c: {
  id: string;
  code: string;
  name: string;
  type: string;
  parentId: string | null;
  level: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): CoaDto {
  return {
    id: c.id,
    code: c.code,
    name: c.name,
    type: c.type as CoaType,
    parentId: c.parentId,
    level: c.level,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

@Injectable()
export class CoaService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async list(companyId: string): Promise<CoaDto[]> {
    const rows = await this.prisma.chartOfAccount.findMany({
      where: { companyId },
      orderBy: [{ level: 'asc' }, { code: 'asc' }],
    });
    return rows.map(toDto);
  }

  async get(id: string, companyId: string): Promise<CoaDto> {
    const row = await this.prisma.chartOfAccount.findFirst({ where: { id, companyId } });
    if (!row) throw new NotFoundException('COA not found');
    return toDto(row);
  }

  async create(companyId: string, input: CreateCoaRequest): Promise<CoaDto> {
    if (!VALID_TYPES.includes(input.type)) throw new BadRequestException(`Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`);

    let level = input.level ?? 1;
    if (input.parentId) {
      const parent = await this.prisma.chartOfAccount.findFirst({ where: { id: input.parentId, companyId } });
      if (!parent) throw new BadRequestException('Parent COA not found');
      if (parent.type !== input.type) throw new BadRequestException(`Parent type (${parent.type}) must match new account type (${input.type})`);
      level = parent.level + 1;
      if (level > 5) throw new BadRequestException('Maximum COA depth is 5 levels');
    }

    const existing = await this.prisma.chartOfAccount.findUnique({ where: { companyId_code: { companyId, code: input.code } } });
    if (existing) throw new BadRequestException(`Code ${input.code} already exists`);

    const row = await this.prisma.chartOfAccount.create({
      data: { companyId, code: input.code, name: input.name, type: input.type, parentId: input.parentId ?? null, level },
    });
    return toDto(row);
  }

  async update(id: string, companyId: string, input: UpdateCoaRequest): Promise<CoaDto> {
    const existing = await this.prisma.chartOfAccount.findFirst({ where: { id, companyId } });
    if (!existing) throw new NotFoundException('COA not found');

    if (input.parentId !== undefined && input.parentId !== null) {
      if (input.parentId === id) throw new BadRequestException('Account cannot be its own parent');
      const parent = await this.prisma.chartOfAccount.findFirst({ where: { id: input.parentId, companyId } });
      if (!parent) throw new BadRequestException('Parent COA not found');
      const descendants = await this.findDescendants(id, companyId);
      if (descendants.has(input.parentId)) throw new BadRequestException('Cannot move account under its descendant');
    }

    const row = await this.prisma.chartOfAccount.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.parentId !== undefined && { parentId: input.parentId }),
      },
    });
    return toDto(row);
  }

  private async findDescendants(rootId: string, companyId: string): Promise<Set<string>> {
    const result = new Set<string>([rootId]);
    let frontier: string[] = [rootId];
    while (frontier.length > 0) {
      const children = await this.prisma.chartOfAccount.findMany({
        where: { parentId: { in: frontier }, companyId },
        select: { id: true },
      });
      const next = children.map((c) => c.id).filter((id) => !result.has(id));
      next.forEach((id) => result.add(id));
      frontier = next;
    }
    return result;
  }
}
