import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar.jsx'; // ✅ Sudah diperbaiki (tanpa {})
import StatCard from '../../components/dashboard/StatCard.jsx';
import BarangPerProgramChart from '../../components/dashboard/BarangPerProgramChart.jsx';
import ProgressListCard from '../../components/dashboard/ProgressListCard.jsx';
import ApprovalList from '../../components/dashboard/ApprovalList.jsx';
import { AlertTriangle, X, Check, Loader2 } from 'lucide-react';

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [programData, setProgramData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [approvalItems, setApprovalItems] = useState([]);

  // State untuk modal konfirmasi tolak
  const [rejectTarget, setRejectTarget] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);

  // State untuk modal notifikasi (sukses / gagal)
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://172.16.13.165:5000/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result && result.success && result.data) {
          const d = result.data;

          setStats([
            { label: 'Total Barang', value: d.totalBarang || 0 },
            { label: 'Total Pengguna', value: d.totalUser || 0 },
            { label: 'Program Aktif', value: d.programAktif || 0 },
            { label: 'Persetujuan Pinjam', value: d.approvalPinjam || 0 },
            { label: 'Persetujuan Ruang', value: d.approvalRuang || 0 },
            { label: 'Barang Rusak', value: d.barangRusak || 0 },
          ]);

          setProgramData(
            (d.barangPerProgram || []).map(p => ({ name: p.program, value: p.jumlah }))
          );

          setStatusData(
            (d.barangPerStatus || []).map(s => ({ label: s.status, value: s.jumlah }))
          );

          setApprovalItems(d.menungguApproval || []);
        } else {
          loadDummyData();
        }
      })
      .catch(err => {
        console.warn('Gagal ambil data dashboard dari backend, menggunakan data dummy...', err);
        loadDummyData();
      });
  }, []);

  const loadDummyData = () => {
    setStats([
      { label: 'Total Barang', value: 120 },
      { label: 'Total User', value: 15 },
      { label: 'Program Aktif', value: 4 },
      { label: 'Persetujuan Pinjam', value: 2 },
      { label: 'Persetujuan Ruang', value: 1 },
      { label: 'Barang Rusak', value: 3 },
    ]);
    setProgramData([
      { name: 'Radar Utama', value: 45 },
      { name: 'EW System', value: 75 }
    ]);
    setStatusData([
      { label: 'Tersedia', value: 100 },
      { label: 'Dipinjam', value: 17 },
      { label: 'Rusak', value: 3 }
    ]);
    setApprovalItems([]);
  };

  // Diklik saat tombol centang (approve) ditekan
  const handleOpenApprovalDetail = (item) => {
    const isRuangan = item.jenis === 'booking';

    if (isRuangan) {
      const mappedRuangan = {
        id: item.id,
        tipe: 'ruangan',
        status: 'Menunggu Approval',
        approval: 'Menunggu',
        ruangan: item.nama,
        peminjam: item.peminjam,
        unit: item.divisi || item.unit,
        tanggal: item.tanggal_peminjaman || item.tanggal,
        jamMulai: item.jam_mulai,
        jamSelesai: item.jam_selesai,
        keperluan: item.keperluan
      };

      sessionStorage.setItem('bukaDetailBooking', JSON.stringify(mappedRuangan));
      navigate('/admin/booking-ruangan');
      return;
    }

    // Item barang
    const mappedItem = {
      id: item.id,
      tipe: 'peminjaman',
      status: 'Menunggu Approval',
      approval: 'Menunggu',
      barang: item.nama || item.nama_barang || item.barang,
      kodeBarang: item.kode_barang,
      peminjam: item.peminjam,
      unit: item.divisi || item.unit,
      tanggalPinjam: item.tanggal_pinjam,
      tanggalKembaliRencana: item.tanggal_rencana_kembali,
      kondisiAwal: item.kondisi_awal,
      fotoSebelum: item.foto_sebelum,
      fotoSesudah: item.foto_sesudah
    };

    sessionStorage.setItem('bukaDetailTransaksi', JSON.stringify(mappedItem));
    navigate('/admin/peminjaman-pengembalian');
  };

  // Diklik saat tombol silang (tolak) ditekan -> buka modal konfirmasi
  const handleRejectDariDashboard = (item) => {
    setRejectTarget(item);
  };

  const closeRejectModal = () => {
    if (isRejecting) return;
    setRejectTarget(null);
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    setIsRejecting(true);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://172.16.13.165:5000/api/peminjaman/${rejectTarget.id}/persetujuan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ disetujui: false })
      });
      const result = await res.json();

      setRejectTarget(null);
      setIsRejecting(false);

      if (result.success) {
        setApprovalItems(prev => prev.filter(i => i.id !== rejectTarget.id));
        setNotif({ type: 'success', message: 'Peminjaman berhasil ditolak.' });
      } else {
        setNotif({ type: 'error', message: result.message || 'Gagal menolak peminjaman.' });
      }
    } catch (err) {
      console.error(err);
      setIsRejecting(false);
      setRejectTarget(null);
      setNotif({ type: 'error', message: 'Gagal terhubung ke server.' });
    }
  };

  const namaTarget = rejectTarget
    ? (rejectTarget.nama || rejectTarget.nama_barang || rejectTarget.barang || 'item ini')
    : '';
  const namaPeminjamTarget = rejectTarget
    ? (rejectTarget.peminjam || rejectTarget.nama_peminjam || 'peminjam')
    : '';

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#005CA9] text-gray-800 font-sans overflow-x-hidden">
      <Sidebar />

      <div className={`
        flex-1 w-full transition-all duration-300 ease-in-out
        md:ml-[288px] md:w-[calc(100%-288px)]
        px-4 sm:px-6 md:px-8 
        py-4 sm:py-6 md:py-8
        flex flex-col gap-4 md:gap-5
      `}>
        <h1 className="text-center md:text-left text-lg sm:text-xl font-bold text-white tracking-wide">
          Dashboard
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <BarangPerProgramChart data={programData} />
            <ApprovalList
              items={approvalItems}
              onApproveClick={handleOpenApprovalDetail}
              onRejectClick={handleRejectDariDashboard}
            />
          </div>
          <ProgressListCard title="Barang per Status" items={statusData} className="h-full" />
        </div>
      </div>

      {/* MODAL KONFIRMASI TOLAK */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-[400px] shadow-2xl text-center flex flex-col items-center">

            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <AlertTriangle size={32} strokeWidth={2.5} />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">Tolak Peminjaman?</h3>
            <p className="text-xs text-gray-500 mb-1 leading-relaxed">
              Anda akan menolak peminjaman
            </p>
            <p className="text-sm font-bold text-gray-800 mb-1">
              "{namaTarget}"
            </p>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              oleh <span className="font-semibold text-gray-700">{namaPeminjamTarget}</span>.
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={closeRejectModal}
                disabled={isRejecting}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmReject}
                disabled={isRejecting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-2xl shadow-md transition cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isRejecting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Ya, Tolak'
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL NOTIFIKASI HASIL (sukses / gagal) */}
      {notif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-[360px] shadow-2xl text-center flex flex-col items-center">

            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner ${
              notif.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {notif.type === 'success' ? (
                <Check size={36} strokeWidth={3} />
              ) : (
                <X size={36} strokeWidth={3} />
              )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {notif.type === 'success' ? 'Berhasil!' : 'Terjadi Kesalahan'}
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              {notif.message}
            </p>

            <button
              type="button"
              onClick={() => setNotif(null)}
              className="w-full py-3 bg-[#0053A0] hover:bg-blue-800 text-white text-xs font-bold rounded-2xl shadow-md transition cursor-pointer"
            >
              OK
            </button>

          </div>
        </div>
      )}

    </div>
  );
}