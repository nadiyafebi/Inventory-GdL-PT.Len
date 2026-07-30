import api from './api.js'

export const peminjamanService = {
  getAll: (params) => api.get('/peminjaman', { params }).then((res) => res.data),
  createPeminjaman: (payload) => api.post('/peminjaman', payload).then((res) => res.data),
  createPengembalian: (id, payload) =>
    api.post(`/peminjaman/${id}/pengembalian`, payload).then((res) => res.data),
}
