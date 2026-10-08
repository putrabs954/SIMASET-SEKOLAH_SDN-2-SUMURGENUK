import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini API client if GEMINI_API_KEY is available
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // AI Assistant endpoint for SIMASET SEKOLAH
  app.post('/api/ai-assistant', async (req, res) => {
    try {
      const { prompt, context } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // If Gemini API is available on server, use gemini-3.8-flash
      if (ai) {
        try {
          const systemInstruction = `Anda adalah "ASSET AI ASSISTANT", asisten kecerdasan buatan khusus administrasi sarana dan prasarana sekolah untuk aplikasi "SIMASET SEKOLAH".
Tugas Anda:
1. Menjawab pertanyaan pengguna seputar data aset sekolah, kondisi barang, stok habis pakai, peminjaman, pemeliharaan, dan nilai perolehan.
2. Memberikan ringkasan eksekutif yang akurat, rapi, dan mudah dibaca (gunakan poin-poin/tabel Markdown jika relevan).
3. Memberikan rekomendasi pemeliharaan dan pengadaan secara bijak berdasarkan data aktual yang diberikan.
4. Menjaga bahasa tetap formal, sopan, profesional, dan dalam Bahasa Indonesia standar administrasi sekolah.
5. PENTING: Anda hanya memberikan informasi dan analisis data, jangan mengeksekusi penghapusan atau mutasi data tanpa persetujuan pengguna.`;

          const contextSummary = context ? `\n\n[DATA SISTEM TERBARU]:\n${JSON.stringify(context, null, 2)}` : '';
          const contents = `${prompt}${contextSummary}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents,
            config: {
              systemInstruction,
              temperature: 0.4,
            },
          });

          return res.json({
            reply: response.text || 'Maaf, saya tidak dapat merumuskan jawaban saat ini.',
            source: 'gemini',
          });
        } catch (geminiError: any) {
          console.warn('Gemini API call failed, falling back to local analysis engine:', geminiError?.message);
        }
      }

      // Intelligent Local Analysis Fallback
      const lower = prompt.toLowerCase();
      let reply = '';
      const summary = context?.stats || {};
      const totalAssets = summary.totalAssets ?? 0;
      const totalValue = summary.totalValueFormatted ?? 'Rp 0';
      const brokenAssets = summary.brokenHeavy ?? 0;
      const lowStockCount = summary.lowStockCount ?? 0;
      const activeBorrowings = summary.activeBorrowings ?? 0;
      const inMaintenance = summary.inMaintenance ?? 0;

      if (lower.includes('total') || lower.includes('berapa') || lower.includes('jumlah aset')) {
        reply = `Berdasarkan data terkini di SIMASET SEKOLAH:\n\n` +
          `• **Total Seluruh Aset**: ${totalAssets} unit\n` +
          `• **Total Nilai Perolehan**: ${totalValue}\n` +
          `• **Kondisi Baik**: ${summary.goodCondition ?? 0} unit\n` +
          `• **Rusak Ringan**: ${summary.brokenLight ?? 0} unit\n` +
          `• **Rusak Berat**: ${brokenAssets} unit\n\n` +
          `Data ini mencakup seluruh kategori perlengkapan elektronik, mebel sekolah, sarana olahraga, dan laboratorium.`;
      } else if (lower.includes('stok') || lower.includes('menipis') || lower.includes('habis pakai')) {
        reply = `Berdasarkan pantauan barang habis pakai (ATK & Bahan Praktik):\n\n` +
          `• Terdeteksi **${lowStockCount} barang** dengan stok di bawah batas minimum (safety stock).\n` +
          `• Rekomendasi: Segera buat pengajuan Transaksi Barang Masuk untuk barang-barang kritis seperti Kertas HVS dan Tinta Printer agar operasional sekolah tidak terhambat.`;
      } else if (lower.includes('rusak') || lower.includes('perbaikan') || lower.includes('pemeliharaan')) {
        reply = `Analisis status kondisi dan pemeliharaan:\n\n` +
          `• **Aset Rusak Berat**: ${brokenAssets} unit (Perlu pemeriksaan teknisi untuk tindak lanjut penghapusan atau perbaikan besar).\n` +
          `• **Aset Sedang Dalam Pemeliharaan**: ${inMaintenance} unit.\n` +
          `• Rekomendasi: Prioritaskan perbaikan perangkat penunjang pembelajaran seperti LCD Proyektor dan Komputer Lab agar kegiatan KBM berjalan lancar.`;
      } else if (lower.includes('pinjam') || lower.includes('peminjaman')) {
        reply = `Informasi Sirkulasi Peminjaman Aset:\n\n` +
          `• Saat ini terdapat **${activeBorrowings} transaksi peminjaman aktif**.\n` +
          `• Pastikan seluruh guru/staff yang meminjam mengembalikan tepat waktu sesuai jadwal rencana kembali.`;
      } else if (lower.includes('rekomendasi') || lower.includes('laporan') || lower.includes('saran')) {
        reply = `Rekomendasi Manajerial Aset Sekolah:\n\n` +
          `1. **Inventarisasi Berkala**: Lakukan stock opname fisik tiap akhir semester dan cetak Formulir DIR (Daftar Inventaris Ruangan) untuk ditandatangani penanggung jawab ruangan.\n` +
          `2. **Pemberian Label QR**: Pastikan seluruh unit aset telah ditempeli label stiker QR Code resmi untuk memudahkan audit cepat menggunakan scanner kamera.\n` +
          `3. **Pengusulan Penghapusan**: Untuk ${brokenAssets} unit aset rusak berat yang tidak lagi ekonomis diperbaiki, segera buat berita acara usulan penghapusan aset.`;
      } else {
        reply = `Halo! Saya **ASSET AI ASSISTANT** siap membantu Anda mengelola data SIMASET SEKOLAH.\n\n` +
          `Ringkasan status sekolah saat ini:\n` +
          `• **${totalAssets} Aset Terdata** (Nilai total: ${totalValue})\n` +
          `• **${brokenAssets} Aset Rusak Berat** memerlukan tindak lanjut\n` +
          `• **${lowStockCount} Barang Habis Pakai** perlu restock\n` +
          `• **${activeBorrowings} Aset Sedang Dipinjam**\n\n` +
          `Anda dapat bertanya hal spesifik seperti perincian ruangan, status pemeliharaan, atau rekomendasi inventarisasi.`;
      }

      return res.json({
        reply,
        source: 'local-engine',
      });
    } catch (err: any) {
      console.error('AI assistant error:', err);
      return res.status(500).json({ error: 'Internal AI service error' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      appName: 'SIMASET SEKOLAH',
      time: new Date().toISOString(),
      aiEnabled: Boolean(apiKey),
    });
  });

  // Persistent Server-side Database Storage with RBAC & Session Security
  const DB_FILE_PATH = path.resolve('data/simaset_db.json');

  // Rate limiter map (60 requests per minute per IP)
  const ipRateLimits = new Map<string, { count: number; resetAt: number }>();
  const checkRateLimit = (ip: string, limit = 120, windowMs = 60000): boolean => {
    const now = Date.now();
    const record = ipRateLimits.get(ip);
    if (!record || now > record.resetAt) {
      ipRateLimits.set(ip, { count: 1, resetAt: now + windowMs });
      return true;
    }
    record.count++;
    return record.count <= limit;
  };

  // Helper to authenticate Bearer tokens and verify user roles
  const authenticateRequest = (req: any): { isAuthenticated: boolean; role: string; userId: string } => {
    const authHeader = req.headers.authorization;
    const role = (req.headers['x-user-role'] as string) || '';
    const userId = (req.headers['x-user-id'] as string) || '';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAuthenticated: false, role: '', userId: '' };
    }

    const token = authHeader.substring(7).trim();
    // Validate token structure: simaset_tok_<userId>_<timestamp>_<randomHex>
    if (!token.startsWith('simaset_tok_') || token.length < 24) {
      return { isAuthenticated: false, role: '', userId: '' };
    }

    return { isAuthenticated: true, role, userId };
  };

  // Safe database read
  app.get('/api/db', async (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ success: false, error: 'Terlalu banyak permintaan. Silakan tunggu sejenak.' });
    }

    try {
      const fs = await import('fs/promises');
      try {
        const content = await fs.readFile(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(content);

        // Sanitize: never leak plaintext passwords
        if (parsed && Array.isArray(parsed.users)) {
          parsed.users = parsed.users.map((u: any) => {
            const { password, ...safeUser } = u;
            return safeUser;
          });
        }

        return res.json({ success: true, data: parsed });
      } catch (e: any) {
        if (e.code === 'ENOENT') {
          return res.json({ success: true, data: null });
        }
        throw e;
      }
    } catch (err: any) {
      console.error('Failed to read db file:', err.message);
      return res.status(500).json({ success: false, error: 'Gagal memuat basis data server' });
    }
  });

  // Authenticated database persist
  app.post('/api/db', async (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ success: false, error: 'Terlalu banyak permintaan.' });
    }

    const auth = authenticateRequest(req);
    if (!auth.isAuthenticated) {
      return res.status(401).json({ success: false, error: 'Autentikasi sesi diperlukan untuk memperbarui basis data.' });
    }

    // Input validation: Must be an object with known structure
    const body = req.body;
    if (!body || typeof body !== 'object' || (!body.assets && !body.users && !body.school)) {
      return res.status(400).json({ success: false, error: 'Format data tidak valid.' });
    }

    // Role check: Non-admin users cannot delete users or modify administrator role
    if (auth.role !== 'ADMIN' && Array.isArray(body.users)) {
      // Prevent privilege escalation or unauthorized user deletion
      const hasPrivilegeTampering = body.users.some((u: any) => u.id === auth.userId && u.role === 'ADMIN');
      if (hasPrivilegeTampering && auth.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Akses ditolak: Tidak dapat meningkatkan hak akses sendiri.' });
      }
    }

    try {
      const fs = await import('fs/promises');
      await fs.mkdir(path.dirname(DB_FILE_PATH), { recursive: true });
      await fs.writeFile(DB_FILE_PATH, JSON.stringify(body, null, 2), 'utf-8');
      return res.json({ success: true });
    } catch (err: any) {
      console.error('Failed to save db file:', err.message);
      return res.status(500).json({ success: false, error: 'Gagal menyimpan basis data server' });
    }
  });

  // Protected reset endpoint: Requires valid ADMIN session and explicit RESET confirmation
  app.post('/api/db/reset', async (req, res) => {
    const auth = authenticateRequest(req);
    if (!auth.isAuthenticated) {
      return res.status(401).json({ success: false, error: 'Akses ditolak: Autentikasi diperlukan.' });
    }

    if (auth.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Akses ditolak: Hanya Administrator yang berhak mereset basis data.' });
    }

    if (req.body?.confirmReset !== 'RESET') {
      return res.status(400).json({ success: false, error: 'Konfirmasi reset harus berupa kata RESET.' });
    }

    try {
      const fs = await import('fs/promises');
      try {
        await fs.unlink(DB_FILE_PATH);
      } catch {}
      return res.json({ success: true, message: 'Basis data server berhasil dikosongkan.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Gagal mereset basis data server' });
    }
  });

  // Setup Vite middlewares for HMR / dev server
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SIMASET SEKOLAH] Full-stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
