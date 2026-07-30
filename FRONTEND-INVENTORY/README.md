# PDC Inventory — Frontend (React + Vite + Tailwind)

Struktur awal frontend untuk **Sistem Inventaris Gedung PDC** (LEN Industri), berdasarkan UI/UX yang sudah dibuat (login, register, dashboard admin/user, master barang, catat peminjaman/pengembalian, booking ruangan, riwayat).

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Struktur folder

- `src/pages` — halaman per role (auth, admin, user)
- `src/layouts` — layout Sidebar+Navbar untuk admin/user, layout khusus auth
- `src/components` — komponen reusable, dipecah per modul (common, dashboard, barang, peminjaman, booking, riwayat)
- `src/services` — layer API (axios), tinggal sesuaikan `VITE_API_BASE_URL` di `.env`
- `src/data/dummy` — data contoh supaya UI bisa jalan sebelum backend siap
- `src/context` — AuthContext untuk state login (role admin/user)
- `src/hooks` — useAuth, useFetch, useDebounce

## Catatan

- Saat ini login (`src/pages/auth/Login.jsx`) masih pakai dummy login (`login({ role: 'admin' })`) — ganti dengan `authService.login()` begitu endpoint backend siap.
- Semua service di `src/services` sudah disiapkan strukturnya (barang, peminjaman, booking, riwayat) tinggal disesuaikan dengan kontrak API asli dari tim backend.
- Styling pakai Tailwind dengan warna custom `navy` dan `brand.red` mengikuti identitas LEN (lihat `tailwind.config.js`).
- `CalendarBooking.jsx` masih placeholder — bisa diganti library seperti `react-day-picker` untuk kalender booking yang lebih interaktif.

## Environment variable

Copy `.env.example` ke `.env` lalu sesuaikan:

```
VITE_API_BASE_URL=http://localhost:8000/api
```
