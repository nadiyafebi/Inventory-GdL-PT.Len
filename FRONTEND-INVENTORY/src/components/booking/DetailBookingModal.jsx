import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const badgeBase = 'px-2.5 py-1 rounded-md text-xs font-medium';

export default function DetailBookingModal({ isOpen, onClose, booking, onApprove, onReject }) {
  if (!isOpen || !booking) return null;

  const isBentrok = booking.status === 'Bentrok';
  const isPending = booking.status === 'Menunggu Approval' || isBentrok;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-1">
            <div>
              <p className="text-xs text-gray-400 font-medium">Detail Booking Ruangan</p>
              <h2 className="text-lg font-bold text-gray-800">{booking.ruangan}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          {/* Badge status */}
          <div className="flex gap-2 mt-2 mb-4">
            <span
              className={`${badgeBase} ${
                isBentrok
                  ? 'bg-red-50 text-red-600'
                  : booking.status === 'Disetujui'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              {booking.status}
            </span>
          </div>

          {/* Info grid */}
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Pemesan</span>
              <span className="font-medium text-gray-700">{booking.pemesan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Unit</span>
              <span className="font-medium text-gray-700">{booking.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tanggal</span>
              <span className="font-medium text-gray-700">{booking.tanggal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Jam</span>
              <span className="font-medium text-gray-700">
                {booking.jamMulai} - {booking.jamSelesai}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Keperluan</span>
              <span className="font-medium text-gray-700 text-right max-w-[60%]">
                {booking.keperluan}
              </span>
            </div>
          </div>

          {/* Banner bentrok */}
          {isBentrok && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 text-xs rounded-lg p-3 mb-4">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
              <span>
                Jadwal ini bentrok dengan booking lain: <strong>{booking.konflikDengan}</strong>.
                Mohon tinjau ulang sebelum menyetujui.
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2">
            {isPending ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  Tutup
                </button>
                <button
                  onClick={() => onReject?.(booking)}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  Tolak
                </button>
                <button
                  onClick={() => onApprove?.(booking)}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-[#005CA9] text-white hover:bg-[#004B8A]"
                >
                  Setujui
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}