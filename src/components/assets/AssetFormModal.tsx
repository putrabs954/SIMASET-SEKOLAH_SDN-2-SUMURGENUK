import React, { useState, useEffect } from 'react';
import { Asset, AssetCondition, Room, Supplier } from '../../types';
import { db } from '../../services/db';
import { Modal } from '../common/Modal';
import {
  Upload,
  Check,
  MapPin,
  Building,
  Plus,
  Phone,
  UserCheck,
  DoorOpen,
  Info,
} from 'lucide-react';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetToEdit?: Asset | null;
  onSaved: (asset: Asset) => void;
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  isOpen,
  onClose,
  assetToEdit,
  onSaved,
}) => {
  const categories = db.getCategories();

  // Reactive state for rooms and suppliers to ensure immediate updates when new ones are added
  const [roomsList, setRoomsList] = useState<Room[]>([]);
  const [suppliersList, setSuppliersList] = useState<Supplier[]>([]);

  // Sub-modal states for adding room or supplier on the fly
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);

  // Quick Add Room Form
  const [newRoomForm, setNewRoomForm] = useState({
    code: '',
    name: '',
    building: 'Gedung A',
    floor: 'Lantai 1',
    picName: '',
  });

  // Quick Add Supplier Form
  const [newSupplierForm, setNewSupplierForm] = useState({
    name: '',
    picName: '',
    phone: '',
    address: '',
    email: '',
    npwp: '',
  });

  const [formData, setFormData] = useState({
    code: '',
    itemCode: '3.05.01.04.001',
    registerNumber: '0001',
    name: '',
    categoryId: categories[0]?.id || '',
    subcategory: '',
    brand: '',
    model: '',
    specification: '',
    acquisitionYear: new Date().getFullYear(),
    fundingSource: 'BOS Reguler' as Asset['fundingSource'],
    acquisitionPrice: 0,
    quantity: 1,
    unit: 'Unit',
    condition: 'Baik' as AssetCondition,
    roomId: '',
    picName: '',
    supplierId: '',
    invoiceNumber: '',
    bastNumber: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    warrantyUntil: '',
    notes: '',
    photoUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync rooms and suppliers when modal opens or DB changes
  useEffect(() => {
    if (isOpen) {
      const activeRooms = db.getRooms(false);
      const activeSuppliers = db.getSuppliers();
      setRoomsList(activeRooms);
      setSuppliersList(activeSuppliers);

      if (assetToEdit) {
        setFormData({
          code: assetToEdit.code,
          itemCode: assetToEdit.itemCode || '',
          registerNumber: assetToEdit.registerNumber || '',
          name: assetToEdit.name,
          categoryId: assetToEdit.categoryId,
          subcategory: assetToEdit.subcategory || '',
          brand: assetToEdit.brand || '',
          model: assetToEdit.model || '',
          specification: assetToEdit.specification || '',
          acquisitionYear: assetToEdit.acquisitionYear,
          fundingSource: assetToEdit.fundingSource,
          acquisitionPrice: assetToEdit.acquisitionPrice,
          quantity: assetToEdit.quantity || 1,
          unit: assetToEdit.unit || 'Unit',
          condition: assetToEdit.condition,
          roomId: assetToEdit.roomId,
          picName: assetToEdit.picName,
          supplierId: assetToEdit.supplierId || '',
          invoiceNumber: assetToEdit.invoiceNumber || '',
          bastNumber: assetToEdit.bastNumber || '',
          acquisitionDate: assetToEdit.acquisitionDate,
          warrantyUntil: assetToEdit.warrantyUntil || '',
          notes: assetToEdit.notes || '',
          photoUrl: assetToEdit.photoUrl || '',
        });
      } else {
        // New Asset: Generate automatic unique code and select first available room or leave empty
        const autoCode = db.generateNextAssetCode();
        const defaultRoom = activeRooms[0];
        setFormData({
          code: autoCode,
          itemCode: '3.05.01.04.001',
          registerNumber: String(db.getState().settings.nextAssetSeq).padStart(4, '0'),
          name: '',
          categoryId: categories[0]?.id || '',
          subcategory: '',
          brand: '',
          model: '',
          specification: '',
          acquisitionYear: new Date().getFullYear(),
          fundingSource: 'BOS Reguler',
          acquisitionPrice: 0,
          quantity: 1,
          unit: 'Unit',
          condition: 'Baik',
          roomId: defaultRoom?.id || '',
          picName: defaultRoom?.picName || '',
          supplierId: activeSuppliers[0]?.id || '',
          invoiceNumber: '',
          bastNumber: '',
          acquisitionDate: new Date().toISOString().split('T')[0],
          warrantyUntil: '',
          notes: '',
          photoUrl: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, assetToEdit]);

  // When room changes, automatically populate room PIC
  const handleRoomChange = (rId: string) => {
    const selectedRoom = roomsList.find(r => r.id === rId);
    setFormData(prev => ({
      ...prev,
      roomId: rId,
      picName: selectedRoom ? selectedRoom.picName : prev.picName,
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick Add Room Handler
  const [quickRoomError, setQuickRoomError] = useState('');
  const [quickSupplierError, setQuickSupplierError] = useState('');

  const handleSaveQuickRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomForm.code.trim() || !newRoomForm.name.trim() || !newRoomForm.picName.trim()) {
      setQuickRoomError('Mohon lengkapi kode ruangan, nama ruangan, dan penanggung jawab!');
      return;
    }
    setQuickRoomError('');

    const createdRoom = db.addRoom({
      code: newRoomForm.code.trim(),
      name: newRoomForm.name.trim(),
      building: newRoomForm.building.trim(),
      floor: newRoomForm.floor.trim(),
      picName: newRoomForm.picName.trim(),
    });

    const updatedRooms = db.getRooms(false);
    setRoomsList(updatedRooms);

    // Automatically select the newly created room
    setFormData(prev => ({
      ...prev,
      roomId: createdRoom.id,
      picName: createdRoom.picName,
    }));

    setShowAddRoomModal(false);
    setNewRoomForm({
      code: '',
      name: '',
      building: 'Gedung A',
      floor: 'Lantai 1',
      picName: '',
    });
  };

  // Quick Add Supplier Handler
  const handleSaveQuickSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierForm.name.trim() || !newSupplierForm.picName.trim() || !newSupplierForm.phone.trim()) {
      setQuickSupplierError('Mohon lengkapi nama supplier, nama PIC, dan nomor telepon!');
      return;
    }
    setQuickSupplierError('');

    const createdSupplier = db.addSupplier({
      name: newSupplierForm.name.trim(),
      picName: newSupplierForm.picName.trim(),
      phone: newSupplierForm.phone.trim(),
      address: newSupplierForm.address.trim() || 'Alamat Belum Diisi',
      email: newSupplierForm.email.trim(),
      npwp: newSupplierForm.npwp.trim(),
    });

    const updatedSuppliers = db.getSuppliers();
    setSuppliersList(updatedSuppliers);

    // Automatically select the newly created supplier
    setFormData(prev => ({
      ...prev,
      supplierId: createdSupplier.id,
    }));

    setShowAddSupplierModal(false);
    setNewSupplierForm({
      name: '',
      picName: '',
      phone: '',
      address: '',
      email: '',
      npwp: '',
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Nama aset wajib diisi';
    if (!formData.brand.trim()) errs.brand = 'Merk wajib diisi';
    if (!formData.roomId) errs.roomId = 'Ruangan penempatan wajib dipilih';
    if (!formData.picName.trim()) errs.picName = 'Penanggung jawab wajib diisi';
    if (formData.acquisitionPrice < 0) errs.acquisitionPrice = 'Harga perolehan tidak boleh negatif';
    if (formData.quantity < 1) errs.quantity = 'Jumlah minimal 1';

    // Duplicate check for new code
    if (!assetToEdit) {
      const exists = db.getAssetByCode(formData.code);
      if (exists) errs.code = 'Kode aset sudah digunakan';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (assetToEdit) {
      const updated = db.updateAsset(assetToEdit.id, formData);
      if (updated) onSaved(updated);
    } else {
      const created = db.addAsset({
        ...formData,
        status: 'Aktif',
      });
      onSaved(created);
    }
    onClose();
  };

  const selectedRoomObj = roomsList.find(r => r.id === formData.roomId);
  const selectedSupplierObj = suppliersList.find(s => s.id === formData.supplierId);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={assetToEdit ? 'Ubah Data Aset' : 'Registrasi Aset Baru'}
        subtitle={
          assetToEdit
            ? `Memperbarui rincian aset ${assetToEdit.code}`
            : 'Formulir input inventarisasi barang milik sekolah'
        }
        maxWidth="4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 text-slate-900 dark:text-slate-100">
          {/* Row 1: Kode Otomatis & Identitas Pokok */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kode Aset (Unik Otomatis) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-blue-700 dark:text-blue-400"
                readOnly={!assetToEdit}
              />
              {errors.code && <p className="text-[11px] text-rose-500 mt-1">{errors.code}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kode Barang Inventaris (KIB)
              </label>
              <input
                type="text"
                value={formData.itemCode}
                onChange={e => setFormData({ ...formData, itemCode: e.target.value })}
                placeholder="Contoh: 3.05.01.04.001"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Register
              </label>
              <input
                type="text"
                value={formData.registerNumber}
                onChange={e => setFormData({ ...formData, registerNumber: e.target.value })}
                placeholder="0001"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>

          {/* Row 2: Nama Aset, Merk */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Barang / Aset <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Laptop ASUS ExpertBook B1400"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none"
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Merk / Pabrikan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Contoh: ASUS, Epson, Daikin"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none"
              />
              {errors.brand && <p className="text-[11px] text-rose-500 mt-1">{errors.brand}</p>}
            </div>
          </div>

          {/* Row 3: Kategori, Kondisi, Model */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Aset <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none font-medium"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kondisi Fisik Saat Ini <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.condition}
                onChange={e => setFormData({ ...formData, condition: e.target.value as AssetCondition })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none font-semibold"
              >
                <option value="Baik">Baik (Siap Pakai)</option>
                <option value="Rusak Ringan">Rusak Ringan (Bisa Difungsikan Terbatas)</option>
                <option value="Rusak Berat">Rusak Berat (Perlu Perbaikan / Usul Hapus)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipe / Seri / Model
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                placeholder="Contoh: B1400CEAE / EcoTank L3210"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>

          {/* Row 4: Spesifikasi Lengkap */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Spesifikasi Lengkap / Rincian Teknis
            </label>
            <textarea
              rows={2}
              value={formData.specification}
              onChange={e => setFormData({ ...formData, specification: e.target.value })}
              placeholder="Rincian prosesor, RAM, kapasitas, ukuran dimensi, material, nomor seri..."
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none font-mono"
            />
          </div>

          {/* Row 5: Lokasi Ruangan & Penanggung Jawab DENGAN FITUR PILIH LOKASI & TAMBAH RUANGAN */}
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Lokasi & Ruangan Penempatan Aset
              </span>

              <button
                type="button"
                onClick={() => {
                  setNewRoomForm({
                    code: `R-${String(roomsList.length + 1).padStart(2, '0')}`,
                    name: '',
                    building: 'Gedung A',
                    floor: 'Lantai 1',
                    picName: '',
                  });
                  setShowAddRoomModal(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Ruangan Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Ruangan Penempatan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.roomId}
                  onChange={e => handleRoomChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                >
                  <option value="">-- Pilih Lokasi / Ruangan Penempatan --</option>
                  {roomsList.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} [{r.code}] — {r.building || 'Gedung Sekolah'} ({r.floor || 'Lantai 1'})
                    </option>
                  ))}
                </select>
                {errors.roomId && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.roomId}</p>}

                {roomsList.length === 0 && (
                  <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
                    <span>Belum ada data ruangan di sistem.</span>
                    <button
                      type="button"
                      onClick={() => setShowAddRoomModal(true)}
                      className="font-bold underline text-blue-600 dark:text-blue-400"
                    >
                      Buat Ruangan
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Penanggung Jawab Aset / Ruangan (PIC) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.picName}
                    onChange={e => setFormData({ ...formData, picName: e.target.value })}
                    placeholder="Nama guru / kepala lab / staf penanggung jawab"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                {errors.picName && <p className="text-[11px] text-rose-500 mt-1">{errors.picName}</p>}
              </div>
            </div>

            {/* Selected Room Details Preview */}
            {selectedRoomObj && (
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>
                    Terpilih: <strong>{selectedRoomObj.name}</strong> ({selectedRoomObj.code}) • {selectedRoomObj.building} ({selectedRoomObj.floor})
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  PIC Default: <strong>{selectedRoomObj.picName}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Row 6: Nilai Perolehan & Sumber Dana */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Harga Perolehan Satuan (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.acquisitionPrice}
                onChange={e => setFormData({ ...formData, acquisitionPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none"
              />
              {errors.acquisitionPrice && <p className="text-[11px] text-rose-500 mt-1">{errors.acquisitionPrice}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jumlah & Satuan
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-20 px-2.5 py-2 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                />
                <select
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  className="flex-1 px-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                >
                  <option value="Unit">Unit</option>
                  <option value="Set">Set</option>
                  <option value="Buah">Buah</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Paket">Paket</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sumber Dana Perolehan
              </label>
              <select
                value={formData.fundingSource}
                onChange={e => setFormData({ ...formData, fundingSource: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none font-medium"
              >
                <option value="BOS Reguler">BOS Reguler</option>
                <option value="BOS Kinerja">BOS Kinerja</option>
                <option value="DAK Fisik">DAK Fisik</option>
                <option value="APBD">APBD Provinsi/Kota</option>
                <option value="Komite / Hibah">Komite / Hibah</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tahun Perolehan
              </label>
              <input
                type="number"
                value={formData.acquisitionYear}
                onChange={e => setFormData({ ...formData, acquisitionYear: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          {/* Row 7: Legalitas & Bukti Pengadaan DENGAN FITUR TAMBAH SUPPLIER BARU */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Informasi Rekanan / Supplier & Faktur
              </span>

              <button
                type="button"
                onClick={() => {
                  setNewSupplierForm({
                    name: '',
                    picName: '',
                    phone: '',
                    address: '',
                    email: '',
                    npwp: '',
                  });
                  setShowAddSupplierModal(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Supplier Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier / Rekanan Pengadaan
                </label>
                <select
                  value={formData.supplierId}
                  onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none font-medium"
                >
                  <option value="">-- Pilih Supplier / Rekanan --</option>
                  {suppliersList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (PIC: {s.picName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Faktur / Invoice
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="Contoh: INV/2026/01/MEN-014"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor BAST Pengadaan
                </label>
                <input
                  type="text"
                  value={formData.bastNumber}
                  onChange={e => setFormData({ ...formData, bastNumber: e.target.value })}
                  placeholder="Contoh: BAST/001/SARPRAS/2026"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            {selectedSupplierObj && (
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <span>
                  Perusahaan: <strong>{selectedSupplierObj.name}</strong> • Kontak: {selectedSupplierObj.picName} ({selectedSupplierObj.phone})
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedSupplierObj.address}
                </span>
              </div>
            )}
          </div>

          {/* Row 8: Foto Aset */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Foto Dokumentasi Fisik Aset
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {formData.photoUrl ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
                  <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, photoUrl: '' })}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] flex items-center justify-center shadow-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-36 h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 transition shrink-0">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Unggah Foto</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                <p>Mendukung format JPG, PNG, WebP (maksimal 2MB).</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Atau tempel URL gambar web langsung:</p>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.photoUrl}
                  onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="mt-1 w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-900/20 transition"
            >
              <Check className="w-4 h-4" />
              <span>{assetToEdit ? 'Simpan Perubahan' : 'Daftarkan Aset'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK ADD ROOM SUB-MODAL */}
      <Modal
        isOpen={showAddRoomModal}
        onClose={() => setShowAddRoomModal(false)}
        title="Tambah Ruangan Baru Cepat"
        subtitle="Daftarkan ruangan baru untuk langsung dipilih pada aset ini"
        maxWidth="md"
      >
        <form onSubmit={handleSaveQuickRoom} className="space-y-4 text-xs">
          {quickRoomError && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 font-semibold">
              {quickRoomError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kode Ruangan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newRoomForm.code}
                onChange={e => setNewRoomForm({ ...newRoomForm, code: e.target.value })}
                placeholder="R-05 / LAB-02"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Ruangan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newRoomForm.name}
                onChange={e => setNewRoomForm({ ...newRoomForm, name: e.target.value })}
                placeholder="Lab Multimedia / Kelas X"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gedung</label>
              <input
                type="text"
                value={newRoomForm.building}
                onChange={e => setNewRoomForm({ ...newRoomForm, building: e.target.value })}
                placeholder="Gedung A (Utama)"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lantai</label>
              <input
                type="text"
                value={newRoomForm.floor}
                onChange={e => setNewRoomForm({ ...newRoomForm, floor: e.target.value })}
                placeholder="Lantai 1"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Penanggung Jawab Ruangan (PIC) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newRoomForm.picName}
              onChange={e => setNewRoomForm({ ...newRoomForm, picName: e.target.value })}
              placeholder="Nama guru / staf penanggung jawab ruangan"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddRoomModal(false)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
            >
              Simpan & Pilih Ruangan
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK ADD SUPPLIER SUB-MODAL */}
      <Modal
        isOpen={showAddSupplierModal}
        onClose={() => setShowAddSupplierModal(false)}
        title="Tambah Supplier / Rekanan Baru"
        subtitle="Daftarkan rekanan baru penyedia sarpras sekolah"
        maxWidth="md"
      >
        <form onSubmit={handleSaveQuickSupplier} className="space-y-4 text-xs">
          {quickSupplierError && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 font-semibold">
              {quickSupplierError}
            </div>
          )}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Perusahaan / Rekanan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newSupplierForm.name}
              onChange={e => setNewSupplierForm({ ...newSupplierForm, name: e.target.value })}
              placeholder="PT Mandiri Sarana Edukasi / CV Bintang Komputer"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama PIC / Kontak Sales <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newSupplierForm.picName}
                onChange={e => setNewSupplierForm({ ...newSupplierForm, picName: e.target.value })}
                placeholder="Bpk. Hendra Wijaya"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Telepon / WA <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newSupplierForm.phone}
                onChange={e => setNewSupplierForm({ ...newSupplierForm, phone: e.target.value })}
                placeholder="0812-3456-7890"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Lengkap Perusahaan
            </label>
            <input
              type="text"
              value={newSupplierForm.address}
              onChange={e => setNewSupplierForm({ ...newSupplierForm, address: e.target.value })}
              placeholder="Jl. Sukajadi No. 120, Kota Bandung"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Resmi</label>
              <input
                type="email"
                value={newSupplierForm.email}
                onChange={e => setNewSupplierForm({ ...newSupplierForm, email: e.target.value })}
                placeholder="sales@mandirisarana.co.id"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">NPWP / NIB (Opsional)</label>
              <input
                type="text"
                value={newSupplierForm.npwp}
                onChange={e => setNewSupplierForm({ ...newSupplierForm, npwp: e.target.value })}
                placeholder="01.234.567.8-901.000"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddSupplierModal(false)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
            >
              Simpan & Pilih Supplier
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
