// routes/peminjamanRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirPeminjaman = path.join(__dirname, '..', 'uploads', 'peminjaman');
if (!fs.existsSync(uploadDirPeminjaman)) {
  fs.mkdirSync(uploadDirPeminjaman, { recursive: true });
}

const fotoPeminjamanStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirPeminjaman),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const uploadFotoPeminjaman = multer({ storage: fotoPeminjamanStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// ===== GET semua peminjaman (dengan filter) =====
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = `
      SELECT p.*, b.nama_barang, b.merk, b.tipe, b.kode_barang, b.nomor_inventaris_ga,
             b.serial_number, b.part_number, b.penanggung_jawab, b.lokasi, b.program_project,
             u.nama as peminjam, u.divisi as unit
      FROM peminjaman p
      JOIN barang b ON p.barang_id = b.id
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (b.nama_barang LIKE ? OR u.nama LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY p.dibuat_pada DESC`;

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows, message: '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// ===== AJUKAN peminjaman baru (LANGSUNG OTOMATIS DISETUJUI, tanpa approval admin) =====
router.post('/', verifyToken, uploadFotoPeminjaman.single('fotoSebelum'), async (req, res) => {
  try {
    const { barangId, tanggalPinjam, tanggalRencanaKembali, keperluan } = req.body;
    const userId = req.user.id;
    const fotoSebelum = req.file ? `/uploads/peminjaman/${req.file.filename}` : null;

    if (!barangId || !tanggalPinjam) {
      return res.status(400).json({ success: false, data: null, message: 'Barang dan tanggal pinjam wajib diisi' });
    }

    const [barangRows] = await pool.query('SELECT id, kondisi, status FROM barang WHERE id = ?', [barangId]);
    if (barangRows.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Barang tidak ditemukan' });
    }
    const barang = barangRows[0];

    const [activeLoans] = await pool.query(
      `SELECT id FROM peminjaman WHERE barang_id = ? AND status IN ('Menunggu Persetujuan','Disetujui','Dipinjam','Menunggu Verifikasi')`,
      [barangId]
    );
    if (activeLoans.length > 0) {
      return res.status(409).json({ success: false, data: null, message: 'Barang ini sedang dipinjam atau masih dalam proses peminjaman lain' });
    }

    // Langsung status 'Dipinjam' + tercatat disetujui saat itu juga (tanpa approval manual admin)
    const [result] = await pool.query(
      `INSERT INTO peminjaman (barang_id, user_id, tanggal_pinjam, tanggal_rencana_kembali, keperluan, kondisi_awal, foto_sebelum, status, disetujui_pada)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Dipinjam', NOW())`,
      [barangId, userId, tanggalPinjam, tanggalRencanaKembali || null, keperluan || null, barang.kondisi, fotoSebelum]
    );

    // Barang langsung berstatus Dipinjam
    await pool.query(`UPDATE barang SET status='Dipinjam' WHERE id=?`, [barangId]);

    // Catat log transaksi langsung
    await pool.query(
      `INSERT INTO log_transaksi (barang_id, penanggung_jawab, aktivitas, tanggal, remark)
       SELECT ?, u.nama, 'Dipinjam', NOW(), ? FROM users u WHERE u.id=?`,
      [barangId, keperluan || null, userId]
    );

    res.json({ success: true, data: { id: result.insertId }, message: 'Peminjaman berhasil, barang langsung dipinjamkan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// ===== APPROVE / TOLAK peminjaman (admin only) - tetap ada untuk data lama yang masih Menunggu Persetujuan =====
router.put('/:id/persetujuan', verifyToken, requireAdmin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { disetujui } = req.body;
    const adminId = req.user.id;

    const [rows] = await conn.query('SELECT * FROM peminjaman WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Peminjaman tidak ditemukan' });
    }
    const pinjam = rows[0];
    if (pinjam.status !== 'Menunggu Persetujuan') {
      return res.status(400).json({ success: false, data: null, message: 'Peminjaman ini sudah diproses sebelumnya' });
    }

    await conn.beginTransaction();

    if (disetujui) {
      await conn.query(
        `UPDATE peminjaman SET status='Dipinjam', disetujui_oleh=?, disetujui_pada=NOW() WHERE id=?`,
        [adminId, id]
      );
      await conn.query(`UPDATE barang SET status='Dipinjam' WHERE id=?`, [pinjam.barang_id]);
      await conn.query(
        `INSERT INTO log_transaksi (barang_id, penanggung_jawab, aktivitas, tanggal, remark)
         SELECT ?, u.nama, 'Dipinjam', NOW(), ? FROM users u WHERE u.id=?`,
        [pinjam.barang_id, pinjam.keperluan, pinjam.user_id]
      );
    } else {
      await conn.query(
        `UPDATE peminjaman SET status='Ditolak', disetujui_oleh=?, disetujui_pada=NOW() WHERE id=?`,
        [adminId, id]
      );
    }

    await conn.commit();
    res.json({ success: true, data: { id }, message: disetujui ? 'Peminjaman disetujui' : 'Peminjaman ditolak' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  } finally {
    conn.release();
  }
});

// ===== AJUKAN pengembalian (user) =====
router.put('/:id/kembalikan', verifyToken, uploadFotoPeminjaman.single('fotoSesudah'), async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggalKembaliAktual, kondisiSaatKembali, catatanPengembalian } = req.body;
    const fotoSesudah = req.file ? `/uploads/peminjaman/${req.file.filename}` : null;

    const [rows] = await pool.query('SELECT * FROM peminjaman WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Peminjaman tidak ditemukan' });
    }
    if (rows[0].status !== 'Dipinjam') {
      return res.status(400).json({ success: false, data: null, message: 'Peminjaman ini tidak dalam status dipinjam' });
    }

    await pool.query(
      `UPDATE peminjaman SET status='Menunggu Verifikasi', tanggal_kembali_aktual=?, kondisi_saat_kembali=?, catatan_pengembalian=?, foto_sesudah=?
       WHERE id=?`,
      [tanggalKembaliAktual || new Date().toISOString().split('T')[0], kondisiSaatKembali, catatanPengembalian || null, fotoSesudah, id]
    );

    res.json({ success: true, data: { id }, message: 'Pengembalian diajukan, menunggu verifikasi admin' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// ===== VERIFIKASI pengembalian (admin only) =====
router.put('/:id/verifikasi', verifyToken, requireAdmin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const [rows] = await conn.query('SELECT * FROM peminjaman WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Peminjaman tidak ditemukan' });
    }
    const pinjam = rows[0];
    if (pinjam.status !== 'Menunggu Verifikasi') {
      return res.status(400).json({ success: false, data: null, message: 'Peminjaman ini tidak dalam status menunggu verifikasi' });
    }

    await conn.beginTransaction();

    await conn.query(
      `UPDATE peminjaman SET status='Selesai', diverifikasi_oleh=?, diverifikasi_pada=NOW() WHERE id=?`,
      [adminId, id]
    );

    await conn.query(
      `UPDATE barang SET status='Disimpan', kondisi=? WHERE id=?`,
      [pinjam.kondisi_saat_kembali, pinjam.barang_id]
    );

    await conn.query(
      `INSERT INTO log_transaksi (barang_id, penanggung_jawab, aktivitas, kondisi, tanggal, remark)
       SELECT ?, u.nama, 'Dikembalikan', ?, NOW(), ? FROM users u WHERE u.id=?`,
      [pinjam.barang_id, pinjam.kondisi_saat_kembali, pinjam.catatan_pengembalian, pinjam.user_id]
    );

    await conn.commit();
    res.json({ success: true, data: { id }, message: 'Pengembalian diverifikasi, barang kembali ke inventory' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  } finally {
    conn.release();
  }
});

// ===== EXPORT peminjaman (Excel/CSV/PDF) =====
router.post('/export', verifyToken, async (req, res) => {
  try {
    const { format, jenisTransaksi, tanggalMulai, tanggalSelesai, status } = req.body;

    let query = `
      SELECT p.*, b.nama_barang, b.kode_barang, u.nama as peminjam, u.divisi as unit
      FROM peminjaman p
      JOIN barang b ON p.barang_id = b.id
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (tanggalMulai) {
      query += ` AND p.tanggal_pinjam >= ?`;
      params.push(tanggalMulai);
    }
    if (tanggalSelesai) {
      query += ` AND p.tanggal_pinjam <= ?`;
      params.push(tanggalSelesai);
    }
    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }
    query += ` ORDER BY p.dibuat_pada DESC`;

    const [rows] = await pool.query(query, params);

    let filtered = rows;
    if (jenisTransaksi === 'peminjaman') {
      filtered = rows.filter(r => ['Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Dipinjam'].includes(r.status));
    } else if (jenisTransaksi === 'pengembalian') {
      filtered = rows.filter(r => ['Menunggu Verifikasi', 'Selesai'].includes(r.status));
    }

    const headers = ['Barang', 'Kode Barang', 'Peminjam', 'Unit', 'Status', 'Tanggal Pinjam', 'Tanggal Rencana Kembali', 'Tanggal Kembali Aktual', 'Kondisi Awal', 'Kondisi Saat Kembali', 'Keperluan', 'Catatan Pengembalian'];
    const dataRows = filtered.map(r => [
      r.nama_barang || '',
      r.kode_barang || '',
      r.peminjam || '',
      r.unit || '',
      r.status || '',
      r.tanggal_pinjam ? new Date(r.tanggal_pinjam).toLocaleDateString('id-ID') : '',
      r.tanggal_rencana_kembali ? new Date(r.tanggal_rencana_kembali).toLocaleDateString('id-ID') : '',
      r.tanggal_kembali_aktual ? new Date(r.tanggal_kembali_aktual).toLocaleDateString('id-ID') : '',
      r.kondisi_awal || '',
      r.kondisi_saat_kembali || '',
      r.keperluan || '',
      r.catatan_pengembalian || ''
    ]);

    if (format === 'excel') {
      const XLSX = require('xlsx');
      const wsData = [headers, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Peminjaman');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', 'attachment; filename="peminjaman.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buffer);

    } else if (format === 'csv') {
      const csvLines = [headers.join(',')];
      dataRows.forEach(row => {
        csvLines.push(row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
      });
      res.setHeader('Content-Disposition', 'attachment; filename="peminjaman.csv"');
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csvLines.join('\n'));

    } else if (format === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      res.setHeader('Content-Disposition', 'attachment; filename="peminjaman.pdf"');
      res.setHeader('Content-Type', 'application/pdf');
      doc.pipe(res);

      doc.fontSize(14).text('Transaksi Peminjaman dan Pengembalian', { align: 'center' });
      doc.moveDown();

      const colWidth = (doc.page.width - 60) / headers.length;
      let y = doc.y;

      doc.fontSize(7).font('Helvetica-Bold');
      headers.forEach((h, i) => {
        doc.text(String(h), 30 + i * colWidth, y, { width: colWidth, ellipsis: true });
      });
      y += 15;
      doc.font('Helvetica');

      dataRows.forEach(row => {
        if (y > doc.page.height - 40) {
          doc.addPage();
          y = 30;
        }
        row.forEach((val, i) => {
          doc.text(String(val), 30 + i * colWidth, y, { width: colWidth, ellipsis: true });
        });
        y += 15;
      });

      doc.end();
      return;

    } else {
      return res.status(400).json({ success: false, data: null, message: 'Format tidak dikenali' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Gagal export peminjaman' });
  }
});

// ===== GET jumlah peminjaman user yang masih menunggu approval/verifikasi =====
router.get('/menunggu-saya', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT COUNT(*) as jumlah FROM peminjaman WHERE user_id = ? AND status IN ('Menunggu Persetujuan','Menunggu Verifikasi')`,
      [userId]
    );
    res.json({ success: true, data: { jumlah: rows[0].jumlah }, message: '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// ===== GET daftar peminjaman AKTIF milik user yang login (untuk "barang perlu dikembalikan") =====
router.get('/milik-saya', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Ambil SEMUA field yang dibutuhkan dari tabel barang dan users
    const [rows] = await pool.query(
      `SELECT 
        p.*,
        b.nama_barang,
        b.merk,
        b.tipe,
        b.kode_barang,
        b.nomor_inventaris_ga,
        b.serial_number,
        b.part_number,
        b.penanggung_jawab,
        b.lokasi,
        b.program_project,
        b.kondisi as kondisi_barang,
        u.nama as peminjam,
        u.divisi as unit
       FROM peminjaman p
       JOIN barang b ON p.barang_id = b.id
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ? AND p.status = 'Dipinjam'
       ORDER BY p.tanggal_rencana_kembali ASC`,
      [userId]
    );

    console.log(`📊 Found ${rows.length} active loans for user ${userId}`);

    const data = rows.map(r => {
      let sisaHari = null;
      let terlambat = false;

      if (r.tanggal_rencana_kembali) {
        const today = new Date();
        const target = new Date(r.tanggal_rencana_kembali);
        sisaHari = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
        terlambat = sisaHari < 0;
      }

      return {
        id: r.id,
        tanggalPinjam: r.tanggal_pinjam,
        tanggalRencanaKembali: r.tanggal_rencana_kembali,
        tanggalKembaliAktual: r.tanggal_kembali_aktual,
        keperluan: r.keperluan,
        kondisiAwal: r.kondisi_awal,
        fotoSebelum: r.foto_sebelum,
        status: r.status,
        namaBarang: r.nama_barang,
        merk: r.merk,
        tipe: r.tipe,
        kodeBarang: r.kode_barang,
        nomorInventarisGa: r.nomor_inventaris_ga,
        serialNumber: r.serial_number,
        partNumber: r.part_number,
        penanggungJawab: r.penanggung_jawab,
        lokasi: r.lokasi,
        programProject: r.program_project,
        kondisiBarang: r.kondisi_barang,
        peminjam: r.peminjam,
        unit: r.unit,
        sisaHari,
        terlambat
      };
    });

    res.json({ success: true, data, message: '' });
  } catch (err) {
    console.error('❌ Error fetching user loans:', err);
    res.status(500).json({ success: false, data: null, message: 'Server error: ' + err.message });
  }
});

module.exports = router;