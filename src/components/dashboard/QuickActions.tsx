import React from 'react';
import {
  PlusCircle,
  PackagePlus,
  ArrowLeftRight,
  Truck,
  Wrench,
  Printer,
} from 'lucide-react';
import { ActivePage } from '../../types';

interface QuickActionsProps {
  onNavigate: (page: ActivePage) => void;
  onOpenNewAssetModal?: () => void;
  onOpenStockInModal?: () => void;
  onOpenBorrowModal?: () => void;
  onOpenMutationModal?: () => void;
  onOpenMaintenanceModal?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onNavigate,
  onOpenNewAssetModal,
  onOpenStockInModal,
  onOpenBorrowModal,
  onOpenMutationModal,
  onOpenMaintenanceModal,
}) => {
  const actions = [
    {
      label: 'Tambah Aset',
      desc: 'Daftarkan aset tetap baru',
      icon: PlusCircle,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      onClick: () => (onOpenNewAssetModal ? onOpenNewAssetModal() : onNavigate('assets')),
    },
    {
      label: 'Barang Masuk (BHP)',
      desc: 'Catat pasokan ATK/kebersihan',
      icon: PackagePlus,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      onClick: () => (onOpenStockInModal ? onOpenStockInModal() : onNavigate('inventory')),
    },
    {
      label: 'Peminjaman Aset',
      desc: 'Catat peminjaman guru/staff',
      icon: ArrowLeftRight,
      color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      onClick: () => (onOpenBorrowModal ? onOpenBorrowModal() : onNavigate('borrowings')),
    },
    {
      label: 'Mutasi Ruangan',
      desc: 'Pindahkan aset antar ruang',
      icon: Truck,
      color: 'bg-purple-600 hover:bg-purple-700 text-white',
      onClick: () => (onOpenMutationModal ? onOpenMutationModal() : onNavigate('mutations')),
    },
    {
      label: 'Pemeliharaan',
      desc: 'Catat perbaikan kerusakan',
      icon: Wrench,
      color: 'bg-amber-600 hover:bg-amber-700 text-white',
      onClick: () => (onOpenMaintenanceModal ? onOpenMaintenanceModal() : onNavigate('maintenance')),
    },
    {
      label: 'Cetak Laporan',
      desc: 'Buku Inventaris & DIR',
      icon: Printer,
      color: 'bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white',
      onClick: () => onNavigate('reports'),
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Aksi Cepat (Quick Actions)</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pintasan transaksi dan administrasi yang paling sering digunakan</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <button
              key={i}
              onClick={act.onClick}
              className={`p-3.5 rounded-xl ${act.color} flex flex-col items-center justify-center text-center transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 group`}
            >
              <Icon className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold leading-tight">{act.label}</span>
              <span className="text-[10px] opacity-80 mt-1 line-clamp-1">{act.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
