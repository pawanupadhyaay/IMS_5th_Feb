import { createContext, useState, useEffect } from 'react'
import api from '../services/api'

export const AuthContext = createContext()

// Prefer long-lived token from localStorage, then fall back to sessionStorage
const getInitialToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(getInitialToken)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data.user)
    } catch (error) {
      // Clear any stale tokens from both storage locations
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
      }
      setToken(null)
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token: newToken, user: userData } = response.data

      if (typeof window !== 'undefined') {
        if (rememberMe) {
          // Persist token + email across sessions
          localStorage.setItem('token', newToken)
          localStorage.setItem('rememberedEmail', email)
          sessionStorage.removeItem('token')
        } else {
          // Session-only token, no email remembered
          sessionStorage.setItem('token', newToken)
          localStorage.removeItem('token')
          localStorage.removeItem('rememberedEmail')
        }
      }

      setToken(newToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      setUser(userData)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password })
      const { token: newToken, user: userData } = response.data
      localStorage.setItem('token', newToken)
      setToken(newToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      setUser(userData)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      }
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      // Intentionally keep rememberedEmail so login can be prefilled next time
    }
    setToken(null)
    setUser(null)
    delete api.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

