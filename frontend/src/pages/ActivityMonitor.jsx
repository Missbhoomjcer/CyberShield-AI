import { useState, useEffect, useRef } from 'react'
import { getRandomActivityEvent, getLiveMetrics } from '../data/dummyData.js'
import MetricGauge from '../components/activity/MetricGauge.jsx'
import './ActivityMonitor.css'

function ActivityMonitor() {
  const [monitoring, setMonitoring] = useState(false)
  const [log, setLog] = useState([])
  const [metrics, setMetrics] = useState(getLiveMetrics())
  const logEndRef = useRef(null)

  useEffect(() => {
    if (!monitoring) return

    const eventInterval = setInterval(() => {
      setLog((prev) => [getRandomActivityEvent(), ...prev].slice(0, 30))
    }, 1500)

    const metricInterval = setInterval(() => {
      setMetrics(getLiveMetrics())
    }, 2000)

    return () => {
      clearInterval(eventInterval)
      clearInterval(metricInterval)
    }
  }, [monitoring])

  return (
    <div className="activity-monitor">
      <h1>Activity Monitor</h1>
      <p className="page-subtitle">Real-time file and process activity (frontend preview — not yet connected to backend)</p>

      <div className="panel protection-panel">
        <div className="protection-status">
          <span className={`status-dot-large${monitoring ? ' active' : ''}`} />
          <div>
            <div className="protection-title">
              {monitoring ? 'Real-Time Protection Active' : 'Real-Time Protection Stopped'}
            </div>
            <div className="protection-sub">
              {monitoring ? 'Monitoring file system and process activity' : 'Start monitoring to view live activity'}
            </div>
          </div>
        </div>
        <button
          className={`btn-toggle${monitoring ? ' stop' : ''}`}
          onClick={() => setMonitoring((m) => !m)}
        >
          {monitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
      </div>

      <div className="metric-grid">
        <MetricGauge label="CPU Usage" value={metrics.cpuUsage} unit="%" />
        <MetricGauge label="File Modification Rate" value={metrics.fileModRate} unit="/min" />
        <MetricGauge label="File Rename Rate" value={metrics.fileRenameRate} unit="/min" />
        <MetricGauge label="File Access Frequency" value={metrics.fileAccessFreq} unit="/min" />
        <MetricGauge label="Entropy" value={metrics.entropy} unit="" />
      </div>

      <div className="panel">
        <h2>Live Activity Log</h2>
        <div className="activity-log">
          {log.length === 0 && (
            <div className="empty-state">
              {monitoring ? 'Waiting for activity...' : 'Start monitoring to see live events here.'}
            </div>
          )}
          {log.map((event) => (
            <div key={event.id} className={`log-entry log-${event.type}`}>
              <span className="log-time mono">{event.time}</span>
              <span className="log-text mono">{event.text}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  )
}

export default ActivityMonitor