import { useState, useMemo } from 'react'
import { getDetectedThreats } from '../data/dummyData.js'
import SeverityBadge from '../components/threats/SeverityBadge.jsx'
import './ThreatDetection.css'

const FILTERS = ['All', 'Critical', 'High', 'Medium', 'Low']

function ThreatDetection() {
  const [filter, setFilter] = useState('All')
  const threats = getDetectedThreats()

  const filtered = useMemo(
    () => filter === 'All' ? threats : threats.filter((t) => t.severity === filter),
    [filter, threats]
  )

  return (
    <div className="threat-detection">
      <h1>Threat Detection</h1>
      <p className="page-subtitle">All detected threats identified by the AI model</p>

      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-chip${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>File / Process Name</th>
              <th>Detection Type</th>
              <th>Severity</th>
              <th>Confidence</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td className="mono">{t.name}</td>
                <td>{t.type}</td>
                <td><SeverityBadge level={t.severity} /></td>
                <td className="mono">{t.confidence}%</td>
                <td className="mono">{t.time}</td>
                <td>{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">No threats match this filter.</div>
        )}
      </div>
    </div>
  )
}

export default ThreatDetection