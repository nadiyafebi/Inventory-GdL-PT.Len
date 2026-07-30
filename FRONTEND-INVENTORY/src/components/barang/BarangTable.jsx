import { Edit2, Trash2, Image as ImageIcon, FileText } from 'lucide-react'

const FILE_BASE = 'http://172.16.10.176:5000'

export default function BarangTable({ data, selected, onToggleSelect, onEdit, onDelete, onDetail, allSelected, onToggleSelectAll }) {
  const formatTanggal = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID')
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 bg-gray-50/50">
            <th className="p-4 w-10 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                className="accent-[#005CA9] cursor-pointer"
              />
            </th>
            <th className="p-4">Tanggal Transaksi</th>
            <th className="p-4">Gambar Barang</th>
            <th className="p-4">Gambar Manual Book</th>
            <th className="p-4">Nama Barang</th>
            <th className="p-4">Merk</th>
            <th className="p-4">Tipe</th>
            <th className="p-4">Kode Barang</th>
            <th className="p-4">No Inventaris GA</th>
            <th className="p-4">Serial Number</th>
            <th className="p-4">Part Number</th>
            <th className="p-4">Penanggung Jawab</th>
            <th className="p-4">Lokasi</th>
            <th className="p-4">Program/Project</th>
            <th className="p-4">Status</th>
            <th className="p-4">Kondisi</th>
            <th className="p-4">Quantity</th>
            <th className="p-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">

              <td className="p-4 text-center">
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={() => onToggleSelect(item.id)}
                  className="accent-[#005CA9] cursor-pointer"
                />
              </td>

              <td onClick={() => onDetail(item)} className="p-4 text-gray-500 text-xs cursor-pointer">
                {formatTanggal(item.updatedAt)}
              </td>

              {/* Gambar Barang */}
              <td onClick={() => onDetail(item)} className="p-4 cursor-pointer">
                {item.fotoUtama ? (
                  <img src={`${FILE_BASE}${item.fotoUtama}`} alt="foto barang"
                    className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                    <ImageIcon size={16} />
                  </div>
                )}
              </td>

              {/* Gambar Manual Book */}
              <td onClick={() => onDetail(item)} className="p-4 cursor-pointer">
                {item.manualBookUtama ? (
                  item.manualBookUtama.toLowerCase().endsWith('.pdf') ? (
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-400">
                      <FileText size={16} />
                    </div>
                  ) : (
                    <img src={`${FILE_BASE}${item.manualBookUtama}`} alt="manual book"
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                  )
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                    <FileText size={16} />
                  </div>
                )}
              </td>

              <td onClick={() => onDetail(item)} className="p-4 font-semibold text-gray-800 text-xs cursor-pointer">{item.nama}</td>
              <td onClick={() => onDetail(item)} className="p-4 text-gray-600 text-xs cursor-pointer">{item.merk || '-'}</td>
              <td onClick={() => onDetail(item)} className="p-4 text-gray-600 text-xs cursor-pointer">{item.tipe || '-'}</td>
              <td onClick={() => onDetail(item)} className="p-4 text-gray-600 text-xs cursor-pointer">{item.kode || '-'}</td>
              <td onClick={() => onDetail(item)} className="p-4 text-gray-600 text-xs cursor-pointer">{item.nomorInventarisGa || '-'}</td>
              <td onClick={() => onDetail(item)} className="p-4 text-gray-600 text-xs cursor-pointer">{item.serialNumber || '-'}</td>
              <td onClick={() => onDetail(item)} className="p-4 text-gray-600 text-xs cursor-pointer">{item.partNumber || '-'}</td>
              <td onClick={() => onDetail(item)} className="p-4 text-gray-600 text-xs cursor-pointer">{item.penanggungJawab || '-'}</td>
              <td onClick={() => onDetail(item)} className="p-4 text-gray-600 text-xs cursor-pointer">{item.lokasi || '-'}</td>
              <td onClick={() => onDetail(item)} className="p-4 text-gray-600 text-xs cursor-pointer">{item.program || '-'}</td>

              <td onClick={() => onDetail(item)} className="p-4 cursor-pointer">
                <span className="px-3 py-1 bg-[#005CA9] text-white text-[10px] font-bold rounded-full">{item.status}</span>
              </td>

              <td onClick={() => onDetail(item)} className="p-4 cursor-pointer">
                <span className="px-3 py-1 bg-[#005CA9] text-white text-[10px] font-bold rounded-full">{item.kondisi}</span>
              </td>

              <td onClick={() => onDetail(item)} className="p-4 text-gray-600 text-xs cursor-pointer">{item.quantity}</td>

              <td className="p-4 text-center">
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => onEdit(item)} className="text-[#005CA9] hover:text-blue-800 cursor-pointer">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => onDelete(item)} className="text-red-500 hover:text-red-700 cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}