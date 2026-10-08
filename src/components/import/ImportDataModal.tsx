import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { db } from '../../services/db';
import { Asset, AssetCondition } from '../../types';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedRow {
  index: number;
  code: string;
  name: string;
  brand: string;
  category: string;
  room: string;
  condition: AssetCondition;
  price: number;
  year: number;
  funding: string;
  pic: string;
  status: 'valid' | 'duplicate' | 'invalid';
  errorMsg?: string;
}

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [importSummary, setImportSummary] = useState({ success: 0, duplicate: 0, failed: 0 });
  const [csvError, setCsvError] = useState('');

  const rooms = db.getRooms();
  const categories = db.getCategories();
  const existingAssets = db.getAssets(true);

  const sampleCsv = `Kode Aset,Nama Barang,Merk,Kategori,Ruangan,Kondisi,Harga,Tahun,Sumber Dana,Penanggung Jawab
AST-2026-0020,Laptop Acer Aspire 5,Acer,TIK,Laboratorium Komputer 1,Baik,7800000,2026,BOS Reguler,Rian Prasetya
AST-2026-0021,Mikrofon Wireless Shure,Shure,AVM,Ruang Guru,Baik,1500000,2026,BOS Kinerja,Siti Rahmawati
AST-2026-0022,Lemari Kaca Mikroskop,Graha Mebel,MEB,Laboratorium Komputer 2,Baik,3200000,2025,DAK Fisik,Ahmad Fauzi`;

  const handleDownloadSample = () => {
    const blob = new Blob(['\uFEFF' + sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Template_Import_Aset_SIMASET.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = event => {
        const text = event.target?.result as string;
        setFileContent(text);
        parseAndValidate(text);
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSampleData = () => {
    setFileName('Sample_Data_Aset.csv');
    setFileContent(sampleCsv);
    parseAndValidate(sampleCsv);
  };

  const parseAndValidate = (csvText: string) => {
    setCsvError('');
    const lines = csvText.split(/\r\n|\n/).filter(l => l.trim().length > 0);
    if (lines.length <= 1) {
      setCsvError('File CSV tidak memiliki data atau baris kosong.');
      return;
    }

    const rows: ParsedRow[] = [];
    const existingCodes = new Set(existingAssets.map(a => a.code.toLowerCase()));
    const batchCodes = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      const code = parts[0] || '';
      const name = parts[1] || '';
      const brand = parts[2] || '';
      const category = parts[3] || 'TIK';
      const room = parts[4] || 'Gudang';
      const condition = (['Baik', 'Rusak Ringan', 'Rusak Berat'].includes(parts[5]) ? parts[5] : 'Baik') as AssetCondition;
      const price = Number(parts[6]) || 0;
      const year = Number(parts[7]) || new Date().getFullYear();
      const funding = parts[8] || 'BOS Reguler';
      const pic = parts[9] || 'Staff Sarpras';

      let status: 'valid' | 'duplicate' | 'invalid' = 'valid';
      let errorMsg = '';

      if (!name) {
        status = 'invalid';
        errorMsg = 'Nama barang kosong';
      } else if (!code) {
        status = 'invalid';
        errorMsg = 'Kode aset wajib diisi';
      } else if (existingCodes.has(code.toLowerCase()) || batchCodes.has(code.toLowerCase())) {
        status = 'duplicate';
        errorMsg = 'Kode aset sudah terdaftar di sistem';
      }

      batchCodes.add(code.toLowerCase());

      rows.push({
        index: i,
        code,
        name,
        brand,
        category,
        room,
        condition,
        price,
        year,
        funding,
        pic,
        status,
        errorMsg,
      });
    }

    setParsedRows(rows);
    setStep('preview');
  };

  const handleExecuteImport = () => {
    const validRows = parsedRows.filter(r => r.status === 'valid');
    let importedCount = 0;

    validRows.forEach(row => {
      // Find or default room & category
      const matchedRoom = rooms.find(
        r => r.name.toLowerCase().includes(row.room.toLowerCase()) || r.code.toLowerCase() === row.room.toLowerCase()
      ) || rooms[0];

      const matchedCat = categories.find(
        c => c.name.toLowerCase().includes(row.category.toLowerCase()) || c.code.toLowerCase() === row.category.toLowerCase()
      ) || categories[0];

      db.addAsset({
        code: row.code,
        itemCode: '3.05.01.04.001',
        registerNumber: row.code.split('-').pop() || '0001',
        name: row.name,
        brand: row.brand || 'Standar',
        categoryId: matchedCat?.id || 'cat-1',
        specification: `Impor dari file ${fileName}`,
        acquisitionYear: row.year,
        fundingSource: (row.funding as any) || 'BOS Reguler',
        acquisitionPrice: row.price,
        quantity: 1,
        unit: 'Unit',
        condition: row.condition,
        roomId: matchedRoom?.id || 'rm-10',
        picName: row.pic || matchedRoom?.picName || 'Pengurus Barang',
        acquisitionDate: new Date().toISOString().split('T')[0],
        status: 'Aktif',
      });
      importedCount++;
    });

    const duplicates = parsedRows.filter(r => r.status === 'duplicate').length;
    const failed = parsedRows.filter(r => r.status === 'invalid').length;

    setImportSummary({
      success: importedCount,
      duplicate: duplicates,
      failed,
    });
    setStep('result');
    onSuccess();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Data Aset Excel / CSV"
      subtitle="Unggah berkas spreadsheet dan lakukan validasi otomatis sebelum masuk ke basis data"
      maxWidth="4xl"
    >
      {step === 'upload' && (
        <div className="space-y-6 text-xs">
          {csvError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold flex items-center justify-between">
              <span>{csvError}</span>
              <button onClick={() => setCsvError('')} className="underline text-[11px]">Tutup</button>
            </div>
          )}
          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div>
              <h4 className="font-bold text-blue-900">Format Template Kolom CSV</h4>
              <p className="text-blue-700 text-[11px] mt-0.5">
                Pastikan susunan kolom: Kode Aset, Nama Barang, Merk, Kategori, Ruangan, Kondisi, Harga, Tahun, Sumber Dana, PJ.
              </p>
            </div>
            <button
              onClick={handleDownloadSample}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template</span>
            </button>
          </div>

          <label className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl cursor-pointer bg-slate-50 transition text-center">
            <Upload className="w-10 h-10 text-slate-400 mb-2" />
            <span className="font-bold text-sm text-slate-800">Klik untuk Memilih File CSV</span>
            <span className="text-slate-500 text-[11px] mt-1">Atau tarik dan lepas file di sini (.csv)</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleLoadSampleData}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Gunakan Data Demo Contoh (3 Baris)
            </button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4 text-xs">
          {/* Summary Pills */}
          <div className="flex gap-3">
            <div className="flex-1 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[11px] font-bold text-emerald-800">Siap Diimpor</span>
              <p className="text-lg font-black text-emerald-700">
                {parsedRows.filter(r => r.status === 'valid').length}
              </p>
            </div>
            <div className="flex-1 p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[11px] font-bold text-amber-800">Kode Duplikat</span>
              <p className="text-lg font-black text-amber-700">
                {parsedRows.filter(r => r.status === 'duplicate').length}
              </p>
            </div>
            <div className="flex-1 p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <span className="text-[11px] font-bold text-rose-800">Data Tidak Valid</span>
              <p className="text-lg font-black text-rose-700">
                {parsedRows.filter(r => r.status === 'invalid').length}
              </p>
            </div>
          </div>

          {/* Table Preview */}
          <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Kode</th>
                  <th className="p-2.5">Nama Barang</th>
                  <th className="p-2.5">Merk</th>
                  <th className="p-2.5">Ruangan</th>
                  <th className="p-2.5">Kondisi</th>
                  <th className="p-2.5 text-right">Harga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-2.5">
                      {r.status === 'valid' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          VALID
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700" title={r.errorMsg}>
                          {r.errorMsg || 'ERROR'}
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-mono font-bold">{r.code}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{r.name}</td>
                    <td className="p-2.5 text-slate-600">{r.brand}</td>
                    <td className="p-2.5 text-slate-600">{r.room}</td>
                    <td className="p-2.5">{r.condition}</td>
                    <td className="p-2.5 text-right font-mono">{r.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-3 border-t">
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2 bg-slate-100 rounded-lg font-medium text-slate-700"
            >
              Pilih Berkas Lain
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={parsedRows.filter(r => r.status === 'valid').length === 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:opacity-50 shadow-md"
            >
              Proses Impor ({parsedRows.filter(r => r.status === 'valid').length} Aset Valid)
            </button>
          </div>
        </div>
      )}

      {step === 'result' && (
        <div className="space-y-6 text-center py-6 text-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Proses Impor Berhasil Selesai!</h4>
            <p className="text-xs text-slate-500 mt-1">Data aset baru telah ditambahkan ke sistem dan siap digunakan.</p>
          </div>

          <div className="flex justify-center gap-6 max-w-sm mx-auto">
            <div>
              <p className="text-2xl font-black text-emerald-600">{importSummary.success}</p>
              <span className="text-[11px] text-slate-500">Berhasil Masuk</span>
            </div>
            <div>
              <p className="text-2xl font-black text-amber-600">{importSummary.duplicate}</p>
              <span className="text-[11px] text-slate-500">Dilewati (Duplikat)</span>
            </div>
            <div>
              <p className="text-2xl font-black text-rose-600">{importSummary.failed}</p>
              <span className="text-[11px] text-slate-500">Gagal</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-md"
          >
            Tutup & Tinjau Tabel Aset
          </button>
        </div>
      )}
    </Modal>
  );
};
