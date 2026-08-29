import { Global, Module, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export const PRISMA_CLIENT = 'PRISMA_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: PRISMA_CLIENT,
      useFactory: () => new PrismaClient(),
    },
  ],
  exports: [PRISMA_CLIENT],
})
export class PrismaModule implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}
  async onModuleInit(): Promise<void> {
    await this.prisma.$connect();
  }
  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
