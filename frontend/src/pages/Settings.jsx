import { useState } from 'react'
import './Settings.css'

function Settings() {
  const [realTimeProtection, setRealTimeProtection] = useState(true)
  const [ransomwareProtection, setRansomwareProtection] = useState(true)
  const [behavioralMonitoring, setBehavioralMonitoring] = useState(true)
  const [networkProtection, setNetworkProtection] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [autoUpdates, setAutoUpdates] = useState(true)

  return (
    <div className="settings-page">

      {/* Header */}
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account and protection preferences.</p>
        </div>
      </div>

      {/* General Settings */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div>
            <h2>General Settings</h2>
            <p>Configure your CyberShield preferences.</p>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <h3>Language</h3>
            <p>Select your preferred application language.</p>
          </div>

          <select className="settings-select" defaultValue="English">
            <option>English</option>
            <option>Hindi</option>
          </select>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <h3>Automatic Updates</h3>
            <p>Keep CyberShield updated automatically.</p>
          </div>

          <button
            className={`toggle ${autoUpdates ? 'on' : ''}`}
            onClick={() => setAutoUpdates(!autoUpdates)}
            aria-label="Toggle automatic updates"
          >
            <span />
          </button>
        </div>
      </section>

      {/* Protection Settings */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div>
            <h2>Protection</h2>
            <p>Manage your security protection modules.</p>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <h3>Real-Time Protection</h3>
            <p>Monitor your device continuously for suspicious activity.</p>
          </div>

          <button
            className={`toggle ${realTimeProtection ? 'on' : ''}`}
            onClick={() => setRealTimeProtection(!realTimeProtection)}
            aria-label="Toggle real-time protection"
          >
            <span />
          </button>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <h3>Ransomware Protection</h3>
            <p>Detect suspicious ransomware-related behavior.</p>
          </div>

          <button
            className={`toggle ${ransomwareProtection ? 'on' : ''}`}
            onClick={() => setRansomwareProtection(!ransomwareProtection)}
            aria-label="Toggle ransomware protection"
          >
            <span />
          </button>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <h3>Behavioral Monitoring</h3>
            <p>Use LSTM-based behavioral analysis to detect threats.</p>
          </div>

          <button
            className={`toggle ${behavioralMonitoring ? 'on' : ''}`}
            onClick={() => setBehavioralMonitoring(!behavioralMonitoring)}
            aria-label="Toggle behavioral monitoring"
          >
            <span />
          </button>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <h3>Network Protection</h3>
            <p>Monitor network activity for suspicious connections.</p>
          </div>

          <button
            className={`toggle ${networkProtection ? 'on' : ''}`}
            onClick={() => setNetworkProtection(!networkProtection)}
            aria-label="Toggle network protection"
          >
            <span />
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div>
            <h2>Notifications</h2>
            <p>Choose how CyberShield should notify you.</p>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <h3>Security Notifications</h3>
            <p>Receive alerts when threats are detected.</p>
          </div>

          <button
            className={`toggle ${notifications ? 'on' : ''}`}
            onClick={() => setNotifications(!notifications)}
            aria-label="Toggle notifications"
          >
            <span />
          </button>
        </div>
      </section>

      {/* Account */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div>
            <h2>Account</h2>
            <p>Manage your CyberShield account information.</p>
          </div>
        </div>

        <div className="account-info">
          <div className="account-avatar">H</div>

          <div className="account-details">
            <h3>Harshita</h3>
            <p>Personal device</p>
            <span>harshita@cybershield.ai</span>
          </div>

          <button className="secondary-button">
            Edit Profile
          </button>
        </div>
      </section>

    </div>
  )
}

export default Settings