import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface CoaSeed {
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parent?: string;
  level: number;
}

const PSAK_COA: CoaSeed[] = [
  // ASSET (1xxxx)
  { code: '1000', name: 'ASET', type: 'ASSET', level: 1 },
  { code: '1100', name: 'Aset Lancar', type: 'ASSET', parent: '1000', level: 2 },
  { code: '1101', name: 'Kas', type: 'ASSET', parent: '1100', level: 3 },
  { code: '1102', name: 'Bank', type: 'ASSET', parent: '1100', level: 3 },
  { code: '1103', name: 'Piutang Usaha', type: 'ASSET', parent: '1100', level: 3 },
  { code: '1104', name: 'Piutang Lain-lain', type: 'ASSET', parent: '1100', level: 3 },
  { code: '1200', name: 'Persediaan', type: 'ASSET', parent: '1000', level: 2 },
  { code: '1201', name: 'Persediaan Barang Dagang', type: 'ASSET', parent: '1200', level: 3 },
  { code: '1300', name: 'Aset Tetap', type: 'ASSET', parent: '1000', level: 2 },
  { code: '1301', name: 'Peralatan', type: 'ASSET', parent: '1300', level: 3 },
  { code: '1302', name: 'Akumulasi Penyusutan Peralatan', type: 'ASSET', parent: '1300', level: 3 },
  { code: '1400', name: 'Aset Tidak Lancar Lainnya', type: 'ASSET', parent: '1000', level: 2 },

  // LIABILITY (2xxxx)
  { code: '2000', name: 'LIABILITAS', type: 'LIABILITY', level: 1 },
  { code: '2100', name: 'Liabilitas Jangka Pendek', type: 'LIABILITY', parent: '2000', level: 2 },
  { code: '2101', name: 'Hutang Usaha', type: 'LIABILITY', parent: '2100', level: 3 },
  { code: '2102', name: 'Hutang Pajak', type: 'LIABILITY', parent: '2100', level: 3 },
  { code: '2103', name: 'Hutang Gaji', type: 'LIABILITY', parent: '2100', level: 3 },
  { code: '2200', name: 'Liabilitas Jangka Panjang', type: 'LIABILITY', parent: '2000', level: 2 },
  { code: '2201', name: 'Hutang Bank', type: 'LIABILITY', parent: '2200', level: 3 },

  // EQUITY (3xxxx)
  { code: '3000', name: 'EKUITAS', type: 'EQUITY', level: 1 },
  { code: '3100', name: 'Modal Disetor', type: 'EQUITY', parent: '3000', level: 2 },
  { code: '3101', name: 'Modal Pemilik', type: 'EQUITY', parent: '3100', level: 3 },
  { code: '3200', name: 'Laba Ditahan', type: 'EQUITY', parent: '3000', level: 2 },
  { code: '3201', name: 'Laba Tahun Berjalan', type: 'EQUITY', parent: '3200', level: 3 },
  { code: '3300', name: 'Prive', type: 'EQUITY', parent: '3000', level: 2 },

  // REVENUE (4xxxx)
  { code: '4000', name: 'PENDAPATAN', type: 'REVENUE', level: 1 },
  { code: '4100', name: 'Pendapatan Usaha', type: 'REVENUE', parent: '4000', level: 2 },
  { code: '4101', name: 'Penjualan', type: 'REVENUE', parent: '4100', level: 3 },
  { code: '4102', name: 'Pendapatan Jasa', type: 'REVENUE', parent: '4100', level: 3 },
  { code: '4200', name: 'Pendapatan Lain-lain', type: 'REVENUE', parent: '4000', level: 2 },
  { code: '4201', name: 'Pendapatan Bunga', type: 'REVENUE', parent: '4200', level: 3 },

  // EXPENSE (5xxxx)
  { code: '5000', name: 'BEBAN', type: 'EXPENSE', level: 1 },
  { code: '5100', name: 'Beban Pokok Penjualan', type: 'EXPENSE', parent: '5000', level: 2 },
  { code: '5101', name: 'HPP', type: 'EXPENSE', parent: '5100', level: 3 },
  { code: '5200', name: 'Beban Operasional', type: 'EXPENSE', parent: '5000', level: 2 },
  { code: '5201', name: 'Beban Gaji', type: 'EXPENSE', parent: '5200', level: 3 },
  { code: '5202', name: 'Beban Sewa', type: 'EXPENSE', parent: '5200', level: 3 },
  { code: '5203', name: 'Beban Listrik & Air', type: 'EXPENSE', parent: '5200', level: 3 },
  { code: '5204', name: 'Beban Telepon & Internet', type: 'EXPENSE', parent: '5200', level: 3 },
  { code: '5205', name: 'Beban ATK', type: 'EXPENSE', parent: '5200', level: 3 },
  { code: '5300', name: 'Beban Administrasi & Umum', type: 'EXPENSE', parent: '5000', level: 2 },
  { code: '5301', name: 'Beban Penyusutan', type: 'EXPENSE', parent: '5300', level: 3 },
  { code: '5400', name: 'Beban Lain-lain', type: 'EXPENSE', parent: '5000', level: 2 },
];

async function seedCompany(id: string, name: string, email: string): Promise<string> {
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPerms = JSON.stringify(['*']);
  const accountantPerms = JSON.stringify(['ACC:*', 'RPT:READ', 'SAL:READ', 'PUR:READ']);
  const viewerPerms = JSON.stringify(['RPT:READ']);

  const company = await prisma.company.upsert({
    where: { id },
    update: { name },
    create: { id, name, npwp: '01.234.567.8-901.000', address: 'Jl. Sudirman No. 1, Jakarta', phone: '021-1234567', email: 'info@contoh.co.id' },
  });

  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: 'OWNER' }, update: { permissions: adminPerms }, create: { name: 'OWNER', description: 'Full access', permissions: adminPerms } }),
    prisma.role.upsert({ where: { name: 'ACCOUNTANT' }, update: { permissions: accountantPerms }, create: { name: 'ACCOUNTANT', description: 'Accounting staff', permissions: accountantPerms } }),
    prisma.role.upsert({ where: { name: 'VIEWER' }, update: { permissions: viewerPerms }, create: { name: 'VIEWER', description: 'Read-only', permissions: viewerPerms } }),
  ]);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { companyId: company.id, email, name: 'Budi Owner', passwordHash },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: roles[0].id } },
    update: {},
    create: { userId: user.id, roleId: roles[0].id },
  });

  const codeToId = new Map<string, string>();
  for (const c of PSAK_COA) {
    const parentId = c.parent ? codeToId.get(c.parent) ?? null : null;
    const created = await prisma.chartOfAccount.upsert({
      where: { companyId_code: { companyId: company.id, code: c.code } },
      update: { name: c.name, type: c.type, parentId, level: c.level, isActive: true },
      create: { companyId: company.id, code: c.code, name: c.name, type: c.type, parentId, level: c.level, isActive: true },
    });
    codeToId.set(c.code, created.id);
  }

  return company.id;
}

async function main(): Promise<void> {
  await seedCompany('seed-company-1', 'PT Contoh Makmur', 'owner@contoh.co.id');
  console.log('Seed completed: companies, users, roles, and PSAK COA template');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
