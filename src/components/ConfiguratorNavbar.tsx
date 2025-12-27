import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/ConfiguratorNavbar.css'

const ConfiguratorNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    navigate('/login')
  }

  return (
    <nav className={`configurator-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logos">
          <div className="logo-wrapper">
            <img
              src="https://www.europeandiabetesfoundation.org/assets/img/efsd-logo-blue.svg"
              alt="European Diabetes Foundation"
              className="navbar-logo efsd-logo"
            />
          </div>
          <div className="navbar-divider"></div>
          <div className="logo-wrapper">
            <img
              src="https://res.cloudinary.com/dk2wudmxh/image/upload/v1765918133/MDRF__Chennai_Logo_qfwlna.png"
              alt="MDRF"
              className="navbar-logo mdrf-logo"
            />
          </div>
          <div className="navbar-divider"></div>
          <div className="logo-wrapper text-logo-wrapper">
            <h2 className="navbar-text-logo">SESHU'S RESEARCH LAB</h2>
          </div>
        </div>
        <div className="navbar-title">
          <div className="navbar-title-content">
            <h1>Data Configurator</h1>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  )
}

export default ConfiguratorNavbar
