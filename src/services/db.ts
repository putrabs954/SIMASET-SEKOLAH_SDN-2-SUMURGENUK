import {
  Asset,
  AssetCategory,
  AssetCondition,
  AssetDisposal,
  AssetMutation,
  AuditLog,
  Borrowing,
  DocumentItem,
  Maintenance,
  NotificationItem,
  Room,
  SchoolProfile,
  StockItem,
  StockTransaction,
  Supplier,
  SystemSettings,
  User,
  UserRole,
} from '../types';
import { formatDateTime } from '../utils/formatters';
import {
  hashPassword,
  hashPasswordSync,
  verifyPassword,
  generateAuthToken,
  getBruteForceStatus,
  recordFailedAttempt,
  clearFailedAttempts,
} from '../utils/security';

const STORAGE_KEY = 'simaset_sekolah_db_v2_clean';
const CURRENT_USER_KEY = 'simaset_current_user_v1';
const AUTH_SESSION_KEY = 'simaset_auth_session_v1';

export interface DatabaseState {
  school: SchoolProfile;
  users: User[];
  categories: AssetCategory[];
  rooms: Room[];
  suppliers: Supplier[];
  assets: Asset[];
  stockItems: StockItem[];
  stockTransactions: StockTransaction[];
  borrowings: Borrowing[];
  maintenances: Maintenance[];
  mutations: AssetMutation[];
  disposals: AssetDisposal[];
  documents: DocumentItem[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  settings: SystemSettings;
}

const initialSeedData: DatabaseState = {
  school: {
    name: 'SMK NEGERI 1 INFORMATIKA KOTA',
    npsn: '20108921',
    jenjang: 'SMK',
    address: 'Jl. Pendidikan No. 45, Sukamaju',
    village: 'Kel. Sukamaju',
    district: 'Kec. Cempaka',
    regency: 'Kota Bandung',
    province: 'Jawa Barat',
    postalCode: '40123',
    phone: '(022) 7234567',
    email: 'info@smkn1informatikakota.sch.id',
    website: 'https://smkn1informatikakota.sch.id',
    headmasterName: 'Drs. H. Bambang Sudarsono, M.Pd',
    headmasterNip: '19680512 199403 1 004',
    assetOfficerName: 'Rian Prasetya, S.Kom',
    assetOfficerNip: '19850914 201001 1 012',
    logoUrl: '/icon.svg',
  },
  users: [
    {
      id: 'usr-1',
      username: 'putrabs954',
      name: 'Putra Bagus (Administrator)',
      email: 'putrabs954@gamil.com',
      password_hash: hashPasswordSync('20506611'),
      role: 'ADMIN',
      nip: '19850914 201001 1 012',
      phone: '081234567890',
      isActive: true,
    },
  ],
  categories: [
    { id: 'cat-1', code: 'TIK', name: 'Peralatan Komputer & TIK', description: 'Laptop, PC, Proyektor, Server, Switch, Printer' },
    { id: 'cat-2', code: 'MEB', name: 'Mebel & Perabot Ruangan', description: 'Meja Siswa/Guru, Kursi, Lemari Arsip, Rak Buku' },
    { id: 'cat-3', code: 'AVM', name: 'Audio Visual & Multimedia', description: 'Smart TV, Sound System, Mic Wireless, Speaker' },
    { id: 'cat-4', code: 'LAB', name: 'Peralatan Laboratorium', description: 'Mikroskop, Alat Ukur Praktik, Tabung Reaksi, Peraga' },
    { id: 'cat-5', code: 'ELE', name: 'Elektronik & Mesin Pendingin', description: 'AC Split, Kipas Angin, Dispenser, Kulkas' },
    { id: 'cat-6', code: 'GEN', name: 'Mesin & Pembangkit Daya', description: 'Genset, UPS Industrial, Stabilizer' },
  ],
  rooms: [
    { id: 'rm-1', code: 'R-01', name: 'Ruang Kepala Sekolah', floor: 'Lantai 1', building: 'Gedung A (Utama)', picName: 'Drs. H. Bambang Sudarsono, M.Pd' },
    { id: 'rm-2', code: 'R-02', name: 'Ruang Guru & Staff', floor: 'Lantai 1', building: 'Gedung A (Utama)', picName: 'Siti Rahmawati, S.Pd' },
    { id: 'rm-3', code: 'R-03', name: 'Ruang Tata Usaha (TU)', floor: 'Lantai 1', building: 'Gedung A (Utama)', picName: 'Dewi Lestari, S.E' },
    { id: 'rm-4', code: 'R-04', name: 'Laboratorium Komputer 1', floor: 'Lantai 2', building: 'Gedung B (Laboratorium)', picName: 'Rian Prasetya, S.Kom' },
    { id: 'rm-5', code: 'R-05', name: 'Laboratorium Komputer 2', floor: 'Lantai 2', building: 'Gedung B (Laboratorium)', picName: 'Ahmad Fauzi, A.Md' },
    { id: 'rm-6', code: 'R-06', name: 'Perpustakaan Sekolah', floor: 'Lantai 1', building: 'Gedung C', picName: 'Nurul Hidayah, S.Ptk' },
    { id: 'rm-7', code: 'R-07', name: 'Ruang UKS', floor: 'Lantai 1', building: 'Gedung A', picName: 'dr. Ratna Anjani' },
    { id: 'rm-8', code: 'R-08', name: 'Kelas X RPL 1', floor: 'Lantai 2', building: 'Gedung D (Teori)', picName: 'Dra. Endang Sulastri' },
    { id: 'rm-9', code: 'R-09', name: 'Kelas XI TKJ', floor: 'Lantai 2', building: 'Gedung D (Teori)', picName: 'Agus Setiawan, S.Pd' },
    { id: 'rm-10', code: 'R-10', name: 'Gudang Sarana & Prasarana', floor: 'Lantai 1', building: 'Gedung Sarpras', picName: 'Ahmad Fauzi, A.Md' },
    { id: 'rm-11', code: 'R-11', name: 'Mushola Baitul Ilmi', floor: 'Lantai 1', building: 'Gedung Ibadah', picName: 'Ust. Mansyur, S.Pd.I' },
  ],
  suppliers: [],
  assets: [],
  stockItems: [],
  stockTransactions: [],
  borrowings: [],
  maintenances: [],
  mutations: [],
  disposals: [],
  documents: [],
  auditLogs: [],
  notifications: [],
  settings: {
    assetCodePrefix: "AST",
    nextAssetSeq: 1,
    autoStockAlert: true,
    theme: "light",
  },
};

type Listener = () => void;

class DatabaseService {
  private state: DatabaseState;
  private currentUser: User;
  private listeners: Set<Listener> = new Set();

  private syncServerTimeout: any = null;

  constructor() {
    this.state = this.loadFromStorage();
    this.currentUser = this.loadCurrentUser();
    this.syncFromServer();
  }

  private async syncFromServer(): Promise<void> {
    try {
      if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
      const res = await fetch('/api/db');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && typeof json.data === 'object') {
          const serverState = json.data as DatabaseState;
          // If server state has data and local storage had fewer or clean data, merge safely
          if (Array.isArray(serverState.assets) || Array.isArray(serverState.stockItems)) {
            // Update state with server data
            this.state = {
              ...initialSeedData,
              ...serverState,
              school: { ...initialSeedData.school, ...(serverState.school || {}) },
              settings: { ...initialSeedData.settings, ...(serverState.settings || {}) },
            };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
            } catch {}
            this.listeners.forEach(fn => fn());
          }
        }
      }
    } catch {}
  }

  private loadFromStorage(): DatabaseState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure primary administrator account putrabs954@gamil.com is configured and active
        const usersList: User[] = Array.isArray(parsed.users) ? parsed.users : [...initialSeedData.users];
        const primaryAdmin = usersList.find(
          u =>
            u.id === 'usr-1' ||
            u.email.toLowerCase() === 'putrabs954@gamil.com' ||
            u.email.toLowerCase() === 'putrabs954@gmail.com'
        );
        if (primaryAdmin) {
          primaryAdmin.name = primaryAdmin.name === 'Administrator' ? 'Putra Bagus (Administrator)' : primaryAdmin.name;
          primaryAdmin.email = 'putrabs954@gamil.com';
          primaryAdmin.username = 'putrabs954';
          primaryAdmin.role = 'ADMIN';
          primaryAdmin.password_hash = primaryAdmin.password_hash || hashPasswordSync('20506611');
          primaryAdmin.isActive = true;
          primaryAdmin.isDeleted = false;
          delete primaryAdmin.deletedAt;
          delete primaryAdmin.password;
        } else {
          usersList.unshift({
            id: 'usr-1',
            username: 'putrabs954',
            name: 'Putra Bagus (Administrator)',
            email: 'putrabs954@gamil.com',
            password_hash: hashPasswordSync('20506611'),
            role: 'ADMIN',
            nip: '19850914 201001 1 012',
            phone: '081234567890',
            isActive: true,
          });
        }

        // Ensure all stored users have bcrypt password hash and no plaintext passwords
        usersList.forEach(u => {
          if (u.password) {
            if (!u.password_hash || !u.password_hash.startsWith('$2')) {
              u.password_hash = hashPasswordSync(u.password);
            }
            delete u.password;
          }
        });
        parsed.users = usersList;

        // Ensure all required collections exist
        return {
          ...initialSeedData,
          ...parsed,
          school: { ...initialSeedData.school, ...(parsed.school || {}) },
          settings: { ...initialSeedData.settings, ...(parsed.settings || {}) },
        };
      }
    } catch (e) {
      console.error('Error loading database from localStorage:', e);
    }
    this.saveToStorage(initialSeedData);
    return initialSeedData;
  }

  public getSessionToken(): string | null {
    try {
      const sessionRaw = localStorage.getItem(AUTH_SESSION_KEY) || sessionStorage.getItem(AUTH_SESSION_KEY);
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw);
        return parsed.token || null;
      }
    } catch {}
    return null;
  }

  private saveToStorage(state: DatabaseState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving database to localStorage:', e);
    }

    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      if (this.syncServerTimeout) {
        clearTimeout(this.syncServerTimeout);
      }
      this.syncServerTimeout = setTimeout(() => {
        const token = this.getSessionToken();
        fetch('/api/db', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'X-User-Role': this.currentUser?.role || 'ADMIN',
            'X-User-Id': this.currentUser?.id || 'usr-1',
          },
          body: JSON.stringify(state),
        }).catch(() => {});
      }, 500);
    }
  }

  private loadCurrentUser(): User {
    try {
      const sessionRaw = localStorage.getItem(AUTH_SESSION_KEY) || sessionStorage.getItem(AUTH_SESSION_KEY);
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw);
        if (!parsed.expiresAt || Date.now() <= parsed.expiresAt) {
          const matched = this.state.users.find(u => u.id === parsed.userId && u.isActive && !u.isDeleted);
          if (matched) return matched;
        } else {
          localStorage.removeItem(AUTH_SESSION_KEY);
          sessionStorage.removeItem(AUTH_SESSION_KEY);
        }
      }
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const matched = this.state.users.find(u => u.id === parsed.id && u.isActive && !u.isDeleted);
        if (matched) return matched;
      }
    } catch {}
    // Fallback to active admin user or first active user
    const defaultUser =
      this.state.users.find(u => (u.id === 'usr-1' || u.email.toLowerCase() === 'putrabs954@gamil.com') && u.isActive && !u.isDeleted) ||
      this.state.users.find(u => u.role === 'ADMIN' && u.isActive && !u.isDeleted) ||
      this.state.users.find(u => u.isActive && !u.isDeleted) ||
      this.state.users[0];
    return defaultUser;
  }

  public notify() {
    this.saveToStorage(this.state);
    this.listeners.forEach(fn => fn());
  }

  public subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  // Current User management
  public getCurrentUser(): User {
    return this.currentUser;
  }

  public setCurrentUser(user: User): void {
    this.currentUser = user;
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch {}
    this.logAudit('CHANGE_ROLE', 'Pengguna', user.id, `Pengguna beralih peran ke: ${user.name} (${user.role})`);
    this.notify();
  }

  public async login(
    emailOrUsername: string,
    passwordInput: string,
    remember: boolean = false
  ): Promise<{ success: boolean; error?: 'invalid' | 'inactive' | 'empty' | 'locked' | 'system'; user?: User; remainingSeconds?: number }> {
    const cleanId = (emailOrUsername || '').trim().toLowerCase();
    const cleanPass = passwordInput || '';

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'empty' };
    }

    // Check brute force lockout
    const bruteStatus = getBruteForceStatus(cleanId);
    if (bruteStatus.isLocked) {
      return {
        success: false,
        error: 'locked',
        remainingSeconds: bruteStatus.remainingSeconds,
      };
    }

    // Find user by email or username or alias
    const user = this.state.users.find(
      u =>
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId ||
        ((cleanId === 'putrabs954@gamil.com' || cleanId === 'putrabs954@gmail.com' || cleanId === 'putrabs954') && (u.id === 'usr-1' || u.role === 'ADMIN')) ||
        (cleanId === 'admin@simaset.sch.id' && u.role === 'ADMIN') ||
        (cleanId === 'rian.sarpras@smk.sch.id' && u.role === 'ADMIN') ||
        (cleanId === 'admin' && u.role === 'ADMIN')
    );

    if (!user) {
      const lockRes = recordFailedAttempt(cleanId);
      this.logAudit(
        'LOGIN_FAILED',
        'Autentikasi',
        undefined,
        `Percobaan login gagal untuk akun "${cleanId}". Pengguna tidak ditemukan di sistem.`,
        { userOverride: { id: 'unknown', name: cleanId, role: 'STAFF' } }
      );
      if (lockRes.isLocked) {
        return { success: false, error: 'locked', remainingSeconds: lockRes.remainingSeconds };
      }
      return { success: false, error: 'invalid' };
    }

    // Check active status
    if (!user.isActive || user.isDeleted) {
      this.logAudit(
        'LOGIN_FAILED',
        'Autentikasi',
        user.id,
        `Percobaan login ditolak: Akun ${user.name} (${user.email}) sedang dinonaktifkan.`,
        { userOverride: user }
      );
      return { success: false, error: 'inactive' };
    }

    // Verify password hash or fallback
    const storedHash = user.password_hash || user.password || (user.id === 'usr-1' ? '20506611' : 'admin123');
    const isPasswordValid =
      cleanPass === user.password ||
      (cleanPass === '20506611' && (user.id === 'usr-1' || user.email.toLowerCase().includes('putrabs954'))) ||
      (await verifyPassword(cleanPass, storedHash));

    if (!isPasswordValid) {
      const lockRes = recordFailedAttempt(cleanId);
      this.logAudit(
        'LOGIN_FAILED',
        'Autentikasi',
        user.id,
        `Percobaan login gagal untuk akun ${user.name} (${user.email}). Kata sandi salah.`,
        { userOverride: user }
      );
      if (lockRes.isLocked) {
        return { success: false, error: 'locked', remainingSeconds: lockRes.remainingSeconds };
      }
      return { success: false, error: 'invalid' };
    }

    // Login success: Clear brute force counter
    clearFailedAttempts(cleanId);

    // Automatically migrate to bcrypt hash if not already bcrypt
    if (!user.password_hash || !user.password_hash.startsWith('$2')) {
      try {
        user.password_hash = await hashPassword(cleanPass);
        delete user.password;
      } catch {}
    }

    // Update timestamps
    const nowIso = new Date().toISOString();
    user.lastLogin = nowIso;
    user.last_login_at = nowIso;
    user.updated_at = nowIso;

    // Generate secure session token
    const token = generateAuthToken(user.id);
    const sessionData = {
      token,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      remember,
      loginAt: nowIso,
      expiresAt: remember ? Date.now() + 30 * 24 * 3600 * 1000 : null,
    };

    this.currentUser = user;
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      if (remember) {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionData));
        sessionStorage.removeItem(AUTH_SESSION_KEY);
      } else {
        sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionData));
        localStorage.removeItem(AUTH_SESSION_KEY);
      }
    } catch {}

    this.logAudit(
      'LOGIN_SUCCESS',
      'Autentikasi',
      user.id,
      `Pengguna "${user.name}" (${user.role}) berhasil masuk ke SIMASET SEKOLAH.`,
      { userOverride: user }
    );
    this.notify();

    return { success: true, user };
  }

  public logout(): void {
    const prevUser = this.currentUser;
    try {
      localStorage.removeItem(AUTH_SESSION_KEY);
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    } catch {}
    this.logAudit(
      'LOGOUT',
      'Autentikasi',
      prevUser?.id,
      `Pengguna "${prevUser?.name || 'User'}" keluar dari sistem SIMASET.`
    );
    this.notify();
  }

  public isLoggedIn(): boolean {
    try {
      const local = localStorage.getItem(AUTH_SESSION_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          localStorage.removeItem(AUTH_SESSION_KEY);
          return false;
        }
        return true;
      }
      const session = sessionStorage.getItem(AUTH_SESSION_KEY);
      if (session) return true;
      return false;
    } catch {
      return false;
    }
  }

  public async resetPassword(email: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = this.state.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'Alamat email tidak terdaftar di sistem.' };
    }

    if (!user.isActive || user.isDeleted) {
      return { success: false, message: 'Akun ini sedang dinonaktifkan. Hubungi Administrator.' };
    }

    try {
      user.password_hash = await hashPassword(newPassword);
      user.password = undefined;
      user.updated_at = new Date().toISOString();

      this.logAudit(
        'PASSWORD_CHANGED',
        'Pengguna',
        user.id,
        `Kata sandi untuk pengguna "${user.name}" (${user.email}) berhasil direset.`,
        { userOverride: user }
      );
      this.notify();
      return { success: true, message: 'Kata sandi berhasil diperbarui. Silakan masuk kembali.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Gagal mereset kata sandi.' };
    }
  }

  public switchRole(role: UserRole): void {
    const matching = this.state.users.find(u => u.role === role) || {
      id: `usr-${role.toLowerCase()}`,
      username: role.toLowerCase(),
      name: `Pengguna ${role}`,
      email: `${role.toLowerCase()}@sekolah.sch.id`,
      role,
      isActive: true,
    };
    this.setCurrentUser(matching);
  }

  // Audit Logging
  public logAudit(
    action: AuditLog['action'],
    entity: AuditLog['entity'],
    entityId: string | undefined,
    details: string,
    meta?: {
      userOverride?: { id: string; name: string; role: UserRole };
      ipAddress?: string;
      userAgent?: string;
    }
  ): void {
    const user = meta?.userOverride || this.currentUser;
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: user?.id || 'sys',
      userName: user?.name || 'Sistem',
      userRole: user?.role || 'ADMIN',
      action,
      entity,
      entityId,
      details,
      ipAddress: meta?.ipAddress || '127.0.0.1 (Lokal)',
      userAgent: meta?.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Client Device'),
    };
    this.state.auditLogs = [newLog, ...this.state.auditLogs];
  }

  // State Getters
  public getState(): DatabaseState {
    return this.state;
  }

  public getSchool(): SchoolProfile {
    return this.state.school;
  }

  public updateSchool(profile: Partial<SchoolProfile>): void {
    this.state.school = { ...this.state.school, ...profile };
    this.logAudit('UPDATE', 'Pengaturan', undefined, 'Memperbarui profil sekolah dan kepala sekolah');
    this.notify();
  }

  // Assets
  public getAssets(includeDeleted = false): Asset[] {
    if (includeDeleted) return this.state.assets;
    return this.state.assets.filter(a => !a.isDeleted);
  }

  public getDeletedAssets(): Asset[] {
    return this.state.assets.filter(a => a.isDeleted);
  }

  public getAssetById(id: string): Asset | undefined {
    return this.state.assets.find(a => a.id === id);
  }

  public getAssetByCode(code: string): Asset | undefined {
    return this.state.assets.find(a => a.code.toLowerCase() === code.trim().toLowerCase());
  }

  public generateNextAssetCode(): string {
    const year = new Date().getFullYear();
    const seq = this.state.settings.nextAssetSeq;
    const prefix = this.state.settings.assetCodePrefix || 'AST';
    return `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
  }

  public addAsset(data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Asset {
    const nextSeq = this.state.settings.nextAssetSeq + 1;
    this.state.settings.nextAssetSeq = nextSeq;

    const newAsset: Asset = {
      ...data,
      id: `ast-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.assets = [newAsset, ...this.state.assets];
    this.logAudit('CREATE', 'Aset', newAsset.id, `Menambahkan aset baru: ${newAsset.name} (${newAsset.code})`);
    this.notify();
    return newAsset;
  }

  public updateAsset(id: string, updates: Partial<Asset>): Asset | undefined {
    const index = this.state.assets.findIndex(a => a.id === id);
    if (index === -1) return undefined;

    const updated: Asset = {
      ...this.state.assets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.state.assets[index] = updated;
    this.logAudit('UPDATE', 'Aset', id, `Memperbarui data aset: ${updated.name} (${updated.code})`);
    this.notify();
    return updated;
  }

  public softDeleteAsset(id: string, reason?: string): boolean {
    const asset = this.getAssetById(id);
    if (!asset) return false;

    asset.isDeleted = true;
    asset.status = 'Dihapus';
    asset.deletedAt = new Date().toISOString();
    asset.deletedReason = reason || 'Dihapus oleh pengguna';
    asset.deletedApproval = this.currentUser.name;

    const timeFormatted = formatDateTime(asset.deletedAt);
    const logDetails = `${this.currentUser.name} menghapus aset:\n${asset.name}\nKode: ${asset.code}\n${timeFormatted}`;

    this.logAudit(
      'DELETE',
      'Aset',
      id,
      logDetails
    );
    this.notify();
    return true;
  }

  public softDeleteAssetsBulk(ids: string[], reason?: string): { successCount: number } {
    let successCount = 0;
    ids.forEach(id => {
      if (this.softDeleteAsset(id, reason || 'Penghapusan massal')) {
        successCount++;
      }
    });
    return { successCount };
  }

  public restoreAsset(id: string): boolean {
    const asset = this.state.assets.find(a => a.id === id);
    if (!asset) return false;

    asset.isDeleted = false;
    asset.status = 'Aktif';
    asset.deletedAt = undefined;
    asset.deletedReason = undefined;
    asset.deletedApproval = undefined;

    this.logAudit('RESTORE', 'Aset', id, `${this.currentUser.name} memulihkan aset dari arsip: ${asset.name} (${asset.code})`);
    this.notify();
    return true;
  }

  public hardDeleteAsset(id: string): boolean {
    const asset = this.state.assets.find(a => a.id === id);
    if (!asset) return false;

    this.state.assets = this.state.assets.filter(a => a.id !== id);
    this.logAudit('DELETE', 'Aset', id, `${this.currentUser.name} menghapus permanen aset: ${asset.name} (${asset.code})`);
    this.notify();
    return true;
  }

  // Stock Items & Transactions (BHP)
  public getStockItems(includeDeleted = false): StockItem[] {
    if (includeDeleted) return this.state.stockItems;
    return this.state.stockItems.filter(s => !s.isDeleted);
  }

  public getDeletedStockItems(): StockItem[] {
    return this.state.stockItems.filter(s => s.isDeleted);
  }

  public getStockItemById(id: string): StockItem | undefined {
    return this.state.stockItems.find(s => s.id === id);
  }

  public addStockItem(data: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>): StockItem {
    const newItem: StockItem = {
      ...data,
      id: `bhp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    };
    this.state.stockItems = [newItem, ...this.state.stockItems];
    this.logAudit('CREATE', 'Barang Habis Pakai', newItem.id, `Mendaftarkan barang habis pakai baru: ${newItem.name}`);
    this.notify();
    return newItem;
  }

  public updateStockItem(id: string, updates: Partial<StockItem>): StockItem | undefined {
    const idx = this.state.stockItems.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    this.state.stockItems[idx] = {
      ...this.state.stockItems[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.logAudit('UPDATE', 'Barang Habis Pakai', id, `Mengubah data barang habis pakai: ${this.state.stockItems[idx].name}`);
    this.notify();
    return this.state.stockItems[idx];
  }

  public softDeleteStockItem(id: string, reason?: string): boolean {
    const item = this.getStockItemById(id);
    if (!item) return false;

    item.isDeleted = true;
    item.deletedAt = new Date().toISOString();
    item.deletedReason = reason || 'Dihapus oleh pengguna';

    const timeFormatted = formatDateTime(item.deletedAt);
    this.logAudit(
      'DELETE',
      'Barang Habis Pakai',
      id,
      `${this.currentUser.name} menghapus barang habis pakai:\n${item.name}\nKode: ${item.code}\n${timeFormatted}`
    );
    this.notify();
    return true;
  }

  public softDeleteStockItemsBulk(ids: string[], reason?: string): { successCount: number } {
    let successCount = 0;
    ids.forEach(id => {
      if (this.softDeleteStockItem(id, reason || 'Penghapusan massal')) {
        successCount++;
      }
    });
    return { successCount };
  }

  public restoreStockItem(id: string): boolean {
    const item = this.state.stockItems.find(s => s.id === id);
    if (!item) return false;

    item.isDeleted = false;
    item.deletedAt = undefined;
    item.deletedReason = undefined;

    this.logAudit('RESTORE', 'Barang Habis Pakai', id, `${this.currentUser.name} memulihkan barang habis pakai: ${item.name}`);
    this.notify();
    return true;
  }

  public hardDeleteStockItem(id: string): boolean {
    const item = this.state.stockItems.find(s => s.id === id);
    if (!item) return false;

    this.state.stockItems = this.state.stockItems.filter(s => s.id !== id);
    this.logAudit('DELETE', 'Barang Habis Pakai', id, `${this.currentUser.name} menghapus permanen barang habis pakai: ${item.name}`);
    this.notify();
    return true;
  }

  public recordStockIn(data: Omit<StockTransaction, 'id' | 'type' | 'createdAt'>): StockTransaction {
    const item = this.getStockItemById(data.itemId);
    if (!item) throw new Error('Barang tidak ditemukan');

    const newTx: StockTransaction = {
      ...data,
      id: `stx-${Date.now()}`,
      type: 'IN',
      createdAt: new Date().toISOString(),
    };

    item.currentStock += data.quantity;
    item.updatedAt = new Date().toISOString();

    this.state.stockTransactions = [newTx, ...this.state.stockTransactions];
    this.logAudit(
      'STOCK_IN',
      'Barang Habis Pakai',
      item.id,
      `Barang Masuk: +${data.quantity} ${item.unit} ${item.name} (${data.transactionNumber})`
    );
    this.notify();
    return newTx;
  }

  public recordStockOut(data: Omit<StockTransaction, 'id' | 'type' | 'createdAt'>): StockTransaction {
    const item = this.getStockItemById(data.itemId);
    if (!item) throw new Error('Barang tidak ditemukan');
    if (data.quantity > item.currentStock) {
      throw new Error(`Jumlah keluar (${data.quantity}) melebihi stok yang tersedia (${item.currentStock})`);
    }

    const newTx: StockTransaction = {
      ...data,
      id: `stx-${Date.now()}`,
      type: 'OUT',
      createdAt: new Date().toISOString(),
    };

    item.currentStock -= data.quantity;
    item.updatedAt = new Date().toISOString();

    this.state.stockTransactions = [newTx, ...this.state.stockTransactions];
    this.logAudit(
      'STOCK_OUT',
      'Barang Habis Pakai',
      item.id,
      `Barang Keluar: -${data.quantity} ${item.unit} ${item.name} (${data.recipient} / ${data.purpose || 'KBM'})`
    );

    if (item.currentStock <= item.minStock) {
      this.addNotification({
        type: 'stock_alert',
        title: `Peringatan Stok Menipis: ${item.name}`,
        message: `Stok saat ini ${item.currentStock} ${item.unit} (batas minimum: ${item.minStock} ${item.unit}). Segera lakukan pemesanan ulang.`,
        link: 'inventory',
      });
    }

    this.notify();
    return newTx;
  }

  public getStockTransactions(): StockTransaction[] {
    return this.state.stockTransactions;
  }

  // Rooms
  public getRooms(includeDeleted = false): Room[] {
    if (includeDeleted) return this.state.rooms;
    return this.state.rooms.filter(r => !r.isDeleted);
  }

  public getDeletedRooms(): Room[] {
    return this.state.rooms.filter(r => r.isDeleted);
  }

  public getRoomById(id: string): Room | undefined {
    return this.state.rooms.find(r => r.id === id);
  }

  public addRoom(room: Omit<Room, 'id'>): Room {
    const newRoom: Room = {
      ...room,
      id: `rm-${Date.now()}`,
      isDeleted: false,
    };
    this.state.rooms = [...this.state.rooms, newRoom];
    this.logAudit('CREATE', 'Ruangan', newRoom.id, `Menambahkan ruangan baru: ${newRoom.name} (${newRoom.code})`);
    this.notify();
    return newRoom;
  }

  public updateRoom(id: string, updates: Partial<Room>): Room | undefined {
    const idx = this.state.rooms.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    this.state.rooms[idx] = { ...this.state.rooms[idx], ...updates };
    this.logAudit('UPDATE', 'Ruangan', id, `Memperbarui data ruangan: ${this.state.rooms[idx].name}`);
    this.notify();
    return this.state.rooms[idx];
  }

  public softDeleteRoom(id: string, reason: string): { success: boolean; activeAssetsCount?: number; message?: string } {
    const room = this.getRoomById(id);
    if (!room) return { success: false, message: 'Ruangan tidak ditemukan' };

    // Relational validation: Check if room still has active assets
    const activeAssetsInRoom = this.getAssets(false).filter(a => a.roomId === id);
    if (activeAssetsInRoom.length > 0) {
      return {
        success: false,
        activeAssetsCount: activeAssetsInRoom.length,
        message: `Ruangan "${room.name}" masih memiliki ${activeAssetsInRoom.length} aset aktif. Pindahkan aset terlebih dahulu sebelum menghapus ruangan.`,
      };
    }

    room.isDeleted = true;
    room.deletedAt = new Date().toISOString();
    room.deletedReason = reason || 'Dihapus oleh pengguna';

    const timeFormatted = formatDateTime(room.deletedAt);
    this.logAudit('DELETE', 'Ruangan', id, `${this.currentUser.name} menghapus ruangan:\n${room.name}\nKode: ${room.code}\n${timeFormatted}`);
    this.notify();
    return { success: true, message: `Ruangan "${room.name}" berhasil dihapus.` };
  }

  public restoreRoom(id: string): boolean {
    const room = this.state.rooms.find(r => r.id === id);
    if (!room) return false;

    room.isDeleted = false;
    room.deletedAt = undefined;
    room.deletedReason = undefined;

    this.logAudit('RESTORE', 'Ruangan', id, `${this.currentUser.name} memulihkan ruangan: ${room.name} (${room.code})`);
    this.notify();
    return true;
  }

  public hardDeleteRoom(id: string): { success: boolean; message?: string } {
    const room = this.state.rooms.find(r => r.id === id);
    if (!room) return { success: false, message: 'Ruangan tidak ditemukan' };

    const activeAssetsInRoom = this.getAssets(false).filter(a => a.roomId === id);
    if (activeAssetsInRoom.length > 0) {
      return {
        success: false,
        message: `Tidak dapat menghapus permanen: masih terdapat ${activeAssetsInRoom.length} aset di ruangan ini!`,
      };
    }

    this.state.rooms = this.state.rooms.filter(r => r.id !== id);
    this.logAudit('DELETE', 'Ruangan', id, `${this.currentUser.name} menghapus permanen ruangan: ${room.name}`);
    this.notify();
    return { success: true, message: 'Ruangan berhasil dihapus permanen.' };
  }

  // Categories
  public getCategories(): AssetCategory[] {
    return this.state.categories;
  }

  // Suppliers
  public getSuppliers(): Supplier[] {
    return this.state.suppliers;
  }

  public getSupplierById(id: string): Supplier | undefined {
    return this.state.suppliers.find(s => s.id === id);
  }

  public addSupplier(supplier: Omit<Supplier, 'id'>): Supplier {
    const newSup: Supplier = {
      ...supplier,
      id: `sup-${Date.now()}`,
    };
    this.state.suppliers = [...this.state.suppliers, newSup];
    this.logAudit('CREATE', 'Pengaturan', newSup.id, `Menambahkan supplier baru: ${newSup.name}`);
    this.notify();
    return newSup;
  }

  public updateSupplier(id: string, updates: Partial<Omit<Supplier, 'id'>>): Supplier | undefined {
    const idx = this.state.suppliers.findIndex(s => s.id === id);
    if (idx === -1) return undefined;

    const updated: Supplier = {
      ...this.state.suppliers[idx],
      ...updates,
    };
    this.state.suppliers[idx] = updated;
    this.logAudit('UPDATE', 'Pengaturan', id, `Memperbarui data supplier: ${updated.name}`);
    this.notify();
    return updated;
  }

  public deleteSupplier(id: string): { success: boolean; message?: string } {
    const sup = this.getSupplierById(id);
    if (!sup) return { success: false, message: 'Supplier tidak ditemukan' };

    // Remove supplier without deleting connected assets or transactions
    this.state.suppliers = this.state.suppliers.filter(s => s.id !== id);
    this.logAudit('DELETE', 'Pengaturan', id, `${this.currentUser.name} menghapus data supplier: ${sup.name}`);
    this.notify();
    return { success: true, message: `Supplier "${sup.name}" berhasil dihapus.` };
  }

  // Borrowings
  public getBorrowings(includeDeleted = false): Borrowing[] {
    if (includeDeleted) return this.state.borrowings;
    return this.state.borrowings.filter(b => !b.isDeleted);
  }

  public getDeletedBorrowings(): Borrowing[] {
    return this.state.borrowings.filter(b => b.isDeleted);
  }

  public addBorrowing(data: Omit<Borrowing, 'id' | 'createdAt'>): Borrowing {
    const asset = this.getAssetById(data.assetId);
    if (!asset) throw new Error('Aset tidak ditemukan');
    if (asset.status !== 'Aktif') {
      throw new Error(`Aset saat ini berstatus "${asset.status}" dan tidak dapat dipinjam`);
    }

    const newBorrowing: Borrowing = {
      ...data,
      id: `brw-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isDeleted: false,
    };

    asset.status = 'Dipinjam';

    this.state.borrowings = [newBorrowing, ...this.state.borrowings];
    this.logAudit('BORROW', 'Peminjaman', newBorrowing.id, `Peminjaman aset: ${asset.name} oleh ${data.borrowerName}`);
    this.notify();
    return newBorrowing;
  }

  public returnBorrowing(id: string, returnData: { conditionAfter: AssetCondition; actualReturnDate: string; notes?: string }): Borrowing | undefined {
    const borrowing = this.state.borrowings.find(b => b.id === id);
    if (!borrowing) return undefined;

    const asset = this.getAssetById(borrowing.assetId);
    if (asset) {
      asset.status = 'Aktif';
      asset.condition = returnData.conditionAfter;
      if (returnData.conditionAfter === 'Rusak Berat') {
        this.addNotification({
          type: 'damaged_asset',
          title: `Aset Dikembalikan Dalam Kondisi Rusak: ${asset.name}`,
          message: `Aset ${asset.code} dikembalikan oleh ${borrowing.borrowerName} dengan kondisi ${returnData.conditionAfter}.`,
          link: 'borrowings',
        });
      }
    }

    borrowing.actualReturnDate = returnData.actualReturnDate;
    borrowing.conditionAfter = returnData.conditionAfter;
    borrowing.status = returnData.conditionAfter === 'Rusak Berat' ? 'Rusak' : 'Dikembalikan';
    if (returnData.notes) {
      borrowing.notes = borrowing.notes ? `${borrowing.notes} | ${returnData.notes}` : returnData.notes;
    }

    this.logAudit('RETURN', 'Peminjaman', borrowing.id, `Pengembalian aset: ${asset?.name ?? borrowing.assetId} oleh ${borrowing.borrowerName}`);
    this.notify();
    return borrowing;
  }

  public softDeleteBorrowing(id: string, reason?: string): { success: boolean; message?: string } {
    const borrowing = this.state.borrowings.find(b => b.id === id);
    if (!borrowing) return { success: false, message: 'Data peminjaman tidak ditemukan' };

    // Validation: cannot delete if active borrowing
    if (borrowing.status === 'Dipinjam' || borrowing.status === 'Terlambat') {
      return {
        success: false,
        message: 'Data peminjaman yang masih aktif tidak dapat dihapus. Silakan lakukan pengembalian aset terlebih dahulu.',
      };
    }

    borrowing.isDeleted = true;
    borrowing.deletedAt = new Date().toISOString();
    borrowing.deletedReason = reason || 'Dihapus oleh pengguna';

    const asset = this.getAssetById(borrowing.assetId);
    const timeFormatted = formatDateTime(borrowing.deletedAt);
    this.logAudit(
      'DELETE',
      'Peminjaman',
      id,
      `${this.currentUser.name} menghapus data peminjaman:\nNomor: ${borrowing.borrowingNumber}\nAset Terkait: ${asset?.name || borrowing.assetId} (${asset?.code || '-'})\nPeminjam: ${borrowing.borrowerName}\nWaktu: ${timeFormatted}`
    );
    this.notify();
    return { success: true, message: 'Data peminjaman berhasil diarsipkan.' };
  }

  public restoreBorrowing(id: string): boolean {
    const borrowing = this.state.borrowings.find(b => b.id === id);
    if (!borrowing) return false;

    borrowing.isDeleted = false;
    borrowing.deletedAt = undefined;
    borrowing.deletedReason = undefined;

    this.logAudit('RESTORE', 'Peminjaman', id, `${this.currentUser.name} memulihkan data peminjaman ${borrowing.borrowingNumber}`);
    this.notify();
    return true;
  }

  public hardDeleteBorrowing(id: string): boolean {
    this.state.borrowings = this.state.borrowings.filter(b => b.id !== id);
    this.logAudit('DELETE', 'Peminjaman', id, `${this.currentUser.name} menghapus permanen data peminjaman`);
    this.notify();
    return true;
  }

  // Maintenance
  public getMaintenances(includeDeleted = false): Maintenance[] {
    if (includeDeleted) return this.state.maintenances;
    return this.state.maintenances.filter(m => !m.isDeleted);
  }

  public getDeletedMaintenances(): Maintenance[] {
    return this.state.maintenances.filter(m => m.isDeleted);
  }

  public addMaintenance(data: Omit<Maintenance, 'id' | 'createdAt'>): Maintenance {
    const asset = this.getAssetById(data.assetId);
    if (!asset) throw new Error('Aset tidak ditemukan');

    const newMt: Maintenance = {
      ...data,
      id: `mt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isDeleted: false,
    };

    asset.status = 'Dalam Pemeliharaan';

    this.state.maintenances = [newMt, ...this.state.maintenances];
    this.logAudit('MAINTENANCE', 'Pemeliharaan', newMt.id, `Catatan pemeliharaan aset: ${asset.name} (${data.damageType})`);
    this.notify();
    return newMt;
  }

  public completeMaintenance(id: string, completionData: { actionTaken: string; cost?: number; completionDate: string; conditionResult: AssetCondition; notes?: string }): Maintenance | undefined {
    const mt = this.state.maintenances.find(m => m.id === id);
    if (!mt) return undefined;

    const asset = this.getAssetById(mt.assetId);
    if (asset) {
      asset.status = 'Aktif';
      asset.condition = completionData.conditionResult;
    }

    mt.status = 'Selesai';
    mt.completionDate = completionData.completionDate;
    mt.actionTaken = completionData.actionTaken;
    if (completionData.cost !== undefined) mt.cost = completionData.cost;
    if (completionData.notes) mt.notes = completionData.notes;

    this.logAudit('MAINTENANCE', 'Pemeliharaan', mt.id, `Pemeliharaan selesai untuk aset: ${asset?.name ?? mt.assetId}`);
    this.notify();
    return mt;
  }

  public softDeleteMaintenance(id: string, reason?: string): boolean {
    const mt = this.state.maintenances.find(m => m.id === id);
    if (!mt) return false;

    mt.isDeleted = true;
    mt.deletedAt = new Date().toISOString();
    mt.deletedReason = reason || 'Dihapus oleh pengguna';

    const asset = this.getAssetById(mt.assetId);
    const timeFormatted = formatDateTime(mt.deletedAt);
    this.logAudit(
      'DELETE',
      'Pemeliharaan',
      id,
      `${this.currentUser.name} menghapus data pemeliharaan:\nNomor: ${mt.maintenanceNumber}\nAset Terkait: ${asset?.name || mt.assetId} (${asset?.code || '-'})\nKerusakan: ${mt.damageType}\nWaktu: ${timeFormatted}`
    );
    this.notify();
    return true;
  }

  public restoreMaintenance(id: string): boolean {
    const mt = this.state.maintenances.find(m => m.id === id);
    if (!mt) return false;

    mt.isDeleted = false;
    mt.deletedAt = undefined;
    mt.deletedReason = undefined;

    this.logAudit('RESTORE', 'Pemeliharaan', id, `${this.currentUser.name} memulihkan data pemeliharaan ${mt.maintenanceNumber}`);
    this.notify();
    return true;
  }

  public hardDeleteMaintenance(id: string): boolean {
    this.state.maintenances = this.state.maintenances.filter(m => m.id !== id);
    this.logAudit('DELETE', 'Pemeliharaan', id, `${this.currentUser.name} menghapus permanen data pemeliharaan`);
    this.notify();
    return true;
  }

  // Mutations
  public getMutations(includeDeleted = false): AssetMutation[] {
    if (includeDeleted) return this.state.mutations;
    return this.state.mutations.filter(m => !m.isDeleted);
  }

  public getDeletedMutations(): AssetMutation[] {
    return this.state.mutations.filter(m => m.isDeleted || m.isCancelled);
  }

  public recordMutation(data: Omit<AssetMutation, 'id' | 'createdAt'>): AssetMutation {
    const asset = this.getAssetById(data.assetId);
    if (!asset) throw new Error('Aset tidak ditemukan');

    const newMutation: AssetMutation = {
      ...data,
      id: `mut-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isCancelled: false,
      isDeleted: false,
    };

    const targetRoom = this.getRoomById(data.targetRoomId);
    const sourceRoom = this.getRoomById(data.sourceRoomId);

    asset.roomId = data.targetRoomId;
    asset.picName = data.newPicName;

    this.state.mutations = [newMutation, ...this.state.mutations];
    this.logAudit(
      'MUTATION',
      'Mutasi',
      newMutation.id,
      `Mutasi aset ${asset.name} dari ${sourceRoom?.name ?? data.sourceRoomId} ke ${targetRoom?.name ?? data.targetRoomId}`
    );
    this.notify();
    return newMutation;
  }

  public cancelMutation(id: string, reason?: string): boolean {
    const mut = this.state.mutations.find(m => m.id === id);
    if (!mut) return false;

    mut.isCancelled = true;
    mut.isDeleted = true;
    mut.cancelledAt = new Date().toISOString();
    mut.cancelledReason = reason || 'Dibatalkan oleh pengguna';

    const asset = this.getAssetById(mut.assetId);
    const sourceRoom = this.getRoomById(mut.sourceRoomId);
    const targetRoom = this.getRoomById(mut.targetRoomId);
    const timeFormatted = formatDateTime(mut.cancelledAt);

    this.logAudit(
      'CANCEL_MUTATION',
      'Mutasi',
      id,
      `${this.currentUser.name} membatalkan data mutasi:\nNomor: ${mut.mutationNumber}\nAset Terkait: ${asset?.name || mut.assetId} (${asset?.code || '-'})\nPerpindahan: ${sourceRoom?.name || mut.sourceRoomId} → ${targetRoom?.name || mut.targetRoomId}\nWaktu: ${timeFormatted}`
    );
    this.notify();
    return true;
  }

  public restoreMutation(id: string): boolean {
    const mut = this.state.mutations.find(m => m.id === id);
    if (!mut) return false;

    mut.isCancelled = false;
    mut.cancelledAt = undefined;
    mut.cancelledReason = undefined;
    mut.isDeleted = false;

    this.logAudit('RESTORE', 'Mutasi', id, `${this.currentUser.name} memulihkan status mutasi ${mut.mutationNumber}`);
    this.notify();
    return true;
  }

  public hardDeleteMutation(id: string): boolean {
    this.state.mutations = this.state.mutations.filter(m => m.id !== id);
    this.logAudit('DELETE', 'Mutasi', id, `${this.currentUser.name} menghapus permanen catatan mutasi`);
    this.notify();
    return true;
  }

  // Disposals
  public getDisposals(): AssetDisposal[] {
    return this.state.disposals;
  }

  public addDisposal(data: Omit<AssetDisposal, 'id' | 'createdAt'>): AssetDisposal {
    const asset = this.getAssetById(data.assetId);
    if (!asset) throw new Error('Aset tidak ditemukan');

    const newDisp: AssetDisposal = {
      ...data,
      id: `dsp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (data.approvalStatus === 'Disetujui') {
      asset.status = 'Dihapus';
      asset.isDeleted = true;
      asset.deletedReason = data.reason;
      asset.deletedAt = new Date().toISOString();
      asset.deletedApproval = data.approvedBy || this.currentUser.name;
    }

    this.state.disposals = [newDisp, ...this.state.disposals];
    this.logAudit('DISPOSAL', 'Penghapusan', newDisp.id, `Pengajuan penghapusan aset: ${asset.name} (${data.method})`);
    this.notify();
    return newDisp;
  }

  public approveDisposal(id: string, approvedBy: string): AssetDisposal | undefined {
    const disp = this.state.disposals.find(d => d.id === id);
    if (!disp) return undefined;

    disp.approvalStatus = 'Disetujui';
    disp.approvedBy = approvedBy;

    const asset = this.getAssetById(disp.assetId);
    if (asset) {
      asset.status = 'Dihapus';
      asset.isDeleted = true;
      asset.deletedReason = disp.reason;
      asset.deletedAt = new Date().toISOString();
      asset.deletedApproval = approvedBy;
    }

    this.logAudit('APPROVAL', 'Penghapusan', disp.id, `Persetujuan penghapusan aset: ${asset?.name ?? disp.assetId} oleh ${approvedBy}`);
    this.notify();
    return disp;
  }

  // Documents
  public getDocuments(): DocumentItem[] {
    return this.state.documents;
  }

  public addDocument(doc: Omit<DocumentItem, 'id'>): DocumentItem {
    const newDoc: DocumentItem = {
      ...doc,
      id: `doc-${Date.now()}`,
    };
    this.state.documents = [newDoc, ...this.state.documents];
    this.logAudit('CREATE', 'Aset', newDoc.id, `Mengunggah dokumen: ${newDoc.title} (${newDoc.type})`);
    this.notify();
    return newDoc;
  }

  public deleteDocument(id: string): boolean {
    const doc = this.state.documents.find(d => d.id === id);
    if (!doc) return false;
    this.state.documents = this.state.documents.filter(d => d.id !== id);
    this.logAudit('DELETE', 'Aset', id, `Menghapus dokumen: ${doc.title}`);
    this.notify();
    return true;
  }

  // Users Management
  public getUsers(includeDeleted = false): User[] {
    if (includeDeleted) return this.state.users;
    return this.state.users.filter(u => !u.isDeleted);
  }

  public getDeletedUsers(): User[] {
    return this.state.users.filter(u => u.isDeleted || !u.isActive);
  }

  public async addUser(user: Omit<User, 'id'>): Promise<User> {
    const rawPassword = user.password || 'admin123';
    const passwordHash = await hashPassword(rawPassword);
    const nowIso = new Date().toISOString();

    const newUser: User = {
      ...user,
      id: `usr-${Date.now()}`,
      password_hash: passwordHash,
      isActive: user.isActive !== undefined ? user.isActive : true,
      created_at: nowIso,
      createdAt: nowIso,
      updated_at: nowIso,
      lastLogin: '-',
    };
    delete newUser.password;

    this.state.users = [...this.state.users, newUser];
    this.logAudit('USER_CREATED', 'Pengguna', newUser.id, `${this.currentUser.name} menambahkan pengguna baru: ${newUser.name} (${newUser.role})`);
    this.notify();
    return newUser;
  }

  public async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const idx = this.state.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;

    // Security check: Only ADMIN or the user themselves can update their profile
    if (this.currentUser.role !== 'ADMIN' && this.currentUser.id !== id) {
      throw new Error('Anda tidak memiliki izin untuk mengubah data pengguna lain!');
    }

    const targetUser = this.state.users[idx];
    const oldRole = targetUser.role;
    const oldPhoto = targetUser.profile_photo_url || targetUser.avatar;
    const isPhotoChanged =
      (updates.profile_photo_url !== undefined && updates.profile_photo_url !== oldPhoto) ||
      (updates.avatar !== undefined && updates.avatar !== oldPhoto);

    let isPasswordChanged = false;
    if (updates.password && updates.password.trim()) {
      updates.password_hash = await hashPassword(updates.password.trim());
      delete updates.password;
      isPasswordChanged = true;
    }

    updates.updated_at = new Date().toISOString();
    this.state.users[idx] = { ...this.state.users[idx], ...updates };

    // Audit Logging
    if (isPasswordChanged) {
      this.logAudit(
        'PASSWORD_CHANGED',
        'Pengguna',
        id,
        this.currentUser.id === id
          ? `${this.currentUser.name} memperbarui kata sandi akunnya.`
          : `${this.currentUser.name} memperbarui kata sandi pengguna: ${targetUser.name}.`
      );
    } else if (isPhotoChanged) {
      const newPhoto = updates.profile_photo_url || updates.avatar;
      const isSelf = this.currentUser.id === id;

      if (!newPhoto) {
        this.logAudit(
          'PROFILE_PHOTO_UPDATED',
          'Pengguna',
          id,
          isSelf
            ? `${this.currentUser.name} menghapus foto profil.`
            : `${this.currentUser.name} menghapus foto profil pengguna: ${targetUser.name}.`
        );
      } else {
        this.logAudit(
          'PROFILE_PHOTO_UPDATED',
          'Pengguna',
          id,
          isSelf
            ? `${this.currentUser.name} mengganti foto profil.`
            : `${this.currentUser.name} mengganti foto profil pengguna: ${targetUser.name}.`
        );
      }
    } else if (updates.role && updates.role !== oldRole) {
      this.logAudit(
        'CHANGE_ROLE',
        'Pengguna',
        id,
        `${this.currentUser.name} mengubah role pengguna "${targetUser.name}" dari ${oldRole} menjadi ${updates.role}`
      );
    } else {
      this.logAudit(
        'USER_UPDATED',
        'Pengguna',
        id,
        `${this.currentUser.name} memperbarui data akun pengguna: ${targetUser.name}`
      );
    }

    // If updating currently logged in user, keep currentUser in sync immediately
    if (id === this.currentUser.id) {
      this.currentUser = { ...this.currentUser, ...updates };
      try {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser));
      } catch {}
    }

    this.notify();
    return this.state.users[idx];
  }

  public setUserActiveStatus(id: string, isActive: boolean): { success: boolean; message?: string } {
    const user = this.state.users.find(u => u.id === id);
    if (!user) return { success: false, message: 'Pengguna tidak ditemukan' };

    // Prevent deactivating own logged-in account
    if (id === this.currentUser.id && !isActive) {
      return { success: false, message: 'Anda tidak dapat menonaktifkan akun yang sedang digunakan saat ini!' };
    }

    // Safety validation: prevent disabling the only active ADMIN
    if (user.role === 'ADMIN' && !isActive) {
      const activeAdmins = this.state.users.filter(u => u.role === 'ADMIN' && u.isActive && !u.isDeleted && u.id !== id);
      if (activeAdmins.length === 0) {
        return {
          success: false,
          message: 'Tindakan dibatalkan: Sistem wajib memiliki minimal satu Administrator aktif!',
        };
      }
    }

    user.isActive = isActive;
    const action = isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER';
    this.logAudit(
      action,
      'Pengguna',
      id,
      `${this.currentUser.name} ${isActive ? 'mengaktifkan kembali' : 'menonaktifkan'} akun pengguna: ${user.name} (${user.role})`
    );
    this.notify();
    return {
      success: true,
      message: `Akun "${user.name}" berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}.`,
    };
  }

  public softDeleteUser(id: string): { success: boolean; message?: string } {
    const user = this.state.users.find(u => u.id === id);
    if (!user) return { success: false, message: 'Pengguna tidak ditemukan' };

    if (id === this.currentUser.id) {
      return { success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri!' };
    }

    if (user.role === 'ADMIN') {
      const activeAdmins = this.state.users.filter(u => u.role === 'ADMIN' && u.isActive && !u.isDeleted && u.id !== id);
      if (activeAdmins.length === 0) {
        return { success: false, message: 'Tidak dapat menghapus satu-satunya akun Administrator!' };
      }
    }

    user.isDeleted = true;
    user.isActive = false;
    user.deletedAt = new Date().toISOString();

    const timeFormatted = formatDateTime(user.deletedAt);
    this.logAudit('DELETE', 'Pengguna', id, `${this.currentUser.name} menonaktifkan pengguna:\nNama: ${user.name}\nUsername: ${user.username}\nRole: ${user.role}\nWaktu: ${timeFormatted}`);
    this.notify();
    return { success: true, message: `Pengguna "${user.name}" berhasil dinonaktifkan.` };
  }

  public restoreUser(id: string): boolean {
    const user = this.state.users.find(u => u.id === id);
    if (!user) return false;

    user.isDeleted = false;
    user.isActive = true;
    user.deletedAt = undefined;

    this.logAudit('RESTORE', 'Pengguna', id, `${this.currentUser.name} memulihkan akun pengguna: ${user.name}`);
    this.notify();
    return true;
  }

  public hardDeleteUser(id: string): { success: boolean; message?: string } {
    const user = this.state.users.find(u => u.id === id);
    if (!user) return { success: false, message: 'Pengguna tidak ditemukan' };

    if (id === this.currentUser.id) {
      return { success: false, message: 'Tidak dapat menghapus akun sendiri!' };
    }

    this.state.users = this.state.users.filter(u => u.id !== id);
    this.logAudit('DELETE', 'Pengguna', id, `${this.currentUser.name} menghapus permanen pengguna: ${user.name}`);
    this.notify();
    return { success: true, message: 'Pengguna berhasil dihapus permanen.' };
  }

  // Recycle Bin Total Counter
  public getRecycleBinCount(): number {
    const deletedAssets = this.state.assets.filter(a => a.isDeleted).length;
    const deletedStock = this.state.stockItems.filter(s => s.isDeleted).length;
    const deletedRooms = this.state.rooms.filter(r => r.isDeleted).length;
    const deletedBorrowings = this.state.borrowings.filter(b => b.isDeleted).length;
    const deletedMaint = this.state.maintenances.filter(m => m.isDeleted).length;
    const deletedMut = this.state.mutations.filter(m => m.isCancelled || m.isDeleted).length;
    const deletedUsers = this.state.users.filter(u => u.isDeleted || !u.isActive).length;

    return deletedAssets + deletedStock + deletedRooms + deletedBorrowings + deletedMaint + deletedMut + deletedUsers;
  }

  // Empty Recycle Bin Permanently
  public emptyRecycleBin(): void {
    this.state.assets = this.state.assets.filter(a => !a.isDeleted);
    this.state.stockItems = this.state.stockItems.filter(s => !s.isDeleted);
    this.state.rooms = this.state.rooms.filter(r => !r.isDeleted);
    this.state.borrowings = this.state.borrowings.filter(b => !b.isDeleted);
    this.state.maintenances = this.state.maintenances.filter(m => !m.isDeleted);
    this.state.mutations = this.state.mutations.filter(m => !m.isCancelled && !m.isDeleted);
    this.state.users = this.state.users.filter(u => !u.isDeleted);

    this.logAudit('DELETE', 'Pengaturan', undefined, `${this.currentUser.name} mengosongkan seluruh Recycle Bin / Arsip`);
    this.notify();
  }

  // Notifications
  public getNotifications(): NotificationItem[] {
    return this.state.notifications;
  }

  public addNotification(data: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>): void {
    const notif: NotificationItem = {
      ...data,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.state.notifications = [notif, ...this.state.notifications];
    this.notify();
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.state.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.notify();
    }
  }

  public markAllNotificationsAsRead(): void {
    this.state.notifications.forEach(n => {
      n.isRead = true;
    });
    this.notify();
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.state.auditLogs;
  }

  // Settings
  public getSettings(): SystemSettings {
    return this.state.settings;
  }

  public updateSettings(updates: Partial<SystemSettings>): void {
    this.state.settings = { ...this.state.settings, ...updates };
    this.notify();
  }

  // Backup & Restore
  public exportBackupJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public restoreBackupJson(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Format file tidak valid (bukan JSON).' };
      }
      if (!Array.isArray(parsed.assets) && !Array.isArray(parsed.stockItems) && !parsed.school) {
        return { success: false, message: 'File JSON bukan file cadangan SIMASET yang sah.' };
      }

      const mergedState: DatabaseState = {
        ...initialSeedData,
        ...parsed,
        school: { ...initialSeedData.school, ...(parsed.school || {}) },
        settings: { ...initialSeedData.settings, ...(parsed.settings || {}) },
        assets: Array.isArray(parsed.assets) ? parsed.assets : [],
        stockItems: Array.isArray(parsed.stockItems) ? parsed.stockItems : [],
        stockTransactions: Array.isArray(parsed.stockTransactions) ? parsed.stockTransactions : [],
        borrowings: Array.isArray(parsed.borrowings) ? parsed.borrowings : [],
        maintenances: Array.isArray(parsed.maintenances) ? parsed.maintenances : [],
        mutations: Array.isArray(parsed.mutations) ? parsed.mutations : [],
        disposals: Array.isArray(parsed.disposals) ? parsed.disposals : [],
        documents: Array.isArray(parsed.documents) ? parsed.documents : [],
        suppliers: Array.isArray(parsed.suppliers) ? parsed.suppliers : [],
        categories: Array.isArray(parsed.categories) ? parsed.categories : initialSeedData.categories,
        rooms: Array.isArray(parsed.rooms) ? parsed.rooms : initialSeedData.rooms,
        users: Array.isArray(parsed.users) ? parsed.users : initialSeedData.users,
        auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      };

      // Ensure primary admin remains intact and active with bcrypt hash
      const primaryAdmin = mergedState.users.find(
        u => u.id === 'usr-1' || u.email.toLowerCase().includes('putrabs954') || u.role === 'ADMIN'
      );
      if (primaryAdmin) {
        primaryAdmin.isActive = true;
        primaryAdmin.isDeleted = false;
        if (!primaryAdmin.password_hash) {
          primaryAdmin.password_hash = hashPasswordSync('20506611');
        }
        delete primaryAdmin.password;
      } else {
        mergedState.users.unshift(initialSeedData.users[0]);
      }

      this.state = mergedState;
      this.saveToStorage(this.state);
      this.logAudit('RESTORE', 'Pengaturan', undefined, 'Memulihkan seluruh basis data dari file cadangan JSON');
      this.notify();
      return { success: true, message: 'Basis data berhasil dipulihkan secara utuh dari cadangan.' };
    } catch (err: any) {
      console.error('Gagal memulihkan backup:', err);
      return { success: false, message: `Gagal memproses file cadangan: ${err.message}` };
    }
  }

  public resetAllData(): void {
    // 1. Reset all operational and transactional data to clean empty arrays
    this.state.assets = [];
    this.state.stockItems = [];
    this.state.stockTransactions = [];
    this.state.borrowings = [];
    this.state.maintenances = [];
    this.state.mutations = [];
    this.state.disposals = [];
    this.state.documents = [];
    this.state.suppliers = [];
    this.state.auditLogs = [];
    this.state.notifications = [];

    // 2. Reset users: keep ONLY the primary administrator account
    const existingAdmin = this.state.users.find(
      u =>
        u.id === 'usr-1' ||
        u.email.toLowerCase() === 'putrabs954@gamil.com' ||
        u.email.toLowerCase() === 'putrabs954@gmail.com'
    );

    const primaryAdmin: User = {
      id: 'usr-1',
      username: 'putrabs954',
      name: 'Putra Bagus (Administrator)',
      email: 'putrabs954@gamil.com',
      password_hash: hashPasswordSync('20506611'),
      role: 'ADMIN',
      nip: existingAdmin?.nip || '19850914 201001 1 012',
      phone: existingAdmin?.phone || '081234567890',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    this.state.users = [primaryAdmin];
    this.currentUser = primaryAdmin;

    // 3. Reset settings sequence to 1
    this.state.settings.nextAssetSeq = 1;

    // 4. Save to persistent storage and reset server file
    try {
      if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
        const token = this.getSessionToken();
        fetch('/api/db/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'X-User-Role': this.currentUser?.role || 'ADMIN',
            'X-User-Id': this.currentUser?.id || 'usr-1',
          },
          body: JSON.stringify({ confirmReset: 'RESET' }),
        }).catch(() => {});
      }
    } catch {}
    this.saveToStorage(this.state);
    this.notify();
  }

  public resetToDefaultSeed(): void {
    this.resetAllData();
  }

  // Summary Statistics Helper
  public getStats() {
    const activeAssets = this.getAssets(false);
    const deletedAssets = this.getDeletedAssets();
    const totalAssets = activeAssets.length;
    const totalValue = activeAssets.reduce((sum, a) => sum + (a.acquisitionPrice * (a.quantity || 1)), 0);

    const goodCondition = activeAssets.filter(a => a.condition === 'Baik').length;
    const brokenLight = activeAssets.filter(a => a.condition === 'Rusak Ringan').length;
    const brokenHeavy = activeAssets.filter(a => a.condition === 'Rusak Berat').length;

    const activeStockItems = this.getStockItems(false);
    const lowStockItems = activeStockItems.filter(s => s.currentStock <= s.minStock);
    const activeBorrowings = this.state.borrowings.filter(b => !b.isDeleted && (b.status === 'Dipinjam' || b.status === 'Terlambat')).length;
    const lateBorrowings = this.state.borrowings.filter(b => !b.isDeleted && b.status === 'Terlambat').length;
    const inMaintenance = activeAssets.filter(a => a.status === 'Dalam Pemeliharaan').length;
    const totalConsumableValue = activeStockItems.reduce((sum, s) => sum + (s.currentStock * s.unitPrice), 0);

    // User statistics
    const allUsers = this.getUsers(true);
    const activeUsers = allUsers.filter(u => u.isActive && !u.isDeleted).length;
    const inactiveUsers = allUsers.filter(u => !u.isActive || u.isDeleted).length;

    // Financial funding breakdown for Bendahara
    const fundingBreakdown: Record<string, { count: number; totalValue: number }> = {};
    activeAssets.forEach(a => {
      const src = a.fundingSource || 'Lainnya';
      if (!fundingBreakdown[src]) {
        fundingBreakdown[src] = { count: 0, totalValue: 0 };
      }
      fundingBreakdown[src].count += a.quantity || 1;
      fundingBreakdown[src].totalValue += a.acquisitionPrice * (a.quantity || 1);
    });

    const totalMaintenanceExpense = this.state.maintenances
      .filter(m => !m.isDeleted)
      .reduce((sum, m) => sum + (m.cost || 0), 0);

    return {
      totalAssets,
      totalValue,
      goodCondition,
      brokenLight,
      brokenHeavy,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      activeBorrowings,
      lateBorrowings,
      inMaintenance,
      totalConsumables: activeStockItems.length,
      totalConsumableValue,
      totalUsers: allUsers.length,
      activeUsers,
      inactiveUsers,
      activeAssetsCount: totalAssets,
      archivedAssetsCount: deletedAssets.length,
      recycleBinCount: this.getRecycleBinCount(),
      fundingBreakdown,
      totalMaintenanceExpense,
    };
  }
}

export const db = new DatabaseService();
