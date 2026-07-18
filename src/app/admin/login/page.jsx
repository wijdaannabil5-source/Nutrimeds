'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Username atau password salah.');
        setLoading(false);
        return;
      }

      router.push('/admin');
    } catch (err) {
      setError('Gagal menghubungkan ke server. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center px-[5%] py-12 bg-slate-50 overflow-hidden">
      {/* Background Blobs */}
      <div className="bg-blob-1" />
      <div className="bg-blob-2" />

      <div className="glass-card w-full max-w-md p-10 relative z-10 shadow-2xl hover:shadow-primary/10 transition-all duration-300">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Login Admin CMS</h1>
          <p className="text-sm text-slate-500 mt-1.5">Akses panel kontrol dan audit log sistem</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center font-medium animate-pulse">
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="admin-username" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Username Admin
            </label>
            <input
              id="admin-username"
              name="username"
              type="text"
              required
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 bg-white/50 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-slate-900 placeholder-slate-400"
              placeholder="Masukkan username"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 bg-white/50 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-slate-900 placeholder-slate-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-95 duration-150"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memproses...
              </span>
            ) : (
              'Masuk sebagai Admin'
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <Link href="/" className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1">
            <span>←</span> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
