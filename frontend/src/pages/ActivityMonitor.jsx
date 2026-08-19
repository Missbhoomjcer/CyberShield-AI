import { useState, useEffect, useRef } from 'react'
import MetricGauge from '../components/activity/MetricGauge.jsx'
import './ActivityMonitor.css'

const API_URL = 'http://127.0.0.1:8000'

function ActivityMonitor() {
  const [monitoring, setMonitoring] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [metrics, setMetrics] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    fileModRate: 0,
    networkConnections: 0,
    suspiciousProcesses: 0,
  })

  const [prediction, setPrediction] = useState({
    label: 'Not analyzed',
    probability: 0,
    riskPercent: 0,
  })

  const [log, setLog] = useState([])

  const intervalRef = useRef(null)

  // ==========================================
  // FETCH REAL MONITORING DATA
  // ==========================================

  const fetchLiveMonitoring = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `${API_URL}/monitoring/live?observations=10&interval=1`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Live monitoring failed'
        )
      }

      const activity = data.latest_activity || {}

      // ----------------------------------------
      // UPDATE SYSTEM METRICS
      // ----------------------------------------

      setMetrics({
        cpuUsage: activity.cpu_usage ?? 0,
        memoryUsage: activity.memory_usage ?? 0,
        fileModRate: activity.file_change_count ?? 0,
        networkConnections:
          activity.network_connection_count ?? 0,
        suspiciousProcesses:
          activity.suspicious_process_count ?? 0,
      })

      // ----------------------------------------
      // UPDATE LSTM PREDICTION
      // ----------------------------------------

      setPrediction({
        label: data.label ?? 'Unknown',
        probability: Number(data.probability ?? 0),
        riskPercent: Number(data.risk_percent ?? 0),
      })

      // ----------------------------------------
      // ADD ACTIVITY LOG ENTRY
      // ----------------------------------------

      const now = new Date().toLocaleTimeString()

      const newEvent = {
        id: Date.now(),
        type:
          String(data.label).toLowerCase() === 'normal'
            ? 'info'
            : 'warning',
        time: now,
        text:
          `LSTM: ${data.label} | ` +
          `Risk: ${Number(data.risk_percent ?? 0).toFixed(2)}% | ` +
          `Suspicious processes: ${
            activity.suspicious_process_count ?? 0
          }`,
      }

      setLog((previous) =>
        [newEvent, ...previous].slice(0, 20)
      )
    } catch (err) {
      console.error('Live monitoring error:', err)
      setError(
        err.message || 'Unable to fetch live monitoring data.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // START / STOP FRONTEND MONITORING
  // ==========================================

  const handleMonitoring = async () => {
    if (monitoring) {
      // Stop frontend polling
      setMonitoring(false)

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      return
    }

    // Start monitoring
    setMonitoring(true)
    setError(null)
    setLog([])

    // Get first result immediately
    await fetchLiveMonitoring()

    // Backend endpoint collects 10 samples at 1 second
    // intervals, so refresh approximately every 10 seconds.
    intervalRef.current = setInterval(
      fetchLiveMonitoring,
      10000
    )
  }

  // ==========================================
  // CLEANUP
  // ==========================================

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div className="activity-monitor">

      <h1>Activity Monitor</h1>

      <p className="page-subtitle">
        Real-time file and process activity
      </p>

      {/* =====================================
          PROTECTION STATUS
      ===================================== */}

      <div className="panel protection-panel">

        <div className="protection-status">

          <span
            className={`status-dot-large${
              monitoring ? ' active' : ''
            }`}
          />

          <div>

            <div className="protection-title">
              {monitoring
                ? 'Real-Time Protection Active'
                : 'Real-Time Protection Stopped'}
            </div>

            <div className="protection-sub">
              {monitoring
                ? 'Collecting behavioral data and analyzing with LSTM'
                : 'Start monitoring to collect live system activity'}
            </div>

          </div>

        </div>

        <button
          className={`btn-toggle${
            monitoring ? ' stop' : ''
          }`}
          onClick={handleMonitoring}
          disabled={loading}
        >
          {loading
            ? 'Analyzing...'
            : monitoring
              ? 'Stop Monitoring'
              : 'Start Monitoring'}
        </button>

      </div>

      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="scan-error">
          {error}
        </div>
      )}

      {/* =====================================
          LSTM RESULT
      ===================================== */}

      <div className="panel">
        <h2>Behavioral Detection</h2>

        <div className="result-grid">

          <div className="result-field">
            <span className="field-label">
              LSTM Prediction
            </span>

            <span className="field-value mono">
              {prediction.label}
            </span>
          </div>

          <div className="result-field">
            <span className="field-label">
              Probability
            </span>

            <span className="field-value mono">
              {(prediction.probability * 100).toFixed(2)}%
            </span>
          </div>

          <div className="result-field">
            <span className="field-label">
              Risk
            </span>

            <span className="field-value mono">
              {prediction.riskPercent.toFixed(2)}%
            </span>
          </div>

        </div>
      </div>

      {/* =====================================
          LIVE METRICS
      ===================================== */}

      <div className="metric-grid">

        <MetricGauge
          label="CPU Usage"
          value={metrics.cpuUsage}
          unit="%"
        />

        <MetricGauge
          label="Memory Usage"
          value={metrics.memoryUsage}
          unit="%"
        />

        <MetricGauge
          label="File Modification Rate"
          value={metrics.fileModRate}
          unit=""
        />

        <MetricGauge
          label="Network Connections"
          value={metrics.networkConnections}
          unit=""
        />

        <MetricGauge
          label="Suspicious Processes"
          value={metrics.suspiciousProcesses}
          unit=""
        />

      </div>

      {/* =====================================
          LIVE ACTIVITY LOG
      ===================================== */}

      <div className="panel">

        <h2>Live Activity Log</h2>

        <div className="activity-log">

          {log.length === 0 && (
            <div className="empty-state">
              {monitoring
                ? 'Collecting system activity...'
                : 'Start monitoring to see live events here.'}
            </div>
          )}

          {log.map((event) => (
            <div
              key={event.id}
              className={`log-entry log-${event.type}`}
            >

              <span className="log-time mono">
                {event.time}
              </span>

              <span className="log-text mono">
                {event.text}
              </span>

            </div>
          ))}

        </div>
      </div>

    </div>
  )
}

export default ActivityMonitor