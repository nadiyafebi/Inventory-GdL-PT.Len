import React from 'react';

export default function ApprovalList({ items = [], onApproveClick, onRejectClick }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-md">
      <h3 className="text-sm font-bold text-gray-800 mb-4">MENUNGGU PERSETUJUAN</h3>
      
      {items.length === 0 ? (
        <p className="text-xs text-gray-400">Tidak ada pending Persetujuan</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="text-xs font-bold text-gray-800">{item.nama || item.nama_barang || item.barang || '-'}</p>
                <p className="text-[10px] text-gray-500">
                  Peminjam: {item.peminjam || '-'} | Divisi: {item.unit || item.divisi || '-'}
                </p>
              </div>
              
              {/* Tombol Aksi (Ceklis dan Cancel/Silang) */}
              <div className="flex gap-2">
                {/* Tombol Ceklis (Approve / Buka Modal Detail) */}
                <button
                  type="button"
                  onClick={() => {
                    if (onApproveClick) {
                      onApproveClick(item);
                    }
                  }}
                  className="w-7 h-7 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg flex items-center justify-center transition cursor-pointer font-bold text-xs"
                  title="Setujui / Detail"
                >
                  ✓
                </button>

                {/* Tombol Cancel / Silang (Reject) */}
                <button
                  type="button"
                  onClick={() => {
                    if (onRejectClick) {
                      onRejectClick(item);
                    }
                  }}
                  className="w-7 h-7 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center justify-center transition cursor-pointer font-bold text-xs"
                  title="Tolak"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}