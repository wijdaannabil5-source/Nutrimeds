'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const STATUS_COLORS = {
  'Normal': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-500' },
  'Kurang Gizi': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-500' },
  'Gizi Buruk': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-500' },
  'Risiko Stunting': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-500' },
  'Risiko Obesitas': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-500' },
  'Obesitas': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-600' },
  'Berat Badan Lebih': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-600' },
};

const MEAL_ICONS = {
  sarapan: '🌅',
  makan_siang: '☀️',
  makan_malam: '🌙',
  camilan: '🍎',
};

export default function CalculatorPage() {
  const [form, setForm] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    weight: '',
    height: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: parseFloat(form.weight),
          height: parseFloat(form.height),
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Terjadi kesalahan.');
        setLoading(false);
        return;
      }

      setResult(json.data);
    } catch (err) {
      setError('Gagal terhubung ke server. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshMenu = async () => {
    if (!result) return;
    try {
      const currentFoodNames = result.mealPlan.map(meal => meal.foodName);
      const res = await fetch('/api/meal-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCalories: result.recommendedCalories,
          status: result.overallStatus,
          currentFoodNames,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Gagal mengganti menu.');
        return;
      }
      if (json.success) {
        setResult((prev) => ({ ...prev, mealPlan: json.data }));
      }
    } catch (err) {
      console.error('Error refreshing menu:', err);
      alert('Terjadi kesalahan koneksi saat mengganti menu.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    setPdfLoading(true);
    try {
      const doc = new jsPDF();
      const childName = form.name || 'Anak';
      const nutritionStatus = result.overallStatus;
      const recommendedCalories = result.recommendedCalories;
      const date = new Date().toLocaleDateString('id-ID');

      // Futuristic Header Banner
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
      
      // Header Title
      doc.setFontSize(26);
      doc.setTextColor(56, 189, 248); // Sky 400
      doc.text('Nutrimeds', 14, 25);

      // Header Subtitle
      doc.setFontSize(11);
      doc.setTextColor(203, 213, 225); // Slate 300
      doc.text('Laporan Rekomendasi Menu Cerdas', doc.internal.pageSize.getWidth() - 14, 25, { align: 'right' });

      // Body Section
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text('Rangkuman Gizi & Menu Harian', 14, 55);

      // Info Cards (simulated with light boxes)
      doc.setFillColor(241, 245, 249); // Slate 100
      doc.roundedRect(14, 62, 85, 25, 3, 3, 'F');
      doc.roundedRect(110, 62, 85, 25, 3, 3, 'F');

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text('Nama Anak / Status', 19, 70);
      doc.text('Target Kalori / Tanggal', 115, 70);

      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text(`${childName} • ${nutritionStatus || 'Unknown'}`, 19, 79);
      doc.text(`${recommendedCalories || 0} Kkal • ${date}`, 115, 79);

      const tableColumn = ["Waktu Makan", "Menu", "Kalori", "Protein (g)"];
      const tableRows = [];

      result.mealPlan.forEach(meal => {
        const mealData = [
          meal.mealTypeLabel || meal.mealType,
          meal.foodName,
          `${meal.totalCalories} Kkal`,
          `${meal.protein}g`
        ];
        tableRows.push(mealData);
        
        if (meal.ingredients || meal.instructions) {
          const details = [];
          if (meal.ingredients) {
            const ingList = Array.isArray(meal.ingredients) ? meal.ingredients.join(', ') : meal.ingredients;
            details.push(`Bahan: ${ingList}`);
          }
          if (meal.instructions) {
            details.push(`Cara: ${meal.instructions}`);
          }
          tableRows.push([{ content: details.join('\n'), colSpan: 4, styles: { textColor: [100, 116, 139], fontStyle: 'italic', fontSize: 9, cellPadding: { top: 2, bottom: 6, left: 4, right: 4 } } }]);
        }
      });

      autoTable(doc, {
        startY: 100,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { cellPadding: 5, fontSize: 10, lineColor: [226, 232, 240], lineWidth: 0.1 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 35, fontStyle: 'bold', textColor: [15, 23, 42] },
          1: { cellWidth: 'auto', textColor: [51, 65, 85] },
          2: { cellWidth: 25, halign: 'center', textColor: [2, 132, 199], fontStyle: 'bold' },
          3: { cellWidth: 25, halign: 'center', textColor: [2, 132, 199] },
        },
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate 400
        doc.text(
          'Dicetak secara otomatis oleh Nutrimeds AI • Sistem Pemantauan Gizi Futuristik',
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`Menu-Gizi-${childName}.pdf`);
      
      // Open the feedback form in a new tab
      window.open('https://docs.google.com/forms/d/e/1FAIpQLSfvhzm6pv7wcEqbXdCzqL3S5b60Nk_2gkRg73lXORk0WUxwyg/viewform', '_blank');

    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh PDF. Silakan coba lagi.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const statusStyle = result ? (STATUS_COLORS[result.overallStatus] || STATUS_COLORS['Normal']) : null;

  return (
    <div className="flex flex-col items-center px-[5%] pb-16">
      {/* Header */}
      <div className="text-center max-w-2xl mb-10">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-3">Kalkulator Antropometri Pintar</h1>
        <p className="text-lg text-slate-500">
          Masukkan data fisik anak Anda untuk melihat status gizi, kebutuhan kalori, dan rekomendasi menu harian secara instan.
        </p>
      </div>

      {/* Form */}
      <div className="glass-card w-full max-w-2xl p-8 mb-10">
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="calc-name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Nama Anak <span className="text-slate-400">(opsional)</span>
            </label>
            <input
              id="calc-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
              placeholder="Contoh: Budi"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="calc-dob" className="block text-sm font-medium text-slate-700 mb-1.5">
                Tanggal Lahir
              </label>
              <input
                id="calc-dob"
                name="dateOfBirth"
                type="date"
                required
                value={form.dateOfBirth}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="calc-gender" className="block text-sm font-medium text-slate-700 mb-1.5">
                Jenis Kelamin
              </label>
              <select
                id="calc-gender"
                name="gender"
                required
                value={form.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all bg-white"
              >
                <option value="">-- Pilih --</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="calc-weight" className="block text-sm font-medium text-slate-700 mb-1.5">
                Berat Badan (kg)
              </label>
              <input
                id="calc-weight"
                name="weight"
                type="number"
                step="0.1"
                min="0.5"
                max="100"
                required
                value={form.weight}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                placeholder="Contoh: 15.5"
              />
            </div>
            <div>
              <label htmlFor="calc-height" className="block text-sm font-medium text-slate-700 mb-1.5">
                Tinggi Badan (cm)
              </label>
              <input
                id="calc-height"
                name="height"
                type="number"
                step="0.1"
                min="30"
                max="200"
                required
                value={form.height}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all"
                placeholder="Contoh: 100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Menghitung...
              </span>
            ) : '🔬 Hitung Status Gizi'}
          </button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="w-full max-w-4xl space-y-8 print:space-y-4" id="results-section">
          {/* Status Banner */}
          <div className={`rounded-2xl p-6 border-2 ${statusStyle.bg} ${statusStyle.border}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Status Gizi Anak {form.name ? `(${form.name})` : ''}</p>
                <h2 className={`text-3xl font-extrabold ${statusStyle.text}`}>{result.overallStatus}</h2>
                <p className="text-sm text-slate-600 mt-2 max-w-lg">{result.interpretation}</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <div className="text-center bg-white/80 rounded-xl px-5 py-3 border border-white">
                  <div className="text-2xl font-bold text-primary">{result.bmi}</div>
                  <div className="text-xs text-slate-500">BMI</div>
                </div>
                <div className="text-center bg-white/80 rounded-xl px-5 py-3 border border-white">
                  <div className="text-2xl font-bold text-secondary">{result.recommendedCalories}</div>
                  <div className="text-xs text-slate-500">Kkal/Hari</div>
                </div>
              </div>
            </div>
          </div>

          {/* Z-Scores + Macros Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Z-Scores */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Skor Z-Score WHO</h3>
              <div className="space-y-4">
                {[
                  { label: 'Berat / Usia (WFA)', data: result.zScores.weightForAge },
                  { label: 'Tinggi / Usia (HFA)', data: result.zScores.heightForAge },
                  { label: 'BMI / Usia (BFA)', data: result.zScores.bmiForAge },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                    <div>
                      <div className="text-sm font-medium text-slate-700">{item.label}</div>
                      <div className="text-xs text-slate-500">{item.data.classification}</div>
                    </div>
                    <div className={`text-lg font-bold ${item.data.value < -2 ? 'text-red-600' : item.data.value > 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {item.data.value > 0 ? '+' : ''}{item.data.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Macro Targets */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">🎯 Target Makro Harian</h3>
              <div className="space-y-4">
                <MacroBar label="Protein" value={result.macroTargets.protein} unit="g" color="bg-blue-500" max={Math.max(result.macroTargets.protein, result.macroTargets.carbs, result.macroTargets.fat)} />
                <MacroBar label="Karbohidrat" value={result.macroTargets.carbs} unit="g" color="bg-amber-500" max={Math.max(result.macroTargets.protein, result.macroTargets.carbs, result.macroTargets.fat)} />
                <MacroBar label="Lemak" value={result.macroTargets.fat} unit="g" color="bg-pink-500" max={Math.max(result.macroTargets.protein, result.macroTargets.carbs, result.macroTargets.fat)} />
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <span className="text-sm text-slate-500">Total Kebutuhan: </span>
                <span className="text-lg font-bold text-primary">{result.recommendedCalories} Kkal</span>
              </div>
            </div>
          </div>

          {/* Meal Plan */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">🍽️ Rekomendasi Menu Harian</h3>
              <button
                onClick={handleRefreshMenu}
                className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 print:hidden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Ganti Menu
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.mealPlan.map((meal, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{MEAL_ICONS[meal.mealType] || '🍽️'}</span>
                    <div>
                      <div className="font-bold text-slate-900">{meal.mealTypeLabel}</div>
                      <div className="text-xs text-slate-500">{meal.totalCalories} Kkal • {meal.portionNote}</div>
                    </div>
                  </div>
                  <h4 className="font-semibold text-primary mb-2">{meal.foodName}</h4>
                  <div className="text-xs text-slate-600 mb-2">
                    <span className="font-medium">Bahan:</span> {Array.isArray(meal.ingredients) ? meal.ingredients.join(', ') : meal.ingredients}
                  </div>
                  {meal.instructions && (
                    <div className="text-xs text-slate-500 italic">
                      {meal.instructions}
                    </div>
                  )}
                  <div className="flex gap-3 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
                    <span>P: {meal.protein}g</span>
                    <span>K: {meal.carbs}g</span>
                    <span>L: {meal.fat}g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden mt-4">
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
              onClick={handlePrint}
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
    </div>
  );
}

function MacroBar({ label, value, unit, color, max }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-bold text-slate-900">{value}{unit}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
