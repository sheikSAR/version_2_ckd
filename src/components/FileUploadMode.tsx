import React, { useState } from 'react'
import { parseFile, isValidFileExtension } from '../utils/fileParsers'
import { ACCEPTED_MIME_TYPES, FILE_ERROR_MESSAGES } from '../constants/files'
import { ConfigurationData } from '../types'
import '../styles/FileUploadMode.css'

interface FileUploadModeProps {
  onFileUpload: (data: ConfigurationData) => void
}

const FileUploadMode: React.FC<FileUploadModeProps> = ({ onFileUpload }) => {
  const [error, setError] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)

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
