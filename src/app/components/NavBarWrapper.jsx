'use client';

import dynamic from 'next/dynamic';

const NavBar = dynamic(() => import('./NavBar'), {
  ssr: false,
  loading: () => (
    <nav className="fixed top-0 w-full px-[5%] py-4 flex justify-between items-center bg-white/70 backdrop-blur-md border-b border-border z-50">
      <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Nutrimeds</span>
      <div className="w-24 h-10 bg-slate-100 rounded-full animate-pulse" />
    </nav>
  ),
});

export default function NavBarWrapper() {
  return <NavBar />;
}
