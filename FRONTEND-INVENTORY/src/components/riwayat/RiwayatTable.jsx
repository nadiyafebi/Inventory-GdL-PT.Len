export default function RiwayatTable({ data = [] }) {
  const columns = [
    { key: 'waktu', label: 'Waktu' },
    { key: 'aktivitas', label: 'Aktivitas' },
    { key: 'barang', label: 'Barang' },
    { key: 'pengguna', label: 'Pengguna' },
    { key: 'divisi', label: 'Divisi' },
  ]

  return (
    <div className="overflow-x-auto">
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
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-6 text-center text-gray-400 text-sm">
                Tidak ada riwayat ditemukan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}