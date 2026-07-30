import React from 'react';
import { Check, X } from 'lucide-react';
import { getBookingStatusClass } from '../../utils/formatBookingStatus.js';

export default function BookingTable({ data = [], onDetail, onApprove, onReject }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b">
            <th className="py-2 px-3 font-medium">Ruangan</th>
            <th className="py-2 px-3 font-medium">Waktu</th>
            <th className="py-2 px-3 font-medium">Pemesan</th>
            <th className="py-2 px-3 font-medium">Unit</th>
            <th className="py-2 px-3 font-medium">Approval</th>
            <th className="py-2 px-3 font-medium text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const needsApproval = row.status === 'Menunggu Approval';

            return (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3 font-medium text-gray-700">{row.ruangan}</td>
                <td className="py-2 px-3 text-gray-600">
                  {row.tanggal}, {row.jamMulai} - {row.jamSelesai}
                </td>
                <td className="py-2 px-3 text-gray-600">{row.pemesan}</td>
                <td className="py-2 px-3 text-gray-500">{row.unit}</td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-1 rounded text-xs ${getBookingStatusClass(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <div className="flex justify-end gap-2">
                    {needsApproval ? (
                      <>
                        <button
                          onClick={() => onApprove?.(row)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-green-50 text-green-600 hover:bg-green-100"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={() => onReject?.(row)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-red-50 text-red-500 hover:bg-red-100"
                        >
                          <X size={13} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onDetail?.(row)}
                        className="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        Detail
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-gray-400 text-sm">
                Tidak ada booking ditemukan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}