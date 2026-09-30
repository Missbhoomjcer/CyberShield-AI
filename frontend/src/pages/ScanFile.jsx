import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'

import FileDropzone from '../components/scan/FileDropzone.jsx'
import ScanResult from '../components/scan/ScanResult.jsx'

import './ScanFile.css'


const API_URL = 'http://127.0.0.1:8000'


function ScanFile() {

  const { t } = useLanguage()

  const [selectedFile, setSelectedFile] = useState(null)

  const [scanning, setScanning] = useState(false)

  const [result, setResult] = useState(null)

  const [error, setError] = useState('')


  /* =========================================================
     FILE SELECTION
     ========================================================= */

  const handleFileSelect = (file) => {

    setSelectedFile(file)

    setResult(null)

    setError('')

  }


  /* =========================================================
     SCAN FILE
     ========================================================= */

  const handleScan = async () => {

    if (!selectedFile) {
      setError(t('chooseFile'))
      return
    }


    setScanning(true)

    setResult(null)

    setError('')


    try {

      const formData = new FormData()

      formData.append(
        'file',
        selectedFile
      )


      const response = await fetch(
        `${API_URL}/`,
        {
          method: 'POST',
          body: formData
        }
      )


      if (!response.ok) {

        throw new Error(
          `Scan failed with status ${response.status}`
        )

      }


      const data = await response.json()


      /* =====================================================
         NORMALIZE THREAT SCORE
         ===================================================== */

      let threatScore =
        Number(
          data.threat_score ??
          data.threatScore ??
          data.score ??
          0
        )


      if (threatScore <= 1) {
        threatScore *= 100
      }


      threatScore = Math.max(
        0,
        Math.min(100, threatScore)
      )


      /* =====================================================
         PREDICTION
         ===================================================== */

      const rawPrediction =
        String(
          data.prediction ??
          data.result ??
          data.label ??
          ''
        ).toLowerCase()


      const prediction =
        rawPrediction === '1' ||
        rawPrediction.includes('malware') ||
        rawPrediction.includes('ransomware') ||
        rawPrediction.includes('malicious')
          ? 'Malware'
          : 'Benign'


      /* =====================================================
         CONFIDENCE
         ===================================================== */

      let confidence =
        Number(
          data.confidence ??
          data.probability ??
          threatScore / 100
        )


      if (confidence <= 1) {
        confidence *= 100
      }


      confidence = Math.max(
        0,
        Math.min(100, confidence)
      )


      /* =====================================================
         RESULT
         ===================================================== */

      setResult({

        filename:
          data.filename ??
          selectedFile.name,

        file_type:
          data.file_type ??
          selectedFile.name
            .split('.')
            .pop()
            ?.toUpperCase(),

        file_size:
          data.file_size ??
          selectedFile.size,

        sha256:
          data.sha256 ??
          data.hash ??
          'N/A',

        entropy:
          data.entropy ??
          null,

        prediction,

        threat_score:
          threatScore,

        confidence,

        model:
          data.model ??
          'XGBoost',

        created_at:
          data.created_at ??
          new Date().toISOString(),

        shap_explanation:
          data.shap_explanation ??
          data.shap ??
          []

      })

    } catch (err) {

      console.error(
        'Scan error:',
        err
      )

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


      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="scan-header">

        <div>

          <h1>
            {t('scanYourDevice')}
          </h1>

          <p>
            {t('scanDescription')}
          </p>

        </div>

      </div>


      {/* =====================================================
          SCAN MODES
          ===================================================== */}

      <div className="scan-mode-bar">


        <button
          type="button"
          className="scan-mode active"
        >

          <span>
            ⚡
          </span>

          {t('quickScan')}

        </button>


        <button
          type="button"
          className="scan-mode disabled"
          disabled
        >

          <span>
            ◉
          </span>

          {t('fullScan')}

          <small>
            {t('soon')}
          </small>

        </button>


        <button
          type="button"
          className="scan-mode disabled"
          disabled
        >

          <span>
            ⌕
          </span>

          {t('customScan')}

          <small>
            {t('soon')}
          </small>

        </button>

      </div>


      {/* =====================================================
          MAIN SCAN GRID
          ===================================================== */}

      <div className="scan-content-grid">


        {/* ===================================================
            LEFT — FILE SCAN
            =================================================== */}

        <section className="scan-card scan-upload-card">


          <div className="scan-card-header">

            <div>

              <h2>
                {t('aiFileScan')}
              </h2>

              <p>
                {t('aiFileScanDescription')}
              </p>

            </div>


            <span className="scan-ai-badge">
              {t('aiEngine')}
            </span>

          </div>


          <FileDropzone
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
          />


          {error && (

            <div className="scan-error">
              {error}
            </div>

          )}


          <button
            type="button"
            className="scan-start-button"
            disabled={
              !selectedFile ||
              scanning
            }
            onClick={handleScan}
          >

            <span>
              ⌕
            </span>

            {scanning
              ? 'Scanning...'
              : t('startQuickScan')
            }

          </button>


          <div className="scan-supported">

            {t('supportedExeDll')}

          </div>

        </section>


        {/* ===================================================
            RIGHT — READY TO SCAN
            =================================================== */}

        {!result && (

          <div className="scan-right-column">


            <section className="scan-card scan-ready-card">


              <div className="scan-ready-icon">

                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >

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


              <h2>
                {t('readyToScan')}
              </h2>


              <p>
                {t('readyToScanDescription')}
              </p>


              <div className="scan-check-grid">

                <span>
                  ✓ {t('peFeatureAnalysis')}
                </span>

                <span>
                  ✓ {t('xgboostThreatDetection')}
                </span>

                <span>
                  ✓ {t('sha256Identification')}
                </span>

                <span>
                  ✓ {t('shapExplanation')}
                </span>

              </div>

            </section>


            {/* =================================================
                LAST SCAN
                ================================================= */}

            <section className="scan-card scan-last-card">

              <div className="scan-last-header">

                <div>

                  <h2>
                    {t('lastScan')}
                  </h2>

                  <p>
                    {t('mostRecentAnalysis')}
                  </p>

                </div>


                <span className="scan-last-check">
                  ✓
                </span>

              </div>


              <div className="scan-last-empty">

                <div className="scan-last-empty-icon">
                  ✓
                </div>

                <div>

                  <strong>
                    {t('noScanCompleted')}
                  </strong>

                  <span>
                    {t('latestScanWillAppear')}
                  </span>

                </div>

              </div>

            </section>

          </div>

        )}


        {/* ===================================================
            SCAN RESULT
            =================================================== */}

        {result && (

          <div className="scan-result-wrapper">

            <ScanResult
              result={result}
            />

          </div>

        )}

      </div>

    </div>

  )
}


export default ScanFile