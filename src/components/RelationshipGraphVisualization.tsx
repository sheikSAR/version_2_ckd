import React, { useMemo, useState, useEffect, useRef } from 'react'
import nodeData from '../data/node.json'
import { PatientEdges, Edge } from '../utils/patientNodeMapper'
import '../styles/RelationshipGraphVisualization.css'

interface ContainerData {
  name: string
  nodes: string[]
  color: string
  bgColor: string
  headerColor: string
  nodeColor: string
  x: number
  y: number
}

interface NodePosition {
  container: string
  node: string
  x: number
  y: number
}

interface RelationshipGraphVisualizationProps {
  patientEdges: PatientEdges[]
  selectedPatient?: string
  selectedVariable?: string
  onPatientSelect?: (patientId: string | null) => void
}

const RelationshipGraphVisualization: React.FC<RelationshipGraphVisualizationProps> = ({
  patientEdges,
  selectedPatient,
  selectedVariable,
  onPatientSelect,
}) => {
  const [hoveredNode, setHoveredNode] = useState<{ container: string; node: string } | null>(null)
  const [hoveredPatient, setHoveredPatient] = useState<string | null>(null)
  const [animatingEdges, setAnimatingEdges] = useState<Set<string>>(new Set())
  const svgRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const colorPalettes = [
    {
      name: 'Coral',
      color: '#FF6B6B',
      bgColor: '#FFE5E5',
      headerColor: '#FF5252',
      nodeColor: '#FF6B6B',
    },
    {
      name: 'Teal',
      color: '#4ECDC4',
      bgColor: '#E0F7F6',
      headerColor: '#1BA8A0',
      nodeColor: '#4ECDC4',
    },
    {
      name: 'Sky',
      color: '#45B7D1',
      bgColor: '#E3F7FF',
      headerColor: '#0D8FB9',
      nodeColor: '#45B7D1',
    },
    {
      name: 'Salmon',
      color: '#FFA07A',
      bgColor: '#FFE8DC',
      headerColor: '#FF7F50',
      nodeColor: '#FFA07A',
    },
    {
      name: 'Mint',
      color: '#98D8C8',
      bgColor: '#E8F8F3',
      headerColor: '#52B8A0',
      nodeColor: '#98D8C8',
    },
    {
      name: 'Gold',
      color: '#F7DC6F',
      bgColor: '#FFFACD',
      headerColor: '#F4C430',
      nodeColor: '#F7DC6F',
    },
    {
      name: 'Purple',
      color: '#BB8FCE',
      bgColor: '#F5E6FA',
      headerColor: '#9B59B6',
      nodeColor: '#BB8FCE',
    },
    {
      name: 'Blue',
      color: '#85C1E9',
      bgColor: '#E8F4FB',
      headerColor: '#3498DB',
      nodeColor: '#85C1E9',
    },
    {
      name: 'Orange',
      color: '#F8B88B',
      bgColor: '#FFF0E6',
      headerColor: '#E67E22',
      nodeColor: '#F8B88B',
    },
    {
      name: 'Green',
      color: '#A3E4D7',
      bgColor: '#E8FFF7',
      headerColor: '#27AE60',
      nodeColor: '#A3E4D7',
    },
    {
      name: 'Rose',
      color: '#D7BCCB',
      bgColor: '#FBF2F7',
      headerColor: '#C2185B',
      nodeColor: '#D7BCCB',
    },
    {
      name: 'Cyan',
      color: '#B4E7FF',
      bgColor: '#E0F7FF',
      headerColor: '#0084FF',
      nodeColor: '#B4E7FF',
    },
    {
      name: 'Peach',
      color: '#FFD4A3',
      bgColor: '#FFF5EB',
      headerColor: '#FF8C42',
      nodeColor: '#FFD4A3',
    },
    {
      name: 'Lime',
      color: '#C8E6A0',
      bgColor: '#F8FFF0',
      headerColor: '#8BC34A',
      nodeColor: '#C8E6A0',
    },
    {
      name: 'Pink',
      color: '#F4A6D3',
      bgColor: '#FFF0F8',
      headerColor: '#E91E63',
      nodeColor: '#F4A6D3',
    },
  ]

  const containerConfig: ContainerData[] = useMemo(() => {
    const config = Object.entries(nodeData).map((entry, index) => {
      const [containerName, nodes] = entry as [string, string[]]
      const palette = colorPalettes[index % colorPalettes.length]

      return {
        name: containerName,
        nodes: nodes,
        color: palette.color,
        bgColor: palette.bgColor,
        headerColor: palette.headerColor,
        nodeColor: palette.nodeColor,
        x: 0,
        y: 0,
      }
    })

    return config
  }, [])

  const nodePositions = useMemo(() => {
    const positions: NodePosition[] = []

    containerConfig.forEach((container, containerIndex) => {
      const containerX = containerIndex * 250 + 50
      const containerY = 250

      container.nodes.forEach((node, nodeIndex) => {
        const nodeX = containerX + 110
        const nodeY = containerY + 100 + nodeIndex * 100

        positions.push({
          container: container.name,
          node,
          x: nodeX,
          y: nodeY,
        })
      })
    })

    return positions
  }, [containerConfig])

  const patientPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {}
    const uniquePatients = patientEdges.map((pe) => pe.patientId)

    uniquePatients.forEach((patientId, index) => {
      const x = 40
      const y = 80 + index * 40

      positions[patientId] = { x, y }
    })

    return positions
  }, [patientEdges])

  useEffect(() => {
    if (!patientEdges.length) return

    const edges = patientEdges.flatMap((pe) =>
      pe.edges.map((edge) => `${pe.patientId}-${edge.container}-${edge.node}`)
    )

    const animateEdges = () => {
      edges.forEach((edgeId, index) => {
        setTimeout(() => {
          setAnimatingEdges((prev) => new Set([...prev, edgeId]))
        }, index * 50)
      })
    }

    animateEdges()
  }, [patientEdges])

  const shouldShowEdge = (edge: Edge, patientId: string): boolean => {
    if (selectedPatient && selectedPatient !== patientId) return false
    if (selectedVariable && selectedVariable !== edge.container) return false
    return true
  }

  const getNodePosition = (container: string, node: string) => {
    return nodePositions.find((pos) => pos.container === container && pos.node === node)
  }

  const getPatientPosition = (patientId: string) => {
    return patientPositions[patientId]
  }

  return (
    <div className="relationship-graph-container">
      <div className="graph-canvas" ref={canvasRef}>
        <svg
          ref={svgRef}
          className="graph-svg"
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="rgba(102, 126, 234, 0.4)" />
            </marker>
          </defs>

          {patientEdges.map((patientData) =>
            patientData.edges
              .filter((edge) => shouldShowEdge(edge, patientData.patientId))
              .map((edge) => {
                const patientPos = getPatientPosition(patientData.patientId)
                const nodePos = getNodePosition(edge.container, edge.node)

                if (!patientPos || !nodePos) return null

                const edgeId = `${patientData.patientId}-${edge.container}-${edge.node}`
                const isAnimating = animatingEdges.has(edgeId)
                const isHovered =
                  hoveredPatient === patientData.patientId ||
                  (hoveredNode?.container === edge.container && hoveredNode?.node === edge.node)

                return (
                  <line
                    key={edgeId}
                    x1={patientPos.x + 30}
                    y1={patientPos.y}
                    x2={nodePos.x - 40}
                    y2={nodePos.y}
                    className={`edge ${isAnimating ? 'animated' : ''} ${isHovered ? 'hovered' : ''}`}
                    stroke={
                      isHovered ? 'rgba(102, 126, 234, 0.8)' : 'rgba(102, 126, 234, 0.3)'
                    }
                    strokeWidth={isHovered ? 3 : 2}
                    markerEnd="url(#arrowhead)"
                  />
                )
              })
          )}
        </svg>

        <div className="patient-nodes-section">
          <h3>Patients</h3>
          <div className="patient-nodes-list">
            {patientEdges.map((patientData) => {
              const edgeCount = patientData.edges.length
              return (
                <div
                  key={patientData.patientId}
                  className={`patient-node ${
                    hoveredPatient === patientData.patientId ? 'hovered' : ''
                  } ${selectedPatient === patientData.patientId ? 'selected' : ''}`}
                  onMouseEnter={() => setHoveredPatient(patientData.patientId)}
                  onMouseLeave={() => setHoveredPatient(null)}
                  onClick={() => onPatientSelect?.(patientData.patientId)}
                >
                  <div className="patient-circle">
                    <span className="patient-id">{patientData.patientId}</span>
                    <span className="edge-count">{edgeCount}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="nodes-section">
          {containerConfig.map((container) => (
            <div key={container.name} className="entity-container" style={{ borderColor: container.headerColor }}>
              <div className="container-header" style={{ backgroundColor: container.headerColor }}>
                <h2 className="container-title">{container.name}</h2>
              </div>

              <div className="container-body" style={{ backgroundColor: container.bgColor }}>
                <div className="nodes-list">
                  {container.nodes.map((node, nodeIndex) => (
                    <div
                      key={nodeIndex}
                      className="node-wrapper"
                      onMouseEnter={() => setHoveredNode({ container: container.name, node })}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <div
                        className={`node-circle ${
                          hoveredNode?.container === container.name && hoveredNode?.node === node
                            ? 'hovered'
                            : ''
                        }`}
                        style={{
                          borderColor: container.nodeColor,
                          backgroundColor: container.nodeColor,
                        }}
                      >
                        <span className="node-text">{node}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RelationshipGraphVisualization
