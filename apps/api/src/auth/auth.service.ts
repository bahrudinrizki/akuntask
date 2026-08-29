import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { LoginResponse, RegisterRequest, AuthUser } from '@akuntask/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient,
  ) {}

  async register(input: RegisterRequest): Promise<LoginResponse> {
    const existing = await this.prisma.user.findUnique({ where: { email: input.user.email } });
    if (existing) throw new UnauthorizedException('Email already registered');

    const passwordHash = await bcrypt.hash(input.user.password, 10);
    const ownerRole = await this.prisma.role.findUnique({ where: { name: 'OWNER' } });
    const defaultPerms = JSON.stringify(['*']);

    const result = await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: input.company.name,
          npwp: input.company.npwp,
          address: input.company.address,
          phone: input.company.phone,
          email: input.company.email,
        },
      });
      const user = await tx.user.create({
        data: {
          companyId: company.id,
          email: input.user.email,
          passwordHash,
          name: input.user.name,
        },
      });
      const role = ownerRole ?? (await tx.role.create({
        data: { name: 'OWNER', description: 'Company owner', permissions: defaultPerms },
      }));
      await tx.userRole.create({ data: { userId: user.id, roleId: role.id } });
      return { user, company, roles: [role.name] };
    });

    return this.buildTokens(result.user.id, result.user.email, result.user.name, result.company.id, result.roles);
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const roleNames = user.roles.map((ur) => ur.role.name);
    return this.buildTokens(user.id, user.email, user.name, user.companyId, roleNames);
  }

  private buildTokens(id: string, email: string, name: string, companyId: string, roles: string[]): LoginResponse {
    const payload: AuthUser = { id, email, name, companyId, roles };
    const accessToken = this.jwt.sign(payload);
    return { accessToken, refreshToken: accessToken, user: payload };
  }
}
