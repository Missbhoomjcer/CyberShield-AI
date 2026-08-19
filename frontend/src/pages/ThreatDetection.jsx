import { useEffect, useMemo, useState } from 'react'
import SeverityBadge from '../components/threats/SeverityBadge.jsx'
import './ThreatDetection.css'

const API_URL = 'http://127.0.0.1:8000'

const FILTERS = [
  'All',
  'Critical',
  'High',
  'Medium',
  'Low',
]

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

function ThreatDetection() {
  const [filter, setFilter] = useState('All')
  const [threats, setThreats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${API_URL}/history/`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail || 'Failed to fetch threat data'
          )
        }

        const scanRecords = data.scans || []

        const formattedThreats = scanRecords
          .filter((scan) =>
            isMalwarePrediction(scan.prediction)
          )
          .map((scan) => {
            const threatScore = Number(
              scan.threat_score || 0
            )

            const confidence =
              scan.confidence !== undefined &&
              scan.confidence !== null
                ? (
                    Number(scan.confidence) * 100
                  ).toFixed(2)
                : 'N/A'

            return {
              id: scan.id,
              name: scan.filename || 'Unknown file',
              type: 'Malware Detection',
              severity: getSeverity(threatScore),
              confidence,
              time: scan.created_at
                ? new Date(
                    scan.created_at
                  ).toLocaleString()
                : 'N/A',
              status: 'Detected',
              threatScore,
            }
          })

        setThreats(formattedThreats)
      } catch (err) {
        console.error(
          'Threat detection API error:',
          err
        )

        setError(
          err.message || 'Unable to load threat data.'
        )

        setThreats([])
      } finally {
        setLoading(false)
      }
    }

    fetchThreats()
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'All') {
      return threats
    }

    return threats.filter(
      (threat) => threat.severity === filter
    )
  }, [filter, threats])

  return (
    <div className="threat-detection">
      <h1>Threat Detection</h1>

      <p className="page-subtitle">
        All detected threats identified by the AI model
      </p>

      <div className="filter-row">
        {FILTERS.map((item) => (
          <button
            key={item}
            className={`filter-chip${
              filter === item ? ' active' : ''
            }`}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {error && (
        <div className="scan-error">
          {error}
        </div>
      )}

      <div className="panel">
        {loading ? (
          <div className="empty-state">
            Loading detected threats...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>File / Process Name</th>
                <th>Detection Type</th>
                <th>Severity</th>
                <th>Confidence</th>
                <th>Threat Score</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length > 0 ? (
                filtered.map((threat) => (
                  <tr key={threat.id}>
                    <td className="mono">
                      {threat.name}
                    </td>

                    <td>{threat.type}</td>

                    <td>
                      <SeverityBadge
                        level={threat.severity}
                      />
                    </td>

                    <td className="mono">
                      {threat.confidence}%
                    </td>

                    <td className="mono">
                      {threat.threatScore.toFixed(2)}
                    </td>

                    <td className="mono">
                      {threat.time}
                    </td>

                    <td>{threat.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    No threats match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default ThreatDetection