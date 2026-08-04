import React, { useState, useEffect } from 'react';
import SidebarUser from '../../components/common/SidebarUser';
import { ChevronDown, Check } from 'lucide-react';

const API_BASE = 'http://172.16.13.165:5000/api';

export default function CatatBookingRuangan() {
  const [formData, setFormData] = useState({
    ruanganId: '',
    ruangan: '',
    namaPeminjam: '',
    unit: 'PDC',
    tanggalPeminjaman: new Date().toISOString().split('T')[0],
    jamMulai: '08:00',
    jamSelesai: '12:00',
    keperluan: ''
  });

  const [showRuanganDropdown, setShowRuanganDropdown] = useState(false);
  const [ruanganOptions, setRuanganOptions] = useState([]);
  const [bookingList, setBookingList] = useState([]);
  
  // Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');

  const token = localStorage.getItem('token');

  const fetchBooking = () => {
    fetch(`${API_BASE}/ruangan/booking/list`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await res.json();
          if (result.success && Array.isArray(result.data)) {
            setBookingList(result.data);
          } else {
            setBookingList([]);
          }
        } else {
          setBookingList([]);
        }
      })
      .catch(err => {
        console.error('Gagal mengambil data booking:', err);
        setBookingList([]);
      });
  };

  useEffect(() => {
    fetchBooking();

    // Ambil daftar ruangan asli dari database
    fetch(`${API_BASE}/ruangan`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setRuanganOptions(result.data);
          if (result.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              ruanganId: result.data[0].id,
              ruangan: result.data[0].nama_ruangan
            }));
          }
        }
      })
      .catch(err => console.error('Gagal ambil daftar ruangan:', err));

    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setFormData(prev => ({
          ...prev,
          namaPeminjam: parsed.nama || '',
          unit: parsed.unit || 'PDC'
        }));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/ruangan/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ruanganId: formData.ruanganId,
          tanggal: formData.tanggalPeminjaman,
          jamMulai: formData.jamMulai,
          jamSelesai: formData.jamSelesai,
          keperluan: formData.keperluan
        })
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await res.json();
        if (result.success) {
          setShowSuccessModal(true);
          fetchBooking();
        } else {
          setConflictMessage(result.message || 'Ruangan sudah dibooking pada jam dan tanggal tersebut.');
          setShowConflictModal(true);
        }
      } else {
        setConflictMessage('Terjadi kesalahan di server. Periksa terminal backend.');
        setShowConflictModal(true);
      }
    } catch (err) {
      console.error(err);
      setConflictMessage('Gagal terhubung ke server backend.');
      setShowConflictModal(true);
    }
  };

  return (
    <div className="flex bg-white font-sans overflow-x-hidden min-h-screen select-none">

      {/* SIDEBAR USER */}
      <SidebarUser />

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full transition-all duration-300 ease-in-out md:ml-72 md:w-[calc(100%-288px)] bg-[#0053A0] p-6 sm:p-8 min-h-screen overflow-y-auto flex flex-col gap-6">

        {/* Header khusus mobile: Tombol menu di kiri, Judul persis di tengah */}
        <div className="flex items-center md:block">
          <div className="w-10 md:hidden"></div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-white text-xl sm:text-2xl font-bold tracking-wide">Catat Booking Ruangan</h1>
            <p className="text-blue-100 text-xs mt-1">Jadwalkan pemakaian ruangan & workshop di Gedung L</p>
          </div>
          <div className="w-10 md:hidden"></div>
        </div>

        {/* FORM CARD: Booking Ruangan */}
        <div className="bg-white rounded-2xl shadow-sm p-6 w-full">
          <form onSubmit={handleSubmitBooking} className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Kolom Kiri */}
              <div className="space-y-4">
                {/* Dropdown Ruangan */}
                <div className="relative">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ruangan</label>
                  <div
                    onClick={() => setShowRuanganDropdown(!showRuanganDropdown)}
                    className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium flex items-center justify-between cursor-pointer"
                  >
                    <span>{formData.ruangan || 'Pilih ruangan'}</span>
                    <ChevronDown size={14} className="text-gray-500" />
                  </div>

                  {showRuanganDropdown && (
                    <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 p-3 border border-gray-100 flex flex-col gap-2">
                      {ruanganOptions.length === 0 ? (
                        <div className="text-center text-xs text-gray-400 py-2">Memuat daftar ruangan...</div>
                      ) : (
                        ruanganOptions.map((ruang) => (
                          <button
                            key={ruang.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, ruanganId: ruang.id, ruangan: ruang.nama_ruangan });
                              setShowRuanganDropdown(false);
                            }}
                            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#0053A0] hover:bg-blue-800 transition cursor-pointer text-center shadow-sm"
                          >
                            {ruang.nama_ruangan}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Peminjam</label>
                  <input
                    type="text"
                    placeholder="Masukkan nama peminjam"
                    className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none"
                    value={formData.namaPeminjam}
                    onChange={(e) => setFormData({...formData, namaPeminjam: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Kolom Kanan */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Unit</label>
                    <input
                      type="text"
                      placeholder="Masukkan unit"
                      className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none"
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Jam Mulai</label>
                      <input
                        type="time"
                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none cursor-pointer"
                        value={formData.jamMulai}
                        onChange={(e) => setFormData({...formData, jamMulai: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Jam Selesai</label>
                      <input
                        type="time"
                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none cursor-pointer"
                        value={formData.jamSelesai}
                        onChange={(e) => setFormData({...formData, jamSelesai: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tanggal Peminjaman & Keperluan */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Peminjaman</label>
                <input
                  type="date"
                  className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none cursor-pointer"
                  value={formData.tanggalPeminjaman}
                  onChange={(e) => setFormData({...formData, tanggalPeminjaman: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Keperluan</label>
                <input
                  type="text"
                  placeholder="Contoh: Rapat Progress NVG"
                  className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none"
                  value={formData.keperluan}
                  onChange={(e) => setFormData({...formData, keperluan: e.target.value})}
                  required
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, keperluan: '' })}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-[#0053A0] hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Simpan Booking
              </button>
            </div>

          </form>
        </div>

        {/* SECTION: Tabel Daftar Booking */}
        <div className="space-y-4 pt-2">
          <div className="bg-white rounded-2xl shadow-sm p-5 w-full">
            <div className="flex justify-between items-center mb-4 px-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Daftar Ruangan Ter-booking</span>
              <span className="text-xs font-bold text-gray-700">{bookingList.length} Jadwal Aktif</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                    <th className="p-3">Ruangan</th>
                    <th className="p-3">Nama Peminjam</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Tanggal Peminjaman</th>
                    <th className="p-3">Jam Mulai</th>
                    <th className="p-3">Jam Selesai</th>
                    <th className="p-3">Keperluan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                  {bookingList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400 italic">Belum ada data booking ruangan</td>
                    </tr>
                  ) : (
                    bookingList.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3 font-bold text-gray-900">{item.ruangan || item.nama_ruangan || '-'}</td>
                        <td className="p-3 text-gray-600">{item.nama_peminjam || item.peminjam || '-'}</td>
                        <td className="p-3 text-gray-600">{item.unit || '-'}</td>
                        <td className="p-3 text-gray-600 whitespace-nowrap">{item.tanggal_peminjaman || item.tanggal || '-'}</td>
                        <td className="p-3 text-gray-600 whitespace-nowrap">{item.jam_mulai || '-'}</td>
                        <td className="p-3 text-gray-600 whitespace-nowrap">{item.jam_selesai || '-'}</td>
                        <td className="p-3 font-medium text-gray-800">{item.keperluan || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>

      {/* MODAL NOTIFIKASI SUKSES */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 w-[360px] shadow-2xl text-center flex flex-col items-center">

            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Check size={36} strokeWidth={3} />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">Booking Berhasil!</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Jadwal pemakaian ruangan berhasil disimpan ke dalam database.
            </p>

            <button
              type="button"
              onClick={() => { setShowSuccessModal(false); fetchBooking(); }}
              className="w-full py-3 bg-[#0053A0] hover:bg-blue-800 text-white text-xs font-bold rounded-2xl shadow-md transition cursor-pointer"
            >
              OK
            </button>

          </div>
        </div>
      )}

      {/* MODAL NOTIFIKASI JADWAL BENTROK */}
      {showConflictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center flex flex-col items-center">
            
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-5 shadow-inner">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-8 h-8" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2.5"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" 
                />
              </svg>
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 mb-2">
              Jadwal Bentrok!
            </h3>
            
            <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed max-w-xs">
              {conflictMessage}
            </p>

            <button
              type="button"
              onClick={() => setShowConflictModal(false)}
              className="w-full py-3.5 bg-[#005CA9] hover:bg-[#004B8A] text-white text-sm font-bold rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Mengerti
            </button>

          </div>
        </div>
      )}

    </div>
  );
}