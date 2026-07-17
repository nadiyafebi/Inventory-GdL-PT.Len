// routes/peminjamanRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// ===== GET semua peminjaman (dengan filter) =====
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = `
      SELECT p.*, b.nama_barang, b.kode_barang, b.serial_number,
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

// ===== AJUKAN peminjaman baru =====
router.post('/', verifyToken, async (req, res) => {
  try {
    const { barangId, tanggalPinjam, tanggalRencanaKembali, keperluan } = req.body;
    const userId = req.user.id;

    if (!barangId || !tanggalPinjam) {
      return res.status(400).json({ success: false, data: null, message: 'Barang dan tanggal pinjam wajib diisi' });
    }

    // Cek barang ada dan ambil kondisi + status terkini
    const [barangRows] = await pool.query('SELECT id, kondisi, status FROM barang WHERE id = ?', [barangId]);
    if (barangRows.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Barang tidak ditemukan' });
    }
    const barang = barangRows[0];

    // Cek barang spesifik ini masih ada peminjaman aktif (belum Selesai/Ditolak)
    const [activeLoans] = await pool.query(
      `SELECT id FROM peminjaman WHERE barang_id = ? AND status IN ('Menunggu Persetujuan','Disetujui','Dipinjam','Menunggu Verifikasi')`,
      [barangId]
    );
    if (activeLoans.length > 0) {
      return res.status(409).json({ success: false, data: null, message: 'Barang ini sedang dipinjam atau masih dalam proses peminjaman lain' });
    }

    const [result] = await pool.query(
      `INSERT INTO peminjaman (barang_id, user_id, tanggal_pinjam, tanggal_rencana_kembali, keperluan, kondisi_awal)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [barangId, userId, tanggalPinjam, tanggalRencanaKembali || null, keperluan || null, barang.kondisi]
    );

    res.json({ success: true, data: { id: result.insertId }, message: 'Peminjaman berhasil diajukan, menunggu persetujuan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// ===== APPROVE / TOLAK peminjaman (admin only) =====
router.put('/:id/persetujuan', verifyToken, requireAdmin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { disetujui } = req.body; // true atau false
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
router.put('/:id/kembalikan', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggalKembaliAktual, kondisiSaatKembali, catatanPengembalian } = req.body;

    const [rows] = await pool.query('SELECT * FROM peminjaman WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Peminjaman tidak ditemukan' });
    }
    if (rows[0].status !== 'Dipinjam') {
      return res.status(400).json({ success: false, data: null, message: 'Peminjaman ini tidak dalam status dipinjam' });
    }

    await pool.query(
      `UPDATE peminjaman SET status='Menunggu Verifikasi', tanggal_kembali_aktual=?, kondisi_saat_kembali=?, catatan_pengembalian=?
       WHERE id=?`,
      [tanggalKembaliAktual || new Date().toISOString().split('T')[0], kondisiSaatKembali, catatanPengembalian || null, id]
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

    // Barang balik ke inventory, kondisi & status di-update sesuai kondisi saat kembali
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
    // jenisTransaksi: 'semua' | 'peminjaman' | 'pengembalian'

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

module.exports = router;