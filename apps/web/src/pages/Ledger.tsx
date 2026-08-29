import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { CoaDto, CoaType, LedgerResponse } from '@akuntask/shared';

const TYPE_LABEL: Record<CoaType, string> = {
  ASSET: 'Aset',
  LIABILITY: 'Liabilitas',
  EQUITY: 'Ekuitas',
  REVENUE: 'Pendapatan',
  EXPENSE: 'Beban',
};

const fmt = (n: number): string => n.toLocaleString('id-ID');

const firstOfMonth = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

const today = (): string => new Date().toISOString().slice(0, 10);

export default function Ledger(): JSX.Element {
  const [params] = useSearchParams();
  const initialCoa = params.get('coaId') ?? '';
  const [coa, setCoa] = useState<CoaDto[]>([]);
  const [coaId, setCoaId] = useState(initialCoa);
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [data, setData] = useState<LedgerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listCoa().then(setCoa).catch((e) => setError(e instanceof Error ? e.message : 'Failed'));
  }, []);

  useEffect(() => {
    if (!coaId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    api
      .getLedger(coaId, from, to)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [coaId, from, to]);

  const grouped = useMemo(() => {
    const groups = new Map<CoaType, CoaDto[]>();
    for (const c of coa) {
      const arr = groups.get(c.type) ?? [];
      arr.push(c);
      groups.set(c.type, arr);
    }
    return groups;
  }, [coa]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Buku Besar</h1>
        <p className="text-sm text-slate-500">General Ledger per akun dengan saldo berjalan</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Akun</span>
            <select value={coaId} onChange={(e) => setCoaId(e.target.value)} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm">
              <option value="">— pilih akun —</option>
              {(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] as CoaType[]).map((t) => {
                const items = grouped.get(t) ?? [];
                if (items.length === 0) return null;
                return (
                  <optgroup key={t} label={TYPE_LABEL[t]}>
                    {items.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} {c.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Dari</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Sampai</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm" />
          </label>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
      {loading && <div className="text-sm text-slate-500">Memuat…</div>}

      {data && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <SummaryCard label="Saldo Awal" value={data.opening} />
            <SummaryCard label="Mutasi Debit" value={data.totalDebit} variant="debit" />
            <SummaryCard label="Mutasi Kredit" value={data.totalCredit} variant="credit" />
            <SummaryCard label="Saldo Akhir" value={data.closing} variant="closing" />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-sm">
              <span className="font-mono font-semibold">{data.coa.code}</span> {data.coa.name}
              <span className="ml-2 text-xs text-slate-500">({TYPE_LABEL[data.coa.type]})</span>
            </div>
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-600 py-2 px-3">Tanggal</th>
                  <th className="text-left text-xs font-semibold text-slate-600 py-2 px-3">No. Ref</th>
                  <th className="text-left text-xs font-semibold text-slate-600 py-2 px-3">Keterangan</th>
                  <th className="text-right text-xs font-semibold text-slate-600 py-2 px-3">Debit</th>
                  <th className="text-right text-xs font-semibold text-slate-600 py-2 px-3">Kredit</th>
                  <th className="text-right text-xs font-semibold text-slate-600 py-2 px-3">Saldo</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm">
                  <td colSpan={5} className="py-2 px-3 font-medium">Saldo Awal</td>
                  <td className="py-2 px-3 text-right font-mono">Rp {fmt(data.opening)}</td>
                </tr>
                {data.entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 text-sm">Tidak ada transaksi dalam periode ini</td>
                  </tr>
                ) : (
                  data.entries.map((e) => (
                    <tr key={e.journalId + e.referenceNo} className="border-b border-slate-100">
                      <td className="py-2 px-3 text-sm">{e.date}</td>
                      <td className="py-2 px-3 text-sm font-mono">{e.referenceNo}</td>
                      <td className="py-2 px-3 text-sm">{e.description}</td>
                      <td className="py-2 px-3 text-sm text-right font-mono">{e.debit > 0 ? `Rp ${fmt(e.debit)}` : '—'}</td>
                      <td className="py-2 px-3 text-sm text-right font-mono">{e.credit > 0 ? `Rp ${fmt(e.credit)}` : '—'}</td>
                      <td className="py-2 px-3 text-sm text-right font-mono">Rp {fmt(e.balance)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200 font-semibold text-sm">
                  <td colSpan={5} className="py-2 px-3 text-right">Saldo Akhir</td>
                  <td className="py-2 px-3 text-right font-mono">Rp {fmt(data.closing)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      <div className="mt-4 text-sm">
        <Link to="/" className="text-brand-600 hover:underline">← Kembali ke Dashboard</Link>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: number;
  variant?: 'default' | 'debit' | 'credit' | 'closing';
}): JSX.Element {
  const color = {
    default: 'text-slate-700',
    debit: 'text-green-700',
    credit: 'text-red-700',
    closing: 'text-brand-700',
  }[variant];
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-xl font-semibold mt-1 font-mono ${color}`}>Rp {fmt(value)}</div>
    </div>
  );
}