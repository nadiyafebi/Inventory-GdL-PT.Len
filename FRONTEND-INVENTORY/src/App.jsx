import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin
import DashboardAdmin from './pages/admin/DashboardAdmin';
import MasterBarangAdmin from './pages/admin/MasterBarang';
import TambahBarang from './pages/admin/TambahBarang';
import FilterRuanganAdmin from './pages/admin/FilterRuangan';
import RiwayatAdmin from './pages/admin/Riwayat';

// User
import DashboardUser from './pages/user/DashboardUser';
import MasterBarangUser from './pages/user/MasterBarang';
import CatatPeminjamanPengembalianUser from './pages/user/CatatPeminjamanPengembalian';
import CatatBookingRuanganUser from './pages/user/CatatBookingRuangan';
import FilterRuanganUser from './pages/user/FilterRuangan';

// Komponen Proteksi Route Berdasarkan Role
const ProtectedRoute = ({ allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = (localStorage.getItem('userRole') || localStorage.getItem('role') || '').toLowerCase();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole.toLowerCase()) {
    return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Route Publik */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rute Khusus Admin */}
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin/dashboard" element={<DashboardAdmin />} />
            <Route path="/admin/master-barang" element={<MasterBarangAdmin />} />
            <Route path="/admin/master-barang/tambah" element={<TambahBarang />} />
            <Route path="/admin/filter-ruangan" element={<FilterRuanganAdmin />} />
            <Route path="/admin/riwayat" element={<RiwayatAdmin />} />
          </Route>

          {/* Rute Khusus User */}
          <Route element={<ProtectedRoute allowedRole="user" />}>
            <Route path="/user/dashboard" element={<DashboardUser />} />
            <Route path="/user/master-barang" element={<MasterBarangUser />} />
            <Route path="/user/peminjaman" element={<CatatPeminjamanPengembalianUser />} />
            <Route path="/user/booking-ruangan" element={<CatatBookingRuanganUser />} />
            <Route path="/user/filter-ruangan" element={<FilterRuanganUser />} />
          </Route>

          {/* Fallback jika rute tidak ditemukan */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;