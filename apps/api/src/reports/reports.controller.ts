import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import type { AuthUser, BalanceSheetResponse, ProfitLossResponse, TrialBalanceResponse } from '@akuntask/shared';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('profit-loss')
  profitLoss(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('comparison') comparison: 'off' | 'prev' = 'off',
    @Req() req: { user: AuthUser },
  ): Promise<ProfitLossResponse> {
    return this.reports.profitLoss(req.user.companyId, from, to, comparison);
  }

  @Get('balance-sheet')
  balanceSheet(
    @Query('asOf') asOf: string,
    @Query('comparison') comparison: 'off' | 'prev' = 'off',
    @Req() req: { user: AuthUser },
  ): Promise<BalanceSheetResponse> {
    return this.reports.balanceSheet(req.user.companyId, asOf, comparison);
  }

  @Get('trial-balance')
  trialBalance(
    @Query('asOf') asOf: string,
    @Query('comparison') comparison: 'off' | 'prev' = 'off',
    @Req() req: { user: AuthUser },
  ): Promise<TrialBalanceResponse> {
    return this.reports.trialBalance(req.user.companyId, asOf, comparison);
  }
}
