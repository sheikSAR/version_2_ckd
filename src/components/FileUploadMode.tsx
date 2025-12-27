import React, { useState } from 'react'
import '../styles/FileUploadMode.css'

interface FileUploadModeProps {
  onFileUpload: (file: File) => void
}

const FileUploadMode: React.FC<FileUploadModeProps> = ({ onFileUpload }) => {
  const [error, setError] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setUploadedFileName(null)

    const fileName = file.name.toLowerCase()
    const isJson = fileName.endsWith('.json')
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')

    if (!isJson && !isExcel) {
      setError('Please upload a .json, .xlsx, or .xls file.')
      return
    }

    setUploadedFileName(file.name)
    onFileUpload(file)
  }

  return (
    <div className="file-upload-section">
      <h3>Upload Configuration File</h3>
      <label className="file-input-label">
        <input
          type="file"
          accept=".json,.xlsx,.xls"
          onChange={handleFileChange}
          className="file-input"
        />
        <span className="file-input-display">
          {uploadedFileName ? `Selected: ${uploadedFileName}` : 'Click to upload or drag and drop'}
        </span>
      </label>
      {uploadedFileName && <div className="success-message">✓ File successfully uploaded</div>}
      {error && <div className="error-message">{error}</div>}
      <p className="file-hint">Supported formats: JSON, Excel (.xlsx, .xls)</p>
    </div>
  )
}

export default FileUploadMode
