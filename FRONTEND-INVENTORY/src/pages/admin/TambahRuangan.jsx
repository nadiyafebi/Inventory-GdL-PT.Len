import React, { useState } from 'react';
// Panggil Sidebar dari folder common kamu
import Sidebar from '../../components/common/Sidebar.jsx';

export default function TambahRuangan() {
  const [formData, setFormData] = useState({
    namaRuangan: '',
    deskripsi: '',
    kapasitas: '',
    serialNumber: '',
    merkTipe: '',
    lokasi: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Data Ruangan Baru dengan Serial Number & Merk:', formData);
  };

  return (
    // Latar belakang biru tua penuh untuk seluruh halaman admin
    <div className="flex min-h-screen w-full bg-[#005CA9] text-gray-800 font-sans overflow-x-hidden relative">
      
      {/* 1. Navigasi Sidebar di Sisi Kiri */}
      <Sidebar />

      {/* 2. Konten Utama Form (pl-[360px] menjaga jarak lega agar tidak tertutup sidebar) */}
      <div className="flex-1 pl-[360px] pr-8 py-10 flex flex-col gap-6 min-w-0">
        
        {/* Row Header Halaman */}
        <div className="w-full">
          <h1 className="text-3xl font-bold text-white tracking-wide">
            Tambah Ruangan
          </h1>
        </div>

        {/* Form Kontainer Utama Berwarna Putih Melengkung */}
        <form 
          onSubmit={handleFormSubmit}
          className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl flex flex-col gap-6"
        >
          {/* Grid Layout Kiri & Kanan Berdampingan Secara Horizontal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Kolom Kiri: Kumpulan Input Teks */}
            <div className="flex flex-col gap-4">
              
              {/* Nama Ruangan */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Nama Ruangan
                </label>
                <input
                  type="text"
                  name="namaRuangan"
                  placeholder="Masukkan nama ruangan..."
                  value={formData.namaRuangan}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#005CA9] font-medium text-gray-800"
                  required
                />
              </div>

              {/* Deskripsi Ruangan */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Deskripsi
                </label>
                <textarea
                  name="deskripsi"
                  rows="4"
                  placeholder="Masukkan deskripsi fasilitas ruangan..."
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#005CA9] font-medium text-gray-800 resize-none"
                  required
                />
              </div>

              {/* PERBAIKAN UTAMA: Tiga Input Pendek Berjejer Horizontal (Kapasitas, Serial Number, Merk/Tipe) */}
              <div className="grid grid-cols-3 gap-3">
                {/* Kapasitas */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide truncate">
                    Kapasitas (Orang)
                  </label>
                  <input
                    type="number"
                    name="kapasitas"
                    placeholder="Contoh: 20"
                    value={formData.kapasitas}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#005CA9] font-medium text-gray-800"
                    required
                  />
                </div>

                {/* Serial Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide truncate">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    name="serialNumber"
                    placeholder="Contoh: SN-0192"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#005CA9] font-medium text-gray-800"
                    required
                  />
                </div>

                {/* Merk/Tipe */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide truncate">
                    Merk/Tipe
                  </label>
                  <input
                    type="text"
                    name="merkTipe"
                    placeholder="Contoh: Polycom"
                    value={formData.merkTipe}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#005CA9] font-medium text-gray-800"
                    required
                  />
                </div>
              </div>

              {/* Lokasi Gedung (Pindah ke Baris Baru di Bawah Grid Tiga Kolom) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Lokasi
                </label>
                <input
                  type="text"
                  name="lokasi"
                  placeholder="Contoh: Gedung L"
                  value={formData.lokasi}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#005CA9] font-medium text-gray-800"
                  required
                />
              </div>

            </div>

            {/* Kolom Kanan: Area Unggah Gambar / Dropzone Tinggi Seimbang */}
            <div className="flex flex-col gap-1.5 h-full">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Unggah Foto Ruangan
              </label>
              
              <div className="flex-1 h-full bg-[#F8FAFC] border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-center cursor-pointer hover:bg-slate-100/80 transition-all min-h-[320px]">
                
                {/* Ikon Bulat Plus Biru Presisi Murni CSS */}
                <div className="w-12 h-12 bg-[#005CA9] rounded-full flex items-center justify-center text-white shadow-md select-none text-3xl font-light">
                  <span className="mb-1 block">+</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-gray-700">
                    Klik untuk unggah atau seret berkas ke sini
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                    PNG, JPG, JPEG ukuran maksimal 5MB
                  </span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  id="room-photo-upload"
                />
              </div>
            </div>

          </div>

          {/* Row Aksi Bawah (Tombol Batal & Simpan Ruangan) */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
            <button
              type="button"
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#005CA9] hover:bg-[#004B8A] text-white text-xs font-bold rounded-lg transition-colors shadow-md"
            >
              Simpan Ruangan
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}