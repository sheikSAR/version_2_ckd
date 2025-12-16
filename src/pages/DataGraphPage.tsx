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
        <button className="data-graph-back-button" onClick={() => navigate('/configurator/landing')}>
          ← Back to Configuration Landing
        </button>
        <div className="data-graph-content-wrapper">
          <DataGraphVisualization />
        </div>
      </div>
    </div>
  )
}

export default DataGraphPage
