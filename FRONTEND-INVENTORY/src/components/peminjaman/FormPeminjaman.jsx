import { useState } from 'react'
import InputField from '../common/InputField.jsx'
import DatePicker from '../common/DatePicker.jsx'
import Button from '../common/Button.jsx'

export default function FormPeminjaman({ onSubmit }) {
  const [form, setForm] = useState({
    barang: '',
    peminjam: '',
    tanggalPinjam: '',
    tanggalKembali: '',
    keperluan: '',
  })

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(form)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4 flex flex-col gap-3 max-w-md">
      <InputField label="Barang" value={form.barang} onChange={handleChange('barang')} required />
      <InputField label="Nama Peminjam" value={form.peminjam} onChange={handleChange('peminjam')} required />
      <div className="grid grid-cols-2 gap-3">
        <DatePicker label="Tanggal Pinjam" value={form.tanggalPinjam} onChange={handleChange('tanggalPinjam')} />
        <DatePicker label="Tanggal Kembali" value={form.tanggalKembali} onChange={handleChange('tanggalKembali')} />
      </div>
      <InputField label="Keperluan" value={form.keperluan} onChange={handleChange('keperluan')} />
      <Button type="submit">Simpan Peminjaman</Button>
    </form>
  )
}
