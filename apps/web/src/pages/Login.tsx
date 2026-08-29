import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, ApiUnavailableError } from '../lib/api';
import { useAuth } from '../lib/auth';

const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@akuntask.local',
  name: 'Demo User',
  companyId: 'demo-company',
  roles: ['OWNER'],
};
const DEMO_TOKEN = 'demo-token-not-valid-jwt-but-frontend-only';

export default function Login(): JSX.Element {
  const [email, setEmail] = useState('owner@contoh.co.id');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [backendDown, setBackendDown] = useState(false);
  const { setSession } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setBackendDown(false);
    try {
      const data = await api.login({ email, password });
      setSession(data);
      const company = await api.onboarding();
      navigate(company.onboardingCompleted ? '/' : '/onboarding');
    } catch (err) {
      if (err instanceof ApiUnavailableError) {
        setBackendDown(true);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  }

  function startDemo(): void {
    setSession({ accessToken: DEMO_TOKEN, refreshToken: DEMO_TOKEN, user: DEMO_USER });
    navigate('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-8 rounded-xl shadow border border-slate-200">
        <h1 className="text-2xl font-semibold mb-1">Akuntask</h1>
        <p className="text-sm text-slate-500 mb-6">Masuk ke akun Anda</p>
        {error && (
          <div className={`mb-4 p-3 rounded text-sm ${backendDown ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-700'}`}>
            {error}
          </div>
        )}
        <label className="block mb-3">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>
        <label className="block mb-5">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="mt-1 w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Memproses…' : 'Masuk'}
        </button>
        <div className="mt-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={startDemo}
            className="w-full border border-slate-300 text-slate-700 font-medium py-2 rounded hover:bg-slate-50"
          >
            Coba Demo (offline)
          </button>
          <p className="mt-2 text-xs text-slate-500 text-center">
            Demo menampilkan UI tanpa data — beberapa menu akan kosong
          </p>
        </div>
        <p className="mt-4 text-sm text-center text-slate-500">
          Belum punya akun? <Link to="/register" className="text-brand-600 hover:underline">Daftar</Link>
        </p>
        <p className="mt-2 text-xs text-center text-slate-400">
          Repo:{' '}
          <a href="https://github.com/bahrudinrizki/akuntask" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
            bahrudinrizki/akuntask
          </a>
        </p>
      </form>
    </div>
  );
}