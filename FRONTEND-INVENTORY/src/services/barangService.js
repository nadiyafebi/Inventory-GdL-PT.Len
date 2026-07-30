import api from './api.js'

export const barangService = {
  getAll: (params) => api.get('/barang', { params }).then((res) => res.data),
  getById: (id) => api.get(`/barang/${id}`).then((res) => res.data),
  create: (payload) => api.post('/barang', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/barang/${id}`, payload).then((res) => res.data),
  delete: (id) => api.delete(`/barang/${id}`).then((res) => res.data),
  export: (params) => api.get('/barang/export', { params, responseType: 'blob' }),
}
