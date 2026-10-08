<?php
/**
 * SIMASET SEKOLAH - Konfigurasi Koneksi Database MySQL (PDO)
 * 
 * Sesuaikan parameter host, dbname, username, dan password dengan server Anda.
 */

$host = "localhost";
$dbname = "simaset_sekolah";
$username = "root";
$password = "";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    // Hindari mengekspos rincian kredensial sensitif di halaman produksi
    error_log("Database Connection Error: " . $e->getMessage());
    die("Koneksi database gagal. Silakan periksa konfigurasi MySQL di config/database.php.");
}
