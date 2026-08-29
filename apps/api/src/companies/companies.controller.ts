import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module';
import { Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { CompanyDto, CreateCompanyRequest, AuthUser } from '@akuntask/shared';

class CreateCompanyDto implements CreateCompanyRequest {
  @IsString() name!: string;
  @IsOptional() @IsString() npwp?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() industry?: string;
}

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

@Controller('companies')
@UseGuards(AuthGuard('jwt'))
export class CompaniesController {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  @Get()
  async list(@Req() req: { user: AuthUser }): Promise<CompanyDto[]> {
    const companies = await this.prisma.company.findMany({
      where: { id: req.user.companyId },
      orderBy: { createdAt: 'desc' },
    });
    return companies.map(toDto);
  }

  @Get('me')
  async me(@Req() req: { user: AuthUser }): Promise<CompanyDto> {
    const c = await this.prisma.company.findUniqueOrThrow({ where: { id: req.user.companyId } });
    return toDto(c);
  }

  @Post()
  async create(@Body() body: CreateCompanyDto): Promise<CompanyDto> {
    const c = await this.prisma.company.create({ data: body });
    return toDto(c);
  }
}
