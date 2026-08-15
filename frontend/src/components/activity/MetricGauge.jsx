import './MetricGauge.css'

function MetricGauge({ label, value, unit }) {
  return (
    <div className="metric-gauge">
      <div className="metric-label">{label}</div>
      <div className="metric-value mono">
        {value}<span className="metric-unit">{unit}</span>
      </div>
    </div>
  )
}

export default MetricGauge