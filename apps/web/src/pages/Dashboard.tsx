import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import type { CompanyDto, ProfitLossResponse } from '@akuntask/shared';

const firstOfMonth = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};
const today = (): string => new Date().toISOString().slice(0, 10);
const fmt = (n: number): string => n.toLocaleString('id-ID');

export default function Dashboard(): JSX.Element {
  const { user, logout } = useAuth();
  const [company, setCompany] = useState<CompanyDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState({ coa: 0, journals: 0 });
  const [pl, setPl] = useState<ProfitLossResponse | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.myCompany().then(setCompany).catch((err) => setError(err instanceof Error ? err.message : 'Failed'));
    Promise.all([api.listCoa().catch(() => []), api.listJournals().catch(() => [])]).then(([coa, journals]) => {
      setCounts({ coa: coa.length, journals: journals.length });
    });
    api.getProfitLoss(firstOfMonth(), today(), 'off').then(setPl).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Akuntask</h1>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/coa" className="text-slate-600 hover:text-brand-600">COA</Link>
          <Link to="/journals" className="text-slate-600 hover:text-brand-600">Jurnal</Link>
          <Link to="/ledger" className="text-slate-600 hover:text-brand-600">Buku Besar</Link>
          <Link to="/reports" className="text-slate-600 hover:text-brand-600">Laporan</Link>
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
          <Card title="Pendapatan (bulan ini)" value={pl ? `Rp ${fmt(pl.totalRevenue)}` : '—'} hint={pl ? `${pl.revenue.reduce((s, x) => s + x.lines.length, 0)} akun` : 'Loading'} link="/reports" />
          <Card title="Beban (bulan ini)" value={pl ? `Rp ${fmt(pl.totalExpense)}` : '—'} hint={pl ? `${pl.expense.reduce((s, x) => s + x.lines.length, 0)} akun` : 'Loading'} link="/reports" />
          <Card title="Laba Bersih" value={pl ? `Rp ${fmt(pl.netProfit)}` : '—'} hint={pl ? (pl.netProfit >= 0 ? 'Profit' : 'Rugi') : 'Loading'} link="/reports" highlight={pl?.netProfit} />
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/coa" className="block p-5 bg-white rounded-xl border border-slate-200 hover:border-brand-500">
            <h3 className="font-semibold text-sm mb-1">COA</h3>
            <p className="text-xs text-slate-500">{counts.coa} akun</p>
          </Link>
          <Link to="/journals" className="block p-5 bg-white rounded-xl border border-slate-200 hover:border-brand-500">
            <h3 className="font-semibold text-sm mb-1">Jurnal</h3>
            <p className="text-xs text-slate-500">{counts.journals} entri</p>
          </Link>
          <Link to="/ledger" className="block p-5 bg-white rounded-xl border border-slate-200 hover:border-brand-500">
            <h3 className="font-semibold text-sm mb-1">Buku Besar</h3>
            <p className="text-xs text-slate-500">Per akun</p>
          </Link>
          <Link to="/reports" className="block p-5 bg-white rounded-xl border border-slate-200 hover:border-brand-500">
            <h3 className="font-semibold text-sm mb-1">Laporan</h3>
            <p className="text-xs text-slate-500">Laba Rugi • Neraca • NS</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

function Card({ title, value, hint, link, highlight }: { title: string; value: string; hint: string; link?: string; highlight?: number }): JSX.Element {
  const color = highlight !== undefined ? (highlight >= 0 ? 'text-green-700' : 'text-red-700') : '';
  const content = (
    <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-brand-500">
      <div className="text-sm text-slate-500">{title}</div>
      <div className={`text-2xl font-semibold mt-1 font-mono ${color}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-1">{hint}</div>
    </div>
  );
  return link ? <Link to={link}>{content}</Link> : content;
}