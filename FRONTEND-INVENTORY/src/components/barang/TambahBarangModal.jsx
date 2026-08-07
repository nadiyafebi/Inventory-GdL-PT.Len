import { useState } from 'react'
import { X, ChevronDown, Image as ImageIcon, FileText, FileCheck, Trash2 } from 'lucide-react'
import { PROGRAM_OPTIONS, STATUS_OPTIONS, KONDISI_OPTIONS } from '../../utils/constants.js'

const API_BASE = 'http://172.20.10.8:5000/api'

export default function TambahBarangModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    tanggalTransaksi: '',
    hargaAset: '',
    nama: '',
    penanggungJawab: '',
    merk: '',
    lokasi: '',
    tipe: '',
    program: PROGRAM_OPTIONS[0] || '',
    kode: '',
    status: STATUS_OPTIONS[0] || 'Disimpan',
    nomorInventarisGa: '',
    kondisi: KONDISI_OPTIONS[0] || 'Baru',
    serialNumber: '',
    quantity: 1,
    partNumber: '',
  })

  const [pendingFoto, setPendingFoto] = useState([])
  const [pendingManualBook, setPendingManualBook] = useState([])
  const [pendingDokumentasi, setPendingDokumentasi] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showKondisiDropdown, setShowKondisiDropdown] = useState(false)
  const [showProgramDropdown, setShowProgramDropdown] = useState(false)

  if (!isOpen) return null

  const closeAllDropdowns = () => {
    setShowStatusDropdown(false)
    setShowKondisiDropdown(false)
    setShowProgramDropdown(false)
  }

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

  const handleAddDokumentasi = (e) => {
    const files = Array.from(e.target.files || [])
    setPendingDokumentasi(prev => [...prev, ...files])
    e.target.value = ''
  }

  const removePendingFoto = (idx) => {
    setPendingFoto(prev => prev.filter((_, i) => i !== idx))
  }

  const removePendingManualBook = (idx) => {
    setPendingManualBook(prev => prev.filter((_, i) => i !== idx))
  }

  const removePendingDokumentasi = (idx) => {
    setPendingDokumentasi(prev => prev.filter((_, i) => i !== idx))
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

    if (pendingDokumentasi.length > 0) {
      const fd = new FormData()
      pendingDokumentasi.forEach(file => fd.append('dokumentasiTransaksi', file))
      await fetch(`${API_BASE}/barang/${barangId}/dokumentasi-transaksi`, {
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

  const Field = ({ label, children }) => (
    <div className="flex flex-col gap-1">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  )

  const FileRow = ({ label, icon, files, onAdd, onRemove, accept }) => (
    <div className="flex flex-col gap-1.5">
      <label className={`${labelClass} flex items-center gap-1`}>{icon} {label}</label>
      {files.length > 0 && (
        <div className="flex flex-col gap-1 mb-1">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
              <span className="text-[10px] text-gray-600 font-medium truncate">{file.name}</span>
              <button type="button" onClick={() => onRemove(idx)} className="text-red-500 hover:text-red-700 cursor-pointer shrink-0 ml-2">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3">
        <label className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#005CA9] text-[10px] font-bold rounded-lg border border-blue-200 cursor-pointer transition-colors shrink-0">
          Pilih File
          <input type="file" accept={accept} multiple onChange={onAdd} className="hidden" />
        </label>
        <span className="text-[10px] text-gray-500 font-medium truncate">
          {files.length === 0 ? 'Tidak ada file yang dipilih' : `${files.length} file dipilih`}
        </span>
      </div>
    </div>
  )

  const Dropdown = ({ label, value, options, isOpen, onToggle, onSelect, zIndex }) => (
    <div className={`flex flex-col gap-1 relative overflow-visible ${zIndex}`}>
      <label className={labelClass}>{label}</label>
      <button type="button"
        onClick={onToggle}
        className="w-full text-xs px-3 py-2.5 bg-[#EAEAEA] border-none rounded-lg focus:outline-none font-medium text-gray-700 text-left flex justify-between items-center cursor-pointer select-none">
        <span>{value || `Pilih ${label}`}</span>
        <ChevronDown size={14} className="text-gray-500" />
      </button>
      {isOpen && (
        <div className="absolute left-0 right-0 top-[56px] bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2.5 flex flex-col gap-1.5 max-h-40 overflow-y-auto select-none">
          {options.map((opt) => (
            <div key={opt} onClick={() => onSelect(opt)}
              className="w-full text-center px-2 py-1.5 text-[11px] font-bold text-white bg-[#005CA9] rounded-full cursor-pointer hover:bg-[#004B8A] transition-colors truncate">
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-[20px] shadow-2xl p-6 w-full max-w-[820px] flex flex-col gap-4 relative overflow-visible max-h-[90vh]">

        <div className="flex justify-center items-center w-full border-b border-gray-100 pb-3 relative">
          <h2 className="text-base font-bold text-gray-900 tracking-wide">Tambah Barang</h2>
          <button type="button" onClick={onClose}
            className="absolute right-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto max-h-[75vh] pr-1">

          {/* ===== GRID 2 KOLOM ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">

            <Field label="Tanggal Transaksi">
              <input type="date" name="tanggalTransaksi" value={form.tanggalTransaksi} onChange={handleChange} className={inputClass} />
            </Field>

            <Field label="Harga Aset">
              <input type="number" min="0" name="hargaAset" value={form.hargaAset} onChange={handleChange}
                placeholder="Rp.0" className={inputClass} />
            </Field>

            <Field label="Nama Barang *">
              <input type="text" name="nama" required value={form.nama} onChange={handleChange}
                placeholder="Masukkan nama barang" className={inputClass} />
            </Field>

            <Field label="Penanggung Jawab">
              <input type="text" name="penanggungJawab" value={form.penanggungJawab} onChange={handleChange}
                placeholder="Nama penanggung jawab barang" className={inputClass} />
            </Field>

            <Field label="Merk">
              <input type="text" name="merk" value={form.merk} onChange={handleChange} className={inputClass} />
            </Field>

            <Field label="Lokasi">
              <input type="text" name="lokasi" value={form.lokasi} onChange={handleChange} className={inputClass} />
            </Field>

            <Field label="Tipe">
              <input type="text" name="tipe" value={form.tipe} onChange={handleChange} className={inputClass} />
            </Field>

            <Dropdown
              label="Program/Project"
              value={form.program}
              options={PROGRAM_OPTIONS}
              isOpen={showProgramDropdown}
              onToggle={() => { closeAllDropdowns(); setShowProgramDropdown(v => !v) }}
              onSelect={(prog) => { setForm(prev => ({ ...prev, program: prog })); setShowProgramDropdown(false) }}
              zIndex="z-40"
            />

            <Field label="Kode">
              <input type="text" name="kode" value={form.kode} onChange={handleChange} className={inputClass} />
            </Field>

            <Dropdown
              label="Status"
              value={form.status}
              options={STATUS_OPTIONS}
              isOpen={showStatusDropdown}
              onToggle={() => { closeAllDropdowns(); setShowStatusDropdown(v => !v) }}
              onSelect={(st) => { setForm(prev => ({ ...prev, status: st })); setShowStatusDropdown(false) }}
              zIndex="z-30"
            />

            <Field label="No Inventaris GA">
              <input type="text" name="nomorInventarisGa" value={form.nomorInventarisGa} onChange={handleChange} className={inputClass} />
            </Field>

            <Dropdown
              label="Kondisi"
              value={form.kondisi}
              options={KONDISI_OPTIONS}
              isOpen={showKondisiDropdown}
              onToggle={() => { closeAllDropdowns(); setShowKondisiDropdown(v => !v) }}
              onSelect={(kond) => { setForm(prev => ({ ...prev, kondisi: kond })); setShowKondisiDropdown(false) }}
              zIndex="z-20"
            />

            <Field label="Serial Number">
              <input type="text" name="serialNumber" value={form.serialNumber} onChange={handleChange} className={inputClass} />
            </Field>

            <Field label="Quantity">
              <input type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange} className={inputClass} />
            </Field>

            <Field label="Part Number">
              <input type="text" name="partNumber" value={form.partNumber} onChange={handleChange} className={inputClass} />
            </Field>

          </div>

          {/* ===== UPLOAD FILES ===== */}
          <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
            <FileRow
              label="Foto Barang"
              icon={<ImageIcon size={12} />}
              files={pendingFoto}
              onAdd={handleAddFoto}
              onRemove={removePendingFoto}
              accept="image/*"
            />
            <FileRow
              label="Foto Manual Book"
              icon={<FileText size={12} />}
              files={pendingManualBook}
              onAdd={handleAddManualBook}
              onRemove={removePendingManualBook}
              accept="application/pdf,image/*"
            />
            <FileRow
              label="Foto Dokumentasi Transaksi"
              icon={<FileCheck size={12} />}
              files={pendingDokumentasi}
              onAdd={handleAddDokumentasi}
              onRemove={removePendingDokumentasi}
              accept="application/pdf,image/*"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100 mt-1">
            <button type="button" onClick={onClose}
              className="px-5 py-2 bg-[#E5E5E5] hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer">
              Batal
            </button>
            <button type="submit" disabled={submitting}
              className="px-6 py-2 bg-[#005CA9] hover:bg-[#004B8A] text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-60">
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}