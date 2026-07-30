import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'

export default function BarangPerProgramChart({ data = [] }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
        Barang per Program
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ right: 24 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: '#4B5563' }} />
          <Tooltip />
          <Bar dataKey="value" fill="#005CA9" radius={[0, 4, 4, 0]} barSize={18}>
            <LabelList dataKey="value" position="right" style={{ fill: '#374151', fontSize: 12, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}