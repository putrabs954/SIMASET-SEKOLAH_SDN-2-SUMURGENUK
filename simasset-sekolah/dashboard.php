<?php
session_start();

// Proteksi halaman: Wajib login
if (!isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit;
}

$userId      = $_SESSION['user_id'];
$nama        = $_SESSION['nama_lengkap'];
$email       = $_SESSION['email'];
$role        = $_SESSION['role'];
$foto        = $_SESSION['foto_profil'];

// Generate inisial untuk default avatar jika foto kosong
function getInitials($fullName) {
    $parts = preg_split('/\s+/', trim($fullName));
    if (count($parts) === 1) {
        return strtoupper(substr($parts[0], 0, 2));
    }
    return strtoupper(substr($parts[0], 0, 1) . substr($parts[1], 0, 1));
}

// Role badge styling
$roleBadges = [
    'ADMIN'           => 'bg-rose-100 text-rose-800 border-rose-200',
    'KEPALA_SEKOLAH'  => 'bg-purple-100 text-purple-800 border-purple-200',
    'PENGURUS_BARANG' => 'bg-blue-100 text-blue-800 border-blue-200',
    'BENDAHARA'       => 'bg-amber-100 text-amber-800 border-amber-200',
    'GURU'            => 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'STAFF'           => 'bg-slate-100 text-slate-800 border-slate-200',
];
$roleBadgeClass = $roleBadges[$role] ?? 'bg-slate-100 text-slate-800 border-slate-200';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - SIMASET SEKOLAH</title>
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
<body class="bg-slate-100 text-slate-900 min-h-screen flex flex-col font-sans">

    <!-- HEADER / TOPBAR -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <div class="flex items-center justify-between">
                
                <!-- BRAND & TITLE -->
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
                        S
                    </div>
                    <div>
                        <h1 class="text-base font-bold text-slate-800 leading-tight">
                            SIMASET SEKOLAH
                        </h1>
                        <p class="text-xs text-slate-500 leading-none">
                            Sistem Informasi Manajemen Aset &amp; Sarana Prasarana
                        </p>
                    </div>
                </div>

                <!-- USER PROFILE & LOGOUT -->
                <div class="flex items-center gap-3">
                    <!-- AVATAR & INFO -->
                    <div class="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                        <?php if (!empty($foto)): ?>
                            <img
                                src="<?= htmlspecialchars($foto) ?>"
                                alt="<?= htmlspecialchars($nama) ?>"
                                class="w-8 h-8 rounded-full object-cover border border-slate-300"
                                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                            >
                            <div class="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs hidden items-center justify-center">
                                <?= getInitials($nama) ?>
                            </div>
                        <?php else: ?>
                            <div class="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                                <?= getInitials($nama) ?>
                            </div>
                        <?php endif; ?>

                        <div class="hidden sm:block text-left">
                            <span class="block text-xs font-bold text-slate-800 leading-tight">
                                <?= htmlspecialchars($nama) ?>
                            </span>
                            <span class="inline-block text-[10px] font-semibold px-2 py-0.2 rounded-full border <?= $roleBadgeClass ?>">
                                <?= htmlspecialchars(str_replace('_', ' ', $role)) ?>
                            </span>
                        </div>
                    </div>

                    <!-- TOMBOL LOGOUT -->
                    <a
                        href="logout.php"
                        onclick="return confirm('Apakah Anda yakin ingin keluar dari sistem SIMASET?');"
                        class="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition shadow-xs"
                        title="Keluar dari akun"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span class="hidden sm:inline">Keluar</span>
                    </a>
                </div>

            </div>
        </div>
    </header>

    <!-- MAIN CONTENT -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <!-- BANNER SELAMAT DATANG -->
        <div class="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1">
                <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xs text-white">
                    Sesi Aktif: <?= htmlspecialchars($email) ?>
                </span>
                <h2 class="text-xl sm:text-2xl font-bold tracking-tight">
                    Selamat Datang, <?= htmlspecialchars($nama) ?>!
                </h2>
                <p class="text-xs sm:text-sm text-blue-100 max-w-2xl">
                    Anda masuk dengan hak akses <strong class="text-white"><?= htmlspecialchars(str_replace('_', ' ', $role)) ?></strong>. Seluruh aktivitas transaksi dan pencatatan aset terekam secara otomatis dalam log audit sistem.
                </p>
            </div>
            <div class="flex items-center gap-2">
                <span class="text-xs bg-white/10 px-3 py-2 rounded-xl text-blue-100 font-mono">
                    Waktu Login: <?= date('H:i, d M Y') ?>
                </span>
            </div>
        </div>

        <!-- STATISTIK RINGKAS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div class="flex items-center justify-between text-slate-500 mb-2">
                    <span class="text-xs font-bold uppercase tracking-wider">Total Aset Aktif</span>
                    <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        AST
                    </div>
                </div>
                <div class="text-2xl font-extrabold text-slate-900">142</div>
                <p class="text-[11px] text-emerald-600 mt-1 font-semibold">&bull; Kondisi Baik: 128 unit</p>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div class="flex items-center justify-between text-slate-500 mb-2">
                    <span class="text-xs font-bold uppercase tracking-wider">Barang Habis Pakai</span>
                    <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        BHP
                    </div>
                </div>
                <div class="text-2xl font-extrabold text-slate-900">48</div>
                <p class="text-[11px] text-amber-600 mt-1 font-semibold">&bull; 3 item stok menipis</p>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div class="flex items-center justify-between text-slate-500 mb-2">
                    <span class="text-xs font-bold uppercase tracking-wider">Peminjaman Berjalan</span>
                    <div class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        PJM
                    </div>
                </div>
                <div class="text-2xl font-extrabold text-slate-900">12</div>
                <p class="text-[11px] text-blue-600 mt-1 font-semibold">&bull; 2 aset jatuh tempo hari ini</p>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div class="flex items-center justify-between text-slate-500 mb-2">
                    <span class="text-xs font-bold uppercase tracking-wider">Total Ruangan</span>
                    <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        RNG
                    </div>
                </div>
                <div class="text-2xl font-extrabold text-slate-900">24</div>
                <p class="text-[11px] text-slate-500 mt-1 font-semibold">&bull; Tersebar di 3 gedung</p>
            </div>

        </div>

        <!-- INFORMASI HAK AKSES PENGGUNA -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 class="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                Rincian Akun &amp; Otoritas Hak Akses Sistem
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span class="text-slate-500 font-semibold">Nama Lengkap:</span>
                    <p class="font-bold text-slate-900 text-sm"><?= htmlspecialchars($nama) ?></p>
                </div>
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span class="text-slate-500 font-semibold">Alamat Email:</span>
                    <p class="font-bold text-slate-900 text-sm font-mono"><?= htmlspecialchars($email) ?></p>
                </div>
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span class="text-slate-500 font-semibold">Tingkat Otoritas (Role):</span>
                    <p class="font-bold text-blue-700 text-sm"><?= htmlspecialchars($role) ?></p>
                </div>
            </div>
        </div>

    </main>

    <!-- FOOTER -->
    <footer class="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        &copy; <?= date('Y') ?> SIMASET SEKOLAH &bull; Sistem Informasi Manajemen Aset Sekolah Terpadu
    </footer>

</body>
</html>
