import { Outlet } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar.jsx'
import Navbar from '../components/common/Navbar.jsx'

const menuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/admin/master-barang', label: 'Master Barang', icon: 'barang' },
  {
    label: 'Catat Peminjaman',
    icon: 'peminjaman',
    children: [
      { path: '/admin/peminjaman', label: 'Peminjaman' },
      { path: '/admin/pengembalian', label: 'Pengembalian' },
    ],
  },
  { path: '/admin/booking-ruangan', label: 'Catat Booking Ruangan', icon: 'booking' },
  { path: '/admin/riwayat', label: 'Riwayat', icon: 'riwayat' },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar menuItems={menuItems} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}