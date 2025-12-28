import nodeData from '../data/node.json'

export interface HierarchicalNode {
  id: string
  name: string
  type: 'root' | 'gender' | 'age_group' | 'attribute'
  parent: string | null
  container?: string
}

export interface PatientEdge {
  source: string // attribute node id
  target: string // patient id
  patientId: string
}

export interface HierarchicalGraph {
  nodes: HierarchicalNode[]
  edges: PatientEdge[]
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

export function mapPatientDataToHierarchy(
  patients: Record<string, Record<string, string | number>>
): HierarchicalGraph {
  const nodes: HierarchicalNode[] = []
  const edges: PatientEdge[] = []
  const nodeIdSet = new Set<string>()

  // Create root node
  const rootId = 'patient-root'
  nodes.push({
    id: rootId,
    name: 'Patient',
    type: 'root',
    parent: null,
  })
  nodeIdSet.add(rootId)

  // Track hierarchy for deduplication
  const genderNodes = new Map<string, string>() // gender name -> id
  const ageGroupNodes = new Map<string, string>() // "gender|ageGroup" -> id
  const attributeNodes = new Map<string, string>() // "gender|ageGroup|container|node" -> id

  for (const [patientId, patientData] of Object.entries(patients)) {
    let genderValue: string | null = null
    let ageGroupValue: string | null = null
    const attributeMap = new Map<string, { container: string; node: string }>()

    // First pass: extract gender and age group
    for (const [attribute, value] of Object.entries(patientData)) {
      const stringValue = String(value).trim()
      if (!stringValue) continue

      if (attribute.toLowerCase() === 'gender') {
        genderValue = mappingRules.gender(stringValue)
      } else if (attribute.toLowerCase() === 'age') {
        ageGroupValue = mappingRules.age(stringValue)
      }
    }

    // Ensure we have gender and age group
    if (!genderValue) continue

    // Create or get gender node
    let genderId = genderNodes.get(genderValue)
    if (!genderId) {
      genderId = `patient-root-${genderValue.toLowerCase()}`
      nodes.push({
        id: genderId,
        name: genderValue,
        type: 'gender',
        parent: rootId,
      })
      nodeIdSet.add(genderId)
      genderNodes.set(genderValue, genderId)
    }

    // Create or get age group node
    if (ageGroupValue) {
      const ageGroupKey = `${genderValue}|${ageGroupValue}`
      let ageGroupId = ageGroupNodes.get(ageGroupKey)
      if (!ageGroupId) {
        ageGroupId = `patient-${genderValue.toLowerCase()}-${sanitizeId(ageGroupValue)}`
        nodes.push({
          id: ageGroupId,
          name: ageGroupValue,
          type: 'age_group',
          parent: genderId,
        })
        nodeIdSet.add(ageGroupId)
        ageGroupNodes.set(ageGroupKey, ageGroupId)
      }

      // Second pass: extract all attributes
      for (const [attribute, value] of Object.entries(patientData)) {
        const stringValue = String(value).trim()
        if (!stringValue) continue

        // Skip gender and age as they're already processed
        if (attribute.toLowerCase() === 'gender' || attribute.toLowerCase() === 'age') {
          continue
        }

        const mapperFunction = mappingRules[attribute]
        if (!mapperFunction) continue

        const mappedNode = mapperFunction(stringValue)
        if (!mappedNode) continue

        const container = getContainerForAttribute(attribute)
        if (!container) continue

        const nodeDataDict = nodeData as NodeDataType
        const containerNodes = nodeDataDict[container] || []

        if (containerNodes.includes(mappedNode)) {
          attributeMap.set(`${container}|${mappedNode}`, { container, node: mappedNode })
        }
      }

      // Create attribute nodes and edges
      for (const [key, { container, node: nodeName }] of attributeMap) {
        const attributeNodeKey = `${genderValue}|${ageGroupValue}|${container}|${nodeName}`
        let attributeNodeId = attributeNodes.get(attributeNodeKey)

        if (!attributeNodeId) {
          attributeNodeId = `patient-${sanitizeId(genderValue)}-${sanitizeId(ageGroupValue)}-${sanitizeId(container)}-${sanitizeId(nodeName)}`
          nodes.push({
            id: attributeNodeId,
            name: nodeName,
            type: 'attribute',
            parent: ageGroupId,
            container,
          })
          nodeIdSet.add(attributeNodeId)
          attributeNodes.set(attributeNodeKey, attributeNodeId)
        }

        // Create edge from attribute to patient
        edges.push({
          source: attributeNodeId,
          target: patientId,
          patientId,
        })
      }
    }
  }

  return { nodes, edges }
}

function sanitizeId(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// Legacy interface for backward compatibility
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

export function mapPatientDataToNodes(
  patients: Record<string, Record<string, string | number>>
): PatientEdges[] {
  const allEdges: PatientEdges[] = []

  for (const [patientId, patientData] of Object.entries(patients)) {
    const edges: Edge[] = []

    for (const [attribute, value] of Object.entries(patientData)) {
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
