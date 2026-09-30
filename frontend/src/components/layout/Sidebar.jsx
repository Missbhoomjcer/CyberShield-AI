import { NavLink } from 'react-router-dom'

import { useLanguage } from '../../context/LanguageContext.jsx'

import './Sidebar.css'


function Sidebar() {

  const { t } = useLanguage()


  return (

    <aside className="sidebar">


      {/* =====================================================
          BRAND
          ===================================================== */}

      <div className="sidebar-brand">

        <div className="sidebar-brand-icon">

          <svg
            viewBox="0 0 48 52"
            aria-hidden="true"
          >

            <path
              d="M24 2L43 9v13c0 12-7.8 22.1-19 27C12.8 44.1 5 34 5 22V9L24 2Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />

            <path
              d="M15 25l6 6 12-13"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

          </svg>

        </div>


        <div className="sidebar-brand-text">

          <strong>
            CyberShield-AI
          </strong>

          <span>
            SMART ENDPOINT PROTECTION
          </span>

        </div>

      </div>


      {/* =====================================================
          PROTECTION
          ===================================================== */}

      <div className="sidebar-section">

        <div className="sidebar-section-title">
          PROTECTION
        </div>


        <SidebarItem
          to="/"
          label={t('dashboard')}
          icon="dashboard"
        />

        <SidebarItem
          to="/scan"
          label={t('scan')}
          icon="scan"
        />

        <SidebarItem
          to="/activity-monitor"
          label={t('realTimeMonitoring')}
          icon="monitor"
        />

        <SidebarItem
          to="/protection"
          label={t('protection')}
          icon="shield"
        />

        <SidebarItem
          to="/threats"
          label={t('threats')}
          icon="threat"
        />

        <SidebarItem
          to="/quarantine"
          label={t('quarantine')}
          icon="quarantine"
        />

        <SidebarItem
          to="/ai-security"
          label={t('aiSecurity')}
          icon="ai"
        />

      </div>


      {/* =====================================================
          MANAGEMENT
          ===================================================== */}

      <div className="sidebar-section">

        <div className="sidebar-section-title">
          {t('management')}
        </div>


        <SidebarItem
          to="/devices"
          label={t('devices')}
          icon="device"
        />

        <SidebarItem
          to="/windows-agent"
          label={t('windowsAgent')}
          icon="windows"
        />

        <SidebarItem
          to="/reports"
          label={t('reports')}
          icon="reports"
        />

        <SidebarItem
          to="/subscription"
          label={t('subscription')}
          icon="subscription"
        />

        <SidebarItem
          to="/settings"
          label={t('settings')}
          icon="settings"
        />

      </div>


      {/* =====================================================
          BOTTOM STATUS
          ===================================================== */}

      <div className="sidebar-bottom">


        {/* PROTECTION STATUS */}

        <div className="sidebar-protection-status">

          <div className="sidebar-status-icon">

            <svg viewBox="0 0 24 24">

              <path
                d="M5 12l4 4 10-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

            </svg>

          </div>


          <div>

            <strong>
              {t('protected')}
            </strong>

            <span>
              {t('deviceSecure')}
            </span>

          </div>

        </div>


        {/* USER */}

        <div className="sidebar-user">

          <div className="sidebar-user-avatar">
            H
          </div>


          <div className="sidebar-user-info">

            <strong>
              Harshita
            </strong>

            <span>
              {t('personalDevice')}
            </span>

          </div>


          <span className="sidebar-user-online"></span>

        </div>

      </div>

    </aside>

  )
}


/* =========================================================
   SIDEBAR ITEM
   ========================================================= */

function SidebarItem({
  to,
  label,
  icon
}) {

  return (

    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `sidebar-item ${
          isActive ? 'active' : ''
        }`
      }
    >

      <SidebarIcon type={icon} />

      <span>
        {label}
      </span>

    </NavLink>

  )
}


/* =========================================================
   ICONS
   ========================================================= */

function SidebarIcon({ type }) {

  if (type === 'dashboard') {

    return (
      <svg viewBox="0 0 24 24">

        <rect
          x="4"
          y="4"
          width="6"
          height="6"
          rx="1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />

        <rect
          x="14"
          y="4"
          width="6"
          height="6"
          rx="1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />

        <rect
          x="4"
          y="14"
          width="6"
          height="6"
          rx="1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />

        <rect
          x="14"
          y="14"
          width="6"
          height="6"
          rx="1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />

      </svg>
    )
  }


  if (type === 'scan') {

    return (
      <svg viewBox="0 0 24 24">

        <circle
          cx="10.5"
          cy="10.5"
          r="5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />

        <path
          d="M15 15l5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

      </svg>
    )
  }


  if (type === 'monitor') {

    return (
      <svg viewBox="0 0 24 24">

        <circle
          cx="12"
          cy="12"
          r="7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />

        <circle
          cx="12"
          cy="12"
          r="2"
          fill="currentColor"
        />

        <path
          d="M12 2v3M12 19v3M2 12h3M19 12h3"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

      </svg>
    )
  }


  if (type === 'shield') {

    return (
      <svg viewBox="0 0 24 24">

        <path
          d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />

        <path
          d="M9 12l2 2 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

      </svg>
    )
  }


  if (type === 'threat') {

    return (
      <svg viewBox="0 0 24 24">

        <path
          d="M12 4l9 16H3L12 4z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        <path
          d="M12 9v5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        <circle
          cx="12"
          cy="17"
          r="0.8"
          fill="currentColor"
        />

      </svg>
    )
  }


  if (type === 'quarantine') {

    return (
      <svg viewBox="0 0 24 24">

        <path
          d="M5 7h14v13H5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />

        <path
          d="M8 7V4h8v3M9 11v5M12 11v5M15 11v5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

      </svg>
    )
  }


  if (type === 'ai') {

    return (
      <svg viewBox="0 0 24 24">

        <circle
          cx="12"
          cy="12"
          r="7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />

        <path
          d="M9 15l2-6 2 6M10 13h3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

      </svg>
    )
  }


  if (type === 'device') {

    return (
      <svg viewBox="0 0 24 24">

        <rect
          x="4"
          y="4"
          width="16"
          height="12"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />

        <path
          d="M8 20h8M12 16v4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

      </svg>
    )
  }


  if (type === 'windows') {

    return (
      <svg viewBox="0 0 24 24">

        <path
          d="M4 5l7-1v7H4V5zM13 3.7l7-1.1v8.4h-7V3.7zM4 13h7v7l-7-1V13zM13 13h7v8.4l-7-1.1V13z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

      </svg>
    )
  }


  if (type === 'reports') {

    return (
      <svg viewBox="0 0 24 24">

        <path
          d="M6 3h9l3 3v15H6V3z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        <path
          d="M9 11h6M9 15h6M9 7h3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

      </svg>
    )
  }


  if (type === 'subscription') {

    return (
      <svg viewBox="0 0 24 24">

        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />

        <path
          d="M3 9h18"
          stroke="currentColor"
          strokeWidth="1.6"
        />

        <path
          d="M7 14h4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

      </svg>
    )
  }


  return (
    <svg viewBox="0 0 24 24">

      <path
        d="M12 3a3 3 0 0 0-3 3v1.1a6.9 6.9 0 0 0-2 1.4l-1-.6a3 3 0 1 0-3 5.2l1 .6c-.1.4-.1.9-.1 1.3s0 .9.1 1.3l-1 .6a3 3 0 1 0 3 5.2l1-.6a6.9 6.9 0 0 0 2 1.4V22a3 3 0 1 0 6 0v-1.1a6.9 6.9 0 0 0 2-1.4l1 .6a3 3 0 1 0 3-5.2l-1-.6c.1-.4.1-.9.1-1.3s0-.9-.1-1.3l1-.6a3 3 0 1 0-3-5.2l-1 .6a6.9 6.9 0 0 0-2-1.4V6a3 3 0 0 0-3-3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />

      <circle
        cx="12"
        cy="14"
        r="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />

    </svg>
  )
}


export default Sidebar