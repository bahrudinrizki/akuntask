export interface DefaultCoa {
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parent?: string;
  level: number;
}

export const DEFAULT_PSAK_COA: DefaultCoa[] = [
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
];
