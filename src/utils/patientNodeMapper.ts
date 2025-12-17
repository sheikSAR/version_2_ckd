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
  patients: Record<string, Record<string, string>>
): PatientEdges[] {
  const allEdges: PatientEdges[] = []

  for (const [patientId, patientData] of Object.entries(patients)) {
    const edges: Edge[] = []

    for (const [attribute, value] of Object.entries(patientData)) {
      if (!value || value.trim() === '') {
        continue
      }

      const mapperFunction = mappingRules[attribute]
      if (!mapperFunction) {
        continue
      }

      const mappedNode = mapperFunction(value.trim())
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
          value,
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
