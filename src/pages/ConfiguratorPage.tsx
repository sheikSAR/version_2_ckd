import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import FileUploadMode from '../components/FileUploadMode'
import ManualEntryMode from '../components/ManualEntryMode'
import ConfiguratorNavbar from '../components/ConfiguratorNavbar'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useConfigurator } from '../context/ConfiguratorContext'
import '../styles/ConfiguratorPage.css'

type InputMode = 'file' | 'manual'
type OperationMode = 'run' | 'test' | 'calibrate'

const ConfiguratorPage = () => {
  const [inputMode, setInputMode] = useState<InputMode>('manual')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [jsonData, setJsonData] = useState<Record<string, Record<string, string>>>({})
  const [operationMode, setOperationMode] = useState<OperationMode>('run')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setConfigPath } = useConfigurator()

  const step1Ref = useScrollAnimation()
  const step2Ref = useScrollAnimation()
  const operationModeRef = useScrollAnimation()
  const submitRef = useScrollAnimation()

  const generateConfigPath = (): string => {
    const now = new Date()
    const date = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `configurator_${operationMode}_${date}_${month}_${year}_${hours}_${minutes}`
  }

  const handleFileUpload = useCallback((file: File) => {
    setUploadedFile(file)
  }, [])

  const handleManualEntry = useCallback((data: Record<string, Record<string, string>>) => {
    setJsonData(data)
  }, [])

  const handleSubmit = async () => {
    if (!operationMode) {
      setError('Please select an operation mode before submitting.')
      return
    }

    if (inputMode === 'file' && !uploadedFile) {
      setError('Please upload a file before submitting.')
      return
    }

    if (inputMode === 'manual' && Object.keys(jsonData).length === 0) {
      setError('Please provide input data before submitting.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const configPath = generateConfigPath()

      if (inputMode === 'file' && uploadedFile) {
        // Upload file to backend
        const formData = new FormData()
        formData.append('file', uploadedFile)
        formData.append('configPath', configPath)

        const uploadResponse = await axios.post('http://localhost:5000/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        if (uploadResponse.data.success) {
          setConfigPath(configPath)
          navigate('/configurator/landing')
        } else {
          setError(uploadResponse.data.error || 'Failed to upload file.')
        }
      } else {
        // Use existing create-session endpoint for manual entry
        const response = await axios.post('http://localhost:5000/configurator/create-session', {
          role: 'configurator',
          mode: operationMode,
          data: jsonData,
        })

        if (response.data.success) {
          setConfigPath(response.data.sessionFolder)
          navigate('/configurator/landing')
        } else {
          setError('Failed to create session.')
        }
      }
    } catch (err) {
      setError('Error submitting configuration.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ConfiguratorNavbar />
      <div className="configurator-container">
        <h1 className="configurator-title">Configurator</h1>

        <div
          ref={step1Ref.ref}
          className={`input-mode-selector ${step1Ref.isVisible ? 'animate-in' : ''}`}
        >
          <h2>Step 1: Select Input Method</h2>
          <div className="mode-buttons">
            <button
              className={`mode-button ${inputMode === 'file' ? 'active' : ''}`}
              onClick={() => setInputMode('file')}
            >
              File Upload
            </button>
            <button
              className={`mode-button ${inputMode === 'manual' ? 'active' : ''}`}
              onClick={() => setInputMode('manual')}
            >
              Manual Entry
            </button>
          </div>
        </div>

        <div
          ref={step2Ref.ref}
          className={`input-section ${step2Ref.isVisible ? 'animate-in' : ''}`}
        >
          {inputMode === 'file' && <FileUploadMode onFileUpload={handleFileUpload} />}
          {inputMode === 'manual' && <ManualEntryMode onDataChange={handleManualEntry} />}
        </div>

        <div
          ref={operationModeRef.ref}
          className={`operation-mode-selector ${operationModeRef.isVisible ? 'animate-in' : ''}`}
        >
          <h2>Step 2: Select Operation Mode</h2>
          <div className="mode-options">
            <label className="radio-label">
              <input
                type="radio"
                name="operation-mode"
                value="run"
                checked={operationMode === 'run'}
                onChange={(e) => setOperationMode(e.target.value as OperationMode)}
              />
              Run
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="operation-mode"
                value="test"
                checked={operationMode === 'test'}
                onChange={(e) => setOperationMode(e.target.value as OperationMode)}
              />
              Test
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="operation-mode"
                value="calibrate"
                checked={operationMode === 'calibrate'}
                onChange={(e) => setOperationMode(e.target.value as OperationMode)}
              />
              Calibrate
            </label>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div
          ref={submitRef.ref}
          className={`submit-button-wrapper ${submitRef.isVisible ? 'animate-in' : ''}`}
        >
          <button onClick={handleSubmit} disabled={loading || !operationMode} className="submit-button">
            {loading ? 'Submitting...' : 'Continue'}
          </button>
        </div>
      </div>
    </>
  )
}

export default ConfiguratorPage
