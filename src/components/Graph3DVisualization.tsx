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

  // Build adjacency map and patient lookup for interactions
  const { adjacencyMap, patientValueMap } = useMemo(() => {
    const adjMap = new Map<string, Set<string>>()
    const pvMap = new Map<string, Set<string>>() // value node -> connected patients

    graphData.links.forEach((link) => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id
      const targetId = typeof link.target === 'string' ? link.target : link.target.id

      if (!adjMap.has(sourceId)) adjMap.set(sourceId, new Set())
      if (!adjMap.has(targetId)) adjMap.set(targetId, new Set())

      adjMap.get(sourceId)!.add(targetId)
      adjMap.get(targetId)!.add(sourceId)

      // Track which patients are connected to each value node
      if (sourceId.startsWith('patient-') && targetId.startsWith('value-')) {
        if (!pvMap.has(targetId)) pvMap.set(targetId, new Set())
        pvMap.get(targetId)!.add(sourceId)
      } else if (targetId.startsWith('patient-') && sourceId.startsWith('value-')) {
        if (!pvMap.has(sourceId)) pvMap.set(sourceId, new Set())
        pvMap.get(sourceId)!.add(targetId)
      }
    })

    return { adjacencyMap: adjMap, patientValueMap: pvMap }
  }, [graphData.links])

  useEffect(() => {
    if (!patientEdges.length) {
      setGraphData({ nodes: [], links: [] })
      return
    }

    const nodesMap = new Map<string, GraphNode>()
    const linksArray: GraphLink[] = []
    const patientNodes = patientEdges.map((pe) => pe.patientId)

    // Add patient nodes (Blue, large)
    patientNodes.forEach((patientId) => {
      nodesMap.set(`patient-${patientId}`, {
        id: `patient-${patientId}`,
        name: patientId,
        type: 'patient',
        container: 'Patient',
        color: '#1890FF', // Blue
        size: 8,
        displayLabel: patientId,
      })
    })

    // Add value nodes and links
    const processedEdges = new Set<string>()

    patientEdges.forEach((patientData) => {
      patientData.edges.forEach((edge) => {
        const nodeId = `value-${edge.container}-${edge.node}`

        if (!nodesMap.has(nodeId)) {
          const valueType = getValueType(edge.container)
          nodesMap.set(nodeId, {
            id: nodeId,
            name: edge.node,
            type: 'value',
            valueType,
            container: edge.container,
            color: getValueColor(valueType),
            size: 6,
            displayLabel: edge.node,
          })
        }

        const linkKey = `${patientData.patientId}-${edge.container}-${edge.node}`
        if (!processedEdges.has(linkKey)) {
          linksArray.push({
            source: `patient-${patientData.patientId}`,
            target: nodeId,
          })
          processedEdges.add(linkKey)
        }
      })
    })

    setGraphData({
      nodes: Array.from(nodesMap.values()),
      links: linksArray,
    })
  }, [patientEdges, selectedPatient, selectedVariable])

  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      const graph = fgRef.current

      // Bipartite layout with strong patient repulsion
      // Custom charge force: patients repel strongly, values repel weakly
      graph.d3Force('charge').strength((node: GraphNode) => {
        if (node.type === 'patient') {
          return -600 // Strong repulsion between patients
        }
        return -100 // Weak repulsion between value nodes
      })

      // Link forces to pull similar patients closer through shared values
      graph.d3Force('link').distance((link: GraphLink) => {
        const sourceNode = typeof link.source === 'object' ? link.source : graphData.nodes.find((n) => n.id === link.source)
        const targetNode = typeof link.target === 'object' ? link.target : graphData.nodes.find((n) => n.id === link.target)

        // Shorter links for patient-value connections
        if (sourceNode?.type === 'patient' && targetNode?.type === 'value') {
          return 60
        }
        if (sourceNode?.type === 'value' && targetNode?.type === 'patient') {
          return 60
        }

        return 100
      })

      // Stabilize the layout
      graph.warmupTicks(100)

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
      setSelectedValueNode(null)
    } else if (node.type === 'value') {
      // Click value node: highlight all patients sharing that value
      setSelectedValueNode(node.id === selectedValueNode ? null : node.id)
      onPatientSelect?.(null)
    }
  }

  const getConnectedPatients = (nodeId: string): Set<string> => {
    if (selectedValueNode) {
      return patientValueMap.get(selectedValueNode) || new Set()
    }
    return new Set()
  }

  const nodeColor = (node: GraphNode) => {
    // Hovered node gets bright highlight
    if (hoveredNodeId === node.id) {
      return '#FFD700'
    }

    // Selected patient node gets highlight
    if (node.type === 'patient' && selectedPatient === node.name) {
      return '#FFD700'
    }

    // If a value node is selected, dim patients not connected to it
    if (selectedValueNode) {
      const connectedPatients = getConnectedPatients(selectedValueNode)
      if (node.type === 'patient' && !connectedPatients.has(node.id)) {
        return 'rgba(24, 144, 255, 0.2)' // Dim unrelated patients
      }
    }

    // If a patient is selected, dim unrelated value nodes
    if (selectedPatient) {
      if (node.type === 'value' && !connectedNodeIds.has(node.id)) {
        const dimColor = node.color
        return dimColor.replace(')', ', 0.2)').replace('rgb', 'rgba')
      }
    }

    // Connected nodes during hover
    if (connectedNodeIds.has(node.id) && hoveredNodeId !== node.id) {
      return node.color
    }

    return node.color
  }

  const nodeSize = (node: GraphNode) => {
    // Hovered node gets bigger
    if (hoveredNodeId === node.id) {
      return node.size * 2.5
    }

    // Selected patient node
    if (node.type === 'patient' && selectedPatient === node.name) {
      return node.size * 2.2
    }

    // Connected nodes during hover
    if (connectedNodeIds.has(node.id)) {
      return node.size * 1.8
    }

    // If value node is selected, increase size of connected patient nodes
    if (selectedValueNode) {
      const connectedPatients = getConnectedPatients(selectedValueNode)
      if (node.type === 'patient' && connectedPatients.has(node.id)) {
        return node.size * 1.5
      }
    }

    return node.size
  }

  const getLinkOpacity = (link: GraphLink): number => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id

    // Hovered link
    if (hoveredNodeId === sourceId || hoveredNodeId === targetId) {
      return 0.8
    }

    // Selected patient links
    if (selectedPatient && sourceId === `patient-${selectedPatient}`) {
      return 0.5
    }

    // Selected value node links
    if (selectedValueNode && targetId === selectedValueNode) {
      return 0.6
    }

    // If value is selected, dim links not connected to it
    if (selectedValueNode && targetId !== selectedValueNode) {
      return 0.05
    }

    // If patient is selected, dim links not connected to it
    if (selectedPatient && sourceId !== `patient-${selectedPatient}`) {
      return 0.08
    }

    // Default opacity
    return 0.15
  }

  const getLinkWidth = (link: GraphLink): number => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id

    // Hovered link
    if (hoveredNodeId === sourceId || hoveredNodeId === targetId) {
      return 3
    }

    // Selected patient links
    if (selectedPatient && sourceId === `patient-${selectedPatient}`) {
      return 2.5
    }

    // Selected value node links
    if (selectedValueNode && targetId === selectedValueNode) {
      return 2
    }

    return 1.5
  }

  const getLinkColor = (link: GraphLink): string => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id
    const opacity = getLinkOpacity(link)

    // Hovered edges get bright color
    if (hoveredNodeId === sourceId || hoveredNodeId === targetId) {
      return `rgba(255, 215, 0, ${opacity})`
    }

    // Selected value node links highlight in its color
    if (selectedValueNode && targetId === selectedValueNode) {
      const valueNode = graphData.nodes.find((n) => n.id === selectedValueNode)
      const rgb = valueNode?.color || '#1890FF'
      return `${rgb}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, '0')}`
    }

    // Selected patient links
    if (selectedPatient && sourceId === `patient-${selectedPatient}`) {
      return `rgba(24, 144, 255, ${opacity})`
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
              if (node.type === 'patient') {
                return `👤 Patient: ${node.name}`
              }

              let typeLabel = ''
              if (node.valueType === 'binary') {
                typeLabel = '🔲 Binary'
              } else if (node.valueType === 'ordinal') {
                typeLabel = '📊 Ordinal'
              } else if (node.valueType === 'severity') {
                typeLabel = '⚠️ Severity'
              }

              return `${typeLabel} [${node.container}]: ${node.name}`
            }}
            nodeColor={(node: any) => nodeColor(node)}
            nodeSize={(node: any) => nodeSize(node)}
            linkColor={(link: any) => getLinkColor(link)}
            linkWidth={(link: any) => getLinkWidth(link)}
            linkOpacity={(link: any) => getLinkOpacity(link)}
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
              <span className="info-label">Patients:</span>
              <span className="info-value">
                {graphData.nodes.filter((n) => n.type === 'patient').length}
              </span>
            </div>
            <div className="info-stat">
              <span className="info-label">Values:</span>
              <span className="info-value">
                {graphData.nodes.filter((n) => n.type === 'value').length}
              </span>
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
            {selectedPatient && (
              <div className="info-stat selected-info">
                <span className="info-label">Selected Patient:</span>
                <span className="info-value">{selectedPatient}</span>
              </div>
            )}
            {selectedValueNode && (
              <div className="info-stat selected-info">
                <span className="info-label">Selected Value:</span>
                <span className="info-value">
                  {graphData.nodes.find((n) => n.id === selectedValueNode)?.name}
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
