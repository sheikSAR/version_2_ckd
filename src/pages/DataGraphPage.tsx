import React from 'react'
import { useNavigate } from 'react-router-dom'
import ConfiguratorNavbar from '../components/ConfiguratorNavbar'
import DataGraphVisualization from '../components/DataGraphVisualization'
import '../styles/DataGraphPage.css'

const DataGraphPage = () => {
  const navigate = useNavigate()

  return (
    <div className="data-graph-page">
      <ConfiguratorNavbar />
      <div className="data-graph-main">
        <div className="data-graph-button-group">
          <button className="data-graph-back-button" onClick={() => navigate('/configurator/landing')}>
            ← Back to Configuration Landing
          </button>
          <button
            className="data-graph-cta-button"
            onClick={() => navigate('/configurator/relationship-graph')}
          >
            Parse Input Data →
          </button>
        </div>
        <div className="data-graph-content-wrapper">
          <DataGraphVisualization />
        </div>
      </div>
    </div>
  )
}

export default DataGraphPage
