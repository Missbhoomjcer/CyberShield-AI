import { useState } from 'react'
import ToggleRow from '../components/settings/ToggleRow.jsx'
import './Settings.css'

function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: true,
    weeklySummary: false,
  })

  const [alerts, setAlerts] = useState({
    criticalOnly: false,
    soundAlerts: true,
    autoQuarantine: true,
  })

  const [scanPrefs, setScanPrefs] = useState({
    autoScanDownloads: true,
    deepScan: false,
    sensitivity: 'Balanced',
  })

  return (
    <div className="settings">
      <h1>Settings</h1>
      <p className="page-subtitle">Configure notifications, alerts, and scan behavior</p>

      <div className="settings-grid">
        <div className="panel">
          <h2>Notification Preferences</h2>
          <ToggleRow
            label="Email Notifications"
            description="Receive scan summaries via email"
            checked={notifications.email}
            onChange={(v) => setNotifications((p) => ({ ...p, email: v }))}
          />
          <ToggleRow
            label="Desktop Notifications"
            description="Show alerts as system notifications"
            checked={notifications.desktop}
            onChange={(v) => setNotifications((p) => ({ ...p, desktop: v }))}
          />
          <ToggleRow
            label="Weekly Summary"
            description="Get a weekly protection report"
            checked={notifications.weeklySummary}
            onChange={(v) => setNotifications((p) => ({ ...p, weeklySummary: v }))}
          />
        </div>

        <div className="panel">
          <h2>Alert Settings</h2>
          <ToggleRow
            label="Critical Alerts Only"
            description="Suppress low and medium severity alerts"
            checked={alerts.criticalOnly}
            onChange={(v) => setAlerts((p) => ({ ...p, criticalOnly: v }))}
          />
          <ToggleRow
            label="Sound Alerts"
            description="Play a sound when a threat is detected"
            checked={alerts.soundAlerts}
            onChange={(v) => setAlerts((p) => ({ ...p, soundAlerts: v }))}
          />
          <ToggleRow
            label="Auto-Quarantine"
            description="Automatically quarantine detected threats"
            checked={alerts.autoQuarantine}
            onChange={(v) => setAlerts((p) => ({ ...p, autoQuarantine: v }))}
          />
        </div>

        <div className="panel">
          <h2>Scan Preferences</h2>
          <ToggleRow
            label="Auto-Scan Downloads"
            description="Automatically scan new files in Downloads"
            checked={scanPrefs.autoScanDownloads}
            onChange={(v) => setScanPrefs((p) => ({ ...p, autoScanDownloads: v }))}
          />
          <ToggleRow
            label="Deep Scan Mode"
            description="More thorough analysis, slower scan time"
            checked={scanPrefs.deepScan}
            onChange={(v) => setScanPrefs((p) => ({ ...p, deepScan: v }))}
          />
          <div className="select-row">
            <div>
              <div className="toggle-label">Detection Sensitivity</div>
              <div className="toggle-desc">Higher sensitivity may increase false positives</div>
            </div>
            <select
              className="settings-select"
              value={scanPrefs.sensitivity}
              onChange={(e) => setScanPrefs((p) => ({ ...p, sensitivity: e.target.value }))}
            >
              <option>Conservative</option>
              <option>Balanced</option>
              <option>Aggressive</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings