import React, { useState } from 'react'
import * as XLSX from 'xlsx'
import '../styles/FileUploadMode.css'

interface FileUploadModeProps {
  onFileUpload: (data: Record<string, Record<string, string>>) => void
}

const FileUploadMode: React.FC<FileUploadModeProps> = ({ onFileUpload }) => {
  const [error, setError] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)

  const parseYaml = (yamlText: string): Record<string, Record<string, string>> => {
    const result: Record<string, Record<string, string>> = {}
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

  const parseExcel = async (file: File): Promise<Record<string, Record<string, string>>> => {
    const result: Record<string, Record<string, string>> = {}

    try {
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
    } catch (err) {
      console.error(err)
      return {}
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')

    const fileName = file.name.toLowerCase()
    const isJson = fileName.endsWith('.json')
    const isYaml = fileName.endsWith('.yaml') || fileName.endsWith('.yml')
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')

    if (!isJson && !isYaml && !isExcel) {
      setError('Please upload a .json, .yaml, .yml, .xlsx, or .xls file.')
      return
    }

    try {
      let parsedData: Record<string, Record<string, string>> = {}

      if (isJson) {
        const text = await file.text()
        const parsed = JSON.parse(text)
        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
          setError('JSON file must contain an object.')
          return
        }
        parsedData = parsed
      } else if (isYaml) {
        const text = await file.text()
        const yamlData = parseYaml(text)
        parsedData = Object.fromEntries(
          Object.entries(yamlData).map(([key, value]) => [
            key,
            typeof value === 'object' ? value : { value: String(value) }
          ])
        )
      } else if (isExcel) {
        parsedData = await parseExcel(file)
        if (Object.keys(parsedData).length === 0) {
          setError('Unable to parse Excel file. Make sure it contains data in the first two columns.')
          return
        }
      }

      onFileUpload(parsedData)
      setUploadedFileName(file.name)
      setError('')
    } catch (err) {
      setError('Error parsing file. Please check the file format.')
      setUploadedFileName(null)
      console.error(err)
    }
  }

  return (
    <div className="file-upload-section">
      <h3>Upload Configuration File</h3>
      <label className="file-input-label">
        <input
          type="file"
          accept=".json,.yaml,.yml,.xlsx,.xls"
          onChange={handleFileChange}
          className="file-input"
        />
        <span className="file-input-display">Click to upload or drag and drop</span>
      </label>
      {uploadedFileName && (
        <div className="uploaded-file-info">
          <span className="uploaded-file-icon">✓</span>
          <span className="uploaded-file-name">{uploadedFileName}</span>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      <p className="file-hint">Supported formats: JSON, YAML, Excel (.xlsx, .xls)</p>
    </div>
  )
}

export default FileUploadMode
