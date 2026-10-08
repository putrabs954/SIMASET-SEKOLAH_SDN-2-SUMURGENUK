import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  QrCode,
  Search,
  Upload,
  Eye,
  Edit,
  Truck,
  ArrowLeftRight,
  Wrench,
  CheckCircle2,
  AlertCircle,
  VideoOff,
} from 'lucide-react';
import { db } from '../../services/db';
import { Asset } from '../../types';
import { ConditionBadge, StatusBadge } from '../common/Badge';
import { formatRupiah } from '../../utils/formatters';

interface QRScannerViewProps {
  onOpenDetail: (asset: Asset) => void;
  onOpenEdit: (asset: Asset) => void;
  onOpenMutate: (asset: Asset) => void;
  onOpenBorrow: (asset: Asset) => void;
  onOpenMaintenance: (asset: Asset) => void;
}

export const QRScannerView: React.FC<QRScannerViewProps> = ({
  onOpenDetail,
  onOpenEdit,
  onOpenMutate,
  onOpenBorrow,
  onOpenMaintenance,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [notFoundError, setNotFoundError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera tidak didukung oleh browser Anda.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('Izin kamera tidak diberikan atau perangkat kamera tidak terdeteksi. Silakan gunakan pencarian manual atau upload gambar label di bawah.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleLookupCode = (codeToLookup: string) => {
    setNotFoundError(null);
    const clean = codeToLookup.replace('SIMASET:', '').split(':')[0].trim();
    if (!clean) return;
    const found = db.getAssetByCode(clean);
    if (found) {
      setScannedAsset(found);
      setManualCode('');
      setNotFoundError(null);
    } else {
      setNotFoundError(`Aset dengan kode "${clean}" tidak ditemukan di database.`);
      setTimeout(() => setNotFoundError(null), 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Pemindai QR Code Fisik Aset</h3>
            <p className="text-xs text-slate-500">Pindai label stiker aset di ruangan untuk audit cepat, mutasi, atau pemeriksaan kondisi</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Camera & Scanner Viewport */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
            Kamera Pemindai
          </h4>

          <div className="relative aspect-square w-full rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border-2 border-slate-800">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {/* Scanner Target Overlay Box */}
                <div className="absolute inset-12 border-2 border-blue-500/80 rounded-2xl pointer-events-none animate-pulse flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-blue-400" />
                    <span className="w-4 h-4 border-t-2 border-r-2 border-blue-400" />
                  </div>
                  <p className="text-[10px] text-center text-blue-200 bg-slate-900/60 py-0.5 rounded">
                    Arahkan ke QR Code Label
                  </p>
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-blue-400" />
                    <span className="w-4 h-4 border-b-2 border-r-2 border-blue-400" />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-6 text-slate-400 space-y-2">
                <Camera className="w-12 h-12 mx-auto opacity-30 text-white" />
                <p className="text-xs font-semibold text-slate-300">Kamera Sedang Nonaktif</p>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Klik tombol di bawah untuk mengaktifkan video kamera perangkat Anda.
                </p>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{cameraError}</p>
            </div>
          )}

          <div className="flex gap-2">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition"
              >
                <Camera className="w-4 h-4" />
                <span>Buka Kamera Sekarang</span>
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition"
              >
                <VideoOff className="w-4 h-4" />
                <span>Matikan Kamera</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Manual Input & Instant Scan Result */}
        <div className="space-y-4">
          {/* Quick Manual Code Lookup */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Input Kode Aset / Barcode Cepat
            </h4>
            {notFoundError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {notFoundError}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLookupCode(manualCode)}
                placeholder="Contoh: AST-2026-0001"
                className="flex-1 px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-blue-600"
              />
              <button
                onClick={() => handleLookupCode(manualCode)}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs shadow-xs transition"
              >
                Cari Aset
              </button>
            </div>

            <div className="pt-2 text-xs text-slate-500">
              <p className="font-semibold mb-1">Coba cepat dengan aset terdaftar:</p>
              <div className="flex flex-wrap gap-1.5">
                {db.getAssets(false).slice(0, 4).map(a => (
                  <button
                    key={a.id}
                    onClick={() => handleLookupCode(a.code)}
                    className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-md font-mono text-[10px] font-bold transition"
                  >
                    {a.code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scanned Asset Passport Card */}
          {scannedAsset ? (
            <div className="p-5 rounded-2xl bg-blue-50/50 border-2 border-blue-200 shadow-md space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ConditionBadge condition={scannedAsset.condition} />
                    <StatusBadge status={scannedAsset.status} />
                  </div>
                  <h4 className="font-black text-sm text-slate-900 mt-2">{scannedAsset.name}</h4>
                  <p className="font-mono text-xs font-bold text-blue-700">{scannedAsset.code}</p>
                </div>
                {scannedAsset.photoUrl && (
                  <img
                    src={scannedAsset.photoUrl}
                    alt={scannedAsset.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-300 shrink-0"
                  />
                )}
              </div>

              <div className="text-xs space-y-1.5 pt-2 border-t border-blue-200 text-slate-700">
                <p>Ruangan: <strong>{db.getRoomById(scannedAsset.roomId)?.name || 'Gudang'}</strong></p>
                <p>Penanggung Jawab: <strong>{scannedAsset.picName}</strong></p>
                <p>Harga Perolehan: <strong className="font-mono text-emerald-700">{formatRupiah(scannedAsset.acquisitionPrice)}</strong></p>
                <p>Spesifikasi: <span className="font-mono text-[11px] text-slate-600">{scannedAsset.specification}</span></p>
              </div>

              {/* Quick Actions after scan */}
              <div className="pt-2 border-t border-blue-200 flex flex-wrap gap-2">
                <button
                  onClick={() => onOpenDetail(scannedAsset)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detail Paspor</span>
                </button>
                <button
                  onClick={() => onOpenMutate(scannedAsset)}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs"
                >
                  <Truck className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onOpenBorrow(scannedAsset)}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onOpenMaintenance(scannedAsset)}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs"
                >
                  <Wrench className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-400 space-y-1">
              <CheckCircle2 className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs font-semibold">Hasil pemindaian akan langsung tampil di sini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
