
import { useState } from 'react'
import './Settings.css'
import { useLanguage } from '../context/LanguageContext.jsx'

function Settings() {
  const { language, setLanguage, t } = useLanguage()

  const [realTimeProtection, setRealTimeProtection] = useState(true)
  const [ransomwareProtection, setRansomwareProtection] = useState(true)
  const [behavioralMonitoring, setBehavioralMonitoring] = useState(true)
  const [networkProtection, setNetworkProtection] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [autoUpdates, setAutoUpdates] = useState(true)

  // Read the currently logged-in user's details.
  const getLoggedInUser = () => {
    try {
      const savedUser = sessionStorage.getItem('cybershield_user')

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)

        if (parsedUser && typeof parsedUser === 'object') {
          return parsedUser
        }
      }
    } catch (error) {
      console.error('Unable to read account details:', error)
    }

    return {}
  }

  const user = getLoggedInUser()

  const userName =
    user.displayName ||
    user.name ||
    user.full_name ||
    sessionStorage.getItem('cybershield_user_name') ||
    sessionStorage.getItem('user_name') ||
    sessionStorage.getItem('userName') ||
    sessionStorage.getItem('username') ||
    user.email?.split('@')[0] ||
    sessionStorage.getItem('user_email')?.split('@')[0] ||
    'User'

  const userEmail =
    user.email ||
    user.user_email ||
    sessionStorage.getItem('user_email') ||
    ''

  // Reusable toggle component.
  const Toggle = ({ enabled, onToggle, label }) => (
    <button
      type="button"
      className={`settings-toggle ${enabled ? 'enabled' : ''}`}
      onClick={onToggle}
      aria-label={label}
      aria-pressed={enabled}
    >
      <span />
    </button>
  )

  return (
    <div className="settings-page">
      {/* HEADER */}
      <div className="settings-header">
        <div>
          <h1>{t('settings')}</h1>
          <p>{t('manageSettings')}</p>
        </div>
      </div>

      {/* GENERAL SETTINGS */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div>
            <h2>{t('generalSettings')}</h2>
            <p>{t('generalSettingsDescription')}</p>
          </div>
        </div>

        {/* LANGUAGE */}
        <div className="settings-row">
          <div className="settings-row-info">
            <h3>{t('language')}</h3>
            <p>{t('languageDescription')}</p>
          </div>

          <select
            className="settings-select"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="English">{t('english')}</option>
            <option value="Hindi">{t('hindi')}</option>
          </select>
        </div>

        {/* AUTOMATIC UPDATES */}
        <div className="settings-row">
          <div className="settings-row-info">
            <h3>{t('automaticUpdates')}</h3>
            <p>{t('automaticUpdatesDescription')}</p>
          </div>

          <Toggle
            enabled={autoUpdates}
            onToggle={() => setAutoUpdates((previous) => !previous)}
            label={t('automaticUpdates')}
          />
        </div>
      </section>

      {/* PROTECTION SETTINGS */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div>
            <h2>{t('protectionSettings')}</h2>
            <p>{t('protectionSettingsDescription')}</p>
          </div>
        </div>

        {/* REAL-TIME PROTECTION */}
        <div className="settings-row">
          <div className="settings-row-info">
            <h3>{t('realTimeProtection')}</h3>
            <p>{t('realTimeProtectionDescription')}</p>
          </div>

          <Toggle
            enabled={realTimeProtection}
            onToggle={() =>
              setRealTimeProtection((previous) => !previous)
            }
            label={t('realTimeProtection')}
          />
        </div>

        {/* RANSOMWARE PROTECTION */}
        <div className="settings-row">
          <div className="settings-row-info">
            <h3>{t('ransomwareProtection')}</h3>
            <p>{t('ransomwareProtectionDescription')}</p>
          </div>

          <Toggle
            enabled={ransomwareProtection}
            onToggle={() =>
              setRansomwareProtection((previous) => !previous)
            }
            label={t('ransomwareProtection')}
          />
        </div>

        {/* BEHAVIORAL MONITORING */}
        <div className="settings-row">
          <div className="settings-row-info">
            <h3>{t('behavioralMonitoring')}</h3>
            <p>{t('behavioralMonitoringDescription')}</p>
          </div>

          <Toggle
            enabled={behavioralMonitoring}
            onToggle={() =>
              setBehavioralMonitoring((previous) => !previous)
            }
            label={t('behavioralMonitoring')}
          />
        </div>

        {/* NETWORK PROTECTION */}
        <div className="settings-row">
          <div className="settings-row-info">
            <h3>{t('networkProtection')}</h3>
            <p>{t('networkProtectionDescription')}</p>
          </div>

          <Toggle
            enabled={networkProtection}
            onToggle={() =>
              setNetworkProtection((previous) => !previous)
            }
            label={t('networkProtection')}
          />
        </div>
      </section>

      {/* NOTIFICATIONS */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div>
            <h2>{t('notifications')}</h2>
            <p>{t('notificationsDescription')}</p>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <h3>{t('securityNotifications')}</h3>
            <p>{t('securityNotificationsDescription')}</p>
          </div>

          <Toggle
            enabled={notifications}
            onToggle={() => setNotifications((previous) => !previous)}
            label={t('securityNotifications')}
          />
        </div>
      </section>

      {/* ACCOUNT */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div>
            <h2>{t('account')}</h2>
            <p>{t('accountDescription')}</p>
          </div>
        </div>

        <div className="account-info">
          <div className="account-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>

          <div className="account-details">
            <h3>{userName}</h3>
            <p>{t('personalDevice')}</p>
            {userEmail && <span>{userEmail}</span>}
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              window.alert('Edit Profile functionality is not implemented yet.')
            }}
          >
            {t('editProfile')}
          </button>
        </div>
      </section>
    </div>
  )
}

export default Settings
