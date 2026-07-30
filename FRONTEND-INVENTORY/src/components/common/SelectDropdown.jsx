import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function SelectDropdown({ value, options, onChange, placeholder = 'Pilih...' }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      {/* Tombol Utama Dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-3 rounded-full border-0 text-[11px] font-medium bg-gray-100 text-gray-700 flex items-center justify-between shadow-sm hover:bg-gray-200 transition-colors cursor-pointer focus:outline-none"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu Popup Melengkung dengan Tombol Pill Biru */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl z-50 p-4 border border-gray-100 flex flex-col gap-2 max-h-[300px] overflow-y-auto animate-fadeIn">
          {options.map((opt) => {
            const isSelected = value === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt)
                  setIsOpen(false)
                }}
                className={`w-full py-3 px-6 rounded-full text-[11px] font-bold text-white transition-all cursor-pointer shadow-sm ${
                  isSelected 
                    ? 'bg-[#004B8A] ring-2 ring-white/50' 
                    : 'bg-[#005CA9] hover:bg-[#004B8A]'
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}