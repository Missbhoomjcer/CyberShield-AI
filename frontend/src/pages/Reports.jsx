import { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import SeverityBadge from '../components/threats/SeverityBadge.jsx'
import './Reports.css'

const API_URL = 'http://127.0.0.1:8000'

function formatPrediction(prediction) {
  const value = String(prediction ?? '').toLowerCase().trim()

  return (
    value === '1' ||
    value === 'malware' ||
    value === 'malicious' ||
    value === 'true'
  )
    ? 'Malware'
    : 'Benign'
}

function getThreatLevel(threatScore) {
  const score = Number(threatScore || 0)

  if (score >= 80) return 'Critical'
  if (score >= 60) return 'High'
  if (score >= 30) return 'Medium'
  return 'Low'
}

function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(null)

  // ==========================================
  // FETCH SCAN HISTORY
  // ==========================================

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_URL}/history/`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            `Failed to fetch reports (${response.status})`
          )
        }

        const formattedReports = (data.scans || []).map((scan) => {
          const threatScore = Number(
            scan.threat_score || 0
          )

          return {
            id: scan.id,

            date: scan.created_at
              ? new Date(
                  scan.created_at
                ).toLocaleString()
              : 'N/A',

            fileName:
              scan.filename || 'N/A',

            fileType:
              scan.file_type || 'N/A',

            prediction:
              formatPrediction(
                scan.prediction
              ),

            threatScore:
              threatScore.toFixed(2),

            confidence:
              scan.confidence !== undefined &&
              scan.confidence !== null
                ? `${(
                    Number(
                      scan.confidence
                    ) * 100
                  ).toFixed(2)}%`
                : 'N/A',

            threatLevel:
              getThreatLevel(
                threatScore
              ),
          }
        })

        setReports(
          formattedReports
        )
      } catch (err) {
        console.error(
          'Reports API error:',
          err
        )

        setError(
          err.message ||
            'Unable to load scan history.'
        )

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
        `${API_URL}/history/${report.id}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
            `Failed to load scan ${report.id}`
        )
      }

      setSelectedReport(data)
    } catch (err) {
      console.error(
        'Report details error:',
        err
      )

      setError(
        err.message ||
          'Unable to load report details.'
      )
    } finally {
      setViewLoading(false)
    }
  }

  // ==========================================
  // PDF DOWNLOAD
  // ==========================================

  const handleDownload = async (report) => {
    try {
      setDownloadLoading(report.id)
      setError('')

      // Get the most complete scan data
      const response = await fetch(
        `${API_URL}/history/${report.id}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
            `Failed to load scan ${report.id}`
        )
      }

      const prediction =
        formatPrediction(
          data.prediction
        )

      const threatScore =
        Number(
          data.threat_score || 0
        )

      const confidence =
        data.confidence !== undefined &&
        data.confidence !== null
          ? `${(
              Number(
                data.confidence
              ) * 100
            ).toFixed(2)}%`
          : 'N/A'

      const threatLevel =
        getThreatLevel(
          threatScore
        )

      const analysisDate =
        data.created_at
          ? new Date(
              data.created_at
            ).toLocaleString()
          : 'N/A'

      // Create PDF
      const doc = new jsPDF()

      // Header
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text(
        'CyberShield AI',
        20,
        20
      )

      doc.setFontSize(14)
      doc.setFont('helvetica', 'normal')
      doc.text(
        'Security Scan Report',
        20,
        30
      )

      // Divider
      doc.setLineWidth(0.5)
      doc.line(
        20,
        35,
        190,
        35
      )

      // Report information
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(
        `Scan ID: ${data.id ?? report.id}`,
        20,
        48
      )

      doc.setFont('helvetica', 'normal')

      let y = 60

      const addField = (
        label,
        value
      ) => {
        doc.setFont(
          'helvetica',
          'bold'
        )
        doc.text(
          `${label}:`,
          20,
          y
        )

        doc.setFont(
          'helvetica',
          'normal'
        )

        const wrapped = doc.splitTextToSize(
          String(
            value ?? 'N/A'
          ),
          125
        )

        doc.text(
          wrapped,
          65,
          y
        )

        y +=
          Math.max(
            8,
            wrapped.length * 6
          )
      }

      addField(
        'File Name',
        data.filename
      )

      addField(
        'File Type',
        data.file_type
      )

      addField(
        'File Size',
        data.file_size
      )

      addField(
        'Prediction',
        prediction
      )

      addField(
        'Threat Level',
        threatLevel
      )

      addField(
        'Threat Score',
        `${threatScore.toFixed(2)} / 100`
      )

      addField(
        'Confidence',
        confidence
      )

      addField(
        'Entropy',
        data.entropy !== undefined
          ? Number(
              data.entropy
            ).toFixed(6)
          : 'N/A'
      )

      addField(
        'Model',
        data.model
      )

      addField(
        'SHA-256',
        data.sha256
      )

      addField(
        'Created At',
        analysisDate
      )

      // Result section
      y += 8

      doc.setFont(
        'helvetica',
        'bold'
      )
      doc.setFontSize(13)
      doc.text(
        'Analysis Summary',
        20,
        y
      )

      y += 10

      doc.setFont(
        'helvetica',
        'normal'
      )
      doc.setFontSize(10)

      const summary =
        prediction === 'Malware'
          ? `The analyzed file was classified as malicious with a threat score of ${threatScore.toFixed(
              2
            )}/100.`
          : `The analyzed file was classified as benign with a threat score of ${threatScore.toFixed(
              2
            )}/100.`

      const summaryLines =
        doc.splitTextToSize(
          summary,
          170
        )

      doc.text(
        summaryLines,
        20,
        y
      )

      y +=
        summaryLines.length * 6 +
        8

      // Footer
      doc.setFontSize(9)
      doc.setTextColor(
        100,
        100,
        100
      )

      doc.text(
        'Generated by CyberShield AI',
        20,
        285
      )

      doc.text(
        new Date().toLocaleString(),
        190,
        285,
        {
          align: 'right',
        }
      )

      // Download
      const safeFilename =
        String(
          data.filename ||
            `scan-${report.id}`
        )
          .replace(
            /[^a-zA-Z0-9._-]/g,
            '_'
          )

      doc.save(
        `CyberShield_Report_${safeFilename}.pdf`
      )
    } catch (err) {
      console.error(
        'PDF generation error:',
        err
      )

      setError(
        err.message ||
          'Unable to generate PDF report.'
      )
    } finally {
      setDownloadLoading(null)
    }
  }

  return (
    <div className="reports">

      <h1>Reports</h1>

      <p className="page-subtitle">
        Generated scan reports and threat analysis summaries
      </p>

      {/* ERROR */}

      {error && (
        <div className="scan-error">
          {error}
        </div>
      )}

      {/* REPORT TABLE */}

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
                        report.prediction ===
                        'Malware'
                          ? 'badge-critical'
                          : 'badge-low'
                      }`}
                    >
                      {report.prediction}
                    </span>
                  </td>

                  <td>
                    <SeverityBadge
                      level={
                        report.threatLevel
                      }
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
                          handleDownload(
                            report
                          )
                        }
                        disabled={
                          downloadLoading ===
                          report.id
                        }
                      >
                        {downloadLoading ===
                        report.id
                          ? 'Generating...'
                          : 'Download'}
                      </button>

                    </div>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        )}

      </div>

      {/* REPORT DETAILS LOADING */}

      {viewLoading && (
        <div className="panel">
          <p>
            Loading report details...
          </p>
        </div>
      )}

      {/* REPORT DETAILS */}

      {selectedReport &&
        !viewLoading && (
          <div className="panel report-details">

            <div className="result-header">

              <h2>
                Scan Report #
                {selectedReport.id}
              </h2>

              <button
                className="btn-link"
                onClick={() =>
                  setSelectedReport(
                    null
                  )
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
                  {selectedReport.filename ||
                    'N/A'}
                </span>
              </div>

              <div className="result-field">
                <span className="field-label">
                  File Type
                </span>

                <span className="field-value mono">
                  {selectedReport.file_type ||
                    'N/A'}
                </span>
              </div>

              <div className="result-field">
                <span className="field-label">
                  File Size
                </span>

                <span className="field-value mono">
                  {selectedReport.file_size ??
                    'N/A'}
                </span>
              </div>

              <div className="result-field">
                <span className="field-label">
                  Prediction
                </span>

                <span className="field-value mono">
                  {formatPrediction(
                    selectedReport.prediction
                  )}
                </span>
              </div>

              <div className="result-field">
                <span className="field-label">
                  Threat Score
                </span>

                <span className="field-value mono">
                  {selectedReport.threat_score ??
                    'N/A'}
                </span>
              </div>

              <div className="result-field">
                <span className="field-label">
                  Confidence
                </span>

                <span className="field-value mono">
                  {selectedReport.confidence !==
                  undefined
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
                  {selectedReport.entropy ??
                    'N/A'}
                </span>
              </div>

              <div className="result-field">
                <span className="field-label">
                  Model
                </span>

                <span className="field-value mono">
                  {selectedReport.model ??
                    'N/A'}
                </span>
              </div>

              <div className="result-field span-2">
                <span className="field-label">
                  SHA-256
                </span>

                <span className="field-value mono hash">
                  {selectedReport.sha256 ??
                    'N/A'}
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