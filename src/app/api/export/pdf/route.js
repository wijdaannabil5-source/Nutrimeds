import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export async function POST(request) {
  try {
    const body = await request.json();
    const { childName, nutritionStatus, recommendedCalories, mealPlan, date } = body;

    if (!mealPlan || !Array.isArray(mealPlan)) {
      return Response.json({ error: 'Data mealPlan tidak valid.' }, { status: 400 });
    }

    // Create a new PDF document
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(22);
    doc.setTextColor(14, 165, 233); // Primary color
    doc.text('Nutrimeds', 14, 22);

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text('Rekomendasi Menu Makan Harian', 14, 32);

    // Add child info & status
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(`Nama Anak: ${childName || 'Tidak diketahui'}`, 14, 42);
    doc.text(`Status Gizi: ${nutritionStatus || 'Tidak diketahui'}`, 14, 48);
    doc.text(`Target Kalori Harian: ${recommendedCalories || 0} Kkal`, 14, 54);
    doc.text(`Tanggal Cetak: ${date || new Date().toLocaleDateString('id-ID')}`, 14, 60);

    // Prepare table data
    const tableColumn = ["Waktu Makan", "Menu", "Kalori", "Protein (g)"];
    const tableRows = [];

    mealPlan.forEach(meal => {
      const mealData = [
        meal.mealTypeLabel || meal.mealType,
        meal.foodName,
        `${meal.totalCalories} Kkal`,
        `${meal.protein}g`
      ];
      tableRows.push(mealData);
      
      // Add a sub-row for ingredients and instructions
      if (meal.ingredients || meal.instructions) {
        const details = [];
        if (meal.ingredients) {
          const ingList = Array.isArray(meal.ingredients) ? meal.ingredients.join(', ') : meal.ingredients;
          details.push(`Bahan: ${ingList}`);
        }
        if (meal.instructions) {
          details.push(`Cara: ${meal.instructions}`);
        }
        tableRows.push([{ content: details.join('\n'), colSpan: 4, styles: { textColor: [100, 116, 139], fontStyle: 'italic', fontSize: 9 } }]);
      }
    });

    // Generate table
    doc.autoTable({
      startY: 68,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233] }, // Primary color background for header
      styles: { cellPadding: 4, fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
      },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        'Dicetak secara otomatis oleh Nutrimeds - Kalkulator Gizi & Rekomendasi Menu Anak',
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Output as array buffer
    const arrayBuffer = doc.output('arraybuffer');
    
    // Return the PDF file
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Menu-Gizi-${childName || 'Anak'}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return Response.json({ error: 'Gagal mencetak dokumen PDF.' }, { status: 500 });
  }
}
