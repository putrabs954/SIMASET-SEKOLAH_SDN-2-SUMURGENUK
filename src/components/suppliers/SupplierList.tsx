import React, { useState } from 'react';
import {
  Plus,
  Phone,
  MapPin,
  Search,
  CheckCircle2,
  X,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { Supplier } from '../../types';
import { db } from '../../services/db';
import { formatRupiah } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const SupplierList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [supplierConnectedCount, setSupplierConnectedCount] = useState(0);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    npwp: '',
    nib: '',
    picName: '',
    notes: '',
  });

  const suppliers = db.getSuppliers();
  const allAssets = db.getAssets(false);
  const stockItems = db.getStockItems(false);
  const stockTransactions = db.getStockTransactions();

  const filteredSuppliers = suppliers.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.picName.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      (s.address && s.address.toLowerCase().includes(q))
    );
  });

  const showNotification = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(prev => (prev === message ? null : prev));
    }, 4000);
  };

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      npwp: '',
      nib: '',
      picName: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      address: supplier.address || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      npwp: supplier.npwp || '',
      nib: supplier.nib || '',
      picName: supplier.picName || '',
      notes: supplier.notes || '',
    });
    setModalOpen(true);
  };

  const handleOpenDelete = (supplier: Supplier) => {
    setSupplierToDelete(supplier);

    // Calculate connected data
    const assetCount = allAssets.filter(a => a.supplierId === supplier.id).length;
    const stockCount = stockItems.filter(item => item.supplierId === supplier.id).length;
    const trxCount = stockTransactions.filter(t => t.supplierId === supplier.id).length;
    setSupplierConnectedCount(assetCount + stockCount + trxCount);

    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!supplierToDelete) return;

    db.deleteSupplier(supplierToDelete.id);
    setDeleteDialogOpen(false);
    setSupplierToDelete(null);

    // Display required success notification
    showNotification('✅ Supplier berhasil dihapus.');
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.picName.trim()) return;

    if (editingSupplier) {
      db.updateSupplier(editingSupplier.id, formData);
      setModalOpen(false);
      setEditingSupplier(null);
      showNotification('✅ Data supplier berhasil diperbarui.');
    } else {
      db.addSupplier(formData);
      setModalOpen(false);
      showNotification('✅ Supplier baru berhasil ditambahkan.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Direktori Rekanan &amp; Supplier Sekolah
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Penyedia barang sarana prasarana, nomor kontak PIC, NPWP, dan histori pengadaan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama supplier, PIC..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Supplier</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredSuppliers.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {searchQuery ? 'Tidak ada supplier yang cocok' : 'Belum Ada Supplier / Rekanan'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {searchQuery
                ? `Tidak ditemukan supplier dengan kata kunci "${searchQuery}". Coba kata kunci lainnya.`
                : 'Daftarkan rekanan penyedia sarana prasarana dan ATK untuk memudahkan pendataan pengadaan aset.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Supplier Baru</span>
            </button>
          )}
        </div>
      )}

      {/* Grid of Suppliers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSuppliers.map(s => {
          const suppliedAssets = allAssets.filter(a => a.supplierId === s.id);
          const totalSpent = suppliedAssets.reduce(
            (sum, a) => sum + a.acquisitionPrice * (a.quantity || 1),
            0
          );

          return (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug truncate">
                      {s.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{s.address || 'Alamat belum diisi'}</span>
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 shrink-0">
                    {suppliedAssets.length} Pengadaan
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">
                      Kontak PIC / Sales:
                    </span>
                    <strong className="text-slate-800 dark:text-slate-200 block truncate">
                      {s.picName}
                    </strong>
                    <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] truncate flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{s.phone || '-'}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">
                      NPWP / NIB:
                    </span>
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 block truncate">
                      {s.npwp || '-'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                      NIB: {s.nib || '-'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Total Belanja Pengadaan:</span>
                  <strong className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                    {formatRupiah(totalSpent)}
                  </strong>
                </div>

                {s.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    Catatan: {s.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons: Edit | Hapus */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(s)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 font-bold text-xs transition border border-slate-200 dark:border-slate-700"
                >
                  <span>✏️ Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenDelete(s)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs transition border border-rose-200 dark:border-rose-900/60"
                >
                  <span>🗑️ Hapus</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Supplier */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSupplier(null);
        }}
        title={editingSupplier ? 'Ubah Data Rekanan / Supplier' : 'Pendaftaran Rekanan / Supplier Baru'}
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4 text-xs text-slate-900 dark:text-slate-100">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Perusahaan / Rekanan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: PT. Mitra Edukasi Nusantara"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Kantor / Toko
            </label>
            <input
              type="text"
              placeholder="Jl. Raya No..."
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama PIC / Sales Person <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nama kontak representatif"
                value={formData.picName}
                onChange={e => setFormData({ ...formData, picName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                placeholder="0812..."
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Pokok Wajib Pajak (NPWP)
              </label>
              <input
                type="text"
                placeholder="01.234.567.8-000.000"
                value={formData.npwp}
                onChange={e => setFormData({ ...formData, npwp: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Induk Berusaha (NIB)
              </label>
              <input
                type="text"
                placeholder="912000..."
                value={formData.nib}
                onChange={e => setFormData({ ...formData, nib: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Layanan &amp; Spesialisasi
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Penyedia perlengkapan IT, garansi resmi 2 tahun..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setEditingSupplier(null);
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition"
            >
              {editingSupplier ? 'Simpan Perubahan' : 'Simpan Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog: Hapus Supplier */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="⚠️ Hapus Supplier?"
        message={`Apakah Anda yakin ingin menghapus supplier/rekanan "${supplierToDelete?.name || ''}"? Data supplier yang dihapus tidak dapat dikembalikan.`}
        confirmLabel="Hapus Supplier"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSupplierToDelete(null);
        }}
      >
        {supplierConnectedCount > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Perhatian: Terhubung dengan {supplierConnectedCount} Data</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
              Supplier ini tercatat pada riwayat inventaris/transaksi sekolah. Menghapus supplier ini <strong>tidak akan menghapus</strong> data aset atau transaksi terkait Anda secara otomatis.
            </p>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
};
