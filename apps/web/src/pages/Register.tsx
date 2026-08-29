import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function Register(): JSX.Element {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setSession } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.register({
        company: { name: companyName },
        user: { email, password, name },
      });
      setSession(data);
      navigate('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Register failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-8 rounded-xl shadow border border-slate-200">
        <h1 className="text-2xl font-semibold mb-1">Daftar</h1>
        <p className="text-sm text-slate-500 mb-6">Buat perusahaan & akun Owner baru</p>
        {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
        <label className="block mb-3">
          <span className="text-sm font-medium">Nama Perusahaan</span>
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="mt-1 w-full border border-slate-300 rounded px-3 py-2" />
        </label>
        <label className="block mb-3">
          <span className="text-sm font-medium">Nama Anda</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full border border-slate-300 rounded px-3 py-2" />
        </label>
        <label className="block mb-3">
          <span className="text-sm font-medium">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full border border-slate-300 rounded px-3 py-2" />
        </label>
        <label className="block mb-5">
          <span className="text-sm font-medium">Password (min 8)</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="mt-1 w-full border border-slate-300 rounded px-3 py-2" />
        </label>
        <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded disabled:opacity-50">
          {loading ? 'Membuat…' : 'Daftar'}
        </button>
        <p className="mt-4 text-sm text-center text-slate-500">
          Sudah punya akun? <Link to="/login" className="text-brand-600 hover:underline">Masuk</Link>
        </p>
      </form>
    </div>
  );
}
