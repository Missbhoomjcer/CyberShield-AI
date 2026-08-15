import './ScanResult.css'

function ScanResult({ result }) {
  // Safety check
  if (!result) {
    return null
  }

  // ==============================
  // PREDICTION / MALWARE STATUS
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
  // SHAP EXPLAINABILITY
  // ==============================

  const shapExplanation = Array.isArray(result.shap_explanation)
    ? result.shap_explanation
    : []

  console.log('FULL RESULT:', result)
  console.log('SHAP EXPLANATION:', shapExplanation)

  return (
    <>
      {/* ==============================
          SCAN RESULT
      ============================== */}

      <div className="scan-result panel">
        <div className="result-header">
          <h2>Scan Result</h2>

          <span
            className={`badge ${
              isMalware ? 'badge-critical' : 'badge-low'
            }`}
          >
            {isMalware
              ? 'Malware Detected'
              : 'No Malware Detected'}
          </span>
        </div>

        <div className="result-score">
          <div className="score-label">
            Threat Score
          </div>

          <div
            className={`score-value mono ${
              isMalware ? 'score-high' : 'score-low'
            }`}
          >
            {displayThreatScore}
            <span className="score-max">/100</span>
          </div>
        </div>

        <div className="result-grid">
          <div className="result-field">
            <span className="field-label">
              File Name
            </span>
            <span className="field-value mono">
              {fileName}
            </span>
          </div>

          <div className="result-field">
            <span className="field-label">
              File Type
            </span>
            <span className="field-value mono">
              {fileType}
            </span>
          </div>

          <div className="result-field">
            <span className="field-label">
              File Size
            </span>
            <span className="field-value mono">
              {fileSize}
            </span>
          </div>

          <div className="result-field">
            <span className="field-label">
              Confidence
            </span>
            <span className="field-value mono">
              {displayConfidence}
            </span>
          </div>

          <div className="result-field">
            <span className="field-label">
              Entropy
            </span>
            <span className="field-value mono">
              {entropy}
            </span>
          </div>

          <div className="result-field">
            <span className="field-label">
              Model
            </span>
            <span className="field-value mono">
              {model}
            </span>
          </div>

          <div className="result-field">
            <span className="field-label">
              Analysis Time
            </span>
            <span className="field-value mono">
              {analysisTime}
            </span>
          </div>

          <div className="result-field span-2">
            <span className="field-label">
              SHA-256
            </span>
            <span className="field-value mono hash">
              {sha256}
            </span>
          </div>
        </div>
      </div>

      {/* ==============================
          SHAP EXPLAINABILITY
      ============================== */}

      {shapExplanation.length > 0 && (
        <div className="shap-section panel">
          <div className="shap-header">
            <div>
              <h3>AI Explainability</h3>

              <p>
                Top features that influenced the AI prediction
              </p>
            </div>

            <span className="shap-badge">
              SHAP Analysis
            </span>
          </div>

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
                    <td>{index + 1}</td>

                    <td className="mono shap-feature">
                      {item.feature ?? 'N/A'}
                    </td>

                    <td className="mono">
                      {Number(
                        item.shap_value ?? 0
                      ).toFixed(6)}
                    </td>

                    <td className="mono shap-impact">
                      {Number(
                        item.absolute_impact ?? 0
                      ).toFixed(6)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Temporary debugging message */}
      {shapExplanation.length === 0 && (
        <div className="shap-section panel">
          <h3>AI Explainability</h3>
          <p>No SHAP explanation data received from backend.</p>
        </div>
      )}
    </>
  )
}

export default ScanResult