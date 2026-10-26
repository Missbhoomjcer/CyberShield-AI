
import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import FileDropzone from '../components/scan/FileDropzone.jsx'
import ScanResult from '../components/scan/ScanResult.jsx'
import './ScanFile.css'

const API_URL = 'http://127.0.0.1:8000'

const SUPPORTED_EXTENSIONS = [
  '.exe',
  '.pdf',
  '.zip',
  '.xls',
  '.xlsx',
  '.doc',
  '.docx',
]

const SUPPORTED_FORMATS_TEXT =
  'Supported formats: EXE, PDF, ZIP, XLS, XLSX, DOC, DOCX'

function ScanFile() {
  const { t } = useLanguage()

  const [selectedFile, setSelectedFile] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleFileSelect = (file) => {
    setResult(null)
    setError('')

    if (!file) {
      setSelectedFile(null)
      return
    }

    const lastDot = file.name.lastIndexOf('.')
    const extension =
      lastDot >= 0
        ? file.name.slice(lastDot).toLowerCase()
        : ''

    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      setSelectedFile(null)
      setError(
        'Unsupported file type. Select an EXE, PDF, ZIP, XLS, XLSX, DOC, or DOCX file.'
      )
      return
    }

    setSelectedFile(file)
  }

  const handleScan = async () => {
    if (!selectedFile) {
      setError('Please select a supported file before scanning.')
      return
    }

    setScanning(true)
    setResult(null)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            `Scan failed with status ${response.status}.`
        )
      }

      const rawScore = Number(
        data.threat_decision?.overall_risk ??
          data.threat_score ??
          data.threatScore ??
          data.score ??
          0
      )

      const threatScore = Math.max(
        0,
        Math.min(100, rawScore <= 1 ? rawScore * 100 : rawScore)
      )

      const predictionData = data.prediction

      const rawPrediction = String(
        predictionData?.verdict ??
          predictionData?.prediction ??
          predictionData?.label ??
          predictionData ??
          data.result ??
          data.label ??
          ''
      ).toLowerCase()

      let prediction = 'Unknown'

      if (
        rawPrediction === '1' ||
        rawPrediction.includes('malware') ||
        rawPrediction.includes('ransomware') ||
        rawPrediction.includes('malicious')
      ) {
        prediction = 'Malware'
      } else if (
        rawPrediction === '0' ||
        rawPrediction.includes('benign') ||
        rawPrediction.includes('clean') ||
        rawPrediction.includes('safe')
      ) {
        prediction = 'Benign'
      }

      const rawConfidence = Number(
        predictionData?.confidence ??
          data.confidence ??
          data.probability ??
          0
      )

      const confidence = Math.max(
        0,
        Math.min(
          100,
          rawConfidence <= 1
            ? rawConfidence * 100
            : rawConfidence
        )
      )

      const extension =
        data.file_type ??
        data.extension ??
        selectedFile.name.split('.').pop() ??
        'N/A'

      setResult({
        filename: data.filename ?? selectedFile.name,
        file_type: String(extension)
          .replace(/^\./, '')
          .toUpperCase(),
        file_size:
          data.file_size ??
          data.size ??
          selectedFile.size,
        sha256: data.sha256 ?? data.hash ?? 'N/A',
        entropy: data.entropy ?? null,
        prediction,
        threat_score: threatScore,
        confidence,
        threat_level:
          data.threat_decision?.threat_level ??
          data.threat_level ??
          'UNKNOWN',
        action:
          data.threat_decision?.action ??
          data.action ??
          'UNKNOWN',
        threat_reasons:
          data.threat_decision?.reasons ??
          data.threat_reasons ??
          [],
        model:
          data.detector ??
          data.model ??
          'Security Engine',
        analysis_time:
          data.analysis_time ??
          data.created_at ??
          data.analysisTime ??
          new Date().toISOString(),
        scan_time_seconds:
          data.scan_time_seconds ?? null,
        shap_explanation:
          data.shap_explanation ??
          data.shap ??
          [],
      })
    } catch (err) {
      console.error('Scan error:', err)

      setError(
        err.message ||
          'Unable to connect to the security engine.'
      )
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="scan-page">
      {/* PAGE HEADER */}

      <header className="scan-header">
        <div>
          <h1>{t('scanYourDevice')}</h1>
          <p>{t('scanDescription')}</p>
        </div>
      </header>

      {/* QUICK SCAN ONLY */}

      <section className="scan-mode-bar single-scan-mode">
        <div className="scan-mode active">
          <span aria-hidden="true">⚡</span>
          <span>Quick Scan</span>
        </div>
      </section>

      {/* SCAN CONTENT */}

      <div className="scan-content-grid">
        <section className="scan-card scan-upload-card">
          <div className="scan-card-header">
            <div>
              <h2>{t('aiFileScan')}</h2>
              <p>{t('aiFileScanDescription')}</p>
            </div>

            <span className="scan-ai-badge">
              {t('aiEngine')}
            </span>
          </div>

          <FileDropzone
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
          />

          <p className="scan-supported">
            {SUPPORTED_FORMATS_TEXT}
          </p>

          {error && (
            <div className="scan-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="button"
            className="scan-start-button"
            disabled={!selectedFile || scanning}
            onClick={handleScan}
          >
            <span aria-hidden="true">⌕</span>
            {scanning ? 'Scanning...' : t('startQuickScan')}
          </button>
        </section>

        <div className="scan-right-column">
          {result ? (
            <section className="scan-card scan-result-wrapper">
              <ScanResult result={result} />
            </section>
          ) : (
            <>
              <section className="scan-card scan-ready-card">
                <div className="scan-ready-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle
                      cx="11"
                      cy="11"
                      r="6.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M16 16l5 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <h2>{t('readyToScan')}</h2>
                <p>{t('readyToScanDescription')}</p>

                <div className="scan-check-grid">
                  <span>✓ File format validation</span>
                  <span>✓ Security engine analysis</span>
                  <span>✓ SHA-256 identification</span>
                  <span>✓ Threat assessment</span>
                </div>

                <p className="scan-supported">
                  {SUPPORTED_FORMATS_TEXT}
                </p>
              </section>

              <section className="scan-card scan-last-card">
                <div className="scan-last-header">
                  <div>
                    <h2>{t('lastScan')}</h2>
                    <p>{t('mostRecentAnalysis')}</p>
                  </div>

                  <span className="scan-last-check">✓</span>
                </div>

                <div className="scan-last-empty">
                  <div className="scan-last-empty-icon">✓</div>

                  <div>
                    <strong>{t('noScanCompleted')}</strong>
                    <span>{t('latestScanWillAppear')}</span>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScanFile
