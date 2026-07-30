export const statusColorMap = {
  Dipinjam: 'bg-blue-50 text-blue-600',
  'Menunggu Approval': 'bg-amber-50 text-amber-600',
  'Cek Kembali': 'bg-purple-50 text-purple-600',
  Terlambat: 'bg-red-50 text-red-600',
  Selesai: 'bg-emerald-50 text-emerald-600',
};

export function getTransaksiStatusClass(status) {
  return statusColorMap[status] || 'bg-gray-100 text-gray-600';
}