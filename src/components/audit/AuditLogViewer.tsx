import React, { useState } from 'react';
import {
  History,
  Search,
  Download,
} from 'lucide-react';
import { db } from '../../services/db';
import { formatDateTime, exportToCsv } from '../../utils/formatters';
import { UserAvatar } from '../common/UserAvatar';

export const AuditLogViewer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const auditLogs = db.getAuditLogs();
  const allUsers = db.getUsers(true);

  const filteredLogs = auditLogs.filter(log => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      log.details.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q);
    const matchAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  const handleExportLogs = () => {
    const headers = ['Waktu', 'Pengguna', 'Peran', 'Aksi', 'Entitas', 'Rincian Perubahan'];
    const rows = filteredLogs.map(l => [
      formatDateTime(l.timestamp),
      l.userName,
      l.userRole,
      l.action,
      l.entity,
      l.details,
    ]);
    exportToCsv(`Audit_Log_SIMASET_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Jejak Audit Sistem (Audit Trail)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rekaman permanen seluruh transaksi, modifikasi foto profil, aset, peminjaman, dan mutasi
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition"
        >
          <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Ekspor Log (CSV)</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-colors">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari aktivitas, nama pengguna..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-500 dark:text-slate-400 font-semibold">Tipe Aksi:</span>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
          >
            <option value="ALL">Semua Aksi</option>
            <option value="CREATE">CREATE (Tambah)</option>
            <option value="UPDATE">UPDATE (Edit / Foto)</option>
            <option value="DELETE">DELETE (Hapus)</option>
            <option value="BORROW">BORROW (Pinjam)</option>
            <option value="RETURN">RETURN (Kembali)</option>
            <option value="MAINTENANCE">MAINTENANCE (Servis)</option>
            <option value="MUTATION">MUTATION (Mutasi)</option>
            <option value="STOCK_IN">STOCK_IN (Barang Masuk)</option>
            <option value="STOCK_OUT">STOCK_OUT (Barang Keluar)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Waktu</th>
                <th className="p-3">Pengguna & Peran</th>
                <th className="p-3">Aksi</th>
                <th className="p-3">Entitas</th>
                <th className="p-3">Rincian Perubahan Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredLogs.map(log => {
                const authorUser = allUsers.find(u => u.id === log.userId || u.name === log.userName);

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          name={log.userName}
                          avatarUrl={authorUser?.profile_photo_url || authorUser?.avatar}
                          size="xs"
                          showBorder={false}
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 block leading-tight">
                            {log.userName}
                          </span>
                          <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">
                            {log.userRole}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-300">
                      {log.entity}
                    </td>
                    <td className="p-3 text-slate-800 dark:text-slate-200 leading-snug whitespace-pre-line">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
