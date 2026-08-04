import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'

export default function BarangPerProgramChart({ data = [] }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
        Barang per Program
      </p>
      <div className="flex flex-col gap-4">
        {data.map((item) => {
          const widthPercent = (item.value / maxValue) * 100;
          return (
            <div key={item.name}>
              <p className="text-xs text-gray-600 mb-1.5">{item.name}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#005CA9] rounded-full transition-all"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-800 w-6 text-right">
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}