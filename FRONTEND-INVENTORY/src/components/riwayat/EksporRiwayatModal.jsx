import { useState } from 'react'
import { X, FileSpreadsheet, FileText, Download, Check } from 'lucide-react'

export default function EksporRiwayatModal({ isOpen, onClose, onExport }) {
  const [format, setFormat] = useState('xlsx')
  const [fields, setFields] = useState({
    waktu: true,
    aktivitas: true,
    jenis: true,
    nama: true,
    peminjam: true,
    unitKerja: true,
    rentangWaktu: true,
    foto: true
  })
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const toggleField = (key) => {
    setFields(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleConfirmExport = async () => {
    const selectedColumns = Object.keys(fields).filter(k => fields[k])
    
    if (selectedColumns.length === 0) {
      alert('Pilih minimal satu kolom untuk diekspor')
      return
    }

    setIsLoading(true)
    try {
      const success = await onExport({ format, fields: selectedColumns })
      
      if (success !== false) {
        setIsSuccess(true)
        setTimeout(() => {
          setIsSuccess(false)
          onClose()
        }, 1500)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Terjadi kesalahan saat mengekspor data')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      {isSuccess ? (
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center text-center gap-6 animate-scaleUp">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
            <Check size={36} strokeWidth={3} />
          </div>
          <p className="text-gray-800 font-bold text-base">
            Data berhasil di-ekspor!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-scaleUp">
          
          {/* Header */}
          <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900">Ekspor Riwayat</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-6">
            
            {/* Format File */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Format file</label>
              <div className="grid grid-cols-2 gap-3">
                
                <button
                  type="button"
                  onClick={() => setFormat('xlsx')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    format === 'xlsx' ? 'border-[#005CA9] bg-blue-50/40 text-[#005CA9]' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <FileSpreadsheet size={22} />
                  <span className="text-xs font-bold">Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('csv')}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    format === 'csv' ? 'border-[#005CA9] bg-blue-50/40 text-[#005CA9]' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <FileText size={22} />
                  <span className="text-xs font-bold">CSV</span>
                </button>

              </div>
            </div>

            {/* Kolom yang Disertakan */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kolom yang disertakan</label>
              <div className="grid grid-cols-2 gap-3">
                
                <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={fields.waktu}
                    onChange={() => toggleField('waktu')}
                    className="w-4 h-4 rounded text-[#005CA9] focus:ring-[#005CA9] cursor-pointer"
                  />
                  Waktu
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={fields.aktivitas}
                    onChange={() => toggleField('aktivitas')}
                    className="w-4 h-4 rounded text-[#005CA9] focus:ring-[#005CA9] cursor-pointer"
                  />
                  Aktivitas
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={fields.jenis}
                    onChange={() => toggleField('jenis')}
                    className="w-4 h-4 rounded text-[#005CA9] focus:ring-[#005CA9] cursor-pointer"
                  />
                  Jenis
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={fields.nama}
                    onChange={() => toggleField('nama')}
                    className="w-4 h-4 rounded text-[#005CA9] focus:ring-[#005CA9] cursor-pointer"
                  />
                  Nama & Detail
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={fields.peminjam}
                    onChange={() => toggleField('peminjam')}
                    className="w-4 h-4 rounded text-[#005CA9] focus:ring-[#005CA9] cursor-pointer"
                  />
                  Peminjam
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={fields.unitKerja}
                    onChange={() => toggleField('unitKerja')}
                    className="w-4 h-4 rounded text-[#005CA9] focus:ring-[#005CA9] cursor-pointer"
                  />
                  Unit Kerja
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={fields.rentangWaktu}
                    onChange={() => toggleField('rentangWaktu')}
                    className="w-4 h-4 rounded text-[#005CA9] focus:ring-[#005CA9] cursor-pointer"
                  />
                  Rentang Waktu
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={fields.foto}
                    onChange={() => toggleField('foto')}
                    className="w-4 h-4 rounded text-[#005CA9] focus:ring-[#005CA9] cursor-pointer"
                  />
                  Foto
                </label>

              </div>
            </div>

          </div>

          {/* Footer Buttons */}
          <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmExport}
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#005CA9] text-white text-xs font-bold rounded-xl hover:bg-[#004B8A] transition-colors cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <Download size={14} /> Ekspor
                </>
              )}
            </button>
          </div>

        </div>
      )}
    </div>
  )
}