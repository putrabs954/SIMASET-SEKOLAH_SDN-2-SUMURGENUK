<?php
session_start();

// Jika sudah memiliki sesi login aktif, arahkan langsung ke dashboard
if (isset($_SESSION['user_id'])) {
    header("Location: dashboard.php");
    exit;
}

$error = $_GET['error'] ?? '';
$logout = $_GET['logout'] ?? '';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - SIMASET SEKOLAH</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#2563eb'
                    }
                }
            }
        }
    </script>
</head>
<body class="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md">
        <!-- LOGIN CARD -->
        <div class="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <!-- LOGO -->
            <div class="text-center mb-8">
                <div class="flex justify-center mb-4">
                    <div class="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden">
                        <img
                            src="assets/logo.png"
                            alt="Logo Sekolah"
                            class="w-14 h-14 object-contain"
                            onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\'text-white text-3xl font-black\'>S</span>';"
                        >
                    </div>
                </div>
                <h1 class="text-2xl font-bold text-slate-800 tracking-tight">
                    SIMASET SEKOLAH
                </h1>
                <p class="text-sm text-slate-500 mt-1">
                    Sistem Informasi Manajemen Aset Sekolah
                </p>
            </div>

            <!-- PESAN SUKSES LOGOUT -->
            <?php if ($logout === 'success'): ?>
                <div class="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Anda telah berhasil keluar dari sistem.</span>
                </div>
            <?php endif; ?>

            <!-- PESAN ERROR -->
            <?php if ($error): ?>
                <div class="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                        <?php
                        $messages = [
                            'invalid'  => 'Email atau password salah.',
                            'inactive' => 'Akun Anda sedang dinonaktifkan.',
                            'empty'    => 'Email dan password wajib diisi.',
                            'system'   => 'Terjadi kesalahan sistem.'
                        ];
                        echo htmlspecialchars($messages[$error] ?? 'Terjadi kesalahan saat masuk.');
                        ?>
                    </span>
                </div>
            <?php endif; ?>

            <!-- FORM LOGIN -->
            <form action="proses-login.php" method="POST" class="space-y-5">
                <!-- EMAIL -->
                <div>
                    <label for="email" class="block text-sm font-semibold text-slate-700 mb-2">
                        Email Resmi
                    </label>
                    <div class="relative">
                        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12H8m8 0a4 4 0 00-8 0m8 0a4 4 0 01-8 0m12 0a8 8 0 11-16 0 8 8 0 0116 0z" />
                            </svg>
                        </span>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            autocomplete="email"
                            placeholder="nama@email.com"
                            class="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-slate-900 bg-white"
                        >
                    </div>
                </div>

                <!-- PASSWORD -->
                <div>
                    <label for="password" class="block text-sm font-semibold text-slate-700 mb-2">
                        Password
                    </label>
                    <div class="relative">
                        <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            autocomplete="current-password"
                            placeholder="Masukkan password"
                            class="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-slate-900 bg-white"
                        >
                        <button
                            type="button"
                            onclick="togglePassword()"
                            class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition"
                            aria-label="Tampilkan password"
                        >
                            <svg id="eyeIcon" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- REMEMBER + FORGOT -->
                <div class="flex items-center justify-between text-sm">
                    <label class="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            name="remember"
                            value="1"
                            class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        >
                        Ingat Saya
                    </label>
                    <a href="javascript:void(0)" onclick="alert('Untuk mereset password, silakan hubungi Administrator Sarana Prasarana Sekolah.')" class="text-blue-600 hover:text-blue-800 font-medium">
                        Lupa Password?
                    </a>
                </div>

                <!-- BUTTON SUBMIT -->
                <button
                    type="submit"
                    class="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md hover:shadow-lg shadow-blue-600/20"
                >
                    Masuk
                </button>
            </form>

            <!-- REGISTER NOTE -->
            <div class="text-center mt-6 pt-4 border-t border-slate-100">
                <p class="text-xs text-slate-500">
                    Belum punya akun?
                    <a href="javascript:void(0)" onclick="alert('Pendaftaran akun staf dan guru baru dikelola langsung oleh Administrator melalui menu Pengguna.')" class="text-blue-600 hover:text-blue-800 font-semibold ml-1">
                        Hubungi Admin
                    </a>
                </p>
            </div>
        </div>

        <!-- FOOTER -->
        <p class="text-center text-xs text-slate-400 mt-6 font-medium">
            &copy; <?= date('Y') ?> SIMASET SEKOLAH &bull; Hak Cipta Dilindungi
        </p>
    </div>

    <script>
        function togglePassword() {
            const password = document.getElementById('password');
            const icon = document.getElementById('eyeIcon');
            if (password.type === 'password') {
                password.type = 'text';
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />';
            } else {
                password.type = 'password';
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />';
            }
        }
    </script>
</body>
</html>
