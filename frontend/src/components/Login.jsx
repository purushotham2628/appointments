import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import '../styles/Login.css'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(formData.email, formData.password)
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const handleDemoLogin = (email, password) => {
    setFormData({ email, password })
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Clinic Front Desk System</h1>
          <p>Sign in to manage appointments and queue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials">
          <h3>Demo Credentials</h3>
          <div className="demo-buttons">
            <button 
              type="button"
              className="demo-button"
              onClick={() => handleDemoLogin('admin@clinic.com', 'admin123')}
            >
              Admin Login
            </button>
            <button 
              type="button"
              className="demo-button"
              onClick={() => handleDemoLogin('frontdesk@clinic.com', 'frontdesk123')}
            >
              Front Desk Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login