import { getDashboardStats, getThreatOverview, getRecentScans } from '../data/dummyData.js'
import StatCard from '../components/dashboard/StatCard.jsx'
import './Dashboard.css'

function Dashboard() {
  const stats = getDashboardStats()
  const threats = getThreatOverview()
  const scans = getRecentScans()

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="page-subtitle">Real-time overview of system protection status</p>

      <div className="stat-grid">
        <StatCard label="System Status" value={stats.systemStatus} accent="low" />
        <StatCard label="Files Scanned" value={stats.filesScanned.toLocaleString()} accent="cyan" />
        <StatCard label="Threats Detected" value={stats.threatsDetected} accent="high" />
        <StatCard label="Suspicious Activities" value={stats.suspiciousActivities} accent="purple" />
        <StatCard label="Detection Accuracy" value={stats.detectionAccuracy} unit="%" accent="cyan" />
      </div>

      <div className="dashboard-row">
        <div className="panel">
          <h2>Threat Overview</h2>
          <div className="threat-bars">
            {threats.map((t) => (
              <div key={t.label} className="threat-bar-row">
                <span className="threat-bar-label">{t.label}</span>
                <div className="threat-bar-track">
                  <div
                    className="threat-bar-fill"
                    style={{ width: `${(t.count / Math.max(...threats.map(x => x.count))) * 100}%` }}
                  />
                </div>
                <span className="threat-bar-count mono">{t.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Recent Scan Activity</h2>
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
              {scans.map((s) => (
                <tr key={s.id}>
                  <td className="mono">{s.fileName}</td>
                  <td>{s.type}</td>
                  <td>
                    <span className={`badge ${s.prediction === 'Malware' ? 'badge-critical' : 'badge-low'}`}>
                      {s.prediction}
                    </span>
                  </td>
                  <td className="mono">{s.confidence}%</td>
                  <td className="mono">{s.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard