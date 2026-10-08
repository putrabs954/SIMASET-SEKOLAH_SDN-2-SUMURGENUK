import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  DoorOpen,
  ArrowLeftRight,
  Wrench,
  Truck,
  Trash2,
  Users2,
  FileText,
  FolderArchive,
  UserCheck,
  Settings,
  History,
  QrCode,
  Sparkles,
  X,
  Building2,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { ActivePage, UserRole } from '../../types';
import { db } from '../../services/db';
import { UserAvatar } from '../common/UserAvatar';
import { canAccessPage } from '../../services/auth';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface SidebarProps {
  currentPage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenAI: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
  onOpenAI,
  onLogout,
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const stats = db.getStats();
  const school = db.getSchool();
  const currentUser = db.getCurrentUser();

  const navItems: {
    id: ActivePage;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
    allowedRoles?: UserRole[];
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assets', label: 'Data Aset', icon: Package, badge: stats.totalAssets, badgeColor: 'bg-blue-100 text-blue-800' },
    {
      id: 'inventory',
      label: 'Barang Habis Pakai',
      icon: Boxes,
      badge: stats.lowStockCount > 0 ? `${stats.lowStockCount} Menipis` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700 animate-pulse',
    },
    { id: 'rooms', label: 'Inventaris Ruangan', icon: DoorOpen },
    {
      id: 'borrowings',
      label: 'Peminjaman',
      icon: ArrowLeftRight,
      badge: stats.lateBorrowings > 0 ? `${stats.lateBorrowings} Terlambat` : stats.activeBorrowings || undefined,
      badgeColor: stats.lateBorrowings > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700',
    },
    {
      id: 'maintenance',
      label: 'Pemeliharaan',
      icon: Wrench,
      badge: stats.inMaintenance || undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    { id: 'mutations', label: 'Mutasi Aset', icon: Truck },
    { id: 'disposals', label: 'Penghapusan', icon: Trash2 },
    { id: 'suppliers', label: 'Supplier', icon: Users2 },
    { id: 'reports', label: 'Laporan', icon: FileText },
    { id: 'documents', label: 'Dokumen', icon: FolderArchive },
    { id: 'qr-scanner', label: 'Scanner QR Kamera', icon: QrCode },
    { id: 'users', label: 'Pengguna', icon: UserCheck, allowedRoles: ['ADMIN', 'KEPALA_SEKOLAH'] },
    { id: 'audit-log', label: 'Audit Log', icon: History, allowedRoles: ['ADMIN', 'KEPALA_SEKOLAH', 'PENGURUS_BARANG'] },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-900/30 shrink-0 overflow-hidden p-1">
              {school.logoUrl ? (
                <img
                  src={school.logoUrl}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <Building2 className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-sm text-white tracking-wider truncate">
                SIMASET SEKOLAH
              </h1>
              <p className="text-[11px] text-blue-400 font-medium truncate">
                {school.name.replace('SMK NEGERI ', 'SMKN ')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Assistant Banner Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onOpenAI();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold text-xs shadow-md shadow-blue-950 transition group"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <span>ASSET AI ASSISTANT</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-blue-200 group-hover:translate-x-0.5 transition" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 text-xs font-medium">
          {navItems
            .filter(item => canAccessPage(item.id))
            .map(item => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.badgeColor || (isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>

        {/* Current User Card */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/30">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-800/50">
            <UserAvatar
              name={currentUser.name}
              avatarUrl={currentUser.profile_photo_url || currentUser.avatar}
              size="sm"
              showBorder={true}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <span className="inline-block text-[10px] text-blue-400 font-medium tracking-wide">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                title="Keluar dari sistem (Logout)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Apakah Anda yakin ingin keluar?"
        message="Sesi login aktif Anda akan diakhiri dan dialihkan kembali ke halaman Login SIMASET SEKOLAH."
        confirmLabel="Ya, Keluar"
        isDestructive={true}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout?.();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};
