import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { ActivePage } from '../../types';
import { db } from '../../services/db';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { ThemeToggle } from '../common/ThemeToggle';
import { UserAvatar } from '../common/UserAvatar';

interface HeaderProps {
  currentPage: ActivePage;
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenAI: () => void;
  onNavigate: (page: ActivePage) => void;
  onLogout?: () => void;
}

const pageTitles: Record<ActivePage, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Utama', subtitle: 'Ikhtisar sarana prasarana dan inventaris sekolah' },
  assets: { title: 'Data Aset Sekolah', subtitle: 'Pencatatan, rincian teknis, dan inventarisasi aset tetap' },
  'assets-new': { title: 'Tambah Aset Baru', subtitle: 'Registrasi unit barang inventaris baru' },
  'assets-detail': { title: 'Detail Paspor Aset', subtitle: 'Informasi lengkap dan histori aktivitas aset' },
  'assets-edit': { title: 'Ubah Data Aset', subtitle: 'Perbarui spesifikasi dan data kepemilikan aset' },
  inventory: { title: 'Barang Habis Pakai (ATK)', subtitle: 'Pengendalian stok, barang masuk, dan pengeluaran KBM' },
  rooms: { title: 'Inventaris Ruangan', subtitle: 'Daftar Inventaris Ruangan (DIR) dan penanggung jawab' },
  borrowings: { title: 'Sirkulasi Peminjaman', subtitle: 'Peminjaman dan pengembalian aset antar unit' },
  maintenance: { title: 'Pemeliharaan Aset', subtitle: 'Jadwal servis, perbaikan kerusakan, dan riwayat teknisi' },
  mutations: { title: 'Mutasi & Pemindahan', subtitle: 'Relokasi aset antar ruangan dan serah terima penanggung jawab' },
  disposals: { title: 'Penghapusan Aset', subtitle: 'Penghapusan barang rusak berat/tidak ekonomis secara akuntabel' },
  suppliers: { title: 'Direktori Supplier & Rekanan', subtitle: 'Daftar vendor penyedia barang dan histori pengadaan' },
  documents: { title: 'Manajemen Dokumen', subtitle: 'Pengarsipan BAST, invoice, faktur, dan bukti kepemilikan' },
  reports: { title: 'Laporan & Rekapitulasi', subtitle: 'Cetak resmi Buku Inventaris, DIR, dan rekap aset' },
  analytics: { title: 'Analisis Sarpras', subtitle: 'Pertumbuhan aset dan analisis belanja per tahun' },
  notifications: { title: 'Pusat Pemberitahuan', subtitle: 'Peringatan stok menipis, keterlambatan, dan perbaikan' },
  users: { title: 'Manajemen Pengguna', subtitle: 'Hak akses staf, guru, pengurus barang, dan kepala sekolah' },
  settings: { title: 'Pengaturan Sistem & Profil Sekolah', subtitle: 'Konfigurasi tema, kop surat, kode, dan cadangan data' },
  'audit-log': { title: 'Jejak Audit (Audit Trail)', subtitle: 'Histori aktivitas dan perubahan data sistem' },
  'qr-scanner': { title: 'Pemindai QR Code Kamera', subtitle: 'Pindai label aset fisik langsung via kamera browser' },
  'recycle-bin': { title: 'Arsip & Kotak Sampah', subtitle: 'Daftar data yang telah dihapus / soft delete' },
};

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onToggleSidebar,
  onOpenSearch,
  onOpenNotifications,
  onOpenAI,
  onNavigate,
  onLogout,
}) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const currentUser = db.getCurrentUser();
  const notifications = db.getNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const currentMeta = pageTitles[currentPage] || {
    title: 'SIMASET SEKOLAH',
    subtitle: 'Sistem Informasi Manajemen Aset Sekolah',
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {currentMeta.title}
          </h2>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 leading-none mt-0.5">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs transition"
          title="Pencarian cepat (Ctrl+K / Cmd+K)"
        >
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="hidden md:inline">Cari aset, ruangan, stok...</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded">
            ⌘K
          </kbd>
        </button>

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={onOpenAI}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 font-semibold text-xs transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span className="hidden sm:inline">Tanya AI</span>
        </button>

        {/* Theme Toggle (Light / Dark / System) */}
        <ThemeToggle variant="compact" />

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={onOpenNotifications}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition"
            title="Pusat Pemberitahuan"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition"
            aria-label="Menu Profil Pengguna"
          >
            <UserAvatar
              name={currentUser.name}
              avatarUrl={currentUser.profile_photo_url || currentUser.avatar}
              size="xs"
              showBorder={false}
            />
            <div className="hidden sm:block text-left">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate max-w-[130px]">
                {currentUser.name}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setProfileMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-40 animate-in fade-in zoom-in-95">
                {/* User Information */}
                <div className="px-4 py-3 flex items-center gap-3">
                  <UserAvatar
                    name={currentUser.name}
                    avatarUrl={currentUser.profile_photo_url || currentUser.avatar}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-mono">
                      ADMIN
                    </span>
                  </div>
                </div>

                {/* Divider Line */}
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                {/* Logout Button */}
                <div className="px-1.5 pt-0.5">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      if (onLogout) {
                        onLogout();
                      } else {
                        db.logout();
                      }
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Keluar dari Sistem (Logout)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
