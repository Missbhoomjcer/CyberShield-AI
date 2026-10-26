import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import './Dashboard.css'

const API_URL = 'http://127.0.0.1:8000'
const MONITORING_KEY = 'cybershield_monitoring_active'

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function getLoggedInUser() {
  const keys = [
    'cybershield_user_name',
    'user_name',
    'userName',
    'username',
    'user_email',
  ]

  for (const key of keys) {
    const value = sessionStorage.getItem(key)

    if (value?.trim()) {
      if (key === 'user_email' && value.includes('@')) {
        return value.split('@')[0]
      }

      return value.trim()
    }
  }

  return 'User'
}

function Dashboard() {
  const navigate = useNavigate()
  const { language } = useLanguage()

  const [scanning, setScanning] = useState(false)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [loggedInUser, setLoggedInUser] = useState(getLoggedInUser)
  const [greeting, setGreeting] = useState(getGreeting)
  const [monitoringActive, setMonitoringActive] = useState(
    () => sessionStorage.getItem(MONITORING_KEY) === 'true'
  )

  // No score is displayed until real analysis data is available.
  const protectionScore = null

  const translations = {
    English: {
      pageMessage:
        'Review your device activity and scan files for potential threats.',
      protectionStatus: 'SECURITY STATUS',
      inactive: 'Protection Inactive',
      active: 'Monitoring Active',
      inactiveDescription:
        'Real-time monitoring is not running. Start monitoring to collect live activity, or scan files to check for potential threats.',
      activeDescription:
        'Live monitoring is running. This status does not guarantee that every protection feature is enabled.',
      scanSystem: 'Scan Your System',
      openingScanner: 'Opening Scanner...',
      protectionScore: 'Protection Score',
      awaitingAnalysis: 'Awaiting analysis',
      securityOverview: 'Security Overview',
      currentActivity: 'Recorded security activity on this device',
      filesScanned: 'Files Scanned',
      filesChecked: 'Files recorded in scan history',
      threatsDetected: 'Threats Detected',
      detectedByEngine: 'Recorded threat detections',
      threatsBlocked: 'Threats Blocked',
      protectionResponse: 'Recorded block actions',
      quarantined: 'Quarantined',
      isolatedFiles: 'Recorded quarantine actions',
      recentActivity: 'Recent Security Activity',
      latestEvents: 'Latest recorded security events',
      viewAll: 'View All',
      loadingActivity: 'Loading security activity...',
      noActivity: 'No security activity available yet.',
      threatDetected: 'Threat detected',
      scanCompleted: 'File scan completed',
      securityEvent: 'Security event',
      aiSecurity: 'AI SECURITY',
      aiCopilot: 'CyberShield AI Copilot',
      aiDescription: 'Get explanations and security assistance',
      openAI: 'Open AI Security',
      deviceInformation: 'DEVICE INFORMATION',
      windowsPC: 'Windows PC',
      endpointAgent: 'CyberShield AI endpoint dashboard',
      monitoringRunning: 'Monitoring Active',
      monitoringStopped: 'Monitoring Inactive',
      monitoringStatus: 'Monitoring status',
      alerts: 'View security alerts',
    },

    Hindi: {
      pageMessage:
        'अपने डिवाइस की गतिविधि देखें और संभावित खतरों के लिए फाइलें स्कैन करें।',
      protectionStatus: 'सुरक्षा स्थिति',
      inactive: 'सुरक्षा मॉनिटरिंग निष्क्रिय',
      active: 'मॉनिटरिंग सक्रिय',
      inactiveDescription:
        'रीयल-टाइम मॉनिटरिंग चालू नहीं है। गतिविधि देखने के लिए मॉनिटरिंग शुरू करें या संभावित खतरों के लिए फाइलें स्कैन करें।',
      activeDescription:
        'लाइव मॉनिटरिंग चल रही है। इसका अर्थ यह नहीं है कि सभी सुरक्षा सुविधाएं सक्रिय हैं।',
      scanSystem: 'अपने सिस्टम को स्कैन करें',
      openingScanner: 'स्कैनर खोला जा रहा है...',
      protectionScore: 'सुरक्षा स्कोर',
      awaitingAnalysis: 'विश्लेषण की प्रतीक्षा',
      securityOverview: 'सुरक्षा अवलोकन',
      currentActivity: 'इस डिवाइस की दर्ज सुरक्षा गतिविधि',
      filesScanned: 'स्कैन की गई फाइलें',
      filesChecked: 'स्कैन इतिहास में दर्ज फाइलें',
      threatsDetected: 'पता लगाए गए खतरे',
      detectedByEngine: 'दर्ज खतरे',
      threatsBlocked: 'ब्लॉक किए गए खतरे',
      protectionResponse: 'दर्ज ब्लॉक कार्रवाई',
      quarantined: 'क्वारंटीन',
      isolatedFiles: 'दर्ज क्वारंटीन कार्रवाई',
      recentActivity: 'हाल की सुरक्षा गतिविधि',
      latestEvents: 'नवीनतम दर्ज सुरक्षा घटनाएं',
      viewAll: 'सभी देखें',
      loadingActivity: 'सुरक्षा गतिविधि लोड हो रही है...',
      noActivity: 'अभी कोई सुरक्षा गतिविधि उपलब्ध नहीं है।',
      threatDetected: 'खतरा पाया गया',
      scanCompleted: 'फाइल स्कैन पूरा हुआ',
      securityEvent: 'सुरक्षा घटना',
      aiSecurity: 'AI सुरक्षा',
      aiCopilot: 'CyberShield AI Copilot',
      aiDescription: 'स्पष्टीकरण और सुरक्षा सहायता प्राप्त करें',
      openAI: 'AI सुरक्षा खोलें',
      deviceInformation: 'डिवाइस की जानकारी',
      windowsPC: 'Windows PC',
      endpointAgent: 'CyberShield AI डैशबोर्ड',
      monitoringRunning: 'मॉनिटरिंग सक्रिय',
      monitoringStopped: 'मॉनिटरिंग निष्क्रिय',
      monitoringStatus: 'मॉनिटरिंग स्थिति',
      alerts: 'सुरक्षा अलर्ट देखें',
    },
  }

  const t = translations[language] || translations.English

  // Keep the user, greeting, and monitoring status updated.
  useEffect(() => {
    const updateUser = () => {
      setLoggedInUser(getLoggedInUser())
    }

    const updateGreeting = () => {
      setGreeting(getGreeting())
    }

    const updateMonitoring = () => {
      setMonitoringActive(
        sessionStorage.getItem(MONITORING_KEY) === 'true'
      )
    }

    window.addEventListener('storage', updateUser)
    window.addEventListener('cybershield-user-updated', updateUser)
    window.addEventListener(
      'cybershield-monitoring-status',
      updateMonitoring
    )

    const intervalId = window.setInterval(updateGreeting, 60000)

    updateUser()
    updateMonitoring()

    return () => {
      window.removeEventListener('storage', updateUser)
      window.removeEventListener('cybershield-user-updated', updateUser)
      window.removeEventListener(
        'cybershield-monitoring-status',
        updateMonitoring
      )
      window.clearInterval(intervalId)
    }
  }, [])

  // Load recorded security history.
  useEffect(() => {
    let cancelled = false

    const fetchHistory = async () => {
      try {
        setLoading(true)

        const response = await fetch(`${API_URL}/history/`)

        if (!response.ok) {
          throw new Error('History API unavailable')
        }

        const data = await response.json()

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.history)
            ? data.history
            : Array.isArray(data?.scans)
              ? data.scans
              : []

        if (!cancelled) {
          setHistory(items)
        }
      } catch (error) {
        console.error('Failed to load security history:', error)

        if (!cancelled) {
          setHistory([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchHistory()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSystemScan = () => {
    setScanning(true)

    window.setTimeout(() => {
      navigate('/scan')
      setScanning(false)
    }, 300)
  }

  // These counts are based on recorded history, not live protection.
  const detectedThreats = history.filter((item) => {
    const level = String(item.threat_level ?? '').toUpperCase()
    const risk = Number(item.overall_risk ?? 0)

    return (
      ['MEDIUM', 'HIGH', 'CRITICAL'].includes(level) ||
      risk >= 50
    )
  })

  const quarantined = history.filter((item) =>
    String(item.action ?? '').toUpperCase().includes('QUARANTINE')
  )

  const blocked = history.filter((item) =>
    String(item.action ?? '').toUpperCase().includes('BLOCK')
  )

  const formatTime = (item) => {
    const value = item.created_at ?? item.timestamp ?? item.time

    if (!value) return '—'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return String(value)
    }

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActivityTitle = (item) => {
    const level = String(item.threat_level ?? '').toUpperCase()
    const risk = Number(item.overall_risk ?? 0)

    return (
      ['MEDIUM', 'HIGH', 'CRITICAL'].includes(level) ||
      risk >= 50
    )
      ? t.threatDetected
      : t.scanCompleted
  }

  return (
    <div className="dashboard-page">
      {/* HEADER */}

      <header className="dashboard-header">
        <div>
          <h1>{greeting}!</h1>
          <p>{t.pageMessage}</p>
        </div>

        <div className="dashboard-header-actions">
          <button
            className="notification-button"
            onClick={() => navigate('/threats')}
            aria-label={t.alerts}
            title={t.alerts}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 21h4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="dashboard-user">
            <div className="dashboard-user-avatar">
              {loggedInUser.charAt(0).toUpperCase()}
            </div>
            <span>{loggedInUser}</span>
          </div>
        </div>
      </header>

      {/* HONEST SECURITY STATUS */}

      <section className="dashboard-protection-card">
        <div className="dashboard-protection-main">
          <div className="dashboard-shield">
            <svg viewBox="0 0 48 52" aria-hidden="true">
              <path
                d="M24 2L43 9v13c0 12-7.8 22.1-19 27C12.8 44.1 5 34 5 22V9L24 2Z"
                fill={monitoringActive ? '#16b66a' : '#64748b'}
              />
              {monitoringActive && (
                <path
                  d="M15 25l6 6 12-13"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>

          <div className="dashboard-protection-copy">
            <div className="dashboard-status-line">
              <span
                className={`live-dot${monitoringActive ? ' monitoring-live' : ''}`}
              />
              {t.protectionStatus}
            </div>

            <h2>
              {monitoringActive ? t.active : t.inactive}
            </h2>

            <p>
              {monitoringActive
                ? t.activeDescription
                : t.inactiveDescription}
            </p>

            <div className="dashboard-protection-actions">
              <button
                className="dashboard-primary-button"
                onClick={handleSystemScan}
                disabled={scanning}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle
                    cx="11"
                    cy="11"
                    r="6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M16 16l5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>

                {scanning ? t.openingScanner : t.scanSystem}
              </button>
            </div>
          </div>
        </div>

        {/* SCORE REMAINS UNKNOWN UNTIL REAL ANALYSIS EXISTS */}

        <div className="dashboard-score-section">
          <div className="dashboard-score-circle">
            <span className="score-value">
              {protectionScore ?? '—'}
            </span>
            <span className="score-total">/100</span>
          </div>

          <span className="score-label">{t.protectionScore}</span>

          <strong className="score-status">
            {t.awaitingAnalysis}
          </strong>
        </div>
      </section>

      {/* SECURITY OVERVIEW */}

      <section className="dashboard-section">
        <div className="dashboard-section-title">
          <h2>{t.securityOverview}</h2>
          <p>{t.currentActivity}</p>
        </div>

        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon blue">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M6 4h12v16H6z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M9 8h6M9 12h6M9 16h4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="dashboard-stat-label">
              {t.filesScanned}
            </span>
            <strong>{loading ? '—' : history.length}</strong>
            <small>{t.filesChecked}</small>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon red">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 3l9 17H3L12 3z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 9v5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="17" r="0.8" fill="currentColor" />
              </svg>
            </div>
            <span className="dashboard-stat-label">
              {t.threatsDetected}
            </span>
            <strong>
              {loading ? '—' : detectedThreats.length}
            </strong>
            <small>{t.detectedByEngine}</small>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon green">
              <svg viewBox="0 0 24 24" aria-hidden="true">
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
            <span className="dashboard-stat-label">
              {t.threatsBlocked}
            </span>
            <strong>{loading ? '—' : blocked.length}</strong>
            <small>{t.protectionResponse}</small>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon purple">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M5 7h14v13H5z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M8 7V4h8v3M9 11v5M12 11v5M15 11v5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="dashboard-stat-label">
              {t.quarantined}
            </span>
            <strong>{loading ? '—' : quarantined.length}</strong>
            <small>{t.isolatedFiles}</small>
          </div>
        </div>
      </section>

      {/* RECENT SECURITY ACTIVITY — PROTECTION MODULES REMOVED */}

      <div className="dashboard-lower-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>{t.recentActivity}</h2>
              <p>{t.latestEvents}</p>
            </div>

            <button
              className="dashboard-link-button"
              onClick={() => navigate('/threats')}
            >
              {t.viewAll}
            </button>
          </div>

          <div className="dashboard-activity-list">
            {loading ? (
              <div className="dashboard-empty">
                {t.loadingActivity}
              </div>
            ) : history.length === 0 ? (
              <div className="dashboard-empty">
                {t.noActivity}
              </div>
            ) : (
              history.slice(0, 4).map((item, index) => {
                const level = String(
                  item.threat_level ?? ''
                ).toUpperCase()

                const risk = Number(item.overall_risk ?? 0)

                const dangerous =
                  ['MEDIUM', 'HIGH', 'CRITICAL'].includes(level) ||
                  risk >= 50

                return (
                  <div
                    className="dashboard-activity-item"
                    key={item.id ?? index}
                  >
                    <div
                      className={`activity-status-icon ${
                        dangerous ? 'danger' : 'safe'
                      }`}
                    >
                      {dangerous ? '!' : '✓'}
                    </div>

                    <div className="activity-content">
                      <strong>{getActivityTitle(item)}</strong>
                      <span>
                        {item.filename ??
                          item.file_name ??
                          t.securityEvent}
                      </span>
                    </div>

                    <time>{formatTime(item)}</time>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>

      {/* AI SECURITY */}

      <section className="dashboard-device-card">
        <div className="dashboard-device-left">
          <div className="dashboard-device-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M9 12l2 2 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              />
            </svg>
          </div>

          <div>
            <span>{t.aiSecurity}</span>
            <strong>{t.aiCopilot}</strong>
            <small>{t.aiDescription}</small>
          </div>
        </div>

        <button
          className="dashboard-more-button"
          onClick={() => navigate('/ai-security')}
        >
          {t.openAI}
        </button>
      </section>

      {/* DEVICE INFORMATION */}

      <section className="dashboard-device-card">
        <div className="dashboard-device-left">
          <div className="dashboard-device-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect
                x="3"
                y="4"
                width="18"
                height="12"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M8 20h8M12 16v4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <span>{t.deviceInformation}</span>
            <strong>{t.windowsPC}</strong>
            <small>{t.endpointAgent}</small>
          </div>
        </div>

        <div className="dashboard-device-right">
          <span className="live-dot" />
          <div>
            <strong>
              {monitoringActive
                ? t.monitoringRunning
                : t.monitoringStopped}
            </strong>
            <small>{t.monitoringStatus}</small>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard