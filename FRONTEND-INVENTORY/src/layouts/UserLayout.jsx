import { Outlet } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar.jsx'
import Navbar from '../components/common/Navbar.jsx'

const menuItems = [
  { path: '/user/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/user/peminjaman', label: 'Peminjaman', icon: 'peminjaman' },
  { path: '/user/booking-ruangan', label: 'Booking Ruangan', icon: 'booking' },
]

export default function UserLayout() {
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