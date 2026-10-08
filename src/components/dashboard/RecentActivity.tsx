import React from 'react';
import {
  History,
  PlusCircle,
  Edit,
  Trash2,
  ArrowLeftRight,
  Wrench,
  Truck,
  Boxes,
  User,
  ArrowRight,
} from 'lucide-react';
import { db } from '../../services/db';
import { formatDateTime } from '../../utils/formatters';
import { ActivePage, AuditLog } from '../../types';

interface RecentActivityProps {
  onNavigate: (page: ActivePage) => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ onNavigate }) => {
  const logs = db.getAuditLogs().slice(0, 6);

  const getActionIcon = (action: AuditLog['action']) => {
    switch (action) {
      case 'CREATE':
        return <PlusCircle className="w-3.5 h-3.5 text-blue-600" />;
      case 'UPDATE':
        return <Edit className="w-3.5 h-3.5 text-emerald-600" />;
      case 'DELETE':
        return <Trash2 className="w-3.5 h-3.5 text-rose-600" />;
      case 'BORROW':
      case 'RETURN':
        return <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />;
      case 'MAINTENANCE':
        return <Wrench className="w-3.5 h-3.5 text-amber-600" />;
      case 'MUTATION':
        return <Truck className="w-3.5 h-3.5 text-purple-600" />;
      case 'STOCK_IN':
      case 'STOCK_OUT':
        return <Boxes className="w-3.5 h-3.5 text-teal-600" />;
      default:
        return <History className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Aktivitas Terkini</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Catatan jejak perubahan inventaris terbaru</p>
        </div>
        <button
          onClick={() => onNavigate('audit-log')}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
        >
          Lihat Semua <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="py-8 text-center text-slate-400 dark:text-slate-500">
          <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Belum ada riwayat aktivitas terbaru</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Semua tindakan penambahan dan perubahan data akan tercatat otomatis di sini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log, idx) => (
            <div key={log.id || idx} className="flex items-start gap-3 text-xs">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                  {log.details}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    {log.userName}
                  </span>
                  <span>•</span>
                  <span>{formatDateTime(log.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
