import React, { useState } from 'react';
import {
  FolderArchive,
  Plus,
  FileText,
  Download,
  Trash2,
  ExternalLink,
  Search,
  Upload,
  Calendar,
} from 'lucide-react';
import { DocumentItem } from '../../types';
import { db } from '../../services/db';
import { formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';

export const DocumentList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'BAST' as DocumentItem['type'],
    fileName: '',
    fileSize: '1.2 MB',
    fileUrl: '#',
    relatedAssetId: '',
    uploadDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const documents = db.getDocuments();
  const allAssets = db.getAssets(false);

  const filteredDocs = documents.filter(doc => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q || doc.title.toLowerCase().includes(q) || doc.fileName.toLowerCase().includes(q);
    const matchType = typeFilter === 'ALL' || doc.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      }));
    }
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    db.addDocument({
      ...formData,
      fileName: formData.fileName || `${formData.title.replace(/\s+/g, '_')}.pdf`,
    });
    setModalOpen(false);
  };

  const handleDownload = (doc: DocumentItem) => {
    if (doc.fileUrl) {
      const a = document.createElement('a');
      a.href = doc.fileUrl;
      a.download = doc.fileName;
      a.click();
    } else {
      const blob = new Blob(
        [`Dokumen SIMASET: ${doc.title}\nNomor: ${doc.documentNumber || '-'}\nKategori: ${doc.category}\nTanggal: ${doc.uploadDate}\nKeterangan: ${doc.notes || '-'}`],
        { type: 'text/plain;charset=utf-8' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.fileName.replace(/\.[^/.]+$/, '')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDelete = (id: string) => {
    db.deleteDocument(id);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Pusat Arsip & Dokumen Sarpras</h3>
          <p className="text-xs text-slate-500">Penyimpanan BAST, faktur e-Katalog, surat keputusan, dan bukti pembayaran legal</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari judul dokumen..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <button
            onClick={() => {
              setFormData({
                title: '',
                type: 'BAST',
                fileName: '',
                fileSize: '1.2 MB',
                fileUrl: '#',
                relatedAssetId: '',
                uploadDate: new Date().toISOString().split('T')[0],
                notes: '',
              });
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>Unggah Dokumen</span>
          </button>
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => {
          const asset = doc.relatedAssetId ? db.getAssetById(doc.relatedAssetId) : null;

          return (
            <div key={doc.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {doc.type}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 mt-3 leading-snug">{doc.title}</h4>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">{doc.fileName} ({doc.fileSize || '1 MB'})</p>

                {asset && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600">
                    <span>Terkait Aset: <strong>{asset.name}</strong> ({asset.code})</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">{formatDate(doc.uploadDate)}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Unduh Berkas"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Hapus Dokumen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Unggah Berkas / Dokumen Sarpras Baru">
        <form onSubmit={handleSaveDoc} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Judul Dokumen</label>
            <input
              type="text"
              required
              placeholder="Contoh: BAST Pengadaan Komputer BOS 2026"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Dokumen</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="BAST">BAST (Berita Acara Serah Terima)</option>
                <option value="Faktur / Invoice">Faktur / Invoice Pembelian</option>
                <option value="Bukti Pembayaran">Bukti Pembayaran / Kwitansi</option>
                <option value="Surat Pengadaan">Surat Pengadaan / Kontrak</option>
                <option value="SK Penghapusan">SK Usulan Penghapusan</option>
                <option value="Manual / Buku Panduan">Manual / Buku Panduan</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hubungkan ke Aset (Opsional)</label>
              <select
                value={formData.relatedAssetId}
                onChange={e => setFormData({ ...formData, relatedAssetId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="">-- Pilih Aset Terkait --</option>
                {allAssets.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.code} - {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Pilih File PDF / Gambar</label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {formData.fileName && (
              <p className="text-[11px] text-emerald-600 mt-1 font-mono">
                Berkas siap unggah: {formData.fileName} ({formData.fileSize})
              </p>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Dokumen</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
            <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">
              Simpan Dokumen
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
