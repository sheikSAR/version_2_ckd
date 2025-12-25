/**
 * File parsing utilities
 * Centralized logic for parsing JSON, YAML, and Excel files
 */

import * as XLSX from 'xlsx'
import { ConfigurationData, FileFormat } from '../types'
import { ACCEPTED_EXTENSIONS, FILE_ERROR_MESSAGES } from '../constants/files'

/**
 * Determines the file format based on file extension
 */
export function getFileFormat(fileName: string): FileFormat | null {
  const lowerName = fileName.toLowerCase()
  if (lowerName.endsWith('.json')) return 'json'
  if (lowerName.endsWith('.yaml') || lowerName.endsWith('.yml')) return 'yaml'
  if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) return 'excel'
  return null
}

/**
 * Validates if file has acceptable extension
 */
export function isValidFileExtension(fileName: string): boolean {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
  return ACCEPTED_EXTENSIONS.includes(extension as any)
}

/**
 * Parses a JSON string into ConfigurationData
 */
export function parseJsonString(jsonText: string): ConfigurationData {
  const parsed = JSON.parse(jsonText)
  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(FILE_ERROR_MESSAGES.INVALID_JSON)
  }
  return parsed as ConfigurationData
}

/**
 * Parses a YAML string into ConfigurationData
 * Simple YAML parser for key-value format
 */
export function parseYamlString(yamlText: string): ConfigurationData {
  const result: ConfigurationData = {}
  const lines = yamlText.split('\n')
  let currentId: string | null = null
  let currentNested: Record<string, string> = {}

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) continue

    const colonIndex = trimmedLine.indexOf(':')
    if (colonIndex > -1) {
      const key = trimmedLine.substring(0, colonIndex).trim()
      const value = trimmedLine.substring(colonIndex + 1).trim()

      if (key && value) {
        if (!currentId) {
          currentId = key
        } else {
          currentNested[key] = value
        }
      }

      if (currentId && Object.keys(currentNested).length > 0 && line.match(/^\S/)) {
        result[currentId] = currentNested
        currentId = key
        currentNested = {}
      }
    }
  }

  if (currentId && Object.keys(currentNested).length > 0) {
    result[currentId] = currentNested
  }

  return result
}

/**
 * Parses an Excel file into ConfigurationData
 */
export async function parseExcelFile(file: File): Promise<ConfigurationData> {
  const result: ConfigurationData = {}

  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  if (!workbook.SheetNames.length) {
    return {}
  }

  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][]

  if (rows.length < 2) {
    return {}
  }

  const headers = rows[0].map(h => String(h))
  const idColumnIndex = 0

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const idValue = String(row[idColumnIndex] || '')

    if (idValue) {
      const nestedObject: Record<string, string> = {}
      for (let j = 0; j < headers.length; j++) {
        if (j !== idColumnIndex) {
          nestedObject[headers[j]] = String(row[j] || '')
        }
      }
      result[idValue] = nestedObject
    }
  }

  return result
}

/**
 * Main parser function that detects file type and parses accordingly
 */
export async function parseFile(file: File): Promise<ConfigurationData> {
  const fileName = file.name
  const format = getFileFormat(fileName)

  if (!format) {
    throw new Error(FILE_ERROR_MESSAGES.INVALID_TYPE)
  }

  try {
    switch (format) {
      case 'json': {
        const text = await file.text()
        return parseJsonString(text)
      }
      case 'yaml': {
        const text = await file.text()
        const yamlData = parseYamlString(text)
        return Object.fromEntries(
          Object.entries(yamlData).map(([key, value]) => [
            key,
            typeof value === 'object' ? value : { value: String(value) },
          ])
        )
      }
      case 'excel':
        return await parseExcelFile(file)
      default:
        throw new Error(FILE_ERROR_MESSAGES.PARSE_ERROR)
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes(FILE_ERROR_MESSAGES.INVALID_JSON)) {
      throw error
    }
    throw new Error(FILE_ERROR_MESSAGES.PARSE_ERROR)
  }
}
