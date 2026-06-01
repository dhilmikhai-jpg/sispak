import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor – tambahkan token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor – handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('pakar')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  login:          (data)   => api.post('/auth/login', data),
  getMe:          ()       => api.get('/auth/me'),
  changePassword: (data)   => api.put('/auth/change-password', data),
}

// ── Gejala ───────────────────────────────────────────────────
export const gejalaAPI = {
  getAll:         ()       => api.get('/gejala'),
  getByKode:      (kode)   => api.get(`/gejala/${kode}`),
  getByKerusakan: (kode)   => api.get(`/gejala/kerusakan/${kode}`),
  create:         (data)   => api.post('/gejala', data),
  update:         (kode, data) => api.put(`/gejala/${kode}`, data),
  delete:         (kode)   => api.delete(`/gejala/${kode}`),
}

// ── Kerusakan ────────────────────────────────────────────────
export const kerusakanAPI = {
  getAll:         ()       => api.get('/kerusakan'),
  getByKode:      (kode)   => api.get(`/kerusakan/${kode}`),
  create:         (data)   => api.post('/kerusakan', data),
  update:         (kode, data) => api.put(`/kerusakan/${kode}`, data),
  delete:         (kode)   => api.delete(`/kerusakan/${kode}`),
}

// ── Kasus CBR ────────────────────────────────────────────────
export const kasusAPI = {
  getAll:         ()       => api.get('/kasus'),
  getById:        (id)     => api.get(`/kasus/${id}`),
  getStats:       ()       => api.get('/kasus/stats'),
  create:         (data)   => api.post('/kasus', data),
  update:         (id, data) => api.put(`/kasus/${id}`, data),
  verify:         (id)     => api.patch(`/kasus/${id}/verify`),
  delete:         (id)     => api.delete(`/kasus/${id}`),
}

// ── Diagnosis ────────────────────────────────────────────────
export const diagnosisAPI = {
  diagnose:         (data)   => api.post('/diagnosis', data),
  chatDiagnose:     (data)   => api.post('/diagnosis/chat/diagnose', data),
  chat:             (data)   => api.post('/diagnosis/chat', data),
  getDashboard:     ()       => api.get('/diagnosis/dashboard'),
  getLaporan:       (params) => api.get('/diagnosis/laporan', { params }),
  getDetailLaporan: (id)     => api.get(`/diagnosis/laporan/${id}`),
}

export default api
