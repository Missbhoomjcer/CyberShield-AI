import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
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
  const { language } = useLanguage()

  const [refreshing, setRefreshing] = useState(false)

  const text = {
    English: {
      title: 'Quarantine',

      description:
        'Safely isolated files detected as potential security threats.',

      protectionActive: 'Protection Active',

      safeIsolated: 'SAFE & ISOLATED',

      bannerTitle:
        'Quarantined items cannot harm your device',

      bannerDescription:
        'CyberShield-AI isolates suspicious files so they cannot execute or affect your system.',

      itemsIsolated: 'Items isolated',

      quarantinedItems: 'Quarantined Items',

      quarantinedDescription:
        'Files that have been isolated by CyberShield-AI.',

      refresh: 'Refresh',

      refreshing: 'Refreshing...',

      file: 'File',

      threat: 'Threat',

      severity: 'Severity',

      size: 'Size',

      detected: 'Detected',

      status: 'Status',

      action: 'Action',

      isolatedFile: 'Isolated file',

      view: 'View',

      noItems: 'No quarantined items',

      noItemsDescription:
        'Files isolated by CyberShield-AI will appear here.',

      footer:
        'Quarantined files are isolated from normal system activity.',

      malware: 'Malware',

      high: 'High',

      quarantined: 'Quarantined',

      viewAlert: 'Quarantined file',
    },

    Hindi: {
      title: 'क्वारंटीन',

      description:
        'संभावित सुरक्षा खतरों के रूप में पहचानी गई फ़ाइलों को सुरक्षित रूप से अलग रखा गया है।',

      protectionActive: 'सुरक्षा सक्रिय',

      safeIsolated: 'सुरक्षित और अलग',

      bannerTitle:
        'क्वारंटीन की गई फ़ाइलें आपके डिवाइस को नुकसान नहीं पहुँचा सकतीं',

      bannerDescription:
        'CyberShield-AI संदिग्ध फ़ाइलों को अलग रखता है ताकि वे आपके सिस्टम पर चल या प्रभाव न डाल सकें।',

      itemsIsolated: 'अलग की गई वस्तुएँ',

      quarantinedItems: 'क्वारंटीन की गई वस्तुएँ',

      quarantinedDescription:
        'CyberShield-AI द्वारा अलग की गई फ़ाइलें।',

      refresh: 'रिफ्रेश',

      refreshing: 'रिफ्रेश हो रहा है...',

      file: 'फ़ाइल',

      threat: 'खतरा',

      severity: 'गंभीरता',

      size: 'आकार',

      detected: 'पता चला',

      status: 'स्थिति',

      action: 'कार्रवाई',

      isolatedFile: 'अलग की गई फ़ाइल',

      view: 'देखें',

      noItems: 'कोई क्वारंटीन की गई वस्तु नहीं',

      noItemsDescription:
        'CyberShield-AI द्वारा अलग की गई फ़ाइलें यहाँ दिखाई देंगी।',

      footer:
        'क्वारंटीन की गई फ़ाइलें सामान्य सिस्टम गतिविधि से अलग रखी जाती हैं।',

      malware: 'मैलवेयर',

      high: 'उच्च',

      quarantined: 'क्वारंटीन',

      viewAlert: 'क्वारंटीन की गई फ़ाइल',
    },
  }

  const t = text[language] || text.English

  const handleRefresh = () => {
    if (refreshing) return

    setRefreshing(true)

    setTimeout(() => {
      setRefreshing(false)
    }, 800)
  }

  const handleView = (item) => {
    window.alert(`${t.viewAlert}: ${item.filename}`)
  }

  return (
    <div className="quarantine-page">

      {/* HEADER */}
      <div className="quarantine-header">

        <div>
          <h1>{t.title}</h1>

          <p>
            {t.description}
          </p>
        </div>

        <div className="quarantine-status">
          <span className="quarantine-status-dot"></span>
          {t.protectionActive}
        </div>

      </div>


      {/* SECURITY BANNER */}
      <section className="quarantine-banner">

        <div className="quarantine-banner-icon">
          <ShieldIcon />
        </div>

        <div className="quarantine-banner-content">

          <span className="quarantine-banner-label">
            {t.safeIsolated}
          </span>

          <h2>
            {t.bannerTitle}
          </h2>

          <p>
            {t.bannerDescription}
          </p>

        </div>

        <div className="quarantine-count">

          <strong>
            {quarantinedItems.length}
          </strong>

          <span>
            {t.itemsIsolated}
          </span>

        </div>

      </section>


      {/* QUARANTINE PANEL */}
      <section className="quarantine-panel">

        <div className="quarantine-panel-header">

          <div>

            <h2>
              {t.quarantinedItems}
            </h2>

            <p>
              {t.quarantinedDescription}
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
              {refreshing
                ? t.refreshing
                : t.refresh}
            </span>

          </button>

        </div>


        {quarantinedItems.length > 0 ? (

          <div className="quarantine-table-container">

            <table className="quarantine-table">

              <thead>

                <tr>
                  <th>{t.file}</th>
                  <th>{t.threat}</th>
                  <th>{t.severity}</th>
                  <th>{t.size}</th>
                  <th>{t.detected}</th>
                  <th>{t.status}</th>
                  <th>{t.action}</th>
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

                          <strong>
                            {item.filename}
                          </strong>

                          <span>
                            {t.isolatedFile}
                          </span>

                        </div>

                      </div>

                    </td>


                    <td>

                      <span className="quarantine-threat">
                        {item.threat === 'Malware'
                          ? t.malware
                          : item.threat}
                      </span>

                    </td>


                    <td>

                      <span
                        className={`quarantine-severity ${item.severity.toLowerCase()}`}
                      >
                        {item.severity === 'High'
                          ? t.high
                          : item.severity}
                      </span>

                    </td>


                    <td>
                      {item.size}
                    </td>


                    <td>
                      {item.date}
                    </td>


                    <td>

                      <span className="quarantine-status-badge">
                        {item.status === 'Quarantined'
                          ? t.quarantined
                          : item.status}
                      </span>

                    </td>


                    <td>

                      <button
                        type="button"
                        className="quarantine-view-button"
                        onClick={() => handleView(item)}
                      >
                        {t.view}
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

            <h3>
              {t.noItems}
            </h3>

            <p>
              {t.noItemsDescription}
            </p>

          </div>

        )}


        <div className="quarantine-footer">
          {t.footer}
        </div>

      </section>

    </div>
  )
}

export default Quarantine