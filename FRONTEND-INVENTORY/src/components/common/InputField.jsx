export default function InputField({ label, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm text-gray-600">{label}</label>}
      <input
        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
        {...props}
      />
      {error && <span className="text-xs text-brand-red">{error}</span>}
    </div>
  )
}
