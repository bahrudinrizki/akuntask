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
  { code: '2000', name: 'LIABILITAS', type: 'LIABILITY', level: 1 },
  { code: '2100', name: 'Liabilitas Jangka Pendek', type: 'LIABILITY', parent: '2000', level: 2 },
  { code: '2101', name: 'Hutang Usaha', type: 'LIABILITY', parent: '2100', level: 3 },
  { code: '2102', name: 'Hutang Pajak', type: 'LIABILITY', parent: '2100', level: 3 },
  { code: '2103', name: 'Hutang Gaji', type: 'LIABILITY', parent: '2100', level: 3 },
  { code: '2200', name: 'Liabilitas Jangka Panjang', type: 'LIABILITY', parent: '2000', level: 2 },
  { code: '2201', name: 'Hutang Bank', type: 'LIABILITY', parent: '2200', level: 3 },
  { code: '3000', name: 'EKUITAS', type: 'EQUITY', level: 1 },
  { code: '3100', name: 'Modal Disetor', type: 'EQUITY', parent: '3000', level: 2 },
  { code: '3101', name: 'Modal Pemilik', type: 'EQUITY', parent: '3100', level: 3 },
  { code: '3200', name: 'Laba Ditahan', type: 'EQUITY', parent: '3000', level: 2 },
  { code: '3201', name: 'Laba Tahun Berjalan', type: 'EQUITY', parent: '3200', level: 3 },
  { code: '3300', name: 'Prive', type: 'EQUITY', parent: '3000', level: 2 },
  { code: '4000', name: 'PENDAPATAN', type: 'REVENUE', level: 1 },
  { code: '4100', name: 'Pendapatan Usaha', type: 'REVENUE', parent: '4000', level: 2 },
  { code: '4101', name: 'Penjualan', type: 'REVENUE', parent: '4100', level: 3 },
  { code: '4102', name: 'Pendapatan Jasa', type: 'REVENUE', parent: '4100', level: 3 },
  { code: '4200', name: 'Pendapatan Lain-lain', type: 'REVENUE', parent: '4000', level: 2 },
  { code: '4201', name: 'Pendapatan Bunga', type: 'REVENUE', parent: '4200', level: 3 },
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

interface SeedJournal {
  ref: string;
  date: string;
  description: string;
  lines: Array<{ code: string; debit?: number; credit?: number }>;
}

const SEED_JOURNALS: SeedJournal[] = [
  { ref: 'JR-202607-0001', date: '2026-07-01', description: 'Modal awal pemilik', lines: [{ code: '1101', debit: 100_000_000 }, { code: '3101', credit: 100_000_000 }] },
  { ref: 'JR-202608-0001', date: '2026-08-02', description: 'Penjualan tunai', lines: [{ code: '1101', debit: 5_000_000 }, { code: '4101', credit: 5_000_000 }] },
  { ref: 'JR-202608-0002', date: '2026-08-05', description: 'Penjualan kredit', lines: [{ code: '1103', debit: 3_500_000 }, { code: '4101', credit: 3_500_000 }] },
  { ref: 'JR-202608-0003', date: '2026-08-10', description: 'Beban gaji bulanan', lines: [{ code: '5201', debit: 2_500_000 }, { code: '1101', credit: 2_500_000 }] },
  { ref: 'JR-202608-0004', date: '2026-08-12', description: 'Beban sewa kantor', lines: [{ code: '5202', debit: 1_500_000 }, { code: '1101', credit: 1_500_000 }] },
  { ref: 'JR-202608-0005', date: '2026-08-15', description: 'Penjualan tunai pertengahan bulan', lines: [{ code: '1101', debit: 500_000 }, { code: '4101', credit: 500_000 }] },
  { ref: 'JR-202608-0006', date: '2026-08-18', description: 'Beban listrik & air', lines: [{ code: '5203', debit: 750_000 }, { code: '1101', credit: 750_000 }] },
  { ref: 'JR-202608-0007', date: '2026-08-20', description: 'Pembelian barang dagang secara kredit', lines: [{ code: '1201', debit: 150_000 }, { code: '2101', credit: 150_000 }] },
  { ref: 'JR-202608-0008', date: '2026-08-25', description: 'Pelunasan piutang dari pelanggan', lines: [{ code: '1101', debit: 2_000_000 }, { code: '1103', credit: 2_000_000 }] },
  { ref: 'JR-202608-0009', date: '2026-08-29', description: 'Penjualan tunai akhir bulan', lines: [{ code: '1101', debit: 100_000 }, { code: '4101', credit: 100_000 }] },
  { ref: 'JR-202608-0010', date: '2026-08-30', description: 'Beban alat tulis kantor', lines: [{ code: '5205', debit: 200_000 }, { code: '1101', credit: 200_000 }] },
];

async function seedCompany(id: string, name: string, email: string, ownerName: string): Promise<void> {
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
    update: { passwordHash, name: ownerName },
    create: { companyId: company.id, email, name: ownerName, passwordHash },
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

  for (const journal of SEED_JOURNALS) {
    const existing = await prisma.journal.findUnique({ where: { companyId_referenceNo: { companyId: company.id, referenceNo: journal.ref } } });
    if (existing) continue;
    const totalDebit = journal.lines.reduce((s, l) => s + (l.debit ?? 0), 0);
    const totalCredit = journal.lines.reduce((s, l) => s + (l.credit ?? 0), 0);
    await prisma.journal.create({
      data: {
        companyId: company.id,
        referenceNo: journal.ref,
        date: new Date(journal.date),
        description: journal.description,
        status: 'POSTED',
        totalDebit,
        totalCredit,
        createdById: user.id,
        lines: { create: journal.lines.map((l) => ({ coaId: codeToId.get(l.code)!, debit: l.debit ?? 0, credit: l.credit ?? 0 })) },
      },
    });
  }

  // Closing period is invoked at runtime via POST /journals/closing, not hardcoded here.
  // Seed only inserts the operational journals — closing journals are produced by the API.
}

async function main(): Promise<void> {
  await seedCompany('seed-company-1', 'PT Contoh Makmur', 'owner@contoh.co.id', 'Budi Owner');
  console.log('Seed completed: companies, users, roles, PSAK COA, 11 journals + closing entry');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
