# SIMASET SEKOLAH - Modul Autentikasi PHP & MySQL Native

Sistem Informasi Manajemen Aset Sekolah (SIMASET) berbasis PHP Native & MySQL PDO dengan Tailwind CSS.

## Struktur Direktori
```text
simasset-sekolah/
│
├── config/
│   └── database.php       # Konfigurasi koneksi PDO MySQL
│
├── index.php              # Halaman Login responsif Tailwind CSS
├── proses-login.php       # Validasi kredensial, verifikasi hash & sesi
├── dashboard.php          # Dashboard utama berproteksi sesi
├── logout.php             # Hancurkan sesi & hapus cookie
├── database.sql           # Skrip migrasi database & seed pengguna awal
│
└── assets/
    └── logo.png           # Logo institusi sekolah
```

## Panduan Instalasi di XAMPP / Laragon

1. Salin seluruh folder `simasset-sekolah` ke dalam direktori web server:
   - **XAMPP**: `C:/xampp/htdocs/simasset-sekolah/`
   - **Laragon**: `C:/laragon/www/simasset-sekolah/`
2. Buka **phpMyAdmin** (`http://localhost/phpmyadmin/`), lalu impor berkas `database.sql`.
3. Sesuaikan username dan password database di `config/database.php` jika menggunakan kredensial kustom:
   ```php
   $host = "localhost";
   $dbname = "simaset_sekolah";
   $username = "root";
   $password = "";
   ```
4. Buka peramban (browser) dan akses:
   `http://localhost/simasset-sekolah/`

## Kredensial Login Demo
- **Administrator**: `admin@simaset.sch.id` | Password: `admin123`
- **Kepala Sekolah**: `kepsek@smk.sch.id` | Password: `admin123`
- **Pengurus Barang**: `fauzi.aset@smk.sch.id` | Password: `admin123`
- **Bendahara**: `bendahara@smk.sch.id` | Password: `admin123`
- **Guru**: `siti.guru@smk.sch.id` | Password: `admin123`
- **Staff TU**: `dewi.tu@smk.sch.id` | Password: `admin123`
