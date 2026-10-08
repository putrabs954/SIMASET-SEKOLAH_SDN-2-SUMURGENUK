<?php
session_start();
require_once __DIR__ . "/config/database.php";

// Hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: index.php");
    exit;
}

// Ambil input
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$remember = isset($_POST['remember']);

// Validasi input wajib terisi
if ($email === '' || $password === '') {
    header("Location: index.php?error=empty");
    exit;
}

// Validasi format email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header("Location: index.php?error=invalid");
    exit;
}

try {
    // Cari user di database berdasarkan email
    $stmt = $pdo->prepare("
        SELECT
            id,
            nama_lengkap,
            email,
            password,
            role,
            foto_profil,
            status
        FROM users
        WHERE email = ?
        LIMIT 1
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // User tidak ditemukan atau password salah
    if (!$user || !password_verify($password, $user['password'])) {
        header("Location: index.php?error=invalid");
        exit;
    }

    // Cek apakah akun aktif
    if ($user['status'] !== 'aktif') {
        header("Location: index.php?error=inactive");
        exit;
    }

    // Regenerasi session ID untuk mencegah session fixation
    session_regenerate_id(true);

    // Simpan data login ke session
    $_SESSION['user_id']     = $user['id'];
    $_SESSION['nama_lengkap'] = $user['nama_lengkap'];
    $_SESSION['email']        = $user['email'];
    $_SESSION['role']         = $user['role'];
    $_SESSION['foto_profil']  = $user['foto_profil'];
    $_SESSION['login_time']   = time();

    // Remember Me cookie (30 hari)
    if ($remember) {
        $cookieLifetime = time() + (30 * 24 * 60 * 60);
        $cookieToken = bin2hex(random_bytes(16));
        setcookie(
            'remember_login',
            $cookieToken,
            [
                'expires'  => $cookieLifetime,
                'path'     => '/',
                'secure'   => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
                'httponly' => true,
                'samesite' => 'Lax'
            ]
        );
    }

    // Catat log aktivitas jika ada tabel log (opsional)
    try {
        $logStmt = $pdo->prepare("
            INSERT INTO audit_logs (user_id, user_name, user_role, action, details)
            VALUES (?, ?, ?, 'LOGIN', 'Berhasil login ke sistem SIMASET.')
        ");
        $logStmt->execute([$user['id'], $user['nama_lengkap'], $user['role']]);
    } catch (\Exception $e) {
        // Lewati jika tabel audit_logs belum dibuat
    }

    // Arahkan ke dashboard
    header("Location: dashboard.php");
    exit;

} catch (PDOException $e) {
    error_log("Login Query Error: " . $e->getMessage());
    header("Location: index.php?error=system");
    exit;
}
