import React from 'react';
import { ImageIcon, X, CheckCircle2 } from 'lucide-react';

const badgeBase = 'px-2.5 py-1 rounded-md text-xs font-semibold';
const SERVER_BASE = 'http://172.16.13.82:5000';

function formatTanggalJam(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DetailTransaksiModal({ isOpen, onClose, transaksi, onApprove, onReject, onVerifikasi }) {
  if (!isOpen || !transaksi) return null;

  const isPeminjaman = transaksi.tipe === 'peminjaman';
  const isPeminjamanPending = isPeminjaman && transaksi.status === 'Menunggu Approval';
  const isPengembalianCekKembali = !isPeminjaman && transaksi.status === 'Cek Kembali';
  const isSelesai = transaksi.status === 'Selesai';

  const title = isPeminjaman ? 'Detail Transaksi Peminjaman' : 'Detail Transaksi Pengembalian';
  const tipeLabel = isPeminjaman ? 'Pinjam' : 'Kembali';
  const statusLabel = isSelesai
    ? 'Diterima baik'
    : isPeminjamanPending || isPengembalianCekKembali
    ? 'Menunggu Persetujuan'
    : transaksi.status;

  const fotoSebelumUrl = transaksi.fotoSebelum 
    ? `${SERVER_BASE}/${transaksi.fotoSebelum.startsWith('/') ? transaksi.fotoSebelum.substring(1) : transaksi.fotoSebelum}` 
    : null;

  const fotoSesudahUrl = transaksi.fotoSesudah 
    ? `${SERVER_BASE}/${transaksi.fotoSesudah.startsWith('/') ? transaksi.fotoSesudah.substring(1) : transaksi.fotoSesudah}` 
    : null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="p-6 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-1">
            <div>
              <p className="text-xs text-gray-400 font-medium">{title}</p>
              <h2 className="text-lg font-bold text-gray-800">{transaksi.barang}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          {/* Badges */}
          <div className="flex gap-2 mt-2 mb-4">
            <span className={`${badgeBase} bg-gray-100 text-gray-600`}>{tipeLabel}</span>
            <span className={`${badgeBase} bg-gray-100 text-gray-600`}>
              {statusLabel}
            </span>
          </div>

          {/* Info grid */}
          <div className="space-y-2 text-xs mb-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Peminjam</span>
              <span className="font-medium text-gray-700">{transaksi.peminjam}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Unit</span>
              <span className="font-medium text-gray-700">{transaksi.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tanggal pinjam</span>
              <span className="font-medium text-gray-700">{formatTanggalJam(transaksi.tanggalPinjam)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tanggal kembali</span>
              <span className="font-medium text-gray-700">
                {formatTanggalJam(transaksi.tanggalKembaliAktual || transaksi.tanggalKembaliRencana)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Kondisi awal</span>
              <span className="font-medium text-gray-700">{transaksi.kondisiAwal || '-'}</span>
            </div>
            {!isPeminjaman && (
              <div className="flex justify-between">
                <span className="text-gray-400">Kondisi saat kembali</span>
                <span className="font-medium text-gray-700">{transaksi.kondisiAkhir || '-'}</span>
              </div>
            )}
            {transaksi.diverifikasiOleh && (
              <div className="flex justify-between">
                <span className="text-gray-400">Diverifikasi oleh</span>
                <span className="font-medium text-gray-700">
                  {transaksi.diverifikasiOleh} {transaksi.tanggalVerifikasi ? `— ${formatTanggalJam(transaksi.tanggalVerifikasi)}` : ''}
                </span>
              </div>
            )}
          </div>

          {/* Grid Dua Kolom untuk Foto ("Foto saat dipinjam" & "Foto saat Dikembalikan") */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Foto saat dipinjam */}
            <div>
              <p className="text-[11px] text-gray-400 mb-1.5 font-medium">Foto saat dipinjam</p>
              {fotoSebelumUrl ? (
                <img
                  src={fotoSebelumUrl}
                  alt="Foto saat dipinjam"
                  className="h-28 w-full object-cover rounded-xl border border-gray-200 bg-gray-50"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="h-28 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
                  <ImageIcon size={24} />
                </div>
              )}
            </div>

            {/* Foto saat Dikembalikan */}
            <div>
              <p className="text-[11px] text-gray-400 mb-1.5 font-medium">Foto saat Dikembalikan</p>
              {fotoSesudahUrl ? (
                <img
                  src={fotoSesudahUrl}
                  alt="Foto saat Dikembalikan"
                  className="h-28 w-full object-cover rounded-xl border border-gray-200 bg-gray-50"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="h-28 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
                  <ImageIcon size={24} />
                </div>
              )}
            </div>
          </div>

          {/* Catatan */}
          {transaksi.catatan && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">Catatan</p>
              <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">{transaksi.catatan}</p>
            </div>
          )}

          {/* Banner Hijau Status Selesai / Terverifikasi */}
          {isSelesai && (
            <div className="flex items-start gap-2 bg-[#E6F4EA] text-[#137333] text-xs rounded-xl p-3 mb-4 font-medium">
              <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
              <span>
                Barang telah diverifikasi dan dikembalikan ke inventaris dalam kondisi baik.
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            {(isPeminjamanPending || isPengembalianCekKembali) && (
              <>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  Tutup
                </button>
                {isPeminjaman && (
                  <button
                    onClick={() => onReject?.(transaksi)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    Tolak
                  </button>
                )}
                <button
                  onClick={() =>
                    isPeminjaman ? onApprove?.(transaksi) : onVerifikasi?.(transaksi)
                  }
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#005CA9] text-white hover:bg-[#004B8A]"
                >
                  {isPeminjaman ? 'Setujui' : 'Verifikasi'}
                </button>
              </>
            )}

            {isSelesai && (
              <>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  Tutup
                </button>
              </>
            )}

            {!isPeminjamanPending && !isPengembalianCekKembali && !isSelesai && (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200"
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