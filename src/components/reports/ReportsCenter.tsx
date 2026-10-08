import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  FileSpreadsheet,
  Filter,
  CheckCircle2,
  Calendar,
  Building,
  DollarSign,
} from 'lucide-react';
import { db } from '../../services/db';
import { formatRupiah, formatDate, exportToExcel, exportToCsv } from '../../utils/formatters';
import { KopSurat } from '../common/KopSurat';

type ReportType =
  | 'buku-inventaris'
  | 'rekap-kategori'
  | 'rekap-ruangan'
  | 'rekap-kondisi'
  | 'rekap-dana'
  | 'rekap-tahun'
  | 'stok-in'
  | 'stok-out'
  | 'stok-sisa'
  | 'peminjaman'
  | 'pemeliharaan'
  | 'mutasi'
  | 'penghapusan'
  | 'neraca-aset';

export const ReportsCenter: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('buku-inventaris');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [roomFilter, setRoomFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const assets = db.getAssets(false);
  const categories = db.getCategories();
  const rooms = db.getRooms();
  const school = db.getSchool();
  const stockItems = db.getStockItems();
  const stockTx = db.getStockTransactions();
  const borrowings = db.getBorrowings();
  const maintenances = db.getMaintenances();
  const mutations = db.getMutations();
  const disposals = db.getDisposals();

  const reportList: { id: ReportType; label: string; desc: string }[] = [
    { id: 'buku-inventaris', label: '1. Buku Inventaris Seluruh Aset', desc: 'Daftar induk seluruh aset tetap milik sekolah' },
    { id: 'rekap-kategori', label: '2. Rekapitulasi Menurut Kategori', desc: 'Rincian jumlah dan nilai per rumpun barang' },
    { id: 'rekap-ruangan', label: '3. Rekapitulasi Menurut Ruangan', desc: 'Sebaran aset pada tiap ruang dan penanggung jawab' },
    { id: 'rekap-kondisi', label: '4. Rekapitulasi Kondisi Barang', desc: 'Rincian barang kondisi baik, rusak ringan, rusak berat' },
    { id: 'rekap-dana', label: '5. Rekap Menurut Sumber Dana', desc: 'Belanja BOS Reguler, BOS Kinerja, DAK, dan Hibah' },
    { id: 'rekap-tahun', label: '6. Rekapitulasi Tahun Perolehan', desc: 'Distribusi tahun pengadaan aset dari awal' },
    { id: 'stok-in', label: '7. Laporan Pengadaan Barang Masuk (BHP)', desc: 'Riwayat penerimaan stok ATK dan kebersihan' },
    { id: 'stok-out', label: '8. Laporan Penyaluran Barang Keluar (BHP)', desc: 'Distribusi pemakaian ATK untuk KBM dan kantor' },
    { id: 'stok-sisa', label: '9. Laporan Sisa Stok Opname (BHP)', desc: 'Posisi saldo akhir dan nilai barang habis pakai' },
    { id: 'peminjaman', label: '10. Laporan Sirkulasi Peminjaman', desc: 'Rekap peminjaman guru, staff, dan siswa' },
    { id: 'pemeliharaan', label: '11. Laporan Pemeliharaan & Biaya', desc: 'Realisasi biaya perbaikan dan teknisi rekanan' },
    { id: 'mutasi', label: '12. Laporan Riwayat Mutasi Ruangan', desc: 'Perpindahan penempatan aset antar ruangan' },
    { id: 'penghapusan', label: '13. Laporan Usulan Penghapusan', desc: 'Daftar barang rusak berat diusulkan lelang' },
    { id: 'neraca-aset', label: '14. Neraca & Valuasi Aset Sekolah', desc: 'Akumulasi total nilai perolehan seluruh sarpras' },
  ];

  // Filtering for assets
  const filteredAssets = assets.filter(a => {
    const matchYear = yearFilter === 'ALL' || String(a.acquisitionYear) === yearFilter;
    const matchRoom = roomFilter === 'ALL' || a.roomId === roomFilter;
    const matchCat = categoryFilter === 'ALL' || a.categoryId === categoryFilter;
    return matchYear && matchRoom && matchCat;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const headers = ['No', 'Kode Aset', 'Kode KIB', 'Nama Barang', 'Merk/Model', 'Kondisi', 'Ruangan', 'Tahun', 'Harga Perolehan', 'Sumber Dana'];
    const rows = filteredAssets.map((a, idx) => [
      idx + 1,
      a.code,
      a.itemCode,
      a.name,
      `${a.brand} ${a.model || ''}`,
      a.condition,
      rooms.find(r => r.id === a.roomId)?.name || '',
      a.acquisitionYear,
      a.acquisitionPrice,
      a.fundingSource,
    ]);
    exportToExcel(`Laporan_${selectedReport}_${new Date().toISOString().split('T')[0]}`, headers, rows, school.name);
  };

  const handleExportCsv = () => {
    const headers = ['Kode Aset', 'Nama Barang', 'Merk', 'Kondisi', 'Harga', 'Sumber Dana'];
    const rows = filteredAssets.map(a => [a.code, a.name, a.brand, a.condition, a.acquisitionPrice, a.fundingSource]);
    exportToCsv(`Laporan_${selectedReport}_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs print:hidden transition-colors">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pusat Laporan & Rekapitulasi Resmi</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Standar laporan administrasi sekolah siap cetak ber-Kop Surat dan tanda tangan</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-900/20 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Report Selection & Filter Controls (Hidden during print) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
        {/* Left: Report Types Selector */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 max-h-[500px] overflow-y-auto text-xs transition-colors">
          <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400 dark:text-slate-500 px-2 py-1">
            Pilih Jenis Laporan
          </p>
          {reportList.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedReport(r.id)}
              className={`w-full text-left px-3 py-2 rounded-xl transition ${
                selectedReport === r.id
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="block leading-tight">{r.label}</span>
            </button>
          ))}
        </div>

        {/* Right: Filter Options */}
        <div className="md:col-span-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs transition-colors">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
            <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Filter Kriteria Laporan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Tahun Perolehan</label>
              <select
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="ALL">Semua Tahun</option>
                <option value="2026">Tahun 2026</option>
                <option value="2025">Tahun 2025</option>
                <option value="2024">Tahun 2024</option>
                <option value="2023">Tahun 2023</option>
                <option value="2022">Tahun 2022</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Ruangan / Unit</label>
              <select
                value={roomFilter}
                onChange={e => setRoomFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="ALL">Semua Ruangan</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Kategori Barang</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="ALL">Semua Kategori</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Official Report Document Paper (Renders on Screen & Prints Formatted) */}
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0">
        <KopSurat />

        {/* Report Document Title */}
        <div className="text-center mb-6">
          <h3 className="text-base font-black uppercase tracking-wider text-slate-900 underline">
            {reportList.find(r => r.id === selectedReport)?.label.slice(3) || 'LAPORAN INVENTARIS'}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Periode: Tahun Anggaran {yearFilter === 'ALL' ? '2026' : yearFilter} | Status per {formatDate(new Date().toISOString())}
          </p>
        </div>

        {/* Dynamic Table Content based on selectedReport */}
        {selectedReport === 'stok-sisa' ? (
          <table className="w-full text-left text-[11px] border-collapse border border-slate-900 mb-8">
            <thead>
              <tr className="bg-slate-100 font-bold uppercase text-center border-b border-slate-900">
                <th className="border border-slate-900 p-2 w-10">No</th>
                <th className="border border-slate-900 p-2">Kode</th>
                <th className="border border-slate-900 p-2">Nama Barang Habis Pakai</th>
                <th className="border border-slate-900 p-2">Kategori</th>
                <th className="border border-slate-900 p-2 text-center">Stok Sisa</th>
                <th className="border border-slate-900 p-2 text-center">Satuan</th>
                <th className="border border-slate-900 p-2 text-right">Harga Satuan</th>
                <th className="border border-slate-900 p-2 text-right">Total Nilai</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-300">
                  <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                  <td className="border border-slate-900 p-2 font-mono font-bold">{item.code}</td>
                  <td className="border border-slate-900 p-2 font-semibold">{item.name}</td>
                  <td className="border border-slate-900 p-2">{item.category}</td>
                  <td className="border border-slate-900 p-2 text-center font-bold">{item.currentStock}</td>
                  <td className="border border-slate-900 p-2 text-center">{item.unit}</td>
                  <td className="border border-slate-900 p-2 text-right font-mono">{formatRupiah(item.unitPrice)}</td>
                  <td className="border border-slate-900 p-2 text-right font-mono font-bold">
                    {formatRupiah(item.currentStock * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : selectedReport === 'pemeliharaan' ? (
          <table className="w-full text-left text-[11px] border-collapse border border-slate-900 mb-8">
            <thead>
              <tr className="bg-slate-100 font-bold uppercase text-center border-b border-slate-900">
                <th className="border border-slate-900 p-2 w-10">No</th>
                <th className="border border-slate-900 p-2">No. Pemeliharaan</th>
                <th className="border border-slate-900 p-2">Aset Terkait</th>
                <th className="border border-slate-900 p-2">Tanggal</th>
                <th className="border border-slate-900 p-2">Vendor / Teknisi</th>
                <th className="border border-slate-900 p-2">Jenis Kerusakan & Tindakan</th>
                <th className="border border-slate-900 p-2 text-right">Biaya (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {maintenances.map((m, idx) => {
                const asset = db.getAssetById(m.assetId);
                return (
                  <tr key={m.id} className="border-b border-slate-300">
                    <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-900 p-2 font-mono font-bold">{m.maintenanceNumber}</td>
                    <td className="border border-slate-900 p-2 font-bold">{asset?.name || m.assetId}</td>
                    <td className="border border-slate-900 p-2">{formatDate(m.date)}</td>
                    <td className="border border-slate-900 p-2">{m.vendorName}</td>
                    <td className="border border-slate-900 p-2">{m.damageType} - {m.actionTaken || 'Diproses'}</td>
                    <td className="border border-slate-900 p-2 text-right font-mono font-bold">{formatRupiah(m.cost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Default: Buku Inventaris Aset Tetap */
          <table className="w-full text-left text-[11px] border-collapse border border-slate-900 mb-8">
            <thead>
              <tr className="bg-slate-100 font-bold uppercase text-center border-b border-slate-900">
                <th className="border border-slate-900 p-2 w-8">No</th>
                <th className="border border-slate-900 p-2">Kode Aset</th>
                <th className="border border-slate-900 p-2">Nama Barang & Spesifikasi</th>
                <th className="border border-slate-900 p-2">Merk / Model</th>
                <th className="border border-slate-900 p-2 text-center">Kondisi</th>
                <th className="border border-slate-900 p-2">Ruangan</th>
                <th className="border border-slate-900 p-2 text-center">Tahun</th>
                <th className="border border-slate-900 p-2">Sumber Dana</th>
                <th className="border border-slate-900 p-2 text-right">Harga Perolehan</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((a, idx) => {
                const room = rooms.find(r => r.id === a.roomId);
                return (
                  <tr key={a.id} className="border-b border-slate-300">
                    <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-900 p-2 font-mono font-bold">{a.code}</td>
                    <td className="border border-slate-900 p-2 font-semibold">
                      {a.name}
                      <span className="block text-[9px] text-slate-500 font-normal">{a.specification}</span>
                    </td>
                    <td className="border border-slate-900 p-2">{a.brand} {a.model || ''}</td>
                    <td className="border border-slate-900 p-2 text-center font-bold">{a.condition}</td>
                    <td className="border border-slate-900 p-2">{room?.name || 'Gudang'}</td>
                    <td className="border border-slate-900 p-2 text-center font-bold">{a.acquisitionYear}</td>
                    <td className="border border-slate-900 p-2">{a.fundingSource}</td>
                    <td className="border border-slate-900 p-2 text-right font-mono font-bold">
                      {formatRupiah(a.acquisitionPrice)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-black border-t-2 border-slate-900">
                <td colSpan={8} className="border border-slate-900 p-2 text-right uppercase">
                  Total Nilai Perolehan Seluruh Aset:
                </td>
                <td className="border border-slate-900 p-2 text-right font-mono text-emerald-800 text-xs">
                  {formatRupiah(filteredAssets.reduce((sum, a) => sum + (a.acquisitionPrice * (a.quantity || 1)), 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        )}

        {/* Official Signatures */}
        <div className="grid grid-cols-2 text-center text-xs mt-10 break-inside-avoid">
          <div>
            <p>Mengetahui,</p>
            <p className="font-semibold">Kepala Sekolah</p>
            <div className="h-20" />
            <p className="font-black underline">{school.headmasterName}</p>
            <p className="text-[11px] text-slate-600">NIP. {school.headmasterNip}</p>
          </div>
          <div>
            <p>{school.regency}, {formatDate(new Date().toISOString())}</p>
            <p className="font-semibold">Pengurus Barang / Pengelola Aset</p>
            <div className="h-20" />
            <p className="font-black underline">{school.assetOfficerName}</p>
            <p className="text-[11px] text-slate-600">NIP. {school.assetOfficerNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
