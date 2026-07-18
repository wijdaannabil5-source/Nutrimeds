'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Theme warna status gizi
const STATUS_THEMES = {
  'Normal': { color: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Kurang Gizi': { color: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200' },
  'Gizi Buruk': { color: '#ef4444', bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-200' },
  'Risiko Stunting': { color: '#f97316', bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-200' },
  'Risiko Obesitas': { color: '#eab308', bg: 'bg-yellow-500', text: 'text-yellow-700', border: 'border-yellow-200' },
  'Obesitas': { color: '#dc2626', bg: 'bg-red-600', text: 'text-red-700', border: 'border-red-300' },
  'Berat Badan Lebih': { color: '#a855f7', bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-200' },
  'Belum diukur': { color: '#64748b', bg: 'bg-slate-400', text: 'text-slate-600', border: 'border-slate-200' }
};

// Icon navigasi sidebar
const TAB_ICONS = {
  'overview': '📊',
  'users': '👥',
  'children': '👶',
  'logs': '📝',
  'settings': '🛠️'
};

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigasi Tab
  const [activeTab, setActiveTab] = useState('overview');
  
  // States filter log
  const [logPage, setLogPage] = useState(1);
  const [logSearch, setLogSearch] = useState('');
  const [logAction, setLogAction] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState(null);
  
  // State filter pencarian di tab Users & Children
  const [userSearch, setUserSearch] = useState('');
  const [childSearch, setChildSearch] = useState('');

  // Sesi interaksi Donut Chart
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState(null);

  // State Simulasi
  const [simulating, setSimulating] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  // State autentikasi - cegah flash konten sebelum validasi
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: logPage.toString(),
        limit: '15', // limit log audit
        search: logSearch,
        action: logAction
      });
      
      const res = await fetch(`/api/admin/activities?${queryParams.toString()}`);
      
      if (res.status === 401) {
        setIsAuthenticated(false);
        router.push('/admin/login');
        return;
      }

      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || 'Gagal memuat data dari server.');
      }
      
      setIsAuthenticated(true);
      setData(json.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Gagal terhubung ke API admin.');
    } finally {
      setLoading(false);
    }
  };

  // Cek sesi admin saat pertama kali load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/activities?page=1&limit=1&search=&action=ALL');
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        setIsAuthenticated(true);
        fetchAdminData();
      } catch {
        router.push('/admin/login');
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [logPage, logAction]);

  const handleLogSearchSubmit = (e) => {
    e.preventDefault();
    setLogPage(1);
    fetchAdminData();
  };

  const handleSimulate = async () => {
    if (simulating) return;
    setSimulating(true);
    showToast('Sedang membuat data simulasi...', 'info');
    
    try {
      const res = await fetch('/api/admin/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SIMULATE' })
      });
      
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Simulasi gagal.');
      }
      
      showToast('Simulasi sukses! 25+ Aktivitas & User baru ditambahkan.', 'success');
      setLogPage(1);
      fetchAdminData();
    } catch (err) {
      showToast(err.message || 'Terjadi kesalahan saat simulasi.', 'error');
    } finally {
      setSimulating(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/admin/login');
      } else {
        alert('Gagal melakukan logout.');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan koneksi saat logout.');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: '' });
    }, 4000);
  };

  const getActionBadgeClass = (action) => {
    const classes = {
      'CALCULATE': 'bg-sky-50 text-sky-700 border-sky-200',
      'CHAT': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      'CREATE_CHILD': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'ADD_MEASUREMENT': 'bg-amber-50 text-amber-700 border-amber-200',
      'GENERATE_PPTX': 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
      'USER_SIGNUP': 'bg-violet-50 text-violet-700 border-violet-200',
      'MOCK_SIMULATION': 'bg-rose-50 text-rose-700 border-rose-200'
    };
    return classes[action] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  // Renderer Donut Chart Interaktif
  const renderDonutChart = () => {
    if (!data || data.stats.totalMeasurements === 0) {
      return (
        <div className="w-48 h-48 rounded-full border-8 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">
          Tidak ada data gizi
        </div>
      );
    }

    const dist = data.statusDistribution;
    const total = data.stats.totalMeasurements;
    const circumference = 314.16; // 2 * PI * R (R=50)
    let accumulatedPercent = 0;
    const segments = [];

    Object.entries(dist).forEach(([status, count]) => {
      if (count === 0) return;
      const pct = (count / total) * 100;
      const theme = STATUS_THEMES[status] || { color: '#64748b' };
      
      const offset = circumference - (accumulatedPercent / 100) * circumference;
      const strokeDash = `${(pct / 100) * circumference} ${circumference}`;
      
      segments.push({
        status,
        pct,
        count,
        color: theme.color,
        strokeDash,
        strokeDashoffset: offset
      });
      
      accumulatedPercent += pct;
    });

    return (
      <div className="relative flex items-center justify-center w-52 h-52">
        <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
          <circle cx="100" cy="100" r="50" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
          {segments.map((seg, idx) => (
            <circle
              key={idx}
              cx="100"
              cy="100"
              r="50"
              fill="transparent"
              stroke={seg.color}
              strokeWidth="18"
              strokeDasharray={seg.strokeDash}
              strokeDashoffset={seg.strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 cursor-pointer hover:stroke-[22px]"
              onMouseEnter={() => setHoveredDonutSegment(seg)}
              onMouseLeave={() => setHoveredDonutSegment(null)}
            />
          ))}
        </svg>

        {/* Text Center Overlay */}
        <div className="absolute flex flex-col items-center justify-center text-center w-28 h-28 bg-white rounded-full shadow-inner z-10 pointer-events-none">
          {hoveredDonutSegment ? (
            <>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider line-clamp-1 px-1">
                {hoveredDonutSegment.status}
              </span>
              <span className="text-xl font-extrabold text-slate-800">
                {Math.round(hoveredDonutSegment.pct)}%
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                {hoveredDonutSegment.count} Anak
              </span>
            </>
          ) : (
            <>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Total Ukur
              </span>
              <span className="text-2xl font-extrabold text-slate-800">
                {total}
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                Pengukuran
              </span>
            </>
          )}
        </div>
      </div>
    );
  };

  // Renderer Smooth Spline Chart (Tren Aktivitas)
  const renderSplineChart = () => {
    if (!data || !data.activityTrend || data.activityTrend.length === 0) return null;
    
    const trend = data.activityTrend;
    const width = 600;
    const height = 220;
    const paddingX = 40;
    const paddingY = 30;
    
    const maxVal = Math.max(...trend.map(d => d.count), 5);
    
    const points = trend.map((d, i) => {
      const x = paddingX + (i * (width - 2 * paddingX)) / (trend.length - 1);
      const y = height - paddingY - (d.count / maxVal) * (height - 2 * paddingY);
      return { x, y, label: d.label, count: d.count };
    });
    
    // Curved/Bezier path calculation
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
    
    return (
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingY + ratio * (height - 2 * paddingY);
          const gridVal = Math.round(maxVal * (1 - ratio));
          return (
            <g key={i} className="opacity-10">
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#0f172a" strokeWidth="1" strokeDasharray="4,4" />
              <text x={paddingX - 12} y={y + 3} fill="#0f172a" fontSize="10" textAnchor="end" className="font-semibold">{gridVal}</text>
            </g>
          );
        })}
        
        {/* Area fill */}
        <path d={areaD} fill="url(#chartGradient)" />
        
        {/* Main curved path */}
        <path d={pathD} fill="none" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" />
        
        {/* Dots and tooltips */}
        {points.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#0ea5e9" strokeWidth="3" />
            <circle cx={p.x} cy={p.y} r="10" fill="#0ea5e9" fillOpacity="0" className="hover:fill-opacity-10 transition-all duration-200" />
            
            <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <rect x={p.x - 22} y={p.y - 28} width="44" height="18" rx="6" fill="#0f172a" />
              <text x={p.x} y={p.y - 16} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">{p.count} act</text>
            </g>
          </g>
        ))}
        
        {/* Bottom labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={height - 8} fill="#64748b" fontSize="9.5" textAnchor="middle" fontWeight="bold">
            {p.label.split(' ')[0]}
          </text>
        ))}
      </svg>
    );
  };

  // Filter List Pengguna
  const getFilteredUsers = () => {
    if (!data || !data.usersList) return [];
    if (!userSearch) return data.usersList;
    const q = userSearch.toLowerCase();
    return data.usersList.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  };

  // Filter List Anak
  const getFilteredChildren = () => {
    if (!data || !data.childrenList) return [];
    if (!childSearch) return data.childrenList;
    const q = childSearch.toLowerCase();
    return data.childrenList.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.parentName.toLowerCase().includes(q) ||
      c.latestStatus.toLowerCase().includes(q)
    );
  };

  // Jangan tampilkan konten admin jika belum terautentikasi
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Memeriksa sesi admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-100 text-slate-800 flex overflow-hidden font-sans">
      
      {/* Toast popup */}
      {toast.message && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl transition-all border transform translate-y-0 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <span className="text-xl">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '⚠️' : 'ℹ️'}
          </span>
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SIDEBAR NAVIGASI PORTAL
          ───────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-68 bg-slate-900 text-slate-300 border-r border-slate-800 relative z-10">
        
        {/* Brand/Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl shadow-md">
            🩺
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight leading-none">Nutrimeds</h2>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Control Center</span>
          </div>
        </div>

        {/* Tab Items List */}
        <nav className="flex-1 p-4 space-y-1.5">
          <span className="block px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
            Menu Pemantauan
          </span>
          
          {[
            { id: 'overview', name: 'Ikhtisar Portal', desc: 'Metrik & Tren Utama' },
            { id: 'users', name: 'Manajemen User', desc: 'Daftar Akun Pengguna' },
            { id: 'children', name: 'Kesehatan Anak', desc: 'Daftar Profil & Status Gizi' },
            { id: 'logs', name: 'Log Audit Sistem', desc: 'Aktivitas & Log Teknis' },
            { id: 'settings', name: 'Alat & Simulator', desc: 'Pengendali Simulasi DB' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3.5 group ${
                activeTab === tab.id 
                  ? 'bg-primary text-white font-semibold shadow-lg shadow-primary/20' 
                  : 'hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <span className="text-lg group-hover:scale-110 transition-transform">{TAB_ICONS[tab.id]}</span>
              <div>
                <div className="text-sm">{tab.name}</div>
                <div className={`text-[10px] ${activeTab === tab.id ? 'text-white/80' : 'text-slate-500'} font-medium`}>
                  {tab.desc}
                </div>
              </div>
            </button>
          ))}
        </nav>

        {/* Footer Admin Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold flex items-center justify-center text-sm">
              G
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-none">Super Admin</div>
              <span className="text-[10px] text-primary font-bold">gege (Online)</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600/15 border border-red-500/20 hover:bg-red-600 hover:text-white text-red-400 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs active:scale-95 duration-100"
          >
            <span>🚪</span> Keluar Sesi Admin
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT PANEL
          ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto relative">
        
        {/* Top Header bar */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between z-30 shadow-sm">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Nutrimeds Portal / {activeTab}
            </div>
            <h1 className="text-xl font-bold text-slate-800 mt-0.5 capitalize">
              {activeTab === 'overview' ? 'Panel Utama (Dashboard)' : 
               activeTab === 'users' ? 'Manajemen Pengguna' : 
               activeTab === 'children' ? 'Kesehatan & Antropometri Anak' : 
               activeTab === 'logs' ? 'Audit Log Aktivitas' : 'Pengaturan & Alat Simulasi'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Drawer Trigger/Header Info */}
            <div className="lg:hidden text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold">
              Admin: gege
            </div>
            
            <button
              onClick={() => { fetchAdminData(); showToast('Data sistem telah disegarkan.', 'info'); }}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-all shadow-sm active:scale-95"
              title="Segarkan Data"
            >
              🔄
            </button>
            <Link href="/" className="hidden sm:inline-flex text-xs font-bold border border-slate-200 hover:border-slate-300 bg-white px-4 py-2 rounded-xl transition-all active:scale-95">
              Lihat Website
            </Link>
          </div>
        </header>

        {/* Content body */}
        <div className="p-6 md:p-8 flex-1">
          {loading && !data ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <svg className="animate-spin h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-slate-500 font-semibold text-sm">Menarik data dari database SQLite...</p>
            </div>
          ) : (
            data && (
              <div className="space-y-8 animate-fade-in">
                
                {/* ─────────────────────────────────────────────────────────────
                    TAB 1: OVERVIEW (DASHBOARD)
                    ───────────────────────────────────────────────────────────── */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    
                    {/* Grid Metrik Utama */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      
                      {[
                        { title: 'Total Pengguna', value: data.stats.totalUsers, icon: '👥', color: 'border-l-violet-500', bg: 'bg-violet-500/10', text: 'text-violet-600', note: 'Pengguna terdaftar' },
                        { title: 'Anak Dipantau', value: data.stats.totalChildren, icon: '👶', color: 'border-l-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600', note: 'Profil anak aktif' },
                        { title: 'Uji Antropometri', value: data.stats.totalMeasurements, icon: '⚖️', color: 'border-l-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-600', note: 'Z-score terhitung' },
                        { title: 'Log Aktivitas', value: data.stats.totalActivities, icon: '⚡', color: 'border-l-sky-500', bg: 'bg-sky-500/10', text: 'text-sky-600', note: 'Total interaksi audit' }
                      ].map((card, idx) => (
                        <div key={idx} className={`bg-white border border-slate-200 border-l-4 ${card.color} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                              <h3 className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">{card.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-xl ${card.bg} ${card.text} flex items-center justify-center text-xl`}>
                              {card.icon}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 mt-4 block">{card.note}</span>
                        </div>
                      ))}
                    </div>

                    {/* Health Indicators Widget */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4">🚨 Indikator Bahaya Kesehatan Gizi Anak</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Stunting indicator */}
                        <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between text-xs font-bold text-red-800">
                              <span>Stunting Alert Rate</span>
                              <span>{data.stats.health?.stuntingRate || 0}%</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Persentase tinggi badan di bawah -2 SD (Height-for-Age).</p>
                          </div>
                          <div className="w-full bg-red-100 h-2 rounded-full overflow-hidden mt-4">
                            <div className="bg-red-500 h-full rounded-full transition-all" style={{ width: `${data.stats.health?.stuntingRate || 0}%` }} />
                          </div>
                        </div>

                        {/* Obesity indicator */}
                        <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between text-xs font-bold text-yellow-800">
                              <span>Obesity Alert Rate</span>
                              <span>{data.stats.health?.obesityRate || 0}%</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Persentase IMT/U di atas +2 SD (BMI-for-Age).</p>
                          </div>
                          <div className="w-full bg-yellow-100 h-2 rounded-full overflow-hidden mt-4">
                            <div className="bg-yellow-500 h-full rounded-full transition-all" style={{ width: `${data.stats.health?.obesityRate || 0}%` }} />
                          </div>
                        </div>

                        {/* Underweight indicator */}
                        <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between text-xs font-bold text-orange-800">
                              <span>Wasting/Underweight Alert Rate</span>
                              <span>{data.stats.health?.underweightRate || 0}%</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Persentase berat badan di bawah -2 SD (Weight-for-Age).</p>
                          </div>
                          <div className="w-full bg-orange-100 h-2 rounded-full overflow-hidden mt-4">
                            <div className="bg-orange-500 h-full rounded-full transition-all" style={{ width: `${data.stats.health?.underweightRate || 0}%` }} />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Grafik Analisis dan Donut Sebaran */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                      {/* Trend spline */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-3 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Statistik Sistem</span>
                          <h3 className="text-lg font-bold text-slate-800 mt-0.5">📈 Grafik Gelombang Interaksi (7 Hari Terakhir)</h3>
                          <p className="text-xs text-slate-500 mt-1">Agregasi interaksi pengguna pada website utama.</p>
                        </div>
                        <div className="h-56 w-full flex items-center justify-center mt-6">
                          {renderSplineChart()}
                        </div>
                      </div>

                      {/* Donut Gizi */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between items-center text-center">
                        <div className="w-full text-left">
                          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Data Antropometri</span>
                          <h3 className="text-lg font-bold text-slate-800 mt-0.5">📊 Status Gizi Anak Terdaftar</h3>
                          <p className="text-xs text-slate-500 mt-1">Arahkan kursor ke grafik untuk rincian persentase.</p>
                        </div>
                        <div className="my-6">
                          {renderDonutChart()}
                        </div>
                        <div className="w-full text-left text-xs font-bold text-slate-400 border-t border-slate-100 pt-3">
                          *Berdasarkan WHO Child Growth Standards (2006)
                        </div>
                      </div>
                    </div>

                    {/* LIVE TICKER */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md text-slate-300">
                      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse block" />
                          <h4 className="font-extrabold text-white text-sm uppercase tracking-widest">Live Activity Audit Monitor</h4>
                        </div>
                        <span className="text-[10px] font-semibold bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">STATUS: OK</span>
                      </div>
                      
                      <div className="space-y-3">
                        {data.logs.slice(0, 4).map((log, idx) => (
                          <div key={idx} className="flex items-start justify-between text-xs py-1.5 border-b border-slate-800/40 last:border-b-0 hover:bg-slate-800/20 px-2 rounded transition-all">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-primary">[{new Date(log.createdAt).toLocaleTimeString('id-ID')}]</span>
                              <span className="font-bold text-slate-400">{log.action}:</span>
                              <span className="text-slate-300 line-clamp-1">{log.description}</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-500">{log.ipAddress || 'anonymous'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    TAB 2: USERS (DAFTAR USER)
                    ───────────────────────────────────────────────────────────── */}
                {activeTab === 'users' && (
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Header Tab */}
                    <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Daftar Akun Pengguna</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Semua pengguna yang terdaftar di database.</p>
                      </div>
                      <input
                        type="text"
                        placeholder="Cari user berdasarkan nama/email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:ring-2 focus:ring-primary/30 outline-none w-64 shadow-sm"
                      />
                    </div>

                    {/* Tabel User */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-4">Nama Pengguna</th>
                            <th className="px-6 py-4">Alamat Email</th>
                            <th className="px-6 py-4">Tanggal Registrasi</th>
                            <th className="px-6 py-4">ID Pengguna</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                          {getFilteredUsers().length === 0 ? (
                            <tr>
                              <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                                Tidak ada data pengguna ditemukan.
                              </td>
                            </tr>
                          ) : (
                            getFilteredUsers().map((user) => {
                              const date = new Date(user.createdAt);
                              const formattedDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                              return (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-all">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 font-extrabold text-sm flex items-center justify-center shadow-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="font-bold text-slate-800">{user.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                                    {user.email}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                    {formattedDate}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-400">
                                    {user.id}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    TAB 3: CHILDREN (KESEHATAN ANAK)
                    ───────────────────────────────────────────────────────────── */}
                {activeTab === 'children' && (
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Header Tab */}
                    <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Pemantauan Kesehatan Gizi Anak</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Daftar anak dan status gizi pengukuran terakhir.</p>
                      </div>
                      <input
                        type="text"
                        placeholder="Cari anak berdasarkan nama/status..."
                        value={childSearch}
                        onChange={(e) => setChildSearch(e.target.value)}
                        className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:ring-2 focus:ring-primary/30 outline-none w-64 shadow-sm"
                      />
                    </div>

                    {/* Tabel Anak */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-4">Nama Anak</th>
                            <th className="px-6 py-4">Orang Tua (User)</th>
                            <th className="px-6 py-4">Tgl Lahir / Jenis Kelamin</th>
                            <th className="px-6 py-4">Ukuran Terakhir</th>
                            <th className="px-6 py-4">Status Gizi (Terakhir)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                          {getFilteredChildren().length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                Tidak ada data profil anak ditemukan.
                              </td>
                            </tr>
                          ) : (
                            getFilteredChildren().map((child) => {
                              const dob = new Date(child.dateOfBirth);
                              const formattedDob = dob.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                              const theme = STATUS_THEMES[child.latestStatus] || STATUS_THEMES['Belum diukur'];
                              
                              return (
                                <tr key={child.id} className="hover:bg-slate-50/50 transition-all">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-9 h-9 rounded-xl ${child.gender === 'male' ? 'bg-sky-100 text-sky-700' : 'bg-pink-100 text-pink-700'} font-bold flex items-center justify-center shadow-sm`}>
                                        {child.gender === 'male' ? '👦' : '👧'}
                                      </div>
                                      <span className="font-bold text-slate-800">{child.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-600">
                                    {child.parentName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-semibold text-slate-700">{formattedDob}</div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{child.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {child.latestWeight ? (
                                      <div className="font-semibold text-slate-800">
                                        ⚖️ {child.latestWeight} kg / 📐 {child.latestHeight} cm
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 text-xs">Belum ada pengukuran</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${theme.bg} ${theme.text} ${theme.border} bg-opacity-10`}>
                                      {child.latestStatus}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    TAB 4: AUDIT LOGS (AKTIVITAS DETAIL EXPANDABLE)
                    ───────────────────────────────────────────────────────────── */}
                {activeTab === 'logs' && (
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Audit Log Transaksional</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Audit trail sistem lengkap. Klik baris log untuk detail sistem metadata.</p>
                      </div>

                      {/* Filter */}
                      <form onSubmit={handleLogSearchSubmit} className="flex flex-wrap items-center gap-3">
                        <select
                          value={logAction}
                          onChange={(e) => { setLogAction(e.target.value); setLogPage(1); }}
                          className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/30 outline-none shadow-sm"
                        >
                          <option value="ALL">Semua Aktivitas</option>
                          <option value="CALCULATE">Kalkulasi Mandiri</option>
                          <option value="CHAT">Pesan AI Chat</option>
                          <option value="CREATE_CHILD">Profil Anak Baru</option>
                          <option value="ADD_MEASUREMENT">Input Gizi Baru</option>
                          <option value="GENERATE_PPTX">Unduh PPTX</option>
                          <option value="USER_SIGNUP">Registrasi User</option>
                          <option value="MOCK_SIMULATION">Simulasi Sistem</option>
                        </select>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Cari deskripsi..."
                            value={logSearch}
                            onChange={(e) => setLogSearch(e.target.value)}
                            className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/30 outline-none w-52 shadow-sm"
                          />
                          <button type="submit" className="bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow">
                            Cari
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Tabel log audit */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-4">Waktu</th>
                            <th className="px-6 py-4">Pengguna</th>
                            <th className="px-6 py-4">Aksi</th>
                            <th className="px-6 py-4">Deskripsi Aktivitas</th>
                            <th className="px-6 py-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                          {data.logs.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                Tidak ada log aktivitas yang cocok dengan kriteria filter.
                              </td>
                            </tr>
                          ) : (
                            data.logs.map((log) => {
                              const date = new Date(log.createdAt);
                              const formattedTime = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                              const formattedDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                              const isExpanded = expandedLogId === log.id;

                              return (
                                <g key={log.id}>
                                  {/* Baris utama */}
                                  <tr 
                                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                    className={`hover:bg-slate-50 cursor-pointer transition-all ${isExpanded ? 'bg-slate-50/80 font-medium' : ''}`}
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="font-semibold text-slate-900">{formattedTime}</div>
                                      <div className="text-xs text-slate-500">{formattedDate}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {log.userName ? (
                                        <div className="flex items-center gap-2">
                                          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                                            {log.userName.charAt(0).toUpperCase()}
                                          </div>
                                          <span className="font-semibold text-slate-800">{log.userName}</span>
                                        </div>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                          Anonim
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${getActionBadgeClass(log.action)}`}>
                                        {log.action}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs md:max-w-md text-slate-800 break-words font-medium">
                                      {log.description}
                                    </td>
                                    <td className="px-6 py-4 text-center text-lg whitespace-nowrap">
                                      {isExpanded ? '🔼' : '🔽'}
                                    </td>
                                  </tr>

                                  {/* Baris Ekspansi Detail */}
                                  {isExpanded && (
                                    <tr className="bg-slate-100/50">
                                      <td colSpan="5" className="px-6 py-4 border-t border-b border-slate-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                          <div className="space-y-1.5">
                                            <h5 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] text-primary">Metadata Sistem</h5>
                                            <div>
                                              <span className="font-bold text-slate-500">ID Log:</span> <span className="font-mono">{log.id}</span>
                                            </div>
                                            <div>
                                              <span className="font-bold text-slate-500">IP Address:</span> <span className="font-mono bg-white px-1.5 py-0.5 border border-slate-200 rounded">{log.ipAddress || 'Tidak diketahui'}</span>
                                            </div>
                                            {log.userId && (
                                              <div>
                                                <span className="font-bold text-slate-500">User ID Ref:</span> <span className="font-mono">{log.userId}</span>
                                              </div>
                                            )}
                                          </div>
                                          <div className="space-y-1.5">
                                            <h5 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] text-primary">Detil Browser (User Agent)</h5>
                                            <div className="font-mono bg-white p-2 border border-slate-200 rounded leading-relaxed break-all max-h-20 overflow-y-auto">
                                              {log.userAgent || 'Tidak diketahui'}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </g>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {data.pagination.totalPages > 1 && (
                      <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-500">
                          Menampilkan {data.logs.length} dari {data.pagination.totalItems} aktivitas
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setLogPage(p => Math.max(1, p - 1)); setExpandedLogId(null); }}
                            disabled={logPage === 1}
                            className="px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          >
                            Sebelumnya
                          </button>
                          <span className="text-xs font-bold text-slate-600">
                            Halaman {logPage} dari {data.pagination.totalPages}
                          </span>
                          <button
                            onClick={() => { setLogPage(p => Math.min(data.pagination.totalPages, p + 1)); setExpandedLogId(null); }}
                            disabled={logPage === data.pagination.totalPages}
                            className="px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          >
                            Selanjutnya
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    TAB 5: SETTINGS & TOOLS (SIMULATOR ALAT)
                    ───────────────────────────────────────────────────────────── */}
                {activeTab === 'settings' && (
                  <div className="max-w-2xl space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                      <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center text-2xl rounded-2xl mb-5 shadow-inner">
                        🚀
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">Simulasi Data Aktivitas Sistem</h3>
                      <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                        Fitur simulasi ini mempermudah evaluator/pemeriksa aplikasi dalam menguji dashboard CMS secara instan.
                        Menekan tombol di bawah akan menggenerasikan:
                      </p>
                      
                      <ul className="mt-4 space-y-2 text-slate-600 text-sm list-disc pl-5">
                        <li><strong>3 User Baru</strong> terdaftar dengan data email unik.</li>
                        <li><strong>4 Profil Anak</strong> dengan jenis kelamin dan tanggal lahir bervariasi.</li>
                        <li><strong>6 Riwayat Pengukuran Gizi</strong> (Z-Score) yang mencakup status Normal, Risiko Stunting, dan Berat Badan Lebih untuk mengisi chart.</li>
                        <li><strong>23 Log Aktivitas Historis</strong> yang terdistribusi acak dalam 7 hari terakhir untuk mengisi line chart tren.</li>
                      </ul>

                      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3">
                        <button
                          onClick={handleSimulate}
                          disabled={simulating}
                          className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {simulating ? (
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <span>🚀</span>
                          )}
                          Jalankan Simulasi Data Massal
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 text-slate-300 p-6 rounded-2xl shadow-md">
                      <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mb-2">Informasi Akses Administrator</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Sesi login admin dilindungi secara server-side menggunakan cookie HTTP-Only. Sesi admin akan berakhir secara otomatis dalam 24 jam atau dapat diakhiri secara manual dengan menekan tombol keluar di sidebar.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
