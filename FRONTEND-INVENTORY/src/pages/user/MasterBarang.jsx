import React, { useState, useEffect } from 'react';
import { 
  Search,
  Eye,
  X,
  ChevronDown,
  FileText
} from 'lucide-react';
import SidebarUser from '../../components/common/SidebarUser';

const API_BASE = 'http://192.168.1.88:5000/api';
const SERVER_BASE = 'http://192.168.1.88:5000';

export default function MasterBarangUser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('Semua Program');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [programList, setProgramList] = useState([
    'Semua Program',
    'PMN Radar 2023',
    'Radar Pasif (Era,Cheko)',
    'Workshop Radar (Astacita)',
    'BBNCW2'
  ]);

  // Helper untuk membentuk URL static gambar sesuai lokasi folder backend
  const buildImageUrl = (filePath, isManual = false) => {
    if (!filePath || filePath === '-' || filePath === 'null' || filePath === 'undefined') return null;
    if (typeof filePath !== 'string') return null;
     
    // Jika dari backend sudah berupa URL http lengkap
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
     
    // Ambil hanya nama filenya (menghindari duplikasi path)
    const fileName = filePath.split('/').pop().split('\\').pop();
     
    // Arahkan ke folder uploads/barang/ atau uploads/barang/manual-book/
    if (isManual) {
      return `${SERVER_BASE}/uploads/barang/manual-book/${fileName}`;
    }
     
    return `${SERVER_BASE}/uploads/barang/${fileName}`;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
     
    fetch(`${API_BASE}/barang`, { 
      headers: { Authorization: `Bearer ${token}` } 
    })
      .then(res => {
        if (!res.ok) throw new Error('Server offline');
        return res.json();
      })
      .then(result => {
        if (result.success && result.data) {
          processItems(result.data);
        }
      })
      .catch(err => {
        console.error('Gagal mengambil data dari API:', err);
      });
  }, []);

  const processItems = (rawData) => {
    const mapped = rawData.map(b => {
      const rawFoto = b.fotoUtama || b.fotoBarang || b.foto || b.gambar_barang || b.foto_barang || b.foto_sebelum || b.gambar || b.image;
      const rawManual = b.manualBookUtama || b.manualBook || b.gambar_manual_book || b.manual_book || b.file_manual || b.manual_pdf;
      const rawTanggal = b.updatedAt || b.tanggalTransaksi || b.tanggal_transaksi || b.created_at || b.createdAt || b.tanggal || '-';
      return {
        id: b.id,
        tanggalTransaksi: rawTanggal !== '-' ? String(rawTanggal).split('T')[0] : '-',
        fotoBarang: buildImageUrl(rawFoto, false),
        gambarManualBook: buildImageUrl(rawManual, true),
        kodeBarang: b.kodeBarang || b.kode_barang || '-',
        noInventarisGa: b.nomorInventarisGa || b.nomor_inventaris_ga || b.noInventarisGa || b.no_inventaris_ga || '-',
        serialNumber: b.serialNumber || b.serial_number || '-',
        partNumber: b.partNumber || b.part_number || '-',
        name: b.namaBarang || b.nama_barang || b.name || '-',
        merk: b.merk || '-',
        tipe: b.tipe || '-',
        penanggungJawab: b.penanggungJawab || b.penanggung_jawab || '-',
        status: b.status || 'Disimpan',
        kondisi: b.kondisi || b.kondisi_barang || 'Siap Pakai',
        program: b.programProject || b.program_project || '-',
        lokasi: b.lokasi || '-',
        quantity: b.jumlah || b.quantity || 1,
        catatan: b.catatan || '-'
      };
    });

    setItems(mapped);

    const uniquePrograms = [...new Set(mapped.map(i => i.program).filter(p => p && p !== '-'))];
    if (uniquePrograms.length > 0) {
      const merged = ['Semua Program', 'PMN Radar 2023', 'Radar Pasif (Era,Cheko)', 'Workshop Radar (Astacita)', 'BBNCW2', ...uniquePrograms];
      setProgramList([...new Set(merged)]);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.kodeBarang || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.lokasi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.merk || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = selectedProgram === 'Semua Program' || item.program === selectedProgram;
    return matchesSearch && matchesProgram;
  });

  return (
    <div className="flex bg-white font-sans overflow-x-hidden min-h-screen select-none">
       
      {/* SIDEBAR USER */}
      <SidebarUser />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full transition-all duration-300 ease-in-out md:ml-72 md:w-[calc(100%-288px)] bg-[#0053A0] p-6 sm:p-8 min-h-screen overflow-y-auto flex flex-col gap-6">
        
        {/* Header khusus mobile: Tombol menu di kiri, Judul persis di tengah */}
        <div className="flex items-center md:block">
          <div className="w-10 md:hidden"></div> {/* Spacer penyeimbang tombol hamburger di sidebar */}
          <h2 className="flex-1 text-center md:text-left text-white text-xl sm:text-2xl font-bold tracking-wide">Master Barang</h2>
          <div className="w-10 md:hidden"></div> {/* Spacer penyeimbang kanan */}
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama barang, merek, nomor seri, atau lokasi..." 
              className="w-full bg-gray-100 border-none rounded-full pl-10 pr-4 py-3 text-xs text-gray-800 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
          </div>

          {/* CUSTOM DROPDOWN */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full sm:w-auto bg-gray-100 border-none rounded-full px-5 py-3 text-xs text-gray-800 flex items-center justify-between gap-6 cursor-pointer min-w-[200px]"
            >
              <span className="font-medium truncate">{selectedProgram}</span>
              <ChevronDown size={14} className="text-gray-500 shrink-0" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-3xl shadow-2xl p-4 z-50 flex flex-col gap-2.5">
                {programList.map((prog, index) => {
                  const isSelected = selectedProgram === prog;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedProgram(prog);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full font-medium text-xs py-2.5 px-4 rounded-full shadow-sm text-center cursor-pointer border-none truncate transition-all ${
                        isSelected ? 'bg-[#1e3a8a] text-white' : 'bg-[#0053A0] text-white hover:bg-blue-800'
                      }`}
                    >
                      {prog}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* TABLE LIST CONTAINER */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex-1 flex flex-col overflow-hidden">
           
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs min-w-[1600px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3 whitespace-nowrap text-center">Tanggal Transaksi</th>
                  <th className="p-3 whitespace-nowrap text-center">Gambar Barang</th>
                  <th className="p-3 whitespace-nowrap text-center">Gambar Manual Book</th>
                  <th className="p-3 whitespace-nowrap">Nama Barang</th>
                  <th className="p-3 whitespace-nowrap">Merk</th>
                  <th className="p-3 whitespace-nowrap">Tipe</th>
                  <th className="p-3 whitespace-nowrap">Kode Barang</th>
                  <th className="p-3 whitespace-nowrap">No Inventaris GA</th>
                  <th className="p-3 whitespace-nowrap">Serial Number</th>
                  <th className="p-3 whitespace-nowrap">Part Number</th>
                  <th className="p-3 whitespace-nowrap">Penanggung Jawab</th>
                  <th className="p-3 whitespace-nowrap">Lokasi</th>
                  <th className="p-3 whitespace-nowrap">Program/Project</th>
                  <th className="p-3 whitespace-nowrap">Status</th>
                  <th className="p-3 whitespace-nowrap">Kondisi</th>
                  <th className="p-3 whitespace-nowrap text-center">Quantity</th>
                  <th className="p-3 whitespace-nowrap text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 font-medium divide-y divide-gray-100">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                       
                      {/* Tanggal Transaksi */}
                      <td className="p-3 whitespace-nowrap text-center text-gray-500">
                        {item.tanggalTransaksi}
                      </td>

                      {/* Gambar Barang */}
                      <td className="p-2 whitespace-nowrap text-center">
                        {item.fotoBarang ? (
                          <img 
                            src={item.fotoBarang} 
                            alt="Barang" 
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 mx-auto" 
                            onError={(e) => { 
                              e.target.style.display = 'none'; 
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; 
                            }}
                          />
                        ) : null}
                        <div className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-200 mx-auto flex items-center justify-center text-[8px] text-gray-400" style={{ display: item.fotoBarang ? 'none' : 'flex' }}>
                          No Image
                        </div>
                      </td>

                      {/* Gambar Manual Book */}
                      <td className="p-2 whitespace-nowrap text-center">
                        {item.gambarManualBook ? (
                          <a 
                            href={item.gambarManualBook} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                          >
                            <FileText size={16} />
                          </a>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      {/* Detail Informasi Barang */}
                      <td className="p-3 whitespace-nowrap font-bold text-gray-900">{item.name}</td>
                      <td className="p-3 whitespace-nowrap text-gray-600">{item.merk}</td>
                      <td className="p-3 whitespace-nowrap text-gray-600">{item.tipe}</td>
                      <td className="p-3 whitespace-nowrap text-gray-600">{item.kodeBarang}</td>
                      <td className="p-3 whitespace-nowrap text-gray-600">{item.noInventarisGa}</td>
                      <td className="p-3 whitespace-nowrap text-gray-600">{item.serialNumber}</td>
                      <td className="p-3 whitespace-nowrap text-gray-600">{item.partNumber}</td>
                      <td className="p-3 whitespace-nowrap text-gray-600">{item.penanggungJawab}</td>
                      <td className="p-3 whitespace-nowrap text-gray-600">{item.lokasi}</td>
                      <td className="p-3 whitespace-nowrap text-gray-600">{item.program}</td>
                       
                      {/* Status */}
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          item.status === 'Disimpan' ? 'bg-green-50 text-green-700' : 
                          item.status === 'Dipinjam' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Kondisi */}
                      <td className="p-3 whitespace-nowrap text-gray-600">{item.kondisi}</td>

                      {/* Quantity */}
                      <td className="p-3 whitespace-nowrap text-center font-bold text-gray-900">{item.quantity}</td>

                      {/* Action */}
                      <td className="p-3 whitespace-nowrap text-center">
                        <button 
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs cursor-pointer font-medium transition"
                        >
                          <Eye size={12} />
                          <span>Detail</span>
                        </button>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="17" className="text-center py-8 text-gray-400 italic">
                      Tidak ada data barang yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Jumlah Data */}
          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 font-medium">
            Menampilkan 1-{filteredItems.length} dari {items.length} Barang
          </div>

        </div>

        {/* ======================================================= */}
        {/* DETAIL MODAL POPUP                                     */}
        {/* ======================================================= */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl relative flex flex-col gap-4">
               
              {/* Tombol Silang Tutup */}
              <button 
                onClick={() => setSelectedItem(null)} 
                className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>

              {/* Judul Nama Barang */}
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 pr-8">
                {selectedItem.name}
              </h3>

              {/* Grid 2 Kolom Label & Nilai Data */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
                 
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Tanggal Transaksi</span>
                  <span className="font-bold text-gray-800">{selectedItem.tanggalTransaksi}</span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Serial Number</span>
                  <span className="font-bold text-gray-800">{selectedItem.serialNumber}</span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block font-medium mb-1">Foto Barang</span>
                  {selectedItem.fotoBarang ? (
                    <img 
                      src={selectedItem.fotoBarang} 
                      alt="Barang" 
                      className="w-14 h-10 object-cover rounded-lg border border-gray-200" 
                      onError={(e) => { 
                        e.target.style.display = 'none'; 
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; 
                      }}
                    />
                  ) : null}
                  <div className="w-14 h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-[8px] text-gray-400" style={{ display: selectedItem.fotoBarang ? 'none' : 'flex' }}>
                    No Image
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Part Number</span>
                  <span className="font-bold text-gray-800">{selectedItem.partNumber}</span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Manual Book</span>
                  {selectedItem.gambarManualBook ? (
                    <a 
                      href={selectedItem.gambarManualBook} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-blue-600 font-bold underline hover:text-blue-800 transition"
                    >
                      Lihat Manual Book
                    </a>
                  ) : (
                    <span className="font-bold text-gray-800">-</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Penanggung Jawab</span>
                  <span className="font-bold text-gray-800">{selectedItem.penanggungJawab}</span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Nama Barang</span>
                  <span className="font-bold text-gray-800">{selectedItem.name}</span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Lokasi</span>
                  <span className="font-bold text-gray-800">{selectedItem.lokasi}</span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Merk</span>
                  <span className="font-bold text-gray-800">{selectedItem.merk}</span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Program/Project</span>
                  <span className="font-bold text-gray-800">{selectedItem.program}</span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Tipe</span>
                  <span className="font-bold text-gray-800">{selectedItem.tipe}</span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Status</span>
                  <span className="font-bold text-gray-800">{selectedItem.status}</span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Kode Barang</span>
                  <span className="font-bold text-gray-800">{selectedItem.kodeBarang}</span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Kondisi</span>
                  <span className="font-bold text-gray-800">{selectedItem.kondisi}</span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">No Inventaris GA</span>
                  <span className="font-bold text-gray-800">{selectedItem.noInventarisGa}</span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Quantity</span>
                  <span className="font-bold text-gray-800">{selectedItem.quantity}</span>
                </div>

              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-3 bg-[#0053A0] hover:bg-blue-800 text-white text-xs font-bold rounded-2xl shadow-md transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}