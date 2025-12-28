import React, { useEffect, useRef, useState, useMemo } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import '../styles/Graph3DVisualization.css'

interface Graph3DVisualizationProps {
  patientEdges: any[] // Legacy prop for backward compatibility
  selectedPatient?: string
  selectedVariable?: string
  onPatientSelect?: (patientId: string | null) => void
}

interface GraphNode {
  id: string
  name: string
  type: 'root' | 'gender' | 'age_group' | 'attribute'
  parentId: string | null
  container?: string
  color: string
  size: number
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  isVisible: boolean
  patientId?: string
}

const Graph3DVisualization: React.FC<Graph3DVisualizationProps> = ({
  patientEdges,
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

  const colorPalette = useMemo(
    () => ({
      root: '#FF1744',
      gender: '#1976D2',
      ageGroup: '#388E3C',
      attribute: '#F57C00',
    }),
    []
  )

  const containerToColorMap = useMemo(() => {
    const map: Record<string, string> = {
      Gender: '#1976D2',
      Age_Group: '#388E3C',
      DR: '#E91E63',
      HTN: '#9C27B0',
      Duration_of_Diabetes: '#FF9800',
      HB: '#00BCD4',
      HBA: '#4CAF50',
      EGFR: '#2196F3',
      DR_Severity_OD: '#FF5722',
      DR_Severity_OS: '#FFC107',
    }
    return map
  }, [])

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

    // Create root node
    nodesMap.set('patient-root', {
      id: 'patient-root',
      name: 'Patient',
      type: 'root',
      parentId: null,
      color: colorPalette.root,
      size: 12,
    })

    for (let i = 0; i < patientEdges.length; i++) {
      const patientData = patientEdges[i]
      if (!patientData.edges || !Array.isArray(patientData.edges)) continue

      let genderValue: string | null = null
      let ageGroupValue: string | null = null
      const attributeSet = new Map<string, string>() // container|node -> container

      // First pass: find gender and age group
      for (let j = 0; j < patientData.edges.length; j++) {
        const edge = patientData.edges[j]
        if (edge.container === 'Gender') {
          genderValue = edge.node
        } else if (edge.container === 'Age_Group') {
          ageGroupValue = edge.node
        }
      }

      if (!genderValue) continue

      // Second pass: collect attributes
      for (let j = 0; j < patientData.edges.length; j++) {
        const edge = patientData.edges[j]
        if (edge.container !== 'Gender' && edge.container !== 'Age_Group') {
          attributeSet.set(`${edge.container}|${edge.node}`, edge.container)
        }
      }

      // Create gender node
      const genderId = `patient-root-${genderValue.toLowerCase()}`
      if (!nodesMap.has(genderId)) {
        nodesMap.set(genderId, {
          id: genderId,
          name: genderValue,
          type: 'gender',
          parentId: 'patient-root',
          color: colorPalette.gender,
          size: 8,
        })
      }

      // Create age group node
      if (ageGroupValue) {
        const ageGroupId = `patient-${genderValue.toLowerCase()}-${sanitizeId(ageGroupValue)}`
        if (!nodesMap.has(ageGroupId)) {
          nodesMap.set(ageGroupId, {
            id: ageGroupId,
            name: ageGroupValue,
            type: 'age_group',
            parentId: genderId,
            color: colorPalette.ageGroup,
            size: 7,
          })
        }

        // Create attribute nodes and links
        attributeSet.forEach((container, attributeKey) => {
          const [, nodeName] = attributeKey.split('|')
          const attributeId = `patient-${genderValue!.toLowerCase()}-${sanitizeId(ageGroupValue!)}-${sanitizeId(container)}-${sanitizeId(nodeName)}`

          if (!nodesMap.has(attributeId)) {
            nodesMap.set(attributeId, {
              id: attributeId,
              name: nodeName,
              type: 'attribute',
              parentId: ageGroupId,
              container,
              color: containerToColorMap[container] || '#999999',
              size: 5,
            })
          }

          // Add link from attribute to patient
          linksArray.push({
            source: attributeId,
            target: patientData.patientId,
            isVisible: !selectedPatient || selectedPatient === patientData.patientId,
            patientId: patientData.patientId,
          })
        })
      }
    }

    // Create patient nodes (invisible nodes for edges to point to)
    patientEdges.forEach((patientData: any) => {
      if (!nodesMap.has(patientData.patientId)) {
        nodesMap.set(patientData.patientId, {
          id: patientData.patientId,
          name: patientData.patientId,
          type: 'attribute', // Treat as attribute for styling
          parentId: null,
          color: '#FFFFFF',
          size: 2,
        })
      }
    })

    setGraphData({
      nodes: Array.from(nodesMap.values()),
      links: linksArray,
    })
  }, [patientEdges, selectedPatient, colorPalette, containerToColorMap])

  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      const graph = fgRef.current
      
      // Configure the force simulation to respect hierarchy
      graph.d3Force('charge').strength(-500)
      graph.d3Force('link').distance((link: any) => {
        // Shorter distance for hierarchical links
        const sourceNode = graphData.nodes.find(n => n.id === (typeof link.source === 'string' ? link.source : link.source.id))
        if (sourceNode?.type === 'attribute' && link.patientId) {
          return 120 // Longer distance for attribute-to-patient links
        }
        return 50 // Shorter distance for hierarchical connections
      })

      graph.d3Force('link').strength((link: any) => {
        const sourceNode = graphData.nodes.find(n => n.id === (typeof link.source === 'string' ? link.source : link.source.id))
        if (sourceNode?.type === 'attribute' && link.patientId) {
          return 0.3 // Weaker force for attribute-to-patient links
        }
        return 1 // Normal force for hierarchical connections
      })

      // Fit to screen after a delay
      setTimeout(() => {
        graph.zoomToFit(400, 50)
      }, 100)
    }
  }, [graphData])

  const handleNodeHover = (node: GraphNode | null) => {
    if (node) {
      setHoveredNodeId(node.id)
      const connected = adjacencyMap.get(node.id) || new Set()
      setConnectedNodeIds(connected)
    } else {
      setHoveredNodeId(null)
      setConnectedNodeIds(new Set())
    }
  }

  const handleNodeClick = (node: GraphNode) => {
    // Allow selection of patient nodes only
    if (node.name.startsWith('PAT_') || /^[A-Z0-9]+$/.test(node.name)) {
      onPatientSelect?.(node.id === selectedPatient ? null : node.id)
    }
  }

  const nodeColor = (node: GraphNode) => {
    if (selectedPatient === node.id) {
      return '#FFD700'
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

    if (selectedPatient === node.id) {
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

    if (hoveredNodeId === sourceId || hoveredNodeId === targetId) {
      return 0.9
    }

    if (selectedPatient && targetId === selectedPatient) {
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

    if (selectedPatient && targetId === selectedPatient) {
      return 2.5
    }

    return 1.5
  }

  const getLinkColor = (link: GraphLink): string => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id
    const opacity = linkOpacity(link)

    if (hoveredNodeId === sourceId || hoveredNodeId === targetId) {
      return `rgba(255, 200, 0, ${opacity})`
    }

    if (selectedPatient && targetId === selectedPatient) {
      return `rgba(102, 200, 234, ${opacity})`
    }

    return `rgba(102, 126, 234, ${opacity})`
  }

  return (
    <div className="graph-3d-container">
      {graphData.nodes.length > 0 ? (
        <>
          {React.createElement(ForceGraph3D as any, {
            ref: fgRef,
            graphData: graphData,
            nodeLabel: (node: any) => {
              if (node.type === 'root') {
                return `${node.name}`
              }
              if (node.type === 'gender') {
                return `Gender: ${node.name}`
              }
              if (node.type === 'age_group') {
                return `Age Group: ${node.name}`
              }
              if (node.type === 'attribute' && node.container) {
                return `${node.container}: ${node.name}`
              }
              // Patient node
              return `Patient: ${node.name}`
            },
            nodeColor: (node: any) => nodeColor(node),
            nodeSize: (node: any) => nodeSize(node),
            linkColor: (link: any) => getLinkColor(link),
            linkWidth: (link: any) => linkWidth(link),
            linkDirectionalArrowLength: (link: any) => (link.isVisible ? 4 : 0),
            linkCurvature: 0.25,
            onNodeHover: handleNodeHover,
            onNodeClick: handleNodeClick,
            backgroundColor: '#0F1419',
            cooldownTime: 3000,
            warmupTicks: 100,
            d3AlphaDecay: 0.03,
            d3VelocityDecay: 0.3,
            width: typeof window !== 'undefined' ? window.innerWidth : 1024,
            height: typeof window !== 'undefined' ? window.innerHeight - 300 : 768,
          })}
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

function sanitizeId(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export default Graph3DVisualization
