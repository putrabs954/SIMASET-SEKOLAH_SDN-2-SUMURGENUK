import React, { useState } from 'react';
import {
  Truck,
  Plus,
  ArrowRight,
  Search,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Archive,
  Ban,
} from 'lucide-react';
import { AssetMutation, Asset } from '../../types';
import { db } from '../../services/db';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const MutationList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [selectedMutation, setSelectedMutation] = useState<AssetMutation | null>(null);
  const [mutationToCancel, setMutationToCancel] = useState<AssetMutation | null>(null);

  const [formData, setFormData] = useState({
    mutationNumber: `MUT-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
    assetId: '',
    date: new Date().toISOString().split('T')[0],
    sourceRoomId: '',
    targetRoomId: '',
    oldPicName: '',
    newPicName: '',
    reason: '',
    notes: '',
  });

  const [editData, setEditData] = useState({
    reason: '',
    notes: '',
  });

  const activeMutations = db.getMutations(false);
  const deletedMutations = db.getDeletedMutations();
  const allAssets = db.getAssets(false);
  const rooms = db.getRooms();

  const currentDataset = activeTab === 'active' ? activeMutations : deletedMutations;

  const filteredMutations = currentDataset.filter(m => {
    const q = searchQuery.toLowerCase().trim();
    const asset = db.getAssetById(m.assetId);
    return (
      !q ||
      m.mutationNumber.toLowerCase().includes(q) ||
      m.reason.toLowerCase().includes(q) ||
      m.newPicName.toLowerCase().includes(q) ||
      (asset && (asset.name.toLowerCase().includes(q) || asset.code.toLowerCase().includes(q)))
    );
  });

  const handleOpenAdd = () => {
    const defaultAsset = allAssets[0];
    const defaultSourceRoom = defaultAsset ? db.getRoomById(defaultAsset.roomId) : rooms[0];
    const defaultTargetRoom = rooms.find(r => r.id !== defaultSourceRoom?.id) || rooms[1] || rooms[0];

    setFormData({
      mutationNumber: `MUT-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      assetId: defaultAsset?.id || '',
      date: new Date().toISOString().split('T')[0],
      sourceRoomId: defaultSourceRoom?.id || '',
      targetRoomId: defaultTargetRoom?.id || '',
      oldPicName: defaultAsset?.picName || '',
      newPicName: defaultTargetRoom?.picName || '',
      reason: 'Penataan ulang sarana pembelajaran antar ruang',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenDetail = (m: AssetMutation) => {
    setSelectedMutation(m);
    setDetailModalOpen(true);
  };

  const handleOpenEdit = (m: AssetMutation) => {
    setSelectedMutation(m);
    setEditData({
      reason: m.reason,
      notes: m.notes || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMutation) return;
    const mut = db.getMutations(true).find(item => item.id === selectedMutation.id);
    if (mut) {
      mut.reason = editData.reason;
      mut.notes = editData.notes;
      db.notify();
    }
    setEditModalOpen(false);
  };

  const handleAssetSelect = (assetId: string) => {
    const a = db.getAssetById(assetId);
    if (!a) return;
    const targetRoom = rooms.find(r => r.id !== a.roomId) || rooms[0];

    setFormData(prev => ({
      ...prev,
      assetId,
      sourceRoomId: a.roomId,
      oldPicName: a.picName,
      targetRoomId: targetRoom ? targetRoom.id : prev.targetRoomId,
      newPicName: targetRoom ? targetRoom.picName : prev.newPicName,
    }));
  };

  const handleTargetRoomSelect = (roomId: string) => {
    const target = db.getRoomById(roomId);
    setFormData(prev => ({
      ...prev,
      targetRoomId: roomId,
      newPicName: target ? target.picName : prev.newPicName,
    }));
  };

  const handleSaveMutation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetId || !formData.targetRoomId || !formData.reason.trim()) return;

    db.recordMutation({
      ...formData,
      approvedBy: db.getCurrentUser().name,
    });
    setModalOpen(false);
  };

  const handleConfirmCancel = () => {
    if (!mutationToCancel) return;
    db.cancelMutation(mutationToCancel.id, 'Dibatalkan oleh pengguna');
    setMutationToCancel(null);
  };

  const handleRestore = (m: AssetMutation) => {
    db.restoreMutation(m.id);
  };

  const assetToCancel = mutationToCancel ? db.getAssetById(mutationToCancel.assetId) : undefined;
  const srcRoomToCancel = mutationToCancel ? db.getRoomById(mutationToCancel.sourceRoomId) : undefined;
  const tgtRoomToCancel = mutationToCancel ? db.getRoomById(mutationToCancel.targetRoomId) : undefined;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'active'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mutasi Aktif ({activeMutations.length})
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
            <span>Mutasi Dibatalkan ({deletedMutations.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari mutasi, alasan, aset..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          {activeTab === 'active' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Mutasi Aset Baru</span>
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
                <th className="p-3">No. Mutasi</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Aset Dipindahkan</th>
                <th className="p-3">Ruangan Asal</th>
                <th className="p-3">Ruangan Tujuan</th>
                <th className="p-3">PJ Baru</th>
                <th className="p-3">Alasan Pemindahan</th>
                {activeTab === 'archive' && <th className="p-3">Status</th>}
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredMutations.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'archive' ? 9 : 8} className="text-center py-10 text-slate-400 dark:text-slate-500">
                    <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-sm">
                      {activeTab === 'active' ? 'Belum ada data mutasi yang sesuai' : 'Tidak ada mutasi dibatalkan'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMutations.map(m => {
                  const asset = db.getAssetById(m.assetId);
                  const srcRoom = db.getRoomById(m.sourceRoomId);
                  const dstRoom = db.getRoomById(m.targetRoomId);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 font-mono font-bold text-purple-700 dark:text-purple-400">{m.mutationNumber}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{formatDate(m.date)}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{asset?.name || m.assetId}</span>
                        <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">{asset?.code}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">{srcRoom?.name || m.sourceRoomId}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">PJ Lama: {m.oldPicName}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400 block">{dstRoom?.name || m.targetRoomId}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{dstRoom?.building}</span>
                      </td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{m.newPicName}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">{m.reason}</td>

                      {activeTab === 'archive' && (
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            Dibatalkan
                          </span>
                        </td>
                      )}

                      <td className="p-3 text-center whitespace-nowrap">
                        {activeTab === 'active' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Action 1: Lihat */}
                            <button
                              onClick={() => handleOpenDetail(m)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
                              title="Lihat Detail Mutasi"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Action 2: Edit */}
                            <button
                              onClick={() => handleOpenEdit(m)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition"
                              title="Edit Keterangan Mutasi"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Action 3: Hapus / Batalkan */}
                            <button
                              onClick={() => setMutationToCancel(m)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                              title="Batalkan / Hapus Data Mutasi"
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

      {/* Confirmation Dialog as explicitly instructed: "Apakah Anda yakin ingin membatalkan data mutasi ini?" */}
      <ConfirmDialog
        isOpen={Boolean(mutationToCancel)}
        title="Apakah Anda yakin ingin membatalkan data mutasi ini?"
        confirmLabel="Batalkan Mutasi"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setMutationToCancel(null)}
      >
        {mutationToCancel && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Nomor Mutasi:</span>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{mutationToCancel.mutationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Aset:</span>
              <strong className="text-slate-900 dark:text-slate-100">{assetToCancel?.name} ({assetToCancel?.code})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Perpindahan:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {srcRoomToCancel?.name} → {tgtRoomToCancel?.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
              *Histori mutasi ini akan ditandai sebagai "Dibatalkan" tanpa menghilangkan jejak audit log.
            </p>
          </div>
        )}
      </ConfirmDialog>

      {/* Detail Mutation Modal (Lihat) */}
      {selectedMutation && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Detail Berita Acara Mutasi: ${selectedMutation.mutationNumber}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Aset yang Dimutasi:</span>
                <strong className="text-blue-600 dark:text-blue-400">
                  {db.getAssetById(selectedMutation.assetId)?.name} ({db.getAssetById(selectedMutation.assetId)?.code})
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Tanggal Pemindahan:</span>
                <span className="text-slate-800 dark:text-slate-200">{formatDate(selectedMutation.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Ruangan Asal:</span>
                <span className="text-slate-800 dark:text-slate-200">{db.getRoomById(selectedMutation.sourceRoomId)?.name} (PJ: {selectedMutation.oldPicName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Ruangan Tujuan Baru:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">{db.getRoomById(selectedMutation.targetRoomId)?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">PJ Baru di Ruangan:</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{selectedMutation.newPicName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Disetujui Oleh:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedMutation.approvedBy || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Alasan Pemindahan:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedMutation.reason}</span>
              </div>
              {selectedMutation.isCancelled && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-700 dark:text-rose-300">
                  <span className="font-bold block">Status: Transaksi Dibatalkan</span>
                  <span className="text-[11px]">Waktu: {formatDateTime(selectedMutation.cancelledAt)}</span>
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

      {/* Edit Mutation Modal */}
      {selectedMutation && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Edit Keterangan Mutasi: ${selectedMutation.mutationNumber}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alasan Pemindahan</label>
              <input
                type="text"
                required
                value={editData.reason}
                onChange={e => setEditData({ ...editData, reason: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold"
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
              <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold">
                Simpan Perubahan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Mutasi Baru */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Pencatatan Berita Acara Mutasi Aset">
        <form onSubmit={handleSaveMutation} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Mutasi</label>
              <input
                type="text"
                value={formData.mutationNumber}
                onChange={e => setFormData({ ...formData, mutationNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Pemindahan</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Aset yang Akan Dipindahkan</label>
            <select
              value={formData.assetId}
              onChange={e => handleAssetSelect(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 font-bold"
            >
              {allAssets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.code} - {a.name} ({a.condition})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block font-bold text-slate-500 dark:text-slate-400 mb-1">Ruangan Asal (Terkini)</label>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {rooms.find(r => r.id === formData.sourceRoomId)?.name || 'Gudang'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">PJ Lama: {formData.oldPicName}</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Ruangan Tujuan Baru</label>
              <select
                value={formData.targetRoomId}
                onChange={e => handleTargetRoomSelect(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 font-bold text-blue-700 dark:text-blue-400"
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Penanggung Jawab Baru di Ruangan Tujuan</label>
            <input
              type="text"
              required
              value={formData.newPicName}
              onChange={e => setFormData({ ...formData, newPicName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alasan Pemindahan / Relokasi</label>
            <input
              type="text"
              required
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Nomor surat disposisi atau berita acara serah terima..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
            >
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold">
              Konfirmasi Mutasi
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
