import api from './api.js'

export const bookingService = {
  getAll: (params) => api.get('/booking-ruangan', { params }).then((res) => res.data),
  create: (payload) => api.post('/booking-ruangan', payload).then((res) => res.data),
  cancel: (id) => api.delete(`/booking-ruangan/${id}`).then((res) => res.data),
}
