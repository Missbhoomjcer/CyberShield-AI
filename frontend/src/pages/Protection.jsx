import { useState } from 'react'
import './Protection.css'

const initialModules = [
  {
    id: 'realtime',
    title: 'Real-Time Protection',
    description: 'Continuously monitors files and system activity',
    type: 'realtime',
  },
  {
    id: 'ransomware',
    title: 'Ransomware Protection',
    description: 'Detects and protects against ransomware behavior',
    type: 'ransomware',
  },
  {
    id: 'behavioral',
    title: 'Behavioral Monitoring',
    description: 'LSTM-based behavioral analysis is active',
    type: 'behavioral',
  },
  {
    id: 'static',
    title: 'AI Threat Detection',
    description: 'XGBoost static analysis for suspicious files',
    type: 'ai',
  },
  {
    id: 'network',
    title: 'Network Protection',
    description: 'Monitors network activity for suspicious behavior',
    type: 'network',
  },
]

function ModuleIcon({ type }) {
  if (type === 'realtime') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M12 3l7 3v5c0 4.8-3 8.2-7 10-4-1.8-7-5.2-7-10V6l7-3z" />
        <path d="M8.5 12l2.2 2.2 4.8-5" />
      </svg>
    )
  }

  if (type === 'ransomware') {
    return (
      <svg viewBox="0 0 24 24">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 7h6M9 11h6M9 15h3" />
      </svg>
    )
  }

  if (type === 'behavioral') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M3 12h4l2-6 4 12 2-6h6" />
      </svg>
    )
  }

  if (type === 'ai') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        <path d="M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2 2.2 3 4.9 3 8s-1 5.8-3 8c-2-2.2-3-4.9-3-8s1-5.8 3-8z" />
    </svg>
  )
}

function Protection() {
  const [modules, setModules] = useState(
    initialModules.map((module) => ({
      ...module,
      enabled: true,
    })),
  )

  const toggleModule = (id) => {
    setModules((current) =>
      current.map((module) =>
        module.id === id
          ? { ...module, enabled: !module.enabled }
          : module,
      ),
    )
  }

  const enabledCount = modules.filter(
    (module) => module.enabled,
  ).length

  const allEnabled = enabledCount === modules.length

  return (
    <div className="protection-page">

      {/* =================================
          HEADER
      ================================= */}

      <div className="protection-header">

        <div>
          <h1>Protection</h1>

          <p>
            Manage your CyberShield security modules.
          </p>
        </div>

        <div
          className={`protection-overall-status ${
            allEnabled ? 'status-active' : 'status-limited'
          }`}
        >
          <span className="overall-dot" />

          <span>
            {allEnabled
              ? 'Protection Active'
              : 'Protection Limited'}
          </span>
        </div>

      </div>

      {/* =================================
          PROTECTION BANNER
      ================================= */}

      <section className="protection-banner">

        <div className="protection-banner-icon">

          <svg viewBox="0 0 24 24">
            <path d="M12 3l7 3v5c0 4.8-3 8.2-7 10-4-1.8-7-5.2-7-10V6l7-3z" />
            <path d="M8.5 12l2.2 2.2 4.8-5" />
          </svg>

        </div>

        <div className="protection-banner-content">

          <span className="protection-label">
            {allEnabled
              ? 'YOU ARE PROTECTED'
              : 'PROTECTION LIMITED'}
          </span>

          <h2>
            {allEnabled
              ? 'Your device is secure'
              : 'Some protection modules are disabled'}
          </h2>

          <p>
            CyberShield-AI is monitoring your device for
            ransomware and malicious activity.
          </p>

        </div>

        <div className="protection-banner-status">

          <strong>
            {enabledCount}/{modules.length}
          </strong>

          <span>
            Modules active
          </span>

        </div>

      </section>

      {/* =================================
          PROTECTION SETTINGS
      ================================= */}

      <section className="protection-section">

        <div className="section-heading">

          <div>
            <h2>Protection Settings</h2>

            <p>
              Manage your active security modules.
            </p>
          </div>

          <div className="module-count">
            {enabledCount}/{modules.length} Active
          </div>

        </div>

        <div className="protection-card">

          {modules.map((module) => (

            <div
              className={`protection-module ${
                !module.enabled
                  ? 'module-disabled'
                  : ''
              }`}
              key={module.id}
            >

              <div
                className={`module-icon module-${module.type}`}
              >
                <ModuleIcon type={module.type} />
              </div>

              <div className="module-info">

                <h3>{module.title}</h3>

                <p>{module.description}</p>

              </div>

              <div className="module-status">

                <span
                  className={
                    module.enabled
                      ? 'module-status-text active'
                      : 'module-status-text disabled'
                  }
                >
                  {module.enabled
                    ? 'Active'
                    : 'Disabled'}
                </span>

                <button
                  type="button"
                  className={`toggle ${
                    module.enabled
                      ? 'toggle-on'
                      : ''
                  }`}
                  onClick={() =>
                    toggleModule(module.id)
                  }
                  aria-label={`Toggle ${module.title}`}
                  aria-pressed={module.enabled}
                >
                  <span className="toggle-knob" />
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* =================================
          SECURITY INFORMATION
      ================================= */}

      <section className="protection-info-grid">

        <div className="info-card">

          <div className="info-card-icon ai-info">
            AI
          </div>

          <div>
            <h3>AI-Powered Detection</h3>

            <p>
              XGBoost analyzes files using 72 static
              features while LSTM evaluates behavioral
              activity sequences.
            </p>
          </div>

        </div>

        <div className="info-card">

          <div className="info-card-icon response-info">

            <svg viewBox="0 0 24 24">
              <path d="M5 12l4 4 10-10" />
            </svg>

          </div>

          <div>
            <h3>Automatic Response</h3>

            <p>
              Detected threats can be blocked, contained
              and moved to quarantine through the
              protection engine.
            </p>
          </div>

        </div>

      </section>

    </div>
  )
}

export default Protection