import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { JournalDto } from '@akuntask/shared';

const fmt = (n: number): string => n.toLocaleString('id-ID');

export default function JournalList(): JSX.Element {
  const [journals, setJournals] = useState<JournalDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listJournals()
      .then(setJournals)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Daftar Jurnal</h1>
          <p className="text-sm text-slate-500">{journals.length} entri</p>
        </div>
        <Link to="/journals/new" className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded">+ Jurnal Baru</Link>
      </div>
      {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left text-xs font-semibold text-slate-600 py-2 px-3">No. Ref</th>
              <th className="text-left text-xs font-semibold text-slate-600 py-2 px-3">Tanggal</th>
              <th className="text-left text-xs font-semibold text-slate-600 py-2 px-3">Keterangan</th>
              <th className="text-right text-xs font-semibold text-slate-600 py-2 px-3">Total</th>
              <th className="text-left text-xs font-semibold text-slate-600 py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {journals.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">Belum ada jurnal</td>
              </tr>
            ) : (
              journals.map((j) => (
                <tr key={j.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-3 text-sm font-mono">{j.referenceNo}</td>
                  <td className="py-2 px-3 text-sm">{j.date}</td>
                  <td className="py-2 px-3 text-sm">{j.description}</td>
                  <td className="py-2 px-3 text-sm text-right">Rp {fmt(j.totalDebit)}</td>
                  <td className="py-2 px-3 text-sm">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{j.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm">
        <Link to="/" className="text-brand-600 hover:underline">← Kembali ke Dashboard</Link>
      </div>
    </div>
  );
}