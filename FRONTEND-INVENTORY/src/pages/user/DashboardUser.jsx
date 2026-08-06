import React, { useState, useEffect } from 'react';
import SidebarUser from '../../components/common/SidebarUser';
import StatCard from '../../components/dashboard/StatCard.jsx';
import ProgressListCard from '../../components/dashboard/ProgressListCard.jsx';

const API_BASE = 'http://172.16.10.148:5000/api';

export default function DashboardUser() {
  const [stats, setStats] = useState([]);
  const [programData, setProgramData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    Promise.all([
      fetch(`${API_BASE}/dashboard`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch(`${API_BASE}/peminjaman/menunggu-saya`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
    ])
      .then(([dashboardResult, menungguResult]) => {
        if (dashboardResult.success) {
          const d = dashboardResult.data;
          const menunggu = menungguResult.success ? menungguResult.data.jumlah : 0;

          setStats([
            { label: 'Total Barang', value: d.totalBarang },
            { label: 'Program Aktif', value: d.programAktif },
            { label: 'Barang Rusak', value: d.barangRusak },
            { label: 'Menunggu Approval Saya', value: menunggu },
          ]);

          setProgramData(
            d.barangPerProgram.map(p => ({ label: p.program, value: p.jumlah }))
          );

          setStatusData(
            d.barangPerStatus.map(s => ({ label: s.status, value: s.jumlah }))
          );
        }
      })
      .catch(err => console.error('Gagal ambil data dashboard:', err));
  }, []);

  return (
    <div className="flex bg-white font-sans overflow-x-hidden min-h-screen select-none">
      
      {/* Sidebar User dengan lebar w-72 */}
      <SidebarUser />

      {/* Main Content dengan penyesuaian margin dan lebar agar sejajar dengan sidebar */}
      <main className="flex-1 w-full transition-all duration-300 ease-in-out md:ml-72 md:w-[calc(100%-288px)] bg-[#0053A0] p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto min-h-screen">
        
        {/* Header khusus mobile: Tombol menu di kiri, Judul persis di tengah */}
        <div className="flex items-center md:block">
          <div className="w-10 md:hidden"></div> {/* Spacer penyeimbang tombol hamburger di sidebar */}
          <h1 className="flex-1 text-center md:text-left text-white text-xl sm:text-2xl font-bold tracking-wide">Dashboard</h1>
          <div className="w-10 md:hidden"></div> {/* Spacer penyeimbang kanan */}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          <ProgressListCard title="Barang per Program" items={programData} />
          <ProgressListCard title="Barang per Status" items={statusData} />
        </div>

      </main>
    </div>
  );
}