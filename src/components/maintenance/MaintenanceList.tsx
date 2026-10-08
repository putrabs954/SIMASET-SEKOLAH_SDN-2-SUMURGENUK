import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  CheckCircle2,
  Clock,
  Coins,
  Search,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Archive,
} from 'lucide-react';
import { Maintenance, Asset, AssetCondition } from '../../types';
import { db } from '../../services/db';
import { formatRupiah, formatDate, formatDateTime } from '../../utils/formatters';
import { MaintenanceStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const MaintenanceList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState<Maintenance | null>(null);

  const [formData, setFormData] = useState({
    maintenanceNumber: `MT-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
    assetId: '',
    date: new Date().toISOString().split('T')[0],
    damageType: '',
    vendorName: '',
    cost: 0,
    fundingSource: 'BOS Reguler',
    notes: '',
  });

  const [editData, setEditData] = useState({
    damageType: '',
    vendorName: '',
    cost: 0,
    fundingSource: '',
    notes: '',
  });

  const [completeData, setCompleteData] = useState({
    actionTaken: '',
    cost: 0,
    completionDate: new Date().toISOString().split('T')[0],
    conditionResult: 'Baik' as AssetCondition,
    notes: '',
  });

  const activeMaintenances = db.getMaintenances(false);
  const deletedMaintenances = db.getDeletedMaintenances();
  const allAssets = db.getAssets(false);

  const currentDataset = activeTab === 'active' ? activeMaintenances : deletedMaintenances;

  const filteredMaintenances = currentDataset.filter(m => {
    const q = searchQuery.toLowerCase().trim();
    const asset = db.getAssetById(m.assetId);
    return (
      !q ||
      m.maintenanceNumber.toLowerCase().includes(q) ||
      m.damageType.toLowerCase().includes(q) ||
      m.vendorName.toLowerCase().includes(q) ||
      (asset && (asset.name.toLowerCase().includes(q) || asset.code.toLowerCase().includes(q)))
    );
  });

  const handleOpenAdd = () => {
    setFormData({
      maintenanceNumber: `MT-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      assetId: allAssets[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      damageType: '',
      vendorName: '',
      cost: 0,
      fundingSource: 'BOS Reguler',
      notes: '',
    });
    setAddModalOpen(true);
  };

  const handleOpenDetail = (m: Maintenance) => {
    setSelectedMaintenance(m);
    setDetailModalOpen(true);
  };

  const handleOpenEdit = (m: Maintenance) => {
    setSelectedMaintenance(m);
    setEditData({
      damageType: m.damageType,
      vendorName: m.vendorName,
      cost: m.cost || 0,
      fundingSource: m.fundingSource,
      notes: m.notes || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaintenance) return;
    const m = db.getMaintenances(true).find(item => item.id === selectedMaintenance.id);
    if (m) {
      Object.assign(m, editData);
      db.notify();
    }
    setEditModalOpen(false);
  };

  const handleOpenComplete = (m: Maintenance) => {
    setSelectedMaintenance(m);
    setCompleteData({
      actionTaken: m.actionTaken || '',
      cost: m.cost || 0,
      completionDate: new Date().toISOString().split('T')[0],
      conditionResult: 'Baik',
      notes: m.notes || '',
    });
    setCompleteModalOpen(true);
  };

  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetId || !formData.damageType.trim() || !formData.vendorName.trim()) return;

    db.addMaintenance({
      ...formData,
      status: 'Diproses',
    });
    setAddModalOpen(false);
  };

  const handleSaveComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaintenance) return;

    db.completeMaintenance(selectedMaintenance.id, completeData);
    setCompleteModalOpen(false);
    setSelectedMaintenance(null);
  };

  const handleConfirmDelete = () => {
    if (!maintenanceToDelete) return;
    db.softDeleteMaintenance(maintenanceToDelete.id, 'Dihapus oleh pengguna');
    setMaintenanceToDelete(null);
  };

  const handleRestore = (m: Maintenance) => {
    db.restoreMaintenance(m.id);
  };

  const totalCost = activeMaintenances.reduce((sum, m) => sum + (m.cost || 0), 0);
  const pendingCount = activeMaintenances.filter(m => m.status === 'Diproses').length;

  const assetToDelete = maintenanceToDelete ? db.getAssetById(maintenanceToDelete.assetId) : undefined;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'active'
                ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pemeliharaan Aktif ({activeMaintenances.length})
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
            <span>Arsip Servis ({deletedMaintenances.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari kerusakan, vendor..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          {activeTab === 'active' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Servis / Perbaikan</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Sedang Dalam Servis / Perbaikan</p>
            <h4 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{pendingCount} Unit Aset</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Biaya Pemeliharaan Realisasi</p>
            <h4 className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">{formatRupiah(totalCost)}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">No. Servis</th>
                <th className="p-3">Tanggal Lapor</th>
                <th className="p-3">Aset Terkait</th>
                <th className="p-3">Jenis Kerusakan</th>
                <th className="p-3">Vendor Rekanan</th>
                <th className="p-3 text-right">Biaya Servis</th>
                <th className="p-3">Status</th>
                {activeTab === 'archive' && <th className="p-3">Waktu Dihapus</th>}
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredMaintenances.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'archive' ? 9 : 8} className="text-center py-10 text-slate-400 dark:text-slate-500">
                    <Wrench className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-sm">
                      {activeTab === 'active' ? 'Belum ada catatan pemeliharaan yang sesuai' : 'Tidak ada arsip pemeliharaan'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMaintenances.map(m => {
                  const asset = db.getAssetById(m.assetId);
                  const isPending = m.status === 'Diproses';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 font-mono font-bold text-amber-700 dark:text-amber-400">{m.maintenanceNumber}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{formatDate(m.date)}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{asset?.name || m.assetId}</span>
                        <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">{asset?.code}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{m.damageType}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{m.vendorName}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        {m.cost ? formatRupiah(m.cost) : '-'}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <MaintenanceStatusBadge status={m.status} />
                      </td>

                      {activeTab === 'archive' && (
                        <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                          {formatDateTime(m.deletedAt)}
                        </td>
                      )}

                      <td className="p-3 text-center whitespace-nowrap">
                        {activeTab === 'active' ? (
                          <div className="flex items-center justify-center gap-1">
                            {/* Action 1: Lihat */}
                            <button
                              onClick={() => handleOpenDetail(m)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
                              title="Lihat Detail Servis"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Action 2: Edit */}
                            <button
                              onClick={() => handleOpenEdit(m)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition"
                              title="Edit Data Servis"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Complete Action Button if in progress */}
                            {isPending && (
                              <button
                                onClick={() => handleOpenComplete(m)}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                              >
                                Selesai Servis
                              </button>
                            )}

                            {/* Action 3: Hapus */}
                            <button
                              onClick={() => setMaintenanceToDelete(m)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                              title="Hapus Catatan Servis"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRestore(m)}
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

      {/* Confirmation Dialog: Soft Delete Maintenance */}
      <ConfirmDialog
        isOpen={Boolean(maintenanceToDelete)}
        title="Apakah Anda yakin ingin menghapus catatan servis ini?"
        confirmLabel="Hapus Pemeliharaan"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setMaintenanceToDelete(null)}
      >
        {maintenanceToDelete && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Nomor Servis:</span>
              <span className="font-mono font-bold text-amber-600">{maintenanceToDelete.maintenanceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Aset Terkait:</span>
              <strong className="text-slate-900 dark:text-slate-100">{assetToDelete?.name} ({assetToDelete?.code})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Kerusakan:</span>
              <span className="text-slate-800 dark:text-slate-200">{maintenanceToDelete.damageType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Vendor:</span>
              <span className="text-slate-800 dark:text-slate-200">{maintenanceToDelete.vendorName}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
              *Data riwayat tetap tersimpan di database dan tercatat pada audit log.
            </p>
          </div>
        )}
      </ConfirmDialog>

      {/* Detail Maintenance Modal (Lihat) */}
      {selectedMaintenance && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Detail Pemeliharaan: ${selectedMaintenance.maintenanceNumber}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Aset Terkait:</span>
                <strong className="text-blue-600 dark:text-blue-400">
                  {db.getAssetById(selectedMaintenance.assetId)?.name} ({db.getAssetById(selectedMaintenance.assetId)?.code})
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Tanggal Servis:</span>
                <span className="text-slate-800 dark:text-slate-200">{formatDate(selectedMaintenance.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Vendor / Teknisi:</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{selectedMaintenance.vendorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Jenis Kerusakan:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedMaintenance.damageType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Tindakan Perbaikan:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedMaintenance.actionTaken || 'Dalam proses perbaikan'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Biaya Servis:</span>
                <span className="font-mono font-bold text-emerald-600">{formatRupiah(selectedMaintenance.cost || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Sumber Biaya:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedMaintenance.fundingSource}</span>
              </div>
              {selectedMaintenance.notes && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Catatan Tambahan:</span>
                  <p className="text-slate-700 dark:text-slate-300">{selectedMaintenance.notes}</p>
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

      {/* Edit Data Servis Modal */}
      {selectedMaintenance && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Edit Pemeliharaan: ${selectedMaintenance.maintenanceNumber}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis Kerusakan / Keluhan</label>
              <input
                type="text"
                required
                value={editData.damageType}
                onChange={e => setEditData({ ...editData, damageType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Vendor / Teknisi</label>
                <input
                  type="text"
                  required
                  value={editData.vendorName}
                  onChange={e => setEditData({ ...editData, vendorName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Estimasi / Biaya (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={editData.cost}
                  onChange={e => setEditData({ ...editData, cost: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sumber Pembiayaan</label>
              <select
                value={editData.fundingSource}
                onChange={e => setEditData({ ...editData, fundingSource: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800"
              >
                <option value="BOS Reguler">BOS Reguler</option>
                <option value="BOS Kinerja">BOS Kinerja</option>
                <option value="Komite Sekolah">Komite Sekolah</option>
                <option value="Garansi Resmi">Garansi Resmi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
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

      {/* Modal: Tambah Servis Baru */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Pencatatan Servis / Pemeliharaan Sarpras">
        <form onSubmit={handleSaveMaintenance} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Pemeliharaan</label>
              <input
                type="text"
                value={formData.maintenanceNumber}
                onChange={e => setFormData({ ...formData, maintenanceNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Mulai Servis</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Aset yang Diservis</label>
            <select
              value={formData.assetId}
              onChange={e => setFormData({ ...formData, assetId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 font-bold"
            >
              {allAssets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.code} - {a.name} ({a.condition})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis Kerusakan / Permasalahan</label>
            <input
              type="text"
              required
              placeholder="Contoh: Lampu proyektor redup dan mati total"
              value={formData.damageType}
              onChange={e => setFormData({ ...formData, damageType: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Vendor Rekanan / Teknisi</label>
              <input
                type="text"
                required
                placeholder="Contoh: CV. Mandiri Teknik IT"
                value={formData.vendorName}
                onChange={e => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Estimasi Biaya Awal (Rp)</label>
              <input
                type="number"
                min="0"
                value={formData.cost}
                onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sumber Pembiayaan</label>
            <select
              value={formData.fundingSource}
              onChange={e => setFormData({ ...formData, fundingSource: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 font-medium"
            >
              <option value="BOS Reguler">BOS Reguler (Pemeliharaan Sarpras)</option>
              <option value="BOS Kinerja">BOS Kinerja</option>
              <option value="Komite Sekolah">Komite Sekolah</option>
              <option value="Garansi Resmi">Garansi Resmi (Klaim Vendor)</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
            >
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold">
              Simpan Data Servis
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Konfirmasi Servis Selesai */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title={`Konfirmasi Pemeliharaan Selesai: ${selectedMaintenance?.maintenanceNumber}`}
      >
        <form onSubmit={handleSaveComplete} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tindakan Perbaikan yang Dilakukan</label>
            <textarea
              required
              rows={2}
              placeholder="Contoh: Penggantian bohlam optik proyektor dan pembersihan kipas fan"
              value={completeData.actionTaken}
              onChange={e => setCompleteData({ ...completeData, actionTaken: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Selesai Servis</label>
              <input
                type="date"
                value={completeData.completionDate}
                onChange={e => setCompleteData({ ...completeData, completionDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Total Biaya Realisasi Akhir (Rp)</label>
              <input
                type="number"
                min="0"
                value={completeData.cost}
                onChange={e => setCompleteData({ ...completeData, cost: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hasil Kondisi Fisik Pasca Perbaikan</label>
            <select
              value={completeData.conditionResult}
              onChange={e => setCompleteData({ ...completeData, conditionResult: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 font-bold text-emerald-700 dark:text-emerald-400"
            >
              <option value="Baik">Baik (Berfungsi Normal 100%)</option>
              <option value="Rusak Ringan">Rusak Ringan (Dapat Digunakan Terbatas)</option>
              <option value="Rusak Berat">Rusak Berat (Gagal Servis / Afkir)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCompleteModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
            >
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold">
              Konfirmasi Selesai & Aktifkan Aset
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
