import React, { useState, useEffect } from 'react';
import SidebarUser from '../../components/common/SidebarUser';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const API_BASE = 'http://172.16.10.148:5000/api';
const COLOR_PALETTE = ['bg-blue-600', 'bg-red-600', 'bg-green-600', 'bg-amber-500', 'bg-purple-600', 'bg-pink-600', 'bg-teal-600'];

const TIME_SLOTS = [];
for (let hour = 8; hour < 17; hour++) {
  const h = String(hour).padStart(2, '0');
  TIME_SLOTS.push(`${h}:00-${h}:30`);
  TIME_SLOTS.push(`${h}:30-${String(hour + 1).padStart(2, '0')}:00`);
}

const DAY_NAMES_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTH_NAMES_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function FilterRuangan() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('bulan'); // 'bulan' | 'minggu' | 'hari'
  const [ruanganList, setRuanganList] = useState([]);
  const [bookingList, setBookingList] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const token = localStorage.getItem('token');

  // Mengambil data ruangan dan daftar booking langsung dari server backend
  const fetchData = () => {
    Promise.all([
      fetch(`${API_BASE}/ruangan`, { 
        headers: { Authorization: `Bearer ${token}` } 
      }).then(res => res.json()),
      
      fetch(`${API_BASE}/ruangan/booking/list`, { 
        headers: { Authorization: `Bearer ${token}` } 
      }).then(res => res.json())
    ])
      .then(([ruanganResult, bookingResult]) => {
        if (ruanganResult.success && Array.isArray(ruanganResult.data)) {
          setRuanganList(ruanganResult.data);
        }
        if (bookingResult.success && Array.isArray(bookingResult.data)) {
          // Menyaring data booking yang sudah disetujui (atau tampilkan semua sesuai kebutuhan backend)
          const relevan = bookingResult.data.filter(b => 
            !b.status || b.status.toLowerCase() === 'disetujui' || b.status === 'Approved'
          );
          setBookingList(relevan);
        }
      })
      .catch(err => console.error('Gagal mengambil data dari server:', err));
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // Pemetaan warna konsisten untuk tiap ruangan
  const roomColorMap = {};
  ruanganList.forEach((r, i) => {
    const roomName = r.nama_ruangan || r.nama;
    roomColorMap[roomName] = COLOR_PALETTE[i % COLOR_PALETTE.length];
  });

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'bulan') newDate.setMonth(newDate.getMonth() - 1);
    else if (viewMode === 'minggu') newDate.setDate(newDate.getDate() - 7);
    else if (viewMode === 'hari') newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'bulan') newDate.setMonth(newDate.getMonth() + 1);
    else if (viewMode === 'minggu') newDate.setDate(newDate.getDate() + 7);
    else if (viewMode === 'hari') newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const formatDateStr = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  const formatDateForInput = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  const getWeekDays = () => {
    const temp = new Date(currentDate);
    const day = temp.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(temp.setDate(temp.getDate() + diffToMonday));

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDays.push(d);
    }
    return weekDays;
  };

  const renderHeaderDateLabel = () => {
    if (viewMode === 'bulan') {
      return `${MONTH_NAMES_ID[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (viewMode === 'minggu') {
      const weekDays = getWeekDays();
      const start = weekDays[0];
      const end = weekDays[6];
      const startDay = String(start.getDate()).padStart(2, '0');
      const endDay = String(end.getDate()).padStart(2, '0');
      const monthStr = MONTH_NAMES_ID[end.getMonth()];
      return `${startDay} - ${endDay} ${monthStr} ${end.getFullYear()}`;
    } else {
      const day = String(currentDate.getDate()).padStart(2, '0');
      const monthStr = MONTH_NAMES_ID[currentDate.getMonth()];
      return `${day} ${monthStr} ${currentDate.getFullYear()}`;
    }
  };

  const buildCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let startWeekday = firstDayOfMonth.getDay();
    startWeekday = startWeekday === 0 ? 6 : startWeekday - 1;

    const daysArray = [];
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
      daysArray.push({ day: prevMonthLastDate - i, currentMonth: false, dateStr: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      daysArray.push({ day: d, currentMonth: true, dateStr });
    }
    const remaining = (7 - (daysArray.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      daysArray.push({ day: d, currentMonth: false, dateStr: null });
    }
    return daysArray;
  };

  const isBookingInSlot = (b, slot) => {
    const [slotStart] = slot.split('-');
    const jamMulai = (b.jam_mulai || '08:00').slice(0, 5);
    const jamSelesai = (b.jam_selesai || '12:00').slice(0, 5);
    return slotStart >= jamMulai && slotStart < jamSelesai;
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
            <h1 className="text-white text-xl sm:text-2xl font-bold tracking-wide">Filter Ruangan</h1>
            <p className="text-blue-100 text-xs mt-1">Lihat jadwal pemakaian ruangan & workshop di Gedung L secara real-time</p>
          </div>
          <div className="w-10 md:hidden"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 w-full">
          {/* Legend Ruangan */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 text-xs text-gray-700">
            {ruanganList.length === 0 ? (
              <span className="text-gray-400 italic text-xs">Memuat daftar ruangan dari server...</span>
            ) : (
              ruanganList.map((r) => {
                const rName = r.nama_ruangan || r.nama;
                return (
                  <label key={r.id} className="flex items-center space-x-2 whitespace-nowrap">
                    <span className={`w-3 h-3 rounded-sm inline-block flex-shrink-0 ${roomColorMap[rName] || 'bg-blue-600'}`}></span>
                    <span className="text-xs font-medium">{rName}</span>
                  </label>
                );
              })
            )}
          </div>

          {/* Navigasi & Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <button type="button" onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 cursor-pointer transition">
                <ChevronLeft size={18} />
              </button>

              {/* Dynamic Picker Berdasarkan View Mode */}
              {viewMode === 'bulan' && (
                <div 
                  className="relative flex items-center justify-center cursor-pointer"
                  onClick={(e) => {
                    const input = e.currentTarget.querySelector('input');
                    if (input && typeof input.showPicker === 'function') input.showPicker();
                  }}
                >
                  <span className="font-bold text-gray-800 text-sm min-w-[160px] text-center hover:bg-gray-100 px-3 py-2 rounded-xl border border-transparent hover:border-gray-200 transition-all select-none">
                    {renderHeaderDateLabel()}
                  </span>
                  <input
                    type="month"
                    value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [y, m] = e.target.value.split('-').map(Number);
                        setCurrentDate(new Date(y, m - 1, 1));
                      }
                    }}
                    className="absolute opacity-0 w-0 h-0 pointer-events-none"
                  />
                </div>
              )}

              {viewMode === 'minggu' && (
                <div 
                  className="relative flex items-center justify-center cursor-pointer"
                  onClick={(e) => {
                    const input = e.currentTarget.querySelector('input');
                    if (input && typeof input.showPicker === 'function') input.showPicker();
                  }}
                >
                  <span className="font-bold text-gray-800 text-sm min-w-[180px] text-center hover:bg-gray-100 px-3 py-2 rounded-xl border border-transparent hover:border-gray-200 transition-all select-none">
                    {renderHeaderDateLabel()}
                  </span>
                  <input
                    type="date"
                    value={formatDateForInput(currentDate)}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [y, m, d] = e.target.value.split('-').map(Number);
                        setCurrentDate(new Date(y, m - 1, d));
                      }
                    }}
                    className="absolute opacity-0 w-0 h-0 pointer-events-none"
                  />
                </div>
              )}

              {viewMode === 'hari' && (
                <div 
                  className="relative flex items-center justify-center cursor-pointer"
                  onClick={(e) => {
                    const input = e.currentTarget.querySelector('input');
                    if (input && typeof input.showPicker === 'function') input.showPicker();
                  }}
                >
                  <span className="font-bold text-gray-800 text-sm min-w-[160px] text-center hover:bg-gray-100 px-3 py-2 rounded-xl border border-transparent hover:border-gray-200 transition-all select-none">
                    {renderHeaderDateLabel()}
                  </span>
                  <input
                    type="date"
                    value={formatDateForInput(currentDate)}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [y, m, d] = e.target.value.split('-').map(Number);
                        setCurrentDate(new Date(y, m - 1, d));
                      }
                    }}
                    className="absolute opacity-0 w-0 h-0 pointer-events-none"
                  />
                </div>
              )}

              <button type="button" onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 cursor-pointer transition">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Switcher Mode View */}
            <div className="flex bg-gray-100 p-1.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('bulan')}
                className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${viewMode === 'bulan' ? 'bg-[#0053A0] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Bulan
              </button>
              <button
                type="button"
                onClick={() => setViewMode('minggu')}
                className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${viewMode === 'minggu' ? 'bg-[#0053A0] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Minggu
              </button>
              <button
                type="button"
                onClick={() => setViewMode('hari')}
                className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${viewMode === 'hari' ? 'bg-[#0053A0] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Hari
              </button>
            </div>
          </div>

          {/* VIEW: BULAN */}
          {viewMode === 'bulan' && (
            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100 text-center text-xs font-bold text-gray-500 py-3 uppercase tracking-wider">
                <div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div><div>Min</div>
              </div>
              <div className="grid grid-cols-7 auto-rows-fr bg-gray-100 gap-[1px]">
                {buildCalendarDays().map((item, index) => {
                  const events = item.dateStr ? bookingList.filter(b => (b.tanggal || b.tanggal_peminjaman) === item.dateStr) : [];
                  return (
                    <div key={index} className={`bg-white min-h-[90px] p-2 flex flex-col justify-between ${!item.currentMonth ? 'opacity-40 bg-gray-50' : ''}`}>
                      <span className={`text-xs font-bold text-gray-700 ${!item.currentMonth ? 'opacity-50' : ''}`}>
                        {item.day}
                      </span>
                      <div className="space-y-1">
                        {events.map((b, idx) => {
                          const rName = b.nama_ruangan || b.ruangan;
                          return (
                            <div
                              key={idx}
                              onClick={() => setSelectedBooking(b)}
                              className={`${roomColorMap[rName] || 'bg-gray-500'} text-white text-[10px] px-2 py-1 rounded-md truncate font-medium shadow-xs cursor-pointer hover:opacity-80 transition-opacity`}
                            >
                              {(b.jam_mulai || '').slice(0, 5)} {rName}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: MINGGU */}
          {viewMode === 'minggu' && (
            <div className="border border-gray-100 rounded-2xl overflow-x-auto shadow-sm">
              <table className="w-full min-w-[700px] border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-3 border-r border-gray-100 w-28 text-gray-400 font-bold uppercase tracking-wider text-[10px]">Jam / Hari</th>
                    {getWeekDays().map((d, idx) => (
                      <th key={idx} className="p-3 border-r border-gray-100 text-center text-gray-700 font-bold">
                        <div>{DAY_NAMES_ID[d.getDay()]}</div>
                        <div className="text-[10px] font-normal text-gray-400">{String(d.getDate()).padStart(2, '0')}/{String(d.getMonth() + 1).padStart(2, '0')}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {TIME_SLOTS.map((slot, sIdx) => (
                    <tr key={sIdx} className="hover:bg-gray-50/50">
                      <td className="p-2 border-r border-gray-100 text-center font-medium text-gray-400 text-[11px]">
                        {slot}
                      </td>
                      {getWeekDays().map((d, dIdx) => {
                        const dateStr = formatDateStr(d);
                        const matchedBookings = bookingList.filter(b => (b.tanggal || b.tanggal_peminjaman) === dateStr && isBookingInSlot(b, slot));

                        return (
                          <td key={dIdx} className="p-1.5 border-r border-gray-100 relative h-10 align-top">
                            {matchedBookings.map((b, bIdx) => {
                              const rName = b.nama_ruangan || b.ruangan;
                              return (
                                <div
                                  key={bIdx}
                                  onClick={() => setSelectedBooking(b)}
                                  className={`${roomColorMap[rName] || 'bg-gray-500'} text-white text-[11px] px-2.5 py-1 rounded-lg font-medium cursor-pointer shadow-xs truncate hover:opacity-90 mb-1`}
                                >
                                  {(b.jam_mulai || '').slice(0, 5)} {rName}
                                </div>
                              );
                            })}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW: HARI */}
          {viewMode === 'hari' && (
            <div className="border border-gray-100 rounded-2xl overflow-x-auto shadow-sm">
              <table className="w-full min-w-[500px] border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-3 border-r border-gray-100 w-32 text-gray-400 font-bold uppercase tracking-wider text-[10px]">Waktu</th>
                    <th className="p-3 text-center text-gray-800 font-bold">
                      {DAY_NAMES_ID[currentDate.getDay()]} ({String(currentDate.getDate()).padStart(2, '0')} {MONTH_NAMES_ID[currentDate.getMonth()]} {currentDate.getFullYear()})
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {TIME_SLOTS.map((slot, sIdx) => {
                    const dateStr = formatDateStr(currentDate);
                    const matchedBookings = bookingList.filter(b => (b.tanggal || b.tanggal_peminjaman) === dateStr && isBookingInSlot(b, slot));

                    return (
                      <tr key={sIdx} className="hover:bg-gray-50/50">
                        <td className="p-2.5 border-r border-gray-100 text-center font-medium text-gray-400 text-[11px]">
                          {slot}
                        </td>
                        <td className="p-2 relative h-10">
                          {matchedBookings.map((b, bIdx) => {
                            const rName = b.nama_ruangan || b.ruangan;
                            const pName = b.nama_peminjam || b.peminjam;
                            return (
                              <div
                                key={bIdx}
                                onClick={() => setSelectedBooking(b)}
                                className={`${roomColorMap[rName] || 'bg-gray-500'} text-white text-xs px-3 py-1.5 rounded-xl font-medium cursor-pointer shadow-xs truncate hover:opacity-90 mb-1 inline-block w-full`}
                              >
                                {(b.jam_mulai || '').slice(0, 5)} - {(b.jam_selesai || '').slice(0, 5)} | {rName} ({pName})
                              </div>
                            );
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>

      {/* Modal Detail Booking (User View Only) */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Detail Booking Ruangan</p>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">{selectedBooking.nama_ruangan || selectedBooking.ruangan}</h3>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedBooking(null)} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs bg-gray-50 p-4 rounded-2xl">
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Status</span>
                <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">{selectedBooking.status || 'Disetujui'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Peminjam</span>
                <span className="font-bold text-gray-800">{selectedBooking.nama_peminjam || selectedBooking.peminjam}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Unit</span>
                <span className="font-bold text-gray-800">{selectedBooking.unit || selectedBooking.divisi || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Tanggal</span>
                <span className="font-bold text-gray-800">
                  {new Date(selectedBooking.tanggal || selectedBooking.tanggal_peminjaman).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Jam</span>
                <span className="font-bold text-gray-800">
                  {(selectedBooking.jam_mulai || '').slice(0, 5)} - {(selectedBooking.jam_selesai || '').slice(0, 5)}
                </span>
              </div>
              {selectedBooking.keperluan && (
                <div className="flex flex-col gap-1 pt-1 border-t border-gray-200">
                  <span className="text-gray-400 font-medium">Agenda Rapat</span>
                  <span className="font-semibold text-gray-800 text-left leading-relaxed">{selectedBooking.keperluan}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button 
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="w-full py-3 bg-[#0053A0] hover:bg-blue-800 text-white text-xs font-bold rounded-2xl shadow-md transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}