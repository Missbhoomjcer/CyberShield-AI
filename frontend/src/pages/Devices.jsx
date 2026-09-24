import { useState } from 'react'
import './Devices.css'

function ComputerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21H16" />
      <path d="M12 17V21" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3L19 6V11C19 15.5 16.2 19.1 12 21C7.8 19.1 5 15.5 5 11V6L12 3Z" />
      <path d="M8.5 12L10.8 14.3L15.5 9.6" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11A8 8 0 0 0 5.2 7" />
      <path d="M5 4V8H9" />
      <path d="M4 13A8 8 0 0 0 18.8 17" />
      <path d="M19 20V16H15" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5V19" />
      <path d="M5 12H19" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12L10 17L19 7" />
    </svg>
  )
}

function Devices() {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    if (refreshing) return

    setRefreshing(true)

    setTimeout(() => {
      setRefreshing(false)
    }, 800)
  }

  return (
    <div className="devices-page">

      {/* HEADER */}
      <div className="devices-header">

        <div>
          <h1>Devices</h1>

          <p>
            Manage and monitor devices protected by CyberShield-AI.
          </p>
        </div>

        <button
          type="button"
          className="devices-refresh-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshIcon />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>

      </div>


      {/* DEVICE SUMMARY */}
      <div className="devices-summary-grid">

        <div className="device-summary-card">

          <div className="device-summary-icon blue">
            <ComputerIcon />
          </div>

          <div>
            <span>Total Devices</span>
            <strong>1</strong>
          </div>

        </div>


        <div className="device-summary-card">

          <div className="device-summary-icon green">
            <ShieldIcon />
          </div>

          <div>
            <span>Protected</span>
            <strong>1</strong>
          </div>

        </div>


        <div className="device-summary-card">

          <div className="device-summary-icon green">
            <CheckIcon />
          </div>

          <div>
            <span>Agent Status</span>
            <strong>Online</strong>
          </div>

        </div>

      </div>


      {/* DEVICE PANEL */}
      <section className="devices-panel">

        <div className="devices-panel-header">

          <div>
            <h2>Protected Devices</h2>

            <p>
              Devices currently registered with your CyberShield-AI account.
            </p>
          </div>

          <button
            type="button"
            className="add-device-button"
          >
            <PlusIcon />
            Add Device
          </button>

        </div>


        {/* DEVICE CARD */}
        <div className="device-card">

          <div className="device-main">

            <div className="device-computer-icon">
              <ComputerIcon />
            </div>

            <div className="device-information">

              <div className="device-name-row">

                <h3>
                  Harshita's Windows PC
                </h3>

                <span className="device-online-badge">
                  <span></span>
                  Online
                </span>

              </div>

              <p className="device-description">
                Windows endpoint protected by CyberShield-AI Agent
              </p>

              <div className="device-meta">

                <span>
                  Device ID: CS-WIN-001
                </span>

                <span>
                  Last seen: Just now
                </span>

                <span>
                  Agent: Connected
                </span>

              </div>

            </div>

          </div>


          <div className="device-security-status">

            <div className="device-security-icon">
              <ShieldIcon />
            </div>

            <div>
              <strong>Protected</strong>
              <span>All protection modules active</span>
            </div>

          </div>

        </div>


        {/* PROTECTION MODULES */}
        <div className="device-modules">

          <h3>
            Protection Modules
          </h3>

          <div className="device-module-grid">

            <div className="device-module">

              <div className="module-check">
                <CheckIcon />
              </div>

              <div>
                <strong>Real-Time Protection</strong>
                <span>Active</span>
              </div>

            </div>


            <div className="device-module">

              <div className="module-check">
                <CheckIcon />
              </div>

              <div>
                <strong>Ransomware Protection</strong>
                <span>Active</span>
              </div>

            </div>


            <div className="device-module">

              <div className="module-check">
                <CheckIcon />
              </div>

              <div>
                <strong>Behavioral Monitoring</strong>
                <span>Active</span>
              </div>

            </div>


            <div className="device-module">

              <div className="module-check">
                <CheckIcon />
              </div>

              <div>
                <strong>AI Threat Detection</strong>
                <span>Active</span>
              </div>

            </div>

          </div>

        </div>


        {/* AGENT INFORMATION */}
        <div className="agent-information">

          <div>
            <span className="agent-label">
              CYBERSHIELD ENDPOINT AGENT
            </span>

            <h3>
              Windows Agent
            </h3>

            <p>
              The endpoint agent continuously monitors system activity,
              detects suspicious behavior, and communicates security
              events with CyberShield-AI.
            </p>
          </div>

          <div className="agent-status">

            <span className="agent-status-dot"></span>

            <div>
              <strong>Connected</strong>
              <span>Last heartbeat: Just now</span>
            </div>

          </div>

        </div>

      </section>


      {/* FOOTER NOTE */}
      <div className="devices-note">

        <ShieldIcon />

        <span>
          Device registration, agent status, licensing, and device
          management will be synchronized with the CyberShield-AI backend.
        </span>

      </div>

    </div>
  )
}

export default Devices