import React, { useMemo } from 'react'
import nodeData from '../data/node.json'
import '../styles/DataGraphVisualization.css'

const DataGraphVisualization: React.FC = () => {
  const containerColors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E9',
    '#F8B88B',
    '#A3E4D7',
    '#D7BCCB',
    '#B4E7FF',
    '#FFD4A3',
    '#C8E6A0',
    '#F4A6D3',
  ]

  const containerConfig = useMemo(() => {
    const entries = Object.entries(nodeData)
    const containerHeight = 180
    const containerWidth = 200
    const containerGapX = 40
    const containerGapY = 30
    const nodeRadius = 20
    const nodeGapY = 40

    let currentY = 20
    let currentX = 20

    return entries.map((entry, containerIndex) => {
      const [containerName, nodes] = entry as [string, string[]]
      const color = containerColors[containerIndex % containerColors.length]

      const adjustedHeight = Math.max(containerHeight, nodes.length * nodeGapY + 20)

      const containerData = {
        name: containerName,
        nodes: nodes,
        color,
        x: currentX,
        y: currentY,
        width: containerWidth,
        height: adjustedHeight,
        nodeRadius,
      }

      currentX += containerWidth + containerGapX

      // Reset to next row if too many containers
      if (currentX > 1200) {
        currentX = 20
        currentY += adjustedHeight + containerGapY
      }

      return containerData
    })
  }, [])

  const svgWidth = 1400
  const svgHeight = useMemo(() => {
    if (containerConfig.length === 0) return 400
    const maxY = Math.max(...containerConfig.map(c => c.y + c.height)) + 20
    return maxY
  }, [containerConfig])

  return (
    <div className="data-graph-visualization-container">
      <svg
        width={svgWidth}
        height={svgHeight}
        className="data-graph-svg"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      >
        {containerConfig.map((container, containerIndex) => (
          <g key={containerIndex}>
            {/* Container background */}
            <rect
              x={container.x}
              y={container.y}
              width={container.width}
              height={container.height}
              fill={container.color}
              opacity={0.15}
              stroke={container.color}
              strokeWidth={2}
              rx={8}
            />

            {/* Container label */}
            <text
              x={container.x + container.width / 2}
              y={container.y + 25}
              textAnchor="middle"
              className="container-label"
              fill={container.color}
              fontSize="14"
              fontWeight="bold"
            >
              {container.name}
            </text>

            {/* Nodes */}
            {container.nodes.map((node, nodeIndex) => {
              const nodeY = container.y + 50 + nodeIndex * 40
              const nodeX = container.x + container.width / 2

              return (
                <g key={nodeIndex}>
                  {/* Node circle */}
                  <circle
                    cx={nodeX}
                    cy={nodeY}
                    r={container.nodeRadius}
                    fill={container.color}
                    opacity={0.3}
                    stroke={container.color}
                    strokeWidth={2}
                  />

                  {/* Node text */}
                  <text
                    x={nodeX}
                    y={nodeY}
                    textAnchor="middle"
                    dy="0.3em"
                    className="node-label"
                    fontSize="11"
                    fontWeight="500"
                  >
                    {node.length > 15 ? node.substring(0, 12) + '...' : node}
                  </text>
                </g>
              )
            })}
          </g>
        ))}
      </svg>
    </div>
  )
}

export default DataGraphVisualization
