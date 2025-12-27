import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ParticleTextEffect } from '../components/ui/particle-text-effect'

type Role = 'user' | 'admin' | 'configurator'

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

  const backgroundLayerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
  }

  const contentLayerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100vh',
    padding: isMobile ? '15px' : '20px',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    overflowY: 'auto',
  }

  return (
    <div>
      <div style={backgroundLayerStyle}>
        <ParticleTextEffect words={["EFSD", "MDRF", "DIABETES"]} position="left" />
        <ParticleTextEffect words={["EFSD", "MDRF", "DIABETES"]} position="right" />
      </div>

      <div style={{ ...contentLayerStyle, position: 'relative' }}>
        <div style={{
          position: 'fixed',
          top: isMobile ? '15px' : '30px',
          left: isMobile ? '15px' : '30px',
          zIndex: 40,
          display: 'block',
        }}>
          <img
            src="https://res.cloudinary.com/dk2wudmxh/image/upload/v1766678682/EFSD_bbakla.png"
            alt="European Diabetes Foundation Logo"
            style={{
              width: 'auto',
              height: isMobile ? '60px' : '80px',
              display: 'block',
              filter: 'drop-shadow(0 4px 15px rgba(0, 0, 0, 0.15))',
              transition: 'transform 0.3s ease, filter 0.3s ease',
              opacity: 1,
              objectFit: 'contain',
            }}
            onError={(e) => {
              console.error('Failed to load logo:', e);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        <div style={{
          position: 'fixed',
          top: isMobile ? '15px' : '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          textAlign: 'center',
          maxWidth: isMobile ? '200px' : 'auto',
          paddingX: isMobile ? '10px' : '0px',
        }}>
          <h2 style={{
            fontSize: isMobile ? '18px' : '40px',
            fontWeight: 900,
            color: '#1a1a1a',
            margin: 0,
            letterSpacing: '2px',
            textShadow: '0 2px 4px rgba(255, 255, 255, 0.5)',
            opacity: 1,
            wordBreak: 'break-word',
          }}>
            SESU'S RESEARCH LAB
          </h2>
        </div>

        <div style={{
          position: 'fixed',
          top: isMobile ? '15px' : '30px',
          right: isMobile ? '15px' : '30px',
          zIndex: 40,
        }}>
          <img
            src="https://res.cloudinary.com/dk2wudmxh/image/upload/v1765918133/MDRF__Chennai_Logo_qfwlna.png"
            alt="MDRF Logo"
            style={{
              width: 'auto',
              height: isMobile ? '60px' : '80px',
              filter: 'drop-shadow(0 4px 15px rgba(0, 0, 0, 0.15))',
              transition: 'transform 0.3s ease, filter 0.3s ease',
              opacity: 1,
              objectFit: 'contain',
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? '20px' : '30px',
          width: '100%',
          maxWidth: isMobile ? '100%' : '400px',
          boxSizing: 'border-box',
          marginTop: isMobile ? '60px' : '0px',
        }}>
          <div style={{
            background: 'rgba(26, 31, 46, 0.85)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(102, 126, 234, 0.25)',
            padding: isMobile ? '25px 20px' : '40px 30px',
            borderRadius: '20px',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 0 20px rgba(102, 126, 234, 0.05),
              0 0 40px rgba(102, 126, 234, 0.1)
            `,
            width: '100%',
            boxSizing: 'border-box',
            animation: 'fadeInUp 0.8s ease 0.2s both',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: isMobile ? '25px' : '35px',
            }}>
              <h1 style={{
                margin: 0,
                fontSize: isMobile ? '22px' : '28px',
                fontWeight: 700,
                color: '#e0e0e0',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              }}>CKD Analysis</h1>
              <p style={{
                margin: '10px 0 0 0',
                color: '#b0b8c1',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: 400,
              }}>Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: isMobile ? '20px' : '25px' }}>
                <label htmlFor="username" style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: 600,
                  color: '#d0d8e0',
                  fontSize: isMobile ? '12px' : '14px',
                  letterSpacing: '0.5px',
                }}>Username</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px 14px' : '12px 16px',
                      border: '1.5px solid rgba(102, 126, 234, 0.25)',
                      borderRadius: '10px',
                      fontSize: isMobile ? '14px' : '15px',
                      boxSizing: 'border-box',
                      transition: 'all 0.3s ease',
                      backgroundColor: 'rgba(15, 20, 25, 0.4)',
                      backdropFilter: 'blur(10px)',
                      color: '#d0d8e0',
                      boxShadow: 'inset 0 0 10px rgba(102, 126, 234, 0.05)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)'
                      e.target.style.backgroundColor = 'rgba(15, 20, 25, 0.6)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(102, 126, 234, 0.25)'
                      e.target.style.backgroundColor = 'rgba(15, 20, 25, 0.4)'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: isMobile ? '20px' : '25px' }}>
                <label htmlFor="password" style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: 600,
                  color: '#d0d8e0',
                  fontSize: isMobile ? '12px' : '14px',
                  letterSpacing: '0.5px',
                }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px 14px' : '12px 16px',
                      border: '1.5px solid rgba(102, 126, 234, 0.25)',
                      borderRadius: '10px',
                      fontSize: isMobile ? '14px' : '15px',
                      boxSizing: 'border-box',
                      transition: 'all 0.3s ease',
                      backgroundColor: 'rgba(15, 20, 25, 0.4)',
                      backdropFilter: 'blur(10px)',
                      color: '#d0d8e0',
                      boxShadow: 'inset 0 0 10px rgba(102, 126, 234, 0.05)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)'
                      e.target.style.backgroundColor = 'rgba(15, 20, 25, 0.6)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(102, 126, 234, 0.25)'
                      e.target.style.backgroundColor = 'rgba(15, 20, 25, 0.4)'
                    }}
                  />
                </div>
              </div>

              {error && <div style={{
                color: '#ff6b6b',
                backgroundColor: 'rgba(211, 47, 47, 0.15)',
                backdropFilter: 'blur(5px)',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                borderLeft: '4px solid #ff6b6b',
                animation: 'slideIn 0.3s ease',
                border: '1px solid rgba(255, 107, 107, 0.3)',
              }}>{error}</div>}

              <button type="submit" disabled={loading} style={{
                width: '100%',
                padding: isMobile ? '12px' : '14px',
                background: loading ? 'linear-gradient(135deg, #555 0%, #333 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                letterSpacing: '0.5px',
                boxShadow: loading ? '0 4px 10px rgba(0, 0, 0, 0.3)' : '0 8px 20px rgba(102, 126, 234, 0.4)',
              }}>
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
