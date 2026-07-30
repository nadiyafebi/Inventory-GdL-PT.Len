import React, { useState } from 'react';
import Sidebar from '../../components/common/Sidebar.jsx';

export default function TambahBarang() {
  const [formData, setFormData] = useState({
    namaBarang: '',
    deskripsi: '',
    program: 'Semua Program',
    kapasitas: '',
    lokasi: '',
    serialNumber: '',
    merkTipe: '',
    status: 'Pilih Status',
    kondisi: 'Pilih Kondisi',
    catatan: ''
  });

  const [openDropdown, setOpenDropdown] = useState({
    program: false,
    status: false,
    kondisi: false
  });

  const programOptions = ['Semua Program', 'Workshop Radar (Astacita)', 'Radar Pasif (Era,Cheko)', 'PMN Radar 2023'];
  const statusOptions = ['Dibeli', 'Dikirim', 'Dipasang', 'Didaftarkan', 'Disimpan', 'Dipakai', 'Dipinjam', 'Dikembalikan', 'Diperbaiki', 'Rusak', 'Hilang', 'Dibuang', 'Dijual', 'Dibersihkan'];
  const kondisiOptions = ['Baru', 'Bagus', 'Rusak'];

  const toggleDropdown = (field) => {
    setOpenDropdown((prev) => ({
      program: field === 'program' ? !prev.program : false,
      status: field === 'status' ? !prev.status : false,
      kondisi: field === 'kondisi' ? !prev.kondisi : false
    }));
  };

  const selectOption = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setOpenDropdown({ program: false, status: false, kondisi: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // LOGIKA INTEGRASI: Mengirim data lengkap termasuk serialNumber ke backend
    console.log('Data Barang Baru Berhasil Disimpan (Termasuk No. Seri):', formData);
    alert('Barang berhasil disimpan!');
  };

  return (
    <div className="flex min-h-screen w-full bg-[#005CA9] text-gray-800 font-sans overflow-x-hidden relative">
      <Sidebar />

      <div className="flex-1 pl-[360px] pr-8 py-10 flex flex-col gap-6 min-w-0">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-white tracking-wide">Tambah Barang</h1>
        </div>

        <form 
          onSubmit={handleFormSubmit} 
          className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl flex flex-col gap-6 relative overflow-visible z-10"
        >
          
          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Tambah Barang</h2>
            <button type="button" onClick={() => window.history.back()} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
          </div>

          <div className="flex flex-col gap-4 overflow-visible">
            
            {/* 1. Nama Barang */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Nama Barang</label>
              <input
                type="text"
                name="namaBarang"
                placeholder="Contoh : Antena"
                value={formData.namaBarang}
                onChange={handleInputChange}
                className="w-full text-xs px-3 py-2.5 bg-[#EAEAEA] border-none rounded-lg focus:outline-none font-medium text-gray-700"
                required
              />
            </div>

            {/* 2. CUSTOM DROPDOWN: Program */}
            <div className="flex flex-col gap-1.5 relative overflow-visible z-40">
              <label className="text-xs font-semibold text-gray-500">Program</label>
              <button
                type="button"
                onClick={() => toggleDropdown('program')}
                className="w-full text-xs px-3 py-2.5 bg-[#EAEAEA] border-none rounded-lg focus:outline-none font-medium text-gray-700 text-left flex justify-between items-center cursor-pointer"
              >
                <span>{formData.program}</span>
                <span className="text-[10px] text-gray-500">▼</span>
              </button>
              
              {openDropdown.program && (
                <div className="absolute left-0 right-0 top-[65px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 max-h-48 overflow-y-auto block">
                  {programOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => selectOption('program', opt)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                        formData.program === opt 
                          ? 'bg-[#808080] text-white font-bold' 
                          : 'text-gray-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Merk */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Merk</label>
              <input
                type="text"
                name="merkTipe"
                value={formData.merkTipe}
                onChange={handleInputChange}
                className="w-full text-xs px-3 py-2.5 bg-[#EAEAEA] border-none rounded-lg focus:outline-none font-medium text-gray-700"
              />
            </div>

            {/* 4. Tipe */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Tipe</label>
              <input
                type="text"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                className="w-full text-xs px-3 py-2.5 bg-[#EAEAEA] border-none rounded-lg focus:outline-none font-medium text-gray-700"
              />
            </div>

            {/* 5. Serial Number (Dipastikan Terhubung ke Event Handler) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Serial Number</label>
              <input
                type="text"
                name="serialNumber"
                placeholder="Masukkan Nomor Seri Barang..."
                value={formData.serialNumber}
                onChange={handleInputChange}
                className="w-full text-xs px-3 py-2.5 bg-[#EAEAEA] border-none rounded-lg focus:outline-none font-medium text-gray-700"
              />
            </div>

            {/* 6. CUSTOM DROPDOWN STATUS: Gaya Kapsul Pil Biru Melayang */}
            <div className="flex flex-col gap-1.5 relative overflow-visible z-30">
              <label className="text-xs font-semibold text-gray-500">Status</label>
              <button
                type="button"
                onClick={() => toggleDropdown('status')}
                className="w-full text-xs px-4 py-2.5 bg-[#EAEAEA] border-none rounded-lg focus:outline-none font-bold text-gray-700 text-left flex justify-between items-center cursor-pointer select-none"
              >
                <span>{formData.status}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {openDropdown.status && (
                <div className="absolute left-0 right-0 top-[65px] bg-white border border-gray-100 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 overflow-hidden select-none z-50">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => selectOption('status', opt)}
                      className="w-full text-center px-4 py-2 text-xs font-bold text-white bg-[#005CA9] rounded-full cursor-pointer hover:bg-[#004B8A] transition-colors select-none border-none outline-none"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 7. CUSTOM DROPDOWN: Kondisi */}
            <div className="flex flex-col gap-1.5 relative overflow-visible z-20">
              <label className="text-xs font-semibold text-gray-500">Kondisi</label>
              <button
                type="button"
                onClick={() => toggleDropdown('kondisi')}
                className="w-full text-xs px-3 py-2.5 bg-[#EAEAEA] border-none rounded-lg focus:outline-none font-medium text-gray-700 text-left flex justify-between items-center cursor-pointer"
              >
                <span>{formData.kondisi}</span>
                <span className="text-[10px] text-gray-500">▼</span>
              </button>

              {openDropdown.kondisi && (
                <div className="absolute left-0 right-0 top-[65px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 block">
                  {kondisiOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => selectOption('kondisi', opt)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                        formData.kondisi === opt ? 'bg-[#808080] text-white font-bold' : 'text-gray-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 8. Lokasi */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Lokasi</label>
              <input
                type="text"
                name="lokasi"
                placeholder="Gedung L"
                value={formData.lokasi}
                onChange={handleInputChange}
                className="w-full text-xs px-3 py-2.5 bg-[#EAEAEA] border-none rounded-lg focus:outline-none font-medium text-gray-700"
              />
            </div>

            {/* 9. Catatan (Opsional) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Catatan (Opsional)</label>
              <input
                type="text"
                name="catatan"
                placeholder="Tambahkan Catatan..."
                value={formData.catatan}
                onChange={handleInputChange}
                className="w-full text-xs px-3 py-2.5 bg-[#EAEAEA] border-none rounded-lg focus:outline-none font-medium text-gray-700"
              />
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-[#E5E5E5] hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#005CA9] hover:bg-[#004B8A] text-white text-xs font-bold rounded-lg transition-colors shadow-md"
            >
              Simpan
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}