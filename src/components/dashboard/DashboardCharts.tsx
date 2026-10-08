import React from 'react';
import { db } from '../../services/db';
import { formatRupiah } from '../../utils/formatters';

export const DashboardCharts: React.FC = () => {
  const assets = db.getAssets(false);
  const categories = db.getCategories();
  const stockItems = db.getStockItems(false);

  // 1. Condition distribution
  const total = assets.length;
  const good = assets.filter(a => a.condition === 'Baik').length;
  const light = assets.filter(a => a.condition === 'Rusak Ringan').length;
  const heavy = assets.filter(a => a.condition === 'Rusak Berat').length;

  const goodPct = total > 0 ? Math.round((good / total) * 100) : 0;
  const lightPct = total > 0 ? Math.round((light / total) * 100) : 0;
  const heavyPct = total > 0 ? Math.round((heavy / total) * 100) : 0;

  // 2. Assets by Category
  const categoryCounts = categories.map(cat => {
    const matching = assets.filter(a => a.categoryId === cat.id);
    const count = matching.length;
    const value = matching.reduce((sum, a) => sum + a.acquisitionPrice * (a.quantity || 1), 0);
    return {
      name: cat.name,
      code: cat.code,
      count,
      value,
    };
  });

  const maxCount = Math.max(...categoryCounts.map(c => c.count), 1);
  const maxValue = Math.max(...categoryCounts.map(c => c.value), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Kondisi Aset */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Distribusi Kondisi Aset</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Persentase kelayakan fisik aset terdata</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{total} Unit Total</span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          <div style={{ width: `${goodPct}%` }} className="bg-emerald-500 transition-all duration-500" title={`Baik: ${good} unit (${goodPct}%)`} />
          <div style={{ width: `${lightPct}%` }} className="bg-amber-400 transition-all duration-500" title={`Rusak Ringan: ${light} unit (${lightPct}%)`} />
          <div style={{ width: `${heavyPct}%` }} className="bg-rose-500 transition-all duration-500" title={`Rusak Berat: ${heavy} unit (${heavyPct}%)`} />
        </div>

        {/* Legend Cards */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 text-center">
            <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">Kondisi Baik</span>
            <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{good} <span className="text-xs font-normal">({goodPct}%)</span></p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 text-center">
            <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">Rusak Ringan</span>
            <p className="text-lg font-black text-amber-700 dark:text-amber-400 mt-0.5">{light} <span className="text-xs font-normal">({lightPct}%)</span></p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 text-center">
            <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300">Rusak Berat</span>
            <p className="text-lg font-black text-rose-700 dark:text-rose-400 mt-0.5">{heavy} <span className="text-xs font-normal">({heavyPct}%)</span></p>
          </div>
        </div>
      </div>

      {/* Chart 2: Jumlah Aset Berdasarkan Kategori */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Aset Berdasarkan Kategori</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Jumlah item aset pada tiap rumpun barang</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {categoryCounts.map(cat => {
            const widthPct = Math.round((cat.count / maxCount) * 100);
            return (
              <div key={cat.code} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[220px]">
                    {cat.name}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{cat.count} Unit</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${cat.count > 0 ? Math.max(widthPct, 4) : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 3: Nilai Perolehan per Kategori */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Nilai Aset Berdasarkan Kategori</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total valuasi rupiah perolehan sarpras</p>
          </div>
        </div>

        <div className="space-y-3">
          {categoryCounts.map(cat => {
            const widthPct = maxValue > 0 ? Math.round((cat.value / maxValue) * 100) : 0;
            return (
              <div key={cat.code} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{cat.name}</span>
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{formatRupiah(cat.value)}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${cat.value > 0 ? Math.max(widthPct, 3) : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 4: Monitoring Stok Barang Habis Pakai */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Monitoring Stok ATK & Bahan Habis Pakai</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Perbandingan stok saat ini vs batas minimum aman</p>
          </div>
        </div>

        {stockItems.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Belum ada barang habis pakai terdaftar</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Stok ATK dan perlengkapan yang ditambahkan akan otomatis termonitor di sini.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {stockItems.slice(0, 5).map(item => {
              const isLow = item.currentStock <= item.minStock;
              const max = Math.max(item.initialStock, item.currentStock, item.minStock * 2);
              const currentPct = Math.round((item.currentStock / max) * 100);

              return (
                <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                      {isLow && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                          MENIPIS
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {item.currentStock} / min {item.minStock} {item.unit}
                    </span>
                  </div>
                  <div className="relative h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isLow ? 'bg-rose-500' : 'bg-blue-600'}`}
                      style={{ width: `${currentPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
