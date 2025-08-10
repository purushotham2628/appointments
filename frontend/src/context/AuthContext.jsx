import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token in localStorage
    const token = localStorage.getItem('clinic_token')
    const userData = localStorage.getItem('clinic_user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
        authService.setToken(token)
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('clinic_token')
        localStorage.removeItem('clinic_user')
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      
      if (response.token && response.user) {
        localStorage.setItem('clinic_token', response.token)
        localStorage.setItem('clinic_user', JSON.stringify(response.user))
        authService.setToken(response.token)
        setUser(response.user)
        return { success: true }
      } else {
        return { success: false, error: 'Invalid response from server' }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('clinic_token')
    localStorage.removeItem('clinic_user')
    authService.setToken(null)
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}