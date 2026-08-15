import { useState } from 'react'
import FileDropzone from '../components/scan/FileDropzone.jsx'
import ScanResult from '../components/scan/ScanResult.jsx'
import './ScanFile.css'

function ScanFile() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setResult(null)
    setError(null)
  }

  const handleScan = async () => {
    if (!selectedFile) return

    setScanning(true)
    setResult(null)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('http://127.0.0.1:8000/', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      console.log('Backend response:', data)

      if (!response.ok) {
        throw new Error(data.detail || 'File analysis failed')
      }

      // Get prediction data from backend
      const predictionData = data.prediction || data

      // Get threat score
      const threatScore =
        predictionData.threat_score ??
        predictionData.threatScore ??
        data.threat_score ??
        data.threatScore ??
        predictionData.confidence ??
        data.confidence ??
        0

      // Convert score safely to number
      const numericScore = Number(threatScore)

      // If score is between 0 and 1, convert to percentage
      const scorePercent =
        numericScore <= 1
          ? numericScore * 100
          : numericScore

      // Decide malware status
      const prediction =
        scorePercent >= 50
          ? 'Malware'
          : 'Benign'

      setResult({
        filename:
          predictionData.filename ||
          data.filename ||
          selectedFile.name,

        file_type:
          predictionData.file_type ||
          predictionData.fileType ||
          data.file_type ||
          data.fileType ||
          data.extension ||
          '',

        file_size:
          predictionData.file_size ||
          predictionData.fileSize ||
          data.file_size ||
          data.fileSize ||
          data.size ||
          selectedFile.size,

        sha256:
          predictionData.sha256 ||
          data.sha256 ||
          'N/A',

        entropy:
          predictionData.entropy ??
          data.entropy ??
          'N/A',

        threat_score: scorePercent,

        confidence:
          predictionData.confidence ??
          data.confidence ??
          scorePercent,

        model:
          predictionData.model ||
          predictionData.model_name ||
          data.model ||
          data.model_name ||
          'XGBoost',

        prediction: prediction,

        // Use current valid ISO date if backend doesn't send one
        created_at:
          predictionData.created_at ||
          predictionData.analysis_time ||
          data.created_at ||
          data.analysis_time ||
          new Date().toISOString(),
      })

    } catch (err) {
      console.error('Scan error:', err)
      setError(err.message)
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="scan-file">
      <h1>Scan File</h1>

      <p className="page-subtitle">
        Upload an EXE or DLL file for AI-powered threat analysis
      </p>

      <div className="scan-layout">
        <div className="panel scan-panel">

          <FileDropzone
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
          />

          <button
            className="btn-scan"
            disabled={!selectedFile || scanning}
            onClick={handleScan}
          >
            {scanning ? 'Scanning...' : 'Scan File'}
          </button>

          {scanning && (
            <div className="scanning-state">
              <div className="scan-bar">
                <div className="scan-bar-fill" />
              </div>

              <span className="mono">
                Analyzing PE structure and extracting features...
              </span>
            </div>
          )}

          {error && (
            <div className="scan-error">
              {error}
            </div>
          )}

        </div>

        {result && <ScanResult result={result} />}

      </div>
    </div>
  )
}

export default ScanFile