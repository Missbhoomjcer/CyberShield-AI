import { useCallback, useEffect, useMemo, useState } from 'react'
import SeverityBadge from '../components/threats/SeverityBadge.jsx'
import './ThreatDetection.css'

const API_URL = 'http://127.0.0.1:8000'

const FILTERS = ['All', 'Critical', 'High', 'Medium', 'Low']

function getSeverity(threatScore) {
  const score = Number(threatScore || 0)

  if (score >= 80) return 'Critical'
  if (score >= 60) return 'High'
  if (score >= 30) return 'Medium'

  return 'Low'
}

function isMalwarePrediction(prediction) {
  const value = String(prediction ?? '').toLowerCase().trim()

  return (
    value === '1' ||
    value === 'malware' ||
    value === 'malicious' ||
    value === 'true'
  )
}

function ThreatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l8 4v5c0 4.8-3.4 8.2-8 10-4.6-1.8-8-5.2-8-10V7l8-4z" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.8-3 8.2-7 10-4-1.8-7-5.2-7-10V6l7-3z" />
      <path d="M8.5 12l2.2 2.2 4.8-5" />
    </svg>
  )
}

function ThreatDetection() {
  const [filter, setFilter] = useState('All')
  const [threats, setThreats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchThreats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_URL}/history/`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to fetch threat data'
        )
      }

      const scanRecords = data.scans || []

      const formattedThreats = scanRecords
        .filter((scan) => isMalwarePrediction(scan.prediction))
        .map((scan) => {
          const threatScore = Number(scan.threat_score || 0)

          const confidence =
            scan.confidence !== undefined &&
            scan.confidence !== null
              ? (Number(scan.confidence) * 100).toFixed(2)
              : 'N/A'

          return {
            id: scan.id,
            name: scan.filename || 'Unknown file',
            type: 'Malware Detection',
            severity: getSeverity(threatScore),
            confidence,
            time: scan.created_at
              ? new Date(scan.created_at).toLocaleString()
              : 'N/A',
            status: 'Detected',
            threatScore,
          }
        })

      setThreats(formattedThreats)
    } catch (err) {
      console.error('Threat detection API error:', err)

      setError(
        err.message || 'Unable to load threat data.'
      )

      setThreats([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchThreats()
  }, [fetchThreats])

  const filtered = useMemo(() => {
    if (filter === 'All') {
      return threats
    }

    return threats.filter(
      (threat) => threat.severity === filter
    )
  }, [filter, threats])

  const criticalCount = threats.filter(
    (threat) => threat.severity === 'Critical'
  ).length

  const highCount = threats.filter(
    (threat) => threat.severity === 'High'
  ).length

  const detectedCount = threats.length

  return (
    <div className="threat-detection">

      {/* HEADER */}
      <div className="threat-header">
        <div>
          <h1>Threats</h1>
          <p>
            Review threats detected by CyberShield-AI and the actions
            taken on your device.
          </p>
        </div>

        <button
          type="button"
          className="threat-refresh-btn"
          onClick={fetchThreats}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 11a8 8 0 0 0-14.9-3" />
            <path d="M5 4v4h4" />
            <path d="M4 13a8 8 0 0 0 14.9 3" />
            <path d="M19 20v-4h-4" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="threat-summary">

        <div className="threat-summary-card">
          <div className="summary-icon summary-total">
            <ThreatIcon />
          </div>

          <div>
            <span>Total Threats</span>
            <strong>{detectedCount}</strong>
          </div>
        </div>

        <div className="threat-summary-card">
          <div className="summary-icon summary-critical">
            <ThreatIcon />
          </div>

          <div>
            <span>Critical</span>
            <strong>{criticalCount}</strong>
          </div>
        </div>

        <div className="threat-summary-card">
          <div className="summary-icon summary-high">
            <svg viewBox="0 0 24 24">
              <path d="M12 3l7 3v5c0 4.8-3 8.2-7 10-4-1.8-7-5.2-7-10V6l7-3z" />
              <path d="M12 8v5" />
              <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
            </svg>
          </div>

          <div>
            <span>High</span>
            <strong>{highCount}</strong>
          </div>
        </div>

        <div className="threat-summary-card">
          <div className="summary-icon summary-protected">
            <ShieldIcon />
          </div>

          <div>
            <span>Protection Status</span>
            <strong className="protected-text">
              Active
            </strong>
          </div>
        </div>

      </div>

      {/* MAIN THREATS CARD */}
      <section className="threat-panel">

        <div className="threat-panel-header">
          <div>
            <h2>Recent Threats</h2>
            <p>
              Latest malicious files identified by the AI detection system.
            </p>
          </div>

          <div className="threat-filter-row">
            {FILTERS.map((item) => (
              <button
                type="button"
                key={item}
                className={`threat-filter-chip ${
                  filter === item ? 'active' : ''
                }`}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="threat-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="threat-empty-state">
            <div className="loading-spinner" />
            <strong>Loading threat history...</strong>
            <span>Fetching the latest security events.</span>
          </div>
        ) : (
          <div className="threat-table-wrapper">

            <table className="threat-table">

              <thead>
                <tr>
                  <th>File / Process</th>
                  <th>Detection Type</th>
                  <th>Severity</th>
                  <th>Confidence</th>
                  <th>Threat Score</th>
                  <th>Detected</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((threat) => (
                    <tr key={threat.id}>

                      <td>
                        <div className="threat-file">
                          <div className="threat-file-icon">
                            <ThreatIcon />
                          </div>

                          <div>
                            <strong>{threat.name}</strong>
                            <span>AI static analysis</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="detection-type">
                          {threat.type}
                        </span>
                      </td>

                      <td>
                        <SeverityBadge level={threat.severity} />
                      </td>

                      <td>
                        <span className="metric-value">
                          {threat.confidence}%
                        </span>
                      </td>

                      <td>
                        <div className="threat-score-cell">
                          <div className="score-bar">
                            <span
                              style={{
                                width: `${Math.min(
                                  threat.threatScore,
                                  100
                                )}%`,
                              }}
                            />
                          </div>

                          <strong>
                            {threat.threatScore.toFixed(2)}
                          </strong>
                        </div>
                      </td>

                      <td>
                        <span className="threat-time">
                          {threat.time}
                        </span>
                      </td>

                      <td>
                        <span className="detected-status">
                          Detected
                        </span>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">
                      <div className="threat-no-results">
                        <div className="no-threat-icon">
                          <ShieldIcon />
                        </div>

                        <strong>
                          No threats found
                        </strong>

                        <span>
                          No detected threats match the selected filter.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>

            </table>

          </div>
        )}

        <div className="threat-panel-footer">
          Threat history is automatically updated when CyberShield-AI
          detects a security event.
        </div>

      </section>

    </div>
  )
}

export default ThreatDetection