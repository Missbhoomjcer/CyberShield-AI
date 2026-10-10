import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import './Dashboard.css'

const API_URL = 'http://127.0.0.1:8000'

function Dashboard() {
  const navigate = useNavigate()
  const { language } = useLanguage()

  const [scanning, setScanning] = useState(false)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const protectionScore = null

  /* =========================================================
     TRANSLATIONS
     ========================================================= */

  const translations = {
    English: {
      greeting: 'Good evening, Harshita',
      protectedMessage:
        'Your device is protected and everything looks good.',
      protectionStatus: 'PROTECTION STATUS',
      protected: 'You are Protected',
      protectionDescription:
        'CyberShield-AI is ready to monitor your device for ransomware, malware and other security threats.',
      scanSystem: 'Scan Your System',
      openingScanner: 'Opening Scanner...',
      viewProtection: 'View Protection',
      protectionScore: 'Protection Score',
      awaitingAnalysis: 'Awaiting analysis',
      excellent: 'Excellent',
      securityOverview: 'Security Overview',
      currentActivity:
        'Current protection activity on this device',
      filesScanned: 'Files Scanned',
      filesChecked: 'Files checked for threats',
      threatsDetected: 'Threats Detected',
      detectedByEngine: 'Detected by security engine',
      threatsBlocked: 'Threats Blocked',
      protectionResponse: 'Protection engine response',
      quarantined: 'Quarantined',
      isolatedFiles: 'Isolated files',
      recentActivity: 'Recent Security Activity',
      latestEvents:
        'Latest events from your protection system',
      viewAll: 'View All',
      loadingActivity: 'Loading security activity...',
      noActivity:
        'No security activity available yet.',
      threatDetected: 'Threat detected',
      scanCompleted: 'File scan completed',
      securityEvent: 'Security event',
      protectionModules: 'Protection Modules',
      securityLayers:
        'Security layers protecting this device',
      manage: 'Manage',
      realtime: 'Real-Time Protection',
      realtimeDescription:
        'Continuous endpoint monitoring',
      ransomware: 'Ransomware Protection',
      ransomwareDescription:
        'Suspicious behavior detection',
      aiDetection: 'AI Threat Detection',
      aiDescription: 'XGBoost + LSTM analysis',
      behavioral: 'Behavioral Monitoring',
      behavioralDescription:
        'Real-time activity analysis',
      aiSecurity: 'AI SECURITY',
      aiCopilot: 'CyberShield AI Copilot',
      aiDescriptionLong:
        'Get explanations and security assistance',
      openAI: 'Open AI Security',
      protectedDevice: 'PROTECTED DEVICE',
      windowsPC: 'Windows PC',
      endpointAgent: 'CyberShield Endpoint Agent',
      agentProtected: 'Protected',
      agentStatus: 'Agent status',
      on: 'ON',
      alerts: 'View security alerts',
    },

    Hindi: {
      greeting: 'शुभ संध्या, Harshita',
      protectedMessage:
        'आपका डिवाइस सुरक्षित है और सब कुछ ठीक है।',
      protectionStatus: 'सुरक्षा स्थिति',
      protected: 'आप सुरक्षित हैं',
      protectionDescription:
        'CyberShield-AI आपके डिवाइस को रैनसमवेयर, मैलवेयर और अन्य सुरक्षा खतरों के लिए मॉनिटर करने के लिए तैयार है।',
      scanSystem: 'अपने सिस्टम को स्कैन करें',
      openingScanner: 'स्कैनर खोला जा रहा है...',
      viewProtection: 'सुरक्षा देखें',
      protectionScore: 'सुरक्षा स्कोर',
      awaitingAnalysis: 'विश्लेषण की प्रतीक्षा',
      excellent: 'उत्कृष्ट',
      securityOverview: 'सुरक्षा अवलोकन',
      currentActivity:
        'इस डिवाइस की वर्तमान सुरक्षा गतिविधि',
      filesScanned: 'स्कैन की गई फाइलें',
      filesChecked:
        'खतरों के लिए जांची गई फाइलें',
      threatsDetected: 'पता लगाए गए खतरे',
      detectedByEngine:
        'सुरक्षा इंजन द्वारा पता लगाए गए',
      threatsBlocked: 'ब्लॉक किए गए खतरे',
      protectionResponse:
        'सुरक्षा इंजन की प्रतिक्रिया',
      quarantined: 'क्वारंटीन की गई फाइलें',
      isolatedFiles: 'अलग की गई फाइलें',
      recentActivity: 'हाल की सुरक्षा गतिविधि',
      latestEvents:
        'आपके सुरक्षा सिस्टम की नवीनतम घटनाएं',
      viewAll: 'सभी देखें',
      loadingActivity:
        'सुरक्षा गतिविधि लोड हो रही है...',
      noActivity:
        'अभी कोई सुरक्षा गतिविधि उपलब्ध नहीं है।',
      threatDetected: 'खतरा पाया गया',
      scanCompleted: 'फाइल स्कैन पूरा हुआ',
      securityEvent: 'सुरक्षा घटना',
      protectionModules: 'सुरक्षा मॉड्यूल',
      securityLayers:
        'इस डिवाइस की सुरक्षा करने वाली सुरक्षा परतें',
      manage: 'प्रबंधित करें',
      realtime: 'रीयल-टाइम सुरक्षा',
      realtimeDescription:
        'लगातार एंडपॉइंट मॉनिटरिंग',
      ransomware: 'रैनसमवेयर सुरक्षा',
      ransomwareDescription:
        'संदिग्ध व्यवहार का पता लगाना',
      aiDetection: 'AI खतरा पहचान',
      aiDescription: 'XGBoost + LSTM विश्लेषण',
      behavioral: 'व्यवहारिक मॉनिटरिंग',
      behavioralDescription:
        'रीयल-टाइम गतिविधि विश्लेषण',
      aiSecurity: 'AI सुरक्षा',
      aiCopilot: 'CyberShield AI Copilot',
      aiDescriptionLong:
        'स्पष्टीकरण और सुरक्षा सहायता प्राप्त करें',
      openAI: 'AI सुरक्षा खोलें',
      protectedDevice: 'सुरक्षित डिवाइस',
      windowsPC: 'Windows PC',
      endpointAgent: 'CyberShield Endpoint Agent',
      agentProtected: 'सुरक्षित',
      agentStatus: 'एजेंट स्थिति',
      on: 'चालू',
      alerts: 'सुरक्षा अलर्ट देखें',
    },
  }

  const t = translations[language] || translations.English

  /* =========================================================
     LOAD SECURITY HISTORY
     ========================================================= */

  useEffect(() => {
    fetchHistory()
  }, [])

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

      setHistory(items)
    } catch (error) {
      console.error('Failed to load security history:', error)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  /* =========================================================
     SCAN YOUR SYSTEM
     ========================================================= */

  const handleSystemScan = () => {
    setScanning(true)

    setTimeout(() => {
      setScanning(false)
      navigate('/scan')
    }, 400)
  }

  /* =========================================================
     SECURITY COUNTS
     ========================================================= */

  const detectedThreats = history.filter((item) => {
    const threatLevel = String(
      item.threat_level ?? ''
    ).toUpperCase()

    const risk = Number(item.overall_risk ?? 0)

    return (
      ['MEDIUM', 'HIGH', 'CRITICAL'].includes(threatLevel) ||
      risk >= 50
    )
  })

  const quarantined = history.filter((item) => {
    const action = String(
      item.action ?? ''
    ).toUpperCase()

    return action.includes('QUARANTINE')
  })

  const blocked = history.filter((item) => {
    const action = String(
      item.action ?? ''
    ).toUpperCase()

    return action.includes('BLOCK')
  })

  /* =========================================================
     TIME FORMAT
     ========================================================= */

  const formatTime = (item) => {
    const value =
      item.created_at ??
      item.timestamp ??
      item.time

    if (!value) {
      return '—'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return String(value)
    }

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /* =========================================================
     ACTIVITY TITLE
     ========================================================= */

  const getActivityTitle = (item) => {
    const threatLevel = String(
      item.threat_level ?? ''
    ).toUpperCase()

    const risk = Number(item.overall_risk ?? 0)

    const dangerous =
      ['MEDIUM', 'HIGH', 'CRITICAL'].includes(threatLevel) ||
      risk >= 50

    if (dangerous) {
      return t.threatDetected
    }

    return t.scanCompleted
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <header className="dashboard-header">

        <div>
          <h1>{t.greeting}</h1>

          <p>
            {t.protectedMessage}
          </p>
        </div>

        <div className="dashboard-header-actions">

          <button
            className="notification-button"
            onClick={() => navigate('/threats')}
            aria-label={t.alerts}
            title={t.alerts}
          >
            <svg viewBox="0 0 24 24">
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
              H
            </div>

            <span>Harshita</span>

          </div>

        </div>

      </header>

      {/* PROTECTION STATUS */}

      <section className="dashboard-protection-card">

        <div className="dashboard-protection-main">

          <div className="dashboard-shield">

            <svg viewBox="0 0 48 52">

              <path
                d="M24 2L43 9v13c0 12-7.8 22.1-19 27C12.8 44.1 5 34 5 22V9L24 2Z"
                fill="#16b66a"
              />

              <path
                d="M15 25l6 6 12-13"
                fill="none"
                stroke="#fff"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

            </svg>

          </div>

          <div className="dashboard-protection-copy">

            <div className="dashboard-status-line">

              <span className="live-dot"></span>

              {t.protectionStatus}

            </div>

            <h2>
              {t.protected}
            </h2>

            <p>
              {t.protectionDescription}
            </p>

            <div className="dashboard-protection-actions">

              <button
                className="dashboard-primary-button"
                onClick={handleSystemScan}
                disabled={scanning}
              >

                <svg viewBox="0 0 24 24">

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

                {scanning
                  ? t.openingScanner
                  : t.scanSystem}

              </button>

              <button
                className="dashboard-more-button"
                onClick={() => navigate('/protection')}
              >
                {t.viewProtection}
              </button>

            </div>

          </div>

        </div>

        {/* PROTECTION SCORE */}

        <div className="dashboard-score-section">

          <div className="dashboard-score-circle">

            <span className="score-value">
              {protectionScore ?? '—'}
            </span>

            <span className="score-total">
              /100
            </span>

          </div>

          <span className="score-label">
            {t.protectionScore}
          </span>

          <strong className="score-status">

            {protectionScore === null
              ? t.awaitingAnalysis
              : t.excellent}

          </strong>

        </div>

      </section>

      {/* SECURITY OVERVIEW */}

      <section className="dashboard-section">

        <div className="dashboard-section-title">

          <h2>
            {t.securityOverview}
          </h2>

          <p>
            {t.currentActivity}
          </p>

        </div>

        <div className="dashboard-stats-grid">

          {/* FILES SCANNED */}

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon blue">

              <svg viewBox="0 0 24 24">

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

            <strong>
              {loading
                ? '—'
                : history.length || '—'}
            </strong>

            <small>
              {t.filesChecked}
            </small>

          </div>

          {/* THREATS */}

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon red">

              <svg viewBox="0 0 24 24">

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

                <circle
                  cx="12"
                  cy="17"
                  r="0.8"
                  fill="currentColor"
                />

              </svg>

            </div>

            <span className="dashboard-stat-label">
              {t.threatsDetected}
            </span>

            <strong>
              {loading
                ? '—'
                : detectedThreats.length}
            </strong>

            <small>
              {t.detectedByEngine}
            </small>

          </div>

          {/* BLOCKED */}

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon green">

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

            <span className="dashboard-stat-label">
              {t.threatsBlocked}
            </span>

            <strong>
              {loading
                ? '—'
                : blocked.length}
            </strong>

            <small>
              {t.protectionResponse}
            </small>

          </div>

          {/* QUARANTINE */}

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon purple">

              <svg viewBox="0 0 24 24">

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

            <strong>
              {loading
                ? '—'
                : quarantined.length}
            </strong>

            <small>
              {t.isolatedFiles}
            </small>

          </div>

        </div>

      </section>

      {/* LOWER CONTENT */}

      <div className="dashboard-lower-grid">

        {/* RECENT ACTIVITY */}

        <section className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <h2>
                {t.recentActivity}
              </h2>

              <p>
                {t.latestEvents}
              </p>

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

              history
                .slice(0, 4)
                .map((item, index) => {

                  const threatLevel = String(
                    item.threat_level ?? ''
                  ).toUpperCase()

                  const risk = Number(
                    item.overall_risk ?? 0
                  )

                  const dangerous =
                    ['MEDIUM', 'HIGH', 'CRITICAL'].includes(
                      threatLevel
                    ) ||
                    risk >= 50

                  return (

                    <div
                      className="dashboard-activity-item"
                      key={item.id ?? index}
                    >

                      <div
                        className={`activity-status-icon ${
                          dangerous
                            ? 'danger'
                            : 'safe'
                        }`}
                      >
                        {dangerous ? '!' : '✓'}
                      </div>

                      <div className="activity-content">

                        <strong>
                          {getActivityTitle(item)}
                        </strong>

                        <span>
                          {item.filename ??
                            item.file_name ??
                            t.securityEvent}
                        </span>

                      </div>

                      <time>
                        {formatTime(item)}
                      </time>

                    </div>

                  )
                })

            )}

          </div>

        </section>

        {/* PROTECTION MODULES */}

        <section className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <h2>
                {t.protectionModules}
              </h2>

              <p>
                {t.securityLayers}
              </p>

            </div>

            <button
              className="dashboard-link-button"
              onClick={() => navigate('/protection')}
            >
              {t.manage}
            </button>

          </div>

          <div className="dashboard-module-list">

            <DashboardModule
              type="shield"
              title={t.realtime}
              description={t.realtimeDescription}
              status={t.on}
            />

            <DashboardModule
              type="ransomware"
              title={t.ransomware}
              description={t.ransomwareDescription}
              status={t.on}
            />

            <DashboardModule
              type="ai"
              title={t.aiDetection}
              description={t.aiDescription}
              status={t.on}
            />

            <DashboardModule
              type="behavior"
              title={t.behavioral}
              description={t.behavioralDescription}
              status={t.on}
            />

          </div>

        </section>

      </div>

      {/* AI SECURITY */}

      <section className="dashboard-device-card">

        <div className="dashboard-device-left">

          <div className="dashboard-device-icon">

            <svg viewBox="0 0 24 24">

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

            <span>
              {t.aiSecurity}
            </span>

            <strong>
              {t.aiCopilot}
            </strong>

            <small>
              {t.aiDescriptionLong}
            </small>

          </div>

        </div>

        <button
          className="dashboard-more-button"
          onClick={() => navigate('/ai-security')}
        >
          {t.openAI}
        </button>

      </section>

      {/* DEVICE */}

      <section className="dashboard-device-card">

        <div className="dashboard-device-left">

          <div className="dashboard-device-icon">

            <svg viewBox="0 0 24 24">

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

            <span>
              {t.protectedDevice}
            </span>

            <strong>
              {t.windowsPC}
            </strong>

            <small>
              {t.endpointAgent}
            </small>

          </div>

        </div>

        <div className="dashboard-device-right">

          <span className="live-dot"></span>

          <div>

            <strong>
              {t.agentProtected}
            </strong>

            <small>
              {t.agentStatus}
            </small>

          </div>

        </div>

      </section>

    </div>
  )
}

/* =========================================================
   PROTECTION MODULE COMPONENT
   ========================================================= */

function DashboardModule({
  type,
  title,
  description,
  status,
}) {
  return (
    <div className="dashboard-module">

      <div className="module-icon">

        {type === 'ai' ? (

          <span>
            AI
          </span>

        ) : (

          <svg viewBox="0 0 24 24">

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

        )}

      </div>

      <div>

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>

      <span className="module-status active">
        {status}
      </span>

    </div>
  )
}

export default Dashboard