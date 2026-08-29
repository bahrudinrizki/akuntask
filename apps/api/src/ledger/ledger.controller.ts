import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LedgerService } from './ledger.service';
import type { AuthUser, LedgerResponse } from '@akuntask/shared';

@Controller('ledger')
@UseGuards(AuthGuard('jwt'))
export class LedgerController {
  constructor(private readonly ledger: LedgerService) {}

  @Get(':coaId')
  get(
    @Param('coaId') coaId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Req() req: { user: AuthUser },
  ): Promise<LedgerResponse> {
    return this.ledger.get(coaId, req.user.companyId, from, to);
  }
}
