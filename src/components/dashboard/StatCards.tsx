import React from 'react';
import {
  Package,
  Boxes,
  Coins,
  CheckCircle2,
  AlertCircle,
  XCircle,
  AlertTriangle,
  ArrowLeftRight,
  Wrench,
} from 'lucide-react';
import { db } from '../../services/db';
import { formatRupiah } from '../../utils/formatters';

interface StatCardsProps {
  onFilterCondition?: (condition: string) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({ onFilterCondition }) => {
  const stats = db.getStats();

  const cards = [
    {
      label: 'Total Seluruh Aset',
      value: `${stats.totalAssets} Unit`,
      subValue: 'Aset Tetap Sekolah',
      icon: Package,
      bgColor: 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300',
    },
    {
      label: 'Total Nilai Aset',
      value: formatRupiah(stats.totalValue),
      subValue: 'Estimasi Nilai Perolehan',
      icon: Coins,
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300',
    },
    {
      label: 'Barang Habis Pakai',
      value: `${stats.totalConsumables} Item`,
      subValue: `Nilai: ${formatRupiah(stats.totalConsumableValue)}`,
      icon: Boxes,
      bgColor: 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300',
    },
    {
      label: 'Kondisi Baik',
      value: `${stats.goodCondition} Unit`,
      subValue: `${stats.totalAssets ? Math.round((stats.goodCondition / stats.totalAssets) * 100) : 0}% Siap Digunakan`,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300',
      onClick: () => onFilterCondition?.('Baik'),
    },
    {
      label: 'Rusak Ringan',
      value: `${stats.brokenLight} Unit`,
      subValue: 'Dapat Difungsikan Terbatas',
      icon: AlertCircle,
      bgColor: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300',
      onClick: () => onFilterCondition?.('Rusak Ringan'),
    },
    {
      label: 'Rusak Berat',
      value: `${stats.brokenHeavy} Unit`,
      subValue: 'Perlu Perbaikan / Penghapusan',
      icon: XCircle,
      bgColor: 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300',
      onClick: () => onFilterCondition?.('Rusak Berat'),
    },
    {
      label: 'Stok Menipis (ATK)',
      value: `${stats.lowStockCount} Item`,
      subValue: 'Di Bawah Batas Minimum',
      icon: AlertTriangle,
      bgColor: 'bg-orange-50 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300',
      isWarning: stats.lowStockCount > 0,
    },
    {
      label: 'Sedang Dipinjam',
      value: `${stats.activeBorrowings} Transaksi`,
      subValue: stats.lateBorrowings > 0 ? `${stats.lateBorrowings} Terlambat Kembali!` : 'Sirkulasi Normal',
      icon: ArrowLeftRight,
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300',
      isWarning: stats.lateBorrowings > 0,
    },
    {
      label: 'Dalam Pemeliharaan',
      value: `${stats.inMaintenance} Unit`,
      subValue: 'Sedang Ditangani Teknisi',
      icon: Wrench,
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={card.onClick}
            className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all relative overflow-hidden group ${
              card.onClick ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-700' : ''
            }`}
          >
            {card.isWarning && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-bl-lg animate-ping" />
            )}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{card.label}</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{card.value}</h3>
                <p className={`text-[11px] mt-1 font-medium ${card.isWarning ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                  {card.subValue}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bgColor} shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
