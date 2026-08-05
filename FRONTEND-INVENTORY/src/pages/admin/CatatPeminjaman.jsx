import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar.jsx';

const API_BASE = 'http://192.168.1.88:5000/api';

function formatTanggal(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function mapPeminjaman(p) {
  const isLate = p.status === 'Dipinjam' && p.tanggal_rencana_kembali && new Date(p.tanggal_rencana_kembali) < new Date();

  let status, approval, statusDetail, type;
  switch (p.status) {
    case 'Menunggu Persetujuan':
      type = 'Pinjam'; status = 'Pinjam'; approval = 'Menunggu'; statusDetail = 'Menunggu Persetujuan'; break;
    case 'Dipinjam':
      type = 'Pinjam'; status = isLate ? 'Terlambat' : 'Pinjam'; approval = 'Disetujui'; statusDetail = 'Disetujui'; break;
    case 'Ditolak':
      type = 'Pinjam'; status = 'Ditolak'; approval = 'Ditolak'; statusDetail = 'Ditolak'; break;
    case 'Menunggu Verifikasi':
      type = 'Kembali'; status = 'Kembali'; approval = 'Menunggu'; statusDetail = 'Menunggu Verifikasi'; break;
    case 'Selesai':
      type = 'Kembali'; status = 'Kembali'; approval = 'Diterima'; statusDetail = 'Diterima baik'; break;
    default:
      type = 'Pinjam'; status = p.status; approval = '-'; statusDetail = p.status;
  }

  return {
    id: p.id,
    type,
    status,
    approval,
    statusDetail,
    barang: p.nama_barang,
    seri: p.serial_number || p.kode_barang || '-',
    peminjam: p.peminjam,
    unit: p.unit || '-',
    tglPinjam: formatTanggal(p.tanggal_pinjam),
    tglKembali: formatTanggal(p.tanggal_kembali_aktual || p.tanggal_rencana_kembali),
    kondisiAwal: p.kondisi_awal || '-',
    kondisiAkhir: p.kondisi_saat_kembali || '-',
    catatan: p.catatan_pengembalian || (approval === 'Menunggu' ? 'Permintaan ini menunggu persetujuan admin.' : ''),
    rawStatus: p.status
  };
}

export default function CatatPeminjaman() {
  const [activeTab, setActiveTab] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transaksiData, setTransaksiData] = useState([]);

  // State kontrol dropdown kustom visual
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const token = localStorage.getItem('token');

  const fetchData = () => {
    fetch(`${API_BASE}/peminjaman`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setTransaksiData(result.data.map(mapPeminjaman));
        }
      })
      .catch(err => console.error('Gagal ambil data peminjaman:', err));
  };

  useEffect(() => { fetchData(); }, []);

  const transactionStats = [
    { label: 'Dipinjam', count: transaksiData.filter(t => t.rawStatus === 'Dipinjam').length },
    { label: 'Menunggu Approval', count: transaksiData.filter(t => t.rawStatus === 'Menunggu Persetujuan').length },
    { label: 'Cek kembali', count: transaksiData.filter(t => t.rawStatus === 'Menunggu Verifikasi').length },
    { label: 'Terlambat', count: transaksiData.filter(t => t.status === 'Terlambat').length },
  ];

  const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'Menunggu Persetujuan', label: 'Menunggu Persetujuan' },
    { value: 'Disetujui', label: 'Disetujui' },
    { value: 'Ditolak', label: 'Ditolak' },
    { value: 'Menunggu Verifikasi', label: 'Menunggu Verifikasi' },
    { value: 'Diterima baik', label: 'Diterima baik' }
  ];

  const filtered = transaksiData.filter((t) => {
    const matchTab =
      activeTab === 'Semua' ||
      (activeTab === 'Peminjaman' && t.type === 'Pinjam') ||
      (activeTab === 'Pengembalian' && t.type === 'Kembali');
    const matchSearch = t.barang?.toLowerCase().includes(searchTerm.toLowerCase()) || t.peminjam?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || t.statusDetail === statusFilter;
    return matchTab && matchSearch && matchStatus;
  });

  const handleApprove = async (item) => {
    try {
      const res = await fetch(`${API_BASE}/peminjaman/${item.id}/persetujuan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ disetujui: true })
      });
      const result = await res.json();
      if (!result.success) alert(result.message);
      fetchData();
    } catch (err) { console.error(err); alert('Gagal terhubung ke server'); }
    setSelectedTransaction(null);
  };

  const handleReject = async (item) => {
    if (item.type === 'Kembali') {
      alert('Menolak pengembalian belum didukung sistem saat ini');
      setSelectedTransaction(null);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/peminjaman/${item.id}/persetujuan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ disetujui: false })
      });
      const result = await res.json();
      if (!result.success) alert(result.message);
      fetchData();
    } catch (err) { console.error(err); alert('Gagal terhubung ke server'); }
    setSelectedTransaction(null);
  };

  const handleVerifikasi = async (item) => {
    try {
      const res = await fetch(`${API_BASE}/peminjaman/${item.id}/verifikasi`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (!result.success) alert(result.message);
      fetchData();
    } catch (err) { console.error(err); alert('Gagal terhubung ke server'); }
    setSelectedTransaction(null);
  };

  return (
    <div className="flex min-h-screen w-full bg-[#005CA9] text-gray-800 font-sans overflow-x-hidden relative">
      <Sidebar />

      <div className="flex-1 pl-[360px] pr-8 py-10 flex flex-col gap-6 min-w-0">

        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-bold text-white tracking-wide">
              Transaksi Peminjaman dan Pengembalian
            </h1>
            <p className="text-sm text-blue-100/90 font-medium">
              Pantau semua barang yang sedang dipinjam maupun yang sudah dikembalikan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-12 my-6 w-full max-w-4xl text-white">
          {transactionStats.map((stat, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <span className="text-sm font-semibold tracking-wide">{stat.label}</span>
              <span className="text-3xl font-bold pl-2">{stat.count}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-8 border-b border-white/20 text-xs font-bold text-white tracking-wider uppercase">
          {['Semua', 'Peminjaman', 'Pengembalian'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 transition-all ${
                activeTab === tab
                  ? 'text-white border-b-2 border-white font-black'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-3 items-center w-full overflow-visible relative">
          <div className="relative flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Cari berdasarkan nama barang, merek, nomor seri, atau lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-[11px] pl-9 pr-4 py-2.5 border-none rounded-lg bg-white shadow-sm focus:outline-none placeholder-gray-400 text-gray-700 font-medium"
            />
            <span className="absolute left-3 top-3.5 text-gray-400 text-xs">🔍</span>
          </div>

          {/* PERBAIKAN DROPDOWN: Menghilangkan Scrollbar & Membebaskan Kapsul Agar Pas Menempel Sesuai Contoh Gambar */}
          <div className="relative overflow-visible z-50 w-56">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full text-[11px] px-4 py-2.5 bg-[#EAEAEA] border-none rounded-lg focus:outline-none font-bold text-gray-700 text-left flex justify-between items-center cursor-pointer select-none"
            >
              <span>
                {statusOptions.find(opt => opt.value === statusFilter)?.label || 'Semua Status'}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* PERBAIKAN: Menghilangkan max-h dan overflow-y agar scrollbar hilang total */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-[44px] bg-white border border-gray-100 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 overflow-hidden select-none">
                {statusOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-center px-4 py-2 text-xs font-bold text-white bg-[#005CA9] rounded-full cursor-pointer hover:bg-[#004B8A] transition-colors select-none"
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden p-1 w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F1F5F9] text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                  <th className="p-4 w-[12%] text-center">Status</th>
                  <th className="p-4 w-[32%]">Barang</th>
                  <th className="p-4 w-[14%]">Peminjam</th>
                  <th className="p-4 w-[14%]">Unit</th>
                  <th className="p-4 w-[14%]">Approval</th>
                  <th className="p-4 w-[14%] text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 text-center">
                      <span className="inline-block px-3 py-1 bg-[#E2E8F0] text-gray-600 rounded-full font-bold text-[10px] min-w-[55px]">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 flex flex-col justify-center">
                      <span className="text-gray-900 font-bold leading-tight">{item.barang}</span>
                      <span className="text-[10px] text-gray-400 font-normal mt-0.5 tracking-wide">{item.seri}</span>
                    </td>
                    <td className="p-4 text-gray-800 font-semibold">{item.peminjam}</td>
                    <td className="p-4 text-gray-500">{item.unit}</td>
                    <td className="p-4">
                      <span className="inline-block px-3 py-0.5 bg-[#E2E8F0] text-gray-700 rounded-md text-[10px] font-bold">
                        {item.approval}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {item.approval === 'Menunggu' ? (
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => setSelectedTransaction(item)}
                            className="w-7 h-7 bg-white hover:bg-green-50 rounded-lg border border-gray-300 flex items-center justify-center text-green-600 font-bold text-xs shadow-xs transition-colors"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setSelectedTransaction(item)}
                            className="w-7 h-7 bg-white hover:bg-red-50 rounded-lg border border-gray-300 flex items-center justify-center text-red-600 font-bold text-xs shadow-xs transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedTransaction(item)}
                          className="px-4 py-1.5 bg-[#E2E8F0] text-gray-700 text-[10px] font-bold rounded-lg hover:bg-gray-300 shadow-xs transition-colors"
                        >
                          Detail
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 font-medium text-xs bg-white">
                      Tidak ada data transaksi yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md flex flex-col gap-4">
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-0.5">
                Detail Transaksi {selectedTransaction.type === 'Pinjam' ? 'Peminjaman' : 'Pengembalian'}
              </span>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {selectedTransaction.barang}
              </h2>
              <div className="flex gap-1.5 mt-2">
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 font-bold text-[10px] rounded">
                  {selectedTransaction.status}
                </span>
                <span className="px-2.5 py-0.5 bg-orange-100 text-orange-700 font-bold text-[10px] rounded">
                  {selectedTransaction.statusDetail}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-semibold text-gray-800 border-t border-gray-100 pt-4">
              <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-normal">Peminjam</span><span>{selectedTransaction.peminjam}</span></div>
              <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-normal">Unit</span><span>{selectedTransaction.unit}</span></div>
              <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-normal">Tanggal pinjam</span><span>{selectedTransaction.tglPinjam}</span></div>
              <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-normal">Tanggal kembali</span><span>{selectedTransaction.tglKembali}</span></div>
              <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-normal">Kondisi awal</span><span>{selectedTransaction.kondisiAwal}</span></div>
              <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-normal">Kondisi saat kembali</span><span>{selectedTransaction.kondisiAkhir}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3 my-1">
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl h-24 flex items-center justify-center flex-col gap-1 cursor-pointer">
                <span className="text-lg">🖼️</span>
                <span className="text-[9px] text-gray-400">Foto saat dipinjam</span>
              </div>
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl h-24 flex items-center justify-center flex-col gap-1 cursor-pointer">
                <span className="text-lg">🖼️</span>
                <span className="text-[9px] text-gray-400">Foto saat dikembalikan</span>
              </div>
            </div>

            {selectedTransaction.catatan && (
              <div className={`p-3 rounded-xl text-[10px] font-medium leading-relaxed ${
                selectedTransaction.approval === 'Menunggu' ? 'bg-amber-50 text-amber-800 border border-amber-100' : 'bg-green-50 text-green-800 border border-green-100'
              }`}>
                {selectedTransaction.catatan}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 mt-2">
              <button onClick={() => setSelectedTransaction(null)} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl">Tutup</button>
              {selectedTransaction.approval === 'Menunggu' && (
                <>
                  <button onClick={() => handleReject(selectedTransaction)} className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl">Tolak</button>
                  <button
                    onClick={() => selectedTransaction.type === 'Pinjam' ? handleApprove(selectedTransaction) : handleVerifikasi(selectedTransaction)}
                    className="px-4 py-2 bg-[#005CA9] text-white text-xs font-bold rounded-xl"
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