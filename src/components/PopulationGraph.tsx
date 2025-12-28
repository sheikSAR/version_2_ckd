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
  DR: ['Non DR_OD', 'DR_OD', 'Non DR_OS', 'DR_OS'],
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
  DR: { primary: '#FFA07A', light: '#FFE8DC', dark: '#FF7F50' },
  HTN: { primary: '#98D8C8', light: '#E8F8F3', dark: '#52B8A0' },
  Duration_of_Diabetes: { primary: '#F7DC6F', light: '#FFFACD', dark: '#F4C430' },
  HB: { primary: '#BB8FCE', light: '#F5E6FA', dark: '#9B59B6' },
  HBA: { primary: '#85C1E9', light: '#E8F4FB', dark: '#3498DB' },
  DR_Severity_OD: { primary: '#F8B88B', light: '#FFF0E6', dark: '#E67E22' },
  DR_Severity_OS: { primary: '#A3E4D7', light: '#E8FFF7', dark: '#27AE60' },
  EGFR: { primary: '#D7BCCB', light: '#FBF2F7', dark: '#C2185B' }
}

// --- Graph Generation Logic ---

const generateFlow = (data: any[]) => {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const xSpacing = 280
  const ySpacing = 70

  // 1. Create Static Categorical Nodes
  Object.keys(nodeCategories).forEach((catKey, colIndex) => {
    nodes.push({
      id: `header-${catKey}`,
      data: { label: catKey.replace(/_/g, ' ') },
      position: { x: colIndex * xSpacing, y: -60 },
      selectable: false,
      style: {
        background: categoryColors[catKey],
        color: '#fff',
        fontWeight: 'bold',
        width: 140,
        textAlign: 'center',
        borderRadius: '5px'
      }
    })

    nodeCategories[catKey].forEach((label: string, rowIndex: number) => {
      nodes.push({
        id: `${catKey}-${rowIndex}`,
        data: { label: label },
        position: { x: colIndex * xSpacing, y: rowIndex * ySpacing },
        style: {
          borderRadius: '50px',
          width: 140,
          fontSize: '11px',
          textAlign: 'center',
          background: '#f8f9fa',
          border: `2px solid ${categoryColors[catKey]}55`
        }
      })
    })
  })

  // 2. Map Dynamic Patient Edges from Backend Data
  data.forEach((patient, pIdx) => {
    const path = [
      `Patient-0`,
      `Gender-${patient.gender}`,
      `Age_Group-${patient.age}`,
      patient.DR_OD === 1 ? `DR-1` : `DR-0`,
      `HTN-${patient.Hypertension}`,
      `Duration_of_Diabetes-${patient.Durationofdiabetes - 1}`,
      `HB-${patient.HB - 1}`,
      `HBA-${patient.HBA - 1}`,
      patient.DR_SEVERITY_OD > 0 ? `DR_Severity_OD-${patient.DR_SEVERITY_OD - 1}` : null,
      patient.DR_SEVERITY_OS > 0 ? `DR_Severity_OS-${patient.DR_SEVERITY_OS - 1}` : null,
      `EGFR-${patient.EGFR}`
    ].filter(Boolean)

    for (let i = 0; i < path.length - 1; i++) {
      edges.push({
        id: `edge-p${pIdx}-step${i}`,
        source: path[i] as string,
        target: path[i + 1] as string,
        animated: true,
        style: { stroke: categoryColors.Patient, strokeWidth: 1.5, opacity: 0.3 },
        markerEnd: { type: MarkerType.ArrowClosed, color: categoryColors.Patient }
      })
    }
  })

  return { nodes, edges }
}

interface PopulationGraphProps {
  configPath: string
}

export default function PopulationGraph({ configPath }: PopulationGraphProps) {
  const [patientData, setPatientData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        setPatientData(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (configPath) fetchData()
  }, [configPath])

  const { nodes, edges } = useMemo(() => generateFlow(patientData), [patientData])

  if (loading)
    return <div style={{ padding: '20px' }}>Loading Patient Flow Graph...</div>
  if (error)
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>

  return (
    <div style={{ width: '100%', height: '100%', background: '#fcfcfc' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="#eee" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  )
}
