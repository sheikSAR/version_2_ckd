import nodeData from '../data/node.json'

export interface Edge {
  patientId: string
  container: string
  node: string
  relationshipType: string
  value: string
}

export interface PatientEdges {
  patientId: string
  edges: Edge[]
}

export interface ChainNode {
  id: string
  label: string
  type: 'root' | 'attribute'
}

export interface ChainEdge {
  source: string
  target: string
  relationship: string
  patientId: string
}

export interface PatientChainGraph {
  nodes: ChainNode[]
  edges: ChainEdge[]
}

type NodeDataType = Record<string, string[]>

const mappingRules: Record<string, (value: string) => string | null> = {
  gender: (value: string) => {
    if (value === '1') return 'Male'
    if (value === '0') return 'Female'
    return null
  },

  age: (value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return null

    const nodes = (nodeData as NodeDataType)['Age_Group'] || []
    return findNumericRange(num, nodes)
  },

  Durationofdiabetes: (value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return null

    const nodes = (nodeData as NodeDataType)['Duration_of_Diabetes'] || []
    return findNumericRange(num, nodes)
  },

  Duration_of_Diabetes: (value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return null

    const nodes = (nodeData as NodeDataType)['Duration_of_Diabetes'] || []
    return findNumericRange(num, nodes)
  },

  BMI: () => {
    return null
  },

  HBA: (value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return null

    const nodes = (nodeData as NodeDataType)['HBA'] || []
    return findNumericRange(num, nodes)
  },

  HB: (value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return null

    const nodes = (nodeData as NodeDataType)['HB'] || []
    return findNumericRange(num, nodes)
  },

  EGFR: (value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return null

    if (num >= 90) return 'EGFR >= 90'
    return 'EGFR < 90'
  },

  Hypertension: (value: string) => {
    if (value === '1') return 'HTN'
    if (value === '' || value === '0') return 'No_HTN'
    return null
  },

  HTN: (value: string) => {
    if (value === '1') return 'HTN'
    if (value === '' || value === '0') return 'No_HTN'
    return null
  },

  OHA: (value: string) => {
    if (value === '1') return 'OHA'
    return null
  },

  INSULIN: (value: string) => {
    if (value === '1') return 'INSULIN'
    return null
  },

  CHO: () => {
    return null
  },

  TRI: () => {
    return null
  },

  DR_OD: (value: string) => {
    if (value === '1') return 'DR_OD'
    if (value === '' || value === '0') return 'Non_DR_OD'
    return null
  },

  DR_OS: (value: string) => {
    if (value === '1') return 'DR_OS'
    if (value === '' || value === '0') return 'Non_DR_OS'
    return null
  },

  DR_SEVERITY_OD: (value: string) => {
    const num = parseInt(value, 10)
    if (isNaN(num)) return null

    const nodes = (nodeData as NodeDataType)['DR_Severity_OD'] || []
    if (num >= 1 && num <= nodes.length) {
      return nodes[num - 1]
    }
    return null
  },

  DR_Severity_OD: (value: string) => {
    const num = parseInt(value, 10)
    if (isNaN(num)) return null

    const nodes = (nodeData as NodeDataType)['DR_Severity_OD'] || []
    if (num >= 1 && num <= nodes.length) {
      return nodes[num - 1]
    }
    return null
  },

  DR_SEVERITY_OS: (value: string) => {
    const num = parseInt(value, 10)
    if (isNaN(num)) return null

    const nodes = (nodeData as NodeDataType)['DR_Severity_OS'] || []
    if (num >= 1 && num <= nodes.length) {
      return nodes[num - 1]
    }
    return null
  },

  DR_Severity_OS: (value: string) => {
    const num = parseInt(value, 10)
    if (isNaN(num)) return null

    const nodes = (nodeData as NodeDataType)['DR_Severity_OS'] || []
    if (num >= 1 && num <= nodes.length) {
      return nodes[num - 1]
    }
    return null
  },
}

function findNumericRange(value: number, nodes: string[]): string | null {
  for (const node of nodes) {
    if (matchesRange(value, node)) {
      return node
    }
  }
  return null
}

function matchesRange(value: number, rangeNode: string): boolean {
  // HB <= 9
  if (rangeNode.includes('<=') && !rangeNode.includes('<')) {
    const match = rangeNode.match(/([>=<]+)\s*([\d.]+)/)
    if (match) {
      const op = match[1]
      const bound = parseFloat(match[2])
      if (op === '<=' && value <= bound) return true
      if (op === '>=' && value >= bound) return true
    }
  }

  // 9 < HB <= 12
  const rangeMatch = rangeNode.match(/([<>]=?)\s*([\d.]+)\s*[<>A-Za-z_]*\s*([<>]=?)\s*([\d.]+)/)
  if (rangeMatch) {
    const op1 = rangeMatch[1]
    const bound1 = parseFloat(rangeMatch[2])
    const op2 = rangeMatch[3]
    const bound2 = parseFloat(rangeMatch[4])

    let condition1 = false
    let condition2 = false

    if (op1 === '<' && value > bound1) condition1 = true
    if (op1 === '<=' && value >= bound1) condition1 = true
    if (op1 === '>' && value < bound1) condition1 = true
    if (op1 === '>=' && value <= bound1) condition1 = true

    if (op2 === '<' && value < bound2) condition2 = true
    if (op2 === '<=' && value <= bound2) condition2 = true
    if (op2 === '>' && value > bound2) condition2 = true
    if (op2 === '>=' && value >= bound2) condition2 = true

    if (condition1 && condition2) return true
  }

  // Age < 40
  if (rangeNode.includes('<') && !rangeNode.includes('<=')) {
    const match = rangeNode.match(/([<>])\s*([\d.]+)/)
    if (match) {
      const op = match[1]
      const bound = parseFloat(match[2])
      if (op === '<' && value < bound) return true
      if (op === '>' && value > bound) return true
    }
  }

  // Age > 78
  if (rangeNode.includes('>') && !rangeNode.includes('>=')) {
    const match = rangeNode.match(/([<>])\s*([\d.]+)/)
    if (match) {
      const op = match[1]
      const bound = parseFloat(match[2])
      if (op === '<' && value < bound) return true
      if (op === '>' && value > bound) return true
    }
  }

  // Age == 40
  if (rangeNode.includes('==')) {
    const match = rangeNode.match(/==\s*([\d.]+)/)
    if (match) {
      const bound = parseFloat(match[1])
      if (value === bound) return true
    }
  }

  return false
}

function getContainerForAttribute(attribute: string): string {
  const containerMap: Record<string, string> = {
    age: 'Age_Group',
    gender: 'Gender',
    Durationofdiabetes: 'Duration_of_Diabetes',
    Duration_of_Diabetes: 'Duration_of_Diabetes',
    HBA: 'HBA',
    HB: 'HB',
    EGFR: 'EGFR',
    Hypertension: 'HTN',
    HTN: 'HTN',
    DR_OD: 'DR',
    DR_OS: 'DR',
    DR_SEVERITY_OD: 'DR_Severity_OD',
    DR_Severity_OD: 'DR_Severity_OD',
    DR_SEVERITY_OS: 'DR_Severity_OS',
    DR_Severity_OS: 'DR_Severity_OS',
  }

  return containerMap[attribute] || ''
}

export function mapPatientDataToNodes(
  patients: Record<string, Record<string, string | number>>
): PatientEdges[] {
  const allEdges: PatientEdges[] = []

  for (const [patientId, patientData] of Object.entries(patients)) {
    const edges: Edge[] = []

    for (const [attribute, value] of Object.entries(patientData)) {
      // Convert value to string and check if empty
      const stringValue = String(value).trim()
      if (!stringValue) {
        continue
      }

      const mapperFunction = mappingRules[attribute]
      if (!mapperFunction) {
        continue
      }

      const mappedNode = mapperFunction(stringValue)
      if (!mappedNode) {
        continue
      }

      const container = getContainerForAttribute(attribute)
      if (!container) {
        continue
      }

      const nodeDataDict = nodeData as NodeDataType
      const containerNodes = nodeDataDict[container] || []

      if (containerNodes.includes(mappedNode)) {
        edges.push({
          patientId,
          container,
          node: mappedNode,
          relationshipType: `HAS_${container.toUpperCase()}`,
          value: stringValue,
        })
      }
    }

    allEdges.push({
      patientId,
      edges,
    })
  }

  return allEdges
}

// Chain-based graph mapper: Creates a single Patient root node with edge chains per patient
export function mapPatientDataToChainGraph(
  patients: Record<string, Record<string, string | number>> | Array<Record<string, string | number>>
): PatientChainGraph {
  const nodes: ChainNode[] = []
  const edges: ChainEdge[] = []
  const nodesSet = new Set<string>()
  const patientIndexMap = new Map<number, string>() // Map index to patient ID

  // Add single root Patient node
  const rootId = 'PATIENT_ROOT'
  nodes.push({
    id: rootId,
    label: 'Patient',
    type: 'root',
  })
  nodesSet.add(rootId)

  // Define the fixed chain order
  const chainOrder = [
    { attribute: 'gender', container: 'Gender' },
    { attribute: 'age', container: 'Age_Group' },
    { attribute: 'Durationofdiabetes', container: 'Duration_of_Diabetes' },
    { attribute: 'HBA', container: 'HBA' },
    { attribute: 'HB', container: 'HB' },
    { attribute: 'EGFR', container: 'EGFR' },
  ]

  // Convert array format to dict if needed
  const patientDict: Record<string, Record<string, string | number>> = Array.isArray(patients)
    ? patients.reduce(
        (acc, patient, index) => {
          const patientId = (patient.ID as string) || `Patient_${index}`
          acc[patientId] = patient
          return acc
        },
        {} as Record<string, Record<string, string | number>>
      )
    : patients

  // Process each patient
  let patientIndex = 0
  for (const [patientId, patientData] of Object.entries(patientDict)) {
    patientIndexMap.set(patientIndex, patientId)
    let previousNodeId = rootId
    let previousNodeLabel = 'Patient'

    // Build the chain for this patient
    for (let chainStep = 0; chainStep < chainOrder.length; chainStep++) {
      const { attribute, container } = chainOrder[chainStep]
      const rawValue = patientData[attribute]

      if (rawValue === undefined || rawValue === null || rawValue === '') {
        continue
      }

      const stringValue = String(rawValue).trim()
      if (!stringValue) {
        continue
      }

      // Map the value to a node label
      const mapperFunction = mappingRules[attribute]
      if (!mapperFunction) {
        continue
      }

      const mappedNode = mapperFunction(stringValue)
      if (!mappedNode) {
        continue
      }

      // Verify the mapped node exists in node.json
      const nodeDataDict = nodeData as NodeDataType
      const containerNodes = nodeDataDict[container] || []
      if (!containerNodes.includes(mappedNode)) {
        continue
      }

      // Create unique node ID for this patient's chain step
      // Format: CONTAINER_nodeValue_patientId_PpatientIndex
      const sanitizedPatientId = String(patientId).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)
      const currentNodeId = `${container.toUpperCase()}_${mappedNode.replace(/\s+/g, '_')}_${sanitizedPatientId}_P${patientIndex}`
      const currentNodeLabel = mappedNode

      // Add node if not already added
      if (!nodesSet.has(currentNodeId)) {
        nodes.push({
          id: currentNodeId,
          label: currentNodeLabel,
          type: 'attribute',
        })
        nodesSet.add(currentNodeId)
      }

      // Add edge from previous node to current node
      const relationshipTypes: Record<string, string> = {
        gender: 'PATIENT_HAS_GENDER',
        age: 'GENDER_TO_AGE',
        Durationofdiabetes: 'AGE_TO_DURATION',
        HBA: 'DURATION_TO_HBA',
        HB: 'HBA_TO_HB',
        EGFR: 'HB_TO_EGFR',
      }

      edges.push({
        source: previousNodeId,
        target: currentNodeId,
        relationship: relationshipTypes[attribute] || `${container.toUpperCase()}_EDGE`,
        patientId,
      })

      // Update previous node for next iteration
      previousNodeId = currentNodeId
      previousNodeLabel = currentNodeLabel
    }

    patientIndex++
  }

  return {
    nodes,
    edges,
  }
}
