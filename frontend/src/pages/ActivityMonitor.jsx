import { useState, useEffect } from 'react'
import MetricGauge from '../components/activity/MetricGauge.jsx'
import './ActivityMonitor.css'

const API_URL = 'http://127.0.0.1:8000'

function ActivityMonitor() {
  const [monitoring, setMonitoring] = useState(false)

  const [metrics, setMetrics] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    fileModRate: 0,
    fileRenameRate: 0,
    fileAccessFreq: 0,
    entropy: 0,
  })

  const [log, setLog] = useState([])

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState(null)

  // ==========================================
  // GET CURRENT MONITOR STATUS
  // ==========================================

  useEffect(() => {
    const getStatus = async () => {
      try {
        const response = await fetch(
          `${API_URL}/monitor/status`
        )

        const data = await response.json()

        if (response.ok) {
          setMonitoring(data.monitoring)
        }
      } catch (err) {
        console.error('Monitor status error:', err)
      }
    }

    getStatus()
  }, [])

  // ==========================================
  // START / STOP MONITORING
  // ==========================================

  const handleMonitoring = async () => {
    setLoading(true)
    setError(null)

    try {
      const endpoint = monitoring
        ? '/monitor/stop'
        : '/monitor/start'

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: 'POST',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Monitoring request failed'
        )
      }

      setMonitoring(data.monitoring)

      // Clear old data when starting
      if (data.monitoring) {
        setLog([])
      }

    } catch (err) {
      console.error('Monitoring error:', err)

      setError(err.message)

    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // GET LIVE BACKEND METRICS
  // ==========================================

  useEffect(() => {
    if (!monitoring) return

    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          `${API_URL}/monitor/metrics`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail || 'Could not fetch metrics'
          )
        }

        // --------------------------------------
        // UPDATE METRICS FROM BACKEND
        // --------------------------------------

        const backendMetrics = data.metrics || {}

        setMetrics({
          cpuUsage:
            backendMetrics.cpuUsage ?? 0,

          memoryUsage:
            backendMetrics.memoryUsage ?? 0,

          fileModRate:
            backendMetrics.fileModRate ?? 0,

          // Backend currently doesn't provide
          // these separately
          fileRenameRate:
            backendMetrics.fileRenameRate ?? 0,

          fileAccessFreq:
            backendMetrics.fileAccessFreq ?? 0,

          entropy:
            backendMetrics.entropy ?? 0,
        })

        // --------------------------------------
        // UPDATE ACTIVITY LOG
        // --------------------------------------

        if (Array.isArray(data.activity)) {
          setLog(data.activity)
        }

        setError(null)

      } catch (err) {
        console.error('Metrics error:', err)

        setError(err.message)
      }
    }

    // Get first sample immediately
    fetchMetrics()

    // Then collect metrics every 2 seconds
    const metricInterval = setInterval(
      fetchMetrics,
      2000
    )

    return () => {
      clearInterval(metricInterval)
    }

  }, [monitoring])

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
                ? 'Monitoring system activity and collecting behavioral data'
                : 'Start monitoring to view live activity'}
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
            ? 'Please wait...'
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
          unit="/min"
        />

        <MetricGauge
          label="Network Connections"
          value={metrics.networkConnections || 0}
          unit=""
        />

        <MetricGauge
          label="Suspicious Processes"
          value={metrics.suspiciousProcesses || 0}
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


          {log.map((event, index) => (

            <div
              key={`${event.id}-${index}`}
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