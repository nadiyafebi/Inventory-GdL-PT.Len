import FormBookingRuangan from '../../components/booking/FormBookingRuangan.jsx'
import CalendarBooking from '../../components/booking/CalendarBooking.jsx'

export default function BookingRuangan() {
  const handleSubmit = (data) => {
    // TODO: replace with bookingService.create(data)
    console.log('user booking', data)
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Booking Ruangan</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <FormBookingRuangan onSubmit={handleSubmit} />
        <CalendarBooking />
      </div>
    </div>
  )
}
