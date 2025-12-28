import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfiguratorNavbar from '../components/ConfiguratorNavbar'
import HierarchicalPatientVisualization from '../components/HierarchicalPatientVisualization'
import { mapPatientDataToNodes } from '../utils/patientNodeMapper'
import { useConfigurator } from '../context/ConfiguratorContext'
import type { PatientEdges } from '../utils/patientNodeMapper'
import '../styles/RelationshipGraphPage.css'

const RelationshipGraphPage = () => {
  const navigate = useNavigate()
  const { configPath } = useConfigurator()
  const [patientEdges, setPatientEdges] = useState<PatientEdges[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadConfigurationData = async () => {
      if (!configPath) {
        setError('Configuration input file not found. Please restart configurator setup.')
        setLoading(false)
        return
      }

      try {
        const filePath = `http://localhost:5000/configurator/${configPath}/input/initial_data.json`
        const response = await fetch(filePath)

        if (!response.ok) {
          throw new Error('File not found')
        }

        const parsedData: Record<string, Record<string, string>> = await response.json()
        const edges = mapPatientDataToNodes(parsedData)
        setPatientEdges(edges)
        setError('')
      } catch (err) {
        setError('Configuration input file not found. Please restart configurator setup.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadConfigurationData()
  }, [configPath])

  const handleClearData = () => {
    setPatientEdges([])
    setError('')
  }

  const hasData = patientEdges.length > 0

  if (loading) {
    return (
      <div className="relationship-graph-page">
        <ConfiguratorNavbar />
        <div className="relationship-graph-main">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading configuration data…</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
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
            <p className="error-message">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="relationship-graph-page">
        <ConfiguratorNavbar />
        <div className="relationship-graph-main">
          <button
            className="relationship-back-button"
            onClick={() => navigate('/configurator/data-graph')}
          >
            ← Back to Node Visualization
          </button>
          <div className="empty-state">
            <p className="empty-text">No data available. Please restart the configurator setup.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relationship-graph-page">
      <ConfiguratorNavbar />
      <div className="relationship-graph-main">
        <div className="graph-wrapper">
          <HierarchicalPatientVisualization patientEdges={patientEdges} />
        </div>
      </div>
    </div>
  )
}

export default RelationshipGraphPage
