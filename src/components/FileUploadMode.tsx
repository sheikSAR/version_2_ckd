import React, { useState } from 'react'
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

    if (!isValidFileExtension(file.name)) {
      setError(FILE_ERROR_MESSAGES.INVALID_TYPE)
      setUploadedFileName(null)
      return
    }

    try {
      const parsedData = await parseFile(file)

      if (Object.keys(parsedData).length === 0) {
        setError(FILE_ERROR_MESSAGES.EMPTY_SHEET)
        setUploadedFileName(null)
        return
      }

      onFileUpload(parsedData)
      setUploadedFileName(file.name)
      setError('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : FILE_ERROR_MESSAGES.PARSE_ERROR
      setError(errorMessage)
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
          accept={ACCEPTED_MIME_TYPES}
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
