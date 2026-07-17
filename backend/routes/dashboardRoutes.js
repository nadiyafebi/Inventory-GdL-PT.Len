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

    res.json({
      success: true,
      data: {
        totalBarang,
        totalUser,
        programAktif,
        approvalPinjam: 0,  // sementara, nunggu tabel peminjaman aktif dipakai
        approvalRuang: 0,   // sementara, nunggu tabel booking ruangan
        barangRusak,
        barangPerProgram: perProgram,
        barangPerStatus: perStatus,
        menungguApproval: [] // sementara kosong, nunggu fitur peminjaman
      },
      message: ''
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

module.exports = router;