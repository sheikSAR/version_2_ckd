import React, { useEffect, useRef, useState, useMemo } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import type { PatientChainGraph, ChainNode, ChainEdge } from '../utils/patientNodeMapper'
import '../styles/Graph3DVisualization.css'

interface Graph3DVisualizationProps {
  chainGraph: PatientChainGraph
  selectedPatient?: string
  onPatientSelect?: (patientId: string | null) => void
}

interface GraphNode {
  id: string
  label: string
  type: 'root' | 'attribute'
  color: string
  size: number
  patientId?: string
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  patientId: string
  isVisible: boolean
}

const Graph3DVisualization: React.FC<Graph3DVisualizationProps> = ({
  chainGraph,
  selectedPatient,
  onPatientSelect,
}) => {
  const fgRef = useRef<any>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [connectedNodeIds, setConnectedNodeIds] = useState<Set<string>>(new Set())
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

  const patientColorMap = useMemo(() => {
    const map: Record<string, string> = {}
    const patientIds = new Set<string>()

    chainGraph.edges.forEach((edge) => {
      patientIds.add(edge.patientId)
    })

    Array.from(patientIds).forEach((patientId, index) => {
      map[patientId] = colorPalettes[index % colorPalettes.length]
    })

    return map
  }, [chainGraph, colorPalettes])

  const nodeTypeColors = useMemo(
    () => ({
      root: '#FFD700',
      attribute: '#667EEA',
    }),
    []
  )

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
    if (!chainGraph.nodes.length || !chainGraph.edges.length) {
      setGraphData({ nodes: [], links: [] })
      return
    }

    const nodesMap = new Map<string, GraphNode>()
    const linksArray: GraphLink[] = []

    // Add all nodes from chain graph
    chainGraph.nodes.forEach((chainNode) => {
      // Extract patient ID from node ID for attribute nodes (format: CONTAINER_value_sanitizedPatientId_PpatientIndex)
      let patientId: string | undefined
      if (chainNode.type === 'attribute' && chainNode.id.includes('_P')) {
        const parts = chainNode.id.split('_P')
        if (parts.length >= 2) {
          // Extract the patient ID part (second to last underscore-separated part)
          const beforeIndex = parts[0]
          const afterIndex = parts[1]
          // Format is: CONTAINER_nodeValue_sanitizedPatientId
          const idParts = beforeIndex.split('_')
          if (idParts.length >= 3) {
            // Take the second-to-last part as the sanitized patient ID
            patientId = idParts[idParts.length - 1]
          }
        }
      }

      const nodeColor =
        chainNode.type === 'root'
          ? nodeTypeColors.root
          : patientId
            ? patientColorMap[patientId] || patientColorMap[`Patient_${patientId}`] || '#667EEA'
            : '#667EEA'

      nodesMap.set(chainNode.id, {
        id: chainNode.id,
        label: chainNode.label,
        type: chainNode.type,
        color: nodeColor,
        size: chainNode.type === 'root' ? 12 : 6,
        patientId,
      })
    })

    // Add all edges from chain graph
    chainGraph.edges.forEach((chainEdge) => {
      const shouldShowEdge = !selectedPatient || selectedPatient === chainEdge.patientId

      linksArray.push({
        source: chainEdge.source,
        target: chainEdge.target,
        patientId: chainEdge.patientId,
        isVisible: shouldShowEdge,
      })
    })

    setGraphData({
      nodes: Array.from(nodesMap.values()),
      links: linksArray,
    })
  }, [chainGraph, selectedPatient, nodeTypeColors, patientColorMap])

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
    if (node.type === 'attribute' && node.patientId) {
      const patientId = `Patient_${node.patientId}`
      onPatientSelect?.(patientId === selectedPatient ? null : patientId)
    }
  }

  const nodeColor = (node: GraphNode) => {
    if (node.type === 'root') {
      return node.color
    }

    // For attribute nodes, highlight if they belong to hovered chain
    if (hoveredNodeId === node.id) {
      return node.color
    }

    if (connectedNodeIds.has(node.id) && node.patientId) {
      return node.color
    }

    return node.color
  }

  const nodeSize = (node: GraphNode) => {
    if (node.type === 'root') {
      if (hoveredNodeId === node.id) {
        return node.size * 1.5
      }
      return node.size
    }

    if (hoveredNodeId === node.id) {
      return node.size * 2.5
    }

    if (connectedNodeIds.has(node.id)) {
      return node.size * 2
    }

    if (selectedPatient && node.patientId && `Patient_${node.patientId}` === selectedPatient) {
      return node.size * 1.8
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
    if (selectedPatient && link.patientId) {
      const selectedPatientId = selectedPatient.replace('Patient_', '')
      if (link.patientId === selectedPatientId || `Patient_${link.patientId}` === selectedPatient) {
        return 0.5
      }
    }

    return 0.2
  }

  const linkWidth = (link: GraphLink): number => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id

    if (hoveredNodeId === sourceId || hoveredNodeId === targetId) {
      return 4
    }

    if (selectedPatient && link.patientId) {
      const selectedPatientId = selectedPatient.replace('Patient_', '')
      if (link.patientId === selectedPatientId || `Patient_${link.patientId}` === selectedPatient) {
        return 2.5
      }
    }

    return 1.5
  }

  const getLinkColor = (link: GraphLink): string => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id
    const opacity = linkOpacity(link)

    // Get patient color for this link
    const patientColor = patientColorMap[link.patientId] || patientColorMap[`Patient_${link.patientId}`]

    // Use brighter color for hovered edges
    if (hoveredNodeId === sourceId || hoveredNodeId === targetId) {
      return `rgba(255, 200, 0, ${opacity})`
    }

    // Use patient-specific color
    if (patientColor) {
      const rgb = hexToRgb(patientColor)
      if (rgb) {
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
      }
    }

    return `rgba(102, 126, 234, ${opacity})`
  }

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  return (
    <div className="graph-3d-container">
      {graphData.nodes.length > 0 ? (
        <>
          <ForceGraph3D
            ref={fgRef}
            graphData={graphData}
            nodeLabel={(node: any) => {
              if (node.type === 'root') {
                return node.label
              }
              return `${node.label}`
            }}
            nodeColor={(node: any) => nodeColor(node)}
            nodeSize={(node: any) => nodeSize(node)}
            linkColor={(link: any) => getLinkColor(link)}
            linkWidth={(link: any) => linkWidth(link)}
            linkDirectionalArrowLength={(link: any) => (link.isVisible ? 3 : 0)}
            linkCurvature={0.15}
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
            <div className="info-header">Patient Chain Graph</div>
            <div className="info-stat">
              <span className="info-label">Nodes:</span>
              <span className="info-value">{graphData.nodes.length}</span>
            </div>
            <div className="info-stat">
              <span className="info-label">Chains:</span>
              <span className="info-value">{graphData.links.length / 6}</span>
            </div>
            {hoveredNodeId && (
              <div className="info-stat hovered-info">
                <span className="info-label">Hovering:</span>
                <span className="info-value">
                  {graphData.nodes.find((n) => n.id === hoveredNodeId)?.label}
                </span>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="graph-loading">
          <div className="loading-spinner"></div>
          <p>Loading chain graph...</p>
        </div>
      )}
    </div>
  )
}

export default Graph3DVisualization
