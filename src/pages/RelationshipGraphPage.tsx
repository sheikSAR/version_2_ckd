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
        const filePath = `/configurator/${configPath}/input/initial_data.json`
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

  return (
    <div className="relationship-graph-page">
      <ConfiguratorNavbar />

      {!hasData ? (
        <div className="relationship-graph-main">
          <button
            className="relationship-back-button"
            onClick={() => navigate('/configurator/data-graph')}
          >
            ← Back to Node Visualization
          </button>

          <div className="upload-section">
            <div className="upload-card">
              <h1 className="upload-title">Parse Patient Input Data</h1>
              <p className="upload-description">
                Upload patient data (JSON, YAML, or Excel) to create a 3D relationship network
              </p>

              <div className="file-upload-wrapper">
                <label className="file-input-label">
                  <input
                    type="file"
                    accept=".json,.yaml,.yml,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="file-input"
                    disabled={loading}
                  />
                  <div className="file-input-content">
                    <span className="file-icon">📁</span>
                    <span className="file-text">
                      {loading ? 'Processing file...' : 'Click to upload or drag and drop'}
                    </span>
                    <span className="file-hint">Supported: JSON, YAML, Excel (.xlsx, .xls)</span>
                  </div>
                </label>
              </div>

              {error && <div className="error-message">{error}</div>}
            </div>
          </div>
        </div>
      ) : (
        <>
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

          <div className="upload-overlay-button">
            <label className="upload-overlay-label">
              <input
                type="file"
                accept=".json,.yaml,.yml,.xlsx,.xls"
                onChange={handleFileChange}
                className="file-input"
                disabled={loading}
              />
              <span className="upload-overlay-text">{loading ? 'Processing...' : 'Upload New Data'}</span>
            </label>
          </div>
        </>
      )}
    </div>
  )
}

export default RelationshipGraphPage
