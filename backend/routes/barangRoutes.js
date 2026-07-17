// routes/barangRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const pool = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

const VALID_STATUS = ['-','Dibeli','Dikirim','Dipasang','Didaftarkan','Disimpan','Dipakai','Dipinjam','Dikembalikan','Diperbaiki','Rusak','Hilang','Dibuang','Dijual'];
const VALID_KONDISI = ['Rusak Ringan','Rusak Berat','Baru','Bekas','Siap Pakai','Full','Kosong','Belum Siap'];

function parseExcelDate(value) {
  if (!value) return null;
  
  // xlsx dengan opsi raw:false otomatis format ke M/D/YY (bulan/hari/tahun)
  if (typeof value === 'string' && value.includes('/')) {
    const parts = value.split('/');
    if (parts.length === 3) {
      let [month, day, year] = parts;
      if (year.length === 2) year = '20' + year;
      return `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
    }
  }
  
  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 86400000);
    return date.toISOString().split('T')[0];
  }
  
  return null;
}

function toCamel(row) {
  return {
    id: row.id,
    kodeBarang: row.kode_barang,
    namaBarang: row.nama_barang,
    quantity: row.quantity,
    partNumber: row.part_number,
    merk: row.merk,
    tipe: row.tipe,
    serialNumber: row.serial_number,
    nomorInventarisGa: row.nomor_inventaris_ga,
    programProject: row.program_project,
    status: row.status,
    kondisi: row.kondisi,
    lokasi: row.lokasi,
    catatan: row.catatan,
    fotoKelengkapan: row.foto_kelengkapan,
    fotoLabelInventaris: row.foto_label_inventaris
  };
}

// ===== GET semua barang =====
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM barang ORDER BY id DESC');
    res.json({ success: true, data: rows.map(toCamel), message: '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// ===== TAMBAH barang manual (admin only) =====
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { kodeBarang, namaBarang, quantity, partNumber, merk, tipe, serialNumber, nomorInventarisGa, programProject, status, kondisi, lokasi, catatan } = req.body;

    if (!namaBarang) {
      return res.status(400).json({ success: false, data: null, message: 'Nama barang wajib diisi' });
    }

    if (serialNumber) {
      const [existingSerial] = await pool.query('SELECT id FROM barang WHERE serial_number = ?', [serialNumber]);
      if (existingSerial.length > 0) {
        return res.status(400).json({ success: false, data: null, message: 'Serial Number sudah terdaftar' });
      }
    }
    if (partNumber) {
      const [existingPart] = await pool.query('SELECT id FROM barang WHERE part_number = ?', [partNumber]);
      if (existingPart.length > 0) {
        return res.status(400).json({ success: false, data: null, message: 'Part Number sudah terdaftar' });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO barang (kode_barang, nama_barang, quantity, part_number, merk, tipe, serial_number, nomor_inventaris_ga, program_project, status, kondisi, lokasi, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [kodeBarang, namaBarang, quantity || 1, partNumber, merk, tipe, serialNumber, nomorInventarisGa, programProject, status || 'Dibeli', kondisi, lokasi, catatan]
    );

    res.json({ success: true, data: { id: result.insertId }, message: 'Barang berhasil ditambahkan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// ===== EDIT barang (admin only) =====
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { kodeBarang, namaBarang, quantity, partNumber, merk, tipe, serialNumber, nomorInventarisGa, programProject, status, kondisi, lokasi, catatan } = req.body;

    const [existing] = await pool.query('SELECT id FROM barang WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Barang tidak ditemukan' });
    }

    if (serialNumber) {
      const [dupSerial] = await pool.query('SELECT id FROM barang WHERE serial_number = ? AND id != ?', [serialNumber, id]);
      if (dupSerial.length > 0) {
        return res.status(400).json({ success: false, data: null, message: 'Serial Number sudah terdaftar pada barang lain' });
      }
    }
    if (partNumber) {
      const [dupPart] = await pool.query('SELECT id FROM barang WHERE part_number = ? AND id != ?', [partNumber, id]);
      if (dupPart.length > 0) {
        return res.status(400).json({ success: false, data: null, message: 'Part Number sudah terdaftar pada barang lain' });
      }
    }

    await pool.query(
      `UPDATE barang SET kode_barang=?, nama_barang=?, quantity=?, part_number=?, merk=?, tipe=?, serial_number=?, nomor_inventaris_ga=?, program_project=?, status=?, kondisi=?, lokasi=?, catatan=?
       WHERE id=?`,
      [kodeBarang, namaBarang, quantity, partNumber, merk, tipe, serialNumber, nomorInventarisGa, programProject, status, kondisi, lokasi, catatan, id]
    );

    res.json({ success: true, data: { id }, message: 'Barang berhasil diupdate' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// ===== DELETE barang (admin only) - single =====
// ===== DELETE barang (admin only) - single =====
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;

    const [existing] = await conn.query('SELECT nama_barang FROM barang WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Barang tidak ditemukan' });
    }
    const namaBarang = existing[0].nama_barang;

    await conn.beginTransaction();

    // Catat dulu ke log bahwa barang ini dihapus, sebelum barangnya beneran dihapus
    await conn.query(
      `INSERT INTO log_transaksi (barang_id, nama_barang_snapshot, aktivitas, tanggal, remark)
       VALUES (?, ?, 'Dihapus', NOW(), 'Barang dihapus dari master barang')`,
      [id, namaBarang]
    );

    // Baru hapus barangnya (barang_id di log lama otomatis jadi NULL, snapshot tetap ada)
    await conn.query('DELETE FROM barang WHERE id = ?', [id]);

    await conn.commit();
    res.json({ success: true, data: null, message: 'Barang berhasil dihapus' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  } finally {
    conn.release();
  }
});

// ===== DELETE barang - bulk (admin only) =====
router.post('/delete-bulk', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { ids } = req.body; // array of id
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, data: null, message: 'ids wajib berupa array' });
    }
    await pool.query('DELETE FROM barang WHERE id IN (?)', [ids]);
    res.json({ success: true, data: null, message: `${ids.length} barang berhasil dihapus` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// ===== IMPORT - tahap PREVIEW (parsing + validasi, belum insert) =====
router.post('/import', verifyToken, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, data: null, message: 'File tidak ditemukan' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });

    // Ambil sheet "Tracking Inventaris DB" spesifik, bukan sheet pertama
    const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('db'));
    if (!sheetName) {
      return res.status(400).json({ success: false, data: null, message: 'Sheet "Tracking Inventaris DB" tidak ditemukan di file' });
    }

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });

    const validRows = [];
    const errorRows = [];

    rows.forEach((row, index) => {
      const errors = [];
      const namaBarang = row['Nama Barang'];
      const status = row['Transaksi']; // kolom "Transaksi" di Excel = "aktivitas" di log_transaksi

      if (!namaBarang) errors.push('Nama Barang kosong');
      if (status && !VALID_STATUS.includes(status)) errors.push(`Transaksi "${status}" tidak dikenali`);
      if (row['Kondisi'] && !VALID_KONDISI.includes(row['Kondisi'])) errors.push(`Kondisi "${row['Kondisi']}" tidak dikenali`);

      const parsed = {
        tanggal: parseExcelDate(row['Tanggal'] || row['Tanggal dan waktu']),
        aktivitas: status || '-',
        kodeBarang: row['Kode Barang'] || null,
        namaBarang: namaBarang,
        quantity: row['quantity'] || row['Quantity'] || 1,
        partNumber: row['Part Number'] || null,
        merk: row['Merk'] || null,
        tipe: row['Tipe'] || null,
        serialNumber: row['Serial Number'] || null,
        nomorInventarisGa: row['Nomor Inventaris GA'] || null,
        penanggungJawab: row['Penanggung Jawab'] || null,
        lokasi: row['Lokasi'] || null,
        programProject: row['Program/Project'] || null,
        kondisi: row['Kondisi'] || null,
        remark: row['Remark'] || null
      };

      if (errors.length > 0) {
        errorRows.push({ baris: index + 2, data: parsed, errors });
      } else {
        validRows.push(parsed);
      }
    });

    res.json({
      success: true,
      data: {
        sheetDipakai: sheetName,
        totalBaris: rows.length,
        validCount: validRows.length,
        errorCount: errorRows.length,
        validRows,
        errorRows
      },
      message: `${validRows.length} baris valid, ${errorRows.length} baris error`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Gagal memproses file' });
  }
});

// ===== IMPORT - tahap KONFIRMASI (insert ke barang + log_transaksi) =====
router.post('/import/confirm', verifyToken, requireAdmin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { rows } = req.body; // array hasil validRows dari /import

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, data: null, message: 'Tidak ada data untuk diimport' });
    }

    let barangBaruCount = 0;
    let logCount = 0;

    await conn.beginTransaction();

    for (const row of rows) {
      let barangId = null;

      // Kalau serial number ADA isinya, cek apakah barang sudah ada
      if (row.serialNumber) {
        const [existing] = await conn.query('SELECT id FROM barang WHERE serial_number = ?', [row.serialNumber]);
        if (existing.length > 0) {
          barangId = existing[0].id;
          // update data master barang dengan info terbaru dari baris ini
          await conn.query(
            `UPDATE barang SET status=?, kondisi=?, lokasi=?, program_project=? WHERE id=?`,
            [row.aktivitas, row.kondisi, row.lokasi, row.programProject, barangId]
          );
        }
      }

      // Kalau belum ketemu barang existing (serial kosong ATAU serial baru), bikin barang baru
      if (!barangId) {
        const [result] = await conn.query(
          `INSERT INTO barang (kode_barang, nama_barang, merk, tipe, serial_number, program_project, status, kondisi, lokasi)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [row.kodeBarang, row.namaBarang, row.merk, row.tipe, row.serialNumber, row.programProject, row.aktivitas || 'Dibeli', row.kondisi, row.lokasi]
        );
        barangId = result.insertId;
        barangBaruCount++;
      }

      // Selalu insert ke log_transaksi (histori)
      await conn.query(
        `INSERT INTO log_transaksi (barang_id, penanggung_jawab, aktivitas, lokasi, program_project, kondisi, tanggal, remark)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [barangId, row.penanggungJawab, row.aktivitas, row.lokasi, row.programProject, row.kondisi, row.tanggal || new Date(), row.remark]
      );
      logCount++;
    }

    await conn.commit();

    res.json({
      success: true,
      data: { barangBaruCount, logCount },
      message: `${barangBaruCount} barang baru dibuat, ${logCount} histori transaksi ditambahkan`
    });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Gagal import data: ' + err.message });
  } finally {
    conn.release();
  }
});

// ===== IMPORT LANGSUNG (upload file, langsung insert yang valid, skip yang error) =====
router.post('/import/direct', verifyToken, requireAdmin, upload.single('file'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, data: null, message: 'File tidak ditemukan' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('db'));
    if (!sheetName) {
      return res.status(400).json({ success: false, data: null, message: 'Sheet "Tracking Inventaris DB" tidak ditemukan di file' });
    }

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });

    const skipped = [];
    let barangBaruCount = 0;
    let barangUpdateCount = 0;
    let logCount = 0;

    await conn.beginTransaction();

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const namaBarang = row['Nama Barang'];
      const status = row['Transaksi'];

      const errors = [];
      if (!namaBarang) errors.push('Nama Barang kosong');
      if (status && !VALID_STATUS.includes(status)) errors.push(`Transaksi "${status}" tidak dikenali`);
      if (row['Kondisi'] && !VALID_KONDISI.includes(row['Kondisi'])) errors.push(`Kondisi "${row['Kondisi']}" tidak dikenali`);

      if (errors.length > 0) {
        skipped.push({ baris: index + 2, namaBarang: namaBarang || '(kosong)', errors });
        continue; // lewati baris ini, lanjut ke baris berikutnya
      }

      const parsed = {
        tanggal: parseExcelDate(row['Tanggal'] || row['Tanggal dan waktu']),
        aktivitas: status || '-',
        kodeBarang: row['Kode Barang'] || null,
        namaBarang: namaBarang,
        quantity: row['quantity'] || row['Quantity'] || 1,
        partNumber: row['Part Number'] || null,
        merk: row['Merk'] || null,
        tipe: row['Tipe'] || null,
        serialNumber: row['Serial Number'] || null,
        nomorInventarisGa: row['Nomor Inventaris GA'] || null,
        penanggungJawab: row['Penanggung Jawab'] || null,
        lokasi: row['Lokasi'] || null,
        programProject: row['Program/Project'] || null,
        kondisi: row['Kondisi'] || null,
        remark: row['Remark'] || null
      };

      let barangId = null;

      if (parsed.serialNumber) {
        const [existingSerial] = await conn.query('SELECT id FROM barang WHERE serial_number = ?', [parsed.serialNumber]);
        if (existingSerial.length > 0) {
          skipped.push({ baris: index + 2, namaBarang: parsed.namaBarang, errors: [`Serial Number "${parsed.serialNumber}" sudah terdaftar`] });
          continue;
        }
      }

      if (parsed.partNumber) {
        const [existingPart] = await conn.query('SELECT id FROM barang WHERE part_number = ?', [parsed.partNumber]);
        if (existingPart.length > 0) {
          skipped.push({ baris: index + 2, namaBarang: parsed.namaBarang, errors: [`Part Number "${parsed.partNumber}" sudah terdaftar`] });
          continue;
        }
      }

      const [result] = await conn.query(
        `INSERT INTO barang (kode_barang, nama_barang, quantity, merk, tipe, part_number, serial_number, nomor_inventaris_ga, program_project, status, kondisi, lokasi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [parsed.kodeBarang, parsed.namaBarang, parsed.quantity || 1, parsed.merk, parsed.tipe, parsed.partNumber, parsed.serialNumber, parsed.nomorInventarisGa, parsed.programProject, parsed.aktivitas, parsed.kondisi, parsed.lokasi]
      );
      barangId = result.insertId;
      barangBaruCount++;

      await conn.query(
        `INSERT INTO log_transaksi (barang_id, penanggung_jawab, aktivitas, lokasi, program_project, kondisi, tanggal, remark)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [barangId, parsed.penanggungJawab, parsed.aktivitas, parsed.lokasi, parsed.programProject, parsed.kondisi, parsed.tanggal || new Date(), parsed.remark]
      );
      logCount++;
    }

    await conn.commit();

    res.json({
      success: true,
      data: {
        totalBarisExcel: rows.length,
        barangBaruCount,
        barangUpdateCount,
        logCount,
        skippedCount: skipped.length,
        skipped
      },
      message: `${barangBaruCount} barang baru, ${barangUpdateCount} barang diupdate, ${logCount} histori ditambahkan, ${skipped.length} baris dilewati`
    });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Gagal import data: ' + err.message });
  } finally {
    conn.release();
  }
});

// ===== GET Riwayat (log_transaksi) dengan filter =====
router.get('/riwayat/list', verifyToken, async (req, res) => {
  try {
    const { search, tanggalMulai, tanggalSelesai, aktivitas, program } = req.query;

    let query = `
      SELECT 
        lt.id, lt.tanggal, lt.aktivitas, lt.penanggung_jawab, lt.lokasi, 
        lt.program_project, lt.kondisi, lt.remark, lt.nama_barang_snapshot,
        b.nama_barang as nama_barang_current
      FROM log_transaksi lt
      LEFT JOIN barang b ON lt.barang_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (b.nama_barang LIKE ? OR lt.nama_barang_snapshot LIKE ? OR lt.penanggung_jawab LIKE ? OR lt.program_project LIKE ?)`;
      const likeSearch = `%${search}%`;
      params.push(likeSearch, likeSearch, likeSearch, likeSearch);
    }
    if (tanggalMulai) {
      query += ` AND lt.tanggal >= ?`;
      params.push(tanggalMulai);
    }
    if (tanggalSelesai) {
      query += ` AND lt.tanggal <= ?`;
      params.push(tanggalSelesai);
    }
    if (aktivitas) {
      query += ` AND lt.aktivitas = ?`;
      params.push(aktivitas);
    }
    if (program) {
      query += ` AND lt.program_project = ?`;
      params.push(program);
    }

    query += ` ORDER BY lt.tanggal DESC, lt.id DESC`;

    const [rows] = await pool.query(query, params);

    const data = rows.map(row => ({
      id: row.id,
      waktu: row.tanggal,
      aktivitas: row.aktivitas,
      barang: row.nama_barang_current || row.nama_barang_snapshot || '(barang dihapus)',
      pengguna: row.penanggung_jawab,
      divisi: null, // belum bisa di-mapping otomatis, lihat catatan
      lokasi: row.lokasi,
      programProject: row.program_project,
      kondisi: row.kondisi,
      remark: row.remark
    }));

    res.json({ success: true, data, message: '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

const PDFDocument = require('pdfkit');

// ===== EXPORT barang (Excel/CSV/PDF) =====
router.post('/export', verifyToken, async (req, res) => {
  try {
    const { format, ids, columns } = req.body;
    // format: 'excel' | 'csv' | 'pdf'
    // ids: array of id (kosong/null = semua barang)
    // columns: array kolom yang mau disertakan, misal ['namaBarang','program','status',...]

    let query = 'SELECT * FROM barang';
    let params = [];
    if (ids && ids.length > 0) {
      query += ' WHERE id IN (?)';
      params.push(ids);
    }
    query += ' ORDER BY id';

    const [rows] = await pool.query(query, params);

    const columnMap = {
      namaBarang: { key: 'nama_barang', label: 'Nama Barang' },
      kodeBarang: { key: 'kode_barang', label: 'Kode Barang' },
      merk: { key: 'merk', label: 'Merk' },
      tipe: { key: 'tipe', label: 'Tipe' },
      serialNumber: { key: 'serial_number', label: 'No. Seri' },
      program: { key: 'program_project', label: 'Program' },
      status: { key: 'status', label: 'Status' },
      kondisi: { key: 'kondisi', label: 'Kondisi' },
      lokasi: { key: 'lokasi', label: 'Lokasi' },
      catatan: { key: 'catatan', label: 'Catatan' }
    };

    const selectedCols = (columns && columns.length > 0) ? columns : Object.keys(columnMap);
    const headers = selectedCols.map(c => columnMap[c]?.label || c);
    const dataRows = rows.map(row =>
      selectedCols.map(c => row[columnMap[c]?.key] ?? '')
    );

    if (format === 'excel') {
      const XLSX = require('xlsx');
      const wsData = [headers, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Master Barang');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', 'attachment; filename="master-barang.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buffer);

    } else if (format === 'csv') {
      const csvLines = [headers.join(',')];
      dataRows.forEach(row => {
        csvLines.push(row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
      });
      const csvContent = csvLines.join('\n');

      res.setHeader('Content-Disposition', 'attachment; filename="master-barang.csv"');
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csvContent);

    } else if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      res.setHeader('Content-Disposition', 'attachment; filename="master-barang.pdf"');
      res.setHeader('Content-Type', 'application/pdf');
      doc.pipe(res);

      doc.fontSize(14).text('Master Barang', { align: 'center' });
      doc.moveDown();

      const colWidth = (doc.page.width - 60) / headers.length;
      let y = doc.y;

      doc.fontSize(8).font('Helvetica-Bold');
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
      return res.status(400).json({ success: false, data: null, message: 'Format tidak dikenali (harus excel/csv/pdf)' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Gagal export data' });
  }
});

// ===== EXPORT riwayat (Excel/CSV/PDF) =====
router.post('/riwayat/export', verifyToken, async (req, res) => {
  try {
    const { format, search, tanggalMulai, tanggalSelesai, aktivitas, program } = req.body;

    let query = `
      SELECT 
        lt.tanggal, lt.aktivitas, lt.penanggung_jawab, lt.lokasi, 
        lt.program_project, lt.kondisi, lt.remark, lt.nama_barang_snapshot,
        b.nama_barang as nama_barang_current
      FROM log_transaksi lt
      LEFT JOIN barang b ON lt.barang_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (b.nama_barang LIKE ? OR lt.nama_barang_snapshot LIKE ? OR lt.penanggung_jawab LIKE ?)`;
      const likeSearch = `%${search}%`;
      params.push(likeSearch, likeSearch, likeSearch);
    }
    if (tanggalMulai) {
      query += ` AND lt.tanggal >= ?`;
      params.push(tanggalMulai);
    }
    if (tanggalSelesai) {
      query += ` AND lt.tanggal <= ?`;
      params.push(tanggalSelesai);
    }
    if (aktivitas) {
      query += ` AND lt.aktivitas = ?`;
      params.push(aktivitas);
    }
    if (program) {
      query += ` AND lt.program_project = ?`;
      params.push(program);
    }
    query += ` ORDER BY lt.tanggal DESC`;

    const [rows] = await pool.query(query, params);

    const headers = ['Waktu', 'Aktivitas', 'Barang', 'Pengguna', 'Lokasi', 'Program', 'Kondisi', 'Remark'];
    const dataRows = rows.map(r => [
      r.tanggal ? new Date(r.tanggal).toLocaleDateString('id-ID') : '',
      r.aktivitas || '',
      r.nama_barang_current || r.nama_barang_snapshot || '(barang dihapus)',
      r.penanggung_jawab || '',
      r.lokasi || '',
      r.program_project || '',
      r.kondisi || '',
      r.remark || ''
    ]);

    if (format === 'excel') {
      const XLSX = require('xlsx');
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
      res.setHeader('Content-Disposition', 'attachment; filename="riwayat.csv"');
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csvLines.join('\n'));

    } else if (format === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      res.setHeader('Content-Disposition', 'attachment; filename="riwayat.pdf"');
      res.setHeader('Content-Type', 'application/pdf');
      doc.pipe(res);

      doc.fontSize(14).text('Riwayat Transaksi', { align: 'center' });
      doc.moveDown();

      const colWidth = (doc.page.width - 60) / headers.length;
      let y = doc.y;

      doc.fontSize(8).font('Helvetica-Bold');
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
    res.status(500).json({ success: false, data: null, message: 'Gagal export riwayat' });
  }
});

router.delete('/reset/all', verifyToken, requireAdmin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM peminjaman');
    await conn.query('DELETE FROM log_transaksi');
    await conn.query('DELETE FROM barang');
    await conn.query('ALTER TABLE barang AUTO_INCREMENT = 1');
    await conn.query('ALTER TABLE log_transaksi AUTO_INCREMENT = 1');
    await conn.query('ALTER TABLE peminjaman AUTO_INCREMENT = 1');
    await conn.commit();
    res.json({ success: true, data: null, message: 'Semua data barang, histori, dan peminjaman berhasil dihapus' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Gagal reset data: ' + err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;