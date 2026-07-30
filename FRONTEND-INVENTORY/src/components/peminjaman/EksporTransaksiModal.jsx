import React, { useState } from 'react';
import { X } from 'lucide-react';

const FORMATS = ['Excel (.xlsx)', 'CSV (.csv)', 'PDF (.pdf)'];

export default function EksporTransaksiModal({ isOpen, onClose, onExport, total = 0 }) {
  const [jenis, setJenis] = useState('Semua');
  const [format, setFormat] = useState(FORMATS[0]);
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport?.({ jenis, format, tanggalMulai, tanggalSelesai });
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Ekspor Data Transaksi</h2>
            <p className="text-xs text-gray-400">
              Unduh data peminjaman dan pengembalian sesuai filter
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-2">Jenis transaksi</p>
            <div className="flex gap-2">
              {['Semua', 'Peminjaman', 'Pengembalian'].map((j) => (
                <button
                  key={j}
                  onClick={() => setJenis(j)}
                  className={`px-3 py-1.5 rounded-md text-xs border ${
                    jenis === j
                      ? 'border-[#005CA9] text-[#005CA9] bg-blue-50'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-gray-500 mb-2">Rentang tanggal</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <p className="text-gray-500 mb-2">Format file</p>
            <div className="flex gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-3 py-2 border rounded-md text-xs ${
                    format === f
                      ? 'border-[#005CA9] text-[#005CA9] bg-blue-50'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Total data yang akan diekspor: <span className="font-semibold text-gray-600">{total}</span> transaksi
          </p>

          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-md text-sm font-medium bg-[#005CA9] text-white hover:bg-[#004B8A]"
            >
              Ekspor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}