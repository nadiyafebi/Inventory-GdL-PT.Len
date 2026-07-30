import { useState } from 'react'
import { X, ChevronDown, Check, Upload, Image as ImageIcon, FileText, Trash2 } from 'lucide-react'
import { PROGRAM_OPTIONS, STATUS_OPTIONS, KONDISI_OPTIONS } from '../../utils/constants.js'

const API_BASE = 'http://172.16.10.176:5000/api'

export default function TambahBarangModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    nama: '',
    merk: '',
    tipe: '',
    kode: '',
    nomorInventarisGa: '',
    serialNumber: '',
    partNumber: '',
    penanggungJawab: '',
    lokasi: '',
    program: PROGRAM_OPTIONS[0] || '',
    status: STATUS_OPTIONS[0] || 'Dibeli',
    kondisi: KONDISI_OPTIONS[0] || 'Baru',
    quantity: 1,
  })

  const [pendingFoto, setPendingFoto] = useState([])
  const [pendingManualBook, setPendingManualBook] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showKondisiDropdown, setShowKondisiDropdown] = useState(false)
  const [showProgramDropdown, setShowProgramDropdown] = useState(false)

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAddFoto = (e) => {
    const files = Array.from(e.target.files || [])
    setPendingFoto(prev => [...prev, ...files])
    e.target.value = ''
  }

  const handleAddManualBook = (e) => {
    const files = Array.from(e.target.files || [])
    setPendingManualBook(prev => [...prev, ...files])
    e.target.value = ''
  }

  const removePendingFoto = (idx) => {
    setPendingFoto(prev => prev.filter((_, i) => i !== idx))
  }

  const removePendingManualBook = (idx) => {
    setPendingManualBook(prev => prev.filter((_, i) => i !== idx))
  }

  const uploadPendingFiles = async (barangId) => {
    const token = localStorage.getItem('token')

    if (pendingFoto.length > 0) {
      const fd = new FormData()
      pendingFoto.forEach(file => fd.append('foto', file))
      await fetch(`${API_BASE}/barang/${barangId}/foto`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      })
    }

    if (pendingManualBook.length > 0) {
      const fd = new FormData()
      pendingManualBook.forEach(file => fd.append('manualBook', file))
      await fetch(`${API_BASE}/barang/${barangId}/manual-book`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const newId = await onSubmit(form) // parent membuat barang, mengembalikan id
      if (newId) {
        await uploadPendingFiles(newId)
      }
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full text-xs px-3 py-2.5 bg-[#EAEAEA] border-none rounded-lg focus:outline-none font-medium text-gray-700'
  const labelClass = 'text-[11px] font-medium text-gray-400'

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-[20px] shadow-2xl p-6 w-full max-w-[460px] flex flex-col gap-4 relative overflow-visible max-h-[90vh]">

        <div className="flex justify-between items-center w-full border-b border-gray-100 pb-2">
          <h2 className="text-base font-bold text-gray-900 tracking-wide">Tambah Barang Baru</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 overflow-y-auto max-h-[70vh] pr-1">

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Nama Barang *</label>
            <input type="text" name="nama" required value={form.nama} onChange={handleChange}
              placeholder="Masukkan nama barang" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Merk</label>
            <input type="text" name="merk" value={form.merk} onChange={handleChange} className={inputClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Tipe</label>
            <input type="text" name="tipe" value={form.tipe} onChange={handleChange} className={inputClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Kode Barang</label>
            <input type="text" name="kode" value={form.kode} onChange={handleChange} className={inputClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>No Inventaris GA</label>
            <input type="text" name="nomorInventarisGa" value={form.nomorInventarisGa} onChange={handleChange} className={inputClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Serial Number</label>
            <input type="text" name="serialNumber" value={form.serialNumber} onChange={handleChange} className={inputClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Part Number</label>
            <input type="text" name="partNumber" value={form.partNumber} onChange={handleChange} className={inputClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Penanggung Jawab</label>
            <input type="text" name="penanggungJawab" value={form.penanggungJawab} onChange={handleChange}
              placeholder="Nama penanggung jawab barang" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Lokasi</label>
            <input type="text" name="lokasi" value={form.lokasi} onChange={handleChange} className={inputClass} />
          </div>

          <div className="flex flex-col gap-1 relative overflow-visible z-40">
            <label className={labelClass}>Program / Project</label>
            <button type="button"
              onClick={() => { setShowProgramDropdown(!showProgramDropdown); setShowStatusDropdown(false); setShowKondisiDropdown(false); }}
              className="w-full text-xs px-3 py-2.5 bg-[#EAEAEA] border-none rounded-lg focus:outline-none font-medium text-gray-700 text-left flex justify-between items-center cursor-pointer select-none">
              <span>{form.program || 'Pilih Program'}</span>
              <ChevronDown size={14} className="text-gray-500" />
            </button>
            {showProgramDropdown && (
              <div className="absolute left-0 right-0 top-[56px] bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2.5 flex flex-col gap-1.5 max-h-40 overflow-y-auto select-none">
                {PROGRAM_OPTIONS.map((prog) => (
                  <div key={prog} onClick={() => { setForm(prev => ({ ...prev, program: prog })); setShowProgramDropdown(false); }}
                    className="w-full text-center px-2 py-1.5 text-[11px] font-bold text-white bg-[#005CA9] rounded-full cursor-pointer hover:bg-[#004B8A] transition-colors truncate">
                    {prog}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 relative overflow-visible z-30">
            <label className={labelClass}>Status</label>
            <button type="button"
              onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowProgramDropdown(false); setShowKondisiDropdown(false); }}
              className="w-full text-xs px-3 py-2.5 bg-[#EAEAEA] border-none rounded-lg focus:outline-none font-medium text-gray-700 text-left flex justify-between items-center cursor-pointer select-none">
              <span>{form.status}</span>
              <ChevronDown size={14} className="text-gray-500" />
            </button>
            {showStatusDropdown && (
              <div className="absolute left-0 right-0 top-[56px] bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2.5 flex flex-col gap-1.5 max-h-40 overflow-y-auto select-none">
                {STATUS_OPTIONS.map((st) => (
                  <div key={st} onClick={() => { setForm(prev => ({ ...prev, status: st })); setShowStatusDropdown(false); }}
                    className="w-full text-center px-4 py-1.5 text-[11px] font-bold text-white bg-[#005CA9] rounded-full cursor-pointer hover:bg-[#004B8A] transition-colors">
                    {st}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 relative overflow-visible z-20">
            <label className={labelClass}>Kondisi</label>
            <button type="button"
              onClick={() => { setShowKondisiDropdown(!showKondisiDropdown); setShowProgramDropdown(false); setShowStatusDropdown(false); }}
              className="w-full text-xs px-3 py-2.5 bg-[#EAEAEA] border-none rounded-lg focus:outline-none font-medium text-gray-700 text-left flex justify-between items-center cursor-pointer select-none">
              <span>{form.kondisi || 'Pilih Kondisi'}</span>
              <ChevronDown size={14} className="text-gray-500" />
            </button>
            {showKondisiDropdown && (
              <div className="absolute left-0 right-0 top-[56px] bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2.5 flex flex-col gap-1.5 max-h-36 overflow-y-auto select-none">
                {KONDISI_OPTIONS.map((kond) => (
                  <div key={kond} onClick={() => { setForm(prev => ({ ...prev, kondisi: kond })); setShowKondisiDropdown(false); }}
                    className="w-full text-center px-4 py-1.5 text-[11px] font-bold text-white bg-[#005CA9] rounded-full cursor-pointer hover:bg-[#004B8A] transition-colors">
                    {kond}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Quantity</label>
            <input type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange} className={inputClass} />
          </div>

          {/* ===== FOTO BARANG (galeri, banyak foto) ===== */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100">
            <label className={`${labelClass} flex items-center gap-1`}><ImageIcon size={12} /> Foto Barang</label>
            {pendingFoto.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-1">
                {pendingFoto.map((file, idx) => (
                  <div key={idx} className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePendingFoto(idx)}
                      className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 cursor-pointer">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input type="file" accept="image/*" multiple onChange={handleAddFoto}
              className="text-[10px] text-gray-500 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-[#005CA9] hover:file:bg-blue-100 cursor-pointer" />
          </div>

          {/* ===== MANUAL BOOK (PDF/foto, banyak file) ===== */}
          <div className="flex flex-col gap-1.5">
            <label className={`${labelClass} flex items-center gap-1`}><FileText size={12} /> Manual Book</label>
            {pendingManualBook.length > 0 && (
              <div className="flex flex-col gap-1 mb-1">
                {pendingManualBook.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                    <span className="text-[10px] text-gray-600 font-medium truncate">{file.name}</span>
                    <button type="button" onClick={() => removePendingManualBook(idx)} className="text-red-500 hover:text-red-700 cursor-pointer">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input type="file" accept="application/pdf,image/*" multiple onChange={handleAddManualBook}
              className="text-[10px] text-gray-500 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-[#005CA9] hover:file:bg-blue-100 cursor-pointer" />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100 mt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2 bg-[#E5E5E5] hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer">
              Batal
            </button>
            <button type="submit" disabled={submitting}
              className="px-6 py-2 bg-[#005CA9] hover:bg-[#004B8A] text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-60">
              {submitting ? 'Menyimpan...' : 'Simpan Barang'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}