import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar.jsx';
import StatCard from '../../components/dashboard/StatCard.jsx';
import BarangPerProgramChart from '../../components/dashboard/BarangPerProgramChart.jsx';
import ProgressListCard from '../../components/dashboard/ProgressListCard.jsx';

export default function DashboardAdmin() {
  const [stats, setStats] = useState([]);
  const [programData, setProgramData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://172.16.13.82:5000/api/dashboard', {
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
            { label: 'Barang Rusak', value: d.barangRusak || 0 },
          ]);

          setProgramData(
            (d.barangPerProgram || []).map(p => ({ name: p.program, value: p.jumlah }))
          );

          setStatusData(
            (d.barangPerStatus || []).map(s => ({ label: s.status, value: s.jumlah }))
          );
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
  };

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

        {/* Card Statistik Top Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Layout 2 Kolom Sejajar (Barang per Program & Barang per Status) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <BarangPerProgramChart data={programData} />
          <ProgressListCard title="Barang per Status" items={statusData} className="h-full" />
        </div>
      </div>
    </div>
  );
}