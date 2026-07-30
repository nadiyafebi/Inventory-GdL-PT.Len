export default function Table({ columns = [], data = [], renderActions }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500 border-b">
          {columns.map((col) => (
            <th key={col.key} className="py-2 px-3 font-medium">
              {col.label}
            </th>
          ))}
          {renderActions && <th className="py-2 px-3">Aksi</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id} className="border-b hover:bg-gray-50">
            {columns.map((col) => (
              <td key={col.key} className="py-2 px-3">
                {row[col.key]}
              </td>
            ))}
            {renderActions && <td className="py-2 px-3">{renderActions(row)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
