import axios from 'axios'

// Production backend URL
const PRODUCTION_API_URL = 'http://localhost:5000'

// Use environment variable if available, otherwise use production URL
const baseURL = import.meta.env.VITE_API_URL || PRODUCTION_API_URL

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor (token)
api.interceptors.request.use(
  (config) => {
    // Prefer long-lived token from localStorage, fall back to sessionStorage
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token') || sessionStorage.getItem('token')
        : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data)
    } else if (error.request) {
      console.error('API Error: No response received', error.request)
    } else {
      console.error('API Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api
