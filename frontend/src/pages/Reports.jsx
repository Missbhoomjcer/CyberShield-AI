import { useEffect, useState } from 'react'
import SeverityBadge from '../components/threats/SeverityBadge.jsx'
import './Reports.css'

function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)

  // ==========================================
  // FETCH SCAN HISTORY
  // ==========================================

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          'http://127.0.0.1:8000/history/'
        )

        if (!response.ok) {
          throw new Error(
            `Failed to fetch reports (${response.status})`
          )
        }

        const data = await response.json()

        const formattedReports = (data.scans || []).map((scan) => {
          const isMalware =
            scan.prediction === '1' ||
            scan.prediction === 1 ||
            String(scan.prediction).toLowerCase() === 'malware'

          const threatScore = Number(scan.threat_score || 0)

          let threatLevel = 'Low'

          if (threatScore >= 80) {
            threatLevel = 'Critical'
          } else if (threatScore >= 60) {
            threatLevel = 'High'
          } else if (threatScore >= 30) {
            threatLevel = 'Medium'
          }

          return {
            id: scan.id,
            date: scan.created_at
              ? new Date(scan.created_at).toLocaleString()
              : 'N/A',

            fileName: scan.filename || 'N/A',

            fileType: scan.file_type || 'N/A',

            prediction: isMalware
              ? 'Malware'
              : 'Benign',

            threatScore: threatScore.toFixed(2),

            confidence:
              scan.confidence !== undefined &&
              scan.confidence !== null
                ? `${(Number(scan.confidence) * 100).toFixed(2)}%`
                : 'N/A',

            threatLevel,
          }
        })

        setReports(formattedReports)
      } catch (err) {
        console.error('Reports API error:', err)
        setError(err.message || 'Unable to load scan history.')
        setReports([])
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  // ==========================================
  // VIEW PARTICULAR REPORT
  // ==========================================

  const handleView = async (report) => {
    try {
      setViewLoading(true)
      setError('')

      const response = await fetch(
        `http://127.0.0.1:8000/history/${report.id}`
      )

      if (!response.ok) {
        throw new Error(
          `Failed to load scan ${report.id}`
        )
      }

      const data = await response.json()

      setSelectedReport(data)
    } catch (err) {
      console.error('Report details error:', err)
      setError(
        err.message || 'Unable to load report details.'
      )
    } finally {
      setViewLoading(false)
    }
  }

  // ==========================================
  // DOWNLOAD
  // ==========================================

  const handleDownload = (report) => {
    alert(
      `PDF report generation for scan ${report.id} will be connected after the PDF reporting module is completed.`
    )
  }

  return (
    <div className="reports">
      <h1>Reports</h1>

      <p className="page-subtitle">
        Generated scan reports and threat analysis summaries
      </p>

      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div className="scan-error">
          {error}
        </div>
      )}

      {/* ==========================================
          REPORT TABLE
      ========================================== */}

      <div className="panel">
        {loading ? (
          <div className="empty-state">
            Loading scan reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="empty-state">
            No scan reports available.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Scan Date</th>
                <th>File Name</th>
                <th>Prediction</th>
                <th>Threat Level</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="mono">
                    SCAN-{report.id}
                  </td>

                  <td className="mono">
                    {report.date}
                  </td>

                  <td className="mono">
                    {report.fileName}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        report.prediction === 'Malware'
                          ? 'badge-critical'
                          : 'badge-low'
                      }`}
                    >
                      {report.prediction}
                    </span>
                  </td>

                  <td>
                    <SeverityBadge
                      level={report.threatLevel}
                    />
                  </td>

                  <td>
                    <div className="report-actions">
                      <button
                        className="btn-link"
                        onClick={() =>
                          handleView(report)
                        }
                      >
                        View
                      </button>

                      <button
                        className="btn-link"
                        onClick={() =>
                          handleDownload(report)
                        }
                      >
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ==========================================
          REPORT DETAILS
      ========================================== */}

      {viewLoading && (
        <div className="panel">
          <p>Loading report details...</p>
        </div>
      )}

      {selectedReport && !viewLoading && (
        <div className="panel report-details">
          <div className="result-header">
            <h2>
              Scan Report #{selectedReport.id}
            </h2>

            <button
              className="btn-link"
              onClick={() =>
                setSelectedReport(null)
              }
            >
              Close
            </button>
          </div>

          <div className="result-grid">

            <div className="result-field">
              <span className="field-label">
                File Name
              </span>

              <span className="field-value mono">
                {selectedReport.filename || 'N/A'}
              </span>
            </div>

            <div className="result-field">
              <span className="field-label">
                File Type
              </span>

              <span className="field-value mono">
                {selectedReport.file_type || 'N/A'}
              </span>
            </div>

            <div className="result-field">
              <span className="field-label">
                File Size
              </span>

              <span className="field-value mono">
                {selectedReport.file_size ?? 'N/A'}
              </span>
            </div>

            <div className="result-field">
              <span className="field-label">
                Prediction
              </span>

              <span className="field-value mono">
                {selectedReport.prediction === '1'
                  ? 'Malware'
                  : 'Benign'}
              </span>
            </div>

            <div className="result-field">
              <span className="field-label">
                Threat Score
              </span>

              <span className="field-value mono">
                {selectedReport.threat_score ?? 'N/A'}
              </span>
            </div>

            <div className="result-field">
              <span className="field-label">
                Confidence
              </span>

              <span className="field-value mono">
                {selectedReport.confidence !== undefined
                  ? `${(
                      Number(
                        selectedReport.confidence
                      ) * 100
                    ).toFixed(2)}%`
                  : 'N/A'}
              </span>
            </div>

            <div className="result-field">
              <span className="field-label">
                Entropy
              </span>

              <span className="field-value mono">
                {selectedReport.entropy ?? 'N/A'}
              </span>
            </div>

            <div className="result-field">
              <span className="field-label">
                Model
              </span>

              <span className="field-value mono">
                {selectedReport.model ?? 'N/A'}
              </span>
            </div>

            <div className="result-field span-2">
              <span className="field-label">
                SHA-256
              </span>

              <span className="field-value mono hash">
                {selectedReport.sha256 ?? 'N/A'}
              </span>
            </div>

            <div className="result-field span-2">
              <span className="field-label">
                Created At
              </span>

              <span className="field-value mono">
                {selectedReport.created_at
                  ? new Date(
                      selectedReport.created_at
                    ).toLocaleString()
                  : 'N/A'}
              </span>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default Reports