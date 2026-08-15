import './ToggleRow.css'

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="toggle-row">
      <div>
        <div className="toggle-label">{label}</div>
        {description && <div className="toggle-desc">{description}</div>}
      </div>
      <button
        className={`toggle-switch${checked ? ' on' : ''}`}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
      >
        <span className="toggle-knob" />
      </button>
    </div>
  )
}

export default ToggleRow