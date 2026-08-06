import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('http://172.16.10.148:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      setLoading(false);

      if (response.ok && result.success) {
        // Simpan token JWT asli dan data user
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('userRole', result.data.user.role);
        localStorage.setItem('userData', JSON.stringify(result.data.user));

        // LANGSUNG PINDAH HALAMAN
        if (result.data.user.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/user/dashboard';
        }
      } else {
        setErrorMessage(result.message || 'Login gagal, periksa kembali email dan password.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Terjadi kesalahan koneksi:', error);
      setErrorMessage('Tidak dapat terhubung ke server backend.');
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

      {/* ================= SISI KANAN: Background & Card Login ================= */}
      <div
        className="w-full md:w-[55%] flex flex-col justify-between p-8 relative bg-cover bg-center bg-[#E5E9F0]"
        style={{ backgroundImage: "url('/images/Background.png')" }}
      >
        <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>

        {/* Barisan Logo Atas */}
        <div className="w-full flex justify-between items-center z-10 px-6 pt-2">
          <img src="/Logo Digantara.png" alt="Logo Digantara" className="h-16 w-auto object-contain" />
          <img src="/Logo Len.png" alt="Logo LEN" className="h-20 w-auto object-contain" />
        </div>

        {/* Card Form Login */}
        <div className="w-full flex justify-center items-center my-auto z-10">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[420px] border border-gray-100 overflow-hidden">
            <div className="p-8">

              {/* Judul Form */}
              <div className="text-center mb-6">
                <h2 className="text-[#1A1A1A] text-lg font-bold tracking-wider uppercase mb-1">
                  Sistem Inventaris PDC
                </h2>
                <p className="text-gray-500 text-xs font-medium tracking-wide">
                  Masuk untuk mengakses sistem
                </p>
              </div>

              {/* Pesan Error */}
              {errorMessage && (
                <div className="mb-4 p-2.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Form Input */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#00429b]"
                    placeholder="Alamat Email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kata Sandi</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#00429b]"
                    placeholder="Kata Sandi"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-[#00429b] focus:ring-[#00429b]" />
                    <span>Ingat saya</span>
                  </label>
                  <a href="#forgot" className="text-[#00429b] hover:underline">Lupa kata sandi?</a>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-[#00429b] text-white py-2.5 rounded-md font-semibold text-sm hover:bg-blue-800 transition-colors shadow-md ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Memproses...' : 'Masuk'}
                  </button>
                </div>

                <p className="text-center text-xs text-gray-600 pt-2">
                  Belum memiliki akun?{' '}
                  <Link to="/register" className="text-[#00429b] font-semibold hover:underline">
                    Buat akun baru
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

export default Login;