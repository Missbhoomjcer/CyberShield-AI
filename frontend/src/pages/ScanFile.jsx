import { useState } from 'react'
import FileDropzone from '../components/scan/FileDropzone.jsx'
import ScanResult from '../components/scan/ScanResult.jsx'
import './ScanFile.css'

function ScanFile() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [scanMode, setScanMode] = useState('quick')

  // ==========================================
  // FILE SELECT
  // ==========================================

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setResult(null)
    setError(null)
  }

  // ==========================================
  // SCAN FILE
  // ==========================================

  const handleScan = async () => {
    if (!selectedFile) {
      setError('Please select an EXE or DLL file first.')
      return
    }

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

      console.log('=================================')
      console.log('FULL BACKEND RESPONSE:', data)
      console.log('PREDICTION DATA:', data.prediction)
      console.log(
        'SHAP DATA:',
        data.prediction?.shap_explanation
      )
      console.log('=================================')

      if (!response.ok) {
        throw new Error(
          data.detail || 'File analysis failed'
        )
      }

      const predictionData =
        data.prediction || data

      // ==========================================
      // THREAT SCORE
      // ==========================================

      const rawThreatScore =
        predictionData.threat_score ??
        predictionData.threatScore ??
        predictionData.score ??
        predictionData.probability ??
        predictionData.confidence ??
        data.threat_score ??
        data.threatScore ??
        data.score ??
        data.confidence ??
        0

      let numericScore = Number(rawThreatScore)

      if (Number.isNaN(numericScore)) {
        numericScore = 0
      }

      const scorePercent =
        numericScore <= 1
          ? numericScore * 100
          : numericScore

      // ==========================================
      // PREDICTION
      // ==========================================

      const backendPrediction =
        predictionData.prediction ??
        predictionData.label ??
        predictionData.classification ??
        data.prediction ??
        ''

      const predictionText =
        String(backendPrediction)
          .toLowerCase()
          .trim()

      const malwareValues = [
        '1',
        'malware',
        'malware detected',
        'malicious',
        'ransomware',
        'ransomware detected',
        'attack',
        'infected',
        'true',
      ]

      let prediction

      if (malwareValues.includes(predictionText)) {
        prediction = 'Malware'
      } else if (
        predictionText === '0' ||
        predictionText === 'benign' ||
        predictionText === 'normal' ||
        predictionText === 'safe' ||
        predictionText === 'false'
      ) {
        prediction = 'Benign'
      } else {
        prediction =
          scorePercent >= 50
            ? 'Malware'
            : 'Benign'
      }

      // ==========================================
      // CONFIDENCE
      // ==========================================

      const rawConfidence =
        predictionData.confidence ??
        predictionData.confidence_score ??
        predictionData.probability ??
        data.confidence ??
        data.confidence_score ??
        scorePercent

      // ==========================================
      // SHAP
      // ==========================================

      const shapExplanation =
        predictionData.shap_explanation ??
        predictionData.shapExplanation ??
        data.shap_explanation ??
        data.shapExplanation ??
        []

      const validShapExplanation =
        Array.isArray(shapExplanation)
          ? shapExplanation
          : []

      // ==========================================
      // RESULT
      // ==========================================

      setResult({
        filename:
          predictionData.filename ??
          predictionData.fileName ??
          predictionData.file_name ??
          data.filename ??
          selectedFile.name,

        file_type:
          predictionData.file_type ??
          predictionData.fileType ??
          predictionData.extension ??
          data.file_type ??
          data.fileType ??
          data.extension ??
          selectedFile.name.split('.').pop() ??
          'N/A',

        file_size:
          predictionData.file_size ??
          predictionData.fileSize ??
          predictionData.size ??
          data.file_size ??
          data.fileSize ??
          data.size ??
          selectedFile.size,

        sha256:
          predictionData.sha256 ??
          predictionData.hash ??
          data.sha256 ??
          data.hash ??
          'N/A',

        entropy:
          predictionData.entropy ??
          data.entropy ??
          'N/A',

        threat_score: scorePercent,

        confidence: rawConfidence,

        model:
          predictionData.model ??
          predictionData.model_name ??
          data.model ??
          data.model_name ??
          'XGBoost',

        prediction,

        created_at:
          predictionData.created_at ??
          predictionData.analysis_time ??
          predictionData.analysisTime ??
          predictionData.timestamp ??
          data.created_at ??
          data.analysis_time ??
          data.analysisTime ??
          data.timestamp ??
          new Date().toISOString(),

        shap_explanation: validShapExplanation,
      })
    } catch (err) {
      console.error('Scan error:', err)

      setError(
        err.message ||
        'Something went wrong during file analysis.'
      )
    } finally {
      setScanning(false)
    }
  }

  // ==========================================
  // FORMAT FILE SIZE
  // ==========================================

  const formatFileSize = (bytes) => {
    if (!bytes) return '—'

    if (bytes < 1024) {
      return `${bytes} B`
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="scan-file">

      {/* HEADER */}
      <div className="scan-header">
        <div>
          <h1>Scan Your Device</h1>

          <p className="page-subtitle">
            Check for ransomware, malware and other threats
            using our AI-powered security engine.
          </p>
        </div>
      </div>

      {/* SCAN MODES */}
      <div className="scan-mode-card">

        <div className="scan-mode-tabs">

          <button
            className={`scan-mode-tab ${
              scanMode === 'quick' ? 'active' : ''
            }`}
            onClick={() => setScanMode('quick')}
          >
            <span className="mode-icon">⚡</span>
            Quick Scan
          </button>

          <button
            className="scan-mode-tab disabled"
            disabled
            title="Full Scan will be connected when the backend API is available."
          >
            <span className="mode-icon">◉</span>
            Full Scan
            <span className="coming-soon">Soon</span>
          </button>

          <button
            className="scan-mode-tab disabled"
            disabled
            title="Custom Scan will be connected when the backend API is available."
          >
            <span className="mode-icon">⌕</span>
            Custom Scan
            <span className="coming-soon">Soon</span>
          </button>

        </div>

      </div>

      <div className="scan-content">

        {/* LEFT SCAN PANEL */}
        <div className="scan-panel">

          <div className="scan-panel-header">
            <div>
              <h2>AI File Scan</h2>

              <p>
                Upload an EXE or DLL file for security analysis.
              </p>
            </div>

            <span className="scan-status">
              AI ENGINE
            </span>
          </div>

          <FileDropzone
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
          />

          {selectedFile && (
            <div className="selected-file-card">

              <div className="selected-file-icon">
                EXE
              </div>

              <div className="selected-file-info">
                <strong>{selectedFile.name}</strong>

                <span>
                  {formatFileSize(selectedFile.size)}
                </span>
              </div>

              <button
                className="remove-file"
                onClick={() => {
                  setSelectedFile(null)
                  setResult(null)
                  setError(null)
                }}
                disabled={scanning}
                title="Remove file"
              >
                ×
              </button>

            </div>
          )}

          <button
            className="btn-scan"
            disabled={!selectedFile || scanning}
            onClick={handleScan}
          >
            <span className="scan-button-icon">
              {scanning ? '◌' : '⌕'}
            </span>

            {scanning
              ? 'Analyzing File...'
              : 'Start Quick Scan'}
          </button>

          {scanning && (
            <div className="scanning-state">

              <div className="scanning-heading">
                <span className="scanning-dot" />

                <strong>
                  Security analysis in progress
                </strong>
              </div>

              <p>
                Extracting PE features and running the
                AI detection model...
              </p>

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

              <span className="error-icon">!</span>

              <div>
                <strong>Scan failed</strong>

                <p>{error}</p>
              </div>

            </div>
          )}

          <div className="supported-files">
            <span>Supported:</span>
            <strong>.EXE</strong>
            <strong>.DLL</strong>
            <span>• AI-powered static analysis</span>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="scan-right-column">

          {result ? (
            <div className="scan-result-container">
              <ScanResult result={result} />
            </div>
          ) : (
            <div className="scan-preview-card">

              <div className="large-scan-icon">
                <div className="scan-circle">
                  <span>⌕</span>
                </div>
              </div>

              <h2>
                Ready to Scan
              </h2>

              <p>
                Select a file to begin an AI-powered security
                analysis of its executable structure.
              </p>

              <div className="analysis-points">

                <div>
                  <span>✓</span>
                  PE feature analysis
                </div>

                <div>
                  <span>✓</span>
                  XGBoost threat detection
                </div>

                <div>
                  <span>✓</span>
                  SHA-256 identification
                </div>

                <div>
                  <span>✓</span>
                  SHAP-based explanation
                </div>

              </div>

            </div>
          )}

          {/* LAST SCAN */}
          <div className="last-scan-card">

            <div className="last-scan-header">
              <div>
                <h3>Last Scan</h3>

                <p>
                  Most recent file analysis
                </p>
              </div>

              <span className="last-scan-icon">
                ✓
              </span>
            </div>

            {result ? (
              <div className="last-scan-result">

                <div className="last-file-icon">
                  ✓
                </div>

                <div className="last-file-info">
                  <strong>{result.filename}</strong>

                  <span>
                    {result.prediction === 'Malware'
                      ? 'Threat detected'
                      : 'No threats found'}
                  </span>
                </div>

                <span
                  className={`last-scan-badge ${
                    result.prediction === 'Malware'
                      ? 'danger'
                      : 'safe'
                  }`}
                >
                  {result.prediction}
                </span>

              </div>
            ) : (
              <div className="no-last-scan">
                <span>✓</span>

                <div>
                  <strong>No scan completed yet</strong>

                  <p>
                    Your latest scan will appear here.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  )
}

export default ScanFile