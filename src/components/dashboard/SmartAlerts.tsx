import React from 'react';
import { AlertTriangle, Clock, Boxes, Image, ArrowRight } from 'lucide-react';
import { db } from '../../services/db';
import { ActivePage } from '../../types';

interface SmartAlertsProps {
  onNavigate: (page: ActivePage) => void;
}

export const SmartAlerts: React.FC<SmartAlertsProps> = ({ onNavigate }) => {
  const stats = db.getStats();
  const assets = db.getAssets(false);
  const withoutPhoto = assets.filter(a => !a.photoUrl).length;

  const alerts = [];

  if (stats.brokenHeavy > 0) {
    alerts.push({
      type: 'danger',
      icon: AlertTriangle,
      title: `${stats.brokenHeavy} Aset dalam kondisi Rusak Berat`,
      desc: 'Perlu pemeriksaan teknisi untuk tindak lanjut usulan penghapusan lelang atau perbaikan besar.',
      actionText: 'Tinjau Aset',
      page: 'assets' as ActivePage,
      color: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200',
      btnColor: 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 dark:hover:bg-rose-900',
    });
  }

  if (stats.lowStockCount > 0) {
    alerts.push({
      type: 'warning',
      icon: Boxes,
      title: `${stats.lowStockCount} Barang Habis Pakai di bawah batas minimum (Safety Stock)`,
      desc: `Termasuk: ${stats.lowStockItems.map(i => i.name).slice(0, 2).join(', ')}. Segera lakukan transaksi barang masuk.`,
      actionText: 'Restock Barang',
      page: 'inventory' as ActivePage,
      color: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200',
      btnColor: 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 dark:hover:bg-amber-900',
    });
  }

  if (stats.lateBorrowings > 0) {
    alerts.push({
      type: 'danger',
      icon: Clock,
      title: `${stats.lateBorrowings} Peminjaman aset melewati batas tanggal pengembalian`,
      desc: 'Terdeteksi keterlambatan sirkulasi peminjaman. Segera lakukan penagihan kepada peminjam.',
      actionText: 'Lihat Peminjaman',
      page: 'borrowings' as ActivePage,
      color: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/60 text-purple-800 dark:text-purple-200',
      btnColor: 'text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 dark:hover:bg-purple-900',
    });
  }

  if (withoutPhoto > 0) {
    alerts.push({
      type: 'info',
      icon: Image,
      title: `${withoutPhoto} Unit aset belum dilengkapi dokumentasi foto fisik`,
      desc: 'Lengkapi foto aset untuk mempermudah identifikasi visual dan audit fisik sarana prasarana.',
      actionText: 'Lengkapi Data',
      page: 'assets' as ActivePage,
      color: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-200',
      btnColor: 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 hover:bg-blue-200 dark:hover:bg-blue-900',
    });
  }

  if (alerts.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3 transition-colors">
        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
          ✓
        </div>
        <div>
          <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Seluruh Sistem Terkendali Optimal</h4>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">Tidak ada peringatan kritis mengenai aset rusak, stok menipis, atau pinjaman terlambat saat ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Peringatan Cerdas (Smart Alerts)
        </h4>
        <span className="text-xs text-slate-500 dark:text-slate-400">{alerts.length} Peringatan Aktif</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alerts.map((al, idx) => {
          const Icon = al.icon;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition ${al.color}`}
            >
              <div className="p-2 rounded-lg bg-white/70 dark:bg-black/30 shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-xs leading-snug">{al.title}</h5>
                <p className="text-[11px] opacity-90 mt-1 leading-relaxed">{al.desc}</p>
                <div className="mt-2.5">
                  <button
                    onClick={() => onNavigate(al.page)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${al.btnColor}`}
                  >
                    <span>{al.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
