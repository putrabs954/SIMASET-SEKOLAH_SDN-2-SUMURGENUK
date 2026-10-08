import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Download,
  Printer,
  Trash2,
  Truck,
  RotateCcw,
  CheckSquare,
  Square,
  Eye,
  Edit,
  ArrowUpDown,
  QrCode,
  FileSpreadsheet,
  AlertTriangle,
  Archive,
} from 'lucide-react';
import { Asset, AssetCondition } from '../../types';
import { db } from '../../services/db';
import { formatRupiah, formatDate, formatDateTime, exportToExcel, exportToCsv } from '../../utils/formatters';
import { ConditionBadge, StatusBadge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Modal } from '../common/Modal';

interface AssetListProps {
  onOpenDetail: (asset: Asset) => void;
  onOpenCreate: () => void;
  onOpenEdit: (asset: Asset) => void;
  onOpenPrintLabel: (assets: Asset[]) => void;
  onOpenBorrow: (asset: Asset) => void;
  onOpenMutate: (asset: Asset) => void;
  onOpenMaintenance: (asset: Asset) => void;
  initialConditionFilter?: string;
}

export const AssetList: React.FC<AssetListProps> = ({
  onOpenDetail,
  onOpenCreate,
  onOpenEdit,
  onOpenPrintLabel,
  initialConditionFilter,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState('ALL');
  const [selectedCondition, setSelectedCondition] = useState(initialConditionFilter || 'ALL');
  const [selectedFunding, setSelectedFunding] = useState('ALL');
  const [sortBy, setSortBy] = useState<'code' | 'name' | 'price' | 'date'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkMutateOpen, setBulkMutateOpen] = useState(false);
  const [bulkTargetRoomId, setBulkTargetRoomId] = useState('');
  const [bulkConditionOpen, setBulkConditionOpen] = useState(false);
  const [bulkConditionTarget, setBulkConditionTarget] = useState<AssetCondition>('Baik');

  const categories = db.getCategories();
  const rooms = db.getRooms();

  // Load datasets
  const allActiveAssets = db.getAssets(false);
  const allDeletedAssets = db.getDeletedAssets();

  const currentDataset = activeTab === 'active' ? allActiveAssets : allDeletedAssets;

  // Filtered and sorted dataset
  const filteredAssets = useMemo(() => {
    return currentDataset
      .filter(a => {
        const q = searchQuery.toLowerCase().trim();
        const matchSearch =
          !q ||
          a.name.toLowerCase().includes(q) ||
          a.code.toLowerCase().includes(q) ||
          a.brand.toLowerCase().includes(q) ||
          a.picName.toLowerCase().includes(q);

        const matchCat = selectedCategory === 'ALL' || a.categoryId === selectedCategory;
        const matchRoom = selectedRoom === 'ALL' || a.roomId === selectedRoom;
        const matchCond = selectedCondition === 'ALL' || a.condition === selectedCondition;
        const matchFund = selectedFunding === 'ALL' || a.fundingSource === selectedFunding;

        return matchSearch && matchCat && matchRoom && matchCond && matchFund;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'code') cmp = a.code.localeCompare(b.code);
        else if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
        else if (sortBy === 'price') cmp = a.acquisitionPrice - b.acquisitionPrice;
        else if (sortBy === 'date') cmp = new Date(a.acquisitionDate).getTime() - new Date(b.acquisitionDate).getTime();
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [currentDataset, searchQuery, selectedCategory, selectedRoom, selectedCondition, selectedFunding, sortBy, sortOrder]);

  // Pagination slice
  const totalItems = filteredAssets.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedAssets = filteredAssets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedAssets.length && paginatedAssets.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedAssets.map(a => a.id));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const selectedAssets = allActiveAssets.filter(a => selectedIds.includes(a.id));

  // Single Delete confirmation
  const handleConfirmSingleDelete = () => {
    if (!assetToDelete) return;
    db.softDeleteAsset(assetToDelete.id, 'Dihapus oleh pengguna');
    setAssetToDelete(null);
    setSelectedIds(prev => prev.filter(id => id !== assetToDelete.id));
  };

  // Bulk Delete confirmation
  const handleConfirmBulkDelete = () => {
    db.softDeleteAssetsBulk(selectedIds, 'Penghapusan massal aset terpilih');
    setSelectedIds([]);
    setBulkDeleteOpen(false);
  };

  // Restore handler
  const handleRestore = (asset: Asset) => {
    db.restoreAsset(asset.id);
  };

  // Exports
  const handleExportExcel = () => {
    const dataToExport = filteredAssets.map(a => ({
      'Kode Aset': a.code,
      'Kode Barang': a.itemCode,
      'Nama Barang': a.name,
      Kategori: categories.find(c => c.id === a.categoryId)?.name || '-',
      Merk: a.brand,
      Model: a.model || '-',
      Spesifikasi: a.specification,
      Tahun: a.acquisitionYear,
      'Sumber Dana': a.fundingSource,
      'Harga Perolehan': a.acquisitionPrice,
      Jumlah: a.quantity,
      Satuan: a.unit,
      Kondisi: a.condition,
      Ruangan: rooms.find(r => r.id === a.roomId)?.name || '-',
      'Penanggung Jawab': a.picName,
      Status: a.status,
    }));
    exportToExcel(dataToExport, `SIMASET_Daftar_Aset_${activeTab === 'trash' ? 'Arsip' : 'Aktif'}`);
  };

  const handleExportCsv = () => {
    const dataToExport = filteredAssets.map(a => ({
      code: a.code,
      name: a.name,
      brand: a.brand,
      category: categories.find(c => c.id === a.categoryId)?.name || '-',
      room: rooms.find(r => r.id === a.roomId)?.name || '-',
      condition: a.condition,
      price: a.acquisitionPrice,
      status: a.status,
    }));
    exportToCsv(dataToExport, `SIMASET_Aset_${activeTab === 'trash' ? 'Arsip' : 'Aktif'}`);
  };

  // Bulk actions handlers
  const handleExecuteBulkMutate = () => {
    if (!bulkTargetRoomId) return;
    const targetRoom = rooms.find(r => r.id === bulkTargetRoomId);
    if (!targetRoom) return;

    selectedAssets.forEach(a => {
      db.recordMutation({
        mutationNumber: `MUT-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        assetId: a.id,
        date: new Date().toISOString().split('T')[0],
        sourceRoomId: a.roomId,
        targetRoomId: targetRoom.id,
        oldPicName: a.picName,
        newPicName: targetRoom.picName,
        reason: 'Mutasi massal penataan inventaris ruangan',
        approvedBy: db.getCurrentUser().name,
      });
    });
    setSelectedIds([]);
    setBulkMutateOpen(false);
  };

  const handleExecuteBulkCondition = () => {
    selectedAssets.forEach(a => {
      db.updateAsset(a.id, { condition: bulkConditionTarget });
    });
    setSelectedIds([]);
    setBulkConditionOpen(false);
  };

  const assetToDeleteRoom = assetToDelete ? rooms.find(r => r.id === assetToDelete.roomId) : undefined;

  return (
    <div className="space-y-4">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        {/* Tabs: Active vs Arsip */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab('active');
              setSelectedIds([]);
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'active'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Aset Aktif ({allActiveAssets.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('trash');
              setSelectedIds([]);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'trash'
                ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Arsip Aset ({allDeletedAssets.length})</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition"
            title="Ekspor ke Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition"
            title="Ekspor ke CSV"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {activeTab === 'active' && (
            <button
              onClick={onOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-900/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Aset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari kode, nama barang, merk, PJ..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Kategori Filter */}
          <select
            value={selectedCategory}
            onChange={e => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Ruangan Filter */}
          <select
            value={selectedRoom}
            onChange={e => {
              setSelectedRoom(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
          >
            <option value="ALL">Semua Ruangan</option>
            {rooms.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>

          {/* Kondisi Filter */}
          <select
            value={selectedCondition}
            onChange={e => {
              setSelectedCondition(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none font-medium"
          >
            <option value="ALL">Semua Kondisi</option>
            <option value="Baik">Kondisi: Baik</option>
            <option value="Rusak Ringan">Kondisi: Rusak Ringan</option>
            <option value="Rusak Berat">Kondisi: Rusak Berat</option>
          </select>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 dark:text-slate-500 font-semibold">Sumber Dana:</span>
            {['ALL', 'BOS Reguler', 'BOS Kinerja', 'DAK Fisik', 'Komite / Hibah'].map(fund => (
              <button
                key={fund}
                onClick={() => {
                  setSelectedFunding(fund);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  selectedFunding === fund
                    ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {fund === 'ALL' ? 'Semua' : fund}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 font-semibold">Urutkan:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="code">Kode Aset</option>
              <option value="name">Nama Barang</option>
              <option value="price">Harga Perolehan</option>
              <option value="date">Tanggal Perolehan</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title={sortOrder === 'asc' ? 'Menaik (Asc)' : 'Menurun (Desc)'}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Toolbar when rows selected */}
      {selectedIds.length > 0 && activeTab === 'active' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white border border-slate-800 shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              {selectedIds.length}
            </span>
            <span className="text-xs font-medium">Aset terpilih untuk tindakan massal:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenPrintLabel(selectedAssets)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak QR ({selectedIds.length})</span>
            </button>

            <button
              onClick={() => setBulkMutateOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-xs font-bold transition"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Mutasi Massal</span>
            </button>

            <button
              onClick={() => setBulkConditionOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-bold transition"
            >
              <span>Ubah Kondisi</span>
            </button>

            {/* Bulk Delete Button */}
            <button
              onClick={() => setBulkDeleteOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold transition shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Terpilih ({selectedIds.length})</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs transition text-slate-300"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                {activeTab === 'active' && (
                  <th className="p-3 w-10 text-center">
                    <button onClick={handleSelectAll} className="p-0.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                      {selectedIds.length === paginatedAssets.length && paginatedAssets.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                <th className="p-3">Kode Aset</th>
                <th className="p-3">Nama & Spesifikasi Barang</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Ruangan & PJ</th>
                <th className="p-3">Kondisi</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Nilai Perolehan</th>
                {activeTab === 'trash' && <th className="p-3">Waktu Dihapus</th>}
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'trash' ? 9 : 9} className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-sm">
                      {activeTab === 'active' ? 'Tidak ada data aset yang sesuai filter' : 'Tidak ada aset di arsip terhapus'}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {activeTab === 'active' ? 'Coba sesuaikan kata kunci pencarian atau reset filter.' : 'Seluruh data aset aktif tersimpan aman.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedAssets.map(asset => {
                  const room = rooms.find(r => r.id === asset.roomId);
                  const cat = categories.find(c => c.id === asset.categoryId);
                  const isSelected = selectedIds.includes(asset.id);

                  return (
                    <tr
                      key={asset.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                        isSelected ? 'bg-blue-50/50 dark:bg-blue-950/40' : ''
                      }`}
                    >
                      {activeTab === 'active' && (
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleToggleRow(asset.id)}
                            className="p-0.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}

                      <td className="p-3">
                        <span className="font-mono font-bold text-blue-700 dark:text-blue-400 block">
                          {asset.code}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          Reg: {asset.registerNumber || '-'}
                        </span>
                      </td>

                      <td className="p-3 min-w-[180px]">
                        <button
                          onClick={() => onOpenDetail(asset)}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 text-left block"
                        >
                          {asset.name}
                        </button>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {asset.brand} {asset.model ? `• ${asset.model}` : ''}
                        </p>
                      </td>

                      <td className="p-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                          {cat?.name || 'Umum'}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[150px]">
                          {room?.name || 'Gudang'}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate block">
                          PJ: {asset.picName}
                        </span>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <ConditionBadge condition={asset.condition} />
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <StatusBadge status={asset.status} />
                      </td>

                      <td className="p-3 text-right whitespace-nowrap font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatRupiah(asset.acquisitionPrice)}
                      </td>

                      {activeTab === 'trash' && (
                        <td className="p-3 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                          {formatDateTime(asset.deletedAt)}
                        </td>
                      )}

                      <td className="p-3 text-center whitespace-nowrap">
                        {activeTab === 'active' ? (
                          <div className="flex items-center justify-center gap-1">
                            {/* Action 1: Lihat */}
                            <button
                              onClick={() => onOpenDetail(asset)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
                              title="Lihat Detail Paspor"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Action 2: Edit */}
                            <button
                              onClick={() => onOpenEdit(asset)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition"
                              title="Edit Aset"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* QR label single print */}
                            <button
                              onClick={() => onOpenPrintLabel([asset])}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg transition"
                              title="Cetak Label QR"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>

                            {/* Action 3: Hapus */}
                            <button
                              onClick={() => setAssetToDelete(asset)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                              title="Hapus Aset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRestore(asset)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-bold transition text-[11px]"
                            title="Pulihkan kembali ke daftar aset aktif"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Pulihkan</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Menampilkan <strong>{totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> -{' '}
            <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> dari <strong>{totalItems}</strong> aset
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px]">Tampilkan:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 dark:text-slate-300"
            >
              Sebelumnya
            </button>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 dark:text-slate-300"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog as explicitly specified */}
      <ConfirmDialog
        isOpen={Boolean(assetToDelete)}
        title="Apakah Anda yakin ingin menghapus aset ini?"
        confirmLabel="Hapus Aset"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleConfirmSingleDelete}
        onCancel={() => setAssetToDelete(null)}
      >
        {assetToDelete && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Nama Aset:</span>
              <strong className="text-slate-900 dark:text-slate-100 font-bold">{assetToDelete.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Kode Aset:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{assetToDelete.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Lokasi:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">{assetToDeleteRoom?.name || 'Gudang'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Kondisi:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{assetToDelete.condition}</span>
            </div>
          </div>
        )}
      </ConfirmDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteOpen}
        title="Apakah Anda yakin ingin menghapus aset terpilih ini?"
        confirmLabel="Hapus Aset"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      >
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
          <p className="text-slate-700 dark:text-slate-300">
            Sebanyak <strong>{selectedIds.length} unit aset</strong> akan dipindahkan ke Arsip Aset (Soft Delete).
          </p>
          <div className="max-h-32 overflow-y-auto space-y-1 pt-1 text-[11px]">
            {selectedAssets.map(a => (
              <div key={a.id} className="flex justify-between text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/50 pb-1">
                <span className="truncate max-w-[200px]">{a.name}</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{a.code}</span>
              </div>
            ))}
          </div>
        </div>
      </ConfirmDialog>

      {/* Bulk Mutation Modal */}
      <Modal
        isOpen={bulkMutateOpen}
        onClose={() => setBulkMutateOpen(false)}
        title="Mutasi Massal Aset Terpilih"
        subtitle={`Pindahkan ${selectedAssets.length} unit aset ke ruangan baru sekaligus`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Ruangan Tujuan Baru</label>
            <select
              value={bulkTargetRoomId}
              onChange={e => setBulkTargetRoomId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none font-medium"
            >
              <option value="">-- Pilih Ruangan --</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.code}) - PJ: {r.picName}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 max-h-40 overflow-y-auto space-y-1">
            <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Daftar Aset yang akan dimutasi:</p>
            {selectedAssets.map(a => (
              <div key={a.id} className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{a.code} - {a.name}</span>
                <span className="font-mono text-slate-400 dark:text-slate-500">PJ Lama: {a.picName}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setBulkMutateOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-300"
            >
              Batal
            </button>
            <button
              onClick={handleExecuteBulkMutate}
              disabled={!bulkTargetRoomId}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold disabled:opacity-50"
            >
              Konfirmasi Mutasi Massal
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Condition Modal */}
      <Modal
        isOpen={bulkConditionOpen}
        onClose={() => setBulkConditionOpen(false)}
        title="Perbarui Kondisi Aset Massal"
        subtitle={`Ubah status kelayakan fisik ${selectedAssets.length} unit aset`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Kondisi Fisik Baru</label>
            <select
              value={bulkConditionTarget}
              onChange={e => setBulkConditionTarget(e.target.value as AssetCondition)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none font-bold"
            >
              <option value="Baik">Baik (Siap Pakai)</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setBulkConditionOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-300"
            >
              Batal
            </button>
            <button
              onClick={handleExecuteBulkCondition}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
            >
              Simpan Kondisi Baru
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
