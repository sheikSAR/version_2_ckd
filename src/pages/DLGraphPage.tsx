import React from 'react'
import { useNavigate } from 'react-router-dom'
import ConfiguratorNavbar from '../components/ConfiguratorNavbar'
import '../styles/ConfiguratorDemoPage.css'

const DLGraphPage = () => {
  const navigate = useNavigate()

  return (
    <>
      <ConfiguratorNavbar />
      <div className="demo-page-container">
      <div className="demo-page-content">
        <button
          className="back-button"
          onClick={() => navigate('/configurator/landing')}
        >
          ← Back to Configuration Landing
        </button>

        <h1 className="demo-page-title">DL Graph</h1>

        <div className="demo-page-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
              Patient 1 – Deep Learning Relationship Graph
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#666' }}>
              Visual representation of learned feature interactions for Patient 1
            </p>
          </div>

          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#fafafa',
              borderRadius: '12px',
              padding: '16px'
            }}
          >
            <img
              src="https://res.cloudinary.com/dk2wudmxh/image/upload/v1765962178/EY00116_ctbh6r.jpg"
              alt="Patient 1 DL Graph"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default DLGraphPage
