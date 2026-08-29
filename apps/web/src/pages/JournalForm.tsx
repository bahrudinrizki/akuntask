import { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { CoaDto, JournalLineInput, JournalDto } from '@akuntask/shared';

interface Row {
  coaId: string;
  debit: string;
  credit: string;
  description: string;
}

function emptyRow(): Row {
  return { coaId: '', debit: '', credit: '', description: '' };
}

const fmt = (n: number): string => n.toLocaleString('id-ID');

export default function JournalForm(): JSX.Element {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow()]);
  const [coa, setCoa] = useState<CoaDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState<JournalDto | null>(null);

  useEffect(() => {
    api.listCoa().then(setCoa).catch((e) => setError(e instanceof Error ? e.message : 'Failed'));
  }, []);

  function update(i: number, patch: Partial<Row>): void {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function addRow(): void {
    setRows((r) => [...r, emptyRow()]);
  }
  function removeRow(i: number): void {
    setRows((r) => (r.length <= 2 ? r : r.filter((_, idx) => idx !== i)));
  }

  const totalDebit = rows.reduce((s, r) => s + (Number(r.debit) || 0), 0);
  const totalCredit = rows.reduce((s, r) => s + (Number(r.credit) || 0), 0);
  const balanced = totalDebit > 0 && totalDebit === totalCredit;
  const diff = totalDebit - totalCredit;

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setSaved(null);
    setSubmitting(true);
    try {
      const lines: JournalLineInput[] = rows.map((r) => ({
        coaId: r.coaId,
        debit: r.debit ? Number(r.debit) : undefined,
        credit: r.credit ? Number(r.credit) : undefined,
        description: r.description || undefined,
      }));
      const result = await api.createJournal({ date, description, lines });
      setSaved(result);
      setDescription('');
      setRows([emptyRow(), emptyRow()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-1">Jurnal Umum</h1>
      <p className="text-sm text-slate-500 mb-4">Buat jurnal entri dengan validasi debit = kredit</p>
      {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
      {saved && (
        <div className="mb-4 p-3 rounded bg-green-50 text-green-700 text-sm">
          Jurnal <strong>{saved.referenceNo}</strong> tersimpan. Total: Rp {fmt(saved.totalDebit)}
        </div>
      )}
      <form onSubmit={onSubmit} className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <label className="block">
            <span className="text-sm font-medium">Tanggal</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Keterangan</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="mis. Penjualan tunai" className="mt-1 w-full border border-slate-300 rounded px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-600 py-2 px-3">Akun</th>
                <th className="text-left text-xs font-semibold text-slate-600 py-2 px-3">Keterangan</th>
                <th className="text-right text-xs font-semibold text-slate-600 py-2 px-3 w-40">Debit</th>
                <th className="text-right text-xs font-semibold text-slate-600 py-2 px-3 w-40">Kredit</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="py-2 px-2">
                    <select value={row.coaId} onChange={(e) => update(i, { coaId: e.target.value })} required className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm">
                      <option value="">— pilih akun —</option>
                      {coa.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-2">
                    <input value={row.description} onChange={(e) => update(i, { description: e.target.value })} placeholder="Opsional" className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm" />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={row.debit}
                      onChange={(e) => update(i, { debit: e.target.value, credit: '' })}
                      className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm text-right"
                      min="0"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={row.credit}
                      onChange={(e) => update(i, { credit: e.target.value, debit: '' })}
                      className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm text-right"
                      min="0"
                    />
                  </td>
                  <td className="py-2 px-2 text-center">
                    {rows.length > 2 && (
                      <button type="button" onClick={() => removeRow(i)} className="text-red-500 hover:text-red-700 text-sm">×</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-semibold text-sm">
                <td colSpan={2} className="py-2 px-3 text-right">Total</td>
                <td className="py-2 px-3 text-right">Rp {fmt(totalDebit)}</td>
                <td className="py-2 px-3 text-right">Rp {fmt(totalCredit)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm">
            {balanced ? (
              <span className="text-green-600">✓ Balanced</span>
            ) : (
              <span className="text-red-600">Selisih: Rp {fmt(Math.abs(diff))}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={addRow} className="border border-slate-300 text-slate-700 text-sm font-medium px-3 py-2 rounded">+ Baris</button>
            <button type="submit" disabled={submitting || !balanced} className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded disabled:opacity-50">
              {submitting ? 'Menyimpan…' : 'Simpan Jurnal'}
            </button>
          </div>
        </div>
      </form>
      <div className="mt-4 text-sm">
        <Link to="/journals" className="text-brand-600 hover:underline">Lihat daftar jurnal →</Link>
      </div>
    </div>
  );
}