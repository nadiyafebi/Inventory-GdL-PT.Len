import React, { useState, useEffect } from 'react';
import { Search, Download, Image as ImageIcon, X } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar.jsx';
import EksporRiwayatModal from '../../components/riwayat/EksporRiwayatModal.jsx';

const API_BASE = 'http://172.16.13.165:5000/api';
const FILE_BASE = 'http://172.16.13.165:5000';

const AKTIVITAS_OPTIONS = [
  'Pengajuan Peminjaman', 'Peminjaman Disetujui', 'Peminjaman Ditolak',
  'Pengajuan Pengembalian', 'Pengembalian Selesai',
  'Pengajuan Booking Ruangan', 'Booking Ruangan Disetujui', 'Booking Ruangan Ditolak', 'Booking Ruangan Selesai'
];

const JENIS_OPTIONS = ['Barang', 'Ruangan'];

export default function Riwayat() {
  const [dataRiwayat, setDataRiwayat] = useState([]);
  const [search, setSearch] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');

  const [aktivitasFilter, setAktivitasFilter] = useState('Semua aktivitas');
  const [showAktivitasDropdown, setShowAktivitasDropdown] = useState(false);

  const [jenisFilter, setJenisFilter] = useState('Semua jenis');
  const [showJenisDropdown, setShowJenisDropdown] = useState(false);

  const [showExportModal, setShowExportModal] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const token = localStorage.getItem('token');

  const fetchRiwayat = () => {
    fetch(`${API_BASE}/riwayat`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) setDataRiwayat(result.data);
      })
      .catch(err => console.error('Gagal ambil data riwayat:', err));
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  // Di dalam komponen Riwayat, update fungsi handleExportSubmit

  const handleExportSubmit = async ({ format, fields }) => {
    try {
      // Map field names
      const fieldMapping = {
        waktu: 'waktu',
        aktivitas: 'aktivitas',
        jenis: 'jenis',
        nama: 'nama',
        peminjam: 'peminjam',
        unitKerja: 'divisi',
        rentangWaktu: 'rentang_waktu',
        foto: 'foto'
      };

      const mappedFields = fields.map(f => fieldMapping[f] || f);

      // Ambil token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Session expired. Silakan login kembali.');
        return false;
      }

      // Siapkan data untuk dikirim
      const exportData = {
        format: format === 'xlsx' ? 'excel' : 'csv',
        columns: mappedFields,
        search: search || '',
        tanggalMulai: tanggalMulai || '',
        tanggalSelesai: tanggalSelesai || '',
        aktivitas: aktivitasFilter !== 'Semua aktivitas' ? aktivitasFilter : '',
        jenis: jenisFilter !== 'Semua jenis' ? jenisFilter : ''
      };

      console.log('Sending export data:', exportData);

      // Kirim request dengan timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const res = await fetch(`${API_BASE}/riwayat/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(exportData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errorMessage = 'Gagal mengekspor data riwayat';
        try {
          const errorData = await res.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If response is not JSON
          console.error('Error parsing error response:', e);
        }
        alert(errorMessage);
        return false;
      }

      // Cek apakah response adalah blob
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') && 
          !contentType.includes('text/csv')) {
        // Mungkin response adalah JSON error
        try {
          const errorData = await res.json();
          alert(errorData.message || 'Terjadi kesalahan');
          return false;
        } catch (e) {
          alert('Terjadi kesalahan saat mengekspor data');
          return false;
        }
      }

      const blob = await res.blob();
      
      // Validasi blob
      if (blob.size === 0) {
        alert('File yang diekspor kosong');
        return false;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileExtension = format === 'xlsx' ? 'xlsx' : 'csv';
      a.download = `riwayat-transaksi.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Export error:', error);
      
      if (error.name === 'AbortError') {
        alert('Request timeout. Silakan coba lagi.');
      } else if (error.message === 'Failed to fetch') {
        alert('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        alert('Terjadi kesalahan: ' + error.message);
      }
      return false;
    }
  };

  const formatWaktu = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const formatTanggal = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatRentang = (item) => {
    if (item.jenis === 'Ruangan') {
      const jam = (item.jamMulai && item.jamSelesai)
        ? `${item.jamMulai.slice(0, 5)} - ${item.jamSelesai.slice(0, 5)}`
        : '-';
      return `${formatTanggal(item.tanggalMulai)}, ${jam}`;
    }
    return `${formatTanggal(item.tanggalMulai)} → ${item.tanggalSelesai ? formatTanggal(item.tanggalSelesai) : '-'}`;
  };

  const filteredRiwayat = dataRiwayat.filter(item => {
    const matchSearch = (item.nama || '').toLowerCase().includes(search.toLowerCase()) ||
                        (item.peminjam || '').toLowerCase().includes(search.toLowerCase()) ||
                        (item.aktivitas || '').toLowerCase().includes(search.toLowerCase()) ||
                        (item.detailUnit || '').toLowerCase().includes(search.toLowerCase());
    const matchAktivitas = aktivitasFilter === 'Semua aktivitas' || item.aktivitas === aktivitasFilter;
    const matchJenis = jenisFilter === 'Semua jenis' || item.jenis === jenisFilter;

    const waktuItem = new Date(item.waktu);
    const matchTanggalMulai = !tanggalMulai || waktuItem >= new Date(tanggalMulai);
    const matchTanggalSelesai = !tanggalSelesai || waktuItem <= new Date(new Date(tanggalSelesai).setHours(23, 59, 59, 999));

    return matchSearch && matchAktivitas && matchJenis && matchTanggalMulai && matchTanggalSelesai;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#005CA9] text-gray-800 font-sans overflow-x-hidden">
      <Sidebar />

      <div className={`
        flex-1 w-full transition-all duration-300 ease-in-out
        md:ml-[288px] md:w-[calc(100%-320px)]
        px-4 sm:px-6 md:px-8 
        py-4 sm:py-6 md:py-8
        flex flex-col gap-4 md:gap-5
      `}>
        {/* Header: Judul di tengah mobile, kiri desktop. Export di kanan */}
        <div className="flex justify-between items-center relative">
          {/* Spacer kiri agar judul benar-benar center di mobile */}
          <div className="w-8 sm:w-0 md:hidden"></div>
          
          <h1 className="text-center md:text-left text-lg sm:text-xl font-bold text-white tracking-wide flex-1 md:flex-none">
            Riwayat
          </h1>
          
          <button 
            onClick={() => setShowExportModal(true)} 
            className="flex items-center gap-2 cursor-pointer shadow-sm shrink-0 transition-colors
              bg-white text-gray-700 hover:bg-gray-100
              px-3 sm:px-6 py-2.5 rounded-full text-xs font-medium
            "
          >
            <Download size={16} />
            <span className="hidden sm:inline">Ekspor</span>
          </button>
        </div>

        {/* Search - Full width */}
        <div className="relative w-full">
          <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama barang/ruangan, pengguna, aktivitas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-11 pr-4 py-3 border-none rounded-full bg-white shadow-sm focus:outline-none placeholder-gray-400 text-gray-700 font-medium"
          />
        </div>

        {/* Filter Baris 2 - Tanpa Export */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {/* Tanggal Mulai */}
          <div className="relative">
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="w-full text-[10px] sm:text-xs px-2 sm:px-3 py-3 border-none rounded-full bg-white shadow-sm focus:outline-none text-gray-700 font-medium cursor-pointer"
              placeholder="dd/mm/yyyy"
            />
          </div>

          {/* Tanggal Selesai */}
          <div className="relative">
            <input
              type="date"
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
              className="w-full text-[10px] sm:text-xs px-2 sm:px-3 py-3 border-none rounded-full bg-white shadow-sm focus:outline-none text-gray-700 font-medium cursor-pointer"
              placeholder="dd/mm/yyyy"
            />
          </div>

          {/* Aktivitas Filter */}
          <div className="relative">
            <button 
              onClick={() => { setShowAktivitasDropdown((v) => !v); setShowJenisDropdown(false); }} 
              className="w-full px-2 sm:px-3 py-3 rounded-full border-0 text-[10px] sm:text-xs font-medium bg-white text-gray-600 flex items-center justify-between shadow-sm hover:bg-gray-50 cursor-pointer"
            >
              <span className="truncate">{aktivitasFilter}</span>
              <span className="text-[8px] sm:text-[9px] text-gray-400 ml-1 flex-shrink-0">▼</span>
            </button>
            {showAktivitasDropdown && (
              <div className="absolute left-0 mt-2 w-56 sm:w-64 bg-white rounded-3xl shadow-2xl z-50 p-4 border border-gray-100 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                <button onClick={() => { setAktivitasFilter('Semua aktivitas'); setShowAktivitasDropdown(false); }} className="w-full py-2.5 rounded-full text-xs font-medium text-white bg-[#005CA9] hover:bg-[#004B8A] cursor-pointer">Semua aktivitas</button>
                {AKTIVITAS_OPTIONS.map((akt) => (
                  <button key={akt} onClick={() => { setAktivitasFilter(akt); setShowAktivitasDropdown(false); }} className="w-full py-2.5 rounded-full text-xs font-medium text-white bg-[#005CA9] hover:bg-[#004B8A] cursor-pointer">{akt}</button>
                ))}
              </div>
            )}
          </div>

          {/* Jenis Filter */}
          <div className="relative">
            <button 
              onClick={() => { setShowJenisDropdown((v) => !v); setShowAktivitasDropdown(false); }} 
              className="w-full px-2 sm:px-3 py-3 rounded-full border-0 text-[10px] sm:text-xs font-medium bg-white text-gray-600 flex items-center justify-between shadow-sm hover:bg-gray-50 cursor-pointer"
            >
              <span className="truncate">{jenisFilter}</span>
              <span className="text-[8px] sm:text-[9px] text-gray-400 ml-1 flex-shrink-0">▼</span>
            </button>
            {showJenisDropdown && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-3xl shadow-2xl z-50 p-4 border border-gray-100 flex flex-col gap-2">
                <button onClick={() => { setJenisFilter('Semua jenis'); setShowJenisDropdown(false); }} className="w-full py-2.5 rounded-full text-xs font-medium text-white bg-[#005CA9] hover:bg-[#004B8A] cursor-pointer">Semua jenis</button>
                {JENIS_OPTIONS.map((j) => (
                  <button key={j} onClick={() => { setJenisFilter(j); setShowJenisDropdown(false); }} className="w-full py-2.5 rounded-full text-xs font-medium text-white bg-[#005CA9] hover:bg-[#004B8A] cursor-pointer">{j}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-[#F1F5F9] text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                  <th className="p-3 sm:p-4">Waktu</th>
                  <th className="p-3 sm:p-4">Aktivitas</th>
                  <th className="p-3 sm:p-4 hidden sm:table-cell">Jenis</th>
                  <th className="p-3 sm:p-4">Nama & Detail</th>
                  <th className="p-3 sm:p-4 hidden md:table-cell">Peminjam</th>
                  <th className="p-3 sm:p-4 hidden lg:table-cell">Unit kerja</th>
                  <th className="p-3 sm:p-4 hidden md:table-cell">Rentang Waktu</th>
                  <th className="p-3 sm:p-4">Foto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                {filteredRiwayat.length > 0 ? (
                  filteredRiwayat.map((item) => (
                    <tr key={item.id} onClick={() => setDetailItem(item)} className="hover:bg-slate-50/60 transition-colors cursor-pointer">
                      <td className="p-3 sm:p-4 text-gray-600 text-[10px] sm:text-xs">{formatWaktu(item.waktu)}</td>
                      <td className="p-3 sm:p-4 font-bold text-gray-900 text-[10px] sm:text-xs">{item.aktivitas}</td>
                      <td className="p-3 sm:p-4 hidden sm:table-cell">
                        <span className={`px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-semibold ${item.jenis === 'Ruangan' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{item.jenis}</span>
                      </td>
                      <td className="p-3 sm:p-4 text-gray-700">
                        <div className="font-semibold text-gray-900 text-[10px] sm:text-xs">{item.nama}</div>
                        {item.detailUnit && item.detailUnit !== '-' && <div className="text-[9px] sm:text-[10px] text-gray-400">{item.detailUnit}</div>}
                      </td>
                      <td className="p-3 sm:p-4 text-gray-600 hidden md:table-cell text-[10px] sm:text-xs">{item.peminjam || '-'}</td>
                      <td className="p-3 sm:p-4 text-gray-500 hidden lg:table-cell text-[10px] sm:text-xs">{item.divisi || '-'}</td>
                      <td className="p-3 sm:p-4 text-gray-600 text-[10px] sm:text-[11px] hidden md:table-cell">{formatRentang(item)}</td>
                      <td className="p-3 sm:p-4">
                        {item.foto ? (
                          <img src={`${FILE_BASE}${item.foto}`} alt="foto" className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg object-cover border border-gray-200" />
                        ) : (
                          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                            <ImageIcon size={12} className="sm:size-14" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-400 font-medium">Tidak ada riwayat ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-white text-[10px] text-gray-400 font-medium border-t border-gray-50">
            Menampilkan 1-{filteredRiwayat.length} dari {dataRiwayat.length} Riwayat
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Detail Riwayat</p>
                <h2 className="text-lg font-bold text-gray-900">{detailItem.aktivitas}</h2>
              </div>
              <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-3 text-xs">
              <DetailRow label="Waktu" value={formatWaktu(detailItem.waktu)} />
              <DetailRow label="Jenis" value={detailItem.jenis} />
              <DetailRow label={detailItem.jenis === 'Ruangan' ? 'Nama Ruangan' : 'Nama Barang'} value={detailItem.nama} />
              {detailItem.detailUnit && detailItem.detailUnit !== '-' && <DetailRow label="Detail Unit" value={detailItem.detailUnit} />}
              {detailItem.kodeBarang && <DetailRow label="Kode Barang" value={detailItem.kodeBarang} />}
              <DetailRow label="Peminjam" value={detailItem.peminjam} />
              <DetailRow label="Divisi" value={detailItem.divisi} />
              <DetailRow label="Rentang Waktu" value={formatRentang(detailItem)} />
              {detailItem.kondisi && <DetailRow label="Kondisi" value={detailItem.kondisi} />}
              {detailItem.catatan && <DetailRow label="Catatan / Keperluan" value={detailItem.catatan} />}
              {detailItem.foto && (
                <div className="pt-2">
                  <span className="text-gray-400 font-medium block mb-2">Foto</span>
                  <img src={`${FILE_BASE}${detailItem.foto}`} alt="foto" className="w-full max-h-64 object-cover rounded-2xl border border-gray-200" />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button onClick={() => setDetailItem(null)} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors cursor-pointer text-xs">Tutup</button>
            </div>
          </div>
        </div>
      )}

      <EksporRiwayatModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} onExport={handleExportSubmit} />
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-start py-1.5 border-b border-gray-50 gap-4">
      <span className="text-gray-400 font-medium shrink-0">{label}</span>
      <span className="text-gray-800 font-semibold text-right">{value || '-'}</span>
    </div>
  );
}