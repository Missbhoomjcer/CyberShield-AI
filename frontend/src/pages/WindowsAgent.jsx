import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import './WindowsAgent.css'

function Icon({ type }) {
  if (type === 'windows') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M3 5.5l8-1.2v7.2H3V5.5z" />
        <path d="M13 4.1L21 3v8.5h-8V4.1z" />
        <path d="M3 12.5h8v7.2L3 18.5v-6z" />
        <path d="M13 12.5h8V21l-8-1.1v-7.4z" />
      </svg>
    )
  }

  if (type === 'download') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M12 3v11" />
        <path d="M7 10l5 5 5-5" />
        <path d="M4 19h16" />
      </svg>
    )
  }

  if (type === 'shield') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    )
  }

  if (type === 'check') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M5 12l4 4 10-10" />
      </svg>
    )
  }

  return null
}

function WindowsAgent() {
  const { language } = useLanguage()

  const [downloading, setDownloading] = useState(false)

  const text = {
    English: {
      title: 'Windows Agent',

      description:
        'Install CyberShield-AI on your Windows device for real-time endpoint protection.',

      setup: 'Agent Setup',

      endpointAgent: 'CYBERSHIELD ENDPOINT AGENT',

      protectTitle:
        'Protect your Windows device',

      protectDescription:
        'Install the CyberShield-AI Windows Agent to enable real-time monitoring, ransomware detection, behavioral analysis and automatic threat protection.',

      version: 'Version 1.0.0',
      windows: 'Windows 10 / 11',
      bit64: '64-bit',

      preparing: 'Preparing Download...',
      download: 'Download for Windows',

      downloadNote:
        'Installer will be provided by CyberShield-AI',

      setupTitle: 'Get protected in 3 steps',

      setupDescription:
        'Complete the setup to activate endpoint protection.',

      downloadStep: 'Download',

      downloadStepDescription:
        'Download the CyberShield-AI Windows Agent installer.',

      installStep: 'Install',

      installStepDescription:
        'Run the installer and complete the Windows setup process.',

      protectedStep: 'Stay Protected',

      protectedStepDescription:
        'Start real-time monitoring and AI-powered ransomware protection.',

      featuresTitle:
        'Protection included with the agent',

      featuresDescription:
        'Security capabilities available on your Windows device.',

      realtimeTitle: 'Real-Time Protection',

      realtimeDescription:
        'Continuously monitor endpoint activity for suspicious behavior.',

      ransomwareTitle: 'Ransomware Detection',

      ransomwareDescription:
        'Detect ransomware-related behavior using AI-powered analysis.',

      behaviorTitle: 'Behavior Monitoring',

      behaviorDescription:
        'Collect system activity and analyze behavioral signals with LSTM.',

      responseTitle: 'Threat Response',

      responseDescription:
        'Connect detected threats to the CyberShield protection and response engine.',

      requirementsTitle: 'System requirements',

      requirementsDescription:
        'Windows 10 or Windows 11 · 64-bit · Internet connection required for dashboard synchronization.',

      downloadAlert:
        'CyberShield Windows Agent download will be connected to the backend installer.',
    },

    Hindi: {
      title: 'Windows एजेंट',

      description:
        'रीयल-टाइम एंडपॉइंट सुरक्षा के लिए अपने Windows डिवाइस पर CyberShield-AI इंस्टॉल करें।',

      setup: 'एजेंट सेटअप',

      endpointAgent: 'CYBERSHIELD ENDPOINT AGENT',

      protectTitle:
        'अपने Windows डिवाइस को सुरक्षित करें',

      protectDescription:
        'रीयल-टाइम निगरानी, रैनसमवेयर डिटेक्शन, व्यवहार विश्लेषण और स्वचालित खतरा सुरक्षा सक्षम करने के लिए CyberShield-AI Windows Agent इंस्टॉल करें।',

      version: 'संस्करण 1.0.0',
      windows: 'Windows 10 / 11',
      bit64: '64-बिट',

      preparing: 'डाउनलोड तैयार हो रहा है...',
      download: 'Windows के लिए डाउनलोड करें',

      downloadNote:
        'इंस्टॉलर CyberShield-AI द्वारा प्रदान किया जाएगा',

      setupTitle:
        '3 चरणों में सुरक्षा प्राप्त करें',

      setupDescription:
        'एंडपॉइंट सुरक्षा सक्रिय करने के लिए सेटअप पूरा करें।',

      downloadStep: 'डाउनलोड करें',

      downloadStepDescription:
        'CyberShield-AI Windows Agent इंस्टॉलर डाउनलोड करें।',

      installStep: 'इंस्टॉल करें',

      installStepDescription:
        'इंस्टॉलर चलाएँ और Windows सेटअप प्रक्रिया पूरी करें।',

      protectedStep: 'सुरक्षित रहें',

      protectedStepDescription:
        'रीयल-टाइम निगरानी और AI-संचालित रैनसमवेयर सुरक्षा शुरू करें।',

      featuresTitle:
        'एजेंट के साथ शामिल सुरक्षा',

      featuresDescription:
        'आपके Windows डिवाइस पर उपलब्ध सुरक्षा क्षमताएँ।',

      realtimeTitle: 'रीयल-टाइम सुरक्षा',

      realtimeDescription:
        'संदिग्ध व्यवहार के लिए एंडपॉइंट गतिविधि की लगातार निगरानी करें।',

      ransomwareTitle: 'रैनसमवेयर डिटेक्शन',

      ransomwareDescription:
        'AI-संचालित विश्लेषण का उपयोग करके रैनसमवेयर से संबंधित व्यवहार का पता लगाएँ।',

      behaviorTitle: 'व्यवहार निगरानी',

      behaviorDescription:
        'सिस्टम गतिविधि एकत्र करें और LSTM के साथ व्यवहार संबंधी संकेतों का विश्लेषण करें।',

      responseTitle: 'खतरे की प्रतिक्रिया',

      responseDescription:
        'पता लगाए गए खतरों को CyberShield सुरक्षा और प्रतिक्रिया इंजन से कनेक्ट करें।',

      requirementsTitle: 'सिस्टम आवश्यकताएँ',

      requirementsDescription:
        'Windows 10 या Windows 11 · 64-बिट · डैशबोर्ड सिंक्रोनाइज़ेशन के लिए इंटरनेट कनेक्शन आवश्यक है।',

      downloadAlert:
        'CyberShield Windows Agent डाउनलोड को बैकएंड इंस्टॉलर से जोड़ा जाएगा।',
    },
  }

  const t = text[language] || text.English

  const handleDownload = () => {
    setDownloading(true)

    setTimeout(() => {
      setDownloading(false)

      alert(t.downloadAlert)
    }, 700)
  }

  return (
    <div className="windows-agent-page">

      {/* HEADER */}
      <div className="windows-agent-header">

        <div>
          <h1>{t.title}</h1>

          <p>
            {t.description}
          </p>
        </div>

        <div className="agent-status">
          <span className="agent-status-dot"></span>
          {t.setup}
        </div>

      </div>


      {/* DOWNLOAD CARD */}
      <section className="agent-download-card">

        <div className="agent-hero-icon">
          <Icon type="windows" />
        </div>

        <div className="agent-download-content">

          <span className="agent-label">
            {t.endpointAgent}
          </span>

          <h2>
            {t.protectTitle}
          </h2>

          <p>
            {t.protectDescription}
          </p>

          <div className="agent-version">

            <span>{t.version}</span>

            <span>{t.windows}</span>

            <span>{t.bit64}</span>

          </div>

          <button
            type="button"
            className="agent-download-btn"
            onClick={handleDownload}
            disabled={downloading}
          >

            <Icon type="download" />

            {downloading
              ? t.preparing
              : t.download}

          </button>

          <span className="agent-download-note">
            {t.downloadNote}
          </span>

        </div>

      </section>


      {/* SETUP STEPS */}
      <section className="agent-section">

        <div className="agent-section-header">

          <h2>
            {t.setupTitle}
          </h2>

          <p>
            {t.setupDescription}
          </p>

        </div>


        <div className="agent-steps">

          <div className="agent-step">

            <div className="step-number">
              1
            </div>

            <div className="step-content">

              <h3>
                {t.downloadStep}
              </h3>

              <p>
                {t.downloadStepDescription}
              </p>

            </div>

          </div>


          <div className="agent-step">

            <div className="step-number">
              2
            </div>

            <div className="step-content">

              <h3>
                {t.installStep}
              </h3>

              <p>
                {t.installStepDescription}
              </p>

            </div>

          </div>


          <div className="agent-step">

            <div className="step-number">
              3
            </div>

            <div className="step-content">

              <h3>
                {t.protectedStep}
              </h3>

              <p>
                {t.protectedStepDescription}
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* FEATURES */}
      <section className="agent-section">

        <div className="agent-section-header">

          <h2>
            {t.featuresTitle}
          </h2>

          <p>
            {t.featuresDescription}
          </p>

        </div>


        <div className="agent-features">

          <div className="agent-feature">

            <div className="feature-icon">
              <Icon type="shield" />
            </div>

            <div>

              <h3>
                {t.realtimeTitle}
              </h3>

              <p>
                {t.realtimeDescription}
              </p>

            </div>

          </div>


          <div className="agent-feature">

            <div className="feature-icon">
              <Icon type="shield" />
            </div>

            <div>

              <h3>
                {t.ransomwareTitle}
              </h3>

              <p>
                {t.ransomwareDescription}
              </p>

            </div>

          </div>


          <div className="agent-feature">

            <div className="feature-icon">
              <Icon type="shield" />
            </div>

            <div>

              <h3>
                {t.behaviorTitle}
              </h3>

              <p>
                {t.behaviorDescription}
              </p>

            </div>

          </div>


          <div className="agent-feature">

            <div className="feature-icon">
              <Icon type="shield" />
            </div>

            <div>

              <h3>
                {t.responseTitle}
              </h3>

              <p>
                {t.responseDescription}
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* REQUIREMENTS */}
      <section className="agent-requirements">

        <div className="requirements-icon">
          <Icon type="check" />
        </div>

        <div>

          <h3>
            {t.requirementsTitle}
          </h3>

          <p>
            {t.requirementsDescription}
          </p>

        </div>

      </section>

    </div>
  )
}

export default WindowsAgent