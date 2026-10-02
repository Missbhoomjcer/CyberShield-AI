import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import './Subscription.css'

function Subscription() {
  const navigate = useNavigate()
  const { language } = useLanguage()

  const [billing, setBilling] = useState('Yearly')

  const prices = {
    Pro:
      billing === 'Monthly'
        ? 299
        : billing === 'Quarterly'
          ? 799
          : 2999,

    Business:
      billing === 'Monthly'
        ? 799
        : billing === 'Quarterly'
          ? 2099
          : 7999
  }

  const text = {
    English: {
      title: 'Subscription',
      description:
        'Manage your CyberShield-AI protection plan and license.',

      freePlanActive: 'Free Plan Active',

      currentPlan: 'CURRENT PLAN',
      freePlan: 'CyberShield-AI Free',
      currentPlanDescription:
        'Your account is currently protected with the Free plan.',

      licenseStatus: 'License Status',
      active: 'Active',
      noExpiry: 'No expiry',

      chooseProtection: 'Choose your protection',
      chooseProtectionDescription:
        'Select a plan based on the level of endpoint protection you need.',

      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',

      free: 'Free',
      freeDescription:
        'Basic protection for personal use.',

      year: 'year',
      month: 'month',
      quarter: 'quarter',

      includes: 'Includes:',

      manualScanning: 'Manual file scanning',
      basicThreatDetection: 'Basic threat detection',
      securityDashboard: 'Security dashboard',
      threatHistory: 'Threat history',

      currentPlanButton: 'Current Plan',

      recommendedPlan: 'Recommended Plan',

      proDescription:
        'Advanced endpoint protection for individuals.',

      realtimeProtection: 'Real-time protection',
      ransomwareProtection: 'Ransomware protection',
      behavioralMonitoring: 'Behavioral monitoring',
      aiThreatDetection: 'AI threat detection',
      quarantineContainment: 'Quarantine & containment',
      aiCopilot: 'AI Security Copilot',

      upgrade: 'Upgrade',

      business: 'Business',
      businessDescription:
        'Centralized protection for teams and devices.',

      everythingInPro: 'Everything in Pro',
      multipleDeviceManagement:
        'Multiple device management',
      centralizedDashboard:
        'Centralized security dashboard',
      advancedThreatHistory:
        'Advanced threat history',
      deviceMonitoring: 'Device monitoring',
      prioritySupport:
        'Priority security support',

      choosePlan: 'Choose Plan',

      licenseDeviceProtection:
        'License & Device Protection',

      licenseDescription:
        'Your subscription will determine the number of protected devices, available security features, and license duration.',

      devices: 'Devices',
      plan: 'Plan',

      backendNote:
        'Payment processing, license generation, activation, expiry, and subscription synchronization will be connected to the backend.',
    },

    Hindi: {
      title: 'सब्सक्रिप्शन',
      description:
        'अपने CyberShield-AI सुरक्षा प्लान और लाइसेंस को प्रबंधित करें।',

      freePlanActive: 'फ्री प्लान सक्रिय',

      currentPlan: 'वर्तमान प्लान',
      freePlan: 'CyberShield-AI फ्री',
      currentPlanDescription:
        'आपका खाता वर्तमान में फ्री प्लान द्वारा सुरक्षित है।',

      licenseStatus: 'लाइसेंस स्थिति',
      active: 'सक्रिय',
      noExpiry: 'कोई समाप्ति नहीं',

      chooseProtection: 'अपनी सुरक्षा चुनें',
      chooseProtectionDescription:
        'आपको आवश्यक एंडपॉइंट सुरक्षा के स्तर के आधार पर प्लान चुनें।',

      monthly: 'मासिक',
      quarterly: 'त्रैमासिक',
      yearly: 'वार्षिक',

      free: 'फ्री',
      freeDescription:
        'व्यक्तिगत उपयोग के लिए बुनियादी सुरक्षा।',

      year: 'वर्ष',
      month: 'महीना',
      quarter: 'तिमाही',

      includes: 'शामिल है:',

      manualScanning: 'मैनुअल फ़ाइल स्कैनिंग',
      basicThreatDetection: 'बेसिक खतरा पहचान',
      securityDashboard: 'सुरक्षा डैशबोर्ड',
      threatHistory: 'खतरे का इतिहास',

      currentPlanButton: 'वर्तमान प्लान',

      recommendedPlan: 'अनुशंसित प्लान',

      proDescription:
        'व्यक्तिगत उपयोगकर्ताओं के लिए उन्नत एंडपॉइंट सुरक्षा।',

      realtimeProtection: 'रीयल-टाइम सुरक्षा',
      ransomwareProtection: 'रैनसमवेयर सुरक्षा',
      behavioralMonitoring: 'व्यवहारिक निगरानी',
      aiThreatDetection: 'AI खतरा पहचान',
      quarantineContainment: 'क्वारंटीन और कंटेनमेंट',
      aiCopilot: 'AI Security Copilot',

      upgrade: 'अपग्रेड करें',

      business: 'बिज़नेस',
      businessDescription:
        'टीम और डिवाइस के लिए केंद्रीकृत सुरक्षा।',

      everythingInPro: 'Pro की सभी सुविधाएँ',
      multipleDeviceManagement:
        'कई डिवाइस प्रबंधन',
      centralizedDashboard:
        'केंद्रीकृत सुरक्षा डैशबोर्ड',
      advancedThreatHistory:
        'उन्नत खतरा इतिहास',
      deviceMonitoring: 'डिवाइस निगरानी',
      prioritySupport:
        'प्राथमिकता सुरक्षा सहायता',

      choosePlan: 'प्लान चुनें',

      licenseDeviceProtection:
        'लाइसेंस और डिवाइस सुरक्षा',

      licenseDescription:
        'आपका सब्सक्रिप्शन सुरक्षित डिवाइस की संख्या, उपलब्ध सुरक्षा सुविधाएँ और लाइसेंस की अवधि निर्धारित करेगा।',

      devices: 'डिवाइस',
      plan: 'प्लान',

      backendNote:
        'भुगतान प्रक्रिया, लाइसेंस निर्माण, सक्रियण, समाप्ति और सब्सक्रिप्शन सिंक्रोनाइज़ेशन को बैकएंड से जोड़ा जाएगा।',
    }
  }

  const t = text[language] || text.English

  const billingLabel =
    billing === 'Monthly'
      ? t.month
      : billing === 'Quarterly'
        ? t.quarter
        : t.year

  const openPayment = (plan, price) => {
    navigate('/payment', {
      state: {
        plan,
        billing,
        price
      }
    })
  }

  return (
    <div className="subscription-page">

      {/* HEADER */}
      <div className="subscription-header">

        <div>
          <h1>{t.title}</h1>

          <p>
            {t.description}
          </p>
        </div>

        <div className="subscription-status">
          <span className="status-dot"></span>
          {t.freePlanActive}
        </div>

      </div>


      {/* CURRENT PLAN */}
      <div className="current-plan-card">

        <div className="current-plan-left">

          <div className="current-plan-icon">

            <svg viewBox="0 0 24 24">
              <path
                d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M9 12l2 2 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

          </div>

          <div>

            <span className="current-plan-label">
              {t.currentPlan}
            </span>

            <h2>
              {t.freePlan}
            </h2>

            <p>
              {t.currentPlanDescription}
            </p>

          </div>

        </div>


        <div className="license-status">

          <span>
            {t.licenseStatus}
          </span>

          <strong>
            {t.active}
          </strong>

          <small>
            {t.noExpiry}
          </small>

        </div>

      </div>


      {/* PLAN SECTION */}
      <div className="choose-plan-header">

        <div>

          <h2>
            {t.chooseProtection}
          </h2>

          <p>
            {t.chooseProtectionDescription}
          </p>

        </div>


        {/* BILLING TOGGLE */}
        <div className="billing-toggle">

          <button
            className={
              billing === 'Monthly'
                ? 'active'
                : ''
            }
            onClick={() =>
              setBilling('Monthly')
            }
          >
            {t.monthly}
          </button>

          <button
            className={
              billing === 'Quarterly'
                ? 'active'
                : ''
            }
            onClick={() =>
              setBilling('Quarterly')
            }
          >
            {t.quarterly}
          </button>

          <button
            className={
              billing === 'Yearly'
                ? 'active'
                : ''
            }
            onClick={() =>
              setBilling('Yearly')
            }
          >
            {t.yearly}
          </button>

        </div>

      </div>


      {/* PLANS */}
      <div className="plans-grid">

        {/* FREE */}
        <div className="plan-card">

          <h3>
            {t.free}
          </h3>

          <p className="plan-description">
            {t.freeDescription}
          </p>

          <div className="plan-price">
            ₹0
            <span>
              /{t.year}
            </span>
          </div>

          <div className="plan-divider"></div>

          <span className="includes-title">
            {t.includes}
          </span>

          <ul className="feature-list">

            <li>
              <span>✓</span>
              {t.manualScanning}
            </li>

            <li>
              <span>✓</span>
              {t.basicThreatDetection}
            </li>

            <li>
              <span>✓</span>
              {t.securityDashboard}
            </li>

            <li>
              <span>✓</span>
              {t.threatHistory}
            </li>

          </ul>

          <button
            className="plan-button secondary"
            disabled
          >
            {t.currentPlanButton}
          </button>

        </div>


        {/* PRO */}
        <div className="plan-card recommended">

          <div className="recommended-badge">
            {t.recommendedPlan}
          </div>

          <h3>
            Pro
          </h3>

          <p className="plan-description">
            {t.proDescription}
          </p>

          <div className="plan-price">

            ₹{prices.Pro.toLocaleString('en-IN')}

            <span>
              /{billingLabel}
            </span>

          </div>

          <div className="plan-divider"></div>

          <span className="includes-title">
            {t.includes}
          </span>

          <ul className="feature-list">

            <li>
              <span>✓</span>
              {t.realtimeProtection}
            </li>

            <li>
              <span>✓</span>
              {t.ransomwareProtection}
            </li>

            <li>
              <span>✓</span>
              {t.behavioralMonitoring}
            </li>

            <li>
              <span>✓</span>
              {t.aiThreatDetection}
            </li>

            <li>
              <span>✓</span>
              {t.quarantineContainment}
            </li>

            <li>
              <span>✓</span>
              {t.aiCopilot}
            </li>

          </ul>

          <button
            className="plan-button primary"
            onClick={() =>
              openPayment(
                'Pro',
                prices.Pro
              )
            }
          >
            {t.upgrade}
          </button>

        </div>


        {/* BUSINESS */}
        <div className="plan-card">

          <h3>
            {t.business}
          </h3>

          <p className="plan-description">
            {t.businessDescription}
          </p>

          <div className="plan-price">

            ₹{prices.Business.toLocaleString('en-IN')}

            <span>
              /{billingLabel}
            </span>

          </div>

          <div className="plan-divider"></div>

          <span className="includes-title">
            {t.includes}
          </span>

          <ul className="feature-list">

            <li>
              <span>✓</span>
              {t.everythingInPro}
            </li>

            <li>
              <span>✓</span>
              {t.multipleDeviceManagement}
            </li>

            <li>
              <span>✓</span>
              {t.centralizedDashboard}
            </li>

            <li>
              <span>✓</span>
              {t.advancedThreatHistory}
            </li>

            <li>
              <span>✓</span>
              {t.deviceMonitoring}
            </li>

            <li>
              <span>✓</span>
              {t.prioritySupport}
            </li>

          </ul>

          <button
            className="plan-button primary"
            onClick={() =>
              openPayment(
                'Business',
                prices.Business
              )
            }
          >
            {t.choosePlan}
          </button>

        </div>

      </div>


      {/* LICENSE */}
      <div className="license-card">

        <div className="license-icon">

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
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

        </div>

        <div className="license-content">

          <h3>
            {t.licenseDeviceProtection}
          </h3>

          <p>
            {t.licenseDescription}
          </p>

        </div>

        <div className="license-stats">

          <div>
            <span>
              {t.devices}
            </span>

            <strong>
              1
            </strong>
          </div>

          <div>
            <span>
              {t.licenseStatus}
            </span>

            <strong className="active-license">
              {t.active}
            </strong>
          </div>

          <div>
            <span>
              {t.plan}
            </span>

            <strong>
              {t.free}
            </strong>
          </div>

        </div>

      </div>


      {/* BACKEND NOTE */}
      <div className="subscription-note">

        <span>♢</span>

        <p>
          {t.backendNote}
        </p>

      </div>

    </div>
  )
}

export default Subscription