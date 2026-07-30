import { useState } from 'react'
import { FileSpreadsheet, FileText, FileType, Download, X, Check } from 'lucide-react'

const FIELDS = [
  ['Nama barang', 'Program'],
  ['Qty', 'Merk'],
  ['Tipe', 'Kode'],
  ['Serial Number', 'Part Number'],
  ['No Inventaris GA', 'Penanggung Jawab'],
  ['Status', 'Kondisi'],
]

const FORMATS = [
  { key: 'xlsx', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
  { key: 'csv', label: 'CSV', icon: FileText },
]

export default function EksporBarangModal({ isOpen, onClose, onExport, totalBarang = 0, selectedCount = 0 }) {
  const [scope, setScope] = useState('semua') // 'semua' | 'terpilih'
  const [format, setFormat] = useState('xlsx')

  // Semua kolom langsung diatur tercakup secara default agar tercentang otomatis
  const [fields, setFields] = useState([
    'Nama barang', 'Qty', 'Program', 'Merk', 'Tipe', 'Kode',
    'Serial Number', 'Part Number', 'No Inventaris GA', 'Penanggung Jawab',
    'Status', 'Kondisi', 'Lokasi'
  ])

  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  if (!isOpen) return null

  const toggleField = (field) => {
    if (!field) return
    setFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    )
  }

  const handleExport = () => {
    onExport?.({ scope, format, fields })
    setShowSuccessAlert(true)
  }

  const handleCloseSuccess = () => {
    setShowSuccessAlert(false)
    onClose?.()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      {showSuccessAlert ? (
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center text-center gap-6 animate-scaleUp">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
            <Check size={36} strokeWidth={3} />
          </div>
          <p className="text-gray-800 font-bold text-base">
            Data barang berhasil di ekspor
          </p>
          <button
            type="button"
            onClick={handleCloseSuccess}
            className="w-full py-3 bg-[#005CA9] text-white text-xs font-bold rounded-2xl hover:bg-[#004B8A] transition-colors cursor-pointer shadow-md"
          >
            Oke
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
          <div className="p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-5">
              <h2 className="text-xl font-bold text-gray-800">Ekspor Barang</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Data yang diekspor */}
            <p className="text-xs text-gray-400 mb-2">Data yang di ekspor</p>
            <div className="flex flex-col gap-2 mb-5">
              <label
                className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer ${
                  scope === 'semua' ? 'border-[#005CA9]' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  checked={scope === 'semua'}
                  onChange={() => setScope('semua')}
                  className="accent-[#005CA9]"
                />
                <span className="text-sm text-gray-700">Semua barang ({totalBarang} barang)</span>
              </label>
              <label
                className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer ${
                  scope === 'terpilih' ? 'border-[#005CA9]' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  checked={scope === 'terpilih'}
                  onChange={() => setScope('terpilih')}
                  disabled={selectedCount === 0}
                  className="accent-[#005CA9]"
                />
                <span className="text-sm text-gray-700">Barang terpilih ({selectedCount} barang)</span>
              </label>
            </div>

            {/* Format file */}
            <p className="text-xs text-gray-400 mb-2">Format file</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {FORMATS.map((f) => {
                const Icon = f.icon
                const active = format === f.key
                return (
                  <button
                    key={f.key}
                    onClick={() => setFormat(f.key)}
                    className={`flex flex-col items-center justify-center gap-2 border rounded-lg py-4 text-xs font-medium cursor-pointer ${
                      active
                        ? 'border-[#005CA9] text-[#005CA9] bg-blue-50'
                        : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon size={20} />
                    {f.label}
                  </button>
                )
              })}
            </div>

            {/* Kolom yang disertakan */}
            <p className="text-xs text-gray-400 mb-2">Kolom yang disertakan</p>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-6">
              {FIELDS.flat().filter(Boolean).map((field) => (
                <label key={field} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fields.includes(field)}
                    onChange={() => toggleField(field)}
                    className="accent-[#005CA9]"
                  />
                  {field}
                </label>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-md text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-md text-sm font-medium bg-[#005CA9] text-white hover:bg-[#004B8A] cursor-pointer"
              >
                <Download size={14} /> Ekspor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}