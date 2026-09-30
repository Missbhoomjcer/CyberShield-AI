import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import './ThreatDetection.css'

const API_URL = 'http://127.0.0.1:8000'

function Icon({ type }) {
  if (type === 'shield') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    )
  }

  if (type === 'warning') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4l8 15H4L12 4z" />
        <path d="M12 9v4" />
        <circle cx="12" cy="16.5" r="0.7" />
      </svg>
    )
  }

  if (type === 'search') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6" />
        <path d="M16 16l4 4" />
      </svg>
    )
  }

  if (type === 'refresh') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 11a8 8 0 0 0-14.7-4L4 9" />
        <path d="M4 5v4h4" />
        <path d="M4 13a8 8 0 0 0 14.7 4L20 15" />
        <path d="M20 19v-4h-4" />
      </svg>
    )
  }

  if (type === 'file') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 16h4" />
      </svg>
    )
  }

  return null
}

function getSeverity(score) {
  const value = Number(score ?? 0)

  if (value >= 80) return 'Critical'
  if (value >= 60) return 'High'
  if (value >= 30) return 'Medium'
  return 'Low'
}

function getSeverityClass(severity) {
  return `severity-${severity.toLowerCase()}`
}

function formatConfidence(value) {
  const number = Number(value ?? 0)

  if (number <= 1) {
    return `${(number * 100).toFixed(1)}%`
  }

  return `${number.toFixed(1)}%`
}

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function normalizeThreat(scan) {
  const threatScore = Number(
    scan.threat_score ??
      scan.risk_score ??
      scan.risk ??
      0
  )

  const prediction = String(
    scan.prediction ??
      scan.label ??
      scan.threat_type ??
      'Threat'
  )

  const severity = getSeverity(threatScore)

  return {
    id: scan.id ?? crypto.randomUUID(),

    filename:
      scan.filename ??
      scan.file_name ??
      scan.process_name ??
      'Unknown file',

    hash:
      scan.sha256 ??
      scan.hash ??
      '—',

    threatType:
      scan.threat_type ??
      prediction,

    severity,

    risk: threatScore,

    confidence: scan.confidence ?? 0,

    action:
      scan.action ??
      scan.status ??
      'Detected',

    detectedAt:
      scan.created_at ??
      scan.detected_at ??
      scan.timestamp ??
      null,
  }
}

function ThreatDetection() {
  const { language } = useLanguage()

  const [threats, setThreats] = useState([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const text = {
    English: {
      title: 'Threat History',
      description:
        'Review threats detected by CyberShield-AI and investigate security events.',
      refresh: 'Refresh',
      refreshing: 'Refreshing...',

      totalThreats: 'Total Threats',
      critical: 'Critical',
      high: 'High',
      protectionStatus: 'Protection Status',
      active: 'Active',

      detectedThreats: 'Detected Threats',
      detectedDescription:
        'Security events reported by the detection system.',

      all: 'All',
      medium: 'Medium',
      low: 'Low',

      searchPlaceholder:
        'Search by file, hash, threat type or device',

      result: 'result',
      results: 'results',

      loadingTitle: 'Loading threat history...',
      loadingDescription:
        'Fetching security events from CyberShield-AI.',

      noThreats: 'No threats found',
      noSearchMatch:
        'No detected threats match your search.',
      noFilterMatch:
        'No detected threats match the selected filters.',

      fileProcess: 'File / Process',
      threatType: 'Threat Type',
      severity: 'Severity',
      risk: 'Risk',
      confidence: 'Confidence',
      action: 'Action',
      detected: 'Detected',

      footer:
        'Threat history is automatically updated when CyberShield-AI detects a security event.',

      unknownFile: 'Unknown file',
      threat: 'Threat',
      detectedAction: 'Detected',

      errorFallback:
        'Unable to connect to the security engine.',
    },

    Hindi: {
      title: 'खतरे का इतिहास',
      description:
        'CyberShield-AI द्वारा पाए गए खतरों की समीक्षा करें और सुरक्षा घटनाओं की जाँच करें।',
      refresh: 'रिफ्रेश',
      refreshing: 'रिफ्रेश हो रहा है...',

      totalThreats: 'कुल खतरे',
      critical: 'गंभीर',
      high: 'उच्च',
      protectionStatus: 'सुरक्षा स्थिति',
      active: 'सक्रिय',

      detectedThreats: 'पाए गए खतरे',
      detectedDescription:
        'डिटेक्शन सिस्टम द्वारा रिपोर्ट की गई सुरक्षा घटनाएँ।',

      all: 'सभी',
      medium: 'मध्यम',
      low: 'कम',

      searchPlaceholder:
        'फ़ाइल, हैश, खतरे के प्रकार या डिवाइस से खोजें',

      result: 'परिणाम',
      results: 'परिणाम',

      loadingTitle: 'खतरे का इतिहास लोड हो रहा है...',
      loadingDescription:
        'CyberShield-AI से सुरक्षा घटनाएँ प्राप्त की जा रही हैं।',

      noThreats: 'कोई खतरा नहीं मिला',
      noSearchMatch:
        'आपकी खोज से मेल खाने वाला कोई पाया गया खतरा नहीं है।',
      noFilterMatch:
        'चयनित फ़िल्टर से मेल खाने वाला कोई खतरा नहीं है।',

      fileProcess: 'फ़ाइल / प्रक्रिया',
      threatType: 'खतरे का प्रकार',
      severity: 'गंभीरता',
      risk: 'जोखिम',
      confidence: 'विश्वास',
      action: 'कार्रवाई',
      detected: 'पता चला',

      footer:
        'जब CyberShield-AI किसी सुरक्षा घटना का पता लगाता है, तो खतरे का इतिहास अपने आप अपडेट होता है।',

      unknownFile: 'अज्ञात फ़ाइल',
      threat: 'खतरा',
      detectedAction: 'पता चला',

      errorFallback:
        'सुरक्षा इंजन से कनेक्ट नहीं हो सका।',
    },
  }

  const t = text[language] || text.English

  const fetchThreats = async () => {
    try {
      setError('')

      const response = await fetch(`${API_URL}/history/`)

      if (!response.ok) {
        throw new Error(
          `Threat history request failed (${response.status})`
        )
      }

      const data = await response.json()

      let records = []

      if (Array.isArray(data)) {
        records = data
      } else if (Array.isArray(data.history)) {
        records = data.history
      } else if (Array.isArray(data.threats)) {
        records = data.threats
      } else if (Array.isArray(data.scans)) {
        records = data.scans
      }

      const normalized = records
        .filter((item) => {
          const prediction = String(
            item.prediction ??
              item.label ??
              ''
          ).toLowerCase()

          return (
            prediction.includes('malware') ||
            prediction.includes('ransomware') ||
            prediction.includes('threat') ||
            prediction === '1'
          )
        })
        .map(normalizeThreat)

      setThreats(normalized)
    } catch (err) {
      console.error('Threat history error:', err)

      setError(
        err.message || t.errorFallback
      )

      setThreats([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchThreats()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchThreats()
  }

  const filteredThreats = useMemo(() => {
    const query = search.trim().toLowerCase()

    return threats.filter((threat) => {
      const matchesFilter =
        filter === 'All' ||
        threat.severity === filter

      const searchableText = [
        threat.filename,
        threat.hash,
        threat.threatType,
        threat.severity,
        threat.action,
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        !query ||
        searchableText.includes(query)

      return matchesFilter && matchesSearch
    })
  }, [threats, filter, search])

  const totalThreats = threats.length

  const criticalCount = threats.filter(
    (item) => item.severity === 'Critical'
  ).length

  const highCount = threats.filter(
    (item) => item.severity === 'High'
  ).length

  return (
    <div className="threat-detection">

      {/* HEADER */}
      <div className="threat-header">
        <div>
          <h1>{t.title}</h1>

          <p>
            {t.description}
          </p>
        </div>

        <button
          type="button"
          className="threat-refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <Icon type="refresh" />

          {refreshing
            ? t.refreshing
            : t.refresh}
        </button>
      </div>

      {/* SUMMARY */}
      <div className="threat-summary-grid">

        <div className="threat-summary-card">
          <div className="summary-icon blue">
            <Icon type="shield" />
          </div>

          <div className="summary-content">
            <span>{t.totalThreats}</span>
            <strong>{totalThreats}</strong>
          </div>
        </div>

        <div className="threat-summary-card">
          <div className="summary-icon red">
            <Icon type="warning" />
          </div>

          <div className="summary-content">
            <span>{t.critical}</span>
            <strong>{criticalCount}</strong>
          </div>
        </div>

        <div className="threat-summary-card">
          <div className="summary-icon orange">
            <Icon type="warning" />
          </div>

          <div className="summary-content">
            <span>{t.high}</span>
            <strong>{highCount}</strong>
          </div>
        </div>

        <div className="threat-summary-card">
          <div className="summary-icon green">
            <Icon type="shield" />
          </div>

          <div className="summary-content">
            <span>{t.protectionStatus}</span>
            <strong className="active">
              {t.active}
            </strong>
          </div>
        </div>

      </div>

      {/* MAIN PANEL */}
      <section className="threat-panel">

        {/* PANEL HEADER */}
        <div className="threat-panel-header">

          <div className="threat-panel-title">
            <h2>{t.detectedThreats}</h2>

            <p>
              {t.detectedDescription}
            </p>
          </div>

          <div className="threat-filters">

            {[
              ['All', t.all],
              ['Critical', t.critical],
              ['High', t.high],
              ['Medium', t.medium],
              ['Low', t.low],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={`threat-filter-btn ${
                  filter === value ? 'active' : ''
                }`}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}

          </div>

        </div>

        {/* SEARCH */}
        <div className="threat-search-area">

          <div className="threat-search">
            <Icon type="search" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder={t.searchPlaceholder}
            />
          </div>

          <span className="threat-result-count">
            {filteredThreats.length}{' '}
            {filteredThreats.length === 1
              ? t.result
              : t.results}
          </span>

        </div>

        {/* ERROR */}
        {error && (
          <div className="threat-error">
            {error}
          </div>
        )}

        {/* TABLE */}
        {loading ? (
          <div className="threat-empty">

            <div className="no-threat-icon">
              <Icon type="shield" />
            </div>

            <h3>{t.loadingTitle}</h3>

            <p>
              {t.loadingDescription}
            </p>

          </div>
        ) : filteredThreats.length === 0 ? (
          <div className="threat-empty">

            <div className="no-threat-icon">
              <Icon type="shield" />
            </div>

            <h3>{t.noThreats}</h3>

            <p>
              {search
                ? t.noSearchMatch
                : t.noFilterMatch}
            </p>

          </div>
        ) : (
          <div className="threat-table-wrapper">

            <table className="threat-table">

              <thead>
                <tr>
                  <th>{t.fileProcess}</th>
                  <th>{t.threatType}</th>
                  <th>{t.severity}</th>
                  <th>{t.risk}</th>
                  <th>{t.confidence}</th>
                  <th>{t.action}</th>
                  <th>{t.detected}</th>
                </tr>
              </thead>

              <tbody>

                {filteredThreats.map((threat) => (
                  <tr key={threat.id}>

                    <td>
                      <div className="threat-file">

                        <div className="threat-file-icon">
                          <Icon type="file" />
                        </div>

                        <div className="threat-file-info">

                          <span className="threat-file-name">
                            {threat.filename}
                          </span>

                          <span className="threat-file-hash">
                            {threat.hash}
                          </span>

                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="threat-type">
                        {threat.threatType}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`severity-badge ${getSeverityClass(
                          threat.severity
                        )}`}
                      >
                        {threat.severity === 'Critical'
                          ? t.critical
                          : threat.severity === 'High'
                          ? t.high
                          : threat.severity === 'Medium'
                          ? t.medium
                          : t.low}
                      </span>
                    </td>

                    <td>
                      <span className="threat-risk">
                        {threat.risk.toFixed(2)}
                      </span>
                    </td>

                    <td>
                      <span className="threat-confidence">
                        {formatConfidence(
                          threat.confidence
                        )}
                      </span>
                    </td>

                    <td>
                      <span className="threat-action">
                        {threat.action}
                      </span>
                    </td>

                    <td>
                      <span className="threat-date">
                        {formatDate(
                          threat.detectedAt
                        )}
                      </span>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

        {/* FOOTER */}
        <div className="threat-footer">
          {t.footer}
        </div>

      </section>

    </div>
  )
}

export default ThreatDetection