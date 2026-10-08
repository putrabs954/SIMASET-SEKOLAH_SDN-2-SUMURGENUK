export type UserRole = 'ADMIN' | 'KEPALA_SEKOLAH' | 'PENGURUS_BARANG' | 'BENDAHARA' | 'GURU' | 'STAFF';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  password?: string;
  password_hash?: string;
  role: UserRole;
  nip?: string;
  phone?: string;
  avatar?: string;
  profile_photo_url?: string;
  profile_photo_filename?: string;
  profile_photo_size?: number;
  profile_photo_type?: string;
  profile_photo_updated_at?: string;
  isActive: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  lastLogin?: string;
  last_login_at?: string;
  mustChangePassword?: boolean;
  createdAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SchoolProfile {
  name: string;
  npsn: string;
  jenjang: 'SD' | 'SMP' | 'SMA' | 'SMK';
  address: string;
  village: string;
  district: string;
  regency: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  headmasterName: string;
  headmasterNip: string;
  assetOfficerName: string;
  assetOfficerNip: string;
  logoUrl?: string;
}

export type AssetCondition = 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
export type AssetStatus = 'Aktif' | 'Dipinjam' | 'Dalam Pemeliharaan' | 'Dipindahkan' | 'Tidak Digunakan' | 'Dihapus';

export interface AssetCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  floor?: string;
  building?: string;
  picName: string;
  picNip?: string;
  notes?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedReason?: string;
}

export interface Supplier {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  npwp?: string;
  nib?: string;
  picName: string;
  notes?: string;
}

export interface Asset {
  id: string;
  code: string; // e.g. AST-2026-0001
  itemCode: string; // Kode Barang Inventaris e.g. 3.05.01.04.001
  registerNumber: string; // e.g. 0001
  name: string;
  categoryId: string;
  subcategory?: string;
  brand: string;
  model?: string;
  specification: string;
  acquisitionYear: number;
  fundingSource: 'BOS Reguler' | 'BOS Kinerja' | 'DAK Fisik' | 'Komite / Hibah' | 'APBD' | 'Lainnya';
  acquisitionPrice: number;
  quantity: number;
  unit: string; // Unit, Buah, Set, Pcs
  condition: AssetCondition;
  roomId: string;
  picName: string;
  supplierId?: string;
  invoiceNumber?: string;
  bastNumber?: string;
  acquisitionDate: string;
  warrantyUntil?: string;
  status: AssetStatus;
  notes?: string;
  photoUrl?: string;
  documents?: string[];
  isDeleted?: boolean; // Soft delete
  deletedAt?: string;
  deletedReason?: string;
  deletedApproval?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockItem {
  id: string;
  code: string; // e.g. BHP-001
  name: string;
  category: 'ATK' | 'Bahan Kebersihan' | 'Bahan Praktik' | 'Bahan Pembelajaran' | 'Lainnya';
  unit: string; // Rim, Dus, Botol, Pcs, Pak, Rol
  initialStock: number;
  currentStock: number;
  minStock: number; // Low stock alert threshold
  unitPrice: number;
  supplierId?: string;
  storageLocation: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedReason?: string;
}

export type StockTransactionType = 'IN' | 'OUT';

export interface StockTransaction {
  id: string;
  transactionNumber: string; // e.g. TRX-IN-2026-001
  type: StockTransactionType;
  date: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplierId?: string;
  fundingSource?: string;
  recipient?: string;
  roomId?: string;
  purpose?: string;
  picName?: string;
  invoiceNumber?: string;
  bastNumber?: string;
  notes?: string;
  createdAt: string;
}

export type BorrowingStatus = 'Dipinjam' | 'Dikembalikan' | 'Terlambat' | 'Rusak';

export interface Borrowing {
  id: string;
  borrowingNumber: string; // e.g. PJ-2026-001
  assetId: string;
  borrowerName: string;
  borrowerRole: string; // Guru, Staff, Siswa / Ekstrakurikuler
  borrowerRoom?: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  purpose: string;
  conditionBefore: AssetCondition;
  conditionAfter?: AssetCondition;
  status: BorrowingStatus;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedReason?: string;
}

export type MaintenanceStatus = 'Menunggu' | 'Diproses' | 'Selesai';

export interface Maintenance {
  id: string;
  maintenanceNumber: string; // e.g. MT-2026-001
  assetId: string;
  date: string;
  damageType: string;
  actionTaken?: string;
  vendorName: string;
  cost: number;
  fundingSource: string;
  status: MaintenanceStatus;
  completionDate?: string;
  notes?: string;
  photoBefore?: string;
  photoAfter?: string;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedReason?: string;
}

export interface AssetMutation {
  id: string;
  mutationNumber: string; // e.g. MUT-2026-001
  assetId: string;
  date: string;
  sourceRoomId: string;
  targetRoomId: string;
  oldPicName: string;
  newPicName: string;
  reason: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  isCancelled?: boolean;
  cancelledAt?: string;
  cancelledReason?: string;
  isDeleted?: boolean;
}

export type DisposalMethod = 'Dilelang' | 'Dihibahkan' | 'Dimusnahkan' | 'Tukar Guling';
export type ApprovalStatus = 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak';

export interface AssetDisposal {
  id: string;
  disposalNumber: string; // e.g. DISP-2026-001
  assetId: string;
  date: string;
  reason: string;
  condition: AssetCondition;
  method: DisposalMethod;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  notes?: string;
  supportingDoc?: string;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  type: 'Faktur / Invoice' | 'BAST' | 'Bukti Pembayaran' | 'Surat Pengadaan' | 'Surat Peminjaman' | 'Surat Mutasi' | 'SK Penghapusan' | 'Foto Aset' | 'Manual / Buku Panduan';
  fileName: string;
  fileSize?: string;
  fileUrl: string;
  relatedAssetId?: string;
  relatedTransactionId?: string;
  uploadDate: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'RESTORE'
    | 'LOGIN'
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'LOGOUT'
    | 'PASSWORD_CHANGED'
    | 'PROFILE_UPDATED'
    | 'PROFILE_PHOTO_UPDATED'
    | 'USER_CREATED'
    | 'USER_UPDATED'
    | 'USER_DEACTIVATED'
    | 'APPROVAL'
    | 'REJECT'
    | 'IMPORT'
    | 'EXPORT'
    | 'CHANGE_ROLE'
    | 'ACTIVATE_USER'
    | 'DEACTIVATE_USER'
    | 'MUTATION'
    | 'BORROW'
    | 'RETURN'
    | 'MAINTENANCE'
    | 'DISPOSAL'
    | 'STOCK_IN'
    | 'STOCK_OUT'
    | 'CANCEL_MUTATION';
  entity: 'Aset' | 'Barang Habis Pakai' | 'Ruangan' | 'Peminjaman' | 'Pemeliharaan' | 'Mutasi' | 'Penghapusan' | 'Pengguna' | 'Pengaturan' | 'Autentikasi';
  entityId?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface NotificationItem {
  id: string;
  type: 'stock_alert' | 'late_borrowing' | 'damaged_asset' | 'maintenance_pending' | 'disposal_pending' | 'system';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SystemSettings {
  assetCodePrefix: string;
  nextAssetSeq: number;
  autoStockAlert: boolean;
  theme: 'light' | 'dark' | 'system';
}

export type ActivePage =
  | 'dashboard'
  | 'assets'
  | 'assets-new'
  | 'assets-detail'
  | 'assets-edit'
  | 'inventory'
  | 'rooms'
  | 'borrowings'
  | 'maintenance'
  | 'mutations'
  | 'disposals'
  | 'suppliers'
  | 'documents'
  | 'reports'
  | 'analytics'
  | 'notifications'
  | 'users'
  | 'settings'
  | 'audit-log'
  | 'qr-scanner'
  | 'recycle-bin';

// Role-Based Permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: [
    'dashboard.view',
    'assets.view',
    'assets.create',
    'assets.edit',
    'assets.delete',
    'inventory.view',
    'inventory.create',
    'inventory.edit',
    'inventory.delete',
    'rooms.view',
    'rooms.create',
    'rooms.edit',
    'rooms.delete',
    'borrowings.view',
    'borrowings.create',
    'borrowings.edit',
    'borrowings.delete',
    'maintenance.view',
    'maintenance.create',
    'maintenance.edit',
    'maintenance.delete',
    'mutations.view',
    'mutations.create',
    'mutations.edit',
    'mutations.delete',
    'disposals.view',
    'disposals.create',
    'disposals.edit',
    'disposals.delete',
    'disposals.approve',
    'suppliers.view',
    'suppliers.create',
    'suppliers.edit',
    'suppliers.delete',
    'documents.view',
    'documents.create',
    'documents.delete',
    'reports.view',
    'reports.export',
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'audit.view',
    'recycle_bin.view',
    'settings.view',
    'settings.edit',
  ],
  KEPALA_SEKOLAH: [
    'dashboard.view',
    'assets.view',
    'inventory.view',
    'rooms.view',
    'borrowings.view',
    'maintenance.view',
    'mutations.view',
    'disposals.view',
    'disposals.approve',
    'reports.view',
    'reports.export',
    'documents.view',
    'audit.view',
  ],
  PENGURUS_BARANG: [
    'dashboard.view',
    'assets.view',
    'assets.create',
    'assets.edit',
    'assets.delete',
    'inventory.view',
    'inventory.create',
    'inventory.edit',
    'inventory.delete',
    'rooms.view',
    'rooms.create',
    'rooms.edit',
    'rooms.delete',
    'borrowings.view',
    'borrowings.create',
    'borrowings.edit',
    'borrowings.delete',
    'maintenance.view',
    'maintenance.create',
    'maintenance.edit',
    'mutations.view',
    'mutations.create',
    'disposals.view',
    'disposals.create',
    'suppliers.view',
    'suppliers.create',
    'documents.view',
    'documents.create',
    'reports.view',
    'reports.export',
    'audit.view',
  ],
  BENDAHARA: [
    'dashboard.view',
    'assets.view',
    'inventory.view',
    'suppliers.view',
    'documents.view',
    'reports.view',
    'reports.export',
    'financials.view',
  ],
  GURU: [
    'dashboard.view',
    'assets.view',
    'rooms.view',
    'borrowings.view',
    'borrowings.create',
  ],
  STAFF: [
    'dashboard.view',
    'assets.view',
    'rooms.view',
    'inventory.view',
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  if (role === 'ADMIN') return true;
  const list = ROLE_PERMISSIONS[role] || [];
  return list.includes(permission);
}
