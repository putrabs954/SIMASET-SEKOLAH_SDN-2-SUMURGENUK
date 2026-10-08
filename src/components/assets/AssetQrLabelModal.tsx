import React, { useEffect, useState } from 'react';
import { Asset } from '../../types';
import { db } from '../../services/db';
import { generateQrDataUrl } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { Printer, Download, Sparkles } from 'lucide-react';

interface AssetQrLabelModalProps {
  assets: Asset[];
  isOpen: boolean;
  onClose: () => void;
}

export const AssetQrLabelModal: React.FC<AssetQrLabelModalProps> = ({
  assets,
  isOpen,
  onClose,
}) => {
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const school = db.getSchool();

  useEffect(() => {
    if (isOpen && assets.length > 0) {
      Promise.all(
        assets.map(async a => {
          const url = await generateQrDataUrl(`SIMASET:${a.code}:${a.name}`);
          return { id: a.id, url };
        })
      ).then(results => {
        const map: Record<string, string> = {};
        results.forEach(r => {
          map[r.id] = r.url;
        });
        setQrMap(map);
      });
    }
  }, [isOpen, assets]);

  if (!isOpen || assets.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cetak Label QR Code Aset Resmi"
      subtitle={`Siap cetak ${assets.length} label stiker inventaris sekolah`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs">
          <div className="flex items-center gap-2 text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Format label resmi: Siap dicetak pada kertas stiker HVS atau stiker label Tom & Jerry / thermal roll.
            </span>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen</span>
          </button>
        </div>

        {/* Printable Label Grid */}
        <div id="printable-qr-labels" className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
          {assets.map(asset => {
            const qr = qrMap[asset.id];
            const room = db.getRoomById(asset.roomId);

            return (
              <div
                key={asset.id}
                className="p-3.5 rounded-xl border-2 border-slate-900 bg-white flex items-center justify-between gap-3 shadow-xs print:shadow-none print:break-inside-avoid"
                style={{ minHeight: '120px' }}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-slate-200">
                    <img src={school.logoUrl || '/icon.svg'} alt="Logo" className="w-4 h-4 object-contain" />
                    <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider truncate">
                      {school.name.replace('SMK NEGERI ', 'SMKN ')}
                    </span>
                  </div>
                  <h4 className="text-xs font-black font-mono tracking-wider text-slate-900">
                    {asset.code}
                  </h4>
                  <p className="text-[11px] font-bold text-slate-800 truncate mt-0.5">
                    {asset.name}
                  </p>
                  <div className="mt-1 text-[9px] text-slate-600 space-y-0.5">
                    <p className="truncate">Merk: {asset.brand} | Tahun: {asset.acquisitionYear}</p>
                    <p className="truncate">Ruang: {room?.name || 'Gudang'} ({room?.code})</p>
                  </div>
                </div>

                {qr && (
                  <div className="shrink-0 p-1 bg-white border border-slate-300 rounded-lg text-center">
                    <img src={qr} alt={asset.code} className="w-20 h-20 object-contain mx-auto" />
                    <span className="text-[8px] font-mono font-bold block text-slate-600 mt-0.5">
                      SCAN ME
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
