import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar.jsx';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const API_BASE = 'http://172.16.13.165:5000/api';
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

  const fetchData = () => {
    Promise.all([
      fetch(`${API_BASE}/ruangan`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch(`${API_BASE}/ruangan/booking/list`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
    ])
      .then(([ruanganResult, bookingResult]) => {
        if (ruanganResult.success) setRuanganList(ruanganResult.data);
        if (bookingResult.success) {
          const relevan = bookingResult.data.filter(b => b.status === 'Disetujui');
          setBookingList(relevan);
        }
      })
      .catch(err => console.error('Gagal ambil data ruangan/booking:', err));
  };

  useEffect(() => { fetchData(); }, []);

  const handleApproval = async (id, disetujui) => {
    try {
      const response = await fetch(`${API_BASE}/ruangan/booking/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: disetujui ? 'Disetujui' : 'Ditolak' })
      });
      const result = await response.json();
      if (result.success) {
        fetchData();
        setSelectedBooking(null);
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error('Gagal update status booking:', err);
      alert('Gagal terhubung ke server');
    }
  };

  const roomColorMap = {};
  ruanganList.forEach((r, i) => {
    roomColorMap[r.nama_ruangan] = COLOR_PALETTE[i % COLOR_PALETTE.length];
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
    const jamMulai = b.jam_mulai.slice(0, 5);
    const jamSelesai = b.jam_selesai.slice(0, 5);
    return slotStart >= jamMulai && slotStart < jamSelesai;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 w-full transition-all duration-300 ease-in-out md:ml-[320px] md:w-[calc(100%-320px)] bg-[#005CA9] px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 overflow-y-auto min-h-screen">
        <h2 className="text-center md:text-left text-lg sm:text-xl font-semibold text-white mb-4 md:mb-6">
          Filter Ruangan
        </h2>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
          {/* Legend Ruangan */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6 sm:gap-y-3 bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 mb-4 md:mb-6 text-xs text-gray-700">
            {ruanganList.map((r) => (
              <label key={r.id} className="flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap">
                <span className={`w-3 h-3 rounded-sm inline-block flex-shrink-0 ${roomColorMap[r.nama_ruangan]}`}></span>
                <span className="text-[10px] sm:text-xs">{r.nama_ruangan}</span>
              </label>
            ))}
          </div>

          {/* Navigasi & Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 md:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button type="button" onClick={handlePrev} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 cursor-pointer">
                <ChevronLeft size={20} />
              </button>

              {/* Dynamic Picker Berdasarkan View Mode dengan Trigger explicit showPicker */}
              {viewMode === 'bulan' && (
                <div 
                  className="relative flex items-center justify-center cursor-pointer"
                  onClick={(e) => {
                    const input = e.currentTarget.querySelector('input');
                    if (input && typeof input.showPicker === 'function') input.showPicker();
                  }}
                >
                  <span className="font-bold text-gray-800 text-sm sm:text-base min-w-[160px] text-center hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-200 transition-all select-none">
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
                  <span className="font-bold text-gray-800 text-sm sm:text-base min-w-[180px] text-center hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-200 transition-all select-none">
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
                  <span className="font-bold text-gray-800 text-sm sm:text-base min-w-[160px] text-center hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-200 transition-all select-none">
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

              <button type="button" onClick={handleNext} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 cursor-pointer">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Switcher Mode View */}
            <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setViewMode('bulan')}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${viewMode === 'bulan' ? 'bg-[#005CA9] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Bulan
              </button>
              <button
                onClick={() => setViewMode('minggu')}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${viewMode === 'minggu' ? 'bg-[#005CA9] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Minggu
              </button>
              <button
                onClick={() => setViewMode('hari')}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${viewMode === 'hari' ? 'bg-[#005CA9] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Hari
              </button>
            </div>
          </div>

          {/* VIEW: BULAN */}
          {viewMode === 'bulan' && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200 text-center text-[10px] sm:text-xs font-bold text-gray-600 py-2 sm:py-3">
                <div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div><div>Min</div>
              </div>
              <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-[1px]">
                {buildCalendarDays().map((item, index) => {
                  const events = item.dateStr ? bookingList.filter(b => b.tanggal === item.dateStr) : [];
                  return (
                    <div key={index} className={`bg-white min-h-[60px] sm:min-h-[75px] md:min-h-[95px] p-1 sm:p-2 flex flex-col justify-between ${!item.currentMonth ? 'opacity-30 bg-gray-50' : ''}`}>
                      <span className={`text-[10px] sm:text-xs font-semibold text-gray-700 ${!item.currentMonth ? 'opacity-50' : ''}`}>
                        {item.day}
                      </span>
                      <div className="space-y-0.5 sm:space-y-1">
                        {events.map((b, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedBooking(b)}
                            className={`${roomColorMap[b.nama_ruangan] || 'bg-gray-500'} text-white text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded truncate font-medium shadow-xs cursor-pointer hover:opacity-80 transition-opacity`}
                          >
                            {b.jam_mulai.slice(0, 5)} {b.nama_ruangan}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: MINGGU */}
          {viewMode === 'minggu' && (
            <div className="border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-2 border-r border-gray-200 w-24 text-gray-600">Semua hari</th>
                    {getWeekDays().map((d, idx) => (
                      <th key={idx} className="p-2 border-r border-gray-200 text-center text-gray-700 font-bold">
                        <div>{DAY_NAMES_ID[d.getDay()]}</div>
                        <div className="text-[10px] font-normal text-gray-500">{String(d.getDate()).padStart(2, '0')}/{String(d.getMonth() + 1).padStart(2, '0')}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((slot, sIdx) => (
                    <tr key={sIdx} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="p-1.5 border-r border-gray-200 text-center font-medium text-gray-500 text-[11px]">
                        {slot}
                      </td>
                      {getWeekDays().map((d, dIdx) => {
                        const dateStr = formatDateStr(d);
                        const matchedBookings = bookingList.filter(b => b.tanggal === dateStr && isBookingInSlot(b, slot));

                        return (
                          <td key={dIdx} className="p-1 border-r border-gray-200 relative h-9 vertical-top">
                            {matchedBookings.map((b, bIdx) => (
                              <div
                                key={bIdx}
                                onClick={() => setSelectedBooking(b)}
                                className={`${roomColorMap[b.nama_ruangan] || 'bg-gray-500'} text-white text-[10px] px-2 py-1 rounded-md font-medium cursor-pointer shadow-xs truncate hover:opacity-90 mb-0.5`}
                              >
                                {b.jam_mulai.slice(0, 5)} {b.nama_ruangan}
                              </div>
                            ))}
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
            <div className="border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full min-w-[500px] border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-2.5 border-r border-gray-200 w-32 text-gray-600">Semua hari</th>
                    <th className="p-2.5 text-center text-gray-700 font-bold">
                      {DAY_NAMES_ID[currentDate.getDay()]}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((slot, sIdx) => {
                    const dateStr = formatDateStr(currentDate);
                    const matchedBookings = bookingList.filter(b => b.tanggal === dateStr && isBookingInSlot(b, slot));

                    return (
                      <tr key={sIdx} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="p-2 border-r border-gray-200 text-center font-medium text-gray-500 text-[11px]">
                          {slot}
                        </td>
                        <td className="p-1.5 relative h-9">
                          {matchedBookings.map((b, bIdx) => (
                            <div
                              key={bIdx}
                              onClick={() => setSelectedBooking(b)}
                              className={`${roomColorMap[b.nama_ruangan] || 'bg-gray-500'} text-white text-[11px] px-3 py-1 rounded-full font-medium cursor-pointer shadow-xs truncate hover:opacity-90 mb-0.5 inline-block w-full`}
                            >
                              {b.jam_mulai.slice(0, 5)} {b.nama_ruangan}
                            </div>
                          ))}
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

      {/* Modal Detail & Approval Booking */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Detail Booking Ruangan</p>
                <h2 className="text-lg font-bold text-gray-900">{selectedBooking.nama_ruangan}</h2>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className="font-semibold text-gray-700">{selectedBooking.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Peminjam</span>
                <span className="font-semibold text-gray-700">{selectedBooking.peminjam}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Unit</span>
                <span className="font-semibold text-gray-700">{selectedBooking.divisi || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tanggal</span>
                <span className="font-semibold text-gray-700">
                  {new Date(selectedBooking.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}
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
                  <span className="font-semibold text-gray-700 text-right">{selectedBooking.keperluan}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
                Tutup
              </button>
              {selectedBooking.status === 'Menunggu' && (
                <>
                  <button onClick={() => handleApproval(selectedBooking.id, false)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
                    Tolak
                  </button>
                  <button onClick={() => handleApproval(selectedBooking.id, true)}
                    className="px-4 py-2 bg-[#005CA9] text-white text-xs font-bold rounded-xl hover:bg-[#004B8A] transition-colors shadow-xs cursor-pointer">
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