// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');
const barangRoutes = require('./routes/barangRoutes');

const app = express();
app.use(cors());
app.use(express.json());

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Database connected');
    conn.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
}
testConnection();

// ===== AUTH ROUTES (tetap di server.js, belum kompleks) =====
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nama, email, password, role, divisi } = req.body;
    if (!nama || !email || !password) {
      return res.status(400).json({ success: false, data: null, message: 'Nama, email, password wajib diisi' });
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, data: null, message: 'Email sudah terdaftar' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (nama, email, password, role, divisi) VALUES (?, ?, ?, ?, ?)',
      [nama, email, hashedPassword, role || 'user', divisi || null]
    );
    res.json({ success: true, data: { id: result.insertId }, message: 'Registrasi berhasil' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, data: null, message: 'Email dan password wajib diisi' });
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, data: null, message: 'Email atau password salah' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, data: null, message: 'Email atau password salah' });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, nama: user.nama },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      success: true,
      data: { token, user: { id: user.id, nama: user.nama, email: user.email, role: user.role } },
      message: 'Login berhasil'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// ===== BARANG ROUTES (dari file terpisah) =====
app.use('/api/barang', barangRoutes);
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);
const ruanganRoutes = require('./routes/ruanganRoutes');
app.use('/api/ruangan', ruanganRoutes);
const peminjamanRoutes = require('./routes/peminjamanRoutes');
app.use('/api/peminjaman', peminjamanRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server jalan di http://localhost:${process.env.PORT || 5000}`);
});