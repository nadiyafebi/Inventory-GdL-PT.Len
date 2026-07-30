import { useAuth } from '../../hooks/useAuth.js'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="flex justify-between items-center bg-white border-b px-6 py-3">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user?.name || 'Guest'}</span>
        <button
          onClick={logout}
          className="text-sm text-brand-red hover:underline"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
