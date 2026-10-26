import { useState, useEffect, useRef } from 'react'
import MetricGauge from '../components/activity/MetricGauge.jsx'
import './ActivityMonitor.css'

const API_URL = 'http://127.0.0.1:8000'
const MONITORING_KEY = 'cybershield_monitoring_active'

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

  const [threat, setThreat] = useState({
    level: 'UNKNOWN',
    action: 'UNKNOWN',
    overallRisk: 0,
    confidence: 'UNKNOWN',
    reasons: [],
  })

  const [protection, setProtection] = useState({
    executed: false,
    message: 'No protection action performed.',
    action: '',
    quarantined: false,
  })

  const [fileMonitoring, setFileMonitoring] = useState({
    user_temp: {
      label: 'User TEMP',
      path: '%TEMP%',
      status: 'NOT STARTED',
      changes: 0,
    },
    windows_temp: {
      label: 'Windows TEMP',
      path: 'C:\\Windows\\Temp',
      status: 'NOT STARTED',
      changes: 0,
    },
    downloads: {
      label: 'Downloads',
      path: '%USERPROFILE%\\Downloads',
      status: 'NOT STARTED',
      changes: 0,
    },
  })

  const [log, setLog] = useState([])
  const intervalRef = useRef(null)
  const mountedRef = useRef(true)
  const requestInProgressRef = useRef(false)

  const publishMonitoringStatus = (active) => {
    sessionStorage.setItem(MONITORING_KEY, String(active))

    window.dispatchEvent(
      new Event('cybershield-monitoring-status')
    )
  }

  const stopMonitoring = () => {
    setMonitoring(false)
    publishMonitoringStatus(false)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const fetchLiveMonitoring = async () => {
    if (requestInProgressRef.current) {
      return false
    }

    requestInProgressRef.current = true

    try {
      const response = await fetch(
        `${API_URL}/monitoring/live?observations=10&interval=1`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Live monitoring failed.'
        )
      }

      const activity = data.latest_activity || {}
      const lstm = data.lstm || {}
      const threatData = data.threat_decision || {}
      const protectionData = data.protection || {}
      const fileData = data.file_monitoring || {}

      if (!mountedRef.current) {
        return false
      }

      setMetrics({
        cpuUsage: Number(activity.cpu_usage ?? 0),
        memoryUsage: Number(activity.memory_usage ?? 0),
        fileModRate: Number(activity.file_change_count ?? 0),
        networkConnections: Number(
          activity.network_connection_count ?? 0
        ),
        suspiciousProcesses: Number(
          activity.suspicious_process_count ?? 0
        ),
      })

      setPrediction({
        label: lstm.label ?? 'Unknown',
        probability: Number(lstm.probability ?? 0),
        riskPercent: Number(lstm.risk_percent ?? 0),
      })

      setThreat({
        level: threatData.threat_level ?? 'UNKNOWN',
        action: threatData.action ?? 'UNKNOWN',
        overallRisk: Number(threatData.overall_risk ?? 0),
        confidence: threatData.confidence ?? 'UNKNOWN',
        reasons: Array.isArray(threatData.reasons)
          ? threatData.reasons
          : [],
      })

      setProtection({
        executed: protectionData.executed ?? false,
        message:
          protectionData.message ??
          'No protection action performed.',
        action: protectionData.action ?? '',
        quarantined: protectionData.quarantined ?? false,
      })

      const makeFileStatus = (
        file,
        label,
        path
      ) => ({
        label: file?.label ?? label,
        path: file?.path ?? path,
        status: file?.status ?? 'UNKNOWN',
        changes: Number(file?.changes_in_window ?? 0),
      })

      setFileMonitoring({
        user_temp: makeFileStatus(
          fileData.user_temp,
          'User TEMP',
          '%TEMP%'
        ),
        windows_temp: makeFileStatus(
          fileData.windows_temp,
          'Windows TEMP',
          'C:\\Windows\\Temp'
        ),
        downloads: makeFileStatus(
          fileData.downloads,
          'Downloads',
          '%USERPROFILE%\\Downloads'
        ),
      })

      const now = new Date().toLocaleTimeString()
      const newEvents = []

      newEvents.push({
        id: Date.now(),
        type:
          String(lstm.label ?? '').toLowerCase() === 'normal'
            ? 'info'
            : 'warning',
        time: now,
        text:
          `LSTM: ${lstm.label ?? 'Unknown'} | ` +
          `Risk: ${Number(
            lstm.risk_percent ?? 0
          ).toFixed(2)}% | ` +
          `Suspicious processes: ${
            activity.suspicious_process_count ?? 0
          }`,
      })

      const monitoredFolders = [
        ['User TEMP', fileData.user_temp],
        ['Windows TEMP', fileData.windows_temp],
        ['Downloads', fileData.downloads],
      ]

      monitoredFolders.forEach(([name, file], index) => {
        const changes = Number(file?.changes_in_window ?? 0)

        if (changes > 0) {
          newEvents.push({
            id: Date.now() + index + 1,
            type: 'warning',
            time: now,
            text: `${name}: ${changes} file change(s) detected`,
          })
        }
      })

      setLog((previous) =>
        [...newEvents, ...previous].slice(0, 20)
      )

      setError(null)
      return true
    } catch (err) {
      console.error('Live monitoring error:', err)

      if (mountedRef.current) {
        setError(
          err.message ||
          'Unable to fetch live monitoring data.'
        )
      }

      return false
    } finally {
      requestInProgressRef.current = false
    }
  }

  const handleMonitoring = async () => {
    if (loading) return

    if (monitoring) {
      stopMonitoring()
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    setLog([])

    // The UI remains inactive until the first request succeeds.
    const success = await fetchLiveMonitoring()

    if (!mountedRef.current) return

    if (!success) {
      stopMonitoring()
      setLoading(false)
      return
    }

    setMonitoring(true)
    publishMonitoringStatus(true)

    intervalRef.current = setInterval(async () => {
      if (!mountedRef.current) return

      const requestSucceeded = await fetchLiveMonitoring()

      // If the live API stops responding, do not keep showing
      // monitoring as active.
      if (!requestSucceeded && mountedRef.current) {
        stopMonitoring()
      }
    }, 10000)

    setLoading(false)
  }

  useEffect(() => {
    mountedRef.current = true

    // Never assume monitoring is active when this page loads.
    publishMonitoringStatus(false)

    return () => {
      mountedRef.current = false

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      sessionStorage.setItem(MONITORING_KEY, 'false')
      window.dispatchEvent(
        new Event('cybershield-monitoring-status')
      )
    }
  }, [])

  return (
    <div className="activity-monitor">
      <h1>Activity Monitor</h1>

      <p className="page-subtitle">
        Real-time file and process activity
      </p>

      {/* Protection Status */}

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
                ? 'Real-Time Monitoring Active'
                : 'Real-Time Monitoring Inactive'}
            </div>

            <div className="protection-sub">
              {monitoring
                ? 'Live data is being collected and analyzed.'
                : 'Start monitoring to collect live system activity.'}
            </div>
          </div>
        </div>

        <button
          className={`btn-toggle${monitoring ? ' stop' : ''}`}
          onClick={handleMonitoring}
          disabled={loading}
        >
          {loading
            ? 'Connecting...'
            : monitoring
              ? 'Stop Monitoring'
              : 'Start Monitoring'}
        </button>
      </div>

      {error && (
        <div className="scan-error" role="alert">
          {error}
        </div>
      )}

      {/* Threat Decision */}

      <div className="panel">
        <h2>Threat Decision</h2>

        <div className="result-grid">
          <ResultField
            label="Threat Level"
            value={threat.level}
          />

          <ResultField
            label="Overall Risk"
            value={`${threat.overallRisk.toFixed(2)}%`}
          />

          <ResultField
            label="Action"
            value={threat.action}
          />

          <ResultField
            label="Confidence"
            value={threat.confidence}
          />
        </div>

        {threat.reasons.length > 0 && (
          <div className="activity-log">
            {threat.reasons.map((reason, index) => (
              <div
                key={index}
                className="log-entry log-warning"
              >
                <span className="log-text mono">
                  {reason}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Behavioral Detection */}

      <div className="panel">
        <h2>Behavioral Detection</h2>

        <div className="result-grid">
          <ResultField
            label="LSTM Prediction"
            value={prediction.label}
          />

          <ResultField
            label="Probability"
            value={`${(
              prediction.probability * 100
            ).toFixed(2)}%`}
          />

          <ResultField
            label="Risk"
            value={`${prediction.riskPercent.toFixed(2)}%`}
          />
        </div>
      </div>

      {/* Live Metrics */}

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

      {/* File Monitoring */}

      <div className="panel">
        <h2>Real-Time File Monitoring</h2>

        <div className="result-grid">
          {Object.entries(fileMonitoring).map(
            ([key, file]) => (
              <div className="result-field" key={key}>
                <span className="field-label">
                  {file.label}
                </span>

                <span className="field-valuemono">
                  {file.path}
                </span>

                <span className="field-label">
                  Status: {file.status}
                </span>

                <span className="field-valuemono">
                  Changes: {file.changes}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* System Activity */}

      <div className="panel">
        <h2>System Activity</h2>

        <div className="result-grid">
          <ResultField
            label="Suspicious Processes"
            value={metrics.suspiciousProcesses}
          />

          <ResultField
            label="Suspicious Score"
            value={threat.overallRisk.toFixed(2)}
          />

          <ResultField
            label="Protection Action"
            value={
              protection.executed
                ? protection.action || 'EXECUTED'
                : 'NONE'
            }
          />

          <ResultField
            label="Quarantine"
            value={protection.quarantined ? 'YES' : 'NO'}
          />
        </div>

        <p>{protection.message}</p>
      </div>

      {/* Live Activity Log */}

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

function ResultField({ label, value }) {
  return (
    <div className="result-field">
      <span className="field-label">{label}</span>

      <span className="field-valuemono">
        {value}
      </span>
    </div>
  )
}

export default ActivityMonitor