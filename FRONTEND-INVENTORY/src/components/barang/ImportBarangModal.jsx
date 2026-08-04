import { useState } from 'react'
import { X, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react'

const API_BASE = 'http://172.16.13.165:5000/api'

export default function ImportBarangModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState(false)

  if (!isOpen) return null

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setErrorMessage('')
    }
  }

  const handleImport = async () => {
    if (!file) {
      setErrorMessage('Pilih file terlebih dahulu sebelum mengimpor.')
      return
    }

    setLoading(true)
    setErrorMessage('')

    const token = localStorage.getItem('token')
    const formData = new FormData()
    // Sesuaikan nama key 'file' dengan yang diminta oleh backend Anda (misal: 'file', 'excel', atau 'data')
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/barang/import/direct`, {
        method: 'POST',
        headers: {
          // PENTING: Jangan tambahkan 'Content-Type': 'application/json' saat menggunakan FormData
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Gagal mengimpor data dari file.')
      }

      setSuccessMessage(true)
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error(err)
      setErrorMessage(err.message || 'Gagal terhubung ke server. Pastikan backend menyala.')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseAll = () => {
    setFile(null)
    setErrorMessage('')
    setSuccessMessage(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      {successMessage ? (
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center text-center gap-6 animate-scaleUp">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
            <Check size={36} strokeWidth={3} />
          </div>
          <p className="text-gray-800 font-bold text-base">
            Data barang berhasil diimpor!
          </p>
          <button
            type="button"
            onClick={handleCloseAll}
            className="w-full py-3 bg-[#005CA9] text-white text-xs font-bold rounded-2xl hover:bg-[#004B8A] transition-colors cursor-pointer shadow-md"
          >
            OK
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-scaleUp">
          
          {/* Header */}
          <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900">Import Data Barang</h2>
            <button onClick={handleCloseAll} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-4">
            <p className="text-xs text-gray-500">
              Unggah file Excel (.xlsx), CSV, atau PDF untuk menambahkan banyak barang sekaligus.
            </p>

            {/* Area Drag & Drop / Pilih File */}
            <label className="border-2 border-dashed border-gray-200 hover:border-[#005CA9] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-gray-50/50 cursor-pointer transition-colors">
              <div className="w-12 h-12 bg-blue-50 text-[#005CA9] rounded-full flex items-center justify-center">
                <FileSpreadsheet size={24} />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-gray-700">
                  {file ? file.name : 'Klik untuk memilih file'}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Format: .xlsx, .xls, atau .csv
                </p>
              </div>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Pesan Error jika ada */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-[11px] font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
            <button
              type="button"
              onClick={handleCloseAll}
              className="px-5 py-2.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={loading}
              className="px-6 py-2.5 bg-[#005CA9] text-white text-xs font-bold rounded-xl hover:bg-[#004B8A] transition-colors cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Mengimpor...' : (
                <>
                  <Upload size={14} /> Mengimpor...
                </>
              )}
            </button>
          </div>

        </div>
      )}
    </div>
  )
}