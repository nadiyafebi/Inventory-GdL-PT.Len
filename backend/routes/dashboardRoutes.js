// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const VALID_STATUS = ['-','Dibeli','Dikirim','Dipasang','Didaftarkan','Disimpan','Dipakai','Dipinjam','Dikembalikan','Diperbaiki','Rusak','Hilang','Dibuang','Dijual'];

router.get('/', verifyToken, async (req, res) => {
  try {
    // Total barang
    const [[{ totalBarang }]] = await pool.query('SELECT COUNT(*) as totalBarang FROM barang');

    // Total user
    const [[{ totalUser }]] = await pool.query('SELECT COUNT(*) as totalUser FROM users');

    // Program aktif (jumlah program unik, exclude yang kosong/null)
    const [[{ programAktif }]] = await pool.query(
      `SELECT COUNT(DISTINCT program_project) as programAktif FROM barang WHERE program_project IS NOT NULL AND program_project != ''`
    );

    // Barang rusak (kondisi Rusak Ringan atau Rusak Berat)
    const [[{ barangRusak }]] = await pool.query(
      `SELECT COUNT(*) as barangRusak FROM barang WHERE kondisi IN ('Rusak Ringan','Rusak Berat')`
    );

    // Barang per program (termasuk yang belum diisi)
    const [perProgramRaw] = await pool.query(
    `SELECT COALESCE(NULLIF(program_project, ''), 'Belum Diisi') as program, COUNT(*) as jumlah 
    FROM barang 
    GROUP BY program 
    ORDER BY jumlah DESC`
    );
    const perProgram = perProgramRaw;

    // Barang per status (pastikan semua kategori muncul, termasuk yang belum diisi "-")
    const [statusRows] = await pool.query(
    `SELECT status, COUNT(*) as jumlah FROM barang GROUP BY status`
    );
    const statusMap = {};
    statusRows.forEach(row => { statusMap[row.status] = row.jumlah; });
    const perStatus = VALID_STATUS.map(status => ({
    status: status === '-' ? 'Belum Diisi' : status,
    jumlah: statusMap[status] || 0
    }));

    const [[{ approvalPinjam }]] = await pool.query(
      `SELECT COUNT(*) as approvalPinjam FROM peminjaman WHERE status = 'Menunggu Persetujuan'`
    );
    const [[{ approvalRuang }]] = await pool.query(
      `SELECT COUNT(*) as approvalRuang FROM booking_ruangan WHERE status = 'Menunggu'`
    );

    const [pinjamRows] = await pool.query(
      `SELECT p.id, b.nama_barang, u.nama as peminjam, u.divisi, p.tanggal_pinjam
      FROM peminjaman p
      JOIN barang b ON p.barang_id = b.id
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'Menunggu Persetujuan'
      ORDER BY p.dibuat_pada DESC`
    );
    const [ruangRows] = await pool.query(
      `SELECT br.id, r.nama_ruangan, u.nama as peminjam, u.divisi, br.tanggal
      FROM booking_ruangan br
      JOIN ruangan r ON br.ruangan_id = r.id
      JOIN users u ON br.user_id = u.id
      WHERE br.status = 'Menunggu'
      ORDER BY br.diajukan_pada DESC`
    );

    const menungguApproval = [
      ...pinjamRows.map(r => ({
        id: r.id,
        jenis: 'peminjaman',
        nama: r.nama_barang,
        peminjam: r.peminjam,
        divisi: r.divisi,
        tanggal: r.tanggal_pinjam
      })),
      ...ruangRows.map(r => ({
        id: r.id,
        jenis: 'booking',
        nama: r.nama_ruangan,
        peminjam: r.peminjam,
        divisi: r.divisi,
        tanggal: r.tanggal
      }))
    ];

    res.json({
      success: true,
      data: {
        totalBarang,
        totalUser,
        programAktif,
        approvalPinjam,
        approvalRuang,
        barangRusak,
        barangPerProgram: perProgram,
        barangPerStatus: perStatus,
        menungguApproval
      },
      message: ''
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

module.exports = router;