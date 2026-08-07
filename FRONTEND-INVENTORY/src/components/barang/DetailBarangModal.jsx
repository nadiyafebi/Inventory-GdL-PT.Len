import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'

const API_BASE = 'http://172.16.13.82:5000'
const API = 'http://172.16.13.82:5000/api'

export default function DetailBarangModal({ isOpen, onClose, data, onEdit }) {
  const [fotoList, setFotoList] = useState([])
  const [manualBookList, setManualBookList] = useState([])
  const [dokumentasiList, setDokumentasiList] = useState([])

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

      fetch(`${API}/barang/${data.id}/dokumentasi-transaksi`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(result => { if (result.success) setDokumentasiList(result.data) })
        .catch(err => console.error('Gagal ambil dokumentasi transaksi:', err))
    } else {
      setFotoList([])
      setManualBookList([])
      setDokumentasiList([])
    }
  }, [isOpen, data]);

  if (!isOpen || !data) return null

  const getFotoUrl = (path) => path ? `${API_BASE}${path}` : null

  const formatTanggal = (val) => {
    if (val === null || val === undefined || val === '') return '-'
    const d = new Date(val)
    if (isNaN(d)) return val
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const formatRupiah = (val) => {
    if (val === null || val === undefined || val === '') return '-'
    const num = Number(val)
    if (isNaN(num)) return val
    return 'Rp ' + num.toLocaleString('id-ID')
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-6 pt-6 pb-3">
          <h2 className="text-[15px] font-bold text-gray-900">Detail Barang</h2>
          <p className="text-[15px] font-bold text-gray-900">
            {data.namaBarang || data.nama || '-'}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 pb-5 overflow-y-auto flex flex-col gap-2 text-[13px]">
          <DetailRow label="Tanggal Transaksi" value={formatTanggal(data.tanggalTransaksi)} />
          <DetailRow label="Nama Barang" value={data.namaBarang || data.nama} />
          <DetailRow label="Merk" value={data.merk} />
          <DetailRow label="Tipe" value={data.tipe} />
          <DetailRow label="Kode Barang" value={data.kode} />
          <DetailRow label="No Inventaris GA" value={data.nomorInventarisGa} />
          <DetailRow label="Serial Number" value={data.serialNumber} />
          <DetailRow label="Part Number" value={data.partNumber} />
          <DetailRow label="Harga Aset" value={formatRupiah(data.hargaAset)} />
          <DetailRow label="Penanggung Jawab" value={data.penanggungJawab} />
          <DetailRow label="Lokasi" value={data.lokasi} />
          <DetailRow label="Program/Project" value={data.program} />
          <DetailRow label="Status" value={data.status} />
          <DetailRow label="Kondisi" value={data.kondisi} />
          <DetailRow label="Kuantitas" value={data.quantity} />

          {/* ===== GAMBAR BARANG & DOKUMENTASI TRANSAKSI ===== */}
          <div className="pt-2">
            <div className="grid grid-cols-[130px_1fr] gap-4">
              <span className="text-gray-500 shrink-0">Gambar Barang</span>
              <span className="text-gray-500 text-left">Gambar Dokumentasi Transaksi</span>
            </div>
            <div className="grid grid-cols-[130px_1fr] gap-4 mt-2">
              {/* Kolom kiri: Foto Barang */}
              <div>
                {fotoList.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {fotoList.map((f) => (
                      <a key={f.id} href={getFotoUrl(f.file_path)} target="_blank" rel="noreferrer"
                        className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden block shrink-0">
                        <img src={getFotoUrl(f.file_path)} alt="foto barang" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-[11px] text-gray-400 text-center px-2 leading-tight">Tidak ada foto</span>
                  </div>
                )}
              </div>

              {/* Kolom kanan: Dokumentasi Transaksi */}
              <div>
                {dokumentasiList.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {dokumentasiList.map((d) => (
                      <a key={d.id} href={getFotoUrl(d.file_path)} target="_blank" rel="noreferrer"
                        className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden block shrink-0">
                        <img src={getFotoUrl(d.file_path)} alt="dokumentasi transaksi" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-[11px] text-gray-400 text-center px-2 leading-tight">Tidak ada foto</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== MANUAL BOOK ===== */}
          <div className="pt-2">
            <span className="text-gray-500">Gambar Manual Book</span>
            <div className="flex justify-start mt-2">
              {manualBookList.length > 0 ? (
                <div className="flex flex-col gap-1.5 items-start">
                  {manualBookList.map((m) => {
                    const isImage = /\.(jpe?g|png|gif|webp)$/i.test(m.file_path)
                    return (
                      <a key={m.id} href={getFotoUrl(m.file_path)} target="_blank" rel="noreferrer">
                        {isImage ? (
                          <img src={getFotoUrl(m.file_path)} alt="manual book"
                            className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                        ) : (
                          <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1">
                            <FileText size={20} className="text-[#005CA9]" />
                            <span className="text-[9px] text-[#005CA9] font-medium truncate w-full text-center px-1">
                              {m.file_path.split('/').pop()}
                            </span>
                          </div>
                        )}
                      </a>
                    )
                  })}
                </div>
              ) : (
                <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
                  <span className="text-[11px] text-gray-400 text-center px-2 leading-tight">Tidak ada file</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors cursor-pointer text-[13px]"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  const isEmpty = value === null || value === undefined || value === ''
  return (
    <div className="grid grid-cols-[130px_1fr] gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-900 font-medium text-left">
        {isEmpty ? '-' : value}
      </span>
    </div>
  )
}