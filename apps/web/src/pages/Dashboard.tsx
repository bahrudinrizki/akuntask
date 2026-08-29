import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { CompanyDto } from '@akuntask/shared';

export default function Dashboard(): JSX.Element {
  const { user, logout } = useAuth();
  const [company, setCompany] = useState<CompanyDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .myCompany()
      .then(setCompany)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'));
  }, []);

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Akuntask</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-600">{user?.email}</span>
          <button onClick={logout} className="text-brand-600 hover:underline">Keluar</button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-1">Selamat datang, {user?.name}</h2>
          <p className="text-slate-500">Perusahaan: {company?.name ?? '—'}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Pendapatan" value="Rp 0" hint="Belum ada transaksi" />
          <Card title="Pengeluaran" value="Rp 0" hint="Belum ada transaksi" />
          <Card title="Laba Bersih" value="Rp 0" hint="Belum ada transaksi" />
        </div>
        <div className="mt-8 p-6 bg-white rounded-xl border border-slate-200">
          <h3 className="font-semibold mb-2">Modul Tersedia</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Akuntansi (COA, Jurnal, Buku Besar) — Phase 1</li>
            <li>• Penjualan (Quotation → Invoice) — Phase 2</li>
            <li>• Pembelian (PO → GRN) — Phase 2</li>
            <li>• Inventory & POS — Phase 3</li>
            <li>• 200+ Laporan — Phase 4</li>
            <li>• AI Assistant — Phase 5</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

function Card({ title, value, hint }: { title: string; value: string; hint: string }): JSX.Element {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{hint}</div>
    </div>
  );
}
