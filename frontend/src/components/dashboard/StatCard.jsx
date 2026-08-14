import './StatCard.css'

function StatCard({ label, value, unit, accent = 'cyan' }) {
  return (
    <div className={`stat-card accent-${accent}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value mono">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
    </div>
  )
}

export default StatCard