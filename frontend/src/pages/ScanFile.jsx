import { useState } from 'react'
import FileDropzone from '../components/scan/FileDropzone.jsx'
import ScanResult from '../components/scan/ScanResult.jsx'
import { getScanResult } from '../data/dummyData.js'
import './ScanFile.css'

function ScanFile() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setResult(null)
  }

  const handleScan = () => {
    if (!selectedFile) return
    setScanning(true)
    setResult(null)

    // Simulated scan delay — replace with a real FastAPI call later
    setTimeout(() => {
      setResult(getScanResult(selectedFile))
      setScanning(false)
    }, 1800)
  }

  return (
    <div className="scan-file">
      <h1>Scan File</h1>
      <p className="page-subtitle">Upload an EXE or DLL file for AI-powered threat analysis</p>

      <div className="scan-layout">
        <div className="panel scan-panel">
          <FileDropzone selectedFile={selectedFile} onFileSelect={handleFileSelect} />
          <button
            className="btn-scan"
            disabled={!selectedFile || scanning}
            onClick={handleScan}
          >
            {scanning ? 'Scanning...' : 'Scan File'}
          </button>

          {scanning && (
            <div className="scanning-state">
              <div className="scan-bar"><div className="scan-bar-fill" /></div>
              <span className="mono">Analyzing PE structure and extracting features...</span>
            </div>
          )}
        </div>

        {result && <ScanResult result={result} />}
      </div>
    </div>
  )
}

export default ScanFile