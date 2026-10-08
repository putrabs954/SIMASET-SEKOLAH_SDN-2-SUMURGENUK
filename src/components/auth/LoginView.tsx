import React, { useState } from 'react';
import { db } from '../../services/db';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  FileCode,
  UserCheck,
  KeyRound,
  Copy,
  Check,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface LoginViewProps {
  onLoginSuccess: () => void;
  initialLogoutMessage?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  initialLogoutMessage = false,
}) => {
  const [email, setEmail] = useState('putrabs954@gamil.com');
  const [password, setPassword] = useState('20506611');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    initialLogoutMessage ? 'Anda telah berhasil keluar dari sistem.' : ''
  );
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'reset' | 'done'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPhpCodeModal, setShowPhpCodeModal] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'config' | 'index' | 'proses' | 'dashboard' | 'logout' | 'sql'>('index');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const school = db.getSchool();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const result = await db.login(email, password, remember);
      setIsLoading(false);

      if (result.success) {
        onLoginSuccess();
      } else {
        if (result.error === 'locked') {
          setErrorMessage(
            `Terlalu banyak percobaan login. Silakan coba kembali dalam ${result.remainingSeconds || 60} detik.`
          );
        } else if (result.error === 'inactive') {
          setErrorMessage('Akun Anda tidak aktif. Silakan hubungi Administrator.');
        } else if (result.error === 'empty') {
          setErrorMessage('Email dan password wajib diisi.');
        } else {
          setErrorMessage('Email atau password salah.');
        }
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Terjadi kesalahan sistem saat memproses masuk.');
    }
  };

  const handleVerifyEmailForReset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    const clean = forgotEmail.trim().toLowerCase();
    if (!clean) {
      setForgotError('Alamat email wajib diisi.');
      return;
    }
    const user = db.getUsers(true).find(u => u.email.toLowerCase() === clean);
    if (!user) {
      setForgotError('Alamat email tidak terdaftar di sistem SIMASET.');
      return;
    }
    if (!user.isActive || user.isDeleted) {
      setForgotError('Akun Anda tidak aktif. Silakan hubungi Administrator.');
      return;
    }
    setForgotStep('reset');
  };

  const handleApplyNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!newResetPassword || newResetPassword.length < 6) {
      setForgotError('Kata sandi baru minimal harus 6 karakter.');
      return;
    }
    if (newResetPassword !== confirmResetPassword) {
      setForgotError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setForgotLoading(true);
    const res = await db.resetPassword(forgotEmail, newResetPassword);
    setForgotLoading(false);

    if (res.success) {
      setForgotStep('done');
      setEmail(forgotEmail);
      setPassword(newResetPassword);
      setSuccessMessage('Kata sandi berhasil diperbarui. Silakan masuk.');
    } else {
      setForgotError(res.message || 'Gagal mereset kata sandi.');
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const phpCodes = {
    config: `<?php
/**
 * SIMASET SEKOLAH - Konfigurasi Koneksi Database MySQL (PDO)
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
    die("Koneksi database gagal.");
}`,
    index: `<?php
session_start();

if (isset($_SESSION['user_id'])) {
    header("Location: dashboard.php");
    exit;
}

$error = $_GET['error'] ?? '';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - SIMASET SEKOLAH</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-slate-100 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
        <!-- LOGIN CARD -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="text-center mb-8">
                <div class="flex justify-center mb-4">
                    <div class="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                        <img src="assets/logo.png" alt="Logo Sekolah" class="w-14 h-14 object-contain"
                             onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\\'text-white text-3xl font-bold\\'>S</span>';">
                    </div>
                </div>
                <h1 class="text-2xl font-bold text-slate-800">SIMASET SEKOLAH</h1>
                <p class="text-sm text-slate-500 mt-1">Sistem Informasi Manajemen Aset Sekolah</p>
            </div>

            <?php if ($error): ?>
                <div class="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    <?php
                    $messages = [
                        'invalid' => 'Email atau password salah.',
                        'inactive' => 'Akun Anda tidak aktif.',
                        'empty' => 'Email dan password wajib diisi.',
                        'system' => 'Terjadi kesalahan sistem.'
                    ];
                    echo htmlspecialchars($messages[$error] ?? 'Terjadi kesalahan.');
                    ?>
                </div>
            <?php endif; ?>

            <form action="proses-login.php" method="POST" class="space-y-5">
                <div>
                    <label for="email" class="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input type="email" name="email" id="email" required placeholder="nama@email.com"
                           class="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
                <div>
                    <label for="password" class="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <input type="password" name="password" id="password" required placeholder="Masukkan password"
                           class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
                <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2 text-sm text-slate-600">
                        <input type="checkbox" name="remember" value="1" class="w-4 h-4 rounded text-blue-600"> Ingat Saya
                    </label>
                    <a href="#" class="text-sm text-blue-600 font-medium">Lupa Password?</a>
                </div>
                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md">
                    Masuk
                </button>
            </form>
        </div>
        <p class="text-center text-xs text-slate-400 mt-6">&copy; <?= date('Y') ?> SIMASET SEKOLAH</p>
    </div>
</body>
</html>`,
    proses: `<?php
session_start();
require_once "config/database.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: index.php");
    exit;
}

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$remember = isset($_POST['remember']);

if ($email === '' || $password === '') {
    header("Location: index.php?error=empty");
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header("Location: index.php?error=invalid");
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, nama_lengkap, email, password, role, foto_profil, status FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        header("Location: index.php?error=invalid");
        exit;
    }

    if ($user['status'] !== 'aktif') {
        header("Location: index.php?error=inactive");
        exit;
    }

    session_regenerate_id(true);
    $_SESSION['user_id']     = $user['id'];
    $_SESSION['nama_lengkap'] = $user['nama_lengkap'];
    $_SESSION['email']        = $user['email'];
    $_SESSION['role']         = $user['role'];
    $_SESSION['foto_profil']  = $user['foto_profil'];
    $_SESSION['login_time']   = time();

    if ($remember) {
        $cookieLifetime = time() + (30 * 24 * 60 * 60);
        setcookie('remember_login', '1', ['expires' => $cookieLifetime, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
    }

    header("Location: dashboard.php");
    exit;
} catch (PDOException $e) {
    header("Location: index.php?error=system");
    exit;
}`,
    dashboard: `<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit;
}

$nama  = $_SESSION['nama_lengkap'];
$email = $_SESSION['email'];
$role  = $_SESSION['role'];
$foto  = $_SESSION['foto_profil'];
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Dashboard - SIMASET SEKOLAH</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 min-h-screen">
    <header class="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 class="text-lg font-bold text-slate-800">SIMASET SEKOLAH</h1>
        <div class="flex items-center gap-3">
            <span class="text-sm font-semibold"><?= htmlspecialchars($nama) ?> (<?= htmlspecialchars($role) ?>)</span>
            <a href="logout.php" class="text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border font-bold">Keluar</a>
        </div>
    </header>
    <main class="max-w-7xl mx-auto p-6">
        <div class="bg-blue-600 text-white p-6 rounded-2xl">
            <h2 class="text-xl font-bold">Selamat Datang, <?= htmlspecialchars($nama) ?>!</h2>
            <p class="text-sm text-blue-100 mt-1">Role: <?= htmlspecialchars($role) ?> &bull; Sesi: <?= htmlspecialchars($email) ?></p>
        </div>
    </main>
</body>
</html>`,
    logout: `<?php
session_start();
$_SESSION = [];
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
}
if (isset($_COOKIE['remember_login'])) {
    setcookie('remember_login', '', time() - 3600, '/');
}
session_destroy();
header("Location: index.php?logout=success");
exit;`,
    sql: `-- Basis Data SIMASET SEKOLAH
CREATE DATABASE IF NOT EXISTS simaset_sekolah;
USE simaset_sekolah;

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
);

-- Seed Default (Password: admin123)
-- Hash Bcrypt: $2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm
INSERT INTO users (nama_lengkap, email, password, role, status) VALUES
('Administrator', 'admin@simaset.sch.id', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'ADMIN', 'aktif'),
('Drs. H. Bambang Sudarsono, M.Pd', 'kepsek@smk.sch.id', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'KEPALA_SEKOLAH', 'aktif'),
('Ahmad Fauzi, A.Md', 'fauzi.aset@smk.sch.id', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'PENGURUS_BARANG', 'aktif'),
('Hj. Nuraeni, S.E, M.Ak', 'bendahara@smk.sch.id', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'BENDAHARA', 'aktif'),
('Siti Rahmawati, S.Pd', 'siti.guru@smk.sch.id', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'GURU', 'aktif'),
('Dewi Lestari, S.E', 'dewi.tu@smk.sch.id', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'STAFF', 'aktif');`,
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-between items-center px-4 py-8 transition-colors">
      <div className="w-full max-w-md my-auto">
        {/* LOGIN CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-7 sm:p-8 transition-colors">
          {/* LOGO */}
          <div className="text-center mb-7">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 overflow-hidden p-2">
                {school.logoUrl ? (
                  <img
                    src={school.logoUrl}
                    alt="Logo Sekolah"
                    className="w-14 h-14 object-contain"
                    onError={e => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-white text-3xl font-black">S</span>
                )}
              </div>
            </div>

            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              SIMASET SEKOLAH
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sistem Informasi Manajemen Aset Sekolah
            </p>
          </div>

          {/* SUCCESS NOTIFICATION (LOGOUT) */}
          {successMessage && (
            <div className="mb-5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ERROR NOTIFICATION */}
          {errorMessage && (
            <div className="mb-5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* FORM LOGIN */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider"
              >
                Email
              </label>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>

                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="putrabs954@gamil.com"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xs sm:text-sm font-medium"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider"
              >
                Password
              </label>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-xs sm:text-sm font-medium font-mono"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
                  aria-label="Tampilkan password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* REMEMBER + FORGOT */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="remember"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Ingat Saya</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Lupa Password?
              </button>
            </div>

            {/* BUTTON SUBMIT */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition duration-200 shadow-md hover:shadow-lg shadow-blue-600/20 text-xs sm:text-sm mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Memproses Masuk...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          {/* REGISTER LINK */}
          <div className="text-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold ml-1 cursor-pointer"
              >
                Hubungi Admin
              </button>
            </p>
          </div>
        </div>

        {/* NATIVE PHP CODE VIEWER BUTTON */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowPhpCodeModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold shadow-xs transition"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-600" />
            <span>Lihat Skrip Backend PHP & MySQL Native</span>
          </button>
        </div>

        {/* FOOTER */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-5">
          &copy; {new Date().getFullYear()} SIMASET SEKOLAH &bull; Hak Cipta Dilindungi
        </p>
      </div>

      {/* MODAL: LUPA PASSWORD */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => {
          setShowForgotModal(false);
          setForgotStep('email');
          setForgotError('');
        }}
        title="Pemulihan & Reset Kata Sandi"
        subtitle="Atur ulang password akun SIMASET SEKOLAH Anda secara aman"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
          {forgotError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{forgotError}</span>
            </div>
          )}

          {forgotStep === 'email' && (
            <form onSubmit={handleVerifyEmailForReset} className="space-y-3">
              <p className="text-slate-600 dark:text-slate-400">
                Masukkan alamat email resmi sekolah Anda yang telah terdaftar di sistem SIMASET.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Terdaftar
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="putrabs954@gamil.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition"
                >
                  Verifikasi Email &rarr;
                </button>
              </div>
            </form>
          )}

          {forgotStep === 'reset' && (
            <form onSubmit={handleApplyNewPassword} className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                Email terverifikasi: <strong>{forgotEmail}</strong>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi Baru (Minimal 6 Karakter)
                </label>
                <input
                  type="password"
                  required
                  value={newResetPassword}
                  onChange={e => setNewResetPassword(e.target.value)}
                  placeholder="Masukkan kata sandi baru"
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  value={confirmResetPassword}
                  onChange={e => setConfirmResetPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotStep('email')}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition"
                >
                  {forgotLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
                </button>
              </div>
            </form>
          )}

          {forgotStep === 'done' && (
            <div className="space-y-4 text-center py-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                  Kata Sandi Berhasil Diperbarui!
                </h5>
                <p className="text-xs text-slate-500 mt-1">
                  Kata sandi baru telah disimpan dengan hashing aman di basis data. Anda sekarang dapat masuk.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotStep('email');
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition"
              >
                Kembali ke Halaman Masuk
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL: DAFTAR AKUN */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Pendaftaran Akun Baru"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-3">
            <UserCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-blue-900 dark:text-blue-200 text-sm">
                Otorisasi Pendaftaran Pengguna
              </h5>
              <p className="mt-1 leading-relaxed">
                Pendaftaran akun SIMASET SEKOLAH tidak dibuka untuk umum. Pembuatan akun guru, kepala sekolah, staf tata usaha, dan pengurus barang dilakukan langsung oleh Administrator Sarpras.
              </p>
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-400">
            Jika Anda merupakan pegawai atau guru baru yang belum memiliki akses login, silakan ajukan penerbitan akun kepada operator sarpras dengan melampirkan SK penugasan / NIP resmi.
          </p>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: SOURCE CODE PHP & MYSQL NATIVE */}
      <Modal
        isOpen={showPhpCodeModal}
        onClose={() => setShowPhpCodeModal(false)}
        title="Berkas Skrip Backend PHP & MySQL Native"
        subtitle="Struktur lengkap siap pakai untuk XAMPP / Laragon / Apache Server"
        maxWidth="4xl"
      >
        <div className="space-y-4 text-xs">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveCodeTab('config')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeCodeTab === 'config'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              config/database.php
            </button>
            <button
              onClick={() => setActiveCodeTab('index')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeCodeTab === 'index'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              index.php
            </button>
            <button
              onClick={() => setActiveCodeTab('proses')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeCodeTab === 'proses'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              proses-login.php
            </button>
            <button
              onClick={() => setActiveCodeTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeCodeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              dashboard.php
            </button>
            <button
              onClick={() => setActiveCodeTab('logout')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeCodeTab === 'logout'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              logout.php
            </button>
            <button
              onClick={() => setActiveCodeTab('sql')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeCodeTab === 'sql'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              database.sql
            </button>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-slate-500">
              Direktori: <strong>simasset-sekolah/{activeCodeTab === 'config' ? 'config/database.php' : activeCodeTab === 'sql' ? 'database.sql' : `${activeCodeTab}.php`}</strong>
            </span>

            <button
              onClick={() => copyToClipboard(phpCodes[activeCodeTab], activeCodeTab)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs transition"
            >
              {copiedKey === activeCodeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Skrip</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer */}
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-96 border border-slate-800 leading-relaxed">
            {phpCodes[activeCodeTab]}
          </pre>
        </div>
      </Modal>
    </div>
  );
};
