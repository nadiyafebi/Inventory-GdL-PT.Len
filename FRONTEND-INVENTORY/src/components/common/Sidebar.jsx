import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Calendar,
  History,
  Filter,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { createPortal } from 'react-dom';

const iconStyles = {
  dashboard: { icon: LayoutDashboard, bg: 'bg-blue-50', color: 'text-blue-600' },
  barang: { icon: Package, bg: 'bg-orange-50', color: 'text-orange-500' },
  peminjaman: { icon: ClipboardList, bg: 'bg-amber-50', color: 'text-amber-600' },
  booking: { icon: Calendar, bg: 'bg-purple-50', color: 'text-purple-600' },
  riwayat: { icon: History, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  filterRuangan: { icon: Filter, bg: 'bg-teal-50', color: 'text-teal-600' },
};

const defaultMenuItems = [
  { name: 'Dashboard', iconKey: 'dashboard', path: '/admin/dashboard' },
  { name: 'Master Barang', iconKey: 'barang', path: '/admin/master-barang' },
  { name: 'Filter Ruangan', iconKey: 'filterRuangan', path: '/admin/filter-ruangan' },
  { name: 'Riwayat', iconKey: 'riwayat', path: '/admin/riwayat' },
];

const FONT_STACK = "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif";

function navItemClass(isActive) {
  const base = 'w-full flex items-center space-x-3 px-3 py-2.5 text-xs font-medium rounded-xl transition-colors';
  return isActive
    ? `${base} bg-[#E6F0FA] text-[#005CA9] font-semibold shadow-sm`
    : `${base} text-gray-600 hover:bg-gray-50 hover:text-gray-900`;
}

function subNavItemClass(isActive) {
  const base = 'block px-3 py-2 text-xs font-medium rounded-lg transition-colors';
  return isActive
    ? `${base} bg-[#E6F0FA] text-[#005CA9] font-semibold`
    : `${base} text-gray-500 hover:bg-gray-50`;
}

function IconBadge({ iconKey }) {
  const style = iconStyles[iconKey] || iconStyles.barang;
  const Icon = style.icon;
  return (
    <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.bg}`}>
      <Icon size={16} className={style.color} strokeWidth={2} />
    </span>
  );
}

const Sidebar = ({
  menuItems = defaultMenuItems,
  userLabel = 'Admin PDC',
  userEmail = 'admin@len.co.id',
}) => {
  const [openGroup, setOpenGroup] = useState(
    menuItems.find((m) => m.children)?.name || null
  );
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileOpen && isMobile) {
        const sidebar = document.getElementById('mobile-sidebar');
        const toggleBtn = document.getElementById('sidebar-toggle');
        if (sidebar && !sidebar.contains(event.target) && toggleBtn && !toggleBtn.contains(event.target)) {
          setIsMobileOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen, isMobile]);

  useEffect(() => {
    if (isMobileOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen, isMobile]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const sidebarContent = (
    <>
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-2 bg-white">
        <div className="flex justify-between items-center w-full">
          <img src="/Logo Digantara.png" alt="Digantara" className="h-8 w-auto object-contain" />
          <img src="/Logo Len.png" alt="LEN" className="h-9 w-auto object-contain" />
        </div>
        <div className="w-full text-left">
          <h2 className="text-[11px] font-bold text-gray-800 tracking-wider uppercase">Inventory</h2>
          <p className="text-[11px] text-gray-500 font-medium">
            Workshop Radar & Electronic Warfare
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            if (item.children) {
              const isOpen = openGroup === item.name;
              return (
                <div key={item.name}>
                  <button
                    type="button"
                    onClick={() => setOpenGroup(isOpen ? null : item.name)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-xl transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <IconBadge iconKey={item.iconKey} />
                      <span>{item.name}</span>
                    </div>
                    <span
                      className={`text-xs text-gray-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div className="ml-11 mt-1 space-y-1 pb-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) => subNavItemClass(isActive)}
                          onClick={() => isMobile && setIsMobileOpen(false)}
                        >
                          {child.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => navItemClass(isActive)}
                onClick={() => isMobile && setIsMobileOpen(false)}
              >
                <IconBadge iconKey={item.iconKey} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden min-w-0">
            <div className="w-8 h-8 bg-[#005CA9] text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              {userLabel.charAt(0)}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">{userLabel}</p>
              <p className="text-[10px] text-gray-500 font-medium truncate">{userEmail}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            title="Logout"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0 ml-2 cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {isMobile && (
        <button
          id="sidebar-toggle"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-30 p-2.5 bg-white rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 lg:hidden cursor-pointer"
          aria-label="Toggle sidebar"
        >
          {isMobileOpen ? (
            <X size={20} className="text-gray-600" />
          ) : (
            <Menu size={20} className="text-gray-600" />
          )}
        </button>
      )}

      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {!isMobile && (
        <div
          className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-20 select-none shadow-sm"
          style={{ fontFamily: FONT_STACK }}
        >
          {sidebarContent}
        </div>
      )}

      {isMobile && (
        <div
          id="mobile-sidebar"
          className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 flex flex-col z-50 select-none shadow-2xl transition-transform duration-300 ease-in-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ fontFamily: FONT_STACK }}
        >
          {sidebarContent}
        </div>
      )}

      {showLogoutConfirm && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <LogOut size={22} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1.5">Yakin mau logout?</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed px-1">
              Kamu akan keluar dari sesi ini dan diarahkan kembali ke halaman login.
            </p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-red-500 text-white hover:bg-red-600 shadow-md transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Sidebar;