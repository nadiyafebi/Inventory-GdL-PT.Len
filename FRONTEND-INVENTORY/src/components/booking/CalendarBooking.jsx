export default function CalendarBooking({ bookedDates = [], onSelectDate }) {
  // Placeholder simple calendar; can be swapped with react-day-picker or similar later
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 text-center text-sm text-gray-400">
      <p className="mb-2 font-medium text-gray-600">Kalender Booking</p>
      <p>Komponen kalender penuh bisa diintegrasikan di sini</p>
      <p className="text-xs mt-2">Tanggal terbooking: {bookedDates.join(', ') || '-'}</p>
    </div>
  )
}
