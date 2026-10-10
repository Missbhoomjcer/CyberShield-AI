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
      status: 'MONITORING',
      changes: 0,
    },
    windows_temp: {
      label: 'Windows TEMP',
      path: 'C:\\Windows\\Temp',
      status: 'MONITORING',
      changes: 0,
    },
    downloads: {
      label: 'Downloads',
      path: '%USERPROFILE%\\Downloads',
      status: 'MONITORING',
      changes: 0,
    },
  })

  const [log, setLog] = useState([])

  const intervalRef = useRef(null)

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
      const lstm = data.lstm || {}
      const threatData = data.threat_decision || {}
      const protectionData = data.protection || {}
      const fileData = data.file_monitoring || {}

      // ====================================================
      // SYSTEM METRICS
      // ====================================================

      setMetrics({
        cpuUsage: activity.cpu_usage ?? 0,
        memoryUsage: activity.memory_usage ?? 0,
        fileModRate: activity.file_change_count ?? 0,
        networkConnections:
          activity.network_connection_count ?? 0,
        suspiciousProcesses:
          activity.suspicious_process_count ?? 0,
      })

      // ====================================================
      // LSTM
      // ====================================================

      setPrediction({
        label: lstm.label ?? 'Unknown',
        probability: Number(
          lstm.probability ?? 0
        ),
        riskPercent: Number(
          lstm.risk_percent ?? 0
        ),
      })

      // ====================================================
      // THREAT DECISION
      // ====================================================

      setThreat({
        level:
          threatData.threat_level ?? 'UNKNOWN',

        action:
          threatData.action ?? 'UNKNOWN',

        overallRisk:
          Number(
            threatData.overall_risk ?? 0
          ),

        confidence:
          threatData.confidence ?? 'UNKNOWN',

        reasons:
          threatData.reasons ?? [],
      })

      // ====================================================
      // PROTECTION
      // ====================================================

      setProtection({
        executed:
          protectionData.executed ?? false,

        message:
          protectionData.message ??
          'No protection action performed.',

        action:
          protectionData.action ?? '',

        quarantined:
          protectionData.quarantined ?? false,
      })

      // ====================================================
      // FILE MONITORING
      //
      // NEW:
      // User TEMP
      // Windows TEMP
      // Downloads
      // ====================================================

      setFileMonitoring({
        user_temp: {
          label:
            fileData.user_temp?.label ??
            'User TEMP',

          path:
            fileData.user_temp?.path ??
            '%TEMP%',

          status:
            fileData.user_temp?.status ??
            'MONITORING',

          changes:
            Number(
              fileData.user_temp?.changes_in_window ?? 0
            ),
        },

        windows_temp: {
          label:
            fileData.windows_temp?.label ??
            'Windows TEMP',

          path:
            fileData.windows_temp?.path ??
            'C:\\Windows\\Temp',

          status:
            fileData.windows_temp?.status ??
            'MONITORING',

          changes:
            Number(
              fileData.windows_temp?.changes_in_window ?? 0
            ),
        },

        downloads: {
          label:
            fileData.downloads?.label ??
            'Downloads',

          path:
            fileData.downloads?.path ??
            '%USERPROFILE%\\Downloads',

          status:
            fileData.downloads?.status ??
            'MONITORING',

          changes:
            Number(
              fileData.downloads?.changes_in_window ?? 0
            ),
        },
      })

      // ====================================================
      // ACTIVITY LOG
      // ====================================================

      const now =
        new Date().toLocaleTimeString()

      const newEvents = []

      newEvents.push({
        id: Date.now(),
        type:
          String(lstm.label).toLowerCase() ===
          'normal'
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

      // ----------------------------------------------------
      // TEMP activity
      // ----------------------------------------------------

      if (
        Number(
          fileData.user_temp?.changes_in_window ?? 0
        ) > 0
      ) {
        newEvents.push({
          id: Date.now() + 1,
          type: 'warning',
          time: now,
          text:
            `User TEMP: ${
              fileData.user_temp.changes_in_window
            } file change(s) detected`,
        })
      }

      if (
        Number(
          fileData.windows_temp?.changes_in_window ?? 0
        ) > 0
      ) {
        newEvents.push({
          id: Date.now() + 2,
          type: 'warning',
          time: now,
          text:
            `Windows TEMP: ${
              fileData.windows_temp.changes_in_window
            } file change(s) detected`,
        })
      }

      if (
        Number(
          fileData.downloads?.changes_in_window ?? 0
        ) > 0
      ) {
        newEvents.push({
          id: Date.now() + 3,
          type: 'info',
          time: now,
          text:
            `Downloads: ${
              fileData.downloads.changes_in_window
            } file change(s) detected`,
        })
      }

      setLog((previous) =>
        [...newEvents, ...previous].slice(0, 20)
      )

    } catch (err) {
      console.error(
        'Live monitoring error:',
        err
      )

      setError(
        err.message ||
        'Unable to fetch live monitoring data.'
      )

    } finally {
      setLoading(false)
    }
  }

  // ========================================================
  // START / STOP MONITORING
  // ========================================================

  const handleMonitoring = async () => {

    if (monitoring) {

      setMonitoring(false)

      if (intervalRef.current) {
        clearInterval(
          intervalRef.current
        )

        intervalRef.current = null
      }

      return
    }

    setMonitoring(true)
    setError(null)
    setLog([])

    await fetchLiveMonitoring()

    intervalRef.current =
      setInterval(
        fetchLiveMonitoring,
        10000
      )
  }

  // ========================================================
  // CLEANUP
  // ========================================================

  useEffect(() => {

    return () => {

      if (intervalRef.current) {

        clearInterval(
          intervalRef.current
        )

      }

    }

  }, [])

  // ========================================================
  // UI
  // ========================================================

  return (
    <div className="activity-monitor">

      <h1>Activity Monitor</h1>

      <p className="page-subtitle">
        Real-time file and process activity
      </p>

      {/* ==================================================
          PROTECTION STATUS
      ================================================== */}

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

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="scan-error">
          {error}
        </div>
      )}

      {/* ==================================================
          THREAT DECISION
      ================================================== */}

      <div className="panel">

        <h2>Threat Decision</h2>

        <div className="result-grid">

          <div className="result-field">

            <span className="field-label">
              Threat Level
            </span>

            <span className="field-valuemono">
              {threat.level}
            </span>

          </div>

          <div className="result-field">

            <span className="field-label">
              Overall Risk
            </span>

            <span className="field-valuemono">
              {threat.overallRisk.toFixed(2)}%
            </span>

          </div>

          <div className="result-field">

            <span className="field-label">
              Action
            </span>

            <span className="field-valuemono">
              {threat.action}
            </span>

          </div>

          <div className="result-field">

            <span className="field-label">
              Confidence
            </span>

            <span className="field-valuemono">
              {threat.confidence}
            </span>

          </div>

        </div>

        {threat.reasons.length > 0 && (

          <div className="activity-log">

            {threat.reasons.map(
              (reason, index) => (

                <div
                  key={index}
                  className="log-entry log-warning"
                >

                  <span className="log-text mono">
                    {reason}
                  </span>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* ==================================================
          BEHAVIORAL DETECTION
      ================================================== */}

      <div className="panel">

        <h2>Behavioral Detection</h2>

        <div className="result-grid">

          <div className="result-field">

            <span className="field-label">
              LSTM Prediction
            </span>

            <span className="field-valuemono">
              {prediction.label}
            </span>

          </div>

          <div className="result-field">

            <span className="field-label">
              Probability
            </span>

            <span className="field-valuemono">
              {(
                prediction.probability * 100
              ).toFixed(2)}%
            </span>

          </div>

          <div className="result-field">

            <span className="field-label">
              Risk
            </span>

            <span className="field-valuemono">
              {prediction.riskPercent.toFixed(2)}%
            </span>

          </div>

        </div>

      </div>

      {/* ==================================================
          LIVE METRICS
      ================================================== */}

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

      {/* ==================================================
          REAL-TIME FILE MONITORING
          NEW SECTION
      ================================================== */}

      <div className="panel">

        <h2>Real-Time File Monitoring</h2>

        <div className="result-grid">

          {/* USER TEMP */}

          <div className="result-field">

            <span className="field-label">
              {fileMonitoring.user_temp.label}
            </span>

            <span className="field-valuemono">
              {fileMonitoring.user_temp.path}
            </span>

            <span className="field-label">
              Status: {fileMonitoring.user_temp.status}
            </span>

            <span className="field-valuemono">
              Changes: {fileMonitoring.user_temp.changes}
            </span>

          </div>

          {/* WINDOWS TEMP */}

          <div className="result-field">

            <span className="field-label">
              {fileMonitoring.windows_temp.label}
            </span>

            <span className="field-valuemono">
              {fileMonitoring.windows_temp.path}
            </span>

            <span className="field-label">
              Status: {fileMonitoring.windows_temp.status}
            </span>

            <span className="field-valuemono">
              Changes: {fileMonitoring.windows_temp.changes}
            </span>

          </div>

          {/* DOWNLOADS */}

          <div className="result-field">

            <span className="field-label">
              {fileMonitoring.downloads.label}
            </span>

            <span className="field-valuemono">
              {fileMonitoring.downloads.path}
            </span>

            <span className="field-label">
              Status: {fileMonitoring.downloads.status}
            </span>

            <span className="field-valuemono">
              Changes: {fileMonitoring.downloads.changes}
            </span>

          </div>

        </div>

      </div>

      {/* ==================================================
          SYSTEM ACTIVITY
      ================================================== */}

      <div className="panel">

        <h2>System Activity</h2>

        <div className="result-grid">

          <div className="result-field">

            <span className="field-label">
              Total Processes
            </span>

            <span className="field-valuemono">
              {metrics.suspiciousProcesses +
                (metrics.networkConnections > 0
                  ? 0
                  : 0)}
            </span>

          </div>

          <div className="result-field">

            <span className="field-label">
              Suspicious Score
            </span>

            <span className="field-valuemono">
              {threat.overallRisk.toFixed(2)}
            </span>

          </div>

          <div className="result-field">

            <span className="field-label">
              Protection
            </span>

            <span className="field-valuemono">
              {protection.executed
                ? protection.action || 'EXECUTED'
                : 'NONE'}
            </span>

          </div>

          <div className="result-field">

            <span className="field-label">
              Quarantine
            </span>

            <span className="field-valuemono">
              {protection.quarantined
                ? 'YES'
                : 'NO'}
            </span>

          </div>

        </div>

      </div>

      {/* ==================================================
          LIVE ACTIVITY LOG
      ================================================== */}

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