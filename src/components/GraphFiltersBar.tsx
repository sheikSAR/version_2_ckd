import React, { useMemo } from 'react'
import type { PatientEdges } from '../utils/patientNodeMapper'
import '../styles/GraphFiltersBar.css'

interface GraphFiltersBarProps {
  patientEdges: PatientEdges[]
  selectedPatient: string | null
  selectedVariable: string | null
  onPatientChange: (patientId: string | null) => void
  onVariableChange: (variable: string | null) => void
  onClearData: () => void
  isLoading?: boolean
}

const GraphFiltersBar: React.FC<GraphFiltersBarProps> = ({
  patientEdges,
  selectedPatient,
  selectedVariable,
  onPatientChange,
  onVariableChange,
  onClearData,
  isLoading = false,
}) => {
  const variables = useMemo(
    () =>
      Array.from(new Set(patientEdges.flatMap((pe) => pe.edges.map((e) => e.container)))).sort(),
    [patientEdges]
  )

  const totalEdges = patientEdges.reduce((sum, pe) => sum + pe.edges.length, 0)

  const getPatientEdgeCount = (patientId: string) => {
    const patient = patientEdges.find((pe) => pe.patientId === patientId)
    return patient?.edges.length || 0
  }

  return (
    <div className="graph-filters-bar">
      <div className="filters-container">
        <div className="filter-group patient-filter">
          <label className="filter-label">
            <span className="filter-label-text">Patient</span>
          </label>
          <select
            value={selectedPatient || ''}
            onChange={(e) => onPatientChange(e.target.value || null)}
            className="filter-select"
            disabled={isLoading}
          >
            <option value="">All Patients ({patientEdges.length})</option>
            {patientEdges.map((pe) => (
              <option key={pe.patientId} value={pe.patientId}>
                {pe.patientId} ({pe.edges.length})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group variable-filter">
          <label className="filter-label">
            <span className="filter-label-text">Variable</span>
          </label>
          <select
            value={selectedVariable || ''}
            onChange={(e) => onVariableChange(e.target.value || null)}
            className="filter-select"
            disabled={isLoading}
          >
            <option value="">All Variables ({variables.length})</option>
            {variables.map((variable) => (
              <option key={variable} value={variable}>
                {variable}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-divider"></div>

        <div className="metrics-group">
          <div className="metric-chip">
            <span className="metric-label">Patients</span>
            <span className="metric-value">{patientEdges.length}</span>
          </div>
          <div className="metric-chip">
            <span className="metric-label">Edges</span>
            <span className="metric-value">{totalEdges}</span>
          </div>
          <div className="metric-chip">
            <span className="metric-label">Variables</span>
            <span className="metric-value">{variables.length}</span>
          </div>
        </div>

        <div className="filter-divider"></div>

        <button
          className="clear-data-button"
          onClick={onClearData}
          disabled={isLoading}
          title="Clear all data and start over"
        >
          <span className="clear-icon">✕</span>
          <span className="clear-text">Clear Data</span>
        </button>
      </div>
    </div>
  )
}

export default GraphFiltersBar
