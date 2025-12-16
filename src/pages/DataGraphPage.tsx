import React from 'react'
import { useNavigate } from 'react-router-dom'
import DataGraphVisualization from '../components/DataGraphVisualization'
import '../styles/ConfiguratorDemoPage.css'

const DataGraphPage = () => {
  const navigate = useNavigate()

  return (
    <div className="demo-page-container">
      <div className="demo-page-content">
        <button className="back-button" onClick={() => navigate('/configurator/landing')}>
          ← Back to Configuration Landing
        </button>

        <h1 className="demo-page-title">Data Graph (ER Diagram)</h1>

        <DataGraphVisualization />
      </div>
    </div>
  )
}

export default DataGraphPage
