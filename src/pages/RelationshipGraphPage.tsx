import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfiguratorNavbar from '../components/ConfiguratorNavbar'
import Graph3DVisualization from '../components/Graph3DVisualization'
import GraphFiltersBar from '../components/GraphFiltersBar'
import { mapPatientDataToNodes } from '../utils/patientNodeMapper'
import { useConfigurator } from '../context/ConfiguratorContext'
import type { PatientEdges } from '../utils/patientNodeMapper'
import '../styles/RelationshipGraphPage.css'

const RelationshipGraphPage = () => {
  const navigate = useNavigate()
  const { configPath } = useConfigurator()
  const [patientEdges, setPatientEdges] = useState<PatientEdges[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null)
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
        setSelectedPatient(null)
        setSelectedVariable(null)
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
    setSelectedPatient(null)
    setSelectedVariable(null)
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
      <GraphFiltersBar
        patientEdges={patientEdges}
        selectedPatient={selectedPatient}
        selectedVariable={selectedVariable}
        onPatientChange={setSelectedPatient}
        onVariableChange={setSelectedVariable}
        onClearData={handleClearData}
        isLoading={loading}
      />

      <div className="relationship-graph-main">
        <div className="graph-wrapper">
          <Graph3DVisualization
            patientEdges={patientEdges}
            selectedPatient={selectedPatient || undefined}
            selectedVariable={selectedVariable || undefined}
            onPatientSelect={setSelectedPatient}
          />
        </div>
      </div>
    </div>
  )
}

export default RelationshipGraphPage
