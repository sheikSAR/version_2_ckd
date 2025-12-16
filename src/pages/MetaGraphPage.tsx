import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/ConfiguratorDemoPage.css'

const MetaGraphPage = () => {
  const navigate = useNavigate()

  return (
    <div className="demo-page-container">
      <div className="demo-page-content">
        <button className="back-button" onClick={() => navigate('/configurator/landing')}>
          ← Back to Configuration Landing
        </button>
        
        <h1 className="demo-page-title">Meta Graph</h1>
        
        <div className="demo-page-card">
          <p className="demo-page-text">This is a demo page. Graph rendering will be implemented here.</p>
        </div>
      </div>
    </div>
  )
}

export default MetaGraphPage
