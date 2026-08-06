import { useState, useEffect } from 'react'
import { Search, Download, Upload, Plus, ChevronDown, RotateCcw, X, Check, AlertTriangle } from 'lucide-react'
import Sidebar from '../../components/common/Sidebar.jsx'
import BarangTable from '../../components/barang/BarangTable.jsx'
import TambahBarangModal from '../../components/barang/TambahBarangModal.jsx'
import EditBarangModal from '../../components/barang/EditBarangModal.jsx'
import EksporBarangModal from '../../components/barang/EksporBarangModal.jsx'
import ImportBarangModal from '../../components/barang/ImportBarangModal.jsx'
import DetailBarangModal from '../../components/barang/DetailBarangModal.jsx'
import { PROGRAM_OPTIONS, STATUS_OPTIONS } from '../../utils/constants.js'

const API_BASE = 'http://172.16.10.148:5000/api'

export default function MasterBarang() {
  const [barang, setBarang] = useState([])
  const [search, setSearch] = useState('')
  const [programFilter, setProgramFilter] = useState('Semua Program')
  const [statusFilter, setStatusFilter] = useState('Semua Status')
  const [selected, setSelected] = useState([])

  const [showAdd, setShowAdd] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [detailData, setDetailData] = useState(null)

  const [showResetModal, setShowResetModal] = useState(false)
  const [resetStep, setResetStep] = useState(1)

  const [showProgramDropdown, setShowProgramDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  const token = localStorage.getItem('token')

  // ✅ TAMBAHAN: daftar program diambil dari data barang yang benar-benar ada
  const programsFromData = [...new Set(barang.map((b) => b.program).filter(Boolean))]

  const fetchBarang = () => {
    fetch(`${API_BASE}/barang`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setBarang(result.data.map(b => ({
            ...b, id: b.id, kode: b.kodeBarang, nama: b.namaBarang, program: b.programProject
          })))
        }
      })
      .catch(err => console.error('Gagal ambil data:', err))
  }

  useEffect(() => { fetchBarang() }, [])

  const filtered = barang.filter((b) => {
    const matchSearch = (b.nama || '').toLowerCase().includes(search.toLowerCase()) ||
                        (b.serialNumber || '').toLowerCase().includes(search.toLowerCase())
    const matchProgram = programFilter === 'Semua Program' || b.program === programFilter
    const matchStatus = statusFilter === 'Semua Status' || b.status === statusFilter
    return matchSearch && matchProgram && matchStatus
  })

  const allSelected = filtered.length > 0 && filtered.every(b => selected.includes(b.id))

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelected(prev => prev.filter(id => !filtered.some(b => b.id === id)))
    } else {
      setSelected(prev => [...new Set([...prev, ...filtered.map(b => b.id)])])
    }
  }

  const handleAdd = async (form) => {
    try {
      const res = await fetch(`${API_BASE}/barang`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          namaBarang: form.nama,
          programProject: form.program,
          quantity: form.quantity,
          merk: form.merk,
          tipe: form.tipe,
          partNumber: form.partNumber,
          kodeBarang: form.kode,
          serialNumber: form.serialNumber,
          nomorInventarisGa: form.nomorInventarisGa,
          penanggungJawab: form.penanggungJawab,
          status: form.status,
          kondisi: form.kondisi,
          lokasi: form.lokasi,
          catatan: form.catatan
        })
      })

      const result = await res.json()

      if (!result.success) {
        alert(result.message)
        return null
      }

      fetchBarang()
      return result.data.id

    } catch (err) {
      console.error(err)
      alert('Gagal terhubung ke server')
      return null
    }
  }

  const handleEdit = async (form) => {
    try {
      const res = await fetch(`${API_BASE}/barang/${form.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          namaBarang: form.nama,
          programProject: form.program,
          quantity: form.quantity,
          merk: form.merk,
          tipe: form.tipe,
          partNumber: form.partNumber,
          kodeBarang: form.kode,
          serialNumber: form.serialNumber,
          nomorInventarisGa: form.nomorInventarisGa,
          penanggungJawab: form.penanggungJawab,
          status: form.status,
          kondisi: form.kondisi,
          lokasi: form.lokasi,
          catatan: form.catatan
        })
      })

      const result = await res.json()

      if (!result.success) {
        alert(result.message)
        return null
      }

      fetchBarang()
      return form.id

    } catch (err) {
      console.error(err)
      alert('Gagal terhubung ke server')
      return null
    }
  }

  const handleDeleteClick = (row) => setDeleteConfirm(row)

  const executeDelete = async () => {
    if (!deleteConfirm) return
    try {
      const res = await fetch(`${API_BASE}/barang/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await res.json()
      if (!result.success) {
        alert(result.message)
        setDeleteConfirm(null)
        return
      }
      setDeleteConfirm(null)
      fetchBarang()
    } catch (err) {
      console.error(err)
      alert('Gagal terhubung ke server')
      setDeleteConfirm(null)
    }
  }

  const executeResetAll = async () => {
    try {
      const res = await fetch(`${API_BASE}/barang/reset/all`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await res.json()
      if (res.ok) {
        setResetStep(3)
        fetchBarang()
      } else {
        alert(result.message || 'Gagal mereset data')
        setShowResetModal(false)
        setResetStep(1)
      }
    } catch (err) {
      console.error(err)
      alert('Gagal terhubung ke server')
      setShowResetModal(false)
      setResetStep(1)
    }
  }

  const handleExport = async ({ scope, format, fields }) => {
    const fieldMap = {
      'Nama barang': 'namaBarang', 'Qty': 'quantity', 'Program': 'program',
      'Merk': 'merk', 'Tipe': 'tipe', 'Kode': 'kodeBarang',
      'Serial Number': 'serialNumber', 'Part Number': 'partNumber',
      'No Inventaris GA': 'nomorInventarisGa', 'Penanggung Jawab': 'penanggungJawab',
      'Status': 'status', 'Kondisi': 'kondisi', 'Lokasi': 'lokasi', 'Catatan': 'catatan'
    }

    const exactOrder = [
      'Nama barang', 'Qty', 'Program', 'Merk', 'Tipe',
      'Kode', 'Serial Number', 'Part Number', 'No Inventaris GA', 'Penanggung Jawab',
      'Status', 'Kondisi', 'Lokasi', 'Catatan'
    ]

    try {
      const activeFields = exactOrder.filter(f => fields.includes(f))
      const columns = activeFields.map(f => fieldMap[f]).filter(Boolean)
      const ids = scope === 'terpilih' ? selected : []
      const formatKey = format === 'xlsx' ? 'excel' : format

      const res = await fetch(`${API_BASE}/barang/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ format: formatKey, ids, columns })
      })

      if (!res.ok) {
        alert('Gagal export data')
        return
      }

      const blob = await res.blob()
      const ext = formatKey === 'excel' ? 'xlsx' : formatKey
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `master-barang.${ext}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Gagal terhubung ke server')
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#005CA9] text-gray-800 antialiased overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />

      <div className={`
        flex-1 w-full transition-all duration-300 ease-in-out
        md:ml-[288px] md:w-[calc(100%-288px)]
        px-4 sm:px-6 md:px-8 
        py-4 sm:py-6 md:py-8
        flex flex-col gap-4 md:gap-5
      `}>
        {/* Judul - Center di mobile, left di desktop */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-3">
          <h1 className="text-center md:text-left text-lg sm:text-xl font-bold text-white tracking-wide">
            Master Barang
          </h1>
          <div className="hidden md:flex gap-2">
            <button onClick={() => { setResetStep(1); setShowResetModal(true); }} className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-lg shadow-sm text-sm font-semibold hover:bg-red-600 cursor-pointer">
              <RotateCcw size={15} /> Reset Semua Data
            </button>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-800 rounded-lg shadow-sm text-sm font-semibold hover:bg-gray-100 cursor-pointer">
              <Plus size={15} /> Tambah Barang
            </button>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="md:hidden flex flex-wrap gap-2">
          <button onClick={() => { setResetStep(1); setShowResetModal(true); }} className="flex-1 min-w-[80px] flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg shadow-sm text-xs font-semibold hover:bg-red-600 cursor-pointer">
            <RotateCcw size={13} /> Reset
          </button>
          <button onClick={() => setShowAdd(true)} className="flex-1 min-w-[80px] flex items-center justify-center gap-1 px-3 py-2 bg-white text-gray-800 rounded-lg shadow-sm text-xs font-semibold hover:bg-gray-100 cursor-pointer">
            <Plus size={13} /> Tambah
          </button>
          <button onClick={() => setShowImport(true)} className="flex-1 min-w-[70px] flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg shadow-sm text-xs font-semibold hover:bg-gray-200 cursor-pointer">
            <Upload size={13} /> Import
          </button>
          <button onClick={() => setShowExport(true)} className="flex-1 min-w-[70px] flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg shadow-sm text-xs font-semibold hover:bg-gray-200 cursor-pointer">
            <Download size={13} /> Ekspor
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-[2] relative">
            <Search size={16} className="absolute left-4 top-3.5 text-gray-500" />
            <input
              className="w-full pl-11 pr-4 py-3 rounded-full border-0 text-xs font-medium bg-gray-100 focus:outline-none shadow-sm text-gray-700"
              placeholder="Cari berdasarkan nama barang, merek, nomor seri, atau lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative flex-1 min-w-[120px]">
            <button
              onClick={() => { setShowProgramDropdown(!showProgramDropdown); setShowStatusDropdown(false); }}
              className="w-full px-4 sm:px-6 py-3 rounded-full border-0 text-xs font-medium bg-gray-100 text-gray-600 flex items-center justify-between hover:bg-gray-200 cursor-pointer"
            >
              <span className="truncate">{programFilter}</span> <ChevronDown size={16} className="flex-shrink-0" />
            </button>
            {showProgramDropdown && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl z-50 p-4 border border-gray-100 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                <button onClick={() => { setProgramFilter('Semua Program'); setShowProgramDropdown(false); }} className="w-full py-2.5 rounded-full text-xs font-medium text-white bg-[#005CA9] hover:bg-[#004B8A] cursor-pointer">Semua Program</button>
                {/* ✅ DIUBAH: dari PROGRAM_OPTIONS.map(...) menjadi programsFromData.map(...) */}
                {programsFromData.map(p => (
                  <button key={p} onClick={() => { setProgramFilter(p); setShowProgramDropdown(false); }} className="w-full py-2.5 rounded-full text-xs font-medium text-white bg-[#005CA9] hover:bg-[#004B8A] cursor-pointer">{p}</button>
                ))}
              </div>
            )}
          </div>

          <div className="relative flex-1 min-w-[120px]">
            <button
              onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowProgramDropdown(false); }}
              className="w-full px-4 sm:px-6 py-3 rounded-full border-0 text-xs font-medium bg-gray-100 text-gray-600 flex items-center justify-between hover:bg-gray-200 cursor-pointer"
            >
              <span className="truncate">{statusFilter}</span> <ChevronDown size={16} className="flex-shrink-0" />
            </button>
            {showStatusDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl z-50 p-4 border border-gray-100 flex flex-col gap-2 max-h-[400px] overflow-y-auto">
                <button onClick={() => { setStatusFilter('Semua Status'); setShowStatusDropdown(false); }} className="w-full py-2.5 rounded-full text-xs font-medium text-white bg-[#005CA9] hover:bg-[#004B8A] cursor-pointer">Semua Status</button>
                {STATUS_OPTIONS.map(s => (
                  <button key={s} onClick={() => { setStatusFilter(s); setShowStatusDropdown(false); }} className="w-full py-2.5 rounded-full text-xs font-medium text-white bg-[#005CA9] hover:bg-[#004B8A] cursor-pointer">{s}</button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex gap-2">
            <button type="button" onClick={() => setShowImport(true)} className="px-6 py-3 rounded-full bg-gray-100 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-2 cursor-pointer z-10 relative">
              <Upload size={16} /> Import
            </button>
            <button type="button" onClick={() => setShowExport(true)} className="px-6 py-3 rounded-full bg-gray-100 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-2 cursor-pointer z-10 relative">
              <Download size={16} /> Ekspor
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto">
            <BarangTable
              data={filtered}
              selected={selected}
              onToggleSelect={(id) => setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])}
              onEdit={(row) => setEditing(row)}
              onDelete={handleDeleteClick}
              onDetail={(row) => setDetailData(row)}
              allSelected={allSelected}
              onToggleSelectAll={handleToggleSelectAll}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4 text-center">
            <h2 className="text-base font-bold text-gray-900">Konfirmasi Hapus</h2>
            <p className="text-xs text-gray-600 font-medium">Apakah anda yakin untuk menghapus data?</p>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 cursor-pointer">Batal</button>
              <button type="button" onClick={executeDelete} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 cursor-pointer shadow-sm">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center text-center gap-6">
            {resetStep === 1 && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 shadow-inner"><AlertTriangle size={32} /></div>
                <p className="text-gray-800 font-bold text-xs leading-relaxed">PERINGATAN: Ini akan menghapus SEMUA data barang, histori, dan peminjaman. Lanjutkan?</p>
                <div className="flex gap-2 w-full">
                  <button type="button" onClick={() => setShowResetModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 text-xs font-bold rounded-2xl hover:bg-gray-200 transition-colors cursor-pointer">Batal</button>
                  <button type="button" onClick={() => setResetStep(2)} className="flex-1 py-3 bg-red-600 text-white text-xs font-bold rounded-2xl hover:bg-red-700 transition-colors cursor-pointer shadow-md">Lanjutkan</button>
                </div>
              </>
            )}
            {resetStep === 2 && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 shadow-inner"><AlertTriangle size={32} /></div>
                <p className="text-gray-800 font-bold text-xs leading-relaxed">Yakin? Data yang sudah dihapus TIDAK BISA dikembalikan.</p>
                <div className="flex gap-2 w-full">
                  <button type="button" onClick={() => setShowResetModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 text-xs font-bold rounded-2xl hover:bg-gray-200 transition-colors cursor-pointer">Batal</button>
                  <button type="button" onClick={executeResetAll} className="flex-1 py-3 bg-red-600 text-white text-xs font-bold rounded-2xl hover:bg-red-700 transition-colors cursor-pointer shadow-md">OK</button>
                </div>
              </>
            )}
            {resetStep === 3 && (
              <>
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg"><Check size={36} strokeWidth={3} /></div>
                <p className="text-gray-800 font-bold text-xs leading-relaxed">Semua data barang, histori, dan peminjaman berhasil dihapus</p>
                <button type="button" onClick={() => setShowResetModal(false)} className="w-full py-3 bg-[#005CA9] text-white text-xs font-bold rounded-2xl hover:bg-[#004B8A] transition-colors cursor-pointer shadow-md">OK</button>
              </>
            )}
          </div>
        </div>
      )}

      <DetailBarangModal isOpen={!!detailData} onClose={() => setDetailData(null)} data={detailData} onEdit={(row) => setEditing(row)} />
      <EksporBarangModal isOpen={showExport} onClose={() => setShowExport(false)} onExport={handleExport} totalBarang={barang.length} selectedCount={selected.length} />
      <ImportBarangModal isOpen={showImport} onClose={() => setShowImport(false)} onSuccess={() => { setShowImport(false); fetchBarang(); }} />
      <TambahBarangModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAdd} />
      <EditBarangModal isOpen={!!editing} onClose={() => setEditing(null)} initialData={editing} onSubmit={handleEdit} />
    </div>
  )
}