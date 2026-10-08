import { db } from './db';
import { formatRupiah } from '../utils/formatters';

export async function askAIAssistant(prompt: string): Promise<{ reply: string; source: string }> {
  const stats = db.getStats();
  const school = db.getSchool();
  const lowStockItems = stats.lowStockItems.map(i => ({ name: i.name, current: i.currentStock, min: i.minStock, unit: i.unit }));

  const context = {
    schoolName: school.name,
    stats: {
      ...stats,
      totalValueFormatted: formatRupiah(stats.totalValue),
      lowStockItems,
    },
    sampleRecentAssets: db.getAssets(false).slice(0, 5).map(a => ({
      code: a.code,
      name: a.name,
      condition: a.condition,
      price: formatRupiah(a.acquisitionPrice),
    })),
  };

  try {
    const res = await fetch('/api/ai-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      reply: data.reply || 'Tidak ada respon yang diterima.',
      source: data.source || 'gemini',
    };
  } catch (err: any) {
    console.warn('API error, falling back locally:', err);
    // Offline local fallback if server unreachable
    return {
      reply: `Halo! SIMASET SEKOLAH mendeteksi ${stats.totalAssets} total aset terdata dengan total nilai perolehan ${formatRupiah(stats.totalValue)}. Terdapat ${stats.brokenHeavy} aset kondisi rusak berat dan ${stats.lowStockCount} barang habis pakai dengan stok menipis.`,
      source: 'offline-fallback',
    };
  }
}
