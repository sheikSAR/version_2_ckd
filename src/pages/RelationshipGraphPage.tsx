import React from 'react'
import { useNavigate } from 'react-router-dom'
import ConfiguratorNavbar from '../components/ConfiguratorNavbar'
import PopulationGraph from '../components/PopulationGraph'
import { useConfigurator } from '../context/ConfiguratorContext'
import '../styles/RelationshipGraphPage.css'

const RelationshipGraphPage = () => {
  const navigate = useNavigate()
  const { configPath } = useConfigurator()

  if (!configPath) {
    return (
      <div className="relationship-graph-page">
        <ConfiguratorNavbar />
        <div className="relationship-graph-main">
          <button
            className="relationship-back-button"
            onClick={() => navigate('/configurator')}
          >
            ← Restart Configurator
          </button>
          <div className="error-state">
            <p className="error-message">Configuration input file not found. Please restart configurator setup.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relationship-graph-page">
      <ConfiguratorNavbar />
      <div className="relationship-graph-main">
        <PopulationGraph configPath={configPath} />
      </div>
    </div>
  )
}

export default RelationshipGraphPage
