import { create } from 'zustand'

const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  pakar: JSON.parse(localStorage.getItem('pakar') || 'null'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: (token, pakar) => {
    localStorage.setItem('token', token)
    localStorage.setItem('pakar', JSON.stringify(pakar))
    set({ token, pakar, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('pakar')
    set({ token: null, pakar: null, isAuthenticated: false })
  },
}))

export default useAuthStore
