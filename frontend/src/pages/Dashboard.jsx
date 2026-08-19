import { useEffect, useState } from 'react'
import StatCard from '../components/dashboard/StatCard.jsx'
import './Dashboard.css'

const API_URL = 'http://127.0.0.1:8000'

function getThreatLevel(threatScore) {
  const score = Number(threatScore || 0)

  if (score >= 80) return 'Critical'
  if (score >= 60) return 'High'
  if (score >= 30) return 'Medium'

  return 'Low'
}

function isMalware(scan) {
  const prediction = String(
    scan?.prediction ?? ''
  )
    .toLowerCase()
    .trim()

  return (
    prediction === '1' ||
    prediction === 'malware' ||
    prediction === 'malicious' ||
    prediction === 'true'
  )
}

function Dashboard() {
  const [stats, setStats] = useState({
    systemStatus: 'Protected',
    filesScanned: 0,
    threatsDetected: 0,
    suspiciousActivities: 0,
    detectionAccuracy: 0,
  })

  const [scans, setScans] = useState([])
  const [alerts, setAlerts] = useState([])

  const [loadingScans, setLoadingScans] = useState(true)
  const [error, setError] = useState(null)

  // ==========================================
  // FETCH REAL SCAN HISTORY
  // ==========================================

  useEffect(() => {
    const fetchScanHistory = async () => {
      try {
        setLoadingScans(true)
        setError(null)

        const response = await fetch(
          `${API_URL}/history/`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail ||
              'Failed to fetch scan history'
          )
        }

        const allScans = data.scans || []

        // ======================================
        // RECENT SCAN ACTIVITY
        // ======================================

        const formattedScans =
          allScans.map((scan) => ({
            id: scan.id,

            fileName:
              scan.filename || 'Unknown file',

            type:
              scan.file_type || 'N/A',

            prediction: isMalware(scan)
              ? 'Malware'
              : 'Benign',

            confidence:
              scan.confidence !== undefined &&
              scan.confidence !== null
                ? (
                    Number(scan.confidence) *
                    100
                  ).toFixed(2)
                : 'N/A',

            time: scan.created_at
              ? new Date(
                  scan.created_at
                ).toLocaleString()
              : 'N/A',

            threatScore:
              Number(
                scan.threat_score || 0
              ),
          }))

        setScans(formattedScans)

        // ======================================
        // DASHBOARD STATISTICS
        // ======================================

        const malwareScans =
          allScans.filter(isMalware)

        const threatsDetected =
          malwareScans.length

        const averageConfidence =
          allScans.length > 0
            ? allScans.reduce(
                (total, scan) =>
                  total +
                  Number(
                    scan.confidence || 0
                  ),
                0
              ) / allScans.length
            : 0

        setStats({
          systemStatus: 'Protected',

          filesScanned:
            data.count ||
            allScans.length,

          threatsDetected,

          // This is scan-based for now.
          // Actual behavioral activity comes
          // from /monitoring/live.
          suspiciousActivities:
            threatsDetected,

          detectionAccuracy:
            Number(
              (
                averageConfidence *
                100
              ).toFixed(1)
            ),
        })

        // ======================================
        // ALERTS & NOTIFICATIONS
        // ======================================

        const generatedAlerts =
          malwareScans
            .map((scan) => {
              const threatScore =
                Number(
                  scan.threat_score || 0
                )

              return {
                id: scan.id,

                filename:
                  scan.filename ||
                  'Unknown file',

                severity:
                  getThreatLevel(
                    threatScore
                  ),

                threatScore,

                time: scan.created_at
                  ? new Date(
                      scan.created_at
                    ).toLocaleString()
                  : 'N/A',
              }
            })
            .slice(0, 5)

        setAlerts(generatedAlerts)
      } catch (err) {
        console.error(
          'Dashboard API error:',
          err
        )

        setError(
          err.message ||
            'Unable to connect to backend.'
        )

        setScans([])

        setAlerts([])

        setStats({
          systemStatus:
            'Backend Offline',

          filesScanned: 0,

          threatsDetected: 0,

          suspiciousActivities: 0,

          detectionAccuracy: 0,
        })
      } finally {
        setLoadingScans(false)
      }
    }

    fetchScanHistory()
  }, [])

  return (
    <div className="dashboard">

      {/* ========================================
          HEADER
      ======================================== */}

      <h1>Dashboard</h1>

      <p className="page-subtitle">
        Real-time overview of system
        protection status
      </p>

      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div className="scan-error">
          {error}
        </div>
      )}

      {/* ========================================
          STATISTICS
      ======================================== */}

      <div className="stat-grid">

        <StatCard
          label="System Status"
          value={
            stats.systemStatus
          }
          accent="low"
        />

        <StatCard
          label="Files Scanned"
          value={
            stats.filesScanned.toLocaleString()
          }
          accent="cyan"
        />

        <StatCard
          label="Threats Detected"
          value={
            stats.threatsDetected
          }
          accent="high"
        />

        <StatCard
          label="Suspicious Activities"
          value={
            stats.suspiciousActivities
          }
          accent="purple"
        />

        <StatCard
          label="Detection Accuracy"
          value={
            stats.detectionAccuracy
          }
          unit="%"
          accent="cyan"
        />

      </div>

      {/* ========================================
          THREAT OVERVIEW + RECENT SCANS
      ======================================== */}

      <div className="dashboard-row">

        {/* THREAT OVERVIEW */}

        <div className="panel">

          <h2>Threat Overview</h2>

          {stats.filesScanned > 0 ? (
            <div className="threat-bars">

              <div className="threat-bar-row">

                <span className="threat-bar-label">
                  Malware Detected
                </span>

                <div className="threat-bar-track">

                  <div
                    className="threat-bar-fill"
                    style={{
                      width: `${
                        Math.min(
                          (
                            stats.threatsDetected /
                            stats.filesScanned
                          ) * 100,
                          100
                        )
                      }%`,
                    }}
                  />

                </div>

                <span className="threat-bar-count mono">
                  {stats.threatsDetected}
                </span>

              </div>

              <div className="threat-bar-row">

                <span className="threat-bar-label">
                  Benign Files
                </span>

                <div className="threat-bar-track">

                  <div
                    className="threat-bar-fill"
                    style={{
                      width: `${
                        Math.min(
                          (
                            (
                              stats.filesScanned -
                              stats.threatsDetected
                            ) /
                            stats.filesScanned
                          ) * 100,
                          100
                        )
                      }%`,
                    }}
                  />

                </div>

                <span className="threat-bar-count mono">
                  {
                    stats.filesScanned -
                    stats.threatsDetected
                  }
                </span>

              </div>

            </div>
          ) : (
            <p>
              No threat data available
            </p>
          )}

        </div>

        {/* RECENT SCANS */}

        <div className="panel">

          <h2>Recent Scan Activity</h2>

          {loadingScans ? (
            <p>
              Loading scan history...
            </p>
          ) : (
            <table className="data-table">

              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Prediction</th>
                  <th>Confidence</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>

                {scans.length > 0 ? (
                  scans
                    .slice(0, 5)
                    .map((scan) => (
                      <tr key={scan.id}>

                        <td className="mono">
                          {scan.fileName}
                        </td>

                        <td>
                          {scan.type}
                        </td>

                        <td>

                          <span
                            className={`badge ${
                              scan.prediction ===
                              'Malware'
                                ? 'badge-critical'
                                : 'badge-low'
                            }`}
                          >
                            {scan.prediction}
                          </span>

                        </td>

                        <td className="mono">
                          {scan.confidence}%
                        </td>

                        <td className="mono">
                          {scan.time}
                        </td>

                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="5">
                      No scan history available
                    </td>
                  </tr>
                )}

              </tbody>

            </table>
          )}

        </div>

      </div>

      {/* ========================================
          ALERTS & NOTIFICATIONS
      ======================================== */}

      <div className="panel" style={{ marginTop: '20px' }}>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >

          <div>
            <h2>
              Alerts & Notifications
            </h2>

            <p
              style={{
                margin: '4px 0 0',
                color: '#71839f',
                fontSize: '13px',
              }}
            >
              Recent security alerts
              generated from detected threats
            </p>
          </div>

          <span className="badge badge-critical">
            {alerts.length}
          </span>

        </div>

        {alerts.length === 0 ? (

          <div className="empty-state">
            No security alerts at this time.
          </div>

        ) : (

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >

            {alerts.map((alert) => (

              <div
                key={alert.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  padding: '14px 16px',
                  border:
                    '1px solid #26364f',
                  borderRadius: '8px',
                  background:
                    '#111b2b',
                }}
              >

                <div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >

                    <span
                      className="badge badge-critical"
                    >
                      {alert.severity}
                    </span>

                    <strong>
                      Malware Detected
                    </strong>

                  </div>

                  <p
                    style={{
                      margin:
                        '6px 0 0',
                      color:
                        '#9db0ca',
                      fontSize:
                        '13px',
                    }}
                  >
                    {alert.filename}
                    {' '}
                    was identified
                    as malicious.
                  </p>

                </div>

                <div
                  style={{
                    textAlign:
                      'right',
                    whiteSpace:
                      'nowrap',
                    fontSize:
                      '12px',
                    color:
                      '#71839f',
                  }}
                >

                  <div className="mono">
                    Score:
                    {' '}
                    {alert.threatScore.toFixed(
                      2
                    )}
                  </div>

                  <div>
                    {alert.time}
                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  )
}

export default Dashboard