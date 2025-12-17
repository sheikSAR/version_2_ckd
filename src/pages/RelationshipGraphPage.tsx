import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import ConfiguratorNavbar from '../components/ConfiguratorNavbar'
import Graph3DVisualization from '../components/Graph3DVisualization'
import GraphFiltersBar from '../components/GraphFiltersBar'
import { mapPatientDataToNodes } from '../utils/patientNodeMapper'
import type { PatientEdges } from '../utils/patientNodeMapper'
import '../styles/RelationshipGraphPage.css'

const RelationshipGraphPage = () => {
  const navigate = useNavigate()
  const [patientEdges, setPatientEdges] = useState<PatientEdges[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const parseYaml = (yamlText: string): Record<string, Record<string, string>> => {
    const result: Record<string, Record<string, string>> = {}
    const lines = yamlText.split('\n')
    let currentId: string | null = null
    let currentNested: Record<string, string> = {}

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine || trimmedLine.startsWith('#')) continue

      const colonIndex = trimmedLine.indexOf(':')
      if (colonIndex > -1) {
        const key = trimmedLine.substring(0, colonIndex).trim()
        const value = trimmedLine.substring(colonIndex + 1).trim()

        if (key && value) {
          if (!currentId) {
            currentId = key
          } else {
            currentNested[key] = value
          }
        }

        if (currentId && Object.keys(currentNested).length > 0 && line.match(/^\S/)) {
          result[currentId] = currentNested
          currentId = key
          currentNested = {}
        }
      }
    }

    if (currentId && Object.keys(currentNested).length > 0) {
      result[currentId] = currentNested
    }

    return result
  }

  const parseExcel = async (file: File): Promise<Record<string, Record<string, string>>> => {
    const result: Record<string, Record<string, string>> = {}

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })

      if (!workbook.SheetNames.length) {
        return {}
      }

      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][]

      if (rows.length < 2) {
        return {}
      }

      const headers = rows[0].map((h) => String(h))
      const idColumnIndex = 0

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        const idValue = String(row[idColumnIndex] || '')

        if (idValue) {
          const nestedObject: Record<string, string> = {}
          for (let j = 0; j < headers.length; j++) {
            if (j !== idColumnIndex) {
              nestedObject[headers[j]] = String(row[j] || '')
            }
          }
          result[idValue] = nestedObject
        }
      }

      return result
    } catch (err) {
      console.error(err)
      return {}
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setLoading(true)

    const fileName = file.name.toLowerCase()
    const isJson = fileName.endsWith('.json')
    const isYaml = fileName.endsWith('.yaml') || fileName.endsWith('.yml')
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')

    if (!isJson && !isYaml && !isExcel) {
      setError('Please upload a .json, .yaml, .yml, .xlsx, or .xls file.')
      setLoading(false)
      return
    }

    try {
      let parsedData: Record<string, Record<string, string>> = {}

      if (isJson) {
        const text = await file.text()
        const parsed = JSON.parse(text)
        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
          setError('JSON file must contain an object.')
          setLoading(false)
          return
        }
        parsedData = parsed
      } else if (isYaml) {
        const text = await file.text()
        const yamlData = parseYaml(text)
        parsedData = Object.fromEntries(
          Object.entries(yamlData).map(([key, value]) => [
            key,
            typeof value === 'object' ? value : { value: String(value) },
          ])
        )
      } else if (isExcel) {
        parsedData = await parseExcel(file)
        if (Object.keys(parsedData).length === 0) {
          setError('Unable to parse Excel file. Make sure it contains data.')
          setLoading(false)
          return
        }
      }

      const edges = mapPatientDataToNodes(parsedData)
      setPatientEdges(edges)
      setSelectedPatient(null)
      setSelectedVariable(null)
    } catch (err) {
      setError('Error parsing file. Please check the file format.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

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
