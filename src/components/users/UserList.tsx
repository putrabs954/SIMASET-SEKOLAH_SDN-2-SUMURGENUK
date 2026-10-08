import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Power,
  RotateCcw,
  Search,
  Eye,
  Archive,
  Camera,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { db } from '../../services/db';
import { formatDateTime } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { UserAvatar } from '../common/UserAvatar';
import { ProfilePhotoCropModal, CroppedPhotoResult } from './ProfilePhotoCropModal';

export const UserList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  // Profile Photo state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<CroppedPhotoResult | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState(false);
  const [confirmDeletePhotoOpen, setConfirmDeletePhotoOpen] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    role: 'GURU' as UserRole,
    nip: '',
    phone: '',
    isActive: true,
  });

  const currentUser = db.getCurrentUser();
  const allUsers = db.getUsers(true);
  const activeUsers = allUsers.filter(u => u.isActive && !u.isDeleted);
  const inactiveUsers = allUsers.filter(u => !u.isActive || u.isDeleted);

  const displayedUsers = activeTab === 'active' ? activeUsers : inactiveUsers;

  const handleOpenAdd = () => {
    setUserToEdit(null);
    setPendingPhoto(null);
    setPhotoToDelete(false);
    setFormData({
      username: '',
      name: '',
      email: '',
      password: '',
      role: 'GURU',
      nip: '',
      phone: '',
      isActive: true,
    });
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleOpenDetail = (u: User) => {
    setSelectedUser(u);
    setDetailModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    // Permission check: only admin or the user themselves can edit
    if (currentUser.role !== 'ADMIN' && currentUser.id !== u.id) {
      setErrorToast('Anda hanya memiliki izin untuk mengubah profil akun Anda sendiri!');
      setTimeout(() => setErrorToast(''), 3500);
      return;
    }

    setUserToEdit(u);
    setPendingPhoto(null);
    setPhotoToDelete(false);
    setFormData({
      username: u.username,
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      nip: u.nip || '',
      phone: u.phone || '',
      isActive: u.isActive,
    });
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.name.trim()) return;

    // Prepare photo payload if changed
    const photoPayload = pendingPhoto
      ? {
          avatar: pendingPhoto.url,
          profile_photo_url: pendingPhoto.url,
          profile_photo_filename: pendingPhoto.filename,
          profile_photo_size: pendingPhoto.size,
          profile_photo_type: pendingPhoto.type,
          profile_photo_updated_at: pendingPhoto.updatedAt,
        }
      : photoToDelete
      ? {
          avatar: '',
          profile_photo_url: '',
          profile_photo_filename: '',
          profile_photo_size: 0,
          profile_photo_type: '',
          profile_photo_updated_at: new Date().toISOString(),
        }
      : {};

    const userPayload: any = {
      username: formData.username.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      nip: formData.nip.trim(),
      phone: formData.phone.trim(),
      isActive: formData.isActive,
      ...photoPayload,
    };

    if (formData.password.trim()) {
      userPayload.password = formData.password.trim();
      userPayload.mustChangePassword = formData.password.trim() === 'admin123';
    } else if (!userToEdit) {
      userPayload.mustChangePassword = true;
    }

    try {
      if (userToEdit) {
        db.updateUser(userToEdit.id, userPayload);
        setSuccessToast('Data pengguna & foto profil berhasil diperbarui.');
      } else {
        db.addUser(userPayload);
        setSuccessToast('Pengguna baru berhasil ditambahkan.');
      }
      setModalOpen(false);
      setPendingPhoto(null);
      setPhotoToDelete(false);
      setTimeout(() => setSuccessToast(''), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan data pengguna.');
    }
  };

  // Toggle active/inactive
  const handleToggleActive = (u: User) => {
    const res = db.setUserActiveStatus(u.id, !u.isActive);
    if (!res.success && res.message) {
      setErrorToast(res.message);
      setTimeout(() => setErrorToast(''), 3500);
    }
  };

  // Soft delete confirmation
  const handleConfirmDeactivate = () => {
    if (!userToDeactivate) return;
    const res = db.softDeleteUser(userToDeactivate.id);
    if (!res.success && res.message) {
      setErrorToast(res.message);
      setTimeout(() => setErrorToast(''), 3500);
    }
    setUserToDeactivate(null);
  };

  // Restore/Reactivate
  const handleRestoreUser = (u: User) => {
    db.restoreUser(u.id);
  };

  const roleBadges: Record<UserRole, string> = {
    ADMIN: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    KEPALA_SEKOLAH: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    PENGURUS_BARANG: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    BENDAHARA: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    GURU: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    STAFF: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
  };

  // Calculate current avatar URL for preview in Edit Form
  const originalPhoto = userToEdit ? userToEdit.profile_photo_url || userToEdit.avatar : null;
  const currentPhotoForEdit = photoToDelete
    ? null
    : pendingPhoto
    ? pendingPhoto.url
    : originalPhoto;

  const hasPhotoAvailable = Boolean(currentPhotoForEdit);

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 p-3.5 bg-emerald-600 text-white rounded-2xl shadow-xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {errorToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 p-3.5 bg-rose-600 text-white rounded-2xl shadow-xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Manajemen Pengguna & Hak Akses</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola akun staf, pengurus barang, guru, kepala sekolah, dan foto profil pengguna di SIMASET
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama, username, NIP..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'active'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pengguna Aktif ({activeUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === 'inactive'
                  ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Nonaktif ({inactiveUsers.length})</span>
            </button>
          </div>

          {activeTab === 'active' && currentUser.role === 'ADMIN' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pengguna</span>
            </button>
          )}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedUsers.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-sm">
              {activeTab === 'active' ? 'Tidak ada pengguna aktif' : 'Tidak ada pengguna yang dinonaktifkan'}
            </p>
          </div>
        ) : (
          displayedUsers.map(u => {
            const isSelf = u.id === currentUser.id;
            const canEdit = currentUser.role === 'ADMIN' || isSelf;

            return (
              <div
                key={u.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Interactive circular user avatar */}
                      <UserAvatar
                        name={u.name}
                        avatarUrl={u.profile_photo_url || u.avatar}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{u.name}</h4>
                          {isSelf && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold">
                              Anda
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">@{u.username}</p>
                      </div>
                    </div>

                    {/* Actions: Lihat, Ubah, Hapus */}
                    <div className="flex items-center gap-1">
                      {/* Action 1: Lihat */}
                      <button
                        onClick={() => handleOpenDetail(u)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Lihat Detail Pengguna"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Action 2: Ubah */}
                      {canEdit && (
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Ubah Data & Foto Profil"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Action 3: Hapus / Nonaktifkan */}
                      {activeTab === 'active' && !isSelf && currentUser.role === 'ADMIN' && (
                        <button
                          onClick={() => setUserToDeactivate(u)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                          title="Hapus / Nonaktifkan Pengguna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between items-center">
                      <span>Peran:</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${roleBadges[u.role]}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </div>
                    {u.nip && (
                      <div className="flex justify-between">
                        <span>NIP:</span>
                        <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">{u.nip}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="text-[11px] text-slate-800 dark:text-slate-200">{u.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Status Akun:</span>
                      <span
                        className={`font-bold text-[11px] ${
                          u.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {u.isActive ? 'Aktif' : 'Dinonaktifkan'}
                      </span>
                    </div>
                    {u.mustChangePassword && (
                      <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg text-[10px] text-amber-700 dark:text-amber-300 font-bold">
                        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>Password Default (Perlu Diubah)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action: Toggle Aktifkan / Nonaktifkan */}
                {currentUser.role === 'ADMIN' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {u.isActive ? (
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={isSelf}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <Power className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isSelf ? 'Akun Anda Saat Ini' : 'Nonaktifkan Akun'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestoreUser(u)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Aktifkan Kembali Akun</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Dialog: Nonaktifkan Pengguna */}
      <ConfirmDialog
        isOpen={Boolean(userToDeactivate)}
        title="Apakah Anda yakin ingin menonaktifkan pengguna ini?"
        confirmLabel="Nonaktifkan"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setUserToDeactivate(null)}
      >
        {userToDeactivate && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Nama:</span>
              <strong className="text-slate-900 dark:text-slate-100 font-bold">{userToDeactivate.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Username/email:</span>
              <span className="text-slate-800 dark:text-slate-200 font-mono">
                {userToDeactivate.username} / {userToDeactivate.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Role:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{userToDeactivate.role}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
              *Pengguna yang dinonaktifkan tidak akan dapat login atau membuat transaksi baru, namun histori audit dan data
              transaksinya tetap tersimpan utuh di sistem.
            </p>
          </div>
        )}
      </ConfirmDialog>

      {/* Confirmation Dialog: Hapus Foto Profil */}
      <ConfirmDialog
        isOpen={confirmDeletePhotoOpen}
        title="Apakah Anda yakin ingin menghapus foto profil?"
        confirmLabel="Hapus Foto"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={() => {
          setPhotoToDelete(true);
          setPendingPhoto(null);
          setConfirmDeletePhotoOpen(false);
        }}
        onCancel={() => setConfirmDeletePhotoOpen(false)}
      >
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Foto profil akan dihapus dan akun ini akan kembali menggunakan avatar inisial default. Perubahan akan disimpan saat Anda
          menekan tombol Simpan Perubahan.
        </p>
      </ConfirmDialog>

      {/* Detail Pengguna Modal (Lihat) */}
      {selectedUser && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Detail Pengguna: ${selectedUser.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                <UserAvatar
                  name={selectedUser.name}
                  avatarUrl={selectedUser.profile_photo_url || selectedUser.avatar}
                  size="xl"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{selectedUser.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">@{selectedUser.username}</p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                      roleBadges[selectedUser.role]
                    }`}
                  >
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">NIP:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{selectedUser.nip || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Email:</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Telepon / WhatsApp:</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedUser.phone || '-'}</span>
                </div>
                {selectedUser.profile_photo_filename && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">File Foto:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                      {selectedUser.profile_photo_filename} ({Math.round((selectedUser.profile_photo_size || 0) / 1024)} KB)
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Status Akun:</span>
                  <span
                    className={`font-bold ${
                      selectedUser.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {selectedUser.isActive ? 'Aktif' : 'Dinonaktifkan / Dihapus'}
                  </span>
                </div>
                {selectedUser.deletedAt && (
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>Waktu Dinonaktifkan:</span>
                    <span>{formatDateTime(selectedUser.deletedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Tambah / Edit Pengguna (DENGAN BAGIAN FOTO PROFIL LENGKAP) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setPendingPhoto(null);
          setPhotoToDelete(false);
          setModalOpen(false);
        }}
        title={userToEdit ? 'Ubah Data Pengguna' : 'Pendaftaran Pengguna Baru'}
        subtitle={userToEdit ? `Kelola rincian akun dan foto profil @${userToEdit.username}` : 'Daftarkan pengguna baru di SIMASET'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveUser} className="space-y-4 text-xs text-slate-900 dark:text-slate-100">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. SEKSI FOTO PROFIL SESUAI BRIEF */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Foto Profil
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Circular Avatar Preview */}
              <div className="relative group shrink-0">
                <UserAvatar
                  name={formData.name || 'Pengguna'}
                  avatarUrl={currentPhotoForEdit}
                  size="2xl"
                  showBorder={true}
                />
              </div>

              {/* Actions & Status */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                {pendingPhoto && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 animate-pulse">
                    ✓ Foto Baru Terpilih ({pendingPhoto.filename}) — Belum disimpan
                  </span>
                )}

                {photoToDelete && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    ✕ Foto akan dihapus saat Anda menekan tombol Simpan Perubahan
                  </span>
                )}

                {!pendingPhoto && !photoToDelete && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Gunakan foto berformat PNG, JPG, JPEG, atau WEBP (rasio 1:1 lingkaran, maks. 5 MB).
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCropModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{hasPhotoAvailable ? 'Ganti Foto' : 'Upload Foto'}</span>
                  </button>

                  {hasPhotoAvailable && !photoToDelete && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeletePhotoOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-bold text-xs transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Foto</span>
                    </button>
                  )}

                  {(pendingPhoto || photoToDelete) && (
                    <button
                      type="button"
                      onClick={() => {
                        setPendingPhoto(null);
                        setPhotoToDelete(false);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. FIELD DATA PENGGUNA */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap & Gelar</label>
            <input
              type="text"
              required
              placeholder="Contoh: Drs. H. Ahmad Sudrajat, M.Pd"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Username Login</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold"
                placeholder="nama.pengguna"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Email Resmi</label>
              <input
                type="email"
                required
                placeholder="user@sekolah.sch.id"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                placeholder="081234567890"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">NIP (Nomor Induk Pegawai)</label>
              <input
                type="text"
                placeholder="19850914 201001 1 012"
                value={formData.nip}
                onChange={e => setFormData({ ...formData, nip: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {userToEdit ? 'Ganti Kata Sandi (Opsional)' : 'Kata Sandi / Password'}
            </label>
            <input
              type="text"
              placeholder={userToEdit ? 'Kosongkan jika tidak ingin mengubah kata sandi' : 'Default: admin123 (atau tentukan kata sandi)'}
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {userToEdit
                ? 'Isi jika Anda ingin mereset password akun pengguna ini.'
                : 'Jika dikosongkan, sistem akan otomatis menetapkan password bawaan: admin123.'}
            </p>
            <div className="p-2.5 mt-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-semibold">Kebijakan Keamanan Sandi:</p>
                <p className="text-amber-700 dark:text-amber-400/90">
                  Password default pengguna baru tidak boleh menjadi password permanen. Pengguna wajib segera mengganti kata sandi saat pertama kali masuk ke sistem.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Peran / Role Pengguna</label>
              <select
                value={formData.role}
                disabled={currentUser.role !== 'ADMIN' && Boolean(userToEdit)}
                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold disabled:opacity-60"
              >
                <option value="ADMIN">ADMIN (Hak Akses Penuh)</option>
                <option value="KEPALA_SEKOLAH">KEPALA SEKOLAH (Persetujuan & Laporan)</option>
                <option value="PENGURUS_BARANG">PENGURUS BARANG (Sarpras & BHP)</option>
                <option value="BENDAHARA">BENDAHARA (Keuangan & Anggaran)</option>
                <option value="GURU">GURU (Katalog & Peminjaman)</option>
                <option value="STAFF">STAFF (Penggunaan ATK / TU)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status Akun</label>
              <select
                value={formData.isActive ? 'true' : 'false'}
                disabled={currentUser.role !== 'ADMIN' && Boolean(userToEdit)}
                onChange={e => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold disabled:opacity-60"
              >
                <option value="true">Aktif (Dapat Login & Beraktivitas)</option>
                <option value="false">Nonaktif (Akses Masuk Dinonaktifkan)</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setPendingPhoto(null);
                setPhotoToDelete(false);
                setModalOpen(false);
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-900/20 transition"
            >
              {userToEdit ? 'Simpan Perubahan' : 'Simpan Pengguna'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CROP & ZOOM & ROTATE PHOTO MODAL */}
      <ProfilePhotoCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        initialImageUrl={currentPhotoForEdit}
        onApply={result => {
          setPendingPhoto(result);
          setPhotoToDelete(false);
        }}
      />
    </div>
  );
};
