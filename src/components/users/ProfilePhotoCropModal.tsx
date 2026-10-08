import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Camera,
  Upload,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Modal } from '../common/Modal';

export interface CroppedPhotoResult {
  url: string;
  filename: string;
  size: number;
  type: string;
  updatedAt: string;
}

interface ProfilePhotoCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (result: CroppedPhotoResult) => void;
  initialImageUrl?: string | null;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ProfilePhotoCropModal: React.FC<ProfilePhotoCropModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialImageUrl,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('foto-profil.jpg');
  const [fileType, setFileType] = useState<string>('image/jpeg');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Crop & Transform state
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Reset state on modal open/close
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setCameraError('');
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      if (initialImageUrl) {
        setImageSrc(initialImageUrl);
      } else {
        setImageSrc(null);
      }
    } else {
      stopCamera();
    }
  }, [isOpen, initialImageUrl, stopCamera]);

  // Handle file selection from disk
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');

    // Format validation
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setErrorMessage('Format foto tidak didukung. Gunakan PNG, JPG, JPEG, atau WEBP.');
      return;
    }

    // Size validation (5 MB)
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('Ukuran foto terlalu besar. Maksimal 5 MB.');
      return;
    }

    setIsProcessing(true);
    setFilename(file.name);
    setFileType(file.type);

    const reader = new FileReader();
    reader.onload = ev => {
      setImageSrc(ev.target?.result as string);
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setIsProcessing(false);
      stopCamera();
    };
    reader.onerror = () => {
      setErrorMessage('Gagal membaca file gambar.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be picked again if desired
    e.target.value = '';
  };

  // Start device camera
  const handleStartCamera = async () => {
    setCameraError('');
    setErrorMessage('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Kamera tidak didukung pada peramban web ini.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError('Tidak dapat mengakses kamera perangkat. Pastikan izin kamera telah diberikan.');
    }
  };

  // Capture snapshot from camera
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setImageSrc(dataUrl);
      setFilename(`foto-kamera-${Date.now()}.jpg`);
      setFileType('image/jpeg');
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      stopCamera();
    }
  };

  // Mouse / Touch drag handling for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Render and draw the live preview in canvas
  useEffect(() => {
    if (!imageSrc || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const size = 300;
      canvas.width = size;
      canvas.height = size;

      ctx.clearRect(0, 0, size, size);

      ctx.save();
      // Translate to center for rotation & zoom
      ctx.translate(size / 2 + pan.x, size / 2 + pan.y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Determine dimensions while keeping aspect ratio
      const imgAspect = img.width / img.height;
      let drawW = size;
      let drawH = size;
      if (imgAspect > 1) {
        drawW = size * imgAspect;
      } else {
        drawH = size / imgAspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    };
  }, [imageSrc, zoom, rotation, pan]);

  // Export cropped, compressed 1:1 image
  const handleApplyCropped = () => {
    if (!imageSrc) return;
    setIsProcessing(true);

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      // High-resolution output canvas (512x512) for sharp retina display
      const outSize = 512;
      const outCanvas = document.createElement('canvas');
      outCanvas.width = outSize;
      outCanvas.height = outSize;
      const ctx = outCanvas.getContext('2d');

      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // Fill transparent or white background
      ctx.clearRect(0, 0, outSize, outSize);

      ctx.save();
      const scaleFactor = outSize / 300; // ratio from preview canvas (300px) to output (512px)
      ctx.translate(outSize / 2 + pan.x * scaleFactor, outSize / 2 + pan.y * scaleFactor);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      const imgAspect = img.width / img.height;
      let drawW = outSize;
      let drawH = outSize;
      if (imgAspect > 1) {
        drawW = outSize * imgAspect;
      } else {
        drawH = outSize / imgAspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Compress to JPEG with 0.88 quality
      const croppedDataUrl = outCanvas.toDataURL('image/jpeg', 0.88);

      // Approximate size from base64
      const head = 'data:image/jpeg;base64,';
      const base64Content = croppedDataUrl.replace(head, '');
      const approxBytes = Math.round((base64Content.length * 3) / 4);

      onApply({
        url: croppedDataUrl,
        filename: filename || 'foto-profil.jpg',
        size: approxBytes,
        type: 'image/jpeg',
        updatedAt: new Date().toISOString(),
      });

      setIsProcessing(false);
      onClose();
    };
    img.onerror = () => {
      setErrorMessage('Gagal memproses crop foto profil.');
      setIsProcessing(false);
    };
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      title="Ubah & Sesuaikan Foto Profil"
      subtitle="Pilih foto, atur posisi perbesaran (zoom), putar (rotate), dan crop rasio 1:1 lingkaran"
      maxWidth="lg"
    >
      <div className="space-y-5 text-xs text-slate-800 dark:text-slate-200">
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Source selector buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".png,.jpg,.jpeg,.webp"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => {
                stopCamera();
                fileInputRef.current?.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Pilih Dari Perangkat</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (isCameraActive) {
                  stopCamera();
                } else {
                  handleStartCamera();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold transition"
            >
              <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{isCameraActive ? 'Tutup Kamera' : 'Ambil Foto (Kamera)'}</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Maks. 5 MB (PNG, JPG, WEBP)
          </span>
        </div>

        {/* Live Camera View if active */}
        {isCameraActive && (
          <div className="p-4 bg-slate-900 rounded-2xl flex flex-col items-center justify-center space-y-3">
            <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-blue-500 shadow-xl bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleCaptureSnapshot}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition"
            >
              <Camera className="w-4 h-4" />
              <span>Ambil Jepretan Foto</span>
            </button>
            {cameraError && <p className="text-xs text-rose-400">{cameraError}</p>}
          </div>
        )}

        {/* Main Crop & Drag Stage */}
        {imageSrc && !isCameraActive && (
          <div className="flex flex-col items-center space-y-4">
            <div
              className="relative w-[300px] h-[300px] bg-slate-900 rounded-2xl overflow-hidden cursor-move shadow-inner select-none touch-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              title="Geser mouse untuk mengatur posisi foto"
            >
              {/* Underlying canvas */}
              <canvas
                ref={previewCanvasRef}
                className="w-full h-full"
              />

              {/* 1:1 Circular Mask Overlay with subtle guide */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* SVG circular cut-out overlay */}
                <svg className="w-full h-full" viewBox="0 0 300 300">
                  <defs>
                    <mask id="circle-crop-mask">
                      <rect width="300" height="300" fill="white" />
                      <circle cx="150" cy="150" r="130" fill="black" />
                    </mask>
                  </defs>
                  <rect
                    width="300"
                    height="300"
                    fill="rgba(15, 23, 42, 0.65)"
                    mask="url(#circle-crop-mask)"
                  />
                  <circle
                    cx="150"
                    cy="150"
                    r="130"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/70 bg-black/50 px-2 py-0.5 rounded-full pointer-events-none">
                Geser untuk menyesuaikan posisi
              </span>
            </div>

            {/* Controls: Zoom slider, Zoom buttons, Rotate button */}
            <div className="w-full max-w-sm space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5 text-blue-600" /> Perbesaran (Zoom)
                </span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Perkecil"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={e => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Perbesar"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold"
                >
                  <RotateCw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Putar 90° (Rotate)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Posisi</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApplyCropped}
            disabled={!imageSrc || isProcessing}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {isProcessing ? (
              <span>Mengunggah foto...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Terapkan Foto Profil</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
