import { useEffect, useState } from 'react'
import StatCard from '../components/dashboard/StatCard.jsx'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    systemStatus: 'Protected',
    filesScanned: 0,
    threatsDetected: 0,
    suspiciousActivities: 0,
    detectionAccuracy: 0,
  })

  const [scans, setScans] = useState([])
  const [loadingScans, setLoadingScans] = useState(true)

  useEffect(() => {
    const fetchScanHistory = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/history/')

        if (!response.ok) {
          throw new Error('Failed to fetch scan history')
        }

        const data = await response.json()

        const allScans = data.scans || []

        // Format scans for Recent Scan Activity
        const formattedScans = allScans.map((scan) => ({
          id: scan.id,
          fileName: scan.filename,
          type: scan.file_type,
          prediction:
            scan.prediction === '1' || scan.prediction === 1
              ? 'Malware'
              : 'Benign',
          confidence: Number((scan.confidence || 0) * 100).toFixed(2),
          time: scan.created_at
            ? new Date(scan.created_at).toLocaleString()
            : 'N/A',
        }))

        setScans(formattedScans)

        // Count detected threats
        const threatsDetected = allScans.filter(
          (scan) =>
            scan.prediction === '1' ||
            scan.prediction === 1 ||
            scan.prediction === 'Malware'
        ).length

        // Calculate average confidence
        const averageConfidence =
          allScans.length > 0
            ? allScans.reduce(
                (total, scan) =>
                  total + Number(scan.confidence || 0),
                0
              ) / allScans.length
            : 0

        // Update dashboard statistics
        setStats({
          systemStatus: 'Protected',
          filesScanned: data.count || allScans.length,
          threatsDetected: threatsDetected,
          suspiciousActivities: threatsDetected,
          detectionAccuracy: Number(
            (averageConfidence * 100).toFixed(1)
          ),
        })
      } catch (error) {
        console.error('Error fetching scan history:', error)

        setScans([])

        setStats({
          systemStatus: 'Backend Offline',
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
      <h1>Dashboard</h1>

      <p className="page-subtitle">
        Real-time overview of system protection status
      </p>

      {/* Dashboard Statistics */}
      <div className="stat-grid">
        <StatCard
          label="System Status"
          value={stats.systemStatus}
          accent="low"
        />

        <StatCard
          label="Files Scanned"
          value={stats.filesScanned.toLocaleString()}
          accent="cyan"
        />

        <StatCard
          label="Threats Detected"
          value={stats.threatsDetected}
          accent="high"
        />

        <StatCard
          label="Suspicious Activities"
          value={stats.suspiciousActivities}
          accent="purple"
        />

        <StatCard
          label="Detection Accuracy"
          value={stats.detectionAccuracy}
          unit="%"
          accent="cyan"
        />
      </div>

      <div className="dashboard-row">

        {/* Threat Overview */}
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
                        (stats.threatsDetected / stats.filesScanned) * 100
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
                        ((stats.filesScanned - stats.threatsDetected) /
                          stats.filesScanned) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <span className="threat-bar-count mono">
                  {stats.filesScanned - stats.threatsDetected}
                </span>
              </div>
            </div>
          ) : (
            <p>No threat data available</p>
          )}
        </div>

        {/* Recent Scan Activity */}
        <div className="panel">
          <h2>Recent Scan Activity</h2>

          {loadingScans ? (
            <p>Loading scan history...</p>
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
                  scans.slice(0, 5).map((scan) => (
                    <tr key={scan.id}>
                      <td className="mono">
                        {scan.fileName}
                      </td>

                      <td>{scan.type}</td>

                      <td>
                        <span
                          className={`badge ${
                            scan.prediction === 'Malware'
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
    </div>
  )
}

export default Dashboard