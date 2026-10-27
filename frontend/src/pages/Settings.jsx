
import { useEffect, useState } from 'react'
import './Settings.css'
import { useLanguage } from '../context/LanguageContext.jsx'

function getLoggedInUser() {
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

function getInitialProfile() {
  const user = getLoggedInUser()

  const email =
    user.email ||
    user.user_email ||
    sessionStorage.getItem('user_email') ||
    ''

  return {
    name:
      user.displayName ||
      user.name ||
      user.full_name ||
      sessionStorage.getItem('cybershield_user_name') ||
      sessionStorage.getItem('user_name') ||
      sessionStorage.getItem('userName') ||
      sessionStorage.getItem('username') ||
      email.split('@')[0] ||
      'User',
    email,
    device: user.deviceName || 'Personal Device',
  }
}

function Settings() {
  const { language, setLanguage, t } = useLanguage()

  const [realTimeProtection, setRealTimeProtection] = useState(true)
  const [ransomwareProtection, setRansomwareProtection] = useState(true)
  const [behavioralMonitoring, setBehavioralMonitoring] = useState(true)
  const [networkProtection, setNetworkProtection] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [autoUpdates, setAutoUpdates] = useState(true)

  const [profile, setProfile] = useState(getInitialProfile)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [draftProfile, setDraftProfile] = useState(profile)
  const [saveMessage, setSaveMessage] = useState('')

  const userName = profile.name || 'User'
  const userEmail = profile.email || ''

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

  const openProfileEditor = () => {
    setDraftProfile({ ...profile })
    setSaveMessage('')
    setEditProfileOpen(true)
  }

  const closeProfileEditor = () => {
    setEditProfileOpen(false)
    setSaveMessage('')
  }

  const handleProfileChange = (event) => {
    const { name, value } = event.target

    setDraftProfile((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const saveProfile = (event) => {
    event.preventDefault()

    const name = draftProfile.name.trim()
    const email = draftProfile.email.trim()
    const device = draftProfile.device.trim()

    if (!name) {
      setSaveMessage('Please enter your name.')
      return
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSaveMessage('Please enter a valid email address.')
      return
    }

    const updatedProfile = { name, email, device: device || 'Personal Device' }

    try {
      // Update the existing user object without discarding other fields.
      const existingUser = getLoggedInUser()

      const updatedUser = {
        ...existingUser,
        name,
        displayName: name,
        email,
        deviceName: updatedProfile.device,
      }

      sessionStorage.setItem(
        'cybershield_user',
        JSON.stringify(updatedUser),
      )
      sessionStorage.setItem('cybershield_user_name', name)
      sessionStorage.setItem('user_name', name)
      sessionStorage.setItem('userName', name)
      sessionStorage.setItem('username', name)

      if (email) {
        sessionStorage.setItem('user_email', email)
      } else {
        sessionStorage.removeItem('user_email')
      }

      setProfile(updatedProfile)
      setEditProfileOpen(false)
      setSaveMessage('')

      // Notify other components in this browser tab.
      window.dispatchEvent(new Event('cybershield-user-updated'))
    } catch (error) {
      console.error('Unable to save profile:', error)
      setSaveMessage('Unable to save your profile. Please try again.')
    }
  }

  useEffect(() => {
    if (!editProfileOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeProfileEditor()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [editProfileOpen])

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

        <div className="settings-row">
          <div className="settings-row-info">
            <h3>{t('realTimeProtection')}</h3>
            <p>{t('realTimeProtectionDescription')}</p>
          </div>

          <Toggle
            enabled={realTimeProtection}
            onToggle={() => setRealTimeProtection((previous) => !previous)}
            label={t('realTimeProtection')}
          />
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <h3>{t('ransomwareProtection')}</h3>
            <p>{t('ransomwareProtectionDescription')}</p>
          </div>

          <Toggle
            enabled={ransomwareProtection}
            onToggle={() => setRansomwareProtection((previous) => !previous)}
            label={t('ransomwareProtection')}
          />
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <h3>{t('behavioralMonitoring')}</h3>
            <p>{t('behavioralMonitoringDescription')}</p>
          </div>

          <Toggle
            enabled={behavioralMonitoring}
            onToggle={() => setBehavioralMonitoring((previous) => !previous)}
            label={t('behavioralMonitoring')}
          />
        </div>

        <div className="settings-row">
          <div className="settings-row-info">
            <h3>{t('networkProtection')}</h3>
            <p>{t('networkProtectionDescription')}</p>
          </div>

          <Toggle
            enabled={networkProtection}
            onToggle={() => setNetworkProtection((previous) => !previous)}
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
            onClick={openProfileEditor}
          >
            {t('editProfile')}
          </button>
        </div>
      </section>

      {/* EDIT PROFILE MODAL */}
      {editProfileOpen && (
        <div
          className="profile-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeProfileEditor()
            }
          }}
        >
          <section
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
          >
            <div className="profile-modal-header">
              <div>
                <h2 id="profile-modal-title">Edit Profile</h2>
                <p>Update your CyberShield AI account details.</p>
              </div>

              <button
                type="button"
                className="profile-modal-close"
                onClick={closeProfileEditor}
                aria-label="Close profile editor"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveProfile}>
              <div className="profile-form-field">
                <label htmlFor="profile-name">Full name</label>
                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  value={draftProfile.name}
                  onChange={handleProfileChange}
                  placeholder="Enter your name"
                  maxLength={80}
                  required
                />
              </div>

              <div className="profile-form-field">
                <label htmlFor="profile-email">Email address</label>
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  value={draftProfile.email}
                  onChange={handleProfileChange}
                  placeholder="Enter your email"
                  maxLength={254}
                />
              </div>

              <div className="profile-form-field">
                <label htmlFor="profile-device">Device name</label>
                <input
                  id="profile-device"
                  name="device"
                  type="text"
                  value={draftProfile.device}
                  onChange={handleProfileChange}
                  placeholder="Personal Device"
                  maxLength={80}
                />
              </div>

              {saveMessage && (
                <p className="profile-form-message" role="alert">
                  {saveMessage}
                </p>
              )}

              <div className="profile-modal-actions">
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={closeProfileEditor}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default Settings
