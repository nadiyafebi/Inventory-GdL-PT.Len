import React, { useState, useEffect } from 'react';
import SidebarUser from '../../components/common/SidebarUser';
import { Camera, Check, ChevronDown, ArrowLeft, Search } from 'lucide-react';

const API_BASE = 'http://172.16.13.165:5000/api';

export default function CatatPeminjamanPengembalianUser() {
  const token = localStorage.getItem('token');

  // ===== Data barang untuk dropdown =====
  const [barangList, setBarangList] = useState([]);
  const [showBarangDropdown, setShowBarangDropdown] = useState(false);
  const [cariBarang, setCariBarang] = useState('');

  const [formData, setFormData] = useState({
    tanggalPeminjaman: new Date().toISOString().split('T')[0],
    tanggalPengembalian: '',
    barangId: '',
    namaBarang: '',
    penanggungJawab: '',
    merk: '',
    lokasi: '',
    tipe: '',
    programProject: '',
    kodeBarang: '',
    noInventarisGa: '',
    kondisiAwal: '',
    serialNumber: '',
    namaPeminjam: '',
    partNumber: '',
    unit: '',
    keperluan: '',
    fotoSebelum: null
  });

  const [barangDipinjamList, setBarangDipinjamList] = useState([]);
  
  // Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReturnSuccessModal, setShowReturnSuccessModal] = useState(false);

  const [isReturnMode, setIsReturnMode] = useState(false);
  const [returnItemData, setReturnItemData] = useState(null);
  const [showReturnKondisiDropdown, setShowReturnKondisiDropdown] = useState(false);
  const [showStatusBrgDropdown, setShowStatusBrgDropdown] = useState(false);

  const [formReturnData, setFormReturnData] = useState({
    tanggalKembaliAktual: new Date().toISOString().split('T')[0],
    diterimaOleh: 'Admin Gedung L',
    namaPengembali: '',
    unit: 'HC',
    statusBarang: 'Dikembalikan',
    kondisiSaatKembali: 'Baik',
    catatanPengembalian: '',
    fotoSesudah: null
  });

  const KONDISI_OPTIONS = ['Baru', 'Baik', 'Rusak Ringan', 'Rusak Berat', 'Siap Pakai'];
  const STATUS_BARANG_OPTIONS = [
    'Dibeli', 'Dikirim', 'Dipasang', 'Didaftarkan', 'Disimpan', 
    'Dipakai', 'Dipinjam', 'Dikembalikan', 'Diperbaiki', 'Rusak', 
    'Hilang', 'Dibuang', 'Dijual', 'Dibersihkan'
  ];

  // ===== Fetch daftar barang (untuk dropdown Nama Barang) =====
  const fetchBarang = () => {
    fetch(`${API_BASE}/barang`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await res.json();
          if (result.success && Array.isArray(result.data)) {
            const tersedia = result.data.filter(b => b.status !== 'Dipinjam');
            setBarangList(tersedia);
          } else {
            setBarangList([]);
          }
        } else {
          setBarangList([]);
        }
      })
      .catch(err => {
        console.error('Gagal mengambil data barang:', err);
        setBarangList([]);
      });
  };

  // ===== Fetch daftar peminjaman aktif milik user =====
  const fetchPeminjaman = () => {
    fetch(`${API_BASE}/peminjaman/milik-saya`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await res.json();
          if (result.success && Array.isArray(result.data)) {
            setBarangDipinjamList(result.data);
          } else {
            setBarangDipinjamList([]);
          }
        } else {
          console.error('Server merespons bukan dalam format JSON');
          setBarangDipinjamList([]);
        }
      })
      .catch(err => {
        console.error('Gagal mengambil data peminjaman:', err);
        setBarangDipinjamList([]);
      });
  };

  useEffect(() => {
    fetchBarang();
    fetchPeminjaman();
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

  const barangTersaring = barangList.filter(b =>
    (b.namaBarang || b.nama_barang || '').toLowerCase().includes(cariBarang.toLowerCase()) ||
    (b.kodeBarang || b.kode_barang || '').toLowerCase().includes(cariBarang.toLowerCase()) ||
    (b.serialNumber || b.serial_number || '').toLowerCase().includes(cariBarang.toLowerCase())
  );

  const handlePilihBarang = (b) => {
    setFormData(prev => ({
      ...prev,
      barangId: b.id,
      namaBarang: b.namaBarang || b.nama_barang || '',
      merk: b.merk || '',
      tipe: b.tipe || '',
      kodeBarang: b.kodeBarang || b.kode_barang || '',
      noInventarisGa: b.nomorInventarisGa || b.nomor_inventaris_ga || b.noInventarisGa || '',
      serialNumber: b.serialNumber || b.serial_number || '',
      partNumber: b.partNumber || b.part_number || '',
      penanggungJawab: b.penanggungJawab || b.penanggung_jawab || '',
      lokasi: b.lokasi || '',
      programProject: b.programProject || b.program_project || '',
      kondisiAwal: b.kondisi || b.kondisi_barang || ''
    }));
    setShowBarangDropdown(false);
    setCariBarang('');
  };

  const handleSubmitPeminjaman = async (e) => {
    e.preventDefault();

    if (!formData.barangId) {
      alert('Pilih barang terlebih dahulu');
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append('barangId', formData.barangId);
      formPayload.append('tanggalPinjam', formData.tanggalPeminjaman);
      formPayload.append('tanggalRencanaKembali', formData.tanggalPengembalian);
      formPayload.append('keperluan', formData.keperluan);
      if (formData.fotoSebelum) formPayload.append('fotoSebelum', formData.fotoSebelum);

      const res = await fetch(`${API_BASE}/peminjaman`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formPayload
      });

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await res.json();
        if (result.success) {
          setShowSuccessModal(true);
          setFormData(prev => ({
            ...prev,
            barangId: '',
            namaBarang: '',
            merk: '',
            tipe: '',
            kodeBarang: '',
            noInventarisGa: '',
            serialNumber: '',
            partNumber: '',
            penanggungJawab: '',
            lokasi: '',
            programProject: '',
            kondisiAwal: '',
            keperluan: '',
            tanggalPengembalian: '',
            fotoSebelum: null
          }));
          fetchBarang();
          fetchPeminjaman();
        } else {
          alert(result.message || 'Gagal menyimpan peminjaman');
        }
      } else {
        alert('Terjadi kesalahan di server. Silakan cek terminal backend.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi ke server backend.');
    }
  };

  const handleOpenReturnForm = (item) => {
    setReturnItemData(item);
    setFormReturnData({
      tanggalKembaliAktual: new Date().toISOString().split('T')[0],
      diterimaOleh: 'Admin Gedung L',
      namaPengembali: item.peminjam || '',
      unit: item.unit || 'HC',
      statusBarang: 'Dikembalikan',
      kondisiSaatKembali: item.kondisiAwal || 'Baik',
      catatanPengembalian: '',
      fotoSesudah: null
    });
    setIsReturnMode(true);
  };

  const handleProcessReturn = async (e) => {
    e.preventDefault();
    try {
      const returnPayload = new FormData();
      returnPayload.append('tanggalKembaliAktual', formReturnData.tanggalKembaliAktual);
      returnPayload.append('diterimaOleh', formReturnData.diterimaOleh);
      returnPayload.append('namaPengembali', formReturnData.namaPengembali);
      returnPayload.append('unit', formReturnData.unit);
      returnPayload.append('statusBarang', formReturnData.statusBarang);
      returnPayload.append('kondisiSaatKembali', formReturnData.kondisiSaatKembali);
      returnPayload.append('catatanPengembalian', formReturnData.catatanPengembalian);
      if (formReturnData.fotoSesudah) returnPayload.append('fotoSesudah', formReturnData.fotoSesudah);

      const res = await fetch(`${API_BASE}/peminjaman/${returnItemData.id}/kembalikan`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: returnPayload
      });

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await res.json();
        if (result.success) {
          setShowReturnSuccessModal(true);
          setIsReturnMode(false);
          fetchPeminjaman();
          fetchBarang();
        } else {
          alert(result.message || 'Gagal memproses pengembalian');
        }
      } else {
        alert('Terjadi kesalahan di server. Silakan cek terminal backend.');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal terhubung ke server backend.');
    }
  };

  const getSisaHari = (tanggalRencanaKembali) => {
    if (!tanggalRencanaKembali) return null;
    const today = new Date();
    const target = new Date(tanggalRencanaKembali);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusInfo = (status, sisaHari) => {
    if (status === 'Menunggu Persetujuan') {
      return { label: 'Menunggu Persetujuan', color: 'bg-yellow-100 text-yellow-700' };
    } else if (status === 'Disetujui') {
      return { label: 'Disetujui', color: 'bg-blue-100 text-blue-700' };
    } else if (status === 'Dipinjam') {
      if (sisaHari < 0) {
        return { label: 'Terlambat', color: 'bg-red-100 text-red-700' };
      } else {
        return { label: 'Dipinjam', color: 'bg-green-100 text-green-700' };
      }
    } else if (status === 'Menunggu Verifikasi') {
      return { label: 'Menunggu Verifikasi', color: 'bg-purple-100 text-purple-700' };
    } else if (status === 'Selesai') {
      return { label: 'Selesai', color: 'bg-gray-100 text-gray-700' };
    } else {
      return { label: status || 'Unknown', color: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="flex bg-white font-sans overflow-x-hidden min-h-screen select-none">
      
      {/* SIDEBAR USER */}
      <SidebarUser />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full transition-all duration-300 ease-in-out md:ml-72 md:w-[calc(100%-288px)] bg-[#0053A0] p-6 sm:p-8 min-h-screen overflow-y-auto flex flex-col gap-6">
        {!isReturnMode ? (
          <>
            {/* Header khusus mobile: Tombol menu di kiri, Judul persis di tengah */}
            <div className="flex items-center md:block">
              <div className="w-10 md:hidden"></div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-white text-xl sm:text-2xl font-bold tracking-wide">Catat Peminjaman dan Pengembalian</h1>
                <p className="text-blue-100 text-xs mt-1">Catat Peminjaman</p>
              </div>
              <div className="w-10 md:hidden"></div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 w-full">
              <form onSubmit={handleSubmitPeminjaman} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Peminjaman</label>
                      <input
                        type="date"
                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none cursor-pointer"
                        value={formData.tanggalPeminjaman}
                        onChange={(e) => setFormData({ ...formData, tanggalPeminjaman: e.target.value })}
                        required
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Barang</label>
                      <div
                        onClick={() => setShowBarangDropdown(!showBarangDropdown)}
                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium flex items-center justify-between cursor-pointer"
                      >
                        <span className={formData.namaBarang ? '' : 'text-gray-400'}>
                          {formData.namaBarang || 'Pilih barang'}
                        </span>
                        <ChevronDown size={14} className="text-gray-500" />
                      </div>
                      {showBarangDropdown && (
                        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 p-3 border border-gray-100 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 mb-1">
                            <Search size={14} className="text-gray-400" />
                            <input
                              type="text"
                              placeholder="Cari nama / kode / serial number..."
                              className="bg-transparent text-xs w-full focus:outline-none"
                              value={cariBarang}
                              onChange={(e) => setCariBarang(e.target.value)}
                            />
                          </div>
                          {barangTersaring.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">Tidak ada barang tersedia</p>
                          ) : (
                            barangTersaring.map((b) => (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => handlePilihBarang(b)}
                                className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                              >
                                <p className="text-xs font-bold text-gray-800">
                                  {b.namaBarang || b.nama_barang || 'Nama tidak tersedia'}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {b.kodeBarang || b.kode_barang || 'No code'} • 
                                  {b.merk || 'No merk'} {b.tipe || ''}
                                  {b.serialNumber && ` • SN: ${b.serialNumber}`}
                                </p>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Merk</label>
                      <input
                        type="text"
                        readOnly
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none cursor-not-allowed"
                        value={formData.merk || "-"}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tipe</label>
                      <input
                        type="text"
                        readOnly
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none cursor-not-allowed"
                        value={formData.tipe || "-"}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kode Barang</label>
                      <input
                        type="text"
                        readOnly
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none cursor-not-allowed"
                        value={formData.kodeBarang || "-"}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">No Inventaris GA</label>
                      <input
                        type="text"
                        readOnly
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none cursor-not-allowed"
                        value={formData.noInventarisGa || "-"}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Serial Number</label>
                      <input
                        type="text"
                        readOnly
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none cursor-not-allowed"
                        value={formData.serialNumber || "-"}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Part Number</label>
                      <input
                        type="text"
                        readOnly
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none cursor-not-allowed"
                        value={formData.partNumber || "-"}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Rencana Kembali</label>
                        <input
                          type="date"
                          className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none cursor-pointer"
                          value={formData.tanggalPengembalian}
                          onChange={(e) => setFormData({ ...formData, tanggalPengembalian: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Penanggung Jawab</label>
                        <input
                          type="text"
                          readOnly
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none cursor-not-allowed"
                          value={formData.penanggungJawab || "-"}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Lokasi</label>
                        <input
                          type="text"
                          readOnly
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none cursor-not-allowed"
                          value={formData.lokasi || "-"}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Program/Project</label>
                        <input
                          type="text"
                          readOnly
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none cursor-not-allowed"
                          value={formData.programProject || "-"}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kondisi Barang Saat Ini</label>
                        <input
                          type="text"
                          readOnly
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none cursor-not-allowed"
                          value={formData.kondisiAwal || "-"}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Keperluan</label>
                        <input
                          type="text"
                          placeholder="Contoh: Untuk keperluan pengetesan"
                          className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none"
                          value={formData.keperluan}
                          onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Peminjam</label>
                        <input
                          type="text"
                          readOnly
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs text-gray-500 font-medium focus:outline-none cursor-not-allowed"
                          value={formData.namaPeminjam}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Unit</label>
                        <input
                          type="text"
                          readOnly
                          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs text-gray-500 font-medium focus:outline-none cursor-not-allowed"
                          value={formData.unit}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Foto Kondisi Awal Barang</label>
                      <div className="flex items-center gap-4">
                        <label className={`w-16 h-16 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer transition relative ${
                          formData.fotoSebelum ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}>
                          <Camera size={24} />
                          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => setFormData({ ...formData, fotoSebelum: e.target.files[0] })} />
                        </label>
                        {formData.fotoSebelum && (
                          <span className="text-xs text-gray-500">{formData.fotoSebelum.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#0053A0] hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                  >
                    Simpan Peminjaman
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <h2 className="text-white text-xl sm:text-2xl font-bold tracking-wide">Catat Pengembalian</h2>
                <p className="text-blue-100 text-xs mt-1">Barang yang perlu dikembalikan</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-5 w-full">
                <div className="flex justify-between items-center mb-4 px-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Barang yang perlu dikembalikan</span>
                  <span className="text-xs font-bold text-gray-700">{barangDipinjamList.length} Barang sedang dipinjam</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs min-w-[1200px]">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                        <th className="p-3 whitespace-nowrap">Tanggal Pinjam</th>
                        <th className="p-3 whitespace-nowrap">Tanggal Rencana Kembali</th>
                        <th className="p-3 whitespace-nowrap">Nama Barang</th>
                        <th className="p-3 whitespace-nowrap">Merk</th>
                        <th className="p-3 whitespace-nowrap">Tipe</th>
                        <th className="p-3 whitespace-nowrap">Kode Barang</th>
                        <th className="p-3 whitespace-nowrap">No Inventaris GA</th>
                        <th className="p-3 whitespace-nowrap">Serial Number</th>
                        <th className="p-3 whitespace-nowrap">Part Number</th>
                        <th className="p-3 whitespace-nowrap">Penanggung Jawab</th>
                        <th className="p-3 whitespace-nowrap">Lokasi</th>
                        <th className="p-3 whitespace-nowrap">Program/Project</th>
                        <th className="p-3 whitespace-nowrap">Status</th>
                        <th className="p-3 whitespace-nowrap">Kondisi</th>
                        <th className="p-3 whitespace-nowrap">Peminjam</th>
                        <th className="p-3 whitespace-nowrap">Unit</th>
                        <th className="p-3 whitespace-nowrap">Sisa Hari</th>
                        <th className="p-3 whitespace-nowrap text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                      {barangDipinjamList.length === 0 ? (
                        <tr>
                          <td colSpan="18" className="p-8 text-center text-gray-400 italic">
                            Tidak ada barang yang sedang dipinjam
                          </td>
                        </tr>
                      ) : (
                        barangDipinjamList.map((item, idx) => {
                          const sisaHari = getSisaHari(item.tanggalRencanaKembali);
                          const statusInfo = getStatusInfo(item.status, sisaHari);
                          
                          return (
                            <tr key={item.id || idx} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-3 text-gray-600 whitespace-nowrap">{item.tanggalPinjam || '-'}</td>
                              <td className="p-3 text-gray-600 whitespace-nowrap">{item.tanggalRencanaKembali || '-'}</td>
                              <td className="p-3 font-bold text-gray-900 whitespace-nowrap">{item.namaBarang || '-'}</td>
                              <td className="p-3 text-gray-600 whitespace-nowrap">{item.merk || '-'}</td>
                              <td className="p-3 text-gray-600 whitespace-nowrap">{item.tipe || '-'}</td>
                              <td className="p-3 text-gray-600 whitespace-nowrap">{item.kodeBarang || '-'}</td>
                              <td className="p-3 text-gray-600 whitespace-nowrap">{item.nomorInventarisGa || '-'}</td>
                              <td className="p-3 text-gray-600 whitespace-nowrap">{item.serialNumber || '-'}</td>
                              <td className="p-3 text-gray-600 whitespace-nowrap">{item.partNumber || '-'}</td>
                              <td className="p-3 text-gray-600 whitespace-nowrap">{item.penanggungJawab || '-'}</td>
                              <td className="p-3 text-gray-600 whitespace-nowrap">{item.lokasi || '-'}</td>
                              <td className="p-3 text-gray-600 whitespace-nowrap">{item.programProject || '-'}</td>
                              <td className="p-3 whitespace-nowrap">
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${statusInfo.color}`}>
                                  {statusInfo.label}
                                </span>
                              </td>
                              <td className="p-3 text-gray-600 whitespace-nowrap">{item.kondisiAwal || '-'}</td>
                              <td className="p-3 text-gray-600 whitespace-nowrap">{item.peminjam || '-'}</td>
                              <td className="p-3 text-gray-600 whitespace-nowrap">{item.unit || '-'}</td>
                              <td className="p-3 whitespace-nowrap">
                                {sisaHari !== null ? (
                                  <span className={`font-bold ${sisaHari < 0 ? 'text-red-600' : sisaHari <= 3 ? 'text-orange-500' : 'text-green-600'}`}>
                                    {sisaHari < 0 ? `${Math.abs(sisaHari)} hari terlambat` : `${sisaHari} hari lagi`}
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="p-3 text-center whitespace-nowrap">
                                {item.status === 'Dipinjam' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReturnForm(item)}
                                    className="px-4 py-1.5 bg-[#0053A0] hover:bg-blue-800 text-white text-[11px] font-bold rounded-xl shadow-sm transition cursor-pointer"
                                  >
                                    Kembalikan
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-gray-400 italic">Menunggu</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsReturnMode(false)}
                className="flex items-center gap-2 text-white text-xs font-bold hover:underline cursor-pointer"
              >
                <ArrowLeft size={16} /> Kembali ke daftar peminjaman
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 w-full flex flex-col gap-6">
              {/* DETAIL INFO BARANG ATAS */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 bg-gray-50/80 p-5 rounded-2xl border border-gray-100 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Tanggal Peminjaman</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{returnItemData?.tanggalPinjam || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Tanggal Kembali</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{returnItemData?.tanggalRencanaKembali || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Nama Barang</span>
                  <p className="font-bold text-gray-900 mt-0.5">{returnItemData?.namaBarang || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Merk</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{returnItemData?.merk || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Tipe</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{returnItemData?.tipe || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Kode Barang</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{returnItemData?.kodeBarang || '-'}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">No Inventaris GA</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{returnItemData?.nomorInventarisGa || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Serial Number</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{returnItemData?.serialNumber || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Part Number</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{returnItemData?.partNumber || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Penanggung Jawab</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{returnItemData?.penanggungJawab || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Lokasi</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{returnItemData?.lokasi || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Program/Project</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{returnItemData?.programProject || '-'}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{returnItemData?.status || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Kondisi Awal</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{returnItemData?.kondisiAwal || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Nama Peminjam</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{returnItemData?.peminjam || '-'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Unit</span>
                  <p className="font-semibold text-gray-800 mt-0.5">{returnItemData?.unit || '-'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Sisa Waktu</span>
                  <p className="font-bold text-yellow-600 mt-0.5">
                    {getSisaHari(returnItemData?.tanggalRencanaKembali) !== null 
                      ? (getSisaHari(returnItemData?.tanggalRencanaKembali) < 0 
                          ? `${Math.abs(getSisaHari(returnItemData?.tanggalRencanaKembali))} hari terlambat` 
                          : `${getSisaHari(returnItemData?.tanggalRencanaKembali)} Hari lagi`) 
                      : '-'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleProcessReturn} className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-2">FORM PENGEMBALIAN</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Pengembalian</label>
                      <input
                        type="date"
                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none"
                        value={formReturnData.tanggalKembaliAktual}
                        onChange={(e) => setFormReturnData({ ...formReturnData, tanggalKembaliAktual: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Pengembali</label>
                      <input
                        type="text"
                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none"
                        value={formReturnData.namaPengembali}
                        onChange={(e) => setFormReturnData({ ...formReturnData, namaPengembali: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Unit</label>
                      <input
                        type="text"
                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none"
                        value={formReturnData.unit}
                        onChange={(e) => setFormReturnData({ ...formReturnData, unit: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Catatan Pengembalian</label>
                      <input
                        type="text"
                        placeholder="Contoh: Barang aman"
                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none"
                        value={formReturnData.catatanPengembalian}
                        onChange={(e) => setFormReturnData({ ...formReturnData, catatanPengembalian: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Diterima Oleh</label>
                      <input
                        type="text"
                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none"
                        value={formReturnData.diterimaOleh}
                        onChange={(e) => setFormReturnData({ ...formReturnData, diterimaOleh: e.target.value })}
                      />
                    </div>

                    {/* Dropdown Status Barang */}
                    <div className="relative">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status Barang</label>
                      <div
                        onClick={() => setShowStatusBrgDropdown(!showStatusBrgDropdown)}
                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium flex items-center justify-between cursor-pointer"
                      >
                        <span>{formReturnData.statusBarang}</span>
                        <ChevronDown size={14} className="text-gray-500" />
                      </div>
                      {showStatusBrgDropdown && (
                        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 p-3 border border-gray-100 flex flex-col gap-1 max-h-[220px] overflow-y-auto">
                          {STATUS_BARANG_OPTIONS.map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => {
                                setFormReturnData({ ...formReturnData, statusBarang: st });
                                setShowStatusBrgDropdown(false);
                              }}
                              className="w-full py-2 rounded-xl text-xs font-bold text-white bg-[#0053A0] hover:bg-blue-800 transition cursor-pointer text-center"
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dropdown Kondisi Saat Kembali */}
                    <div className="relative">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kondisi Akhir Barang</label>
                      <div
                        onClick={() => setShowReturnKondisiDropdown(!showReturnKondisiDropdown)}
                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-xs text-gray-800 font-medium flex items-center justify-between cursor-pointer"
                      >
                        <span>{formReturnData.kondisiSaatKembali}</span>
                        <ChevronDown size={14} className="text-gray-500" />
                      </div>
                      {showReturnKondisiDropdown && (
                        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 p-3 border border-gray-100 flex flex-col gap-2">
                          {KONDISI_OPTIONS.map((kond) => (
                            <button
                              key={kond}
                              type="button"
                              onClick={() => {
                                setFormReturnData({ ...formReturnData, kondisiSaatKembali: kond });
                                setShowReturnKondisiDropdown(false);
                              }}
                              className="w-full py-2 rounded-xl text-xs font-bold text-white bg-[#0053A0] hover:bg-blue-800 transition cursor-pointer text-center"
                            >
                              {kond}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Foto Kondisi Akhir Barang</label>
                      <div className="flex items-center gap-4">
                        {/* Tombol Kamera Langsung */}
                        <label className={`w-16 h-16 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer transition relative ${
                          formReturnData.fotoSesudah ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}>
                          <Camera size={24} />
                          <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            className="hidden" 
                            onChange={(e) => setFormReturnData({ ...formReturnData, fotoSesudah: e.target.files[0] })} 
                          />
                        </label>
                        {formReturnData.fotoSesudah && (
                          <span className="text-xs text-gray-500 truncate max-w-[200px]">{formReturnData.fotoSesudah.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsReturnMode(false)}
                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-[#0053A0] hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                  >
                    Simpan Pengembalian
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </main>

      {/* MODAL SUKSES PEMINJAMAN */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#DCFCE7] text-[#22C55E] rounded-full flex items-center justify-center mb-5">
              <Check size={32} strokeWidth={3} />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Peminjaman Berhasil Diajukan!</h3>
            <p className="text-xs text-gray-500 font-medium mb-8 leading-relaxed max-w-xs">
              Pengajuan peminjaman menunggu persetujuan admin.
            </p>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3.5 bg-[#005CA9] hover:bg-[#004B8A] text-white text-sm font-bold rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* MODAL SUKSES PENGEMBALIAN */}
      {showReturnSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#DCFCE7] text-[#22C55E] rounded-full flex items-center justify-center mb-5">
              <Check size={32} strokeWidth={3} />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Pengembalian Berhasil Diajukan!</h3>
            <p className="text-xs text-gray-500 font-medium mb-8 leading-relaxed max-w-xs">
              Pengajuan pengembalian menunggu verifikasi admin.
            </p>
            <button
              type="button"
              onClick={() => setShowReturnSuccessModal(false)}
              className="w-full py-3.5 bg-[#005CA9] hover:bg-[#004B8A] text-white text-sm font-bold rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}