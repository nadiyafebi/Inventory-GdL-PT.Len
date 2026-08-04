import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar.jsx';
import TransaksiTable from '../../components/peminjaman/TransaksiTable.jsx';
import DetailTransaksiModal from '../../components/peminjaman/DetailTransaksiModal.jsx';

const API_BASE = 'http://172.16.13.165:5000/api';

const STATUS_OPTIONS = [
  'Menunggu Approval', 'Dipinjam', 'Ditolak', 'Cek Kembali', 'Selesai', 'Terlambat'
];

function mapPeminjaman(p) {
  let tipe, status;
  const isLate = p.status === 'Dipinjam' && p.tanggal_rencana_kembali && new Date(p.tanggal_rencana_kembali) < new Date();

  switch (p.status) {
    case 'Menunggu Persetujuan':
      tipe = 'peminjaman'; status = 'Menunggu Approval'; break;
    case 'Dipinjam':
      tipe = 'peminjaman'; status = isLate ? 'Terlambat' : 'Dipinjam'; break;
    case 'Ditolak':
      tipe = 'peminjaman'; status = 'Ditolak'; break;
    case 'Menunggu Verifikasi':
      tipe = 'pengembalian'; status = 'Cek Kembali'; break;
    case 'Selesai':
      tipe = 'pengembalian'; status = 'Selesai'; break;
    default:
      tipe = 'peminjaman'; status = p.status;
  }

  return {
    id: p.id,
    tipe,
    status,
    approval: (status === 'Menunggu Approval' || status === 'Cek Kembali') ? 'Menunggu' : (status === 'Ditolak' ? 'Ditolak' : 'Disetujui'),
    barang: p.nama_barang,
    merk: p.merk,
    tipeBarang: p.tipe,
    kodeBarang: p.kode_barang,
    nomorInventarisGa: p.nomor_inventaris_ga,
    serialNumber: p.serial_number,
    partNumber: p.part_number,
    penanggungJawab: p.penanggung_jawab,
    lokasi: p.lokasi,
    programProject: p.program_project,
    peminjam: p.peminjam,
    unit: p.unit,
    tanggalPinjam: p.tanggal_pinjam,
    tanggalKembaliRencana: p.tanggal_rencana_kembali,
    tanggalKembaliAktual: p.tanggal_kembali_aktual,
    kondisiAwal: p.kondisi_awal,
    kondisiAkhir: p.kondisi_saat_kembali,
    diverifikasiOleh: p.diverifikasi_oleh ? 'Admin' : null,
    tanggalVerifikasi: p.diverifikasi_pada,
    catatan: p.catatan_pengembalian,
    fotoSebelum: p.foto_sebelum,
    fotoSesudah: p.foto_sesudah
  };
}

export default function CatatPeminjamanPengembalian() {
  const [rawData, setRawData] = useState([]);
  const [activeTab, setActiveTab] = useState('Semua');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);

  const token = localStorage.getItem('token');

  const fetchData = () => {
    fetch(`${API_BASE}/peminjaman`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          const mapped = result.data.map(mapPeminjaman);
          setRawData(mapped);

          const pendingDetail = sessionStorage.getItem('bukaDetailTransaksi');
          if (pendingDetail) {
            try {
              const itemData = JSON.parse(pendingDetail);
              const matched = mapped.find(t => t.id === itemData.id) || itemData;
              setSelectedTransaksi(matched);
            } catch (e) {
              console.error(e);
            }
            sessionStorage.removeItem('bukaDetailTransaksi');
          }
        }
      })
      .catch(err => console.error('Gagal ambil data peminjaman:', err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const data = rawData;
  const stats = [
    { label: 'Dipinjam', value: data.filter((t) => t.status === 'Dipinjam').length },
    { label: 'Menunggu Approval', value: data.filter((t) => t.status === 'Menunggu Approval').length },
    { label: 'Cek Kembali', value: data.filter((t) => t.status === 'Cek Kembali').length },
    { label: 'Terlambat', value: data.filter((t) => t.status === 'Terlambat').length },
  ];

  const filtered = data.filter((t) => {
    const matchTab = activeTab === 'Semua' || (activeTab === 'Peminjaman' && t.tipe === 'peminjaman') || (activeTab === 'Pengembalian' && t.tipe === 'pengembalian');
    const matchSearch = t.barang?.toLowerCase().includes(search.toLowerCase()) || t.peminjam?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Semua Status' || t.status === statusFilter;
    return matchTab && matchSearch && matchStatus;
  });

  const handleApprove = async (trx) => {
    try {
      const res = await fetch(`${API_BASE}/peminjaman/${trx.id}/persetujuan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ disetujui: true })
      });
      const result = await res.json();
      if (!result.success) alert(result.message);
      fetchData();
    } catch (err) { console.error(err); alert('Gagal terhubung ke server'); }
    setSelectedTransaksi(null);
  };

  const handleReject = async (trx) => {
    if (trx.tipe === 'pengembalian') { alert('Menolak pengembalian belum didukung sistem saat ini'); return; }
    try {
      const res = await fetch(`${API_BASE}/peminjaman/${trx.id}/persetujuan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ disetujui: false })
      });
      const result = await res.json();
      if (!result.success) alert(result.message);
      fetchData();
    } catch (err) { console.error(err); alert('Gagal terhubung ke server'); }
    setSelectedTransaksi(null);
  };

  const handleVerifikasi = async (trx) => {
    try {
      const res = await fetch(`${API_BASE}/peminjaman/${trx.id}/verifikasi`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (!result.success) alert(result.message);
      fetchData();
    } catch (err) { console.error(err); alert('Gagal terhubung ke server'); }
    setSelectedTransaksi(null);
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
      `}>
        {/* Judul - Center di mobile, left di desktop */}
        <div className="flex flex-col gap-1">
          <h1 className="text-center md:text-left text-lg sm:text-xl font-bold text-white tracking-wide">
            Transaksi Peminjaman dan Pengembalian
          </h1>
          <p className="text-sm text-blue-100/90 font-medium hidden md:block text-center md:text-left">
            Pantau semua barang yang sedang dipinjam maupun yang sudah dikembalikan
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-white">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="text-xs sm:text-sm font-semibold tracking-wide">{s.label}</span>
              <span className="text-lg sm:text-xl font-bold">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-3 sm:gap-6 border-b border-white/20 text-xs font-bold text-white tracking-wider uppercase overflow-x-auto">
          {['Semua', 'Peminjaman', 'Pengembalian'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 transition-all whitespace-nowrap ${activeTab === tab ? 'text-white border-b-2 border-white font-black' : 'text-blue-200 hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full">
          <div className="relative flex-1 max-w-full sm:max-w-xl">
            <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama barang atau peminjam..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-11 pr-4 py-3 border-none rounded-lg bg-white shadow-sm focus:outline-none placeholder-gray-400 text-gray-700 font-medium"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <button onClick={() => setShowStatusDropdown((v) => !v)} className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-full border-0 text-xs font-medium bg-white text-gray-600 flex items-center justify-between shadow-sm hover:bg-gray-50 cursor-pointer min-w-[140px] sm:min-w-[160px]">
              <span className="truncate">{statusFilter}</span>
              <span className="text-[9px] text-gray-400 ml-2">▼</span>
            </button>
            {showStatusDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl z-50 p-4 border border-gray-100 flex flex-col gap-2 max-h-[400px] overflow-y-auto">
                <button type="button" onClick={() => { setStatusFilter('Semua Status'); setShowStatusDropdown(false); }} className="w-full py-2.5 rounded-full text-xs font-medium text-white bg-[#005CA9] hover:bg-[#004B8A] cursor-pointer">Semua Status</button>
                {STATUS_OPTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => { setStatusFilter(s); setShowStatusDropdown(false); }} className="w-full py-2.5 rounded-full text-xs font-medium text-white bg-[#005CA9] hover:bg-[#004B8A] cursor-pointer">{s}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full">
          <div className="overflow-x-auto">
            <TransaksiTable 
              data={filtered} 
              onDetail={(row) => setSelectedTransaksi(row)} 
              onApprove={(row) => setSelectedTransaksi(row)} 
              onReject={handleReject} 
            />
          </div>
          <div className="p-4 bg-white text-[10px] text-gray-400 font-medium border-t border-gray-50">
            Menampilkan 1-{filtered.length} dari {data.length} Transaksi
          </div>
        </div>
      </div>

      <DetailTransaksiModal 
        isOpen={!!selectedTransaksi} 
        transaksi={selectedTransaksi} 
        onClose={() => setSelectedTransaksi(null)} 
        onApprove={handleApprove} 
        onReject={handleReject} 
        onVerifikasi={handleVerifikasi} 
      />
    </div>
  );
}