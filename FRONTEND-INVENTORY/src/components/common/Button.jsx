export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'px-4 py-2 rounded text-sm font-medium transition'
  const variants = {
    primary: 'bg-navy text-white hover:bg-navy-light',
    danger: 'bg-brand-red text-white hover:opacity-90',
    outline: 'border border-gray-300 text-gray-600 hover:bg-gray-50',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
