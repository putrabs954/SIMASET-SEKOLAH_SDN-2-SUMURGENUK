import React, { useState } from 'react';
import { AlertTriangle, AlertOctagon, RotateCcw, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { db } from '../../services/db';

interface ResetAllDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ResetAllDataModal: React.FC<ResetAllDataModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmInput, setConfirmInput] = useState('');
  const [isSuccessState, setIsSuccessState] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setConfirmInput('');
    setIsSuccessState(false);
    onClose();
  };

  const handleProceedToStep2 = () => {
    setStep(2);
    setConfirmInput('');
  };

  const handleExecuteReset = () => {
    if (confirmInput.trim() !== 'RESET') {
      return;
    }

    // Perform database reset
    db.resetAllData();
    setIsSuccessState(true);

    setTimeout(() => {
      handleClose();
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/85 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        {/* SUCCESS STATE */}
        {isSuccessState ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Data Berhasil Dikosongkan!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              Seluruh aset, stok barang habis pakai, peminjaman, pemeliharaan, mutasi, dan supplier telah dibersihkan. Sistem kini siap digunakan seperti baru.
            </p>
          </div>
        ) : step === 1 ? (
          /* KONFIRMASI PERTAMA */
          <div className="p-6 space-y-5">
            {/* Header Dialog */}
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    ⚠️ PERINGATAN
                  </h3>
                  <button
                    onClick={handleClose}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2 space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  <p>
                    Anda akan menghapus seluruh data SIMASET.
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 font-normal">
                    Tindakan ini akan menghapus seluruh data aset, inventaris, barang habis pakai, peminjaman, pemeliharaan, mutasi, supplier, pengguna tambahan, transaksi, dan riwayat.
                  </p>
                  <p className="text-rose-600 dark:text-rose-400 font-bold">
                    Data yang dihapus tidak dapat dikembalikan.
                  </p>
                  <p className="text-slate-800 dark:text-slate-200 font-semibold pt-1">
                    Apakah Anda yakin ingin melanjutkan?
                  </p>
                </div>
              </div>
            </div>

            {/* Item checklist info */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
                Ringkasan Tindakan Reset:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>Data aset, nomor register, dan kode aset direset ke 0</li>
                <li>Barang habis pakai dan riwayat transaksi stok dikosongkan</li>
                <li>Inventaris dan penempatan barang ruangan dibersihkan</li>
                <li>Riwayat peminjaman, pemeliharaan, dan mutasi dihapus</li>
                <li>Seluruh supplier/rekanan dihapus</li>
                <li>Pengguna tambahan dihapus (Akun Administrator utama dipertahankan)</li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <span>Lanjutkan Reset</span>
              </button>
            </div>
          </div>
        ) : (
          /* KONFIRMASI KEDUA */
          <div className="p-6 space-y-5">
            {/* Header Dialog */}
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse">
                <AlertOctagon className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-rose-700 dark:text-rose-400 flex items-center gap-2">
                    🚨 KONFIRMASI TERAKHIR
                  </h3>
                  <button
                    onClick={handleClose}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2 space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  <p>
                    Anda benar-benar akan mengosongkan seluruh data SIMASET dan mengembalikan sistem ke kondisi seperti baru digunakan.
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">
                    Pastikan Anda sudah memiliki backup jika data lama masih diperlukan.
                  </p>
                  <p className="text-slate-900 dark:text-white font-bold pt-1">
                    Ketik <span className="underline decoration-rose-500 font-mono text-rose-600 dark:text-rose-400">RESET</span> pada kolom di bawah untuk mengonfirmasi penghapusan.
                  </p>
                </div>
              </div>
            </div>

            {/* Input field */}
            <div className="space-y-1.5 p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
              <label
                htmlFor="resetConfirmationInput"
                className="block text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                Ketik RESET untuk melanjutkan:
              </label>
              <input
                id="resetConfirmationInput"
                type="text"
                value={confirmInput}
                onChange={e => setConfirmInput(e.target.value)}
                placeholder="Ketik RESET untuk melanjutkan"
                autoFocus
                autoComplete="off"
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-white dark:bg-slate-900 border-2 border-rose-300 dark:border-rose-800 focus:border-rose-600 dark:focus:border-rose-500 rounded-xl outline-hidden text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {confirmInput.trim() === 'RESET' ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Konfirmasi valid. Tombol &quot;Hapus Semua Data&quot; aktif.
                  </span>
                ) : (
                  <span>Tulis kata &quot;<strong>RESET</strong>&quot; (huruf besar) persis tanpa spasi.</span>
                )}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                disabled={confirmInput.trim() !== 'RESET'}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Hapus Semua Data</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
