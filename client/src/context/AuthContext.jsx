import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const token = localStorage.getItem('token')
    if (token) {
      authAPI
        .me()
        .then((res) => {
          if (!cancelled) setUser(res.data)
        })
        .catch(() => {
          if (!cancelled) localStorage.removeItem('token')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    } else {
      setLoading(false)
    }
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    const res = await authAPI.login({ email, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    return res.data
  }, [])

  const register = useCallback(async (data) => {
    setError(null)
    const res = await authAPI.register(data)
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    return res.data
  }, [])

  const logout = useCallback(() => {
    const request = authAPI.logout().catch(() => {})
    localStorage.removeItem('token')
    setUser(null)
    return request
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
