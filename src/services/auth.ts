import { User, UserRole, ActivePage } from '../types';
import { db } from './db';

/**
 * Authentication Helpers required by SIMASET SEKOLAH
 * 
 * - getCurrentUser(): User
 * - isAuthenticated(): boolean
 * - logout(): void
 * - requireAuth(): boolean
 * - hasRole(allowedRoles: UserRole | UserRole[]): boolean
 * - canAccessPage(page: ActivePage): boolean
 */

export const ROLE_PERMISSIONS: Record<UserRole, ActivePage[]> = {
  ADMIN: [
    'dashboard',
    'assets',
    'assets-new',
    'assets-detail',
    'assets-edit',
    'inventory',
    'rooms',
    'borrowings',
    'maintenance',
    'mutations',
    'disposals',
    'suppliers',
    'documents',
    'reports',
    'analytics',
    'notifications',
    'users',
    'settings',
    'audit-log',
  ],
  KEPALA_SEKOLAH: [
    'dashboard',
    'assets',
    'assets-detail',
    'inventory',
    'rooms',
    'borrowings',
    'maintenance',
    'mutations',
    'suppliers',
    'documents',
    'reports',
    'analytics',
    'notifications',
    'audit-log',
  ],
  PENGURUS_BARANG: [
    'dashboard',
    'assets',
    'assets-new',
    'assets-detail',
    'assets-edit',
    'inventory',
    'rooms',
    'borrowings',
    'maintenance',
    'mutations',
    'disposals',
    'suppliers',
    'documents',
    'reports',
    'analytics',
    'notifications',
  ],
  BENDAHARA: [
    'dashboard',
    'assets',
    'assets-detail',
    'inventory',
    'suppliers',
    'documents',
    'reports',
    'analytics',
    'notifications',
  ],
  GURU: [
    'dashboard',
    'assets',
    'assets-detail',
    'inventory',
    'rooms',
    'borrowings',
    'notifications',
  ],
  STAFF: [
    'dashboard',
    'assets',
    'assets-detail',
    'inventory',
    'borrowings',
    'notifications',
  ],
};

/**
 * Mendapatkan pengguna yang sedang terautentikasi saat ini
 */
export function getCurrentUser(): User {
  return db.getCurrentUser();
}

/**
 * Mengecek apakah pengguna saat ini terautentikasi dan sesi valid
 */
export function isAuthenticated(): boolean {
  return db.isLoggedIn();
}

/**
 * Mengakhiri sesi login pengguna
 */
export function logout(): void {
  db.logout();
}

/**
 * Memastikan pengguna memiliki sesi aktif; jika tidak, kembalikan false
 */
export function requireAuth(): boolean {
  return isAuthenticated();
}

/**
 * Mengecek apakah role pengguna saat ini memenuhi daftar role yang diizinkan
 */
export function hasRole(allowedRoles: UserRole | UserRole[]): boolean {
  const user = getCurrentUser();
  if (!user || !user.isActive || user.isDeleted) return false;
  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(user.role);
  }
  return user.role === allowedRoles;
}

/**
 * Memvalidasi apakah pengguna saat ini berhak mengakses modul halaman tertentu
 */
export function canAccessPage(page: ActivePage): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  const allowed = ROLE_PERMISSIONS[user.role] || [];
  return allowed.includes(page);
}
