// routes/ruanganRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// ===== GET semua ruangan =====
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ruangan ORDER BY nama_ruangan');
    res.json({ success: true, data: rows, message: '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// ===== TAMBAH ruangan baru (admin only) =====
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { namaRuangan } = req.body;
    if (!namaRuangan) {
      return res.status(400).json({ success: false, data: null, message: 'Nama ruangan wajib diisi' });
    }
    const [result] = await pool.query('INSERT INTO ruangan (nama_ruangan) VALUES (?)', [namaRuangan]);
    res.json({ success: true, data: { id: result.insertId }, message: 'Ruangan berhasil ditambahkan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// ===== GET semua booking (dengan filter) =====
router.get('/booking/list', verifyToken, async (req, res) => {
  try {
    const { ruanganId, status } = req.query;

    let query = `
      SELECT br.id, DATE_FORMAT(br.tanggal, '%Y-%m-%d') as tanggal, br.jam_mulai, br.jam_selesai, br.keperluan, br.status, br.diajukan_pada,
             r.nama_ruangan, u.nama as peminjam, u.divisi
      FROM booking_ruangan br
      JOIN ruangan r ON br.ruangan_id = r.id
      JOIN users u ON br.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (ruanganId) {
      query += ` AND br.ruangan_id = ?`;
      params.push(ruanganId);
    }
    if (status) {
      query += ` AND br.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY br.tanggal DESC, br.jam_mulai DESC`;

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows, message: '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// ===== AJUKAN booking baru (user atau admin) - dengan cek bentrok otomatis =====
router.post('/booking', verifyToken, async (req, res) => {
  try {
    const { ruanganId, tanggal, jamMulai, jamSelesai, keperluan } = req.body;
    const userId = req.user.id;

    if (!ruanganId || !tanggal || !jamMulai || !jamSelesai) {
      return res.status(400).json({ success: false, data: null, message: 'Ruangan, tanggal, jam mulai, dan jam selesai wajib diisi' });
    }

    if (jamMulai >= jamSelesai) {
      return res.status(400).json({ success: false, data: null, message: 'Jam mulai harus lebih awal dari jam selesai' });
    }

    // Cek bentrok: ruangan sama, tanggal sama, jam overlap, status Menunggu/Disetujui
    const [konflik] = await pool.query(
      `SELECT br.id, br.jam_mulai, br.jam_selesai, u.nama as peminjam
       FROM booking_ruangan br
       JOIN users u ON br.user_id = u.id
       WHERE br.ruangan_id = ? 
         AND br.tanggal = ? 
         AND br.status IN ('Menunggu','Disetujui')
         AND ? < br.jam_selesai 
         AND ? > br.jam_mulai`,
      [ruanganId, tanggal, jamMulai, jamSelesai]
    );

    if (konflik.length > 0) {
      const bentrok = konflik[0];
      return res.status(409).json({
        success: false,
        data: null,
        message: `Ruangan sudah dibooking oleh ${bentrok.peminjam} pada jam ${bentrok.jam_mulai}-${bentrok.jam_selesai} di tanggal tersebut`
      });
    }

    const [result] = await pool.query(
      `INSERT INTO booking_ruangan (ruangan_id, user_id, tanggal, jam_mulai, jam_selesai, keperluan)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ruanganId, userId, tanggal, jamMulai, jamSelesai, keperluan]
    );

    res.json({ success: true, data: { id: result.insertId }, message: 'Booking berhasil diajukan, menunggu approval' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// ===== APPROVE / TOLAK booking (admin only) =====
router.put('/booking/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Disetujui' atau 'Ditolak'
    const adminId = req.user.id;

    if (!['Disetujui', 'Ditolak'].includes(status)) {
      return res.status(400).json({ success: false, data: null, message: 'Status harus Disetujui atau Ditolak' });
    }

    const [existing] = await pool.query('SELECT id FROM booking_ruangan WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Booking tidak ditemukan' });
    }

    await pool.query(
      'UPDATE booking_ruangan SET status = ?, approved_by = ? WHERE id = ?',
      [status, adminId, id]
    );

    res.json({ success: true, data: { id }, message: `Booking berhasil di${status === 'Disetujui' ? 'setujui' : 'tolak'}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// ===== GET daftar booking milik user yang login =====
router.get('/booking/milik-saya', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT br.id, DATE_FORMAT(br.tanggal, '%Y-%m-%d') as tanggal, br.jam_mulai, br.jam_selesai, br.keperluan, br.status,
              r.nama_ruangan
       FROM booking_ruangan br
       JOIN ruangan r ON br.ruangan_id = r.id
       WHERE br.user_id = ?
       ORDER BY br.tanggal DESC, br.jam_mulai DESC`,
      [userId]
    );

    const data = rows.map(r => ({
      id: r.id,
      namaRuangan: r.nama_ruangan,
      tanggal: r.tanggal,
      jamMulai: r.jam_mulai,
      jamSelesai: r.jam_selesai,
      keperluan: r.keperluan,
      status: r.status
    }));

    res.json({ success: true, data, message: '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

module.exports = router;