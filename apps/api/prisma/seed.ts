import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPerms = JSON.stringify(['*']);
  const accountantPerms = JSON.stringify(['ACC:*', 'RPT:READ', 'SAL:READ', 'PUR:READ']);
  const viewerPerms = JSON.stringify(['RPT:READ']);

  const company = await prisma.company.upsert({
    where: { id: 'seed-company-1' },
    update: {},
    create: {
      id: 'seed-company-1',
      name: 'PT Contoh Makmur',
      npwp: '01.234.567.8-901.000',
      address: 'Jl. Sudirman No. 1, Jakarta',
      phone: '021-1234567',
      email: 'info@contoh.co.id',
    },
  });

  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'OWNER' },
      update: { permissions: adminPerms },
      create: { name: 'OWNER', description: 'Full access', permissions: adminPerms },
    }),
    prisma.role.upsert({
      where: { name: 'ACCOUNTANT' },
      update: { permissions: accountantPerms },
      create: { name: 'ACCOUNTANT', description: 'Accounting staff', permissions: accountantPerms },
    }),
    prisma.role.upsert({
      where: { name: 'VIEWER' },
      update: { permissions: viewerPerms },
      create: { name: 'VIEWER', description: 'Read-only', permissions: viewerPerms },
    }),
  ]);

  const user = await prisma.user.upsert({
    where: { email: 'owner@contoh.co.id' },
    update: { passwordHash },
    create: {
      companyId: company.id,
      email: 'owner@contoh.co.id',
      name: 'Budi Owner',
      passwordHash,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: roles[0].id } },
    update: {},
    create: { userId: user.id, roleId: roles[0].id },
  });

  console.log('Seed completed:', { company: company.name, user: user.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
