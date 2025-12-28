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
  type: 'patient' | 'value'
  valueType?: 'binary' | 'ordinal' | 'severity'
  container: string
  color: string
  size: number
  displayLabel: string
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
}

// Classify value node types based on container
function getValueType(container: string): 'binary' | 'ordinal' | 'severity' {
  const binaryContainers = ['Gender', 'HTN', 'DR', 'EGFR']
  const severityContainers = ['DR_Severity_OD', 'DR_Severity_OS']

  if (severityContainers.includes(container)) return 'severity'
  if (binaryContainers.includes(container)) return 'binary'
  return 'ordinal'
}

// Get color based on value type
function getValueColor(valueType: 'binary' | 'ordinal' | 'severity'): string {
  switch (valueType) {
    case 'binary':
      return '#FF6B6B' // Red
    case 'severity':
      return '#FF9C6E' // Orange
    case 'ordinal':
      return '#52C41A' // Green
  }
}

const Graph3DVisualization: React.FC<Graph3DVisualizationProps> = ({
  patientEdges,
  selectedPatient,
  selectedVariable,
  onPatientSelect,
}) => {
  const fgRef = useRef<any>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [connectedNodeIds, setConnectedNodeIds] = useState<Set<string>>(new Set())
  const [selectedValueNode, setSelectedValueNode] = useState<string | null>(null)
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({
    nodes: [],
    links: [],
  })

  // Build adjacency map for hover interactions
  const adjacencyMap = useMemo(() => {
    const map = new Map<string, Set<string>>()

    graphData.links.forEach((link) => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id
      const targetId = typeof link.target === 'string' ? link.target : link.target.id

      if (!map.has(sourceId)) map.set(sourceId, new Set())
      if (!map.has(targetId)) map.set(targetId, new Set())

      map.get(sourceId)!.add(targetId)
      map.get(targetId)!.add(sourceId)
    })

    return map
  }, [graphData.links])

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
      graph.d3Force('charge').strength(-400)
      graph.d3Force('link').distance(80)
      
      // Fit to screen after a delay
      setTimeout(() => {
        graph.zoomToFit(400, 50)
      }, 100)
    }
  }, [graphData])

  const handleNodeHover = (node: GraphNode | null) => {
    if (node) {
      setHoveredNodeId(node.id)
      // Get all connected nodes
      const connected = adjacencyMap.get(node.id) || new Set()
      setConnectedNodeIds(connected)
    } else {
      setHoveredNodeId(null)
      setConnectedNodeIds(new Set())
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

    if (connectedNodeIds.has(node.id)) {
      return node.size * 1.8
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

    // Highlight links connected to hovered node
    if (hoveredNodeId === sourceId || hoveredNodeId === targetId) {
      return 0.9
    }

    // Highlight links connected to selected patient
    if (selectedPatient && sourceId === `patient-${selectedPatient}`) {
      return 0.4
    }

    return 0.15
  }

  const linkWidth = (link: GraphLink): number => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id

    if (hoveredNodeId === sourceId || hoveredNodeId === targetId) {
      return 4
    }

    if (selectedPatient && sourceId === `patient-${selectedPatient}`) {
      return 2.5
    }

    return 1.5
  }

  const getLinkColor = (link: GraphLink): string => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id
    const opacity = linkOpacity(link)

    // Use brighter color for hovered edges
    if (hoveredNodeId === sourceId || hoveredNodeId === targetId) {
      return `rgba(255, 200, 0, ${opacity})`
    }

    // Use gradient-like color based on selected patient
    if (selectedPatient && sourceId === `patient-${selectedPatient}`) {
      return `rgba(102, 200, 234, ${opacity})`
    }

    return `rgba(102, 126, 234, ${opacity})`
  }

  return (
    <div className="graph-3d-container">
      {graphData.nodes.length > 0 ? (
        <>
          <ForceGraph3D
            ref={fgRef}
            graphData={graphData}
            nodeLabel={(node: any) => {
              const label = `${node.name}`
              if (node.type === 'patient') {
                return `Patient: ${label}`
              }
              return `${node.container}: ${label}`
            }}
            nodeColor={(node: any) => nodeColor(node)}
            nodeSize={(node: any) => nodeSize(node)}
            linkColor={(link: any) => getLinkColor(link)}
            linkWidth={(link: any) => linkWidth(link)}
            linkDirectionalArrowLength={(link: any) => (link.isVisible ? 4 : 0)}
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
          <div className="graph-info-panel">
            <div className="info-header">Graph Stats</div>
            <div className="info-stat">
              <span className="info-label">Nodes:</span>
              <span className="info-value">{graphData.nodes.length}</span>
            </div>
            <div className="info-stat">
              <span className="info-label">Edges:</span>
              <span className="info-value">{graphData.links.length}</span>
            </div>
            {hoveredNodeId && (
              <div className="info-stat hovered-info">
                <span className="info-label">Hovering:</span>
                <span className="info-value">
                  {graphData.nodes.find((n) => n.id === hoveredNodeId)?.name}
                </span>
              </div>
            )}
          </div>
        </>
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
