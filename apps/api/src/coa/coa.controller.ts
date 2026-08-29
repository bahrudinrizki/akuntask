import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';
import { CoaService } from './coa.service';
import type { AuthUser, CoaDto, CreateCoaRequest, UpdateCoaRequest, CoaType } from '@akuntask/shared';

class CreateCoaDto implements CreateCoaRequest {
  @IsString() code!: string;
  @IsString() name!: string;
  @IsIn(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']) type!: CoaType;
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsInt() @Min(1) level?: number;
}

class UpdateCoaDto implements UpdateCoaRequest {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() parentId?: string | null;
}

@Controller('coa')
@UseGuards(AuthGuard('jwt'))
export class CoaController {
  constructor(private readonly coa: CoaService) {}

  @Get()
  list(@Req() req: { user: AuthUser }): Promise<CoaDto[]> {
    return this.coa.list(req.user.companyId);
  }

  @Get(':id')
  get(@Param('id') id: string, @Req() req: { user: AuthUser }): Promise<CoaDto> {
    return this.coa.get(id, req.user.companyId);
  }

  @Post()
  create(@Body() body: CreateCoaDto, @Req() req: { user: AuthUser }): Promise<CoaDto> {
    return this.coa.create(req.user.companyId, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateCoaDto, @Req() req: { user: AuthUser }): Promise<CoaDto> {
    return this.coa.update(id, req.user.companyId, body);
  }
}
