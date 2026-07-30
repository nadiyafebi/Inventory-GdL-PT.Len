import { useState } from 'react'
import InputField from '../common/InputField.jsx'
import DatePicker from '../common/DatePicker.jsx'
import Button from '../common/Button.jsx'

export default function FormPengembalian({ onSubmit }) {
  const [form, setForm] = useState({
    barang: '',
    dikembalikanOleh: '',
    tanggalKembali: '',
    kondisi: 'Baik',
  })

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(form)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4 flex flex-col gap-3 max-w-md">
      <InputField label="Barang" value={form.barang} onChange={handleChange('barang')} required />
      <InputField
        label="Dikembalikan Oleh"
        value={form.dikembalikanOleh}
        onChange={handleChange('dikembalikanOleh')}
        required
      />
      <DatePicker label="Tanggal Kembali" value={form.tanggalKembali} onChange={handleChange('tanggalKembali')} />
      <InputField label="Kondisi Saat Kembali" value={form.kondisi} onChange={handleChange('kondisi')} />
      <Button type="submit">Simpan Pengembalian</Button>
    </form>
  )
}
