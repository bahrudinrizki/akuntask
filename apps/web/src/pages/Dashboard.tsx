import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import type { CompanyDto } from '@akuntask/shared';

export default function Dashboard(): JSX.Element {
  const { user, logout } = useAuth();
  const [company, setCompany] = useState<CompanyDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState({ coa: 0, journals: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    api
      .myCompany()
      .then(setCompany)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'));
    Promise.all([api.listCoa().catch(() => []), api.listJournals().catch(() => [])]).then(([coa, journals]) => {
      setCounts({ coa: coa.length, journals: journals.length });
    });
  }, []);

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Akuntask</h1>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/coa" className="text-slate-600 hover:text-brand-600">COA</Link>
          <Link to="/journals" className="text-slate-600 hover:text-brand-600">Jurnal</Link>
          <Link to="/ledger" className="text-slate-600 hover:text-brand-600">Buku Besar</Link>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600">{user?.email}</span>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-brand-600 hover:underline">Keluar</button>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-1">Selamat datang, {user?.name}</h2>
          <p className="text-slate-500">Perusahaan: {company?.name ?? '—'}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Chart of Accounts" value={String(counts.coa)} hint="akun terdaftar" link="/coa" />
          <Card title="Jurnal Entri" value={String(counts.journals)} hint="transaksi tercatat" link="/journals" />
          <Card title="Pendapatan" value="Rp 0" hint="Belum ada laporan" />
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/coa" className="block p-6 bg-white rounded-xl border border-slate-200 hover:border-brand-500">
            <h3 className="font-semibold mb-1">Chart of Accounts</h3>
            <p className="text-sm text-slate-500">Kelola daftar akun (COA) sesuai standar PSAK</p>
          </Link>
          <Link to="/journals" className="block p-6 bg-white rounded-xl border border-slate-200 hover:border-brand-500">
            <h3 className="font-semibold mb-1">Jurnal Umum</h3>
            <p className="text-sm text-slate-500">Input jurnal dengan validasi debit = kredit otomatis</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

function Card({ title, value, hint, link }: { title: string; value: string; hint: string; link?: string }): JSX.Element {
  const content = (
    <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-brand-500">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{hint}</div>
    </div>
  );
  return link ? <Link to={link}>{content}</Link> : content;
}