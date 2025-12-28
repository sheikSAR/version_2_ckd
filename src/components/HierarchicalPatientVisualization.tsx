import React, { useMemo } from 'react'
import type { PatientEdges } from '../utils/patientNodeMapper'
import '../styles/HierarchicalPatientVisualization.css'

interface HierarchicalPatientVisualizationProps {
  patientEdges: PatientEdges[]
}

interface TreeNode {
  id: string
  label: string
  level: number // 0: Patient, 1: Gender, 2: AgeGroup
  type: 'patient' | 'gender' | 'agegroup'
  children: TreeNode[]
  parent?: TreeNode
  x?: number
  y?: number
  color?: string
}

const HierarchicalPatientVisualization: React.FC<HierarchicalPatientVisualizationProps> = ({
  patientEdges,
}) => {
  const treeStructure = useMemo(() => {
    if (patientEdges.length === 0) return null

    // Create root patient node
    const rootNode: TreeNode = {
      id: 'patient-root',
      label: 'Patient',
      level: 0,
      type: 'patient',
      children: [],
      color: '#A0AEC0',
    }

    // Build gender nodes and their age group children
    const genderMap = new Map<string, TreeNode>()

    // Collect all edges and organize by gender
    patientEdges.forEach((patientData) => {
      patientData.edges.forEach((edge) => {
        if (edge.container === 'Gender') {
          // Create gender node if it doesn't exist
          if (!genderMap.has(edge.node)) {
            const genderNode: TreeNode = {
              id: `gender-${edge.node}`,
              label: edge.node,
              level: 1,
              type: 'gender',
              children: [],
              parent: rootNode,
              color: edge.node === 'Male' ? '#A78BFA' : '#F472B6',
            }
            genderMap.set(edge.node, genderNode)
            rootNode.children.push(genderNode)
          }
        }
      })
    })

    // Add age group nodes under each gender
    const ageGroupMap = new Map<string, Set<string>>() // gender -> set of age groups

    patientEdges.forEach((patientData) => {
      let currentGender: string | null = null

      // First pass: find the gender for this patient data
      patientData.edges.forEach((edge) => {
        if (edge.container === 'Gender') {
          currentGender = edge.node
        }
      })

      // Second pass: add age groups to the appropriate gender
      if (currentGender) {
        patientData.edges.forEach((edge) => {
          if (edge.container === 'Age_Group') {
            if (!ageGroupMap.has(currentGender)) {
              ageGroupMap.set(currentGender, new Set())
            }
            ageGroupMap.get(currentGender)!.add(edge.node)
          }
        })
      }
    })

    // Create age group nodes and attach to gender nodes
    ageGroupMap.forEach((ageGroups, gender) => {
      const genderNode = genderMap.get(gender)
      if (genderNode) {
        ageGroups.forEach((ageGroup) => {
          const ageGroupNode: TreeNode = {
            id: `agegroup-${gender}-${ageGroup}`,
            label: ageGroup,
            level: 2,
            type: 'agegroup',
            children: [],
            parent: genderNode,
            color: '#60A5FA',
          }
          genderNode.children.push(ageGroupNode)
        })
      }
    })

    return rootNode
  }, [patientEdges])

  const calculatePositions = (node: TreeNode, x: number = 0, y: number = 0, xOffset: number = 400) => {
    node.x = x
    node.y = y

    if (node.children.length === 0) return

    const childSpacing = xOffset / Math.max(node.children.length, 1)
    const startX = x - (xOffset / 2) + childSpacing / 2

    node.children.forEach((child, index) => {
      const childX = startX + index * childSpacing
      const childY = y + 150
      calculatePositions(child, childX, childY, xOffset * 0.6)
    })
  }

  if (!treeStructure) {
    return (
      <div className="hierarchical-visualization">
        <div className="no-data-message">No data available</div>
      </div>
    )
  }

  calculatePositions(treeStructure, 0, 50)

  const renderNodes = (node: TreeNode): React.ReactNode => {
    const nodeRadius = node.level === 0 ? 50 : node.level === 1 ? 40 : 30
    const nodeSize = nodeRadius * 2

    return (
      <g key={node.id}>
        {/* Render lines to children */}
        {node.children.map((child) => (
          <line
            key={`line-${node.id}-${child.id}`}
            x1={node.x}
            y1={node.y}
            x2={child.x}
            y2={child.y}
            className="tree-line"
          />
        ))}

        {/* Render node circle */}
        <circle
          cx={node.x}
          cy={node.y}
          r={nodeRadius}
          className={`tree-node tree-node-${node.type}`}
          fill={node.color}
        />

        {/* Render node label */}
        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="tree-label"
        >
          {node.label}
        </text>

        {/* Render children */}
        {node.children.map((child) => renderNodes(child))}
      </g>
    )
  }

  // Calculate SVG dimensions
  const padding = 100
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity

  const walkTree = (node: TreeNode) => {
    minX = Math.min(minX, node.x! - 50)
    maxX = Math.max(maxX, node.x! + 50)
    minY = Math.min(minY, node.y! - 50)
    maxY = Math.max(maxY, node.y! + 50)

    node.children.forEach(walkTree)
  }

  walkTree(treeStructure)

  const svgWidth = Math.max(800, maxX - minX + padding * 2)
  const svgHeight = Math.max(600, maxY - minY + padding * 2)
  const viewBoxX = minX - padding
  const viewBoxY = minY - padding

  return (
    <div className="hierarchical-visualization">
      <svg
        className="tree-svg"
        width={svgWidth}
        height={svgHeight}
        viewBox={`${viewBoxX} ${viewBoxY} ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {renderNodes(treeStructure)}
      </svg>
    </div>
  )
}

export default HierarchicalPatientVisualization
