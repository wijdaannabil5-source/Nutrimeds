'use client';

import { useSession, signOut } from '@/lib/auth/auth-client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function NavBar() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isActive = (href) => pathname === href;

  const navLinkClass = (href) =>
    `font-medium transition-colors ${isActive(href) ? 'text-primary' : 'hover:text-primary'}`;

  return (
    <nav className="fixed top-0 w-full px-[5%] py-4 flex justify-between items-center bg-white/70 backdrop-blur-md border-b border-border z-50">
      {/* Logo */}
      <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
        Nutrimeds
      </Link>

      {/* Desktop Nav */}
      <ul className="hidden md:flex gap-8 list-none items-center">
        <li>
          <Link href="/" className={navLinkClass('/')}>Beranda</Link>
        </li>
        <li>
          <Link href="/calculator" className={navLinkClass('/calculator')}>Kalkulator</Link>
        </li>

        <li>
          <Link href="/admin" className={navLinkClass('/admin')}>Admin</Link>
        </li>
        {session && (
          <li>
            <Link href="/dashboard" className={navLinkClass('/dashboard')}>Dashboard</Link>
          </li>
        )}
      </ul>

      {/* Auth Controls */}
      <div className="hidden md:flex items-center gap-3">
        {isPending ? (
          <div className="w-24 h-10 bg-slate-100 rounded-full animate-pulse" />
        ) : session ? (
          <>
            <span className="text-sm text-slate-600 font-medium">
              Halo, <span className="text-primary font-semibold">{session.user.name}</span>
            </span>
            <button
              onClick={handleSignOut}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-full font-medium text-sm transition-all"
            >
              Keluar
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full font-semibold transition-all shadow-md"
          >
            Masuk / Daftar
          </Link>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col gap-1.5 p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <span className={`w-6 h-0.5 bg-slate-700 transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`w-6 h-0.5 bg-slate-700 transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
        <span className={`w-6 h-0.5 bg-slate-700 transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-border shadow-lg md:hidden">
          <div className="px-[5%] py-6 space-y-4">
            <Link href="/" onClick={() => setMobileOpen(false)} className="block text-lg font-medium">Beranda</Link>
            <Link href="/calculator" onClick={() => setMobileOpen(false)} className="block text-lg font-medium">Kalkulator</Link>

            <Link href="/admin" onClick={() => setMobileOpen(false)} className="block text-lg font-medium text-primary">Admin Panel</Link>
            {session && (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block text-lg font-medium">Dashboard</Link>
            )}
            <hr className="border-slate-200" />
            {session ? (
              <>
                <p className="text-sm text-slate-500">Masuk sebagai <span className="font-semibold text-primary">{session.user.name}</span></p>
                <button onClick={handleSignOut} className="w-full bg-slate-100 text-slate-700 py-2.5 rounded-xl font-medium">
                  Keluar
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-center bg-primary text-white py-2.5 rounded-xl font-semibold">
                Masuk / Daftar
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
