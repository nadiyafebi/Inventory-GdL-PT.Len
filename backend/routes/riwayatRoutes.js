// routes/riwayatRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const XLSX = require('xlsx');

// ===== Ambil & bangun data riwayat gabungan (dipakai GET / dan POST /export) =====
async function ambilRiwayat({ search, tanggalMulai, tanggalSelesai, aktivitas, jenis }) {
  const [pinjamRows] = await pool.query(
    `SELECT p.id, p.status, p.dibuat_pada, p.disetujui_pada, p.tanggal_pinjam, p.tanggal_rencana_kembali,
            p.tanggal_kembali_aktual, p.diverifikasi_pada, p.keperluan, p.kondisi_awal,
            p.kondisi_saat_kembali, p.foto_sebelum, p.foto_sesudah, p.catatan_pengembalian,
            b.nama_barang, b.merk, b.tipe, b.kode_barang, b.serial_number,
            u.nama AS peminjam, u.divisi
     FROM peminjaman p
     JOIN barang b ON p.barang_id = b.id
     JOIN users u ON p.user_id = u.id`
  );

  const [ruangRows] = await pool.query(
    `SELECT br.id, br.status, br.tanggal, br.jam_mulai, br.jam_selesai, br.keperluan, br.diajukan_pada,
            r.nama_ruangan,
            u.nama AS peminjam, u.divisi
     FROM booking_ruangan br
     JOIN ruangan r ON br.ruangan_id = r.id
     JOIN users u ON br.user_id = u.id`
  );

  let riwayat = [];

  pinjamRows.forEach(r => {
    const detailUnit = [r.merk, r.tipe, r.serial_number].filter(Boolean).join(' · ') || '-';

    if (r.dibuat_pada) {
      riwayat.push({
        id: `pinjam-ajukan-${r.id}`,
        waktu: r.dibuat_pada,
        aktivitas: 'Pengajuan Peminjaman',
        jenis: 'Barang',
        nama: r.nama_barang,
        detailUnit,
        kodeBarang: r.kode_barang,
        peminjam: r.peminjam,
        divisi: r.divisi,
        tanggalMulai: r.tanggal_pinjam,
        tanggalSelesai: r.tanggal_rencana_kembali,
        jamMulai: null,
        jamSelesai: null,
        foto: r.foto_sebelum,
        kondisi: r.kondisi_awal,
        catatan: r.keperluan
      });
    }

    if (r.disetujui_pada) {
      riwayat.push({
        id: `pinjam-approve-${r.id}`,
        waktu: r.disetujui_pada,
        aktivitas: r.status === 'Ditolak' ? 'Peminjaman Ditolak' : 'Peminjaman Disetujui',
        jenis: 'Barang',
        nama: r.nama_barang,
        detailUnit,
        kodeBarang: r.kode_barang,
        peminjam: r.peminjam,
        divisi: r.divisi,
        tanggalMulai: r.tanggal_pinjam,
        tanggalSelesai: r.tanggal_rencana_kembali,
        jamMulai: null,
        jamSelesai: null,
        foto: r.foto_sebelum,
        kondisi: r.kondisi_awal,
        catatan: r.keperluan
      });
    }

    if (r.tanggal_kembali_aktual) {
      riwayat.push({
        id: `kembali-ajukan-${r.id}`,
        waktu: r.tanggal_kembali_aktual,
        aktivitas: 'Pengajuan Pengembalian',
        jenis: 'Barang',
        nama: r.nama_barang,
        detailUnit,
        kodeBarang: r.kode_barang,
        peminjam: r.peminjam,
        divisi: r.divisi,
        tanggalMulai: r.tanggal_pinjam,
        tanggalSelesai: r.tanggal_kembali_aktual,
        jamMulai: null,
        jamSelesai: null,
        foto: r.foto_sesudah,
        kondisi: r.kondisi_saat_kembali,
        catatan: r.catatan_pengembalian
      });
    }

    if (r.diverifikasi_pada) {
      riwayat.push({
        id: `kembali-selesai-${r.id}`,
        waktu: r.diverifikasi_pada,
        aktivitas: 'Pengembalian Selesai',
        jenis: 'Barang',
        nama: r.nama_barang,
        detailUnit,
        kodeBarang: r.kode_barang,
        peminjam: r.peminjam,
        divisi: r.divisi,
        tanggalMulai: r.tanggal_pinjam,
        tanggalSelesai: r.tanggal_kembali_aktual,
        jamMulai: null,
        jamSelesai: null,
        foto: r.foto_sesudah,
        kondisi: r.kondisi_saat_kembali,
        catatan: r.catatan_pengembalian
      });
    }
  });

  ruangRows.forEach(r => {
    let aktivitasLabel = 'Pengajuan Booking Ruangan';
    if (r.status === 'Disetujui') aktivitasLabel = 'Booking Ruangan Disetujui';
    else if (r.status === 'Ditolak') aktivitasLabel = 'Booking Ruangan Ditolak';
    else if (r.status === 'Selesai') aktivitasLabel = 'Booking Ruangan Selesai';

    riwayat.push({
      id: `ruang-${r.id}`,
      waktu: r.diajukan_pada,
      aktivitas: aktivitasLabel,
      jenis: 'Ruangan',
      nama: r.nama_ruangan,
      detailUnit: '-',
      kodeBarang: null,
      peminjam: r.peminjam,
      divisi: r.divisi,
      tanggalMulai: r.tanggal,
      tanggalSelesai: r.tanggal,
      jamMulai: r.jam_mulai,
      jamSelesai: r.jam_selesai,
      foto: null,
      kondisi: null,
      catatan: r.keperluan
    });
  });

  if (jenis) {
    riwayat = riwayat.filter(x => x.jenis === jenis);
  }
  if (aktivitas) {
    riwayat = riwayat.filter(x => x.aktivitas === aktivitas);
  }
  if (search) {
    const s = search.toLowerCase();
    riwayat = riwayat.filter(x =>
      (x.nama || '').toLowerCase().includes(s) ||
      (x.peminjam || '').toLowerCase().includes(s) ||
      (x.aktivitas || '').toLowerCase().includes(s) ||
      (x.detailUnit || '').toLowerCase().includes(s)
    );
  }
  if (tanggalMulai) {
    const mulai = new Date(tanggalMulai);
    riwayat = riwayat.filter(x => new Date(x.waktu) >= mulai);
  }
  if (tanggalSelesai) {
    const selesai = new Date(tanggalSelesai);
    selesai.setHours(23, 59, 59, 999);
    riwayat = riwayat.filter(x => new Date(x.waktu) <= selesai);
  }

  riwayat.sort((a, b) => new Date(b.waktu) - new Date(a.waktu));

  return riwayat;
}

function formatRentang(item) {
  const fmt = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
  if (item.jenis === 'Ruangan') {
    const jam = (item.jamMulai && item.jamSelesai)
      ? `${String(item.jamMulai).slice(0, 5)} - ${String(item.jamSelesai).slice(0, 5)}`
      : '-';
    return `${fmt(item.tanggalMulai)}, ${jam}`;
  }
  return `${fmt(item.tanggalMulai)} -> ${item.tanggalSelesai ? fmt(item.tanggalSelesai) : '-'}`;
}

function formatWaktu(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

// ===== GET riwayat (gabungan histori peminjaman barang + booking ruangan) =====
router.get('/', verifyToken, async (req, res) => {
  try {
    const riwayat = await ambilRiwayat(req.query);
    res.json({ success: true, data: riwayat, message: '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// ===== EXPORT riwayat (Excel/CSV) =====
router.post('/export', verifyToken, async (req, res) => {
  try {
    const { format, columns, search, tanggalMulai, tanggalSelesai, aktivitas, jenis } = req.body;

    const riwayat = await ambilRiwayat({ search, tanggalMulai, tanggalSelesai, aktivitas, jenis });

    const columnMap = {
      waktu: { label: 'Waktu', get: (x) => formatWaktu(x.waktu) },
      aktivitas: { label: 'Aktivitas', get: (x) => x.aktivitas || '' },
      jenis: { label: 'Jenis', get: (x) => x.jenis || '' },
      nama: { label: 'Nama & Detail', get: (x) => [x.nama, x.detailUnit !== '-' ? x.detailUnit : null].filter(Boolean).join(' - ') },
      peminjam: { label: 'Peminjam', get: (x) => x.peminjam || '' },
      divisi: { label: 'Unit Kerja', get: (x) => x.divisi || '' },
      rentang_waktu: { label: 'Rentang Waktu', get: (x) => formatRentang(x) },
      foto: { label: 'Foto', get: (x) => x.foto || '' }
    };

    const selectedCols = (columns && columns.length > 0) ? columns : Object.keys(columnMap);
    const validCols = selectedCols.filter(c => columnMap[c]);
    const headers = validCols.map(c => columnMap[c].label);
    const dataRows = riwayat.map(item => validCols.map(c => columnMap[c].get(item)));

    if (format === 'excel') {
      const wsData = [headers, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Riwayat');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', 'attachment; filename="riwayat.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buffer);

    } else if (format === 'csv') {
      const csvLines = [headers.join(',')];
      dataRows.forEach(row => {
        csvLines.push(row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
      });
      const csvContent = csvLines.join('\n');

      res.setHeader('Content-Disposition', 'attachment; filename="riwayat.csv"');
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csvContent);

    } else {
      return res.status(400).json({ success: false, data: null, message: 'Format tidak dikenali (harus excel/csv)' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Gagal export riwayat: ' + err.message });
  }
});

module.exports = router;