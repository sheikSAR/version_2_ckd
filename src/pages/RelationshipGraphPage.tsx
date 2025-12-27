import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfiguratorNavbar from '../components/ConfiguratorNavbar'
import Graph3DVisualization from '../components/Graph3DVisualization'
import { mapPatientDataToChainGraph } from '../utils/patientNodeMapper'
import { useConfigurator } from '../context/ConfiguratorContext'
import type { PatientChainGraph } from '../utils/patientNodeMapper'
import '../styles/RelationshipGraphPage.css'

const RelationshipGraphPage = () => {
  const navigate = useNavigate()
  const { configPath } = useConfigurator()
  const [chainGraph, setChainGraph] = useState<PatientChainGraph>({ nodes: [], edges: [] })
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
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

        const parsedData = await response.json()
        const graph = mapPatientDataToChainGraph(parsedData)
        setChainGraph(graph)
        setSelectedPatient(null)
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
    setChainGraph({ nodes: [], edges: [] })
    setSelectedPatient(null)
    setError('')
  }

  const hasData = chainGraph.nodes.length > 0

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
            onClick={() => navigate('/configurator')}
          >
            ← Back to Configurator
          </button>
          <div className="empty-state">
            <p className="empty-text">No data available. Please restart the configurator setup.</p>
          </div>
        </div>
      </div>
    )
  }

  const uniquePatients = new Set<string>()
  chainGraph.edges.forEach((edge) => {
    uniquePatients.add(edge.patientId)
  })

  return (
    <div className="relationship-graph-page">
      <ConfiguratorNavbar />
      <div className="relationship-graph-header">
        <div className="header-info">
          <span className="info-item">
            <strong>Patients:</strong> {uniquePatients.size}
          </span>
          <span className="info-item">
            <strong>Nodes:</strong> {chainGraph.nodes.length}
          </span>
          <span className="info-item">
            <strong>Chains:</strong> {chainGraph.edges.length / 6}
          </span>
        </div>
        <div className="header-controls">
          {selectedPatient && (
            <button className="clear-selection-btn" onClick={() => setSelectedPatient(null)}>
              Clear Patient Selection
            </button>
          )}
          <button className="clear-data-btn" onClick={handleClearData}>
            Reload Data
          </button>
        </div>
      </div>

      <div className="relationship-graph-main">
        <div className="graph-wrapper">
          <Graph3DVisualization
            chainGraph={chainGraph}
            selectedPatient={selectedPatient || undefined}
            onPatientSelect={setSelectedPatient}
          />
        </div>
      </div>
    </div>
  )
}

export default RelationshipGraphPage
