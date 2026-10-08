import React, { useEffect, useState } from 'react';
import {
  Package,
  QrCode,
  Download,
  Printer,
  Calendar,
  DollarSign,
  DoorOpen,
  User,
  ShieldCheck,
  Building,
  FileText,
  Clock,
  ArrowLeftRight,
  Truck,
  Wrench,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { Asset } from '../../types';
import { db } from '../../services/db';
import { formatRupiah, formatDate, generateQrDataUrl } from '../../utils/formatters';
import { ConditionBadge, StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface AssetDetailModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onBorrow: (asset: Asset) => void;
  onMutate: (asset: Asset) => void;
  onMaintenance: (asset: Asset) => void;
  onPrintLabel: (asset: Asset) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onBorrow,
  onMutate,
  onMaintenance,
  onPrintLabel,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  useEffect(() => {
    if (asset) {
      generateQrDataUrl(`SIMASET:${asset.code}:${asset.name}`).then(url => setQrUrl(url));
    }
  }, [asset]);

  if (!asset) return null;

  const room = db.getRoomById(asset.roomId);
  const category = db.getCategories().find(c => c.id === asset.categoryId);
  const supplier = db.getSuppliers().find(s => s.id === asset.supplierId);

  // Compile timeline history
  const mutations = db.getMutations().filter(m => m.assetId === asset.id);
  const borrowings = db.getBorrowings().filter(b => b.assetId === asset.id);
  const maintenances = db.getMaintenances().filter(m => m.assetId === asset.id);

  const historyEvents = [
    {
      date: asset.acquisitionDate,
      title: 'Perolehan & Registrasi Aset',
      desc: `Aset dibeli melalui dana ${asset.fundingSource} senilai ${formatRupiah(asset.acquisitionPrice)} dan didaftarkan ke sistem dengan kode ${asset.code}.`,
      type: 'create',
    },
    ...mutations.map(m => {
      const src = db.getRoomById(m.sourceRoomId);
      const dst = db.getRoomById(m.targetRoomId);
      return {
        date: m.date,
        title: 'Mutasi Ruangan',
        desc: `Dipindahkan dari ${src?.name || 'Gudang'} ke ${dst?.name || 'Ruangan'}. Alasan: ${m.reason} (PJ Baru: ${m.newPicName})`,
        type: 'mutation',
      };
    }),
    ...borrowings.map(b => ({
      date: b.borrowDate,
      title: `Peminjaman (${b.status})`,
      desc: `Dipinjam oleh ${b.borrowerName} untuk ${b.purpose}. Tanggal kembali: ${b.actualReturnDate ? formatDate(b.actualReturnDate) : 'Belum kembali'}`,
      type: 'borrow',
    })),
    ...maintenances.map(m => ({
      date: m.date,
      title: `Pemeliharaan / Servis (${m.status})`,
      desc: `${m.damageType} ditangani oleh ${m.vendorName}. Biaya: ${formatRupiah(m.cost)}. Tindakan: ${m.actionTaken || '-'}`,
      type: 'maintenance',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={asset.name}
      subtitle={`Kode Aset: ${asset.code} • Terdaftar sejak ${formatDate(asset.acquisitionDate)}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Top Header Row with QR & Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-4">
            {qrUrl && (
              <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs shrink-0 text-center">
                <img src={qrUrl} alt="QR Code" className="w-18 h-18 object-contain mx-auto" />
                <span className="text-[10px] font-mono font-bold text-slate-600 block mt-0.5">
                  {asset.code}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <ConditionBadge condition={asset.condition} />
                <StatusBadge status={asset.status} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1.5">{asset.name}</h3>
              <p className="text-xs text-slate-500">
                {asset.brand} {asset.model ? `• ${asset.model}` : ''} | Kategori: <strong>{category?.name || '-'}</strong>
              </p>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => onPrintLabel(asset)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Label QR</span>
            </button>
            {asset.status === 'Aktif' && (
              <>
                <button
                  onClick={() => onBorrow(asset)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Pinjamkan</span>
                </button>
                <button
                  onClick={() => onMutate(asset)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Mutasi</span>
                </button>
              </>
            )}
            <button
              onClick={() => onMaintenance(asset)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Pemeliharaan</span>
            </button>
            <button
              onClick={() => onEdit(asset)}
              className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
              title="Edit Data"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(asset)}
              className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
              title="Hapus Aset"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Spesifikasi & Informasi Lengkap
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Riwayat Aktivitas & Perjalanan ({historyEvents.length})
          </button>
        </div>

        {/* Tab Content: Info */}
        {activeTab === 'info' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left Column: Identitas & Lokasi */}
            <div className="space-y-4">
              {asset.photoUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 max-h-56 bg-slate-100">
                  <img
                    src={asset.photoUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                  Penempatan & Lokasi Fisik
                </h4>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Ruangan:</span>
                  <span className="font-bold text-slate-900">{room?.name || 'Belum Ditempatkan'} ({room?.code})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Gedung / Lantai:</span>
                  <span className="font-semibold text-slate-800">{room?.building} • {room?.floor}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Penanggung Jawab:</span>
                  <span className="font-bold text-blue-700">{asset.picName}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                  Spesifikasi Teknis
                </h4>
                <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px]">
                  {asset.specification || 'Tidak ada catatan spesifikasi khusus.'}
                </p>
                {asset.notes && (
                  <p className="text-slate-500 italic mt-2">
                    Catatan: {asset.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Keuangan & Dokumen Legalitas */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                  Administrasi & Keuangan
                </h4>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Harga Perolehan:</span>
                  <span className="font-bold font-mono text-emerald-700 text-sm">{formatRupiah(asset.acquisitionPrice)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Jumlah / Satuan:</span>
                  <span className="font-semibold text-slate-900">{asset.quantity || 1} {asset.unit}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Tahun Perolehan:</span>
                  <span className="font-bold text-slate-900">{asset.acquisitionYear}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Sumber Dana:</span>
                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{asset.fundingSource}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Kode Barang Inventaris:</span>
                  <span className="font-mono text-slate-800">{asset.itemCode}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Nomor Register:</span>
                  <span className="font-mono text-slate-800">{asset.registerNumber}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                  Pengadaan & Legalitas
                </h4>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Rekanan / Supplier:</span>
                  <span className="font-semibold text-slate-900">{supplier?.name || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Nomor Faktur / Invoice:</span>
                  <span className="font-mono text-slate-800">{asset.invoiceNumber || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Nomor BAST:</span>
                  <span className="font-mono text-slate-800">{asset.bastNumber || '-'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Masa Garansi Hingga:</span>
                  <span className="font-medium text-slate-800">{formatDate(asset.warrantyUntil)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tab Content: History Timeline */
          <div className="space-y-4">
            <div className="relative pl-6 border-l-2 border-blue-500/40 space-y-6">
              {historyEvents.map((evt, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                  <div>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      {formatDate(evt.date)}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 mt-1">{evt.title}</h5>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{evt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
