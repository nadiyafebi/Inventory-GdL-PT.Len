import api from './api.js'

export const riwayatService = {
  getAll: (params) => api.get('/riwayat', { params }).then((res) => res.data),
  export: (params) => api.get('/riwayat/export', { params, responseType: 'blob' }),
}
