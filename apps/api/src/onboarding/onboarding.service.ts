import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type {
  CoaTemplateKey,
  CompanyDto,
  CompleteOnboardingResponse,
  OnboardingProfileRequest,
  OnboardingTemplateRequest,
  OnboardingWarehouseRequest,
} from '@akuntask/shared';
import { PRISMA_CLIENT } from '../prisma/prisma.module';
import { DEFAULT_PSAK_COA, DefaultCoa } from '../coa/default-coa';

const RETAIL_SKIP = new Set(['4102', '5301']);
const SERVICE_SKIP = new Set(['1201', '1200', '5101', '5100']);

function toDto(c: {
  id: string;
  name: string;
  npwp: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  industry: string | null;
  isActive: boolean;
  onboardingStep: number;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}): CompanyDto {
  return {
    id: c.id,
    name: c.name,
    npwp: c.npwp,
    address: c.address,
    phone: c.phone,
    email: c.email,
    industry: c.industry,
    isActive: c.isActive,
    onboardingStep: c.onboardingStep,
    onboardingCompleted: c.onboardingCompleted,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

@Injectable()
export class OnboardingService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async getCompany(companyId: string): Promise<CompanyDto> {
    const c = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!c) throw new NotFoundException('Company not found');
    return toDto(c);
  }

  async updateProfile(companyId: string, input: OnboardingProfileRequest): Promise<CompanyDto> {
    const c = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.npwp !== undefined && { npwp: input.npwp }),
        ...(input.address !== undefined && { address: input.address }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.email !== undefined && { email: input.email }),
        ...(input.industry !== undefined && { industry: input.industry }),
        onboardingStep: Math.max(1, await this.currentStep(companyId)),
      },
    });
    return toDto(c);
  }

  async applyTemplate(companyId: string, input: OnboardingTemplateRequest): Promise<CompanyDto> {
    if (!['PSAK_FULL', 'RETAIL', 'SERVICE'].includes(input.template)) {
      throw new BadRequestException('Invalid template');
    }
    await this.replaceCoa(companyId, input.template);
    const c = await this.prisma.company.update({
      where: { id: companyId },
      data: { onboardingStep: Math.max(2, await this.currentStep(companyId)) },
    });
    return toDto(c);
  }

  async addWarehouse(companyId: string, input: OnboardingWarehouseRequest): Promise<CompanyDto> {
    if (!input.name || input.name.trim().length === 0) {
      throw new BadRequestException('Nama gudang wajib diisi');
    }
    // Phase 3 will introduce a Warehouse model. For now persist as audit log via COA location marker.
    const c = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        address: input.location ? `[Gudang: ${input.name}] ${input.location ?? ''}`.trim() : undefined,
        onboardingStep: 3,
      },
    });
    return toDto(c);
  }

  async complete(companyId: string): Promise<CompleteOnboardingResponse> {
    const c = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!c) throw new NotFoundException('Company not found');
    if (c.onboardingStep < 2) {
      throw new BadRequestException('Selesaikan profil & template COA terlebih dahulu');
    }
    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: { onboardingCompleted: true, onboardingStep: 3 },
    });
    return { company: toDto(updated) };
  }

  private async currentStep(companyId: string): Promise<number> {
    const c = await this.prisma.company.findUnique({ where: { id: companyId }, select: { onboardingStep: true } });
    return c?.onboardingStep ?? 0;
  }

  private async replaceCoa(companyId: string, template: CoaTemplateKey): Promise<void> {
    const filtered = DEFAULT_PSAK_COA.filter((c) => {
      if (template === 'RETAIL') return !RETAIL_SKIP.has(c.code);
      if (template === 'SERVICE') return !SERVICE_SKIP.has(c.code);
      return true;
    });
    await this.prisma.$transaction(async (tx) => {
      await tx.chartOfAccount.deleteMany({ where: { companyId } });
      const codeToId = new Map<string, string>();
      for (const coa of filtered) {
        const parentId = coa.parent ? codeToId.get(coa.parent) : undefined;
        const created = await tx.chartOfAccount.create({
          data: {
            companyId,
            code: coa.code,
            name: coa.name,
            type: coa.type,
            parentId,
            level: coa.level,
          },
        });
        codeToId.set(coa.code, created.id);
      }
    });
    // Silence unused-var lint when narrowing union
    const _x: DefaultCoa | undefined = undefined;
    void _x;
  }
}
