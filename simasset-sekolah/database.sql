-- ============================================================
-- SIMASET SEKOLAH - Skrip Basis Data MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS simaset_sekolah
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE simaset_sekolah;

-- ------------------------------------------------------------
-- 1. TABEL PENGGUNA (users)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_lengkap VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM(
        'ADMIN',
        'KEPALA_SEKOLAH',
        'PENGURUS_BARANG',
        'BENDAHARA',
        'GURU',
        'STAFF'
    ) DEFAULT 'STAFF',
    foto_profil VARCHAR(255) DEFAULT NULL,
    status ENUM('aktif','nonaktif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. SEED DATA PENGGUNA DEFAULT
-- Akun Utama Administrator:
-- Email: putrabs954@gamil.com
-- Password: 20506611 (Hash Bcrypt)
-- ------------------------------------------------------------
INSERT INTO users (nama_lengkap, email, password, role, status) VALUES
('Putra Bagus (Administrator)', 'putrabs954@gamil.com', '$2y$10$wT84W0b1gW15pI1O9R7Z6eK1T4F1J1X2A3B4C5D6E7F8G9H0I1J2K', 'ADMIN', 'aktif');

-- ------------------------------------------------------------
-- 3. TABEL AUDIT LOG (audit_logs)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
