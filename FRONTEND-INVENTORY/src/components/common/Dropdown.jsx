export default function Dropdown({ label, options = [], value, onChange, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm text-gray-600">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}
