import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';
import { JournalService } from './journals.service';
import type { AuthUser, CreateJournalRequest, JournalDto } from '@akuntask/shared';

class JournalLineInputDto {
  @IsString() coaId!: string;
  @IsOptional() @IsNumber() @Min(0) debit?: number;
  @IsOptional() @IsNumber() @Min(0) credit?: number;
  @IsOptional() @IsString() description?: string;
}

class CreateJournalDto implements CreateJournalRequest {
  @IsDateString() date!: string;
  @IsString() description!: string;
  @IsArray() @ArrayMinSize(2) @ValidateNested({ each: true }) @Type(() => JournalLineInputDto)
  lines!: JournalLineInputDto[];
}

@Controller('journals')
@UseGuards(AuthGuard('jwt'))
export class JournalsController {
  constructor(private readonly journals: JournalService) {}

  @Get()
  list(@Req() req: { user: AuthUser }): Promise<JournalDto[]> {
    return this.journals.list(req.user.companyId);
  }

  @Get(':id')
  get(@Param('id') id: string, @Req() req: { user: AuthUser }): Promise<JournalDto> {
    return this.journals.get(id, req.user.companyId);
  }

  @Post()
  create(@Body() body: CreateJournalDto, @Req() req: { user: AuthUser }): Promise<JournalDto> {
    return this.journals.create(req.user.companyId, req.user.id, body);
  }
}
