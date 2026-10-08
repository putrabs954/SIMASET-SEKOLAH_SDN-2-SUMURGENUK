import React from 'react';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { UserRole } from '../../types';

interface AccessDeniedProps {
  pageName: string;
  userRole: UserRole;
  onGoBack: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  pageName,
  userRole,
  onGoBack,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-8 text-center shadow-xl shadow-rose-900/5 space-y-5 transition-colors">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center ring-8 ring-rose-50 dark:ring-rose-950/40">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 mb-2">
            ACCESS DENIED &bull; 403 DITOLAK
          </span>

          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Akses Halaman Ditolak
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Peran akun Anda (<strong className="text-rose-600 dark:text-rose-400">{userRole}</strong>) tidak memiliki hak otorisasi untuk membuka modul <strong className="text-slate-800 dark:text-slate-200">{pageName}</strong>.
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Kebijakan Keamanan RBAC (Role-Based Access):</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Halaman konfigurasi sistem dan manajemen akun hanya dapat diakses oleh Administrator Sarpras SIMASET SEKOLAH.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            onClick={onGoBack}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Dashboard Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};
