import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ParticleTextEffect } from '../components/ui/particle-text-effect'
import { API_ENDPOINTS } from '../constants/api'
import { UserRole } from '../types'
import '../styles/LoginPage.css'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const navigate = useNavigate()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password,
      })

      if (response.data.success) {
        const role = response.data.role
        if (role === 'user') {
          navigate('/user')
        } else if (role === 'admin') {
          navigate('/admin')
        } else if (role === 'configurator') {
          navigate('/configurator')
        }
      } else {
        setError(response.data.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-background-layer">
        <ParticleTextEffect words={["EFSD", "MDRF", "DIABETES"]} position="left" />
        <ParticleTextEffect words={["EFSD", "MDRF", "DIABETES"]} position="right" />
      </div>

      <div className="login-content-layer">
        <div className={`logo-container logo-left ${isMobile ? 'mobile' : ''}`}>
          <img
            src="https://res.cloudinary.com/dk2wudmxh/image/upload/v1766678682/EFSD_bbakla.png"
            alt="European Diabetes Foundation Logo"
            className="organization-logo"
            onError={(e) => {
              console.error('Failed to load logo:', e);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        <div className={`logo-container logo-center ${isMobile ? 'mobile' : ''}`}>
          <h2 className="organization-title">SESU'S RESEARCH LAB</h2>
        </div>

        <div className={`logo-container logo-right ${isMobile ? 'mobile' : ''}`}>
          <img
            src="https://res.cloudinary.com/dk2wudmxh/image/upload/v1765918133/MDRF__Chennai_Logo_qfwlna.png"
            alt="MDRF Logo"
            className="organization-logo"
          />
        </div>

        <div className={`login-form-wrapper ${isMobile ? 'mobile' : ''}`}>
          <div className="login-card">
            <div className="card-header">
              <h1 className="login-title">CKD Analysis</h1>
              <p className="login-subtitle">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username</label>
                <div className="input-wrapper">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="form-input"
                  />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" disabled={loading} className={`login-button ${loading ? 'loading' : ''}`}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
