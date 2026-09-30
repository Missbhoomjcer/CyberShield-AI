import { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import { useLanguage } from '../context/LanguageContext.jsx'
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
  const { language } = useLanguage()

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(null)

  const text = {
    English: {
      title: 'Reports',

      subtitle:
        'Generated scan reports and threat analysis summaries',

      loadingReports: 'Loading scan reports...',

      noReports:
        'No scan reports available.',

      reportId: 'Report ID',
      scanDate: 'Scan Date',
      fileName: 'File Name',
      prediction: 'Prediction',
      threatLevel: 'Threat Level',
      actions: 'Actions',

      view: 'View',
      close: 'Close',

      generating: 'Generating...',
      download: 'Download',

      loadingDetails:
        'Loading report details...',

      scanReport: 'Scan Report',

      fileType: 'File Type',
      fileSize: 'File Size',
      threatScore: 'Threat Score',
      confidence: 'Confidence',
      entropy: 'Entropy',
      model: 'Model',
      sha256: 'SHA-256',
      createdAt: 'Created At',

      analysisSummary: 'Analysis Summary',

      malwareSummary:
        'The analyzed file was classified as malicious with a threat score of',

      benignSummary:
        'The analyzed file was classified as benign with a threat score of',

      unableToLoadHistory:
        'Unable to load scan history.',

      unableToLoadDetails:
        'Unable to load report details.',

      unableToGenerate:
        'Unable to generate PDF report.',

      noData: 'N/A',

      malware: 'Malware',
      benign: 'Benign',

      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },

    Hindi: {
      title: 'रिपोर्ट',

      subtitle:
        'स्कैन रिपोर्ट और खतरे के विश्लेषण का सारांश',

      loadingReports:
        'स्कैन रिपोर्ट लोड हो रही हैं...',

      noReports:
        'कोई स्कैन रिपोर्ट उपलब्ध नहीं है।',

      reportId: 'रिपोर्ट ID',
      scanDate: 'स्कैन दिनांक',
      fileName: 'फ़ाइल नाम',
      prediction: 'पूर्वानुमान',
      threatLevel: 'खतरे का स्तर',
      actions: 'कार्रवाई',

      view: 'देखें',
      close: 'बंद करें',

      generating: 'बनाया जा रहा है...',
      download: 'डाउनलोड',

      loadingDetails:
        'रिपोर्ट विवरण लोड हो रहा है...',

      scanReport: 'स्कैन रिपोर्ट',

      fileType: 'फ़ाइल प्रकार',
      fileSize: 'फ़ाइल आकार',
      threatScore: 'खतरा स्कोर',
      confidence: 'विश्वास स्तर',
      entropy: 'एंट्रॉपी',
      model: 'मॉडल',
      sha256: 'SHA-256',
      createdAt: 'बनाया गया',

      analysisSummary: 'विश्लेषण सारांश',

      malwareSummary:
        'विश्लेषित फ़ाइल को दुर्भावनापूर्ण पाया गया। खतरा स्कोर',

      benignSummary:
        'विश्लेषित फ़ाइल को सुरक्षित पाया गया। खतरा स्कोर',

      unableToLoadHistory:
        'स्कैन इतिहास लोड नहीं किया जा सका।',

      unableToLoadDetails:
        'रिपोर्ट विवरण लोड नहीं किया जा सका।',

      unableToGenerate:
        'PDF रिपोर्ट बनाई नहीं जा सकी।',

      noData: 'उपलब्ध नहीं',

      malware: 'मैलवेयर',
      benign: 'सुरक्षित',

      critical: 'गंभीर',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'कम',
    },
  }

  const t = text[language] || text.English

  const translatePrediction = (prediction) => {
    if (prediction === 'Malware') {
      return t.malware
    }

    return t.benign
  }

  const translateThreatLevel = (level) => {
    if (level === 'Critical') return t.critical
    if (level === 'High') return t.high
    if (level === 'Medium') return t.medium
    if (level === 'Low') return t.low

    return level
  }

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

        const formattedReports = (
          data.scans || []
        ).map((scan) => {
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

        setReports(formattedReports)

      } catch (err) {
        console.error(
          'Reports API error:',
          err
        )

        setError(
          err.message ||
            t.unableToLoadHistory
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
          t.unableToLoadDetails
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

      // ==========================================
      // CREATE PDF
      // ==========================================

      const doc = new jsPDF()

      // Header
      doc.setFontSize(20)
      doc.setFont(
        'helvetica',
        'bold'
      )

      doc.text(
        'CyberShield AI',
        20,
        20
      )

      doc.setFontSize(14)
      doc.setFont(
        'helvetica',
        'normal'
      )

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
      doc.setFont(
        'helvetica',
        'bold'
      )

      doc.text(
        `Scan ID: ${data.id ?? report.id}`,
        20,
        48
      )

      doc.setFont(
        'helvetica',
        'normal'
      )

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

        const wrapped =
          doc.splitTextToSize(
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

        y += Math.max(
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
        ).replace(
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
          t.unableToGenerate
      )

    } finally {
      setDownloadLoading(null)
    }
  }

  return (
    <div className="reports">

      {/* HEADER */}
      <h1>
        {t.title}
      </h1>

      <p className="page-subtitle">
        {t.subtitle}
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
            {t.loadingReports}
          </div>

        ) : reports.length === 0 ? (

          <div className="empty-state">
            {t.noReports}
          </div>

        ) : (

          <table className="data-table">

            <thead>

              <tr>
                <th>{t.reportId}</th>
                <th>{t.scanDate}</th>
                <th>{t.fileName}</th>
                <th>{t.prediction}</th>
                <th>{t.threatLevel}</th>
                <th>{t.actions}</th>
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
                      {translatePrediction(
                        report.prediction
                      )}
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
                        {t.view}
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
                          ? t.generating
                          : t.download}
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
            {t.loadingDetails}
          </p>

        </div>
      )}


      {/* REPORT DETAILS */}
      {selectedReport &&
        !viewLoading && (

          <div className="panel report-details">

            <div className="result-header">

              <h2>
                {t.scanReport} #
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
                {t.close}
              </button>

            </div>


            <div className="result-grid">

              <div className="result-field">

                <span className="field-label">
                  {t.fileName}
                </span>

                <span className="field-value mono">
                  {selectedReport.filename ||
                    t.noData}
                </span>

              </div>


              <div className="result-field">

                <span className="field-label">
                  {t.fileType}
                </span>

                <span className="field-value mono">
                  {selectedReport.file_type ||
                    t.noData}
                </span>

              </div>


              <div className="result-field">

                <span className="field-label">
                  {t.fileSize}
                </span>

                <span className="field-value mono">
                  {selectedReport.file_size ??
                    t.noData}
                </span>

              </div>


              <div className="result-field">

                <span className="field-label">
                  {t.prediction}
                </span>

                <span className="field-value mono">
                  {translatePrediction(
                    formatPrediction(
                      selectedReport.prediction
                    )
                  )}
                </span>

              </div>


              <div className="result-field">

                <span className="field-label">
                  {t.threatScore}
                </span>

                <span className="field-value mono">
                  {selectedReport.threat_score ??
                    t.noData}
                </span>

              </div>


              <div className="result-field">

                <span className="field-label">
                  {t.confidence}
                </span>

                <span className="field-value mono">

                  {selectedReport.confidence !==
                  undefined
                    ? `${(
                        Number(
                          selectedReport.confidence
                        ) * 100
                      ).toFixed(2)}%`
                    : t.noData}

                </span>

              </div>


              <div className="result-field">

                <span className="field-label">
                  {t.entropy}
                </span>

                <span className="field-value mono">
                  {selectedReport.entropy ??
                    t.noData}
                </span>

              </div>


              <div className="result-field">

                <span className="field-label">
                  {t.model}
                </span>

                <span className="field-value mono">
                  {selectedReport.model ??
                    t.noData}
                </span>

              </div>


              <div className="result-field span-2">

                <span className="field-label">
                  {t.sha256}
                </span>

                <span className="field-value mono hash">
                  {selectedReport.sha256 ??
                    t.noData}
                </span>

              </div>


              <div className="result-field span-2">

                <span className="field-label">
                  {t.createdAt}
                </span>

                <span className="field-value mono">

                  {selectedReport.created_at
                    ? new Date(
                        selectedReport.created_at
                      ).toLocaleString()
                    : t.noData}

                </span>

              </div>

            </div>

          </div>

        )}

    </div>
  )
}

export default Reports