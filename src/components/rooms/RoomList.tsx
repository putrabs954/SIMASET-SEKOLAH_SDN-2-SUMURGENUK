import React, { useState } from 'react';
import {
  DoorOpen,
  Plus,
  Printer,
  Search,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Archive,
  Package,
} from 'lucide-react';
import { Room, Asset } from '../../types';
import { db } from '../../services/db';
import { formatRupiah, formatDate, formatDateTime } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { KopSurat } from '../common/KopSurat';

export const RoomList: React.FC<{ onSelectAsset?: (a: Asset) => void }> = ({ onSelectAsset }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [printDirRoom, setPrintDirRoom] = useState<Room | null>(null);
  const [roomFormOpen, setRoomFormOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);

  // Deletion states
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [blockedRoom, setBlockedRoom] = useState<{ room: Room; assetCount: number } | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    building: 'Gedung A',
    floor: 'Lantai 1',
    picName: '',
    picNip: '',
    notes: '',
  });

  const activeRooms = db.getRooms(false);
  const deletedRooms = db.getDeletedRooms();
  const allAssets = db.getAssets(false);
  const school = db.getSchool();

  const currentDataset = activeTab === 'active' ? activeRooms : deletedRooms;

  const filteredRooms = currentDataset.filter(r => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      r.picName.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setRoomToEdit(null);
    setFormData({
      code: `R-${String(activeRooms.length + 1).padStart(2, '0')}`,
      name: '',
      building: 'Gedung A (Utama)',
      floor: 'Lantai 1',
      picName: '',
      picNip: '',
      notes: '',
    });
    setRoomFormOpen(true);
  };

  const handleOpenEdit = (r: Room) => {
    setRoomToEdit(r);
    setFormData({
      code: r.code,
      name: r.name,
      building: r.building || '',
      floor: r.floor || '',
      picName: r.picName,
      picNip: r.picNip || '',
      notes: r.notes || '',
    });
    setRoomFormOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.picName.trim()) return;

    if (roomToEdit) {
      db.updateRoom(roomToEdit.id, formData);
    } else {
      db.addRoom(formData);
    }
    setRoomFormOpen(false);
  };

  // Delete click verification
  const handleClickDelete = (room: Room) => {
    const roomAssets = allAssets.filter(a => a.roomId === room.id && !a.isDeleted);
    if (roomAssets.length > 0) {
      setBlockedRoom({ room, assetCount: roomAssets.length });
    } else {
      setRoomToDelete(room);
    }
  };

  const handleConfirmDelete = () => {
    if (!roomToDelete) return;
    db.softDeleteRoom(roomToDelete.id, 'Dihapus oleh pengguna');
    setRoomToDelete(null);
  };

  const handleRestore = (room: Room) => {
    db.restoreRoom(room.id);
  };

  return (
    <div className="space-y-4">
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
            Ruangan Aktif ({activeRooms.length})
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'archive'
                ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Arsip Ruangan ({deletedRooms.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari ruangan atau PJ..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          {activeTab === 'active' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Ruangan</span>
            </button>
          )}
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
            <DoorOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-sm">
              {activeTab === 'active' ? 'Tidak ada ruangan yang ditemukan' : 'Tidak ada ruangan dalam arsip'}
            </p>
          </div>
        ) : (
          filteredRooms.map(room => {
            const roomAssets = allAssets.filter(a => a.roomId === room.id && !a.isDeleted);
            const totalVal = roomAssets.reduce((sum, a) => sum + a.acquisitionPrice * (a.quantity || 1), 0);

            return (
              <div
                key={room.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {room.code}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{room.name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {room.building} • {room.floor}
                        </p>
                      </div>
                    </div>

                    {activeTab === 'active' ? (
                      <div className="flex items-center gap-1">
                        {/* Action: Edit */}
                        <button
                          onClick={() => handleOpenEdit(room)}
                          className="p-1.5 text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Edit Ruangan"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {/* Action: Hapus */}
                        <button
                          onClick={() => handleClickDelete(room)}
                          className="p-1.5 text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                          title="Hapus Ruangan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRestore(room)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Pulihkan</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Penanggung Jawab:</span>
                      <strong className="text-slate-900 dark:text-slate-100">{room.picName}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Jumlah Aset Terdata:</span>
                      <span className="font-bold font-mono text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                        {roomAssets.length} Unit
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Total Nilai Aset:</span>
                      <strong className="font-mono text-emerald-700 dark:text-emerald-400">{formatRupiah(totalVal)}</strong>
                    </div>
                    {activeTab === 'archive' && room.deletedAt && (
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Waktu Dihapus:</span>
                        <span>{formatDateTime(room.deletedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons: Lihat & Cetak DIR */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedRoom(room)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Daftar Aset ({roomAssets.length})</span>
                  </button>

                  <button
                    onClick={() => setPrintDirRoom(room)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-xs font-semibold shadow-xs transition"
                    title="Cetak Formulir Daftar Inventaris Ruangan (DIR)"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak DIR</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Warning Dialog: Ruangan masih memiliki aset */}
      <Modal
        isOpen={Boolean(blockedRoom)}
        onClose={() => setBlockedRoom(null)}
        title="Ruangan Tidak Dapat Dihapus"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                Ruangan ini masih memiliki aset. Pindahkan aset terlebih dahulu sebelum menghapus ruangan.
              </p>
              <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-900 space-y-1 text-slate-700 dark:text-slate-300">
                <p>
                  Ruangan: <strong>{blockedRoom?.room.name}</strong> ({blockedRoom?.room.code})
                </p>
                <p>
                  Masih terdapat: <strong className="text-rose-600 dark:text-rose-400">{blockedRoom?.assetCount} aset</strong>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tidak dapat dihapus sebelum aset dipindahkan.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setBlockedRoom(null)}
              className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold rounded-xl"
            >
              Mengerti
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog: Soft Delete Room (when 0 assets) */}
      <ConfirmDialog
        isOpen={Boolean(roomToDelete)}
        title="Hapus Ruangan Ini?"
        message={`Apakah Anda yakin ingin menghapus ruangan "${roomToDelete?.name}" (${roomToDelete?.code})? Ruangan ini akan diarsipkan (soft delete).`}
        confirmLabel="Hapus Ruangan"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRoomToDelete(null)}
      />

      {/* Modal: View Assets in Room (Lihat) */}
      {selectedRoom && (
        <Modal
          isOpen={Boolean(selectedRoom)}
          onClose={() => setSelectedRoom(null)}
          title={`Inventaris: ${selectedRoom.name} (${selectedRoom.code})`}
          subtitle={`Penanggung Jawab: ${selectedRoom.picName} • Lokasi: ${selectedRoom.building}, ${selectedRoom.floor}`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Kode</th>
                    <th className="p-2.5">Nama Barang</th>
                    <th className="p-2.5">Merk/Model</th>
                    <th className="p-2.5">Kondisi</th>
                    <th className="p-2.5 text-right">Nilai Perolehan</th>
                    <th className="p-2.5 text-center">Tahun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {allAssets.filter(a => a.roomId === selectedRoom.id && !a.isDeleted).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 dark:text-slate-500">
                        Belum ada aset tetap yang ditempatkan di ruangan ini.
                      </td>
                    </tr>
                  ) : (
                    allAssets
                      .filter(a => a.roomId === selectedRoom.id && !a.isDeleted)
                      .map(a => (
                        <tr
                          key={a.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                          onClick={() => {
                            if (onSelectAsset) onSelectAsset(a);
                          }}
                        >
                          <td className="p-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">{a.code}</td>
                          <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">{a.name}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">{a.brand}</td>
                          <td className="p-2.5">{a.condition}</td>
                          <td className="p-2.5 text-right font-mono font-bold">{formatRupiah(a.acquisitionPrice)}</td>
                          <td className="p-2.5 text-center text-slate-500 dark:text-slate-400">{a.acquisitionYear}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Form Tambah / Edit Ruangan */}
      <Modal
        isOpen={roomFormOpen}
        onClose={() => setRoomFormOpen(false)}
        title={roomToEdit ? 'Ubah Data Ruangan' : 'Tambah Ruangan Baru'}
      >
        <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Ruangan</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                placeholder="R-01"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Ruangan</label>
              <input
                type="text"
                required
                placeholder="Contoh: Lab Komputer 1 / Ruang Kelas X"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gedung / Blok</label>
              <input
                type="text"
                value={formData.building}
                onChange={e => setFormData({ ...formData, building: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lantai</label>
              <input
                type="text"
                value={formData.floor}
                onChange={e => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Penanggung Jawab (PJ Fisik)</label>
              <input
                type="text"
                required
                placeholder="Nama Guru / Kepala Lab"
                value={formData.picName}
                onChange={e => setFormData({ ...formData, picName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">NIP Penanggung Jawab</label>
              <input
                type="text"
                placeholder="NIP (Opsional)"
                value={formData.picNip}
                onChange={e => setFormData({ ...formData, picNip: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Keterangan / Catatan</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Catatan kapasitas ruangan, fungsi, dsb..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setRoomFormOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
            >
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">
              {roomToEdit ? 'Simpan Perubahan' : 'Simpan Ruangan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Cetak Formulir DIR (Daftar Inventaris Ruangan) */}
      {printDirRoom && (
        <Modal
          isOpen={Boolean(printDirRoom)}
          onClose={() => setPrintDirRoom(null)}
          title="Pratinjau Cetak Daftar Inventaris Ruangan (DIR)"
          subtitle="Formulir resmi penempatan barang sarana prasarana sekolah"
          maxWidth="4xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl text-slate-900 print:border-none print:p-0">
              <KopSurat />

              <div className="text-center my-4">
                <h3 className="text-sm font-bold uppercase tracking-wider underline">
                  DAFTAR INVENTARIS RUANGAN (DIR)
                </h3>
                <p className="text-xs font-bold text-slate-600 mt-1">
                  RUANGAN: {printDirRoom.name.toUpperCase()} ({printDirRoom.code})
                </p>
                <p className="text-[11px] text-slate-500">
                  Lokasi: {printDirRoom.building} - {printDirRoom.floor} | Penanggung Jawab: {printDirRoom.picName}
                </p>
              </div>

              <table className="w-full text-left text-xs border border-slate-900 mt-4">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-900 text-slate-900 font-bold text-center">
                    <th className="border-r border-slate-900 p-2 w-10">No</th>
                    <th className="border-r border-slate-900 p-2">Kode Aset</th>
                    <th className="border-r border-slate-900 p-2">Nama Barang / Spesifikasi</th>
                    <th className="border-r border-slate-900 p-2">Merk / Type</th>
                    <th className="border-r border-slate-900 p-2 w-14">Jml</th>
                    <th className="border-r border-slate-900 p-2">Kondisi</th>
                    <th className="p-2">Sumber Dana</th>
                  </tr>
                </thead>
                <tbody>
                  {allAssets.filter(a => a.roomId === printDirRoom.id && !a.isDeleted).map((a, i) => (
                    <tr key={a.id} className="border-b border-slate-300">
                      <td className="border-r border-slate-900 p-2 text-center">{i + 1}</td>
                      <td className="border-r border-slate-900 p-2 font-mono">{a.code}</td>
                      <td className="border-r border-slate-900 p-2 font-bold">{a.name}</td>
                      <td className="border-r border-slate-900 p-2">{a.brand}</td>
                      <td className="border-r border-slate-900 p-2 text-center">{a.quantity || 1}</td>
                      <td className="border-r border-slate-900 p-2 text-center">{a.condition}</td>
                      <td className="p-2">{a.fundingSource}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-8 mt-12 text-center">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-bold">Kepala Sekolah</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{school.headmasterName}</p>
                  <p className="text-[10px]">NIP. {school.headmasterNip}</p>
                </div>
                <div>
                  <p>{school.regency}, {formatDate(new Date().toISOString())}</p>
                  <p className="font-bold">Penanggung Jawab Ruangan</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{printDirRoom.picName}</p>
                  <p className="text-[10px]">NIP. {printDirRoom.picNip || '-'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPrintDirRoom(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-black transition"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar DIR</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
