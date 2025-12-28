import { useMemo, useEffect, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  MarkerType
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import '../styles/PopulationGraph.css'

const nodeCategories: any = {
  Patient: ['Patient'],
  Gender: ['Male', 'Female'],
  Age_Group: ['Age < 40', 'Age == 40', '40 < Age <= 45', '45 < Age <= 50', '50 < Age <= 55', '55 < Age <= 60', '60 < Age <= 65', '65 < Age <= 70', '70 < Age <= 75', '75 < Age <= 78', 'Age > 78'],
  DR_OD: ['Non DR_OD', 'DR_OD'],
  DR_OS: ['Non DR_OS', 'DR_OS'],
  HTN: ['No HTN', 'HTN'],
  Duration_of_Diabetes: ['DD <= 5', '5 < DD <= 10', '10 < DD <= 15', '15 < DD <= 20', '20 < DD <= 25', '25 < DD <= 30', '30 < DD <= 35', '35 < DD <= 40', 'DD > 40'],
  HB: ['HB <= 9', '9 < HB <= 12', '12 < HB <= 15', '15 < HB <= 18', 'HB > 18'],
  HBA: ['HBA <= 5', '5 < HBA <= 10', '10 < HBA <= 15', 'HBA > 15'],
  DR_Severity_OD: ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5'],
  DR_Severity_OS: ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5'],
  EGFR: ['EGFR >= 90', 'EGFR < 90']
}

const colorPalettes: any = {
  Patient: { primary: '#FF6B6B', light: '#FFE5E5', dark: '#FF5252' },
  Gender: { primary: '#4ECDC4', light: '#E0F7F6', dark: '#1BA8A0' },
  Age_Group: { primary: '#45B7D1', light: '#E3F7FF', dark: '#0D8FB9' },
  DR_OD: { primary: '#FFA07A', light: '#FFE8DC', dark: '#FF7F50' },
  DR_OS: { primary: '#E17055', light: '#FFCCC2', dark: '#D63031' },
  HTN: { primary: '#98D8C8', light: '#E8F8F3', dark: '#52B8A0' },
  Duration_of_Diabetes: { primary: '#F7DC6F', light: '#FFFACD', dark: '#F4C430' },
  HB: { primary: '#BB8FCE', light: '#F5E6FA', dark: '#9B59B6' },
  HBA: { primary: '#85C1E9', light: '#E8F4FB', dark: '#3498DB' },
  DR_Severity_OD: { primary: '#F8B88B', light: '#FFF0E6', dark: '#E67E22' },
  DR_Severity_OS: { primary: '#A3E4D7', light: '#E8FFF7', dark: '#27AE60' },
  EGFR: { primary: '#D7BCCB', light: '#FBF2F7', dark: '#C2185B' }
}

// --- Graph Generation Logic ---

const generateFlow = (data: any[], maxPatients: number = 100) => {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const xSpacing = 280
  const ySpacing = 70
  const nodeIdMap = new Set<string>() // Track created nodes

  // 1. Create Static Categorical Nodes
  Object.keys(nodeCategories).forEach((catKey, colIndex) => {
    const palette = colorPalettes[catKey]

    nodes.push({
      id: `header-${catKey}`,
      data: { label: catKey.replace(/_/g, ' ') },
      position: { x: colIndex * xSpacing, y: -60 },
      selectable: false,
      style: {
        background: palette.dark,
        color: '#fff',
        fontWeight: 'bold',
        width: 140,
        textAlign: 'center',
        borderRadius: '8px',
        fontSize: '13px',
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
        padding: '12px 8px',
        boxShadow: `0 4px 12px ${palette.primary}40`,
        border: 'none'
      }
    })

    nodeCategories[catKey].forEach((label: string, rowIndex: number) => {
      const nodeId = `${catKey}-${rowIndex}`
      nodeIdMap.add(nodeId)

      nodes.push({
        id: nodeId,
        data: { label: label },
        position: { x: colIndex * xSpacing, y: rowIndex * ySpacing },
        style: {
          borderRadius: '12px',
          width: 140,
          fontSize: '11px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.9)',
          border: `2px solid ${palette.primary}`,
          padding: '12px 8px',
          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.08)`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer'
        }
      })
    })
  })

  // 2. Map Dynamic Patient Edges from Backend Data (with limit)
  const limitedData = data.slice(0, maxPatients)

  limitedData.forEach((patient, pIdx) => {
    const path = [
      `Patient-0`,
      `Gender-${patient.gender}`,
      `Age_Group-${patient.age}`,
      `DR_OD-${patient.DR_OD}`,
      `DR_OS-${patient.DR_OS}`,
      `HTN-${patient.Hypertension}`,
      `Duration_of_Diabetes-${patient.Durationofdiabetes - 1}`,
      `HB-${patient.HB - 1}`,
      `HBA-${patient.HBA - 1}`,
      patient.DR_SEVERITY_OD > 0 ? `DR_Severity_OD-${patient.DR_SEVERITY_OD - 1}` : null,
      patient.DR_SEVERITY_OS > 0 ? `DR_Severity_OS-${patient.DR_SEVERITY_OS - 1}` : null,
      `EGFR-${patient.EGFR}`
    ].filter(Boolean) as string[]

    for (let i = 0; i < path.length - 1; i++) {
      const source = path[i]
      const target = path[i + 1]

      // Validate nodes exist before creating edge
      if (nodeIdMap.has(source) && nodeIdMap.has(target)) {
        edges.push({
          id: `edge-p${pIdx}-step${i}`,
          source,
          target,
          animated: false,
          style: {
            stroke: colorPalettes.Patient.primary,
            strokeWidth: 1.5,
            opacity: 0.15
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: colorPalettes.Patient.primary }
        })
      }
    }
  })

  return { nodes, edges, totalPatients: data.length, visiblePatients: limitedData.length }
}

interface PopulationGraphProps {
  configPath: string
}

export default function PopulationGraph({ configPath }: PopulationGraphProps) {
  const [patientData, setPatientData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [maxPatients, setMaxPatients] = useState(100)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `http://localhost:5000/configurator/${configPath}/input/initial_data.json`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch patient data from server')
        }

        const data = await response.json()
        if (!Array.isArray(data)) {
          throw new Error('Patient data is not an array')
        }
        setPatientData(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (configPath) fetchData()
  }, [configPath])

  const [debugInfo, setDebugInfo] = useState<any>(null)

  const { nodes, edges, totalPatients, visiblePatients } = useMemo(() => {
    const result = generateFlow(patientData, maxPatients)

    // Debug: log any data structure issues
    if (patientData.length > 0) {
      const samplePatient = patientData[0]
      const missingFields = []

      const requiredFields = ['gender', 'age', 'DR_OD', 'DR_OS', 'Hypertension',
                             'Durationofdiabetes', 'HB', 'HBA', 'DR_SEVERITY_OD',
                             'DR_SEVERITY_OS', 'EGFR']

      requiredFields.forEach(field => {
        if (!(field in samplePatient)) {
          missingFields.push(field)
        }
      })

      if (missingFields.length > 0) {
        setDebugInfo({
          issue: 'Missing data fields',
          missingFields,
          samplePatient: Object.keys(samplePatient)
        })
      } else {
        setDebugInfo(null)
      }
    }

    return result
  }, [patientData, maxPatients])

  if (loading)
    return <div className="population-graph-loading">Loading Patient Flow Graph...</div>
  if (error)
    return <div className="population-graph-error">Error: {error}</div>

  return (
    <div className="population-graph-wrapper">
      <div className="population-graph-header">
        <div className="patient-info">
          Displaying {visiblePatients} of {totalPatients} patients • {edges.length} connections
        </div>
        {totalPatients > 50 && (
          <div className="patient-limit-control">
            <label htmlFor="patient-limit">Limit patients to:</label>
            <input
              id="patient-limit"
              type="range"
              min="10"
              max={Math.min(totalPatients, 500)}
              value={maxPatients}
              onChange={(e) => setMaxPatients(parseInt(e.target.value))}
              className="patient-limit-slider"
            />
            <span className="limit-value">{maxPatients}</span>
          </div>
        )}
      </div>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="#e8f4fb" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  )
}
