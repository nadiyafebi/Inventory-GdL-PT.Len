import { useState, useEffect } from 'react'
import { X, Pencil, FileText } from 'lucide-react'

const API_BASE = 'http://172.16.13.53:5000'
const API = 'http://172.16.13.53:5000/api'

export default function DetailBarangModal({ isOpen, onClose, data, onEdit }) {
  const [fotoList, setFotoList] = useState([])
  const [manualBookList, setManualBookList] = useState([])

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (isOpen && data?.id) {
      fetch(`${API}/barang/${data.id}/foto`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(result => { if (result.success) setFotoList(result.data) })
        .catch(err => console.error('Gagal ambil foto:', err))

      fetch(`${API}/barang/${data.id}/manual-book`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(result => { if (result.success) setManualBookList(result.data) })
        .catch(err => console.error('Gagal ambil manual book:', err))
    } else {
      setFotoList([])
      setManualBookList([])
    }
  }, [isOpen, data]);

  if (!isOpen || !data) return null

  const getFotoUrl = (path) => path ? `${API_BASE}${path}` : null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-scaleUp">
        
        <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-start">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">
              DETAIL INFORMASI BARANG
            </p>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {data.nama || '-'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer pt-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
          <DetailRow label="Quantity (Qty)" value={data.quantity} />
          <DetailRow label="Program" value={data.program} />
          <DetailRow label="Merk" value={data.merk} />
          <DetailRow label="Tipe" value={data.tipe} />
          <DetailRow label="Kode Barang" value={data.kode} />
          <DetailRow label="Serial Number" value={data.serialNumber} />
          <DetailRow label="Part Number" value={data.partNumber} />
          <DetailRow label="Nomor Inventaris GA" value={data.nomorInventarisGa} />
          <DetailRow label="Penanggung Jawab" value={data.penanggungJawab} />

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-400 font-medium">Status</span>
            <span className="px-3 py-1 bg-[#005CA9] text-white font-bold rounded-full text-[10px]">
              {data.status || '-'}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-400 font-medium">Kondisi</span>
            <span className="px-3 py-1 bg-[#005CA9] text-white font-bold rounded-full text-[10px]">
              {data.kondisi || '-'}
            </span>
          </div>

          <DetailRow label="Lokasi" value={data.lokasi} />

          {/* ===== GALERI FOTO BARANG ===== */}
          <div className="flex flex-col gap-2 pt-2">
            <span className="text-gray-400 font-medium">Foto Barang ({fotoList.length})</span>
            {fotoList.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {fotoList.map((f) => (
                  <a key={f.id} href={getFotoUrl(f.file_path)} target="_blank" rel="noreferrer"
                    className="w-full aspect-square bg-gray-50 border border-gray-200 rounded-xl overflow-hidden block">
                    <img src={getFotoUrl(f.file_path)} alt="foto barang" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="w-full h-24 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center">
                <span className="text-[11px] text-gray-400 italic">Tidak ada foto</span>
              </div>
            )}
          </div>

          {/* ===== MANUAL BOOK ===== */}
          <div className="flex flex-col gap-2 pt-2">
            <span className="text-gray-400 font-medium">Manual Book ({manualBookList.length})</span>
            {manualBookList.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {manualBookList.map((m) => (
                  <a key={m.id} href={getFotoUrl(m.file_path)} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-100 transition-colors">
                    <FileText size={14} className="text-[#005CA9] shrink-0" />
                    <span className="text-[11px] text-[#005CA9] font-medium truncate">
                      {m.file_path.split('/').pop()}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="w-full h-16 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center">
                <span className="text-[11px] text-gray-400 italic">Tidak ada manual book</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex gap-2 bg-white">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors cursor-pointer text-xs shadow-xs"
          >
            Tutup
          </button>
          <button
            onClick={() => { onClose(); onEdit(data); }}
            className="flex-1 py-3 bg-[#005CA9] text-white font-bold rounded-2xl hover:bg-[#004B8A] transition-colors cursor-pointer text-xs shadow-xs flex items-center justify-center gap-1.5"
          >
            <Pencil size={14} /> Edit Barang
          </button>
        </div>

      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-gray-400 font-medium">{label}</span>
      <span className="text-gray-800 font-bold text-right">{value || '-'}</span>
    </div>
  )
}