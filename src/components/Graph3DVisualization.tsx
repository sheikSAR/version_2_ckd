import React, { useEffect, useRef, useState, useMemo } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import type { PatientEdges } from '../utils/patientNodeMapper'
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
  source: string | GraphNode
  target: string | GraphNode
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

    // Add patient nodes
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

    // Add variable nodes and links
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
    if (fgRef.current && graphData.nodes.length > 0) {
      // Configure the force simulation
      const graph = fgRef.current
      graph.d3Force('charge').strength(-300)
      graph.d3Force('link').distance(100)
      
      // Fit to screen after a delay
      setTimeout(() => {
        graph.zoomToFit(400, 50)
      }, 100)
    }
  }, [graphData])

  const handleNodeHover = (node: GraphNode | null) => {
    setHoveredNodeId(node?.id || null)
  }

  const handleNodeClick = (node: GraphNode) => {
    if (node.type === 'patient') {
      const patientId = node.name
      onPatientSelect?.(patientId === selectedPatient ? null : patientId)
    }
  }

  const nodeColor = (node: GraphNode) => {
    if (node.type === 'patient') {
      if (selectedPatient === node.name) {
        return '#FFD700'
      }
      return node.color
    }

    // For variable nodes
    if (hoveredNodeId === node.id) {
      return node.color
    }

    return node.color
  }

  const nodeSize = (node: GraphNode) => {
    if (hoveredNodeId === node.id) {
      return node.size * 2.5
    }

    if (node.type === 'patient' && selectedPatient === node.name) {
      return node.size * 2
    }

    return node.size
  }

  const linkOpacity = (link: GraphLink): number => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id

    if (!link.isVisible) {
      return 0.05
    }

    if (
      hoveredNodeId === sourceId ||
      hoveredNodeId === targetId ||
      (selectedPatient && sourceId === `patient-${selectedPatient}`)
    ) {
      return 0.8
    }

    return 0.2
  }

  const linkWidth = (link: GraphLink): number => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id

    if (hoveredNodeId === sourceId || hoveredNodeId === targetId) {
      return 3
    }

    return 1.5
  }

  return (
    <div className="graph-3d-container">
      {graphData.nodes.length > 0 ? (
        <ForceGraph3D
          ref={fgRef}
          graphData={graphData}
          nodeLabel={(node: any) => `${node.name}`}
          nodeColor={(node: any) => nodeColor(node)}
          nodeSize={(node: any) => nodeSize(node)}
          linkColor={(link: any) => {
            const opacity = linkOpacity(link)
            const rgb = 'rgb(102, 126, 234)'
            return rgb.replace('rgb(', `rgba(`).replace(')', `, ${opacity})`)
          }}
          linkWidth={(link: any) => linkWidth(link)}
          linkDirectionalArrowLength={(link: any) => (link.isVisible ? 3 : 0)}
          linkCurvature={0.25}
          onNodeHover={handleNodeHover}
          onNodeClick={handleNodeClick}
          backgroundColor="#0F1419"
          cooldownTime={3000}
          warmupTicks={100}
          d3AlphaDecay={0.03}
          d3VelocityDecay={0.3}
          width={typeof window !== 'undefined' ? window.innerWidth : 1024}
          height={typeof window !== 'undefined' ? window.innerHeight - 300 : 768}
        />
      ) : (
        <div className="graph-loading">
          <div className="loading-spinner"></div>
          <p>Loading graph...</p>
        </div>
      )}
    </div>
  )
}

export default Graph3DVisualization
