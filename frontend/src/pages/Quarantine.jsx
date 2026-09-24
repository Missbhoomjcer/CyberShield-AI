import { useState } from 'react'
import './Quarantine.css'

const quarantinedItems = [
  {
    id: 1,
    filename: 'sample.exe',
    threat: 'Malware',
    severity: 'High',
    date: 'Today, 10:42 AM',
    size: '245 KB',
    status: 'Quarantined',
  },
]

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3L19 6V11C19 15.5 16.2 19.1 12 21C7.8 19.1 5 15.5 5 11V6L12 3Z" />
      <path d="M8.5 12L10.8 14.3L15.5 9.6" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3H14L19 8V21H6V3Z" />
      <path d="M14 3V8H19" />
      <path d="M9 12H16" />
      <path d="M9 16H16" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20 11A8 8 0 0 0 5.2 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5 4V8H9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13A8 8 0 0 0 18.8 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M19 20V16H15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Quarantine() {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    if (refreshing) return

    setRefreshing(true)

    setTimeout(() => {
      setRefreshing(false)
    }, 800)
  }

  const handleView = (item) => {
    window.alert(`Quarantined file: ${item.filename}`)
  }

  return (
    <div className="quarantine-page">

      <div className="quarantine-header">
        <div>
          <h1>Quarantine</h1>
          <p>
            Safely isolated files detected as potential security threats.
          </p>
        </div>

        <div className="quarantine-status">
          <span className="quarantine-status-dot"></span>
          Protection Active
        </div>
      </div>


      <section className="quarantine-banner">

        <div className="quarantine-banner-icon">
          <ShieldIcon />
        </div>

        <div className="quarantine-banner-content">
          <span className="quarantine-banner-label">
            SAFE &amp; ISOLATED
          </span>

          <h2>
            Quarantined items cannot harm your device
          </h2>

          <p>
            CyberShield-AI isolates suspicious files so they cannot
            execute or affect your system.
          </p>
        </div>

        <div className="quarantine-count">
          <strong>{quarantinedItems.length}</strong>
          <span>Items isolated</span>
        </div>

      </section>


      <section className="quarantine-panel">

        <div className="quarantine-panel-header">

          <div>
            <h2>Quarantined Items</h2>
            <p>
              Files that have been isolated by CyberShield-AI.
            </p>
          </div>

          <button
            type="button"
            className="quarantine-refresh-button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshIcon />

            <span>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>

        </div>


        {quarantinedItems.length > 0 ? (

          <div className="quarantine-table-container">

            <table className="quarantine-table">

              <thead>
                <tr>
                  <th>File</th>
                  <th>Threat</th>
                  <th>Severity</th>
                  <th>Size</th>
                  <th>Detected</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {quarantinedItems.map((item) => (

                  <tr key={item.id}>

                    <td>
                      <div className="quarantine-file">

                        <div className="quarantine-file-icon">
                          <FileIcon />
                        </div>

                        <div className="quarantine-file-info">
                          <strong>{item.filename}</strong>
                          <span>Isolated file</span>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="quarantine-threat">
                        {item.threat}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`quarantine-severity ${item.severity.toLowerCase()}`}
                      >
                        {item.severity}
                      </span>
                    </td>

                    <td>{item.size}</td>

                    <td>{item.date}</td>

                    <td>
                      <span className="quarantine-status-badge">
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="quarantine-view-button"
                        onClick={() => handleView(item)}
                      >
                        View
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="quarantine-empty">

            <div className="quarantine-empty-icon">
              <ShieldIcon />
            </div>

            <h3>No quarantined items</h3>

            <p>
              Files isolated by CyberShield-AI will appear here.
            </p>

          </div>

        )}


        <div className="quarantine-footer">
          Quarantined files are isolated from normal system activity.
        </div>

      </section>

    </div>
  )
}

export default Quarantine