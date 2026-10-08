import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Plus,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  Search,
  Eye,
  Edit,
  Trash2,
  Archive,
} from 'lucide-react';
import { Borrowing, Asset, AssetCondition } from '../../types';
import { db } from '../../services/db';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { BorrowStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const BorrowingList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);

  // Deletion states
  const [borrowingToDelete, setBorrowingToDelete] = useState<Borrowing | null>(null);
  const [activeDeleteBlocked, setActiveDeleteBlocked] = useState<Borrowing | null>(null);

  const [formData, setFormData] = useState({
    borrowingNumber: `PJ-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
    assetId: '',
    borrowerName: '',
    borrowerRole: 'Guru',
    borrowerRoom: 'Ruang Guru',
    borrowDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    purpose: '',
    conditionBefore: 'Baik' as AssetCondition,
    notes: '',
  });

  const [editData, setEditData] = useState({
    borrowerName: '',
    borrowerRole: '',
    borrowerRoom: '',
    expectedReturnDate: '',
    purpose: '',
    notes: '',
  });

  const [returnData, setReturnData] = useState({
    conditionAfter: 'Baik' as AssetCondition,
    actualReturnDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [formError, setFormError] = useState('');

  const activeBorrowings = db.getBorrowings(false);
  const deletedBorrowings = db.getDeletedBorrowings();
  const allAssets = db.getAssets(false);
  const availableAssets = allAssets.filter(a => a.status === 'Aktif' && a.condition !== 'Rusak Berat');

  const currentDataset = activeTab === 'active' ? activeBorrowings : deletedBorrowings;

  const filteredBorrowings = currentDataset.filter(b => {
    const q = searchQuery.toLowerCase().trim();
    const asset = db.getAssetById(b.assetId);
    return (
      !q ||
      b.borrowerName.toLowerCase().includes(q) ||
      b.borrowingNumber.toLowerCase().includes(q) ||
      b.purpose.toLowerCase().includes(q) ||
      (asset && (asset.name.toLowerCase().includes(q) || asset.code.toLowerCase().includes(q)))
    );
  });

  const handleOpenBorrow = () => {
    setFormData({
      borrowingNumber: `PJ-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      assetId: availableAssets[0]?.id || '',
      borrowerName: '',
      borrowerRole: 'Guru',
      borrowerRoom: 'Ruang Guru',
      borrowDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      purpose: '',
      conditionBefore: 'Baik',
      notes: '',
    });
    setFormError('');
    setBorrowModalOpen(true);
  };

  const handleOpenDetail = (b: Borrowing) => {
    setSelectedBorrowing(b);
    setDetailModalOpen(true);
  };

  const handleOpenEdit = (b: Borrowing) => {
    setSelectedBorrowing(b);
    setEditData({
      borrowerName: b.borrowerName,
      borrowerRole: b.borrowerRole,
      borrowerRoom: b.borrowerRoom || '',
      expectedReturnDate: b.expectedReturnDate,
      purpose: b.purpose,
      notes: b.notes || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBorrowing) return;
    const borrowing = db.getBorrowings(true).find(b => b.id === selectedBorrowing.id);
    if (borrowing) {
      Object.assign(borrowing, editData);
      db.notify();
    }
    setEditModalOpen(false);
  };

  const handleOpenReturn = (b: Borrowing) => {
    setSelectedBorrowing(b);
    setReturnData({
      conditionAfter: b.conditionBefore,
      actualReturnDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setReturnModalOpen(true);
  };

  const handleClickDelete = (b: Borrowing) => {
    if (b.status === 'Dipinjam' || b.status === 'Terlambat') {
      setActiveDeleteBlocked(b);
    } else {
      setBorrowingToDelete(b);
    }
  };

  const handleConfirmDelete = () => {
    if (!borrowingToDelete) return;
    db.softDeleteBorrowing(borrowingToDelete.id, 'Dihapus oleh pengguna');
    setBorrowingToDelete(null);
  };

  const handleRestore = (b: Borrowing) => {
    db.restoreBorrowing(b.id);
  };

  const handleSaveBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetId || !formData.borrowerName.trim()) {
      setFormError('Aset dan nama peminjam wajib diisi.');
      return;
    }

    try {
      db.addBorrowing({
        ...formData,
        status: 'Dipinjam',
        approvedBy: db.getCurrentUser().name,
      });
      setBorrowModalOpen(false);
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleSaveReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBorrowing) return;

    db.returnBorrowing(selectedBorrowing.id, returnData);
    setReturnModalOpen(false);
    setSelectedBorrowing(null);
  };

  const activeLoanCount = activeBorrowings.filter(b => b.status === 'Dipinjam' || b.status === 'Terlambat').length;
  const lateCount = activeBorrowings.filter(b => b.status === 'Terlambat').length;

  return (
    <div className="space-y-4">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Sedang Dipinjam</p>
            <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{activeLoanCount} Transaksi</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Keterlambatan Pengembalian</p>
            <h4 className={`text-xl font-bold mt-0.5 ${lateCount > 0 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {lateCount} Peminjaman
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Arsip Pengembalian</p>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {activeBorrowings.filter(b => b.status === 'Dikembalikan').length} Selesai
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'active'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sirkulasi Aktif ({activeBorrowings.length})
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'archive'
                ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Arsip Peminjaman ({deletedBorrowings.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari peminjam, nomor, aset..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          {activeTab === 'active' && (
            <button
              onClick={handleOpenBorrow}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Peminjaman Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">No. Pinjam</th>
                <th className="p-3">Aset Barang</th>
                <th className="p-3">Peminjam</th>
                <th className="p-3">Tgl Pinjam</th>
                <th className="p-3">Tenggat Kembali</th>
                <th className="p-3">Keperluan</th>
                <th className="p-3">Status</th>
                {activeTab === 'archive' && <th className="p-3">Waktu Dihapus</th>}
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredBorrowings.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'archive' ? 9 : 8} className="text-center py-10 text-slate-400 dark:text-slate-500">
                    <ArrowLeftRight className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-sm">
                      {activeTab === 'active' ? 'Tidak ada data peminjaman yang sesuai' : 'Tidak ada arsip peminjaman'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBorrowings.map(b => {
                  const asset = db.getAssetById(b.assetId);
                  const isBorrowed = b.status === 'Dipinjam' || b.status === 'Terlambat';

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 font-mono font-bold text-blue-700 dark:text-blue-400">{b.borrowingNumber}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{asset?.name || b.assetId}</span>
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{asset?.code}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">{b.borrowerName}</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">{b.borrowerRole} • {b.borrowerRoom}</span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{formatDate(b.borrowDate)}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 whitespace-nowrap font-medium">
                        {formatDate(b.expectedReturnDate)}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">{b.purpose}</td>
                      <td className="p-3 whitespace-nowrap">
                        <BorrowStatusBadge status={b.status} />
                      </td>

                      {activeTab === 'archive' && (
                        <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                          {formatDateTime(b.deletedAt)}
                        </td>
                      )}

                      <td className="p-3 text-center whitespace-nowrap">
                        {activeTab === 'active' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Action 1: Lihat */}
                            <button
                              onClick={() => handleOpenDetail(b)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
                              title="Lihat Detail Peminjaman"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Action 2: Edit */}
                            <button
                              onClick={() => handleOpenEdit(b)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition"
                              title="Edit Data Peminjaman"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Return Button if still borrowed */}
                            {isBorrowed && (
                              <button
                                onClick={() => handleOpenReturn(b)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                              >
                                Pengembalian
                              </button>
                            )}

                            {/* Action 3: Hapus */}
                            <button
                              onClick={() => handleClickDelete(b)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                              title="Hapus / Arsipkan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRestore(b)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Pulihkan</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning Dialog when attempting to delete an ACTIVE borrowing */}
      <Modal
        isOpen={Boolean(activeDeleteBlocked)}
        onClose={() => setActiveDeleteBlocked(null)}
        title="Peminjaman Masih Aktif"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                Data peminjaman yang masih aktif tidak dapat dihapus. Silakan lakukan pengembalian aset terlebih dahulu.
              </p>
              {activeDeleteBlocked && (
                <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-900 space-y-1 text-slate-700 dark:text-slate-300">
                  <p>Nomor: <strong>{activeDeleteBlocked.borrowingNumber}</strong></p>
                  <p>Peminjam: <strong>{activeDeleteBlocked.borrowerName}</strong></p>
                  <p>Status: <span className="font-bold text-rose-600 dark:text-rose-400">{activeDeleteBlocked.status}</span></p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setActiveDeleteBlocked(null)}
              className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl"
            >
              Mengerti
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog: Soft Delete for finished borrowing */}
      <ConfirmDialog
        isOpen={Boolean(borrowingToDelete)}
        title="Arsipkan Data Peminjaman?"
        message={`Apakah Anda yakin ingin mengarsipkan transaksi peminjaman ${borrowingToDelete?.borrowingNumber} (${borrowingToDelete?.borrowerName})? Histori transaksi tetap tersimpan di arsip.`}
        confirmLabel="Hapus Data"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setBorrowingToDelete(null)}
      />

      {/* Detail Peminjaman Modal (Lihat) */}
      {selectedBorrowing && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Detail Peminjaman: ${selectedBorrowing.borrowingNumber}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Peminjam:</span>
                <strong className="text-slate-900 dark:text-slate-100">{selectedBorrowing.borrowerName} ({selectedBorrowing.borrowerRole})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Unit / Ruangan:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedBorrowing.borrowerRoom || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Aset:</span>
                <strong className="text-blue-600 dark:text-blue-400">
                  {db.getAssetById(selectedBorrowing.assetId)?.name} ({db.getAssetById(selectedBorrowing.assetId)?.code})
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Tgl Pinjam:</span>
                <span className="text-slate-800 dark:text-slate-200">{formatDate(selectedBorrowing.borrowDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Rencana Kembali:</span>
                <span className="text-slate-800 dark:text-slate-200">{formatDate(selectedBorrowing.expectedReturnDate)}</span>
              </div>
              {selectedBorrowing.actualReturnDate && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Tanggal Realisasi Kembali:</span>
                  <span className="font-bold text-emerald-600">{formatDate(selectedBorrowing.actualReturnDate)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Kondisi Sebelum / Sesudah:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {selectedBorrowing.conditionBefore} → {selectedBorrowing.conditionAfter || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Keperluan:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedBorrowing.purpose}</span>
              </div>
              {selectedBorrowing.notes && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Catatan:</span>
                  <p className="text-slate-700 dark:text-slate-300">{selectedBorrowing.notes}</p>
                </div>
              )}
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

      {/* Edit Data Peminjaman Modal */}
      {selectedBorrowing && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Edit Peminjaman: ${selectedBorrowing.borrowingNumber}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Peminjam</label>
              <input
                type="text"
                required
                value={editData.borrowerName}
                onChange={e => setEditData({ ...editData, borrowerName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jabatan / Profesi</label>
                <input
                  type="text"
                  value={editData.borrowerRole}
                  onChange={e => setEditData({ ...editData, borrowerRole: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ruangan / Unit</label>
                <input
                  type="text"
                  value={editData.borrowerRoom}
                  onChange={e => setEditData({ ...editData, borrowerRoom: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tenggat Waktu Kembali</label>
              <input
                type="date"
                value={editData.expectedReturnDate}
                onChange={e => setEditData({ ...editData, expectedReturnDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Keperluan Penggunaan</label>
              <input
                type="text"
                value={editData.purpose}
                onChange={e => setEditData({ ...editData, purpose: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan</label>
              <textarea
                rows={2}
                value={editData.notes}
                onChange={e => setEditData({ ...editData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
              >
                Batal
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">
                Simpan Perubahan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Tambah Peminjaman */}
      <Modal isOpen={borrowModalOpen} onClose={() => setBorrowModalOpen(false)} title="Pencatatan Peminjaman Aset">
        <form onSubmit={handleSaveBorrow} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Peminjaman</label>
              <input
                type="text"
                value={formData.borrowingNumber}
                onChange={e => setFormData({ ...formData, borrowingNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Aset yang Tersedia</label>
              <select
                value={formData.assetId}
                onChange={e => setFormData({ ...formData, assetId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 font-bold"
              >
                {availableAssets.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.code} - {a.name} ({a.condition})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Peminjam</label>
              <input
                type="text"
                required
                placeholder="Contoh: Siti Rahmawati, S.Pd"
                value={formData.borrowerName}
                onChange={e => setFormData({ ...formData, borrowerName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jabatan / Profesi</label>
              <input
                type="text"
                placeholder="Guru Mapel / Staff TU / Siswa"
                value={formData.borrowerRole}
                onChange={e => setFormData({ ...formData, borrowerRole: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ruangan / Unit Kerja</label>
              <input
                type="text"
                placeholder="Ruang Guru / Lab"
                value={formData.borrowerRoom}
                onChange={e => setFormData({ ...formData, borrowerRoom: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Pinjam</label>
              <input
                type="date"
                value={formData.borrowDate}
                onChange={e => setFormData({ ...formData, borrowDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Rencana Tanggal Kembali</label>
              <input
                type="date"
                value={formData.expectedReturnDate}
                onChange={e => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Keperluan Penggunaan</label>
            <input
              type="text"
              required
              placeholder="Contoh: Media presentasi KBM di Aula"
              value={formData.purpose}
              onChange={e => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setBorrowModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
            >
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">
              Simpan Peminjaman
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Pengembalian Aset */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title={`Konfirmasi Pengembalian Aset: ${selectedBorrowing?.borrowingNumber}`}
      >
        <form onSubmit={handleSaveReturn} className="space-y-4 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
            <p>Peminjam: <strong>{selectedBorrowing?.borrowerName}</strong></p>
            <p>
              Aset: <strong>{db.getAssetById(selectedBorrowing?.assetId || '')?.name}</strong>
            </p>
            <p>Kondisi Saat Dipinjam: <strong className="text-emerald-700 dark:text-emerald-400">{selectedBorrowing?.conditionBefore}</strong></p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Realisasi Kembali</label>
              <input
                type="date"
                value={returnData.actualReturnDate}
                onChange={e => setReturnData({ ...returnData, actualReturnDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kondisi Fisik Pasca Pengembalian</label>
              <select
                value={returnData.conditionAfter}
                onChange={e => setReturnData({ ...returnData, conditionAfter: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 font-bold"
              >
                <option value="Baik">Baik (Lengkap & Berfungsi Normal)</option>
                <option value="Rusak Ringan">Rusak Ringan (Perlu Pembersihan / Servis Kecil)</option>
                <option value="Rusak Berat">Rusak Berat (Tidak Berfungsi)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan Pengembalian</label>
            <textarea
              rows={2}
              value={returnData.notes}
              onChange={e => setReturnData({ ...returnData, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Kelengkapan kabel, remote, fisik barang dsb..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setReturnModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
            >
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold">
              Konfirmasi Barang Diterima
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
