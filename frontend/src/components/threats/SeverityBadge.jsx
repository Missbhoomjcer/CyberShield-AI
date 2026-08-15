import './SeverityBadge.css'

function SeverityBadge({ level }) {
  return <span className={`sev-badge sev-${level.toLowerCase()}`}>{level}</span>
}

export default SeverityBadge