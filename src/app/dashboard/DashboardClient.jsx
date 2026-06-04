'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toPng } from 'html-to-image';

// ── Status color map ────────────────────────────────────────
const STATUS_COLORS = {
  'Normal': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Kurang Gizi': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Gizi Buruk': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
  'Risiko Stunting': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
  'Risiko Obesitas': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  'Obesitas': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-600' },
  'Berat Badan Lebih': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-600' },
};

const MEAL_ICONS = { sarapan: '🌅', makan_siang: '☀️', makan_malam: '🌙', camilan: '🍎' };

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────
  const [children, setChildren] = useState([]);
  const [activeChildId, setActiveChildId] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [activeMeasurement, setActiveMeasurement] = useState(null);
  const [mealPlan, setMealPlan] = useState([]);

  // UI state
  const [showAddChild, setShowAddChild] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Forms
  const [childForm, setChildForm] = useState({ name: '', dateOfBirth: '', gender: '' });
  const [measurementForm, setMeasurementForm] = useState({ weight: '', height: '' });

  // ── Data fetching ──────────────────────────────────────────
  const fetchChildren = useCallback(async () => {
    try {
      const res = await fetch('/api/children');
      const json = await res.json();
      if (json.success) setChildren(json.data);
    } catch {}
    setLoadingChildren(false);
  }, []);

  const fetchMeasurements = useCallback(async (childId) => {
    setLoadingMeasurements(true);
    try {
      const res = await fetch(`/api/measurements?childId=${childId}`);
      const json = await res.json();
      if (json.success) {
        setMeasurements(json.data);
        // Automatically load the latest measurement detail
        if (json.data.length > 0) {
          const latest = json.data[json.data.length - 1];
          await fetchMeasurementDetail(latest.id);
        } else {
          setActiveMeasurement(null);
          setMealPlan([]);
        }
      }
    } catch {}
    setLoadingMeasurements(false);
  }, []);

  const fetchMeasurementDetail = async (measurementId) => {
    try {
      const res = await fetch(`/api/measurements/${measurementId}`);
      const json = await res.json();
      if (json.success) {
        setActiveMeasurement(json.data.measurement);
        setMealPlan(json.data.mealPlan);
      }
    } catch {}
  };

  // On session ready, fetch children
  useEffect(() => {
    if (session) fetchChildren();
  }, [session, fetchChildren]);

  // When active child changes, fetch measurements
  useEffect(() => {
    if (activeChildId) fetchMeasurements(activeChildId);
  }, [activeChildId, fetchMeasurements]);

  // ── Child CRUD ─────────────────────────────────────────────
  const handleAddChild = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(childForm),
      });
      const json = await res.json();
      if (json.success) {
        await fetchChildren();
        setActiveChildId(json.data.id);
        setShowAddChild(false);
        setChildForm({ name: '', dateOfBirth: '', gender: '' });
      }
    } catch {}
    setActionLoading(false);
  };

  const handleUpdateChild = async (e) => {
    e.preventDefault();
    if (!editingChild) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/children/${editingChild}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(childForm),
      });
      const json = await res.json();
      if (json.success) {
        await fetchChildren();
        setEditingChild(null);
        setChildForm({ name: '', dateOfBirth: '', gender: '' });
      }
    } catch {}
    setActionLoading(false);
  };

  const handleDeleteChild = async (childId) => {
    if (!confirm('Yakin ingin menghapus profil anak ini? Semua data pengukuran akan ikut terhapus.')) return;
    try {
      await fetch(`/api/children/${childId}`, { method: 'DELETE' });
      if (activeChildId === childId) {
        setActiveChildId(null);
        setMeasurements([]);
        setActiveMeasurement(null);
        setMealPlan([]);
      }
      await fetchChildren();
    } catch {}
  };

  const startEditChild = (child) => {
    setEditingChild(child.id);
    setChildForm({ name: child.name, dateOfBirth: child.dateOfBirth, gender: child.gender });
    setShowAddChild(false);
  };

  // ── Measurement submission ────────────────────────────────
  const handleAddMeasurement = async (e) => {
    e.preventDefault();
    if (!activeChildId) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: activeChildId,
          weight: parseFloat(measurementForm.weight),
          height: parseFloat(measurementForm.height),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddMeasurement(false);
        setMeasurementForm({ weight: '', height: '' });
        await fetchMeasurements(activeChildId);
      }
    } catch {}
    setActionLoading(false);
  };

  // ── Refresh meal plan ─────────────────────────────────────
  const handleRefreshMenu = async () => {
    if (!activeMeasurement) return;
    try {
      const currentFoodNames = mealPlan.map(meal => meal.foodName);
      const res = await fetch('/api/meal-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCalories: activeMeasurement.recommendedCalories,
          status: activeMeasurement.nutritionStatus,
          measurementId: activeMeasurement.id,
          currentFoodNames,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Gagal mengganti menu.');
        return;
      }
      if (json.success) setMealPlan(json.data);
    } catch (err) {
      console.error('Error refreshing menu:', err);
      alert('Terjadi kesalahan koneksi saat mengganti menu.');
    }
  };

  // ── PDF download ──────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!activeMeasurement) return;
    const activeChild = children.find((c) => c.id === activeChildId);
    setPdfLoading(true);
    try {
      const element = document.getElementById('futuristic-pdf-template-dashboard');
      if (!element) throw new Error('Template not found');

      // Add a slight delay to ensure fonts/SVGs are fully painted
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await toPng(element, {
        backgroundColor: '#0f172a', // Slate-900
        pixelRatio: 2,
        cacheBust: true,
      });

      // Load image to get dimensions
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => img.onload = resolve);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [img.width / 2, img.height / 2],
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width / 2, img.height / 2);
      
      const childName = activeChild?.name || 'Anak';
      pdf.save(`Menu-Gizi-${childName}.pdf`);
      
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh PDF.');
    }
    setPdfLoading(false);
  };

  // ── Auth guard ────────────────────────────────────────────
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <p className="text-slate-500">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const activeChild = children.find((c) => c.id === activeChildId);
  const statusStyle = activeMeasurement ? (STATUS_COLORS[activeMeasurement.nutritionStatus] || STATUS_COLORS['Normal']) : null;

  return (
    <div className="max-w-7xl mx-auto px-[5%] pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Kelola profil anak dan pantau perkembangan gizi mereka.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ─── LEFT SIDEBAR: Child profiles ─── */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-slate-900">Profil Anak</h2>
              <button
                onClick={() => { setShowAddChild(true); setEditingChild(null); setChildForm({ name: '', dateOfBirth: '', gender: '' }); }}
                className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
                title="Tambah anak baru"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Add / Edit form */}
            {(showAddChild || editingChild) && (
              <form onSubmit={editingChild ? handleUpdateChild : handleAddChild} className="space-y-3 mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700">{editingChild ? 'Edit Profil' : 'Tambah Anak Baru'}</h3>
                <input
                  type="text"
                  required
                  placeholder="Nama anak"
                  value={childForm.name}
                  onChange={(e) => setChildForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
                <input
                  type="date"
                  required
                  value={childForm.dateOfBirth}
                  onChange={(e) => setChildForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
                <select
                  required
                  value={childForm.gender}
                  onChange={(e) => setChildForm((f) => ({ ...f, gender: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-white"
                >
                  <option value="">Jenis kelamin</option>
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </select>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-primary text-white text-sm font-semibold py-2 rounded-lg disabled:opacity-60"
                  >
                    {actionLoading ? 'Menyimpan...' : editingChild ? 'Simpan' : 'Tambah'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddChild(false); setEditingChild(null); }}
                    className="px-4 bg-slate-200 text-slate-700 text-sm font-medium py-2 rounded-lg"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}

            {/* Children list */}
            {loadingChildren ? (
              <div className="text-center py-8 text-slate-400 text-sm">Memuat...</div>
            ) : children.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm mb-2">Belum ada profil anak.</p>
                <button onClick={() => setShowAddChild(true)} className="text-primary text-sm font-semibold hover:underline">
                  + Tambah anak pertama
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className={`p-3 rounded-xl border cursor-pointer transition-all group ${
                      activeChildId === child.id
                        ? 'bg-primary/5 border-primary/30 shadow-sm'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                    onClick={() => setActiveChildId(child.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          child.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                        }`}>
                          {child.gender === 'male' ? '♂' : '♀'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 text-sm truncate">{child.name}</div>
                          <div className="text-xs text-slate-500">
                            {new Date(child.dateOfBirth).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEditChild(child); }}
                          className="w-7 h-7 rounded-md hover:bg-slate-200 flex items-center justify-center text-slate-500"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteChild(child.id); }}
                          className="w-7 h-7 rounded-md hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600"
                          title="Hapus"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── MAIN CONTENT ─── */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {!activeChildId ? (
            <div className="glass-card p-16 text-center">
              <div className="w-20 h-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Pilih Profil Anak</h3>
              <p className="text-slate-500 text-sm">Pilih anak dari daftar di samping atau tambahkan profil baru untuk memulai.</p>
            </div>
          ) : (
            <>
              {/* ── Active Child Header ── */}
              <div className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                    activeChild?.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                  }`}>
                    {activeChild?.gender === 'male' ? '♂' : '♀'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{activeChild?.name}</h2>
                    <p className="text-sm text-slate-500">
                      {activeChild?.gender === 'male' ? 'Laki-laki' : 'Perempuan'} •{' '}
                      Lahir {new Date(activeChild?.dateOfBirth).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowAddMeasurement(true); }}
                  className="bg-gradient-to-r from-primary to-secondary text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Ukur Baru
                </button>
              </div>

              {/* ── New Measurement Form ── */}
              {showAddMeasurement && (
                <div className="glass-card p-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-4">📏 Pengukuran Baru</h3>
                  <form onSubmit={handleAddMeasurement} className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Berat Badan (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        required
                        value={measurementForm.weight}
                        onChange={(e) => setMeasurementForm((f) => ({ ...f, weight: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        placeholder="15.5"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tinggi Badan (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="30"
                        required
                        value={measurementForm.height}
                        onChange={(e) => setMeasurementForm((f) => ({ ...f, height: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        placeholder="100"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl disabled:opacity-60"
                      >
                        {actionLoading ? 'Menyimpan...' : 'Simpan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddMeasurement(false)}
                        className="bg-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-xl"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {loadingMeasurements ? (
                <div className="text-center py-12 text-slate-400">Memuat data pengukuran...</div>
              ) : measurements.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <p className="text-slate-400 mb-4">Belum ada data pengukuran untuk anak ini.</p>
                  <button
                    onClick={() => setShowAddMeasurement(true)}
                    className="text-primary font-semibold hover:underline"
                  >
                    + Buat pengukuran pertama
                  </button>
                </div>
              ) : (
                <>
                  {/* ── Status Banner ── */}
                  {activeMeasurement && statusStyle && (
                    <div className={`rounded-2xl p-6 border-2 ${statusStyle.bg} ${statusStyle.border}`}>
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2.5 h-2.5 rounded-full ${statusStyle.dot}`} />
                            <span className="text-sm font-medium text-slate-500">Status Gizi Terakhir</span>
                          </div>
                          <h3 className={`text-2xl font-extrabold ${statusStyle.text}`}>
                            {activeMeasurement.nutritionStatus}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            Diukur {new Date(activeMeasurement.measuredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="text-center bg-white/80 rounded-xl px-5 py-3">
                            <div className="text-xl font-bold text-primary">{activeMeasurement.weight} kg</div>
                            <div className="text-xs text-slate-500">Berat</div>
                          </div>
                          <div className="text-center bg-white/80 rounded-xl px-5 py-3">
                            <div className="text-xl font-bold text-primary">{activeMeasurement.height} cm</div>
                            <div className="text-xs text-slate-500">Tinggi</div>
                          </div>
                          <div className="text-center bg-white/80 rounded-xl px-5 py-3">
                            <div className="text-xl font-bold text-secondary">{activeMeasurement.recommendedCalories}</div>
                            <div className="text-xs text-slate-500">Kkal/Hari</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Measurement History ── */}
                  <div className="glass-card p-6">
                    <h3 className="font-bold text-lg text-slate-900 mb-4">📈 Riwayat Pengukuran</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-slate-500 border-b border-slate-200">
                            <th className="pb-3 font-medium">Tanggal</th>
                            <th className="pb-3 font-medium">Usia</th>
                            <th className="pb-3 font-medium">BB (kg)</th>
                            <th className="pb-3 font-medium">TB (cm)</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium">Kalori</th>
                            <th className="pb-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {measurements.map((m) => {
                            const mStatus = STATUS_COLORS[m.nutritionStatus] || STATUS_COLORS['Normal'];
                            return (
                              <tr
                                key={m.id}
                                className={`border-b border-slate-100 cursor-pointer transition-colors ${
                                  activeMeasurement?.id === m.id ? 'bg-primary/5' : 'hover:bg-slate-50'
                                }`}
                                onClick={() => fetchMeasurementDetail(m.id)}
                              >
                                <td className="py-3">
                                  {new Date(m.measuredAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}
                                </td>
                                <td className="py-3">{m.ageMonths} bln</td>
                                <td className="py-3 font-medium">{m.weight}</td>
                                <td className="py-3 font-medium">{m.height}</td>
                                <td className="py-3">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${mStatus.bg} ${mStatus.text} ${mStatus.border} border`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${mStatus.dot}`} />
                                    {m.nutritionStatus}
                                  </span>
                                </td>
                                <td className="py-3">{m.recommendedCalories}</td>
                                <td className="py-3">
                                  {activeMeasurement?.id === m.id && (
                                    <span className="text-primary text-xs font-semibold">Aktif</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ── Meal Plan ── */}
                  {mealPlan.length > 0 && (
                    <div className="glass-card p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-slate-900">🍽️ Menu Makan Harian</h3>
                        <button
                          onClick={handleRefreshMenu}
                          className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Ganti Menu
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mealPlan.map((meal, i) => (
                          <div key={i} className="bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-2xl">{MEAL_ICONS[meal.mealType] || '🍽️'}</span>
                              <div>
                                <div className="font-bold text-slate-900">{meal.mealTypeLabel || getMealLabel(meal.mealType)}</div>
                                <div className="text-xs text-slate-500">{meal.totalCalories} Kkal</div>
                              </div>
                            </div>
                            <h4 className="font-semibold text-primary mb-2">{meal.foodName}</h4>
                            <div className="text-xs text-slate-600 mb-2">
                              <span className="font-medium">Bahan:</span>{' '}
                              {Array.isArray(meal.ingredients) ? meal.ingredients.join(', ') : meal.ingredients}
                            </div>
                            {meal.instructions && (
                              <div className="text-xs text-slate-500 italic">{meal.instructions}</div>
                            )}
                            <div className="flex gap-3 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
                              <span>P: {meal.protein}g</span>
                              <span>K: {meal.carbs}g</span>
                              <span>L: {meal.fat}g</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Export buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden mt-8">
                        <button
                          onClick={handleDownloadPDF}
                          disabled={pdfLoading}
                          className="group relative overflow-hidden flex items-center justify-center gap-3 bg-slate-900 text-white font-medium px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(56,189,248,0.3)] disabled:opacity-60 disabled:hover:scale-100 border border-slate-700"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-sky-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                          {pdfLoading ? (
                            <svg className="animate-spin h-6 w-6 relative z-10 text-sky-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 relative z-10 text-sky-400 group-hover:-translate-y-1 group-hover:scale-110 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          )}
                          <span className="relative z-10 tracking-wide">Unduh Dokumen PDF</span>
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="group relative overflow-hidden flex items-center justify-center gap-3 bg-white text-slate-800 font-medium px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(148,163,184,0.3)] border-2 border-slate-200 hover:border-slate-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-400 group-hover:text-slate-700 group-hover:rotate-12 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          <span className="tracking-wide">Cetak Halaman</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Hidden Futuristic PDF Template for Dashboard */}
              {activeMeasurement && mealPlan.length > 0 && (
                <div className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none -z-50">
                  <div 
                    id="futuristic-pdf-template-dashboard" 
                    className="bg-slate-900 text-white w-[800px] h-[1130px] p-10 font-sans shadow-2xl relative overflow-hidden"
                  >
                  {/* Decorative Glowing Orbs */}
                  <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-sky-500/30 rounded-full blur-[100px]"></div>
                  <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
                  
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-end border-b border-slate-700/50 pb-6 mb-8">
                      <div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent tracking-tight">Nutrimeds AI</h1>
                        <p className="text-slate-400 mt-2 text-lg">Rekomendasi Menu Gizi Cerdas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-300 font-medium">Tanggal Cetak</p>
                        <p className="text-sky-400 text-xl font-bold">{new Date().toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>

                    {/* Profile Cards */}
                    <div className="grid grid-cols-2 gap-6 mb-10">
                      <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-bl-full"></div>
                        <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          Profil Anak
                        </p>
                        <h2 className="text-2xl font-bold text-white mb-2">{activeChild?.name || 'Anak'}</h2>
                        <div className="inline-block px-3 py-1 bg-slate-900/80 rounded-lg text-sky-400 border border-sky-900/50 text-sm font-medium">
                          {activeMeasurement.nutritionStatus || 'Status Tidak Diketahui'}
                        </div>
                      </div>

                      <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full"></div>
                        <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          Target Harian
                        </p>
                        <h2 className="text-2xl font-bold text-white mb-2">{activeMeasurement.recommendedCalories || 0} Kkal</h2>
                        <div className="flex gap-4 mt-2">
                          <span className="text-xs text-slate-400"><strong className="text-blue-400">Tinggi:</strong> {activeMeasurement.height} cm</span>
                          <span className="text-xs text-slate-400"><strong className="text-pink-400">Berat:</strong> {activeMeasurement.weight} kg</span>
                        </div>
                      </div>
                    </div>

                    {/* Menu List */}
                    <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      Jadwal Menu Rekomendasi
                    </h3>
                    
                    <div className="space-y-4">
                      {mealPlan.map((meal, i) => (
                        <div key={i} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5 flex flex-col gap-3 relative">
                          {/* Glowing line on left */}
                          <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-sky-400 to-blue-600 rounded-r-md"></div>
                          
                          <div className="flex justify-between items-start pl-4">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl bg-slate-900 p-2 rounded-lg shadow-inner border border-slate-800">
                                {meal.mealType === 'sarapan' ? '🌅' : meal.mealType === 'makan_siang' ? '☀️' : meal.mealType === 'makan_malam' ? '🌙' : '🍎'}
                              </div>
                              <div>
                                <div className="text-sky-400 font-bold tracking-wide uppercase text-xs mb-1">{meal.mealType.replace('_', ' ')}</div>
                                <div className="text-white font-semibold text-lg">{meal.foodName}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-emerald-400">{meal.totalCalories}</div>
                              <div className="text-xs text-slate-400">Kkal</div>
                            </div>
                          </div>

                          <div className="pl-4 mt-2 grid grid-cols-1 gap-2">
                            {meal.ingredients && (
                              <div className="text-sm text-slate-300">
                                <span className="text-sky-400 font-medium">Bahan:</span> {Array.isArray(meal.ingredients) ? meal.ingredients.join(', ') : meal.ingredients}
                              </div>
                            )}
                            {meal.instructions && (
                              <div className="text-sm text-slate-400 italic">
                                <span className="text-sky-400 font-medium not-italic">Cara:</span> {meal.instructions}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-6 border-t border-slate-800 text-center text-slate-500 text-sm">
                      <p>Dokumen ini dihasilkan secara otomatis oleh <strong>Nutrimeds AI</strong>.</p>
                      <p className="mt-1 text-xs">Untuk analisis lebih lanjut, selalu konsultasikan dengan ahli gizi profesional.</p>
                    </div>
                  </div>
                </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function getMealLabel(type) {
  const labels = { sarapan: 'Sarapan', makan_siang: 'Makan Siang', makan_malam: 'Makan Malam', camilan: 'Camilan' };
  return labels[type] || type;
}
