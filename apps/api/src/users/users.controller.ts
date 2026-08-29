import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';
import { Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA_CLIENT } from '../prisma/prisma.module';
import * as bcrypt from 'bcryptjs';
import type { AuthUser } from '@akuntask/shared';

class InviteUserDto {
  @IsEmail() email!: string;
  @IsString() name!: string;
  @IsString() @MinLength(8) password!: string;
}

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  @Get('me')
  me(@Req() req: { user: AuthUser }): AuthUser {
    return req.user;
  }

  @Post()
  async invite(@Body() body: InviteUserDto, @Req() req: { user: AuthUser }): Promise<{ id: string; email: string; name: string }> {
    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await this.prisma.user.create({
      data: { email: body.email, name: body.name, passwordHash, companyId: req.user.companyId },
      select: { id: true, email: true, name: true },
    });
    return user;
  }
}
