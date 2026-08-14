import './ScanResult.css'

function ScanResult({ result }) {
  const isMalware = result.prediction === 'Malware'

  return (
    <div className="scan-result panel">
      <div className="result-header">
        <h2>Scan Result</h2>
        <span className={`badge ${isMalware ? 'badge-critical' : 'badge-low'}`}>
          {result.prediction}
        </span>
      </div>

      <div className="result-score">
        <div className="score-label">Threat Score</div>
        <div className={`score-value mono ${isMalware ? 'score-high' : 'score-low'}`}>
          {result.threatScore}<span className="score-max">/100</span>
        </div>
      </div>

      <div className="result-grid">
        <div className="result-field">
          <span className="field-label">File Name</span>
          <span className="field-value mono">{result.fileName}</span>
        </div>
        <div className="result-field">
          <span className="field-label">File Type</span>
          <span className="field-value mono">{result.fileType}</span>
        </div>
        <div className="result-field">
          <span className="field-label">File Size</span>
          <span className="field-value mono">{result.fileSize}</span>
        </div>
        <div className="result-field">
          <span className="field-label">Confidence</span>
          <span className="field-value mono">{result.confidence}%</span>
        </div>
        <div className="result-field">
          <span className="field-label">Entropy</span>
          <span className="field-value mono">{result.entropy}</span>
        </div>
        <div className="result-field">
          <span className="field-label">Analysis Time</span>
          <span className="field-value mono">{result.analysisTime}</span>
        </div>
        <div className="result-field span-2">
          <span className="field-label">SHA-256</span>
          <span className="field-value mono hash">{result.sha256}</span>
        </div>
      </div>
    </div>
  )
}

export default ScanResult