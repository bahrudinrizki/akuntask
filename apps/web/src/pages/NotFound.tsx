import { Link } from 'react-router-dom';

export default function NotFound(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">404</h1>
        <p className="text-slate-600 mb-6">Halaman tidak ditemukan</p>
        <Link to="/" className="text-brand-600 hover:underline">← Kembali ke Dashboard</Link>
      </div>
    </div>
  );
}