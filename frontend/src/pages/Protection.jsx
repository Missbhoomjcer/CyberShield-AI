import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import './Protection.css'


const initialModules = [
  {
    id: 'realtime',
    title: 'Real-Time Protection',
    description: 'Continuously monitors files and system activity',
    type: 'realtime',
  },
  {
    id: 'ransomware',
    title: 'Ransomware Protection',
    description: 'Detects and protects against ransomware behavior',
    type: 'ransomware',
  },
  {
    id: 'behavioral',
    title: 'Behavioral Monitoring',
    description: 'LSTM-based behavioral analysis is active',
    type: 'behavioral',
  },
  {
    id: 'static',
    title: 'AI Threat Detection',
    description: 'XGBoost static analysis for suspicious files',
    type: 'ai',
  },
  {
    id: 'network',
    title: 'Network Protection',
    description: 'Monitors network activity for suspicious behavior',
    type: 'network',
  },
]


function ModuleIcon({ type }) {

  if (type === 'realtime') {

    return (
      <svg viewBox="0 0 24 24">

        <path d="M12 3l7 3v5c0 4.8-3 8.2-7 10-4-1.8-7-5.2-7-10V6l7-3z" />

        <path d="M8.5 12l2.2 2.2 4.8-5" />

      </svg>
    )
  }


  if (type === 'ransomware') {

    return (
      <svg viewBox="0 0 24 24">

        <rect
          x="5"
          y="3"
          width="14"
          height="18"
          rx="2"
        />

        <path d="M9 7h6M9 11h6M9 15h3" />

      </svg>
    )
  }


  if (type === 'behavioral') {

    return (
      <svg viewBox="0 0 24 24">

        <path d="M3 12h4l2-6 4 12 2-6h6" />

      </svg>
    )
  }


  if (type === 'ai') {

    return (
      <svg viewBox="0 0 24 24">

        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />

        <path d="M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2" />

        <circle
          cx="12"
          cy="12"
          r="4"
        />

      </svg>
    )
  }


  return (
    <svg viewBox="0 0 24 24">

      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <path d="M4 12h16M12 4c2 2.2 3 4.9 3 8s-1 5.8-3 8c-2-2.2-3-4.9-3-8s1-5.8 3-8z" />

    </svg>
  )
}


function Protection() {

  const { language } = useLanguage()


  const text = {

    English: {

      title: 'Protection',

      description:
        'Manage your CyberShield security modules.',

      protectionActive:
        'Protection Active',

      protectionLimited:
        'Protection Limited',

      youAreProtected:
        'YOU ARE PROTECTED',

      protectionLimitedLabel:
        'PROTECTION LIMITED',

      deviceSecure:
        'Your device is secure',

      modulesDisabled:
        'Some protection modules are disabled',

      monitoring:
        'CyberShield-AI is monitoring your device for ransomware and malicious activity.',

      modulesActive:
        'Modules active',

      protectionSettings:
        'Protection Settings',

      manageModules:
        'Manage your active security modules.',

      active:
        'Active',

      disabled:
        'Disabled',

      aiPowered:
        'AI-Powered Detection',

      aiDescription:
        'XGBoost analyzes files using 72 static features while LSTM evaluates behavioral activity sequences.',

      automaticResponse:
        'Automatic Response',

      responseDescription:
        'Detected threats can be blocked, contained and moved to quarantine through the protection engine.',

      realtime:
        'Real-Time Protection',

      realtimeDescription:
        'Continuously monitors files and system activity',

      ransomware:
        'Ransomware Protection',

      ransomwareDescription:
        'Detects and protects against ransomware behavior',

      behavioral:
        'Behavioral Monitoring',

      behavioralDescription:
        'LSTM-based behavioral analysis is active',

      aiThreat:
        'AI Threat Detection',

      aiThreatDescription:
        'XGBoost static analysis for suspicious files',

      network:
        'Network Protection',

      networkDescription:
        'Monitors network activity for suspicious behavior',

      toggle:
        'Toggle',

    },


    Hindi: {

      title:
        'सुरक्षा',

      description:
        'अपने CyberShield सुरक्षा मॉड्यूल प्रबंधित करें।',

      protectionActive:
        'सुरक्षा सक्रिय',

      protectionLimited:
        'सुरक्षा सीमित',

      youAreProtected:
        'आप सुरक्षित हैं',

      protectionLimitedLabel:
        'सुरक्षा सीमित',

      deviceSecure:
        'आपका डिवाइस सुरक्षित है',

      modulesDisabled:
        'कुछ सुरक्षा मॉड्यूल बंद हैं',

      monitoring:
        'CyberShield-AI आपके डिवाइस को रैनसमवेयर और दुर्भावनापूर्ण गतिविधि के लिए मॉनिटर कर रहा है।',

      modulesActive:
        'मॉड्यूल सक्रिय',

      protectionSettings:
        'सुरक्षा सेटिंग्स',

      manageModules:
        'अपने सक्रिय सुरक्षा मॉड्यूल प्रबंधित करें।',

      active:
        'सक्रिय',

      disabled:
        'बंद',

      aiPowered:
        'AI-संचालित पहचान',

      aiDescription:
        'XGBoost 72 स्टैटिक फीचर्स का उपयोग करके फाइलों का विश्लेषण करता है, जबकि LSTM व्यवहारिक गतिविधि सीक्वेंस का मूल्यांकन करता है।',

      automaticResponse:
        'स्वचालित प्रतिक्रिया',

      responseDescription:
        'पता लगाए गए खतरों को प्रोटेक्शन इंजन के माध्यम से ब्लॉक, कंटेन और क्वारंटीन में भेजा जा सकता है।',

      realtime:
        'रीयल-टाइम सुरक्षा',

      realtimeDescription:
        'फाइलों और सिस्टम गतिविधि की लगातार निगरानी करता है',

      ransomware:
        'रैनसमवेयर सुरक्षा',

      ransomwareDescription:
        'रैनसमवेयर व्यवहार का पता लगाता है और उससे सुरक्षा करता है',

      behavioral:
        'व्यवहारिक मॉनिटरिंग',

      behavioralDescription:
        'LSTM-आधारित व्यवहार विश्लेषण सक्रिय है',

      aiThreat:
        'AI खतरा पहचान',

      aiThreatDescription:
        'संदिग्ध फाइलों के लिए XGBoost स्टैटिक विश्लेषण',

      network:
        'नेटवर्क सुरक्षा',

      networkDescription:
        'संदिग्ध व्यवहार के लिए नेटवर्क गतिविधि की निगरानी करता है',

      toggle:
        'टॉगल',

    },

  }


  const t =
    text[language] ||
    text.English


  const getModuleText = (id) => {

    const modules = {

      realtime: {
        title: t.realtime,
        description: t.realtimeDescription,
      },

      ransomware: {
        title: t.ransomware,
        description: t.ransomwareDescription,
      },

      behavioral: {
        title: t.behavioral,
        description: t.behavioralDescription,
      },

      static: {
        title: t.aiThreat,
        description: t.aiThreatDescription,
      },

      network: {
        title: t.network,
        description: t.networkDescription,
      },

    }


    return modules[id]
  }


  const [modules, setModules] = useState(
    initialModules.map((module) => ({
      ...module,
      enabled: true,
    }))
  )


  const toggleModule = (id) => {

    setModules((current) =>
      current.map((module) =>
        module.id === id
          ? {
              ...module,
              enabled: !module.enabled,
            }
          : module
      )
    )

  }


  const enabledCount =
    modules.filter(
      (module) => module.enabled
    ).length


  const allEnabled =
    enabledCount === modules.length


  return (

    <div className="protection-page">


      {/* =================================
          HEADER
      ================================= */}

      <div className="protection-header">

        <div>

          <h1>
            {t.title}
          </h1>

          <p>
            {t.description}
          </p>

        </div>


        <div
          className={`protection-overall-status ${
            allEnabled
              ? 'status-active'
              : 'status-limited'
          }`}
        >

          <span className="overall-dot" />

          <span>
            {allEnabled
              ? t.protectionActive
              : t.protectionLimited}
          </span>

        </div>

      </div>


      {/* =================================
          PROTECTION BANNER
      ================================= */}

      <section className="protection-banner">


        <div className="protection-banner-icon">

          <svg viewBox="0 0 24 24">

            <path d="M12 3l7 3v5c0 4.8-3 8.2-7 10-4-1.8-7-5.2-7-10V6l7-3z" />

            <path d="M8.5 12l2.2 2.2 4.8-5" />

          </svg>

        </div>


        <div className="protection-banner-content">

          <span className="protection-label">

            {allEnabled
              ? t.youAreProtected
              : t.protectionLimitedLabel}

          </span>


          <h2>

            {allEnabled
              ? t.deviceSecure
              : t.modulesDisabled}

          </h2>


          <p>
            {t.monitoring}
          </p>

        </div>


        <div className="protection-banner-status">

          <strong>
            {enabledCount}/{modules.length}
          </strong>

          <span>
            {t.modulesActive}
          </span>

        </div>

      </section>


      {/* =================================
          PROTECTION SETTINGS
      ================================= */}

      <section className="protection-section">


        <div className="section-heading">

          <div>

            <h2>
              {t.protectionSettings}
            </h2>

            <p>
              {t.manageModules}
            </p>

          </div>


          <div className="module-count">

            {enabledCount}/{modules.length}{' '}

            {t.active}

          </div>

        </div>


        <div className="protection-card">


          {modules.map((module) => {

            const moduleText =
              getModuleText(module.id)


            return (

              <div
                className={`protection-module ${
                  !module.enabled
                    ? 'module-disabled'
                    : ''
                }`}
                key={module.id}
              >


                <div
                  className={`module-icon module-${module.type}`}
                >

                  <ModuleIcon
                    type={module.type}
                  />

                </div>


                <div className="module-info">

                  <h3>
                    {moduleText.title}
                  </h3>

                  <p>
                    {moduleText.description}
                  </p>

                </div>


                <div className="module-status">

                  <span
                    className={
                      module.enabled
                        ? 'module-status-text active'
                        : 'module-status-text disabled'
                    }
                  >

                    {module.enabled
                      ? t.active
                      : t.disabled}

                  </span>


                  <button
                    type="button"
                    className={`toggle ${
                      module.enabled
                        ? 'toggle-on'
                        : ''
                    }`}
                    onClick={() =>
                      toggleModule(module.id)
                    }
                    aria-label={`${t.toggle} ${moduleText.title}`}
                    aria-pressed={
                      module.enabled
                    }
                  >

                    <span className="toggle-knob" />

                  </button>

                </div>

              </div>

            )

          })}

        </div>

      </section>


      {/* =================================
          SECURITY INFORMATION
      ================================= */}

      <section className="protection-info-grid">


        <div className="info-card">


          <div className="info-card-icon ai-info">
            AI
          </div>


          <div>

            <h3>
              {t.aiPowered}
            </h3>

            <p>
              {t.aiDescription}
            </p>

          </div>

        </div>


        <div className="info-card">


          <div className="info-card-icon response-info">

            <svg viewBox="0 0 24 24">

              <path d="M5 12l4 4 10-10" />

            </svg>

          </div>


          <div>

            <h3>
              {t.automaticResponse}
            </h3>

            <p>
              {t.responseDescription}
            </p>

          </div>

        </div>


      </section>

    </div>
  )
}


export default Protection