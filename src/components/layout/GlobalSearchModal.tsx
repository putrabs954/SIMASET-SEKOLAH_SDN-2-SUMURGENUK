import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package, Boxes, DoorOpen, ArrowLeftRight, Users2, ArrowRight } from 'lucide-react';
import { db } from '../../services/db';
import { ActivePage, Asset } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: ActivePage) => void;
  onSelectAsset?: (asset: Asset) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectAsset,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Search assets
  const assets = db.getAssets(false).filter(
    a =>
      a.name.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      a.brand.toLowerCase().includes(q) ||
      a.itemCode.toLowerCase().includes(q) ||
      a.picName.toLowerCase().includes(q) ||
      (a.specification && a.specification.toLowerCase().includes(q))
  ).slice(0, 6);

  // Search rooms
  const rooms = db.getRooms().filter(
    r =>
      r.name.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      r.picName.toLowerCase().includes(q)
  ).slice(0, 4);

  // Search consumables
  const consumables = db.getStockItems().filter(
    s =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.storageLocation.toLowerCase().includes(q)
  ).slice(0, 4);

  // Search borrowings
  const borrowings = db.getBorrowings().filter(
    b =>
      b.borrowerName.toLowerCase().includes(q) ||
      b.borrowingNumber.toLowerCase().includes(q) ||
      b.purpose.toLowerCase().includes(q)
  ).slice(0, 3);

  const hasResults = q.length > 0 && (assets.length > 0 || rooms.length > 0 || consumables.length > 0 || borrowings.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-white">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ketik untuk mencari aset, kode, ruangan, ATK, peminjam..."
            className="flex-1 text-sm bg-transparent outline-none text-slate-900 placeholder:text-slate-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!q ? (
            <div className="py-10 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">Ketik minimal 1 karakter untuk melakukan pencarian instan</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {['Laptop', 'Proyektor', 'Kertas', 'Ruang Guru', 'AST-2026'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : !hasResults ? (
            <div className="py-10 text-center text-slate-500">
              <p className="text-sm font-semibold">Tidak ditemukan hasil untuk "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci kode barang, merk, atau nama penanggung jawab.</p>
            </div>
          ) : (
            <>
              {/* Assets Group */}
              {assets.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-blue-600" />
                    Data Aset ({assets.length})
                  </h4>
                  <div className="space-y-1">
                    {assets.map(a => (
                      <div
                        key={a.id}
                        onClick={() => {
                          if (onSelectAsset) onSelectAsset(a);
                          onNavigate('assets');
                          onClose();
                        }}
                        className="px-3 py-2 rounded-xl hover:bg-blue-50/70 cursor-pointer flex items-center justify-between group transition"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900 group-hover:text-blue-700">
                              {a.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                              {a.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {a.brand} • {a.condition} • {formatRupiah(a.acquisitionPrice)} • PIC: {a.picName}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rooms Group */}
              {rooms.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5 flex items-center gap-1.5">
                    <DoorOpen className="w-3.5 h-3.5 text-emerald-600" />
                    Ruangan ({rooms.length})
                  </h4>
                  <div className="space-y-1">
                    {rooms.map(r => (
                      <div
                        key={r.id}
                        onClick={() => {
                          onNavigate('rooms');
                          onClose();
                        }}
                        className="px-3 py-2 rounded-xl hover:bg-emerald-50/70 cursor-pointer flex items-center justify-between group transition"
                      >
                        <div>
                          <span className="font-semibold text-xs text-slate-900 group-hover:text-emerald-700">
                            {r.name} ({r.code})
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {r.building} • PJ: {r.picName}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Consumables Group */}
              {consumables.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-purple-600" />
                    Barang Habis Pakai ({consumables.length})
                  </h4>
                  <div className="space-y-1">
                    {consumables.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onNavigate('inventory');
                          onClose();
                        }}
                        className="px-3 py-2 rounded-xl hover:bg-purple-50/70 cursor-pointer flex items-center justify-between group transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900 group-hover:text-purple-700">
                              {s.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {s.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Stok: <strong>{s.currentStock} {s.unit}</strong> • {s.storageLocation}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tekan <kbd className="font-mono bg-white border border-slate-200 px-1 py-0.5 rounded">↑</kbd> <kbd className="font-mono bg-white border border-slate-200 px-1 py-0.5 rounded">↓</kbd> untuk memilih</span>
          <span>SIMASET Quick Search</span>
        </div>
      </div>
    </div>
  );
};
