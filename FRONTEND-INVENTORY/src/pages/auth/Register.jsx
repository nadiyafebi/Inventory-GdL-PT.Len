import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    konfirmasi: '',
    divisi: '',
  });

  const [notification, setNotification] = useState({ show: '', message: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (form.password !== form.konfirmasi) {
      setNotification({ show: 'error', message: 'Password dan konfirmasi password tidak sama' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://192.168.1.88:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: form.nama,
          email: form.email,
          password: form.password,
          unitKerja: form.divisi
        })
      });
      const result = await response.json();

      if (result.success) {
        setNotification({ show: 'success', message: 'Registrasi berhasil, mengalihkan ke halaman login...' });
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setNotification({ show: 'error', message: result.message || 'Registrasi gagal' });
      }
    } catch (err) {
      console.error('Register error:', err);
      setNotification({ show: 'error', message: 'Gagal terhubung ke server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden select-none">

      {/* ================= SISI KIRI: Panel Biru Identitas & Judul ================= */}
      <div className="hidden md:flex md:w-[45%] bg-[#00429b] items-center p-16 z-10 shadow-xl">
        <div className="max-w-md">
          <h1 className="text-white text-3xl font-extrabold tracking-wide uppercase leading-tight">
            Inventaris <br />
            Workshop Radar <br />
            & Electronic <br />
            Warfare
          </h1>
        </div>
      </div>

      {/* ================= SISI KANAN: Background & Card Register ================= */}
      <div
        className="w-full md:w-[55%] flex flex-col justify-between p-8 relative bg-cover bg-center bg-[#E5E9F0]"
        style={{ backgroundImage: "url('/images/Background.png')" }}
      >
        <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>

        {/* Barisan Logo Atas (Diperbesar Ukurannya) */}
        <div className="w-full flex justify-between items-center z-10 px-6 pt-2">
          <img src="/Logo Digantara.png" alt="Logo Digantara" className="h-16 w-auto object-contain" />
          <img src="/Logo Len.png" alt="Logo LEN" className="h-20 w-auto object-contain" />
        </div>

        {/* Card Form Register */}
        <div className="w-full flex justify-center items-center my-auto z-10">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[460px] border border-gray-100 max-h-[85vh] overflow-hidden">
            <div className="p-8 max-h-[85vh] overflow-y-auto">

              {/* Judul Form */}
              <div className="text-center mb-5">
                <h2 className="text-[#1A1A1A] text-lg font-bold tracking-wider uppercase mb-0.5">
                  Pendaftaran Pengguna Baru
                </h2>
                <p className="text-gray-500 text-xs font-semibold tracking-wide">
                  Isi data diri Anda untuk membuat akun.
                </p>
              </div>

              {/* Notifikasi Kustom */}
              {notification.show && (
                <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 text-xs font-medium ${
                  notification.show === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {notification.show === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{notification.message}</span>
                </div>
              )}

              {/* Form Input */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={form.nama}
                    onChange={handleChange('nama')}
                    className="w-full px-4 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-[#00429b]"
                    placeholder="Masukkan nama lengkap Anda"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    className="w-full px-4 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-[#00429b]"
                    placeholder="Email"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Kata Sandi</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={handleChange('password')}
                      className="w-full px-4 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-[#00429b]"
                      placeholder="********"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Konfirmasi Kata Sandi</label>
                    <input
                      type="password"
                      value={form.konfirmasi}
                      onChange={handleChange('konfirmasi')}
                      className="w-full px-4 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-[#00429b]"
                      placeholder="********"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Unit kerja</label>
                  <input
                    type="text"
                    value={form.divisi}
                    onChange={handleChange('divisi')}
                    className="w-full px-4 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-[#00429b]"
                    placeholder="Masukkan unit kerja Anda"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2 text-xs text-gray-600 pt-1">
                  <input type="checkbox" required className="rounded border-gray-300 text-[#00429b] focus:ring-[#00429b]" />
                  <span>Saya setuju dengan <a href="#terms" className="text-[#00429b] hover:underline">Syarat dan Ketentuan</a> penggunaan akun ini.</span>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-[#00429b] text-white py-2.5 rounded-md font-semibold text-xs hover:bg-blue-800 transition-colors shadow-md ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Memproses...' : 'Daftarkan Sekarang'}
                  </button>
                </div>

                <p className="text-center text-xs text-gray-600 pt-1">
                  Sudah memiliki akun?{' '}
                  <Link to="/login" className="text-red-600 font-semibold hover:underline">
                    Masuk di sini
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>

        <div className="h-6 invisible"></div>
      </div>
    </div>
  );
};

export default Register;