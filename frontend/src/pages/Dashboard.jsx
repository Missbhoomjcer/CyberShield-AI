import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(false)

  const handleQuickScan = () => {
    setScanning(true)

    setTimeout(() => {
      setScanning(false)
      navigate('/scan')
    }, 700)
  }

  return (
    <div className="dashboard-page">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Good afternoon, Harshita!</h1>
          <p>Your device security is up to date.</p>
        </div>

        <button
          className="quick-scan-btn"
          onClick={handleQuickScan}
          disabled={scanning}
        >
          <span className="scan-icon">⌕</span>
          {scanning ? 'Starting scan...' : 'Quick Scan'}
        </button>
      </div>

      {/* Main Protection Card */}
      <section className="protection-card">

        <div className="protection-icon">
          <div className="shield-shape">
            ✓
          </div>
        </div>

        <div className="protection-content">
          <span className="status-label">PROTECTION STATUS</span>

          <h2>You are protected</h2>

          <p>
            CyberShield-AI is actively protecting this device
            against ransomware and other threats.
          </p>

          <div className="last-check">
            <span className="status-dot"></span>
            Real-time protection is active
          </div>
        </div>

        <div className="protection-score">
          <div className="score-circle">
            <strong>98</strong>
            <span>/100</span>
          </div>

          <p>Protection Score</p>
          <strong className="excellent">Excellent</strong>
        </div>

      </section>

      {/* Security Overview */}
      <div className="section-heading">
        <div>
          <h2>Security overview</h2>
          <p>Current protection activity on this device</p>
        </div>
      </div>

      <div className="stats-grid">

        <div className="overview-card">
          <div className="overview-top">
            <div className="overview-icon blue">⌕</div>
            <span className="card-status">Active</span>
          </div>

          <h3>Files Scanned</h3>
          <strong className="stat-number">1,284</strong>
          <p>Files checked for threats</p>
        </div>

        <div className="overview-card">
          <div className="overview-top">
            <div className="overview-icon green">✓</div>
            <span className="card-status green-text">Secure</span>
          </div>

          <h3>Threats Detected</h3>
          <strong className="stat-number">17</strong>
          <p>Threats successfully handled</p>
        </div>

        <div className="overview-card">
          <div className="overview-top">
            <div className="overview-icon purple">AI</div>
            <span className="card-status">98.6%</span>
          </div>

          <h3>AI Detection Accuracy</h3>
          <strong className="stat-number">98.6%</strong>
          <p>XGBoost + LSTM protection</p>
        </div>

        <div className="overview-card">
          <div className="overview-top">
            <div className="overview-icon orange">◉</div>
            <span className="card-status green-text">Running</span>
          </div>

          <h3>Behavior Monitoring</h3>
          <strong className="stat-number">Active</strong>
          <p>Monitoring system activity</p>
        </div>

      </div>

      {/* Protection Features */}
      <div className="content-grid">

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Protection features</h2>
              <p>Security layers currently protecting your device</p>
            </div>
          </div>

          <div className="feature-list">

            <div className="feature-row">
              <div className="feature-icon">✓</div>

              <div className="feature-info">
                <h3>Real-Time Protection</h3>
                <p>Continuously monitors your system</p>
              </div>

              <span className="enabled-badge">Enabled</span>
            </div>

            <div className="feature-row">
              <div className="feature-icon">◆</div>

              <div className="feature-info">
                <h3>Ransomware Protection</h3>
                <p>Detects suspicious ransomware behavior</p>
              </div>

              <span className="enabled-badge">Enabled</span>
            </div>

            <div className="feature-row">
              <div className="feature-icon">AI</div>

              <div className="feature-info">
                <h3>AI Threat Detection</h3>
                <p>XGBoost and LSTM analysis</p>
              </div>

              <span className="enabled-badge">Enabled</span>
            </div>

            <div className="feature-row">
              <div className="feature-icon">◉</div>

              <div className="feature-info">
                <h3>Behavioral Monitoring</h3>
                <p>Analyzes system activity in real time</p>
              </div>

              <span className="enabled-badge">Enabled</span>
            </div>

          </div>
        </section>

        {/* Recent Activity */}
        <section className="dashboard-panel activity-panel">

          <div className="panel-header">
            <div>
              <h2>Recent activity</h2>
              <p>Latest security events</p>
            </div>

            <button
              className="view-all-btn"
              onClick={() => navigate('/threats')}
            >
              View all
            </button>
          </div>

          <div className="activity-list">

            <div className="activity-item">
              <div className="activity-check">✓</div>

              <div>
                <h3>System scan completed</h3>
                <p>1,284 files checked</p>
              </div>

              <span>Today</span>
            </div>

            <div className="activity-item">
              <div className="activity-check">✓</div>

              <div>
                <h3>Real-time protection enabled</h3>
                <p>Device is actively protected</p>
              </div>

              <span>Today</span>
            </div>

            <div className="activity-item">
              <div className="activity-check">✓</div>

              <div>
                <h3>Behavior monitoring active</h3>
                <p>No suspicious activity detected</p>
              </div>

              <span>Today</span>
            </div>

          </div>
        </section>

      </div>

      {/* Device information */}
      <section className="device-card">

        <div className="device-left">
          <div className="device-icon">▣</div>

          <div>
            <span>PROTECTED DEVICE</span>
            <h2>Windows PC</h2>
            <p>CyberShield Endpoint Agent</p>
          </div>
        </div>

        <div className="device-status">
          <span className="status-dot"></span>
          Protected
        </div>

      </section>

    </div>
  )
}

export default Dashboard