import { NavLink } from 'react-router-dom'
import './Sidebar.css'

function Icon({ name }) {
  const icons = {
    dashboard: (
      <svg viewBox="0 0 24 24">
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    ),

    scan: (
      <svg viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="6" />
        <path d="M16 16l4 4" />
        <path d="M8 11h6" />
        <path d="M11 8v6" />
      </svg>
    ),

    protection: (
      <svg viewBox="0 0 24 24">
        <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),

    threats: (
      <svg viewBox="0 0 24 24">
        <path d="M12 4l8 15H4L12 4z" />
        <path d="M12 9v4" />
        <circle cx="12" cy="16" r="0.7" />
      </svg>
    ),

    quarantine: (
      <svg viewBox="0 0 24 24">
        <rect x="4" y="6" width="16" height="14" rx="2" />
        <path d="M8 6V4h8v2" />
        <path d="M9 10v6M12 10v6M15 10v6" />
      </svg>
    ),

    ai: (
      <svg viewBox="0 0 24 24">
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),

    devices: (
      <svg viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </svg>
    ),

    reports: (
      <svg viewBox="0 0 24 24">
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 16h6M9 10h2" />
      </svg>
    ),

    subscription: (
      <svg viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
        <path d="M7 15h4" />
      </svg>
    ),

    settings: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 000-6l-1.1-.4-.4-1.1.5-1.1a1.7 1.7 0 00-2.4-2.4l-1.1.5-1.1-.4L13.4 3a1.7 1.7 0 00-6 0L7 4.1l-1.1.4-1.1-.5a1.7 1.7 0 00-2.4 2.4l.5 1.1-.4 1.1L1.4 9a1.7 1.7 0 000 6l1.1.4.4 1.1-.5 1.1a1.7 1.7 0 002.4 2.4l1.1-.5 1.1.4.4 1.1a1.7 1.7 0 006 0l.4-1.1 1.1-.4 1.1.5a1.7 1.7 0 002.4-2.4l-.5-1.1.4-1.1 1.1-.4z" />
      </svg>
    )
  }

  return <span className="sidebar-icon">{icons[name]}</span>
}

const protectionItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { path: '/scan', label: 'Scan', icon: 'scan' },
  { path: '/protection', label: 'Protection', icon: 'protection' },
  { path: '/threats', label: 'Threats', icon: 'threats' },
  { path: '/quarantine', label: 'Quarantine', icon: 'quarantine' },
  { path: '/ai-security', label: 'AI Security', icon: 'ai' }
]

const managementItems = [
  { path: '/devices', label: 'Devices', icon: 'devices' },
  { path: '/reports', label: 'Reports', icon: 'reports' },
  { path: '/subscription', label: 'Subscription', icon: 'subscription' },
  { path: '/settings', label: 'Settings', icon: 'settings' }
]

function Sidebar() {
  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <svg viewBox="0 0 48 48">
            <path
              d="M24 4L40 10v11c0 10.5-6.7 18.4-16 23C14.7 39.4 8 31.5 8 21V10L24 4z"
              fill="white"
              stroke="#176ef5"
              strokeWidth="2.5"
            />
            <path
              d="M16 24l5 5 11-12"
              fill="none"
              stroke="#16b66a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="brand-text">
          <h2>CyberShield-AI</h2>
          <span>SMART ENDPOINT PROTECTION</span>
        </div>
      </div>

      <div className="sidebar-content">

        {/* Protection */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">
            PROTECTION
          </div>

          <nav className="sidebar-nav">
            {protectionItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Management */}
        <div className="sidebar-section management-section">
          <div className="sidebar-section-title">
            MANAGEMENT
          </div>

          <nav className="sidebar-nav">
            {managementItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

      </div>

      {/* Bottom */}
      <div className="sidebar-bottom">

        <div className="protected-box">
          <div className="protected-icon">
            <svg viewBox="0 0 24 24">
              <path
                d="M5 12l4 4 10-10"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <strong>Protected</strong>
            <span>Your device is secure</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            H
          </div>

          <div className="user-info">
            <strong>Harshita</strong>
            <span>Personal device</span>
          </div>

          <span className="user-status"></span>
        </div>

      </div>

    </aside>
  )
}

export default Sidebar