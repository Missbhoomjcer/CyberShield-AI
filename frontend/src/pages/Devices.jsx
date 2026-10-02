import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import './Devices.css'


function ComputerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21H16" />
      <path d="M12 17V21" />
    </svg>
  )
}


function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3L19 6V11C19 15.5 16.2 19.1 12 21C7.8 19.1 5 15.5 5 11V6L12 3Z" />
      <path d="M8.5 12L10.8 14.3L15.5 9.6" />
    </svg>
  )
}


function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11A8 8 0 0 0 5.2 7" />
      <path d="M5 4V8H9" />
      <path d="M4 13A8 8 0 0 0 18.8 17" />
      <path d="M19 20V16H15" />
    </svg>
  )
}


function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5V19" />
      <path d="M5 12H19" />
    </svg>
  )
}


function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12L10 17L19 7" />
    </svg>
  )
}


function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6L18 18" />
      <path d="M18 6L6 18" />
    </svg>
  )
}


function Devices() {

  const { language } = useLanguage()

  const [refreshing, setRefreshing] = useState(false)

  const [showAddDevice, setShowAddDevice] = useState(false)

  const [deviceName, setDeviceName] = useState('')

  const [operatingSystem, setOperatingSystem] =
    useState('Windows 11')

  const [registeredDevices, setRegisteredDevices] = useState([
    {
      id: 'CS-WIN-001',
      name: "Harshita's Windows PC",
      os: 'Windows',
      status: 'Online',
      lastSeen: 'Just now',
      agent: 'Connected',
      protected: true,
      modules: 4
    }
  ])


  const text = {

    English: {

      title: 'Devices',

      description:
        'Manage and monitor devices protected by CyberShield-AI.',

      refresh: 'Refresh',

      refreshing: 'Refreshing...',

      totalDevices: 'Total Devices',

      protected: 'Protected',

      agentStatus: 'Agent Status',

      online: 'Online',

      offline: 'Offline',

      protectedDevices: 'Protected Devices',

      protectedDevicesDescription:
        'Devices currently registered with your CyberShield-AI account.',

      addDevice: 'Add Device',

      deviceDescription:
        'Windows endpoint protected by CyberShield-AI Agent',

      deviceId: 'Device ID:',

      lastSeen: 'Last seen:',

      justNow: 'Just now',

      agent: 'Agent:',

      connected: 'Connected',

      protectedStatus: 'Protected',

      allModulesActive:
        'All protection modules active',

      protectionModules: 'Protection Modules',

      realTimeProtection: 'Real-Time Protection',

      ransomwareProtection: 'Ransomware Protection',

      behavioralMonitoring: 'Behavioral Monitoring',

      aiThreatDetection: 'AI Threat Detection',

      active: 'Active',

      endpointAgent:
        'CYBERSHIELD ENDPOINT AGENT',

      windowsAgent:
        'Windows Agent',

      agentDescription:
        'The endpoint agent continuously monitors system activity, detects suspicious behavior, and communicates security events with CyberShield-AI.',

      lastHeartbeat:
        'Last heartbeat:',

      note:
        'Device registration, agent status, licensing, and device management will be synchronized with the CyberShield-AI backend.',

      addDeviceTitle:
        'Add New Device',

      addDeviceDescription:
        'Register a device with your CyberShield-AI account.',

      deviceName:
        'Device Name',

      deviceNamePlaceholder:
        'Enter device name',

      operatingSystem:
        'Operating System',

      windows10:
        'Windows 10',

      windows11:
        'Windows 11',

      deviceIdLabel:
        'Device ID',

      generatedAutomatically:
        'Generated automatically',

      cancel:
        'Cancel',

      registerDevice:
        'Register Device',

      deviceAdded:
        'Device registered successfully.',

      requiredDeviceName:
        'Please enter a device name.',

      registrationNote:
        'Backend registration will be connected after the final API contract is confirmed.'
    },


    Hindi: {

      title: 'डिवाइस',

      description:
        'CyberShield-AI द्वारा सुरक्षित डिवाइस को प्रबंधित और मॉनिटर करें।',

      refresh: 'रिफ्रेश',

      refreshing: 'रिफ्रेश हो रहा है...',

      totalDevices: 'कुल डिवाइस',

      protected: 'सुरक्षित',

      agentStatus: 'एजेंट स्थिति',

      online: 'ऑनलाइन',

      offline: 'ऑफलाइन',

      protectedDevices: 'सुरक्षित डिवाइस',

      protectedDevicesDescription:
        'आपके CyberShield-AI खाते के साथ वर्तमान में पंजीकृत डिवाइस।',

      addDevice: 'डिवाइस जोड़ें',

      deviceDescription:
        'CyberShield-AI Agent द्वारा सुरक्षित Windows एंडपॉइंट',

      deviceId: 'डिवाइस ID:',

      lastSeen: 'अंतिम बार देखा गया:',

      justNow: 'अभी',

      agent: 'एजेंट:',

      connected: 'कनेक्टेड',

      protectedStatus: 'सुरक्षित',

      allModulesActive:
        'सभी सुरक्षा मॉ्यूल सक्रिय हैं',

      protectionModules: 'सुरक्षा मॉ्यूल',

      realTimeProtection:
        'रियल-टाइम सुरक्षा',

      ransomwareProtection:
        'रैनसमवेयर सुरक्षा',

      behavioralMonitoring:
        'व्यवहारिक निगरानी',

      aiThreatDetection:
        'AI खतरा पहचान',

      active: 'सक्रिय',

      endpointAgent:
        'CYBERSHIELD ENDPOINT AGENT',

      windowsAgent:
        'Windows एजेंट',

      agentDescription:
        'एंडपॉइंट एजेंट लगातार सिस्टम गतिविधि की निगरानी करता है, संदिग्ध व्यवहार का पता लगाता है और सुरक्षा घटनाओं को CyberShield-AI के साथ साझा करता है।',

      lastHeartbeat:
        'अंतिम हार्टबीट:',

      note:
        'डिवाइस पंजीकरण, एजेंट स्थिति, लाइसेंसिंग और डिवाइस प्रबंधन CyberShield-AI बैकएंड के साथ सिंक्रोनाइज़ किए जाएंगे।',

      addDeviceTitle:
        'नया डिवाइस जोड़ें',

      addDeviceDescription:
        'अपने CyberShield-AI खाते के साथ एक डिवाइस पंजीकृत करें।',

      deviceName:
        'डिवाइस का नाम',

      deviceNamePlaceholder:
        'डिवाइस का नाम दर्ज करें',

      operatingSystem:
        'ऑपरेटिंग सिस्टम',

      windows10:
        'Windows 10',

      windows11:
        'Windows 11',

      deviceIdLabel:
        'डिवाइस ID',

      generatedAutomatically:
        'स्वचालित रूप से बनाया जाएगा',

      cancel:
        'रद्द करें',

      registerDevice:
        'डिवाइस पंजीकृत करें',

      deviceAdded:
        'डिवाइस सफलतापूर्वक पंजीकृत हो गया।',

      requiredDeviceName:
        'कृपया डिवाइस का नाम दर्ज करें।',

      registrationNote:
        'अंतिम API कॉन्ट्रैक्ट की पुष्टि होने के बाद बैकएंड पंजीकरण जोड़ा जाएगा।'
    }
  }


  const t = text[language] || text.English


  const handleRefresh = () => {

    if (refreshing) return

    setRefreshing(true)

    setTimeout(() => {
      setRefreshing(false)
    }, 800)
  }


  const generateDeviceId = () => {

    const number =
      String(registeredDevices.length + 1).padStart(3, '0')

    return `CS-WIN-${number}`
  }


  const handleAddDevice = () => {

    if (!deviceName.trim()) {
      alert(t.requiredDeviceName)
      return
    }

    const newDevice = {

      id: generateDeviceId(),

      name: deviceName.trim(),

      os:
        operatingSystem.startsWith('Windows')
          ? 'Windows'
          : operatingSystem,

      status: 'Online',

      lastSeen: t.justNow,

      agent: t.connected,

      protected: true,

      modules: 4
    }


    setRegisteredDevices((previousDevices) => [
      ...previousDevices,
      newDevice
    ])


    setDeviceName('')

    setOperatingSystem('Windows 11')

    setShowAddDevice(false)

    alert(t.deviceAdded)
  }


  return (

    <div className="devices-page">


      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="devices-header">

        <div>

          <h1>
            {t.title}
          </h1>

          <p>
            {t.description}
          </p>

        </div>


        <button
          type="button"
          className="devices-refresh-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >

          <RefreshIcon />

          {refreshing
            ? t.refreshing
            : t.refresh}

        </button>

      </div>


      {/* =====================================================
          DEVICE SUMMARY
          ===================================================== */}

      <div className="devices-summary-grid">


        <div className="device-summary-card">

          <div className="device-summary-icon blue">
            <ComputerIcon />
          </div>

          <div>

            <span>
              {t.totalDevices}
            </span>

            <strong>
              {registeredDevices.length}
            </strong>

          </div>

        </div>


        <div className="device-summary-card">

          <div className="device-summary-icon green">
            <ShieldIcon />
          </div>

          <div>

            <span>
              {t.protected}
            </span>

            <strong>
              {
                registeredDevices.filter(
                  device => device.protected
                ).length
              }
            </strong>

          </div>

        </div>


        <div className="device-summary-card">

          <div className="device-summary-icon green">
            <CheckIcon />
          </div>

          <div>

            <span>
              {t.agentStatus}
            </span>

            <strong>
              {t.online}
            </strong>

          </div>

        </div>

      </div>


      {/* =====================================================
          DEVICE PANEL
          ===================================================== */}

      <section className="devices-panel">


        <div className="devices-panel-header">

          <div>

            <h2>
              {t.protectedDevices}
            </h2>

            <p>
              {t.protectedDevicesDescription}
            </p>

          </div>


          <button
            type="button"
            className="add-device-button"
            onClick={() => setShowAddDevice(true)}
          >

            <PlusIcon />

            {t.addDevice}

          </button>

        </div>


        {/* ===================================================
            DEVICE LIST
            =================================================== */}

        {registeredDevices.map((device) => (

          <div
            className="device-card"
            key={device.id}
          >

            <div className="device-main">

              <div className="device-computer-icon">
                <ComputerIcon />
              </div>


              <div className="device-information">

                <div className="device-name-row">

                  <h3>
                    {device.name}
                  </h3>

                  <span className="device-online-badge">

                    <span></span>

                    {t.online}

                  </span>

                </div>


                <p className="device-description">
                  {t.deviceDescription}
                </p>


                <div className="device-meta">

                  <span>
                    {t.deviceId} {device.id}
                  </span>

                  <span>
                    {t.lastSeen} {device.lastSeen}
                  </span>

                  <span>
                    {t.agent} {device.agent}
                  </span>

                </div>

              </div>

            </div>


            <div className="device-security-status">

              <div className="device-security-icon">
                <ShieldIcon />
              </div>

              <div>

                <strong>
                  {t.protectedStatus}
                </strong>

                <span>
                  {t.allModulesActive}
                </span>

              </div>

            </div>

          </div>

        ))}


        {/* ===================================================
            PROTECTION MODULES
            =================================================== */}

        <div className="device-modules">

          <h3>
            {t.protectionModules}
          </h3>


          <div className="device-module-grid">


            <div className="device-module">

              <div className="module-check">
                <CheckIcon />
              </div>

              <div>

                <strong>
                  {t.realTimeProtection}
                </strong>

                <span>
                  {t.active}
                </span>

              </div>

            </div>


            <div className="device-module">

              <div className="module-check">
                <CheckIcon />
              </div>

              <div>

                <strong>
                  {t.ransomwareProtection}
                </strong>

                <span>
                  {t.active}
                </span>

              </div>

            </div>


            <div className="device-module">

              <div className="module-check">
                <CheckIcon />
              </div>

              <div>

                <strong>
                  {t.behavioralMonitoring}
                </strong>

                <span>
                  {t.active}
                </span>

              </div>

            </div>


            <div className="device-module">

              <div className="module-check">
                <CheckIcon />
              </div>

              <div>

                <strong>
                  {t.aiThreatDetection}
                </strong>

                <span>
                  {t.active}
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* ===================================================
            AGENT INFORMATION
            =================================================== */}

        <div className="agent-information">

          <div>

            <span className="agent-label">
              {t.endpointAgent}
            </span>

            <h3>
              {t.windowsAgent}
            </h3>

            <p>
              {t.agentDescription}
            </p>

          </div>


          <div className="agent-status">

            <span className="agent-status-dot"></span>

            <div>

              <strong>
                {t.connected}
              </strong>

              <span>
                {t.lastHeartbeat} {t.justNow}
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER NOTE
          ===================================================== */}

      <div className="devices-note">

        <ShieldIcon />

        <span>
          {t.note}
        </span>

      </div>


      {/* =====================================================
          ADD DEVICE MODAL
          ===================================================== */}

      {showAddDevice && (

        <div
          className="add-device-modal-overlay"
          onClick={() => setShowAddDevice(false)}
        >

          <div
            className="add-device-modal"
            onClick={(event) => event.stopPropagation()}
          >


            <div className="add-device-modal-header">

              <div>

                <h2>
                  {t.addDeviceTitle}
                </h2>

                <p>
                  {t.addDeviceDescription}
                </p>

              </div>


              <button
                type="button"
                className="add-device-close"
                onClick={() => setShowAddDevice(false)}
                aria-label="Close"
              >
                <CloseIcon />
              </button>

            </div>


            {/* DEVICE NAME */}

            <div className="add-device-form-group">

              <label>
                {t.deviceName}
              </label>

              <input
                type="text"
                value={deviceName}
                onChange={(event) =>
                  setDeviceName(event.target.value)
                }
                placeholder={t.deviceNamePlaceholder}
                autoFocus
              />

            </div>


            {/* OPERATING SYSTEM */}

            <div className="add-device-form-group">

              <label>
                {t.operatingSystem}
              </label>

              <select
                value={operatingSystem}
                onChange={(event) =>
                  setOperatingSystem(event.target.value)
                }
              >

                <option value="Windows 11">
                  {t.windows11}
                </option>

                <option value="Windows 10">
                  {t.windows10}
                </option>

              </select>

            </div>


            {/* DEVICE ID */}

            <div className="add-device-form-group">

              <label>
                {t.deviceIdLabel}
              </label>

              <div className="generated-device-id">
                {generateDeviceId()}
              </div>

              <small>
                {t.generatedAutomatically}
              </small>

            </div>


            {/* NOTE */}

            <div className="add-device-registration-note">

              <ShieldIcon />

              <span>
                {t.registrationNote}
              </span>

            </div>


            {/* ACTIONS */}

            <div className="add-device-modal-actions">

              <button
                type="button"
                className="add-device-cancel-button"
                onClick={() => setShowAddDevice(false)}
              >
                {t.cancel}
              </button>


              <button
                type="button"
                className="add-device-register-button"
                onClick={handleAddDevice}
              >
                <PlusIcon />
                {t.registerDevice}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}


export default Devices