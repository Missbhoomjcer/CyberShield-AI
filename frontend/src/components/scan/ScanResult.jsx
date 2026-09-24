import './ScanResult.css'

function ScanResult({ result }) {
  if (!result) {
    return null
  }

  // ==============================
  // PREDICTION
  // ==============================

  const prediction = result.prediction
  const predictionText = String(prediction ?? '').toLowerCase().trim()

  const malwarePredictions = [
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

  let isMalware = malwarePredictions.includes(predictionText)

  // ==============================
  // THREAT SCORE
  // ==============================

  const rawThreatScore =
    result.threat_score ??
    result.threatScore ??
    result.score ??
    result.probability ??
    null

  const threatScoreNumber = Number(rawThreatScore)

  if (
    !malwarePredictions.includes(predictionText) &&
    predictionText !== '0' &&
    predictionText !== 'normal' &&
    predictionText !== 'benign' &&
    predictionText !== 'safe' &&
    predictionText !== 'false'
  ) {
    if (!isNaN(threatScoreNumber)) {
      const normalizedScore =
        threatScoreNumber <= 1
          ? threatScoreNumber * 100
          : threatScoreNumber

      isMalware = normalizedScore >= 50
    }
  }

  let displayThreatScore = 'N/A'

  if (
    rawThreatScore !== null &&
    rawThreatScore !== undefined &&
    rawThreatScore !== ''
  ) {
    const scoreNumber = Number(rawThreatScore)

    if (!isNaN(scoreNumber)) {
      displayThreatScore =
        scoreNumber <= 1
          ? (scoreNumber * 100).toFixed(2)
          : scoreNumber.toFixed(2)
    }
  }

  // ==============================
  // CONFIDENCE
  // ==============================

  const rawConfidence =
    result.confidence ??
    result.confidence_score ??
    result.probability ??
    null

  let displayConfidence = 'N/A'

  if (
    rawConfidence !== null &&
    rawConfidence !== undefined &&
    rawConfidence !== ''
  ) {
    const confidenceNumber = Number(rawConfidence)

    if (!isNaN(confidenceNumber)) {
      displayConfidence =
        confidenceNumber <= 1
          ? `${(confidenceNumber * 100).toFixed(2)}%`
          : `${confidenceNumber.toFixed(2)}%`
    }
  }

  // ==============================
  // FILE DETAILS
  // ==============================

  const fileName =
    result.filename ??
    result.fileName ??
    result.file_name ??
    'N/A'

  const fileType =
    result.file_type ??
    result.fileType ??
    result.extension ??
    'N/A'

  const fileSize =
    result.file_size ??
    result.fileSize ??
    result.size ??
    'N/A'

  const entropy =
    result.entropy !== null &&
    result.entropy !== undefined
      ? Number(result.entropy).toFixed(6)
      : 'N/A'

  const model =
    result.model ??
    result.model_name ??
    'N/A'

  const sha256 =
    result.sha256 ??
    result.hash ??
    'N/A'

  // ==============================
  // ANALYSIS TIME
  // ==============================

  const rawDate =
    result.created_at ??
    result.analysis_time ??
    result.analysisTime ??
    result.timestamp ??
    null

  let analysisTime = 'N/A'

  if (rawDate) {
    const date = new Date(rawDate)

    if (!isNaN(date.getTime())) {
      analysisTime = date.toLocaleString()
    } else if (typeof rawDate === 'string') {
      analysisTime = rawDate
    }
  }

  // ==============================
  // SHAP
  // ==============================

  const shapExplanation = Array.isArray(result.shap_explanation)
    ? result.shap_explanation
    : []

  return (
    <div className="scan-result-container">

      {/* =================================
          RESULT SUMMARY
      ================================= */}

      <div className="scan-result-card">

        <div className="result-top">

          <div className="result-title-area">

            <div
              className={`result-status-icon ${
                isMalware ? 'danger' : 'safe'
              }`}
            >
              {isMalware ? (
                <svg viewBox="0 0 24 24">
                  <path
                    d="M12 4l8 15H4L12 4z"
                  />
                  <path d="M12 9v4" />
                  <circle cx="12" cy="16" r="0.8" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24">
                  <path d="M5 12l4 4 10-10" />
                </svg>
              )}
            </div>

            <div>
              <span className="result-label">
                SCAN COMPLETE
              </span>

              <h2>Scan Result</h2>

              <p className="result-file-name">
                {fileName}
              </p>
            </div>

          </div>

          <span
            className={`result-badge ${
              isMalware ? 'danger-badge' : 'safe-badge'
            }`}
          >
            {isMalware
              ? 'Malware Detected'
              : 'No Malware Detected'}
          </span>

        </div>

        {/* Score */}

        <div className="threat-score-section">

          <div className="score-circle-large">

            <div className="score-inner">
              <strong>{displayThreatScore}</strong>
              <span>/100</span>
            </div>

          </div>

          <div className="score-description">

            <span>THREAT SCORE</span>

            <h3>
              {isMalware
                ? 'Potential threat detected'
                : 'File appears safe'}
            </h3>

            <p>
              {isMalware
                ? 'The AI model identified characteristics associated with malicious software.'
                : 'The AI model did not identify significant malicious characteristics in this file.'}
            </p>

          </div>

          <div className="confidence-box">

            <span>AI CONFIDENCE</span>

            <strong>{displayConfidence}</strong>

            <small>{model}</small>

          </div>

        </div>

        {/* File details */}

        <div className="details-heading">
          <h3>File analysis</h3>
          <span>Static PE analysis</span>
        </div>

        <div className="result-details-grid">

          <div className="detail-item">
            <span>File name</span>
            <strong>{fileName}</strong>
          </div>

          <div className="detail-item">
            <span>File type</span>
            <strong>{fileType}</strong>
          </div>

          <div className="detail-item">
            <span>File size</span>
            <strong>{fileSize}</strong>
          </div>

          <div className="detail-item">
            <span>Entropy</span>
            <strong>{entropy}</strong>
          </div>

          <div className="detail-item">
            <span>Model</span>
            <strong>{model}</strong>
          </div>

          <div className="detail-item">
            <span>Analysis time</span>
            <strong>{analysisTime}</strong>
          </div>

        </div>

        {/* SHA-256 */}

        <div className="hash-section">

          <span>SHA-256 HASH</span>

          <div className="hash-value">
            {sha256}
          </div>

        </div>

      </div>

      {/* =================================
          AI EXPLAINABILITY
      ================================= */}

      <div className="shap-card">

        <div className="shap-header">

          <div className="shap-title">

            <div className="ai-icon">
              AI
            </div>

            <div>
              <span>EXPLAINABLE AI</span>

              <h3>Why did the model make this prediction?</h3>

              <p>
                SHAP shows which extracted features influenced
                the AI prediction.
              </p>
            </div>

          </div>

          <span className="shap-badge">
            SHAP Analysis
          </span>

        </div>

        {shapExplanation.length > 0 ? (

          <div className="shap-table-wrapper">

            <table className="shap-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Feature</th>
                  <th>SHAP Value</th>
                  <th>Impact</th>
                </tr>
              </thead>

              <tbody>

                {shapExplanation.map((item, index) => (

                  <tr key={`${item.feature}-${index}`}>

                    <td className="table-index">
                      {index + 1}
                    </td>

                    <td className="feature-name">
                      {item.feature ?? 'N/A'}
                    </td>

                    <td className="numeric-value">
                      {Number(
                        item.shap_value ?? 0
                      ).toFixed(6)}
                    </td>

                    <td className="numeric-value impact-value">
                      {Number(
                        item.absolute_impact ?? 0
                      ).toFixed(6)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="no-shap-data">

            <div className="no-shap-icon">
              AI
            </div>

            <div>
              <strong>
                No SHAP explanation available
              </strong>

              <p>
                The backend did not return SHAP explanation
                data for this analysis.
              </p>
            </div>

          </div>

        )}

      </div>

    </div>
  )
}

export default ScanResult