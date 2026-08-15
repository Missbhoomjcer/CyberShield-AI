import { useState } from 'react'
import FileDropzone from '../components/scan/FileDropzone.jsx'
import ScanResult from '../components/scan/ScanResult.jsx'
import './ScanFile.css'

function ScanFile() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

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
      setError('Please select a file first.')
      return
    }

    setScanning(true)
    setResult(null)
    setError(null)

    try {
      // --------------------------------------
      // CREATE FORM DATA
      // --------------------------------------

      const formData = new FormData()
      formData.append('file', selectedFile)

      // --------------------------------------
      // SEND FILE TO BACKEND
      // --------------------------------------

      const response = await fetch('http://127.0.0.1:8000/', {
        method: 'POST',
        body: formData,
      })

      // --------------------------------------
      // GET BACKEND RESPONSE
      // --------------------------------------

      const data = await response.json()

      console.log('=================================')
      console.log('FULL BACKEND RESPONSE:', data)
      console.log('PREDICTION DATA:', data.prediction)
      console.log('SHAP DATA:', data.prediction?.shap_explanation)
      console.log('=================================')

      if (!response.ok) {
        throw new Error(
          data.detail || 'File analysis failed'
        )
      }

      // --------------------------------------
      // GET PREDICTION OBJECT
      // --------------------------------------

      const predictionData =
        data.prediction || data

      // --------------------------------------
      // GET THREAT SCORE
      // --------------------------------------

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

      if (isNaN(numericScore)) {
        numericScore = 0
      }

      // Convert 0-1 probability into 0-100 score
      const scorePercent =
        numericScore <= 1
          ? numericScore * 100
          : numericScore

      // --------------------------------------
      // GET ORIGINAL PREDICTION
      // --------------------------------------

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

      // --------------------------------------
      // DETERMINE MALWARE STATUS
      // --------------------------------------

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
        // Fallback if backend prediction is unclear
        prediction =
          scorePercent >= 50
            ? 'Malware'
            : 'Benign'
      }

      // --------------------------------------
      // GET CONFIDENCE
      // --------------------------------------

      const rawConfidence =
        predictionData.confidence ??
        predictionData.confidence_score ??
        predictionData.probability ??
        data.confidence ??
        data.confidence_score ??
        scorePercent

      // --------------------------------------
      // GET SHAP EXPLANATION
      // --------------------------------------

      const shapExplanation =
        predictionData.shap_explanation ??
        predictionData.shapExplanation ??
        data.shap_explanation ??
        data.shapExplanation ??
        []

      // Make sure it is always an array
      const validShapExplanation =
        Array.isArray(shapExplanation)
          ? shapExplanation
          : []

      console.log(
        'FINAL SHAP EXPLANATION:',
        validShapExplanation
      )

      // --------------------------------------
      // CREATE RESULT OBJECT
      // --------------------------------------

      setResult({
        // File details
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

        // Security details
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

        prediction: prediction,

        // Time
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

        // IMPORTANT: SHAP DATA
        shap_explanation: validShapExplanation,
      })

    } catch (err) {
      console.error('Scan error:', err)

      setError(
        err.message || 'Something went wrong during file analysis.'
      )
    } finally {
      setScanning(false)
    }
  }

  // ==========================================
  // UI
  // ==========================================

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
            {scanning
              ? 'Scanning...'
              : 'Scan File'}
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

        {result && (
          <ScanResult result={result} />
        )}

      </div>

    </div>
  )
}

export default ScanFile