export default function RiwayatTable({ data = [] }) {
  const columns = [
    { key: 'waktu', label: 'Waktu' },
    { key: 'aktivitas', label: 'Aktivitas' },
    { key: 'barang', label: 'Barang' },
    { key: 'pengguna', label: 'Pengguna' },
    { key: 'divisi', label: 'Divisi' },
  ]

  if (data.length === 0) {
    return (
      <div className="py-6 text-center text-gray-400 text-sm">
        Tidak ada riwayat ditemukan.
      </div>
    )
  }

  return (
    <>
      {/* ===== TAMPILAN DESKTOP (tabel) ===== */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b">
              {columns.map((col) => (
                <th key={col.key} className="py-2 px-3 font-medium">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="py-2 px-3 text-gray-600">
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== TAMPILAN MOBILE (card bertumpuk) ===== */}
      <div className="md:hidden flex flex-col gap-3">
        {data.map((row) => (
          <div
            key={row.id}
            className="border border-gray-100 rounded-2xl p-4 shadow-sm bg-white flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-900">
                {row.aktivitas}
              </span>
              <span className="text-[11px] text-gray-400">{row.waktu}</span>
            </div>
            <div className="grid grid-cols-2 gap-y-1 text-xs">
              <span className="text-gray-400">Barang</span>
              <span className="text-gray-700 text-right">{row.barang}</span>
              <span className="text-gray-400">Pengguna</span>
              <span className="text-gray-700 text-right">{row.pengguna}</span>
              <span className="text-gray-400">Divisi</span>
              <span className="text-gray-700 text-right">{row.divisi}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}