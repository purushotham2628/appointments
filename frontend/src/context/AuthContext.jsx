import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token is still valid
      authService.getProfile()
        .then(response => {
          setUser(response.data.user)
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password })

      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        setUser(response.data.user)
        return { success: true }
      } else {
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)

      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        setUser(response.data.user)
        return { success: true }
      } else {
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}