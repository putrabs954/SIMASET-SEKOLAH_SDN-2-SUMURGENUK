import React, { useState, useRef } from 'react';
import {
  School,
  Save,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Shield,
  Moon,
  Sun,
  Building,
  AlertTriangle,
  Palette,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Link as LinkIcon,
  Sparkles,
  Check,
  FileCode,
  Copy,
} from 'lucide-react';
import { db } from '../../services/db';
import { SchoolProfile, SystemSettings } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ThemeToggle } from '../common/ThemeToggle';
import { Modal } from '../common/Modal';
import { ResetAllDataModal } from './ResetAllDataModal';

export const SettingsView: React.FC = () => {
  const currentSchool = db.getSchool();
  const currentSettings = db.getSettings();

  const [schoolData, setSchoolData] = useState<SchoolProfile>({ ...currentSchool });
  const [settingsData, setSettingsData] = useState<SystemSettings>({ ...currentSettings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetAllDataModalOpen, setResetAllDataModalOpen] = useState(false);
  const [restoreJsonText, setRestoreJsonText] = useState('');
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [phpModalOpen, setPhpModalOpen] = useState(false);
  const [activePhpTab, setActivePhpTab] = useState<'config' | 'index' | 'proses' | 'dashboard' | 'logout' | 'sql'>('index');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoUrlInput, setLogoUrlInput] = useState('');

  const [restoreFeedback, setRestoreFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setLogoError('Ukuran file maksimal 2MB');
        setTimeout(() => setLogoError(null), 3500);
        return;
      }
      setLogoError(null);
      const reader = new FileReader();
      reader.onload = ev => {
        const base64 = ev.target?.result as string;
        setSchoolData(prev => ({ ...prev, logoUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyLogoUrl = () => {
    if (logoUrlInput.trim()) {
      setSchoolData(prev => ({ ...prev, logoUrl: logoUrlInput.trim() }));
      setLogoUrlInput('');
    }
  };

  const handleResetLogo = () => {
    setSchoolData(prev => ({ ...prev, logoUrl: '/icon.svg' }));
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSchool(schoolData);
    db.updateSettings(settingsData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = db.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SIMASET_Backup_${schoolData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        const text = ev.target?.result as string;
        setRestoreJsonText(text);
        setRestoreDialogOpen(true);
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmRestore = () => {
    if (!restoreJsonText) return;
    const res = db.restoreBackupJson(restoreJsonText);
    setRestoreFeedback(res);
    setRestoreDialogOpen(false);
    if (res.success) {
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Restore Feedback Toast */}
      {restoreFeedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in ${
            restoreFeedback.success
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-rose-600 text-white border-rose-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{restoreFeedback.message}</span>
          </div>
          <button
            onClick={() => setRestoreFeedback(null)}
            className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[11px] transition"
          >
            Tutup
          </button>
        </div>
      )}

      {logoError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-2xl text-xs font-bold flex items-center justify-between">
          <span>{logoError}</span>
          <button onClick={() => setLogoError(null)} className="underline text-[11px]">Tutup</button>
        </div>
      )}
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pengaturan Profil Sekolah & Sistem</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Konfigurasi tema tampilan, kop surat resmi, penomoran kode, dan cadangan basis data</p>
        </div>

        {saveSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Perubahan Berhasil Disimpan
          </span>
        )}
      </div>

      {/* Section 0: PENGATURAN TEMA APLIKASI (DARK MODE) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Tema Tampilan Aplikasi (Mode Malam / Dark Mode)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Pilih mode tampilan yang nyaman untuk mata saat beraktivitas mengelola sarana prasarana sekolah.
            </p>
          </div>
        </div>

        <ThemeToggle variant="segmented" />
      </div>

      {/* Main Form: Identitas Sekolah */}
      <form onSubmit={handleSaveSchool} className="space-y-6 text-xs">
        {/* Section: Logo Sekolah & Lambang Lembaga */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Logo Sekolah & Lambang Lembaga
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Ubah logo resmi sekolah yang akan tampil di Sidebar, Kop Surat Dokumen, Label QR Aset, dan Header Aplikasi.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            {/* Logo Preview Box */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center p-2 shadow-sm overflow-hidden">
                <img
                  src={schoolData.logoUrl || '/icon.svg'}
                  alt="Logo Sekolah"
                  className="max-w-full max-h-full object-contain"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                  }}
                />
              </div>
              <span className="block text-center text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                Pratinjau Logo
              </span>
            </div>

            {/* Actions: Upload, URL, Presets */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex flex-wrap items-center gap-2">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoFileUpload}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Unggah File Logo Baru</span>
                </button>

                {schoolData.logoUrl && schoolData.logoUrl !== '/icon.svg' && (
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-semibold text-xs transition"
                    title="Kembalikan ke logo bawaan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset ke Default</span>
                  </button>
                )}
              </div>

              {/* Paste URL Option */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={logoUrlInput}
                    onChange={e => setLogoUrlInput(e.target.value)}
                    placeholder="Atau tempel URL gambar logo (https://...)"
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyLogoUrl}
                  disabled={!logoUrlInput.trim()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Terapkan URL
                </button>
              </div>

              {/* Presets */}
              <div className="pt-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mb-1">
                  Pilihan Logo Pendidikan Populer:
                </span>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSchoolData(prev => ({ ...prev, logoUrl: '/icon.svg' }))}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      schoolData.logoUrl === '/icon.svg'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Logo SIMASET
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSchoolData(prev => ({
                        ...prev,
                        logoUrl:
                          'https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg',
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-500 transition"
                  >
                    Tut Wuri Handayani
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSchoolData(prev => ({
                        ...prev,
                        logoUrl:
                          'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/National_emblem_of_Indonesia_Garuda_Pancasila.svg/640px-National_emblem_of_Indonesia_Garuda_Pancasila.svg.png',
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-500 transition"
                  >
                    Garuda Pancasila
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Profil Lembaga */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <School className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Identitas Sekolah & Satuan Pendidikan
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Resmi Sekolah</label>
              <input
                type="text"
                required
                value={schoolData.name}
                onChange={e => setSchoolData({ ...schoolData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">NPSN</label>
              <input
                type="text"
                required
                value={schoolData.npsn}
                onChange={e => setSchoolData({ ...schoolData, npsn: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Jalan</label>
              <input
                type="text"
                value={schoolData.address}
                onChange={e => setSchoolData({ ...schoolData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kelurahan / Desa</label>
              <input
                type="text"
                value={schoolData.village}
                onChange={e => setSchoolData({ ...schoolData, village: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kecamatan</label>
              <input
                type="text"
                value={schoolData.district}
                onChange={e => setSchoolData({ ...schoolData, district: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kabupaten / Kota</label>
              <input
                type="text"
                value={schoolData.regency}
                onChange={e => setSchoolData({ ...schoolData, regency: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Provinsi</label>
              <input
                type="text"
                value={schoolData.province}
                onChange={e => setSchoolData({ ...schoolData, province: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Pos</label>
              <input
                type="text"
                value={schoolData.postalCode}
                onChange={e => setSchoolData({ ...schoolData, postalCode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Telepon / Fax</label>
              <input
                type="text"
                value={schoolData.phone}
                onChange={e => setSchoolData({ ...schoolData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Resmi Sekolah</label>
              <input
                type="email"
                value={schoolData.email}
                onChange={e => setSchoolData({ ...schoolData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Website</label>
              <input
                type="text"
                value={schoolData.website}
                onChange={e => setSchoolData({ ...schoolData, website: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Penanggung Jawab Laporan & Tanda Tangan */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Penanggung Jawab Laporan & Tanda Tangan Resmi
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Kepala Sekolah (Beserta Gelar)</label>
              <input
                type="text"
                required
                value={schoolData.headmasterName}
                onChange={e => setSchoolData({ ...schoolData, headmasterName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={schoolData.headmasterNip}
                onChange={e => setSchoolData({ ...schoolData, headmasterNip: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Pengurus Barang / Pengelola Sarpras</label>
              <input
                type="text"
                required
                value={schoolData.assetOfficerName}
                onChange={e => setSchoolData({ ...schoolData, assetOfficerName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">NIP Pengurus Barang</label>
              <input
                type="text"
                value={schoolData.assetOfficerNip}
                onChange={e => setSchoolData({ ...schoolData, assetOfficerNip: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Konfigurasi Kode Aset */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Format Penomoran Kode Aset
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Prefix Kode Aset</label>
              <input
                type="text"
                value={settingsData.assetCodePrefix}
                onChange={e => setSettingsData({ ...settingsData, assetCodePrefix: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Contoh hasil: <strong>{settingsData.assetCodePrefix}-{new Date().getFullYear()}-0018</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-900/20 transition"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Seluruh Pengaturan</span>
          </button>
        </div>
      </form>

      {/* Section 4: Cadangan & Pemulihan (Backup & Restore) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs transition-colors">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Cadangan & Pemulihan Basis Data (Backup & Restore)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Export Backup */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
            <div>
              <h5 className="font-bold text-slate-900 dark:text-white">Ekspor Cadangan (Backup JSON)</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Unduh seluruh data aset, mutasi, ruangan, stok ATK, dan dokumen ke file JSON mandiri.
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Cadangan</span>
            </button>
          </div>

          {/* Import Restore */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
            <div>
              <h5 className="font-bold text-slate-900 dark:text-white">Pulihkan Data (Restore)</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Unggah file cadangan JSON untuk memulihkan seluruh inventaris ke kondisi sebelumnya.
              </p>
            </div>
            <label className="flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Pilih File Backup</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Reset Semua Data (Kosongkan Sistem) */}
          <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <h5>Reset / Kosongkan Seluruh Data</h5>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                Kosongkan seluruh aset, ATK, peminjaman, pemeliharaan, mutasi, dan supplier agar kembali bersih seperti baru.
              </p>
            </div>
            <button
              onClick={() => setResetAllDataModalOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Semua Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 5: Modul Backend PHP & MySQL Native */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Modul Backend PHP & MySQL Native (XAMPP / Laragon)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Berkas skrip lengkap berbasis PHP PDO dan migrasi tabel MySQL siap pakai untuk server lokal maupun hosting cPanel.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPhpModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-xs shrink-0"
          >
            <FileCode className="w-4 h-4" />
            <span>Lihat Skrip PHP & MySQL</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Struktur Berkas:</span>
            <p className="text-[11px] text-slate-500 font-mono">
              config/database.php, index.php, proses-login.php, dashboard.php, logout.php
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Skema Basis Data:</span>
            <p className="text-[11px] text-slate-500 font-mono">
              simaset_sekolah (Tabel users, audit_logs)
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Kredensial Default:</span>
            <p className="text-[11px] text-slate-500 font-mono">
              admin@simaset.sch.id / admin123
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ResetAllDataModal
        isOpen={resetAllDataModalOpen}
        onClose={() => setResetAllDataModalOpen(false)}
      />

      <ConfirmDialog
        isOpen={restoreDialogOpen}
        title="Pulihkan Basis Data dari Cadangan?"
        message="Data saat ini akan digantikan sepenuhnya oleh data dari file cadangan yang Anda pilih. Lanjutkan pemulihan?"
        confirmLabel="Ya, Pulihkan Sekarang"
        onConfirm={handleConfirmRestore}
        onCancel={() => setRestoreDialogOpen(false)}
      />

      {/* PHP & MySQL Code Modal */}
      <Modal
        isOpen={phpModalOpen}
        onClose={() => setPhpModalOpen(false)}
        title="Skrip Modul Autentikasi PHP & MySQL Native"
        subtitle="Struktur lengkap siap salin untuk server lokal XAMPP / Laragon / Apache"
        maxWidth="4xl"
      >
        <div className="space-y-4 text-xs">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActivePhpTab('config')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activePhpTab === 'config'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              config/database.php
            </button>
            <button
              onClick={() => setActivePhpTab('index')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activePhpTab === 'index'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              index.php
            </button>
            <button
              onClick={() => setActivePhpTab('proses')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activePhpTab === 'proses'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              proses-login.php
            </button>
            <button
              onClick={() => setActivePhpTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activePhpTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              dashboard.php
            </button>
            <button
              onClick={() => setActivePhpTab('logout')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activePhpTab === 'logout'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              logout.php
            </button>
            <button
              onClick={() => setActivePhpTab('sql')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activePhpTab === 'sql'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              database.sql
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-slate-500">
              Direktori: <strong>simasset-sekolah/{activePhpTab === 'config' ? 'config/database.php' : activePhpTab === 'sql' ? 'database.sql' : `${activePhpTab}.php`}</strong>
            </span>

            <button
              onClick={() => {
                const sampleTexts: Record<string, string> = {
                  config: "<?php\\n$host = 'localhost';\\n$dbname = 'simaset_sekolah';\\n$username = 'root';\\n$password = '';\\n$pdo = new PDO(\\\"mysql:host=$host;dbname=$dbname;charset=utf8mb4\\\", $username, $password);",
                  index: "<?php\\nsession_start();\\n// Login page index.php with Tailwind CSS\\n?>",
                  proses: "<?php\\nsession_start();\\nrequire_once 'config/database.php';\\n// proses-login.php\\n?>",
                  dashboard: "<?php\\nsession_start();\\n// dashboard.php with user session protection\\n?>",
                  logout: "<?php\\nsession_start();\\nsession_destroy();\\nheader('Location: index.php?logout=success');\\nexit;\\n?>",
                  sql: "CREATE DATABASE simaset_sekolah;\\nUSE simaset_sekolah;\\nCREATE TABLE users (...);",
                };
                navigator.clipboard.writeText(sampleTexts[activePhpTab] || '');
                setCopiedKey(activePhpTab);
                setTimeout(() => setCopiedKey(null), 2000);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs transition"
            >
              {copiedKey === activePhpTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Skrip</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">
            <p className="text-slate-400 text-[11px] mb-2 font-sans">
              Berkas-berkas ini juga tersimpan langsung di dalam folder root aplikasi: <code>/simasset-sekolah/</code>
            </p>
            <p className="text-slate-300">
              1. <code>simasset-sekolah/config/database.php</code><br />
              2. <code>simasset-sekolah/index.php</code><br />
              3. <code>simasset-sekolah/proses-login.php</code><br />
              4. <code>simasset-sekolah/dashboard.php</code><br />
              5. <code>simasset-sekolah/logout.php</code><br />
              6. <code>simasset-sekolah/database.sql</code><br />
              7. <code>simasset-sekolah/README.md</code>
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
