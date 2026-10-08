import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  Search,
  Download,
  Calendar,
  User,
  History,
  CheckCircle2,
  DollarSign,
  Package,
  Eye,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  RotateCcw,
  Archive,
} from 'lucide-react';
import { StockItem, StockTransaction } from '../../types';
import { db } from '../../services/db';
import { formatRupiah, formatDate, formatDateTime, exportToExcel } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const ConsumableList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'items' | 'history' | 'archive'>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals state
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [stockInOpen, setStockInOpen] = useState(false);
  const [stockOutOpen, setStockOutOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<StockItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<StockItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Checkbox selection for bulk delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Form states
  const [itemForm, setItemForm] = useState({
    code: '',
    name: '',
    category: 'ATK' as StockItem['category'],
    unit: 'Rim',
    initialStock: 10,
    minStock: 5,
    unitPrice: 50000,
    storageLocation: 'Gudang TU',
    notes: '',
  });

  const [inForm, setInForm] = useState({
    transactionNumber: `TRX-IN-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
    date: new Date().toISOString().split('T')[0],
    itemId: '',
    quantity: 1,
    unitPrice: 0,
    supplierId: '',
    fundingSource: 'BOS Reguler',
    invoiceNumber: '',
    bastNumber: '',
    notes: '',
  });

  const [outForm, setOutForm] = useState({
    transactionNumber: `TRX-OUT-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
    date: new Date().toISOString().split('T')[0],
    itemId: '',
    quantity: 1,
    recipient: '',
    roomId: '',
    purpose: '',
    notes: '',
  });

  const [outError, setOutError] = useState('');

  const stockItems = db.getStockItems(false);
  const deletedItems = db.getDeletedStockItems();
  const transactions = db.getStockTransactions();
  const suppliers = db.getSuppliers();
  const rooms = db.getRooms();

  const currentItemsDataset = activeTab === 'archive' ? deletedItems : stockItems;

  const filteredItems = currentItemsDataset.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.storageLocation.toLowerCase().includes(q);
    const matchCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleOpenAdd = () => {
    setItemToEdit(null);
    setItemForm({
      code: `BHP-${String(stockItems.length + 1).padStart(3, '0')}`,
      name: '',
      category: 'ATK',
      unit: 'Rim',
      initialStock: 10,
      minStock: 5,
      unitPrice: 50000,
      storageLocation: 'Gudang TU',
      notes: '',
    });
    setNewItemOpen(true);
  };

  const handleOpenEdit = (item: StockItem) => {
    setItemToEdit(item);
    setItemForm({
      code: item.code,
      name: item.name,
      category: item.category,
      unit: item.unit,
      initialStock: item.initialStock,
      minStock: item.minStock,
      unitPrice: item.unitPrice,
      storageLocation: item.storageLocation,
      notes: item.notes || '',
    });
    setNewItemOpen(true);
  };

  const handleOpenStockIn = (item?: StockItem) => {
    const itm = item || stockItems[0];
    setInForm({
      transactionNumber: `TRX-IN-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      date: new Date().toISOString().split('T')[0],
      itemId: itm ? itm.id : '',
      quantity: 5,
      unitPrice: itm ? itm.unitPrice : 0,
      supplierId: itm?.supplierId || suppliers[0]?.id || '',
      fundingSource: 'BOS Reguler',
      invoiceNumber: '',
      bastNumber: '',
      notes: '',
    });
    setStockInOpen(true);
  };

  const handleOpenStockOut = (item?: StockItem) => {
    const itm = item || stockItems[0];
    setOutForm({
      transactionNumber: `TRX-OUT-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      date: new Date().toISOString().split('T')[0],
      itemId: itm ? itm.id : '',
      quantity: 1,
      recipient: '',
      roomId: rooms[0]?.id || '',
      purpose: '',
      notes: '',
    });
    setOutError('');
    setStockOutOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name.trim()) return;

    if (itemToEdit) {
      db.updateStockItem(itemToEdit.id, itemForm);
    } else {
      const code = itemForm.code || `BHP-${String(stockItems.length + 1).padStart(3, '0')}`;
      db.addStockItem({
        ...itemForm,
        code,
        currentStock: itemForm.initialStock,
      });
    }
    setNewItemOpen(false);
    setItemToEdit(null);
  };

  const handleSaveStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inForm.itemId || inForm.quantity <= 0) return;

    db.recordStockIn({
      ...inForm,
      totalPrice: inForm.quantity * inForm.unitPrice,
    });
    setStockInOpen(false);
  };

  const handleSaveStockOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outForm.itemId || outForm.quantity <= 0 || !outForm.recipient.trim()) {
      setOutError('Semua field wajib diisi.');
      return;
    }

    try {
      const item = stockItems.find(i => i.id === outForm.itemId);
      const unitPrice = item ? item.unitPrice : 0;
      db.recordStockOut({
        ...outForm,
        unitPrice,
        totalPrice: unitPrice * outForm.quantity,
      });
      setStockOutOpen(false);
    } catch (err: any) {
      setOutError(err.message);
    }
  };

  // Single Soft Delete
  const handleConfirmSingleDelete = () => {
    if (!itemToDelete) return;
    db.softDeleteStockItem(itemToDelete.id, 'Dihapus oleh pengguna');
    setItemToDelete(null);
    setSelectedIds(prev => prev.filter(id => id !== itemToDelete.id));
  };

  // Bulk Soft Delete
  const handleConfirmBulkDelete = () => {
    db.softDeleteStockItemsBulk(selectedIds, 'Penghapusan massal barang habis pakai');
    setSelectedIds([]);
    setBulkDeleteOpen(false);
  };

  // Restore
  const handleRestore = (item: StockItem) => {
    db.restoreStockItem(item.id);
  };

  const totalValue = stockItems.reduce((sum, item) => sum + item.currentStock * item.unitPrice, 0);
  const lowStockCount = stockItems.filter(i => i.currentStock <= i.minStock).length;

  return (
    <div className="space-y-4">
      {/* Top Banner Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Item Aktif</p>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stockItems.length} Komoditas</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Peringatan Stok Menipis</p>
            <h4 className={`text-xl font-bold mt-0.5 ${lowStockCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {lowStockCount} Item
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Nilai Persediaan</p>
            <h4 className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
              {formatRupiah(totalValue)}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab('items');
              setSelectedIds([]);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'items'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Daftar Barang Aktif ({stockItems.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              setSelectedIds([]);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Histori Transaksi ({transactions.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('archive');
              setSelectedIds([]);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'archive'
                ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Arsip BHP ({deletedItems.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'items' && (
            <>
              <button
                onClick={() => handleOpenStockIn()}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>+ Pasokan Masuk</span>
              </button>

              <button
                onClick={() => handleOpenStockOut()}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>- Pengeluaran KBM</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Barang Baru</span>
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab !== 'history' ? (
        <>
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-colors">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari nama barang, kode, lokasi..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="ATK">ATK (Alat Tulis Kantor)</option>
                <option value="Bahan Kebersihan">Bahan Kebersihan</option>
                <option value="Bahan Praktik">Bahan Praktik / Lab</option>
                <option value="Bahan Pembelajaran">Bahan Pembelajaran</option>
              </select>
            </div>
          </div>

          {/* Bulk Action Toolbar */}
          {selectedIds.length > 0 && activeTab === 'items' && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white border border-slate-800 shadow-xl animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                  {selectedIds.length}
                </span>
                <span className="text-xs font-medium">Barang terpilih untuk tindakan massal</span>
              </div>
              <div className="flex items-center gap-2">
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

          {/* Consumables Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    {activeTab === 'items' && (
                      <th className="p-3 w-10 text-center">
                        <button onClick={handleSelectAll} className="p-0.5 text-slate-500 dark:text-slate-400">
                          {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                    )}
                    <th className="p-3">Kode</th>
                    <th className="p-3">Nama Barang</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Lokasi Simpan</th>
                    <th className="p-3 text-center">Stok Saat Ini</th>
                    <th className="p-3 text-center">Status Stok</th>
                    <th className="p-3 text-right">Harga Satuan</th>
                    <th className="p-3 text-right">Total Nilai</th>
                    {activeTab === 'archive' && <th className="p-3">Waktu Dihapus</th>}
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={activeTab === 'archive' ? 10 : 10} className="text-center py-10 text-slate-400 dark:text-slate-500">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="font-semibold text-sm">
                          {activeTab === 'archive' ? 'Tidak ada barang di arsip' : 'Tidak ada data barang yang sesuai'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => {
                      const isLow = item.currentStock <= item.minStock;
                      const isSelected = selectedIds.includes(item.id);

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                            isSelected ? 'bg-blue-50/50 dark:bg-blue-950/40' : ''
                          }`}
                        >
                          {activeTab === 'items' && (
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleToggleRow(item.id)}
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
                          <td className="p-3 font-mono font-bold text-blue-700 dark:text-blue-400">{item.code}</td>
                          <td className="p-3">
                            <button
                              onClick={() => setDetailItem(item)}
                              className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 text-left block"
                            >
                              {item.name}
                            </button>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">Satuan: {item.unit}</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{item.storageLocation}</td>
                          <td className="p-3 text-center">
                            <span className={`font-mono text-sm font-black ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
                              {item.currentStock} {item.unit}
                            </span>
                            <span className="block text-[10px] text-slate-400 dark:text-slate-500">Min: {item.minStock} {item.unit}</span>
                          </td>
                          <td className="p-3 text-center">
                            {isLow ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                                STOK MENIPIS
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3 h-3" />
                                Aman
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">
                            {formatRupiah(item.unitPrice)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                            {formatRupiah(item.currentStock * item.unitPrice)}
                          </td>

                          {activeTab === 'archive' && (
                            <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                              {formatDateTime(item.deletedAt)}
                            </td>
                          )}

                          <td className="p-3 text-center whitespace-nowrap">
                            {activeTab === 'items' ? (
                              <div className="flex items-center justify-center gap-1">
                                {/* Action: Lihat */}
                                <button
                                  onClick={() => setDetailItem(item)}
                                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
                                  title="Lihat Detail & Riwayat Transaksi"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* Action: Edit */}
                                <button
                                  onClick={() => handleOpenEdit(item)}
                                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition"
                                  title="Edit Barang"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                {/* Quick Stock In/Out */}
                                <button
                                  onClick={() => handleOpenStockIn(item)}
                                  className="px-1.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded text-[10px] font-bold"
                                  title="Tambah Pasokan Masuk"
                                >
                                  +Masuk
                                </button>
                                <button
                                  onClick={() => handleOpenStockOut(item)}
                                  className="px-1.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded text-[10px] font-bold"
                                  title="Keluarkan Barang"
                                >
                                  -Keluar
                                </button>

                                {/* Action: Hapus (Soft Delete) */}
                                <button
                                  onClick={() => setItemToDelete(item)}
                                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                                  title="Hapus Barang (Soft Delete)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleRestore(item)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-bold transition text-[11px]"
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
          </div>
        </>
      ) : (
        /* History of In / Out Transactions */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Buku Mutasi Barang Habis Pakai</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Histori pencatatan barang masuk dan pengeluaran KBM sekolah</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">No. Transaksi</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Tipe</th>
                  <th className="p-3">Nama Barang</th>
                  <th className="p-3 text-center">Jumlah</th>
                  <th className="p-3">Penerima / Vendor</th>
                  <th className="p-3">Keperluan / Sumber</th>
                  <th className="p-3 text-right">Nilai Transaksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {transactions.map(tx => {
                  const item = db.getStockItemById(tx.itemId);
                  const isIN = tx.type === 'IN';
                  const sup = suppliers.find(s => s.id === tx.supplierId);
                  const rm = rooms.find(r => r.id === tx.roomId);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{tx.transactionNumber}</td>
                      <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-400">{formatDate(tx.date)}</td>
                      <td className="p-3">
                        {isIN ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <ArrowDownLeft className="w-3 h-3" /> MASUK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            <ArrowUpRight className="w-3 h-3" /> KELUAR
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                        {item?.name || 'Barang Terhapus'}
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-mono">{item?.code}</span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-sm">
                        {isIN ? `+${tx.quantity}` : `-${tx.quantity}`} {item?.unit || 'Unit'}
                      </td>
                      <td className="p-3 text-slate-800 dark:text-slate-200">
                        {isIN ? sup?.name || 'Pengadaan Mandiri' : tx.recipient}
                        {rm && <span className="block text-[10px] text-slate-400 dark:text-slate-500">{rm.name}</span>}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {isIN ? tx.fundingSource : tx.purpose || 'KBM Reguler'}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        {tx.totalPrice ? formatRupiah(tx.totalPrice) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Delete Stock Item */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        title="Apakah Anda yakin ingin menghapus barang ini?"
        confirmLabel="Hapus Barang"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleConfirmSingleDelete}
        onCancel={() => setItemToDelete(null)}
      >
        {itemToDelete && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Nama Barang:</span>
              <strong className="text-slate-900 dark:text-slate-100 font-bold">{itemToDelete.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Kode:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{itemToDelete.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Kategori:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">{itemToDelete.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Stok Saat Ini:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{itemToDelete.currentStock} {itemToDelete.unit}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
              *Riwayat transaksi stok barang ini akan tetap tersimpan aman di database.
            </p>
          </div>
        )}
      </ConfirmDialog>

      {/* Confirmation Dialog: Bulk Delete Stock Items */}
      <ConfirmDialog
        isOpen={bulkDeleteOpen}
        title="Hapus Barang Habis Pakai Terpilih?"
        confirmLabel="Hapus Barang"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      >
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Sebanyak <strong>{selectedIds.length} item barang</strong> akan diarsipkan (soft delete). Riwayat transaksi tetap tersimpan.
        </p>
      </ConfirmDialog>

      {/* Detail Item Modal (Lihat) */}
      {detailItem && (
        <Modal
          isOpen={Boolean(detailItem)}
          onClose={() => setDetailItem(null)}
          title={`Detail: ${detailItem.name} (${detailItem.code})`}
          subtitle={`Kategori: ${detailItem.category} • Satuan: ${detailItem.unit}`}
          maxWidth="3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400 block text-[11px]">Stok Tersedia:</span>
                <strong className="text-base font-bold text-slate-900 dark:text-white">
                  {detailItem.currentStock} {detailItem.unit}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Batas Minimum:</span>
                <strong className="text-sm font-semibold text-amber-600">
                  {detailItem.minStock} {detailItem.unit}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Harga Satuan:</span>
                <strong className="text-sm font-mono text-slate-900 dark:text-white">
                  {formatRupiah(detailItem.unitPrice)}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Lokasi Simpan:</span>
                <strong className="text-sm text-slate-900 dark:text-white">
                  {detailItem.storageLocation}
                </strong>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 dark:text-white mb-2">Riwayat Transaksi Barang Ini:</h5>
              <div className="max-h-56 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    <tr>
                      <th className="p-2">No. Transaksi</th>
                      <th className="p-2">Tanggal</th>
                      <th className="p-2">Tipe</th>
                      <th className="p-2 text-center">Jumlah</th>
                      <th className="p-2">Penerima / Vendor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {transactions
                      .filter(t => t.itemId === detailItem.id)
                      .map(t => (
                        <tr key={t.id}>
                          <td className="p-2 font-mono">{t.transactionNumber}</td>
                          <td className="p-2 text-slate-500">{formatDate(t.date)}</td>
                          <td className="p-2 font-bold">{t.type === 'IN' ? '+ Masuk' : '- Keluar'}</td>
                          <td className="p-2 text-center font-mono">{t.quantity} {detailItem.unit}</td>
                          <td className="p-2">{t.recipient || 'Vendor Rekanan'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Tambah / Edit Barang Baru */}
      <Modal
        isOpen={newItemOpen}
        onClose={() => {
          setNewItemOpen(false);
          setItemToEdit(null);
        }}
        title={itemToEdit ? 'Ubah Data Barang Habis Pakai' : 'Pendaftaran Barang Habis Pakai Baru'}
      >
        <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Barang</label>
              <input
                type="text"
                value={itemForm.code}
                onChange={e => setItemForm({ ...itemForm, code: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                placeholder="BHP-001"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
              <select
                value={itemForm.category}
                onChange={e => setItemForm({ ...itemForm, category: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 font-bold"
              >
                <option value="ATK">ATK (Alat Tulis Kantor)</option>
                <option value="Bahan Kebersihan">Bahan Kebersihan</option>
                <option value="Bahan Praktik">Bahan Praktik / Lab</option>
                <option value="Bahan Pembelajaran">Bahan Pembelajaran</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Barang</label>
            <input
              type="text"
              required
              placeholder="Contoh: Kertas HVS A4 80gr PaperOne"
              value={itemForm.name}
              onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg font-semibold"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Satuan</label>
              <input
                type="text"
                required
                placeholder="Rim, Pak, Pcs..."
                value={itemForm.unit}
                onChange={e => setItemForm({ ...itemForm, unit: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>
            {!itemToEdit && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Stok Awal</label>
                <input
                  type="number"
                  min="0"
                  value={itemForm.initialStock}
                  onChange={e => setItemForm({ ...itemForm, initialStock: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                />
              </div>
            )}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Batas Minimum</label>
              <input
                type="number"
                min="0"
                value={itemForm.minStock}
                onChange={e => setItemForm({ ...itemForm, minStock: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Harga Satuan (Rp)</label>
              <input
                type="number"
                min="0"
                value={itemForm.unitPrice}
                onChange={e => setItemForm({ ...itemForm, unitPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi Penyimpanan</label>
              <input
                type="text"
                value={itemForm.storageLocation}
                onChange={e => setItemForm({ ...itemForm, storageLocation: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setNewItemOpen(false);
                setItemToEdit(null);
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
            >
              {itemToEdit ? 'Simpan Perubahan' : 'Simpan Barang'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Tambah Pasokan Masuk */}
      <Modal isOpen={stockInOpen} onClose={() => setStockInOpen(false)} title="Pencatatan Pasokan Masuk (Stock-In)">
        <form onSubmit={handleSaveStockIn} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">No. Bukti / Transaksi</label>
              <input
                type="text"
                value={inForm.transactionNumber}
                onChange={e => setInForm({ ...inForm, transactionNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Masuk</label>
              <input
                type="date"
                value={inForm.date}
                onChange={e => setInForm({ ...inForm, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Barang yang Masuk</label>
            <select
              value={inForm.itemId}
              onChange={e => {
                const itm = stockItems.find(i => i.id === e.target.value);
                setInForm({
                  ...inForm,
                  itemId: e.target.value,
                  unitPrice: itm ? itm.unitPrice : inForm.unitPrice,
                });
              }}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 font-bold"
            >
              {stockItems.map(i => (
                <option key={i.id} value={i.id}>
                  {i.code} - {i.name} (Stok Saat Ini: {i.currentStock} {i.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah Masuk</label>
              <input
                type="number"
                min="1"
                required
                value={inForm.quantity}
                onChange={e => setInForm({ ...inForm, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Harga Satuan Pengadaan (Rp)</label>
              <input
                type="number"
                min="0"
                value={inForm.unitPrice}
                onChange={e => setInForm({ ...inForm, unitPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Supplier / Vendor</label>
              <select
                value={inForm.supplierId}
                onChange={e => setInForm({ ...inForm, supplierId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800"
              >
                <option value="">-- Pilih Rekanan (Opsional) --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sumber Dana</label>
              <select
                value={inForm.fundingSource}
                onChange={e => setInForm({ ...inForm, fundingSource: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 font-medium"
              >
                <option value="BOS Reguler">BOS Reguler</option>
                <option value="BOS Kinerja">BOS Kinerja</option>
                <option value="Komite / Mandiri">Komite / Mandiri</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStockInOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
            >
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold">
              Simpan Barang Masuk
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Pengeluaran Barang */}
      <Modal isOpen={stockOutOpen} onClose={() => setStockOutOpen(false)} title="Pencatatan Pengeluaran Barang (Stock-Out)">
        <form onSubmit={handleSaveStockOut} className="space-y-4 text-xs">
          {outError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold rounded-xl">
              {outError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">No. Permintaan / Bon</label>
              <input
                type="text"
                value={outForm.transactionNumber}
                onChange={e => setOutForm({ ...outForm, transactionNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Keluar</label>
              <input
                type="date"
                value={outForm.date}
                onChange={e => setOutForm({ ...outForm, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Barang yang Dikeluarkan</label>
            <select
              value={outForm.itemId}
              onChange={e => setOutForm({ ...outForm, itemId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 font-bold"
            >
              {stockItems.map(i => (
                <option key={i.id} value={i.id}>
                  {i.code} - {i.name} (Tersedia: {i.currentStock} {i.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah Diambil</label>
              <input
                type="number"
                min="1"
                required
                value={outForm.quantity}
                onChange={e => setOutForm({ ...outForm, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Pemohon / Penerima</label>
              <input
                type="text"
                required
                placeholder="Contoh: Dra. Sri Wahyuni / Guru IPA"
                value={outForm.recipient}
                onChange={e => setOutForm({ ...outForm, recipient: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Untuk Ruangan / Unit</label>
              <select
                value={outForm.roomId}
                onChange={e => setOutForm({ ...outForm, roomId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800"
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Keperluan Penggunaan</label>
              <input
                type="text"
                placeholder="Contoh: Ujian Tengah Semester (PTS)"
                value={outForm.purpose}
                onChange={e => setOutForm({ ...outForm, purpose: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStockOutOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
            >
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold">
              Konfirmasi Pengeluaran
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
