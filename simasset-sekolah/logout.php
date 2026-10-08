<?php
session_start();

// Hapus semua data session
$_SESSION = [];

// Jika menggunakan cookie session, hapus cookie tersebut
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

// Hapus cookie Remember Me jika ada
if (isset($_COOKIE['remember_login'])) {
    setcookie('remember_login', '', time() - 3600, '/');
}

// Hancurkan session server
session_destroy();

// Redirect kembali ke halaman login dengan parameter status
header("Location: index.php?logout=success");
exit;
