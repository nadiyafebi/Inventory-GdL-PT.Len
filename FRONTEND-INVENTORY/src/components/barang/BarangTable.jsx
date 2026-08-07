import { useState } from 'react'
import { Edit2, Trash2, Image as ImageIcon, MoreHorizontal, ChevronDown } from 'lucide-react'

const FILE_BASE = 'http://172.16.13.82:5000'

export default function BarangTable({ data, selected, onToggleSelect, onEdit, onDelete, onDetail, allSelected, onToggleSelectAll }) {
  const [limit, setLimit] = useState(10)
  const [showLimitDropdown, setShowLimitDropdown] = useState(false)

  const displayed = limit === 'all' ? data : data.slice(0, limit)

  const formatTanggal = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID')
  }

  const LimitDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setShowLimitDropdown(!showLimitDropdown)}
        className="px-4 py-2 rounded-full bg-gray-50 text-xs font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-100 cursor-pointer"
      >
        Tampilkan {limit === 'all' ? 'Semua' : `${limit} Terbaru`} <ChevronDown size={14} />
      </button>
      {showLimitDropdown && (
        <div className="absolute right-0 bottom-full mb-2 w-40 bg-white rounded-2xl shadow-2xl z-50 p-2 border border-gray-100 flex flex-col gap-1">
          {[10, 100, 'all'].map(opt => (
            <button
              key={opt}
              onClick={() => { setLimit(opt); setShowLimitDropdown(false) }}
              className={`w-full py-2 rounded-xl text-xs font-medium text-left px-3 cursor-pointer ${limit === opt ? 'bg-[#005CA9] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {opt === 'all' ? 'Semua Data' : `${opt} Terbaru`}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* ===== MOBILE / TABLET KECIL: Card View ===== */}
      <div className="md:hidden flex flex-col gap-3 p-3">
        <div className="flex items-center gap-2 px-1">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleSelectAll}
            className="accent-[#005CA9] cursor-pointer w-4 h-4"
          />
          <span className="text-xs font-semibold text-gray-500">Pilih Semua</span>
        </div>

        {displayed.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3"
          >
            <div className="flex gap-3">
              <div onClick={() => onDetail(item)} className="cursor-pointer flex-shrink-0">
                {item.fotoUtama ? (
                  <img
                    src={`${FILE_BASE}${item.fotoUtama}`}
                    alt="foto barang"
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                    <ImageIcon size={22} />
                  </div>
                )}
              </div>

              <div onClick={() => onDetail(item)} className="cursor-pointer flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{item.nama}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 truncate">{item.kode || '-'} • {item.program || '-'}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{formatTanggal(item.updatedAt)}</p>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="inline-flex items-center justify-center min-w-[64px] px-2.5 py-1 bg-[#005CA9] text-white text-[10px] font-bold rounded-full text-center">{item.status || '-'}</span>
                  <span className="inline-flex items-center justify-center min-w-[64px] px-2.5 py-1 bg-[#005CA9] text-white text-[10px] font-bold rounded-full text-center">{item.kondisi || '-'}</span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => onToggleSelect(item.id)}
                onClick={(e) => e.stopPropagation()}
                className="accent-[#005CA9] cursor-pointer w-4 h-4 flex-shrink-0 mt-1"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div onClick={() => onDetail(item)} className="cursor-pointer flex items-center gap-3 text-[11px] text-gray-500 min-w-0">
                <span className="flex-shrink-0">Qty: <b className="text-gray-700">{item.quantity}</b></span>
                <span className="truncate">{item.lokasi || '-'}</span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                <button onClick={() => onEdit(item)} className="p-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => onDelete(item)} className="p-1.5 border border-gray-200 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer">
                  <Trash2 size={13} />
                </button>
                <button onClick={() => onDetail(item)} className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer">
                  <MoreHorizontal size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {displayed.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-8">Tidak ada data</p>
        )}

        {displayed.length > 0 && (
          <div className="flex items-center justify-between px-1 pt-1">
            <p className="text-[11px] text-gray-500">Menampilkan 1-{displayed.length} dari {data.length} Barang</p>
            <LimitDropdown />
          </div>
        )}
      </div>

      {/* ===== TABLET BESAR / LAPTOP: Table View ===== */}
      <div className="hidden md:block w-full">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[3%]" />
            <col className="hidden lg:table-column lg:w-[7%]" />
            <col className="w-[7%]" />
            <col className="w-[15%]" />
            <col className="w-[8%]" />
            <col className="hidden lg:table-column lg:w-[13%]" />
            <col className="hidden xl:table-column xl:w-[9%]" />
            <col className="w-[9%]" />
            <col className="hidden lg:table-column lg:w-[9%]" />
            <col className="w-[5%]" />
            <col className="w-[11%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200 text-[10px] uppercase font-bold text-gray-400 bg-gray-100/70">
              <th className="p-3 text-center align-middle">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="accent-[#005CA9] cursor-pointer"
                />
              </th>
              <th className="p-3 text-left align-middle hidden lg:table-cell">Tanggal</th>
              <th className="p-3 text-left align-middle">Gambar</th>
              <th className="p-3 text-left align-middle">Nama Barang</th>
              <th className="p-3 text-left align-middle">Kode</th>
              <th className="p-3 text-left align-middle hidden lg:table-cell">Program/Project</th>
              <th className="p-3 text-left align-middle hidden xl:table-cell">Lokasi</th>
              <th className="p-3 text-left align-middle">Status</th>
              <th className="p-3 text-left align-middle hidden lg:table-cell">Kondisi</th>
              <th className="p-3 text-left align-middle">Qty</th>
              <th className="p-3 text-center align-middle">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((item, idx) => (
              <tr
                key={item.id}
                className={`border-b border-gray-200 hover:bg-blue-50/40 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'}`}
              >
                <td className="p-3 text-center align-middle">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => onToggleSelect(item.id)}
                    className="accent-[#005CA9] cursor-pointer"
                  />
                </td>

                <td onClick={() => onDetail(item)} className="p-3 text-left align-middle text-gray-600 text-xs cursor-pointer hidden lg:table-cell">{formatTanggal(item.updatedAt)}</td>

                <td onClick={() => onDetail(item)} className="p-3 text-left align-middle cursor-pointer">
                  {item.fotoUtama ? (
                    <img src={`${FILE_BASE}${item.fotoUtama}`} alt="foto barang"
                      className="w-11 h-11 rounded-lg object-cover border border-gray-200" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                      <ImageIcon size={16} />
                    </div>
                  )}
                </td>

                <td onClick={() => onDetail(item)} className="p-3 text-left align-middle font-semibold text-gray-800 text-xs cursor-pointer truncate">{item.nama}</td>
                <td onClick={() => onDetail(item)} className="p-3 text-left align-middle text-gray-600 text-xs cursor-pointer truncate">{item.kode || '-'}</td>
                <td onClick={() => onDetail(item)} className="p-3 text-left align-middle text-gray-600 text-xs cursor-pointer truncate hidden lg:table-cell">{item.program || '-'}</td>
                <td onClick={() => onDetail(item)} className="p-3 text-left align-middle text-gray-600 text-xs cursor-pointer truncate hidden xl:table-cell">{item.lokasi || '-'}</td>

                <td onClick={() => onDetail(item)} className="p-3 text-left align-middle cursor-pointer">
                  <span className="inline-flex items-center justify-center min-w-[70px] px-2.5 py-1 bg-[#005CA9] text-white text-[10px] font-bold rounded-full text-center">
                    {item.status || '-'}
                  </span>
                </td>

                <td onClick={() => onDetail(item)} className="p-3 text-left align-middle cursor-pointer hidden lg:table-cell">
                  <span className="inline-flex items-center justify-center min-w-[70px] px-2.5 py-1 bg-[#005CA9] text-white text-[10px] font-bold rounded-full text-center">
                    {item.kondisi || '-'}
                  </span>
                </td>

                <td onClick={() => onDetail(item)} className="p-3 text-left align-middle text-gray-600 text-xs cursor-pointer">{item.quantity}</td>

                <td className="p-3 text-center align-middle">
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => onEdit(item)} className="p-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => onDelete(item)} className="p-1.5 border border-gray-200 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer">
                      <Trash2 size={13} />
                    </button>
                    <button onClick={() => onDetail(item)} className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer">
                      <MoreHorizontal size={13} />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {displayed.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Menampilkan 1-{displayed.length} dari {data.length} Barang</p>
            <LimitDropdown />
          </div>
        )}
        {displayed.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-8">Tidak ada data</p>
        )}
      </div>
    </>
  )
}