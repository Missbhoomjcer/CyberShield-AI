import { useState } from 'react'
import './Settings.css'

import { useLanguage } from '../context/LanguageContext.jsx'


function Settings() {

  const {
    language,
    setLanguage,
    t
  } = useLanguage()


  const [realTimeProtection, setRealTimeProtection] = useState(true)

  const [ransomwareProtection, setRansomwareProtection] =
    useState(true)

  const [behavioralMonitoring, setBehavioralMonitoring] =
    useState(true)

  const [networkProtection, setNetworkProtection] =
    useState(true)

  const [notifications, setNotifications] =
    useState(true)

  const [autoUpdates, setAutoUpdates] =
    useState(true)


  /* =========================================================
     TOGGLE COMPONENT
     ========================================================= */

  const Toggle = ({
    enabled,
    onToggle,
    label
  }) => (

    <button
      type="button"
      className={`settings-toggle ${
        enabled ? 'enabled' : ''
      }`}
      onClick={onToggle}
      aria-label={label}
      aria-pressed={enabled}
    >

      <span />

    </button>

  )


  return (

    <div className="settings-page">


      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="settings-header">

        <div>

          <h1>
            {t('settings')}
          </h1>

          <p>
            {t('manageSettings')}
          </p>

        </div>

      </div>


      {/* =====================================================
          GENERAL SETTINGS
          ===================================================== */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div>

            <h2>
              {t('generalSettings')}
            </h2>

            <p>
              {t('generalSettingsDescription')}
            </p>

          </div>

        </div>


        {/* LANGUAGE */}

        <div className="settings-row">

          <div className="settings-row-info">

            <h3>
              {t('language')}
            </h3>

            <p>
              {t('languageDescription')}
            </p>

          </div>


          <select
            className="settings-select"
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value)
            }
          >

            <option value="English">
              {t('english')}
            </option>

            <option value="Hindi">
              {t('hindi')}
            </option>

          </select>

        </div>


        {/* AUTOMATIC UPDATES */}

        <div className="settings-row">

          <div className="settings-row-info">

            <h3>
              {t('automaticUpdates')}
            </h3>

            <p>
              {t('automaticUpdatesDescription')}
            </p>

          </div>


          <Toggle
            enabled={autoUpdates}
            onToggle={() =>
              setAutoUpdates(!autoUpdates)
            }
            label={t('automaticUpdates')}
          />

        </div>

      </section>


      {/* =====================================================
          PROTECTION
          ===================================================== */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div>

            <h2>
              {t('protectionSettings')}
            </h2>

            <p>
              {t('protectionSettingsDescription')}
            </p>

          </div>

        </div>


        {/* REAL-TIME PROTECTION */}

        <div className="settings-row">

          <div className="settings-row-info">

            <h3>
              {t('realTimeProtection')}
            </h3>

            <p>
              {t('realTimeProtectionDescription')}
            </p>

          </div>


          <Toggle
            enabled={realTimeProtection}
            onToggle={() =>
              setRealTimeProtection(
                !realTimeProtection
              )
            }
            label={t('realTimeProtection')}
          />

        </div>


        {/* RANSOMWARE PROTECTION */}

        <div className="settings-row">

          <div className="settings-row-info">

            <h3>
              {t('ransomwareProtection')}
            </h3>

            <p>
              {t('ransomwareProtectionDescription')}
            </p>

          </div>


          <Toggle
            enabled={ransomwareProtection}
            onToggle={() =>
              setRansomwareProtection(
                !ransomwareProtection
              )
            }
            label={t('ransomwareProtection')}
          />

        </div>


        {/* BEHAVIORAL MONITORING */}

        <div className="settings-row">

          <div className="settings-row-info">

            <h3>
              {t('behavioralMonitoring')}
            </h3>

            <p>
              {t('behavioralMonitoringDescription')}
            </p>

          </div>


          <Toggle
            enabled={behavioralMonitoring}
            onToggle={() =>
              setBehavioralMonitoring(
                !behavioralMonitoring
              )
            }
            label={t('behavioralMonitoring')}
          />

        </div>


        {/* NETWORK PROTECTION */}

        <div className="settings-row">

          <div className="settings-row-info">

            <h3>
              {t('networkProtection')}
            </h3>

            <p>
              {t('networkProtectionDescription')}
            </p>

          </div>


          <Toggle
            enabled={networkProtection}
            onToggle={() =>
              setNetworkProtection(
                !networkProtection
              )
            }
            label={t('networkProtection')}
          />

        </div>

      </section>


      {/* =====================================================
          NOTIFICATIONS
          ===================================================== */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div>

            <h2>
              {t('notifications')}
            </h2>

            <p>
              {t('notificationsDescription')}
            </p>

          </div>

        </div>


        <div className="settings-row">

          <div className="settings-row-info">

            <h3>
              {t('securityNotifications')}
            </h3>

            <p>
              {t('securityNotificationsDescription')}
            </p>

          </div>


          <Toggle
            enabled={notifications}
            onToggle={() =>
              setNotifications(!notifications)
            }
            label={t('securityNotifications')}
          />

        </div>

      </section>


      {/* =====================================================
          ACCOUNT
          ===================================================== */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div>

            <h2>
              {t('account')}
            </h2>

            <p>
              {t('accountDescription')}
            </p>

          </div>

        </div>


        <div className="account-info">

          <div className="account-avatar">
            H
          </div>


          <div className="account-details">

            <h3>
              Harshita
            </h3>

            <p>
              {t('personalDevice')}
            </p>

            <span>
              harshita@cybershield.ai
            </span>

          </div>


          <button
            type="button"
            className="secondary-button"
          >
            {t('editProfile')}
          </button>

        </div>

      </section>


    </div>

  )
}


export default Settings