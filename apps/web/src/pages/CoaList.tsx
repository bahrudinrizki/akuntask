import { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { CoaDto, CoaType } from '@akuntask/shared';

const TYPE_LABEL: Record<CoaType, string> = {
  ASSET: 'Aset',
  LIABILITY: 'Liabilitas',
  EQUITY: 'Ekuitas',
  REVENUE: 'Pendapatan',
  EXPENSE: 'Beban',
};

const TYPE_BADGE: Record<CoaType, string> = {
  ASSET: 'bg-blue-100 text-blue-700',
  LIABILITY: 'bg-red-100 text-red-700',
  EQUITY: 'bg-purple-100 text-purple-700',
  REVENUE: 'bg-green-100 text-green-700',
  EXPENSE: 'bg-orange-100 text-orange-700',
};

export default function CoaList(): JSX.Element {
  const [coa, setCoa] = useState<CoaDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function load(): void {
    api
      .listCoa()
      .then(setCoa)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'));
  }

  useEffect(load, []);

  function renderTree(parentId: string | null, level: number): JSX.Element[] {
    return coa
      .filter((c) => c.parentId === parentId)
      .flatMap((c) => [
        <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
          <td className="py-2 px-3 text-sm font-mono">{c.code}</td>
          <td className="py-2 px-3 text-sm" style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}>
            {c.name}
          </td>
          <td className="py-2 px-3 text-sm">
            <span className={`text-xs px-2 py-0.5 rounded ${TYPE_BADGE[c.type]}`}>{TYPE_LABEL[c.type]}</span>
          </td>
          <td className="py-2 px-3 text-sm text-slate-500">L{c.level}</td>
          <td className="py-2 px-3 text-sm">
            {c.isActive ? <span className="text-green-600">Aktif</span> : <span className="text-slate-400">Non-aktif</span>}
          </td>
          <td className="py-2 px-3 text-sm text-right">
            <Link to={`/ledger?coaId=${c.id}`} className="text-brand-600 hover:underline text-xs">Buku Besar</Link>
          </td>
        </tr>,
        ...renderTree(c.id, level + 1),
      ]);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Chart of Accounts</h1>
          <p className="text-sm text-slate-500">Template PSAK — {coa.length} akun</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded">
          {showForm ? 'Tutup' : '+ Akun Baru'}
        </button>
      </div>
      {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
      {showForm && <NewCoaForm onCreated={() => { setShowForm(false); load(); }} />}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left text-xs font-semibold text-slate-600 py-2 px-3">Kode</th>
              <th className="text-left text-xs font-semibold text-slate-600 py-2 px-3">Nama Akun</th>
              <th className="text-left text-xs font-semibold text-slate-600 py-2 px-3">Tipe</th>
              <th className="text-left text-xs font-semibold text-slate-600 py-2 px-3">Level</th>
              <th className="text-left text-xs font-semibold text-slate-600 py-2 px-3">Status</th>
              <th className="text-right text-xs font-semibold text-slate-600 py-2 px-3">Aksi</th>
            </tr>
          </thead>
          <tbody>{renderTree(null, 0)}</tbody>
        </table>
      </div>
      <div className="mt-4 text-sm">
        <Link to="/" className="text-brand-600 hover:underline">← Kembali ke Dashboard</Link>
      </div>
    </div>
  );
}

function NewCoaForm({ onCreated }: { onCreated: () => void }): JSX.Element {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<CoaType>('ASSET');
  const [parentId, setParentId] = useState('');
  const [coa, setCoa] = useState<CoaDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.listCoa().then(setCoa).catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.createCoa({ code, name, type, parentId: parentId || undefined });
      setCode('');
      setName('');
      setParentId('');
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      {error && <div className="mb-3 p-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Kode (mis. 1105)" required className="border border-slate-300 rounded px-3 py-2 text-sm" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama akun" required className="border border-slate-300 rounded px-3 py-2 text-sm" />
        <select value={type} onChange={(e) => setType(e.target.value as CoaType)} className="border border-slate-300 rounded px-3 py-2 text-sm">
          {(Object.keys(TYPE_LABEL) as CoaType[]).map((t) => (
            <option key={t} value={t}>{TYPE_LABEL[t]}</option>
          ))}
        </select>
        <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-sm">
          <option value="">— Tanpa Parent —</option>
          {coa.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3">
        <button type="submit" disabled={submitting} className="bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded disabled:opacity-50">
          {submitting ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}