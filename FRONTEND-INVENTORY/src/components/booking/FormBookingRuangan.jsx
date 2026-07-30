import { useState } from 'react'
import InputField from '../common/InputField.jsx'
import Dropdown from '../common/Dropdown.jsx'
import DatePicker from '../common/DatePicker.jsx'
import Button from '../common/Button.jsx'

const RUANGAN_OPTIONS = ['Workshop 1 Gel. L1 1', 'Workshop 2 Gel. L1 1', 'Meeting Room']

export default function FormBookingRuangan({ onSubmit }) {
  const [form, setForm] = useState({
    ruangan: RUANGAN_OPTIONS[0],
    namaPemesan: '',
    tanggal: '',
    jamMulai: '',
    jamSelesai: '',
    keperluan: '',
  })

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(form)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4 flex flex-col gap-3 max-w-md">
      <Dropdown label="Ruangan" options={RUANGAN_OPTIONS} value={form.ruangan} onChange={handleChange('ruangan')} />
      <InputField label="Nama Pemesan" value={form.namaPemesan} onChange={handleChange('namaPemesan')} required />
      <DatePicker label="Tanggal Peminjaman" value={form.tanggal} onChange={handleChange('tanggal')} />
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Jam Mulai" type="time" value={form.jamMulai} onChange={handleChange('jamMulai')} />
        <InputField label="Jam Selesai" type="time" value={form.jamSelesai} onChange={handleChange('jamSelesai')} />
      </div>
      <InputField label="Keperluan" value={form.keperluan} onChange={handleChange('keperluan')} />
      <Button type="submit">Simpan Booking</Button>
    </form>
  )
}
