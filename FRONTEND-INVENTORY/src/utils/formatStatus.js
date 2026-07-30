// Maps status text to Tailwind badge color classes
export const statusColorMap = {
  Disimpan: 'bg-gray-100 text-gray-700',
  Dipasang: 'bg-teal-50 text-teal-700',
  Dipinjam: 'bg-yellow-100 text-yellow-700',
  Rusak: 'bg-red-100 text-red-700',
  Diperbaiki: 'bg-blue-100 text-blue-700',
  Booking: 'bg-purple-100 text-purple-700',
}

export function getStatusClass(status) {
  return statusColorMap[status] || 'bg-gray-100 text-gray-700'
}