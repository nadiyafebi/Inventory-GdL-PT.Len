export default function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm">
      <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">{label}</p>
      <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  )
}