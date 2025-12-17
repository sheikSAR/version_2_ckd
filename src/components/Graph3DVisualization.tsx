import React, { useEffect, useRef, useState, useMemo } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import type { PatientEdges, Edge } from '../utils/patientNodeMapper'
import nodeData from '../data/node.json'
import '../styles/Graph3DVisualization.css'

interface Graph3DVisualizationProps {
  patientEdges: PatientEdges[]
  selectedPatient?: string
  selectedVariable?: string
  onPatientSelect?: (patientId: string | null) => void
}

interface GraphNode {
  id: string
  name: string
  type: 'patient' | 'variable'
  container: string
  color: string
  size: number
}

interface GraphLink {
  source: string
  target: string
  isVisible: boolean
}

const Graph3DVisualization: React.FC<Graph3DVisualizationProps> = ({
  patientEdges,
  selectedPatient,
  selectedVariable,
  onPatientSelect,
}) => {
  const fgRef = useRef<any>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({
    nodes: [],
    links: [],
  })

  const colorPalettes = useMemo(
    () => [
      '#FF6B6B', // Coral
      '#4ECDC4', // Teal
      '#45B7D1', // Sky
      '#FFA07A', // Salmon
      '#98D8C8', // Mint
      '#F7DC6F', // Gold
      '#BB8FCE', // Purple
      '#85C1E9', // Blue
      '#F8B88B', // Orange
      '#A3E4D7', // Green
      '#D7BCCB', // Rose
      '#B4E7FF', // Cyan
      '#FFD4A3', // Peach
      '#C8E6A0', // Lime
      '#F4A6D3', // Pink
    ],
    []
  )

  const containerToColorMap = useMemo(() => {
    const map: Record<string, string> = {}
    const containers = Object.keys(nodeData)

    containers.forEach((container, index) => {
      map[container] = colorPalettes[index % colorPalettes.length]
    })

    return map
  }, [colorPalettes])

  const nodeTypeColors = useMemo(
    () => ({
      patient: '#667EEA',
      variable: '#764BA2',
    }),
    []
  )

  useEffect(() => {
    if (!patientEdges.length) {
      setGraphData({ nodes: [], links: [] })
      return
    }

    const nodesMap = new Map<string, GraphNode>()
    const linksArray: GraphLink[] = []

    const patientNodes = patientEdges.map((pe) => pe.patientId)

    patientNodes.forEach((patientId) => {
      nodesMap.set(`patient-${patientId}`, {
        id: `patient-${patientId}`,
        name: patientId,
        type: 'patient',
        container: 'Patient_ID',
        color: nodeTypeColors.patient,
        size: 8,
      })
    })

    const processedEdges = new Set<string>()

    patientEdges.forEach((patientData) => {
      patientData.edges.forEach((edge) => {
        const shouldShowEdge =
          (!selectedPatient || selectedPatient === patientData.patientId) &&
          (!selectedVariable || selectedVariable === edge.container)

        const nodeId = `variable-${edge.container}-${edge.node}`

        if (!nodesMap.has(nodeId)) {
          nodesMap.set(nodeId, {
            id: nodeId,
            name: edge.node,
            type: 'variable',
            container: edge.container,
            color: containerToColorMap[edge.container] || '#999999',
            size: 6,
          })
        }

        const linkKey = `${patientData.patientId}-${edge.container}-${edge.node}`
        if (!processedEdges.has(linkKey)) {
          linksArray.push({
            source: `patient-${patientData.patientId}`,
            target: nodeId,
            isVisible: shouldShowEdge,
          })
          processedEdges.add(linkKey)
        }
      })
    })

    setGraphData({
      nodes: Array.from(nodesMap.values()),
      links: linksArray,
    })
  }, [patientEdges, selectedPatient, selectedVariable, containerToColorMap, nodeTypeColors])

  useEffect(() => {
    if (fgRef.current) {
      const maxZoom = 100
      const minZoom = 1
      fgRef.current.zoom(3, 2000)
    }
  }, [])

  const handleNodeHover = (node: GraphNode | null) => {
    setHoveredNodeId(node?.id || null)

    if (fgRef.current) {
      const ctx = fgRef.current.renderer.getContext()
      if (node) {
        fgRef.current.camera.position.z = 60
      }
    }
  }

  const handleNodeClick = (node: GraphNode) => {
    if (node.type === 'patient') {
      const patientId = node.name
      onPatientSelect?.(patientId === selectedPatient ? null : patientId)
    }
  }

  const nodeColor = (node: GraphNode) => {
    if (node.type === 'patient') {
      return selectedPatient === node.name ? '#FFD700' : node.color
    }

    if (node.type === 'variable') {
      return hoveredNodeId === node.id || node.id.includes(`${selectedVariable}`) ? node.color : node.color
    }

    return node.color
  }

  const nodeSize = (node: GraphNode) => {
    if (hoveredNodeId === node.id) {
      return node.size * 2
    }

    if (node.type === 'patient' && selectedPatient === node.name) {
      return node.size * 1.8
    }

    return node.size
  }

  const linkOpacity = (link: GraphLink) => {
    const source = (link.source as unknown as GraphNode).id || link.source
    const target = (link.target as unknown as GraphNode).id || link.target

    if (!link.isVisible) {
      return 0.05
    }

    if (
      hoveredNodeId === source ||
      hoveredNodeId === target ||
      (selectedPatient && source === `patient-${selectedPatient}`)
    ) {
      return 0.6
    }

    return 0.15
  }

  const linkWidth = (link: GraphLink) => {
    const source = (link.source as unknown as GraphNode).id || link.source
    const target = (link.target as unknown as GraphNode).id || link.target

    if (hoveredNodeId === source || hoveredNodeId === target) {
      return 2
    }

    return 1
  }

  return (
    <div className="graph-3d-container">
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy={(node: any) => node.container}
        nodeColor={(node: any) => nodeColor(node)}
        nodeSize={(node: any) => nodeSize(node)}
        linkColor={(link: any) => `rgba(102, 126, 234, ${linkOpacity(link)})`}
        linkWidth={(link: any) => linkWidth(link)}
        linkDirectionalArrowLength={(link: any) => link.isVisible ? 3.5 : 0}
        linkCurvature={0.25}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        backgroundColor="#0F1419"
        showNavInfo={false}
        cooldownTime={2000}
        onEngineStop={() => fgRef.current?.zoomToFit(400, 50)}
        width={typeof window !== 'undefined' ? window.innerWidth : 1024}
        height={typeof window !== 'undefined' ? window.innerHeight - 300 : 768}
      />
    </div>
  )
}

export default Graph3DVisualization
