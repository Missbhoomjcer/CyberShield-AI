import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◧' },
  { to: '/scan', label: 'Scan Files', icon: '⌁' },
  { to: '/activity-monitor', label: 'Activity Monitor', icon: '◎' },
  { to: '/threats', label: 'Threat Detection', icon: '▲' },
  { to: '/reports', label: 'Reports', icon: '▤' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">◈</span>
        <div>
          <div className="brand-name">CyberShield<span className="brand-accent">-AI</span></div>
          <div className="brand-sub mono">RANSOMWARE &amp; MALWARE DETECTION</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-status">
        <span className="status-dot" />
        <span className="mono">SYSTEM PROTECTED</span>
      </div>
    </aside>
  )
}

export default Sidebar