import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { UsersModule } from './users/users.module';
import { CoaModule } from './coa/coa.module';
import { JournalsModule } from './journals/journals.module';
import { LedgerModule } from './ledger/ledger.module';
import { ReportsModule } from './reports/reports.module';
import { ClosingModule } from './closing/closing.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CompaniesModule,
    UsersModule,
    CoaModule,
    JournalsModule,
    LedgerModule,
    ReportsModule,
    ClosingModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
