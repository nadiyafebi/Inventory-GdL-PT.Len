export const bookingStatusColorMap = {
  'Menunggu Approval': 'bg-amber-50 text-amber-600',
  Disetujui: 'bg-emerald-50 text-emerald-600',
  Bentrok: 'bg-red-50 text-red-600',
  Selesai: 'bg-gray-100 text-gray-500',
};

export function getBookingStatusClass(status) {
  return bookingStatusColorMap[status] || 'bg-gray-100 text-gray-600';
}