import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Gavel,
  ShieldCheck,
  Search,
  FileText,
} from 'lucide-react';
import { AssetDisposal, DisposalMethod, AssetCondition } from '../../types';
import { db } from '../../services/db';
import { formatDate } from '../../utils/formatters';
import { ConditionBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const DisposalList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    disposalNumber: `DISP-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
    assetId: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
    condition: 'Rusak Berat' as AssetCondition,
    method: 'Dilelang' as DisposalMethod,
    supportingDoc: '',
    notes: '',
  });

  const disposals = db.getDisposals();
  const allAssets = db.getAssets(false);
  const currentUser = db.getCurrentUser();

  const filteredDisposals = disposals.filter(d => {
    const q = searchQuery.toLowerCase().trim();
    const asset = db.getAssetById(d.assetId);
    return (
      !q ||
      d.disposalNumber.toLowerCase().includes(q) ||
      d.reason.toLowerCase().includes(q) ||
      (asset && (asset.name.toLowerCase().includes(q) || asset.code.toLowerCase().includes(q)))
    );
  });

  const handleOpenAdd = () => {
    const brokenAsset = allAssets.find(a => a.condition === 'Rusak Berat') || allAssets[0];

    setFormData({
      disposalNumber: `DISP-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      assetId: brokenAsset?.id || '',
      date: new Date().toISOString().split('T')[0],
      reason: 'Biaya perbaikan melebihi nilai ekonomis aset dan masa manfaat telah habis',
      condition: brokenAsset?.condition || 'Rusak Berat',
      method: 'Dilelang',
      supportingDoc: 'SK_USULAN_PENGHAPUSAN_2026.pdf',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleSaveDisposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetId || !formData.reason.trim()) return;

    // If submitted by Kepala Sekolah, auto-approve; otherwise "Menunggu Persetujuan"
    const isKepsekOrAdmin = currentUser.role === 'KEPALA_SEKOLAH' || currentUser.role === 'ADMIN';

    db.addDisposal({
      ...formData,
      approvalStatus: isKepsekOrAdmin ? 'Disetujui' : 'Menunggu Persetujuan',
      approvedBy: isKepsekOrAdmin ? currentUser.name : undefined,
    });
    setModalOpen(false);
  };

  const handleApprove = (d: AssetDisposal) => {
    db.approveDisposal(d.id, currentUser.name);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Penghapusan Aset & Disposisi</h3>
          <p className="text-xs text-slate-500">Tata kelola penghapusan aset rusak berat/hibah secara akuntabel sesuai perundangan</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari usulan penghapusan..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Usulan Penghapusan Baru</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">No. Penghapusan</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Aset Terkait</th>
                <th className="p-3">Metode</th>
                <th className="p-3">Alasan Penghapusan</th>
                <th className="p-3 text-center">Status Persetujuan</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDisposals.map(d => {
                const asset = db.getAssetById(d.assetId);
                const isApproved = d.approvalStatus === 'Disetujui';

                return (
                  <tr key={d.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-rose-700">{d.disposalNumber}</td>
                    <td className="p-3 text-slate-600 whitespace-nowrap">{formatDate(d.date)}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{asset?.name || d.assetId}</span>
                      <span className="font-mono text-[10px] text-blue-600 font-bold">{asset?.code}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[11px]">
                        {d.method}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 max-w-xs">{d.reason}</td>
                    <td className="p-3 text-center">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Disetujui ({d.approvedBy})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          Menunggu Persetujuan
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {!isApproved && (currentUser.role === 'KEPALA_SEKOLAH' || currentUser.role === 'ADMIN') ? (
                        <button
                          onClick={() => handleApprove(d)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                        >
                          Setujui
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Selesai</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Usulan Penghapusan */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Formulir Usulan Penghapusan Barang Milik Sekolah">
        <form onSubmit={handleSaveDisposal} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Surat Usulan</label>
              <input
                type="text"
                value={formData.disposalNumber}
                onChange={e => setFormData({ ...formData, disposalNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Usulan</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Pilih Aset yang Akan Dihapuskan</label>
            <select
              value={formData.assetId}
              onChange={e => setFormData({ ...formData, assetId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-white font-bold"
            >
              {allAssets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.code} - {a.name} (Kondisi: {a.condition})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Metode Penghapusan</label>
              <select
                value={formData.method}
                onChange={e => setFormData({ ...formData, method: e.target.value as DisposalMethod })}
                className="w-full px-3 py-2 border rounded-lg bg-white font-bold"
              >
                <option value="Dilelang">Dilelang melalui KPKNL / Dinas</option>
                <option value="Dimusnahkan">Dimusnahkan (Bakar/Timbun karena rusak total)</option>
                <option value="Dihibahkan">Dihibahkan ke Lembaga Lain</option>
                <option value="Tukar Guling">Tukar Guling (Ruislag)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Dokumen Pendukung / SK</label>
              <input
                type="text"
                placeholder="SK_USULAN_PENGHAPUSAN_2026.pdf"
                value={formData.supportingDoc}
                onChange={e => setFormData({ ...formData, supportingDoc: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Alasan Pertimbangan Penghapusan</label>
            <textarea
              rows={2}
              required
              placeholder="Contoh: Barang dalam kondisi rusak berat dan secara teknis biaya perbaikan melampaui 70% harga baru..."
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold">
              Kirimkan Usulan Penghapusan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
