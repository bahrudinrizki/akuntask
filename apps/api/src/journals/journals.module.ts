import { Module } from '@nestjs/common';
import { JournalsController } from './journals.controller';
import { JournalService } from './journals.service';

@Module({ controllers: [JournalsController], providers: [JournalService] })
export class JournalsModule {}
