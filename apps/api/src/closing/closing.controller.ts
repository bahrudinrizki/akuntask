import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { IsDateString } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';
import { ClosingService } from './closing.service';
import type { AuthUser, ClosingResult } from '@akuntask/shared';

class ClosePeriodDto {
  @IsDateString() from!: string;
  @IsDateString() to!: string;
}

@Controller('journals/closing')
@UseGuards(AuthGuard('jwt'))
export class ClosingController {
  constructor(private readonly closing: ClosingService) {}

  @Post()
  close(@Body() body: ClosePeriodDto, @Req() req: { user: AuthUser }): Promise<ClosingResult> {
    return this.closing.close(req.user.companyId, req.user.id, body.from, body.to);
  }
}
