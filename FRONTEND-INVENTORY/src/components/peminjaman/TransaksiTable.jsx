import React from 'react';

const FILE_BASE = 'http://172.16.10.176:5000';

function formatTanggal(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID');
}

export default function TransaksiTable({ data = [], onDetail, onApprove, onReject }) {
  return (
    <div className="overflow-x-auto bg-white rounded-[10px]">
      <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
        <thead>
          <tr className="bg-[#F1F5F9] text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
            <th className="p-4 text-center">Status</th>
            <th className="p-4">Foto</th>
            <th className="p-4">Nama Barang</th>
            <th className="p-4">Merk</th>
            <th className="p-4">Tipe</th>
            <th className="p-4">Kode Barang</th>
            <th className="p-4">No Inventaris GA</th>
            <th className="p-4">Serial Number</th>
            <th className="p-4">Part Number</th>
            <th className="p-4">Penanggung Jawab</th>
            <th className="p-4">Lokasi</th>
            <th className="p-4">Program/Project</th>
            <th className="p-4">Peminjam</th>
            <th className="p-4">Unit</th>
            <th className="p-4">Tanggal Pinjam</th>
            <th className="p-4">Rencana/Aktual Kembali</th>
            <th className="p-4">Approval</th>
            <th className="p-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
          {data.map((row) => {
            const currentStatus = row.status ? row.status.toLowerCase() : '';
            const isMenunggu = currentStatus.includes('menunggu') || currentStatus === 'pending';
            const isSudahKembali = row.tipe === 'pengembalian';
            const foto = isSudahKembali ? row.fotoSesudah : row.fotoSebelum;

            return (
              <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">

                <td className="p-4 text-center">
                  <span className="inline-block px-3 py-1 bg-[#E2E8F0] text-gray-600 rounded-full font-bold text-[10px] min-w-[55px]">
                    {row.status || (row.tipe === 'peminjaman' ? 'Pinjam' : 'Kembali')}
                  </span>
                </td>

                <td className="p-4">
                  {foto ? (
                    <img src={`${FILE_BASE}${foto}`} alt="foto"
                      className="w-9 h-9 rounded-lg object-cover border border-gray-200" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gray-100" />
                  )}
                </td>

                <td className="p-4 font-bold text-gray-900">{row.barang}</td>
                <td className="p-4 text-gray-600">{row.merk || '-'}</td>
                <td className="p-4 text-gray-600">{row.tipeBarang || '-'}</td>
                <td className="p-4 text-gray-600">{row.kodeBarang || '-'}</td>
                <td className="p-4 text-gray-600">{row.nomorInventarisGa || '-'}</td>
                <td className="p-4 text-gray-600">{row.serialNumber || '-'}</td>
                <td className="p-4 text-gray-600">{row.partNumber || '-'}</td>
                <td className="p-4 text-gray-600">{row.penanggungJawab || '-'}</td>
                <td className="p-4 text-gray-600">{row.lokasi || '-'}</td>
                <td className="p-4 text-gray-600">{row.programProject || '-'}</td>

                <td className="p-4 text-gray-800 font-semibold">{row.peminjam}</td>
                <td className="p-4 text-gray-500">{row.unit}</td>

                <td className="p-4 text-gray-600">{formatTanggal(row.tanggalPinjam)}</td>
                <td className="p-4 text-gray-600">
                  {isSudahKembali ? formatTanggal(row.tanggalKembaliAktual) : formatTanggal(row.tanggalKembaliRencana)}
                </td>

                <td className="p-4">
                  <span className="inline-block px-3 py-0.5 bg-[#E2E8F0] text-gray-700 rounded-md text-[10px] font-bold">
                    {row.approval || (isMenunggu ? 'Menunggu' : 'Disetujui')}
                  </span>
                </td>

                <td className="p-4 text-center">
                  {isMenunggu ? (
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => onApprove?.(row)}
                        className="w-7 h-7 bg-white hover:bg-green-50 rounded-lg border border-gray-300 flex items-center justify-center text-green-600 font-bold text-xs shadow-xs transition-colors"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => onReject?.(row)}
                        className="w-7 h-7 bg-white hover:bg-red-50 rounded-lg border border-gray-300 flex items-center justify-center text-red-600 font-bold text-xs shadow-xs transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onDetail?.(row)}
                      className="px-4 py-1.5 bg-[#E2E8F0] text-gray-700 text-[10px] font-bold rounded-lg hover:bg-gray-300 shadow-xs transition-colors"
                    >
                      Detail
                    </button>
                  )}
                </td>

              </tr>
            );
          })}

          {data.length === 0 && (
            <tr>
              <td colSpan={18} className="py-8 text-center text-gray-400 font-medium text-xs bg-white">
                Tidak ada data transaksi yang ditemukan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}