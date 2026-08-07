import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Image as ImageIcon, FileText, FileCheck, Trash2 } from 'lucide-react';
import { PROGRAM_OPTIONS, STATUS_OPTIONS, KONDISI_OPTIONS } from '../../utils/constants.js';

const API_BASE = 'http://172.16.13.53:5000/api';
const FILE_BASE = 'http://172.16.13.53:5000';

export default function EditBarangModal({ isOpen, onClose, initialData, onSubmit }) {
  const [formData, setFormData] = useState({
    id: '',
    tanggalTransaksi: '',
    hargaAset: '',
    nama: '',
    penanggungJawab: '',
    merk: '',
    lokasi: '',
    tipe: '',
    program: PROGRAM_OPTIONS[0] || '',
    kode: '',
    status: STATUS_OPTIONS[0] || 'Disimpan',
    nomorInventarisGa: '',
    kondisi: KONDISI_OPTIONS[0] || 'Baru',
    serialNumber: '',
    quantity: 1,
    partNumber: '',
  });

  const [existingFoto, setExistingFoto] = useState([]);
  const [existingManualBook, setExistingManualBook] = useState([]);
  const [existingDokumentasi, setExistingDokumentasi] = useState([]);

  const [pendingFoto, setPendingFoto] = useState([]);
  const [pendingManualBook, setPendingManualBook] = useState([]);
  const [pendingDokumentasi, setPendingDokumentasi] = useState([]);

  const [submitting, setSubmitting] = useState(false);

  const [openDropdown, setOpenDropdown] = useState({ program: false, status: false, kondisi: false });

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        tanggalTransaksi: initialData.tanggalTransaksi
          ? initialData.tanggalTransaksi.slice(0, 10)
          : '',
        hargaAset: initialData.hargaAset ?? '',
        nama: initialData.nama || '',
        penanggungJawab: initialData.penanggungJawab || '',
        merk: initialData.merk || '',
        lokasi: initialData.lokasi || '',
        tipe: initialData.tipe || '',
        program: initialData.program || PROGRAM_OPTIONS[0] || '',
        kode: initialData.kode || initialData.kodeBarang || '',
        status: initialData.status || STATUS_OPTIONS[0] || 'Disimpan',
        nomorInventarisGa: initialData.nomorInventarisGa || '',
        kondisi: initialData.kondisi || KONDISI_OPTIONS[0] || 'Baru',
        serialNumber: initialData.serialNumber || '',
        quantity: initialData.quantity || 1,
        partNumber: initialData.partNumber || '',
      });
      setPendingFoto([]);
      setPendingManualBook([]);
      setPendingDokumentasi([]);

      if (initialData.id) {
        fetchExistingFoto(initialData.id);
        fetchExistingManualBook(initialData.id);
        fetchExistingDokumentasi(initialData.id);
      }
    }
  }, [initialData, isOpen]);

  const fetchExistingFoto = (barangId) => {
    fetch(`${API_BASE}/barang/${barangId}/foto`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(result => { if (result.success) setExistingFoto(result.data); })
      .catch(err => console.error('Gagal ambil foto:', err));
  };

  const fetchExistingManualBook = (barangId) => {
    fetch(`${API_BASE}/barang/${barangId}/manual-book`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(result => { if (result.success) setExistingManualBook(result.data); })
      .catch(err => console.error('Gagal ambil manual book:', err));
  };

  const fetchExistingDokumentasi = (barangId) => {
    fetch(`${API_BASE}/barang/${barangId}/dokumentasi-transaksi`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(result => { if (result.success) setExistingDokumentasi(result.data); })
      .catch(err => console.error('Gagal ambil dokumentasi transaksi:', err));
  };

  if (!isOpen) return null;

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

  const handleAddFoto = (e) => {
    const files = Array.from(e.target.files || []);
    setPendingFoto(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const handleAddManualBook = (e) => {
    const files = Array.from(e.target.files || []);
    setPendingManualBook(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const handleAddDokumentasi = (e) => {
    const files = Array.from(e.target.files || []);
    setPendingDokumentasi(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removePendingFoto = (idx) => setPendingFoto(prev => prev.filter((_, i) => i !== idx));
  const removePendingManualBook = (idx) => setPendingManualBook(prev => prev.filter((_, i) => i !== idx));
  const removePendingDokumentasi = (idx) => setPendingDokumentasi(prev => prev.filter((_, i) => i !== idx));

  const deleteExistingFoto = async (fotoId) => {
    try {
      await fetch(`${API_BASE}/barang/foto/${fotoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setExistingFoto(prev => prev.filter(f => f.id !== fotoId));
    } catch (err) {
      console.error('Gagal hapus foto:', err);
    }
  };

  const deleteExistingManualBook = async (manualId) => {
    try {
      await fetch(`${API_BASE}/barang/manual-book/${manualId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setExistingManualBook(prev => prev.filter(m => m.id !== manualId));
    } catch (err) {
      console.error('Gagal hapus manual book:', err);
    }
  };

  const deleteExistingDokumentasi = async (dokId) => {
    try {
      await fetch(`${API_BASE}/barang/dokumentasi-transaksi/${dokId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setExistingDokumentasi(prev => prev.filter(d => d.id !== dokId));
    } catch (err) {
      console.error('Gagal hapus dokumentasi transaksi:', err);
    }
  };

  const uploadPendingFiles = async (barangId) => {
    if (pendingFoto.length > 0) {
      const fd = new FormData();
      pendingFoto.forEach(file => fd.append('foto', file));
      await fetch(`${API_BASE}/barang/${barangId}/foto`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
    }
    if (pendingManualBook.length > 0) {
      const fd = new FormData();
      pendingManualBook.forEach(file => fd.append('manualBook', file));
      await fetch(`${API_BASE}/barang/${barangId}/manual-book`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
    }
    if (pendingDokumentasi.length > 0) {
      const fd = new FormData();
      pendingDokumentasi.forEach(file => fd.append('dokumentasiTransaksi', file));
      await fetch(`${API_BASE}/barang/${barangId}/dokumentasi-transaksi`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const savedId = await onSubmit(formData); // parent update barang, kembalikan id
      const idToUse = savedId || formData.id;
      if (idToUse) {
        await uploadPendingFiles(idToUse);
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full text-xs px-3 py-2.5 bg-[#EAEAEA] border-none rounded-lg focus:outline-none font-medium text-gray-700';
  const labelClass = 'text-[11px] font-medium text-gray-400';

  const Field = ({ label, children }) => (
    <div className="flex flex-col gap-1">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );

  const Dropdown = ({ label, field, value, options, zIndex }) => (
    <div className={`flex flex-col gap-1 relative overflow-visible ${zIndex}`}>
      <label className={labelClass}>{label}</label>
      <button type="button" onClick={() => toggleDropdown(field)}
        className="w-full text-xs px-3 py-2.5 bg-[#EAEAEA] border-none rounded-lg focus:outline-none font-medium text-gray-700 text-left flex justify-between items-center cursor-pointer select-none">
        <span>{value || `Pilih ${label}`}</span>
        <ChevronDown size={14} className="text-gray-500" />
      </button>
      {openDropdown[field] && (
        <div className="absolute left-0 right-0 top-[56px] bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2.5 flex flex-col gap-1.5 max-h-40 overflow-y-auto select-none">
          {options.map((opt) => (
            <div key={opt} onClick={() => selectOption(field, opt)}
              className="w-full text-center px-2 py-1.5 text-[11px] font-bold text-white bg-[#005CA9] rounded-full cursor-pointer hover:bg-[#004B8A] transition-colors truncate">
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-[20px] shadow-2xl p-6 w-full max-w-[820px] flex flex-col gap-4 relative overflow-visible max-h-[90vh]">

        <div className="flex justify-center items-center w-full border-b border-gray-100 pb-3 relative">
          <h2 className="text-base font-bold text-gray-900 tracking-wide">Edit Barang</h2>
          <button type="button" onClick={onClose}
            className="absolute right-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 overflow-y-auto max-h-[75vh] pr-1">

          {/* ===== GRID 2 KOLOM ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">

            <Field label="Tanggal Transaksi">
              <input type="date" name="tanggalTransaksi" value={formData.tanggalTransaksi} onChange={handleInputChange} className={inputClass} />
            </Field>

            <Field label="Harga Aset">
              <input type="number" min="0" name="hargaAset" value={formData.hargaAset} onChange={handleInputChange}
                placeholder="Rp.0" className={inputClass} />
            </Field>

            <Field label="Nama Barang *">
              <input type="text" name="nama" required value={formData.nama} onChange={handleInputChange} className={inputClass} />
            </Field>

            <Field label="Penanggung Jawab">
              <input type="text" name="penanggungJawab" value={formData.penanggungJawab} onChange={handleInputChange} className={inputClass} />
            </Field>

            <Field label="Merk">
              <input type="text" name="merk" value={formData.merk} onChange={handleInputChange} className={inputClass} />
            </Field>

            <Field label="Lokasi">
              <input type="text" name="lokasi" value={formData.lokasi} onChange={handleInputChange} className={inputClass} />
            </Field>

            <Field label="Tipe">
              <input type="text" name="tipe" value={formData.tipe} onChange={handleInputChange} className={inputClass} />
            </Field>

            <Dropdown label="Program/Project" field="program" value={formData.program} options={PROGRAM_OPTIONS} zIndex="z-40" />

            <Field label="Kode">
              <input type="text" name="kode" value={formData.kode} onChange={handleInputChange} className={inputClass} />
            </Field>

            <Dropdown label="Status" field="status" value={formData.status} options={STATUS_OPTIONS} zIndex="z-30" />

            <Field label="No Inventaris GA">
              <input type="text" name="nomorInventarisGa" value={formData.nomorInventarisGa} onChange={handleInputChange} className={inputClass} />
            </Field>

            <Dropdown label="Kondisi" field="kondisi" value={formData.kondisi} options={KONDISI_OPTIONS} zIndex="z-20" />

            <Field label="Serial Number">
              <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} className={inputClass} />
            </Field>

            <Field label="Quantity">
              <input type="number" min="1" name="quantity" value={formData.quantity} onChange={handleInputChange} className={inputClass} />
            </Field>

            <Field label="Part Number">
              <input type="text" name="partNumber" value={formData.partNumber} onChange={handleInputChange} className={inputClass} />
            </Field>

          </div>

          {/* ===== FOTO BARANG (galeri, existing + baru) ===== */}
          <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-100">
            <label className={`${labelClass} flex items-center gap-1`}><ImageIcon size={12} /> Foto Barang</label>

            {(existingFoto.length > 0 || pendingFoto.length > 0) && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-1">
                {existingFoto.map((f) => (
                  <div key={`existing-${f.id}`} className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img src={`${FILE_BASE}${f.file_path}`} alt="foto" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => deleteExistingFoto(f.id)}
                      className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 cursor-pointer">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {pendingFoto.map((file, idx) => (
                  <div key={`pending-${idx}`} className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0.5 left-0.5 bg-blue-600 text-white text-[8px] px-1 rounded">Baru</span>
                    <button type="button" onClick={() => removePendingFoto(idx)}
                      className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 cursor-pointer">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3">
              <label className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#005CA9] text-[10px] font-bold rounded-lg border border-blue-200 cursor-pointer transition-colors shrink-0">
                Pilih File
                <input type="file" accept="image/*" multiple onChange={handleAddFoto} className="hidden" />
              </label>
              <span className="text-[10px] text-gray-500 font-medium truncate">
                {pendingFoto.length === 0 ? 'Tidak ada file yang dipilih' : `${pendingFoto.length} file dipilih`}
              </span>
            </div>
          </div>

          {/* ===== MANUAL BOOK (existing + baru) ===== */}
          <div className="flex flex-col gap-1.5">
            <label className={`${labelClass} flex items-center gap-1`}><FileText size={12} /> Foto Manual Book</label>

            {(existingManualBook.length > 0 || pendingManualBook.length > 0) && (
              <div className="flex flex-col gap-1 mb-1">
                {existingManualBook.map((m) => (
                  <div key={`existing-${m.id}`} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                    <a href={`${FILE_BASE}${m.file_path}`} target="_blank" rel="noreferrer"
                      className="text-[10px] text-[#005CA9] font-medium truncate hover:underline">
                      {m.file_path.split('/').pop()}
                    </a>
                    <button type="button" onClick={() => deleteExistingManualBook(m.id)} className="text-red-500 hover:text-red-700 cursor-pointer shrink-0 ml-2">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {pendingManualBook.map((file, idx) => (
                  <div key={`pending-${idx}`} className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
                    <span className="text-[10px] text-gray-600 font-medium truncate">{file.name} (baru)</span>
                    <button type="button" onClick={() => removePendingManualBook(idx)} className="text-red-500 hover:text-red-700 cursor-pointer shrink-0 ml-2">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3">
              <label className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#005CA9] text-[10px] font-bold rounded-lg border border-blue-200 cursor-pointer transition-colors shrink-0">
                Pilih File
                <input type="file" accept="application/pdf,image/*" multiple onChange={handleAddManualBook} className="hidden" />
              </label>
              <span className="text-[10px] text-gray-500 font-medium truncate">
                {pendingManualBook.length === 0 ? 'Tidak ada file yang dipilih' : `${pendingManualBook.length} file dipilih`}
              </span>
            </div>
          </div>

          {/* ===== DOKUMENTASI TRANSAKSI (existing + baru) ===== */}
          <div className="flex flex-col gap-1.5">
            <label className={`${labelClass} flex items-center gap-1`}><FileCheck size={12} /> Foto Dokumentasi Transaksi</label>

            {(existingDokumentasi.length > 0 || pendingDokumentasi.length > 0) && (
              <div className="flex flex-col gap-1 mb-1">
                {existingDokumentasi.map((d) => (
                  <div key={`existing-${d.id}`} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                    <a href={`${FILE_BASE}${d.file_path}`} target="_blank" rel="noreferrer"
                      className="text-[10px] text-[#005CA9] font-medium truncate hover:underline">
                      {d.file_path.split('/').pop()}
                    </a>
                    <button type="button" onClick={() => deleteExistingDokumentasi(d.id)} className="text-red-500 hover:text-red-700 cursor-pointer shrink-0 ml-2">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {pendingDokumentasi.map((file, idx) => (
                  <div key={`pending-${idx}`} className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
                    <span className="text-[10px] text-gray-600 font-medium truncate">{file.name} (baru)</span>
                    <button type="button" onClick={() => removePendingDokumentasi(idx)} className="text-red-500 hover:text-red-700 cursor-pointer shrink-0 ml-2">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3">
              <label className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#005CA9] text-[10px] font-bold rounded-lg border border-blue-200 cursor-pointer transition-colors shrink-0">
                Pilih File
                <input type="file" accept="application/pdf,image/*" multiple onChange={handleAddDokumentasi} className="hidden" />
              </label>
              <span className="text-[10px] text-gray-500 font-medium truncate">
                {pendingDokumentasi.length === 0 ? 'Tidak ada file yang dipilih' : `${pendingDokumentasi.length} file dipilih`}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100 mt-1">
            <button type="button" onClick={onClose}
              className="px-5 py-2 bg-[#E5E5E5] hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer">
              Batal
            </button>
            <button type="submit" disabled={submitting}
              className="px-6 py-2 bg-[#005CA9] hover:bg-[#004B8A] text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-60">
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}