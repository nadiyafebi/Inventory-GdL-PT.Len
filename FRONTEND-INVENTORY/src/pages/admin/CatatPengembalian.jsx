import Sidebar from '../../components/common/Sidebar.jsx'
import FormPengembalian from '../../components/peminjaman/FormPengembalian.jsx'

export default function CatatPengembalian() {
  const handleSubmit = (data) => {
    console.log('pengembalian', data)
  }

  return (
    <div className="flex min-h-screen bg-[#005CA9] text-gray-800 font-sans">
      <Sidebar />
      <div className="flex-1 pl-[344px] p-8 flex flex-col gap-4">
        <h1 className="text-lg font-bold text-white tracking-wide uppercase">Catat Pengembalian</h1>
        <FormPengembalian onSubmit={handleSubmit} />
      </div>
    </div>
  )
}