import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { BalanceSheetResponse, CoaType, ProfitLossResponse, ReportSection, TrialBalanceResponse } from '@akuntask/shared';

const fmt = (n: number): string => n.toLocaleString('id-ID');

const firstOfMonth = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};
const today = (): string => new Date().toISOString().slice(0, 10);

type Tab = 'pl' | 'bs' | 'tb';

export default function Reports(): JSX.Element {
  const [tab, setTab] = useState<Tab>('pl');
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [asOf, setAsOf] = useState(today());
  const [comparison, setComparison] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Laporan Keuangan</h1>
        <p className="text-sm text-slate-500">PSAK-compliant — Laba Rugi, Neraca, Neraca Saldo</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3 mb-4 flex flex-wrap items-end gap-3">
        {tab !== 'tb' && tab !== 'bs' && (
          <>
            <label className="block">
              <span className="text-xs text-slate-500">Dari</span>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="block border border-slate-300 rounded px-2 py-1 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Sampai</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="block border border-slate-300 rounded px-2 py-1 text-sm" />
            </label>
          </>
        )}
        {tab === 'bs' && (
          <label className="block">
            <span className="text-xs text-slate-500">Per Tanggal</span>
            <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className="block border border-slate-300 rounded px-2 py-1 text-sm" />
          </label>
        )}
        {tab === 'tb' && (
          <label className="block">
            <span className="text-xs text-slate-500">Per Tanggal</span>
            <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className="block border border-slate-300 rounded px-2 py-1 text-sm" />
          </label>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={comparison} onChange={(e) => setComparison(e.target.checked)} className="rounded" />
          <span>Periode sebelumnya</span>
        </label>
      </div>

      <div className="flex gap-2 mb-4 border-b border-slate-200">
        <TabButton active={tab === 'pl'} onClick={() => setTab('pl')}>Laba Rugi</TabButton>
        <TabButton active={tab === 'bs'} onClick={() => setTab('bs')}>Neraca</TabButton>
        <TabButton active={tab === 'tb'} onClick={() => setTab('tb')}>Neraca Saldo</TabButton>
      </div>

      {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}

      {tab === 'pl' && <ProfitLossView from={from} to={to} comparison={comparison} onError={setError} />}
      {tab === 'bs' && <ClosePeriodButton from={`${asOf.slice(0, 8)}01`} to={asOf} onError={setError} />}

      {tab === 'bs' && <BalanceSheetView asOf={asOf} comparison={comparison} onError={setError} />}
      {tab === 'tb' && <TrialBalanceView asOf={asOf} comparison={comparison} onError={setError} />}

      <div className="mt-4 text-sm">
        <Link to="/" className="text-brand-600 hover:underline">← Kembali ke Dashboard</Link>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }): JSX.Element {
  return (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${active ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
      {children}
    </button>
  );
}

function ClosePeriodButton({ from, to, onError }: { from: string; to: string; onError: (s: string | null) => void }): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function close(): Promise<void> {
    if (!window.confirm(`Tutup periode ${from} s/d ${to}?\n\nSistem akan membuat 2 jurnal penutup dan saldo Revenue/Beban periode ini menjadi nol. Aksi ini tidak bisa dibatalkan dari UI.`)) return;
    setLoading(true);
    setMessage(null);
    onError(null);
    try {
      const result = await api.closePeriod(from, to);
      setMessage(`Periode ditutup. Laba bersih Rp ${fmt(result.netProfit)}. 2 jurnal penutup dibuat.`);
      window.location.reload();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Closing gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-4 flex items-center justify-between gap-3 p-3 rounded-lg border border-yellow-200 bg-yellow-50">
      <div className="text-sm text-yellow-800">
        <div className="font-medium">Tutup periode akuntansi</div>
        <div className="text-xs">Buat jurnal penutup untuk {from} s/d {to}. Setelah closing, Neraca akan balance.</div>
        {message && <div className="mt-1 text-green-700">{message}</div>}
      </div>
      <button type="button" onClick={close} disabled={loading} className="shrink-0 bg-yellow-700 hover:bg-yellow-800 text-white text-sm font-medium px-3 py-2 rounded disabled:opacity-50">
        {loading ? 'Menutup…' : 'Tutup Periode'}
      </button>
    </div>
  );
}

function ProfitLossView({ from, to, comparison, onError }: { from: string; to: string; comparison: boolean; onError: (s: string | null) => void }): JSX.Element {
  const [data, setData] = useState<ProfitLossResponse | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true); setData(null);
    api.getProfitLoss(from, to, comparison ? 'prev' : 'off').then(setData).catch((e) => onError(e instanceof Error ? e.message : 'Failed')).finally(() => setLoading(false));
  }, [from, to, comparison]);
  if (loading) return <div className="text-sm text-slate-500">Memuat…</div>;
  if (!data) return <></>;
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold mb-1">Laba Rugi</h2>
        <p className="text-xs text-slate-500 mb-4">Periode: {from} s/d {to}{data.comparison === 'prev' && ' (dengan periode sebelumnya)'}</p>
        <SectionGroup title="Pendapatan" sections={data.revenue} comparison={data.comparison === 'prev'} total={data.totalRevenue} prevTotal={data.previousTotalRevenue} color="green" />
        <SectionGroup title="Beban" sections={data.expense} comparison={data.comparison === 'prev'} total={data.totalExpense} prevTotal={data.previousTotalExpense} color="red" />
        <div className="border-t-2 border-slate-300 pt-3 mt-3">
          <div className="flex justify-between font-semibold text-base">
            <span>Laba (Rugi) Bersih</span>
            <span className={data.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}>
              Rp {fmt(data.netProfit)}
              {data.previousNetProfit !== undefined && <span className="text-xs text-slate-500 ml-2">(sebelumnya: Rp {fmt(data.previousNetProfit)})</span>}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionGroup({ title, sections, comparison, total, prevTotal, color }: { title: string; sections: ReportSection[]; comparison: boolean; total: number; prevTotal?: number; color: 'green' | 'red' }): JSX.Element {
  const colorClass = color === 'green' ? 'text-green-700' : 'text-red-700';
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>
      {sections.length === 0 || sections.every((s) => s.lines.length === 0) ? (
        <p className="text-xs text-slate-400 italic">Tidak ada transaksi</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {sections.map((s) => (
              <SectionRows key={s.parentId ?? s.category} section={s} comparison={comparison} colorClass={colorClass} />
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 font-semibold">
              <td className="py-2">Total {title}</td>
              <td className="py-2 text-right">Rp {fmt(total)}</td>
              {comparison && <td className="py-2 text-right text-slate-500 text-xs">Rp {fmt(prevTotal ?? 0)}</td>}
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}

function SectionRows({ section, comparison, colorClass }: { section: ReportSection; comparison: boolean; colorClass: string }): JSX.Element {
  return (
    <>
      {section.lines.length > 0 && (
        <tr className="bg-slate-50 font-medium">
          <td colSpan={comparison ? 3 : 2} className="py-1.5 text-xs text-slate-700">{section.category}</td>
        </tr>
      )}
      {section.lines.map((l) => (
        <tr key={l.accountId} className="border-b border-slate-100">
          <td className="py-1.5 pl-4 font-mono text-xs text-slate-500 w-20">{l.code}</td>
          <td className="py-1.5 text-sm">{l.name}</td>
          <td className="py-1.5 text-right text-sm font-mono">{l.amount > 0 ? `Rp ${fmt(l.amount)}` : '—'}</td>
          {comparison && <td className="py-1.5 text-right text-xs text-slate-500 font-mono">{(l.previousAmount ?? 0) > 0 ? `Rp ${fmt(l.previousAmount ?? 0)}` : '—'}</td>}
        </tr>
      ))}
      {section.lines.length > 0 && (
        <tr className="font-medium">
          <td colSpan={comparison ? 2 : 1} className={`py-1.5 text-right text-sm ${colorClass}`}>Subtotal {section.category}</td>
          <td className={`py-1.5 text-right text-sm font-mono ${colorClass}`}>Rp {fmt(section.total)}</td>
          {comparison && <td className={`py-1.5 text-right text-xs font-mono ${colorClass}`}>Rp {fmt(section.previousTotal ?? 0)}</td>}
        </tr>
      )}
    </>
  );
}

function BalanceSheetView({ asOf, comparison, onError }: { asOf: string; comparison: boolean; onError: (s: string | null) => void }): JSX.Element {
  const [data, setData] = useState<BalanceSheetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true); setData(null);
    api.getBalanceSheet(asOf, comparison ? 'prev' : 'off').then(setData).catch((e) => onError(e instanceof Error ? e.message : 'Failed')).finally(() => setLoading(false));
  }, [asOf, comparison]);
  if (loading) return <div className="text-sm text-slate-500">Memuat…</div>;
  if (!data) return <></>;
  return (
    <div className="space-y-4">
      {!data.balanced && (
        <div className="p-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
          ⚠️ Neraca belum balance. Selisih: Rp {fmt(Math.abs(data.assetsTotal - data.totalLiabilitiesEquity))}.
          Biasanya karena jurnal penutup periode belum diposting.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BalanceSection title="ASET" sections={data.assets} comparison={data.comparison === 'prev'} total={data.assetsTotal} prevTotal={data.previousAssetsTotal} />
        <div>
          <BalanceSection title="LIABILITAS" sections={data.liabilities} comparison={data.comparison === 'prev'} total={data.liabilitiesTotal} prevTotal={data.previousLiabilitiesTotal} />
          <BalanceSection title="EKUITAS" sections={data.equity} comparison={data.comparison === 'prev'} total={data.equityTotal} prevTotal={data.previousEquityTotal} />
        </div>
      </div>
      <div className="bg-white rounded-xl border-2 border-slate-300 p-4 flex justify-between items-center font-semibold">
        <span>Total Liabilitas + Ekuitas</span>
        <span>Rp {fmt(data.totalLiabilitiesEquity)}</span>
      </div>
    </div>
  );
}

function BalanceSection({ title, sections, comparison, total, prevTotal }: { title: string; sections: ReportSection[]; comparison: boolean; total: number; prevTotal?: number }): JSX.Element {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      {sections.every((s) => s.lines.length === 0) ? (
        <p className="text-xs text-slate-400 italic">Tidak ada</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {sections.map((s) => (
              <SectionRows key={s.parentId ?? s.category} section={s} comparison={comparison} colorClass="text-slate-700" />
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 font-semibold">
              <td className="py-2">Total {title}</td>
              <td className="py-2 text-right">Rp {fmt(total)}</td>
              {comparison && <td className="py-2 text-right text-slate-500 text-xs">Rp {fmt(prevTotal ?? 0)}</td>}
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}

function TrialBalanceView({ asOf, comparison, onError }: { asOf: string; comparison: boolean; onError: (s: string | null) => void }): JSX.Element {
  const [data, setData] = useState<TrialBalanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true); setData(null);
    api.getTrialBalance(asOf, comparison ? 'prev' : 'off').then(setData).catch((e) => onError(e instanceof Error ? e.message : 'Failed')).finally(() => setLoading(false));
  }, [asOf, comparison]);
  if (loading) return <div className="text-sm text-slate-500">Memuat…</div>;
  if (!data) return <></>;
  const TYPE_BADGE: Record<CoaType, string> = { ASSET: 'bg-blue-100 text-blue-700', LIABILITY: 'bg-red-100 text-red-700', EQUITY: 'bg-purple-100 text-purple-700', REVENUE: 'bg-green-100 text-green-700', EXPENSE: 'bg-orange-100 text-orange-700' };
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200">
        <h2 className="text-lg font-semibold">Neraca Saldo</h2>
        <p className="text-xs text-slate-500">Per {asOf} {data.adjusted && '(adjusted — semua jurnal posted)'}</p>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left text-xs font-semibold text-slate-600 py-2 px-3">Kode</th>
            <th className="text-left text-xs font-semibold text-slate-600 py-2 px-3">Nama Akun</th>
            <th className="text-left text-xs font-semibold text-slate-600 py-2 px-3">Tipe</th>
            <th className="text-right text-xs font-semibold text-slate-600 py-2 px-3">Debit</th>
            <th className="text-right text-xs font-semibold text-slate-600 py-2 px-3">Kredit</th>
            {comparison && (<>
              <th className="text-right text-xs font-semibold text-slate-600 py-2 px-3">Debit (prev)</th>
              <th className="text-right text-xs font-semibold text-slate-600 py-2 px-3">Kredit (prev)</th>
            </>)}
          </tr>
        </thead>
        <tbody>
          {data.lines.length === 0 ? (
            <tr><td colSpan={comparison ? 6 : 4} className="py-8 text-center text-slate-400">Tidak ada akun dengan saldo</td></tr>
          ) : data.lines.map((l) => (
            <tr key={l.accountId} className="border-b border-slate-100">
              <td className="py-2 px-3 font-mono text-xs">{l.code}</td>
              <td className="py-2 px-3">{l.name}</td>
              <td className="py-2 px-3"><span className={`text-xs px-2 py-0.5 rounded ${TYPE_BADGE[l.type]}`}>{l.type}</span></td>
              <td className="py-2 px-3 text-right font-mono">{l.debit > 0 ? `Rp ${fmt(l.debit)}` : '—'}</td>
              <td className="py-2 px-3 text-right font-mono">{l.credit > 0 ? `Rp ${fmt(l.credit)}` : '—'}</td>
              {comparison && (<>
                <td className="py-2 px-3 text-right font-mono text-xs text-slate-500">{(l.previousDebit ?? 0) > 0 ? `Rp ${fmt(l.previousDebit ?? 0)}` : '—'}</td>
                <td className="py-2 px-3 text-right font-mono text-xs text-slate-500">{(l.previousCredit ?? 0) > 0 ? `Rp ${fmt(l.previousCredit ?? 0)}` : '—'}</td>
              </>)}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50 border-t-2 border-slate-300 font-semibold">
            <td colSpan={3} className="py-2 px-3 text-right">Total</td>
            <td className="py-2 px-3 text-right">Rp {fmt(data.totalDebit)}</td>
            <td className="py-2 px-3 text-right">Rp {fmt(data.totalCredit)}</td>
            {comparison && (<>
              <td className="py-2 px-3 text-right text-xs">Rp {fmt(data.previousTotalDebit ?? 0)}</td>
              <td className="py-2 px-3 text-right text-xs">Rp {fmt(data.previousTotalCredit ?? 0)}</td>
            </>)}
          </tr>
          <tr className={data.balanced ? 'bg-green-50' : 'bg-red-50'}>
            <td colSpan={comparison ? 6 : 4} className="py-2 px-3 text-center text-sm font-medium">
              {data.balanced ? '✓ Neraca saldo balance (Debit = Kredit)' : '✗ Tidak balance'}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}