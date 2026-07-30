import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar.jsx';

const API_BASE = 'http://172.16.10.176:5000/api';

export default function CatatBookingRuangan() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);

  const [bookingData, setBookingData] = useState([]);
  const [ruanganList, setRuanganList] = useState([]);

  const token = localStorage.getItem('token');

  const fetchBooking = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);

    fetch(`${API_BASE}/ruangan/booking/list?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) setBookingData(result.data);
      })
      .catch(err => console.error('Gagal ambil booking:', err));
  };

  const fetchRuangan = () => {
    fetch(`${API_BASE}/ruangan`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) setRuanganList(result.data);
      })
      .catch(err => console.error('Gagal ambil ruangan:', err));
  };

  useEffect(() => {
    fetchBooking();
    fetchRuangan();
  }, [statusFilter]);

  // Auto-buka modal detail kalau datang dari Dashboard (klik centang item ruangan)
  useEffect(() => {
    const stored = sessionStorage.getItem('bukaDetailBooking');
    if (stored && bookingData.length > 0) {
      try {
        const parsed = JSON.parse(stored);
        const found = bookingData.find(b => b.id === parsed.id);
        if (found) {
          setSelectedBooking(found);
        }
        sessionStorage.removeItem('bukaDetailBooking');
      } catch (e) {
        console.error('Gagal parse bukaDetailBooking:', e);
      }
    }
  }, [bookingData]);

  const filteredBooking = bookingData.filter(item => {
    const matchSearch = item.nama_ruangan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRoom = !roomFilter || item.nama_ruangan === roomFilter;
    return matchSearch && matchRoom;
  });

  const today = new Date().toISOString().split('T')[0];
  const bookingStats = [
    { label: 'Menunggu', count: bookingData.filter(b => b.status === 'Menunggu').length },
    { label: 'Disetujui', count: bookingData.filter(b => b.status === 'Disetujui').length },
    { label: 'Hari Ini', count: bookingData.filter(b => b.tanggal === today).length },
    { label: 'Ditolak', count: bookingData.filter(b => b.status === 'Ditolak').length },
  ];

  const handleApproval = async (id, disetujui) => {
    try {
      const response = await fetch(`${API_BASE}/ruangan/booking/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: disetujui ? 'Disetujui' : 'Ditolak' })
      });
      const result = await response.json();
      if (result.success) {
        fetchBooking();
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error('Gagal update status booking:', err);
      alert('Gagal terhubung ke server');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#005CA9] text-gray-800 font-sans overflow-x-hidden">
      <Sidebar />

      <div className={`
        flex-1 w-full transition-all duration-300 ease-in-out
        md:ml-[320px] md:w-[calc(100%-320px)]
        px-4 sm:px-6 md:px-8 
        py-4 sm:py-6 md:py-8
        flex flex-col gap-4 md:gap-5
        min-h-screen
      `}>
        <div className="flex flex-col gap-1 w-full">
          <h1 className="text-center md:text-left text-lg sm:text-xl font-bold text-white tracking-wide">
            Kelola Booking Ruangan
          </h1>
          <p className="text-sm text-blue-100/90 font-medium text-center md:text-left hidden sm:block">
            Tinjau dan setujui jadwal pemakaian ruangan dan workshop di gedung L.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-white">
          {bookingStats.map((stat, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <span className="text-xs sm:text-sm font-semibold tracking-wide">{stat.label}</span>
              <span className="text-lg sm:text-xl font-bold">{stat.count}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full">
          <div className="relative flex-1 max-w-full sm:max-w-xl">
            <input
              type="text"
              placeholder="Cari nama ruangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-3 border-none rounded-lg bg-white shadow-sm focus:outline-none placeholder-gray-400 text-gray-700 font-medium"
            />
            <div className="absolute left-3.5 top-3 flex items-center justify-center pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.604 10.604Z" />
              </svg>
            </div>
          </div>

          <div className="relative w-full sm:w-auto">
            <button
              type="button"
              onClick={() => { setShowRoomDropdown(!showRoomDropdown); setShowStatusDropdown(false); }}
              className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-full border-0 text-xs font-medium bg-white text-gray-600 flex items-center justify-between shadow-sm hover:bg-gray-50 cursor-pointer min-w-[130px] sm:min-w-[150px]"
            >
              <span className="truncate">{roomFilter || 'Semua ruangan'}</span>
              <span className="text-[9px] text-gray-400 ml-2 flex-shrink-0">▼</span>
            </button>
            {showRoomDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl z-50 p-4 border border-gray-100 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => { setRoomFilter(''); setShowRoomDropdown(false); }}
                  className="w-full py-2.5 rounded-full text-xs font-medium text-white bg-[#005CA9] hover:bg-[#004B8A] cursor-pointer"
                >
                  Semua ruangan
                </button>
                {ruanganList.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { setRoomFilter(r.nama_ruangan); setShowRoomDropdown(false); }}
                    className="w-full py-2.5 rounded-full text-xs font-medium text-white bg-[#005CA9] hover:bg-[#004B8A] cursor-pointer"
                  >
                    {r.nama_ruangan}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-full sm:w-auto">
            <button
              type="button"
              onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowRoomDropdown(false); }}
              className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-full border-0 text-xs font-medium bg-white text-gray-600 flex items-center justify-between shadow-sm hover:bg-gray-50 cursor-pointer min-w-[130px] sm:min-w-[150px]"
            >
              <span className="truncate">{statusFilter || 'Semua status'}</span>
              <span className="text-[9px] text-gray-400 ml-2 flex-shrink-0">▼</span>
            </button>
            {showStatusDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl z-50 p-4 border border-gray-100 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => { setStatusFilter(''); setShowStatusDropdown(false); }}
                  className="w-full py-2.5 rounded-full text-xs font-medium text-white bg-[#005CA9] hover:bg-[#004B8A] cursor-pointer"
                >
                  Semua status
                </button>
                <button
                  type="button"
                  onClick={() => { setStatusFilter('Menunggu'); setShowStatusDropdown(false); }}
                  className="w-full py-2.5 rounded-full text-xs font-medium text-white bg-[#005CA9] hover:bg-[#004B8A] cursor-pointer"
                >
                  Menunggu
                </button>
                <button
                  type="button"
                  onClick={() => { setStatusFilter('Disetujui'); setShowStatusDropdown(false); }}
                  className="w-full py-2.5 rounded-full text-xs font-medium text-white bg-[#005CA9] hover:bg-[#004B8A] cursor-pointer"
                >
                  Disetujui
                </button>
                <button
                  type="button"
                  onClick={() => { setStatusFilter('Ditolak'); setShowStatusDropdown(false); }}
                  className="w-full py-2.5 rounded-full text-xs font-medium text-white bg-[#005CA9] hover:bg-[#004B8A] cursor-pointer"
                >
                  Ditolak
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-[#F1F5F9] text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                  <th className="p-3 sm:p-4">Ruangan</th>
                  <th className="p-3 sm:p-4 hidden sm:table-cell">Peminjam</th>
                  <th className="p-3 sm:p-4 hidden md:table-cell">Unit</th>
                  <th className="p-3 sm:p-4 hidden lg:table-cell">Tanggal</th>
                  <th className="p-3 sm:p-4">Jam</th>
                  <th className="p-3 sm:p-4 hidden xl:table-cell">Keperluan</th>
                  <th className="p-3 sm:p-4">Approval</th>
                  <th className="p-3 sm:p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                {filteredBooking.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 sm:p-4 text-gray-900 font-bold text-xs">{item.nama_ruangan}</td>
                    <td className="p-3 sm:p-4 text-gray-500 font-medium hidden sm:table-cell text-xs">{item.peminjam}</td>
                    <td className="p-3 sm:p-4 text-gray-500 hidden md:table-cell text-xs">{item.divisi || '-'}</td>
                    <td className="p-3 sm:p-4 text-gray-600 font-medium hidden lg:table-cell text-xs">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td className="p-3 sm:p-4 text-gray-600 font-medium text-xs">
                      {item.jam_mulai?.slice(0, 5)} - {item.jam_selesai?.slice(0, 5)}
                    </td>
                    <td className="p-3 sm:p-4 text-gray-600 max-w-[150px] truncate hidden xl:table-cell text-xs">{item.keperluan || '-'}</td>
                    <td className="p-3 sm:p-4">
                      <span className={`inline-block px-2 sm:px-3 py-0.5 rounded-md text-[10px] font-bold ${
                        item.status === 'Menunggu' ? 'bg-yellow-100 text-yellow-700' :
                        item.status === 'Disetujui' ? 'bg-green-100 text-green-700' :
                        item.status === 'Ditolak' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      {item.status === 'Menunggu' ? (
                        <div className="flex justify-center items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => setSelectedBooking(item)}
                            className="w-6 h-6 bg-white hover:bg-green-50 rounded border border-gray-300 flex items-center justify-center text-green-600 font-bold text-xs shadow-xs transition-colors"
                            title="Lihat detail & setujui"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleApproval(item.id, false)}
                            className="w-6 h-6 bg-white hover:bg-red-50 rounded border border-gray-300 flex items-center justify-center text-red-600 font-bold text-xs shadow-xs transition-colors"
                            title="Tolak"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedBooking(item)}
                          className="px-3 sm:px-4 py-1 bg-[#E2E8F0] text-gray-700 text-[10px] font-bold rounded-lg hover:bg-gray-300 shadow-xs transition-colors"
                        >
                          Detail
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredBooking.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400 font-medium text-xs bg-white">
                      Tidak ada data booking ruangan yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODAL DETAIL BOOKING (dipakai untuk lihat detail & approve/tolak) */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                  Detail Booking Ruangan
                </p>
                <h2 className="text-lg font-bold text-gray-900">{selectedBooking.nama_ruangan}</h2>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Peminjam</span>
                <span className="font-semibold text-gray-700">{selectedBooking.peminjam}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Unit</span>
                <span className="font-semibold text-gray-700">{selectedBooking.divisi || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tanggal pinjam</span>
                <span className="font-semibold text-gray-700">
                  {new Date(selectedBooking.tanggal).toLocaleDateString('id-ID', {
                    day: '2-digit', month: '2-digit', year: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Jam</span>
                <span className="font-semibold text-gray-700">
                  {selectedBooking.jam_mulai?.slice(0, 5)} - {selectedBooking.jam_selesai?.slice(0, 5)}
                </span>
              </div>
              {selectedBooking.keperluan && (
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400 flex-shrink-0">Keperluan</span>
                  <span className="font-semibold text-gray-700 text-right">
                    {selectedBooking.keperluan}
                  </span>
                </div>
              )}
              {selectedBooking.diajukan_pada && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Diajukan</span>
                  <span className="font-semibold text-gray-700">
                    {new Date(selectedBooking.diajukan_pada).toLocaleDateString('id-ID', {
                      day: '2-digit', month: '2-digit', year: '2-digit',
                    })}
                    ,{' '}
                    {new Date(selectedBooking.diajukan_pada).toLocaleTimeString('id-ID', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Tutup
              </button>
              {selectedBooking.status === 'Menunggu' && (
                <>
                  <button
                    onClick={() => {
                      handleApproval(selectedBooking.id, false);
                      setSelectedBooking(null);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => {
                      handleApproval(selectedBooking.id, true);
                      setSelectedBooking(null);
                    }}
                    className="px-4 py-2 bg-[#005CA9] text-white text-xs font-bold rounded-xl hover:bg-[#004B8A] transition-colors shadow-sm"
                  >
                    Setujui
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}