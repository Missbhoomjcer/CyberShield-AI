import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Payment.css'
import { useLanguage } from '../context/LanguageContext.jsx'

function Payment() {
  const navigate = useNavigate()
  const location = useLocation()
  const { language } = useLanguage()

  const selectedPlan = location.state?.plan || 'Pro'
  const selectedBilling = location.state?.billing || 'Monthly'
  const selectedPrice = location.state?.price || 299

  const [paymentMethod, setPaymentMethod] = useState('card')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  const text = {
    English: {
      paymentSuccessful: 'Payment Successful',
      subscriptionActivated:
        'Your CyberShield-AI subscription has been activated successfully.',
      plan: 'Plan',
      billing: 'Billing',
      amount: 'Amount',
      license: 'License',
      active: 'Active',
      licenseId: 'License ID',
      licenseReady:
        'Your license is ready for activation on your Windows Agent.',
      setupWindowsAgent: 'Set Up Windows Agent',
      goDashboard: 'Go to Dashboard',

      backSubscription: '← Back to Subscription',
      completePurchase: 'Complete Your Purchase',
      activatePlan:
        'Securely activate your CyberShield-AI protection plan.',

      paymentMethod: 'Payment Method',
      creditDebit: 'Credit / Debit Card',
      cardTypes: 'Visa, Mastercard, RuPay',
      upi: 'UPI',
      upiApps: 'Google Pay, PhonePe, BHIM',
      netBanking: 'Net Banking',
      majorBanks: 'All major Indian banks',

      cardDetails: 'Card Details',
      cardNumber: 'Card Number',
      cardNumberPlaceholder: '1234 5678 9012 3456',
      nameOnCard: 'Name on Card',
      namePlaceholder: 'Harshita Teradale',
      expiryDate: 'Expiry Date',
      expiryPlaceholder: 'MM / YY',
      cvv: 'CVV',
      cvvPlaceholder: '123',

      upiDetails: 'UPI Details',
      upiId: 'UPI ID',
      upiPlaceholder: 'yourname@upi',
      upiInfo:
        'You will be redirected to your UPI application to complete the payment.',

      netBankingTitle: 'Net Banking',
      selectBank: 'Select Bank',
      selectYourBank: 'Select your bank',

      securePayment: 'Secure Payment',
      backendPayment:
        'Payment processing will be connected to the backend.',
      processingPayment: 'Processing Payment...',
      pay: 'Pay',

      selectedPlan: 'SELECTED PLAN',
      advancedProtection:
        'Advanced endpoint protection for your device.',
      devices: 'Devices',
      total: 'Total',

      protectionIncluded: 'Protection included',
      realtimeProtection: 'Real-Time Protection',
      ransomwareDetection: 'Ransomware Detection',
      behavioralMonitoring: 'Behavioral Monitoring',
      aiThreatDetection: 'AI Threat Detection',
      quarantineContainment: 'Quarantine & Containment',
      aiSecurityCopilot: 'AI Security Copilot',

      stateBank: 'State Bank of India',
      hdfc: 'HDFC Bank',
      icici: 'ICICI Bank',
      axis: 'Axis Bank',
      kotak: 'Kotak Mahindra Bank',
      otherBank: 'Other Bank'
    },

    Hindi: {
      paymentSuccessful: 'भुगतान सफल',
      subscriptionActivated:
        'आपकी CyberShield-AI सदस्यता सफलतापूर्वक सक्रिय हो गई है।',
      plan: 'प्लान',
      billing: 'बिलिंग',
      amount: 'राशि',
      license: 'लाइसेंस',
      active: 'सक्रिय',
      licenseId: 'लाइसेंस ID',
      licenseReady:
        'आपका लाइसेंस Windows Agent पर सक्रिय करने के लिए तैयार है।',
      setupWindowsAgent: 'Windows Agent सेट अप करें',
      goDashboard: 'डैशबोर्ड पर जाएँ',

      backSubscription: '← सदस्यता पर वापस जाएँ',
      completePurchase: 'अपनी खरीदारी पूरी करें',
      activatePlan:
        'अपने CyberShield-AI सुरक्षा प्लान को सुरक्षित रूप से सक्रिय करें।',

      paymentMethod: 'भुगतान का तरीका',
      creditDebit: 'क्रेडिट / डेबिट कार्ड',
      cardTypes: 'Visa, Mastercard, RuPay',
      upi: 'UPI',
      upiApps: 'Google Pay, PhonePe, BHIM',
      netBanking: 'नेट बैंकिंग',
      majorBanks: 'सभी प्रमुख भारतीय बैंक',

      cardDetails: 'कार्ड विवरण',
      cardNumber: 'कार्ड नंबर',
      cardNumberPlaceholder: '1234 5678 9012 3456',
      nameOnCard: 'कार्ड पर नाम',
      namePlaceholder: 'Harshita Teradale',
      expiryDate: 'समाप्ति तिथि',
      expiryPlaceholder: 'MM / YY',
      cvv: 'CVV',
      cvvPlaceholder: '123',

      upiDetails: 'UPI विवरण',
      upiId: 'UPI ID',
      upiPlaceholder: 'yourname@upi',
      upiInfo:
        'भुगतान पूरा करने के लिए आपको आपके UPI एप्लिकेशन पर भेजा जाएगा।',

      netBankingTitle: 'नेट बैंकिंग',
      selectBank: 'बैंक चुनें',
      selectYourBank: 'अपना बैंक चुनें',

      securePayment: 'सुरक्षित भुगतान',
      backendPayment:
        'भुगतान प्रक्रिया को बैकएंड से जोड़ा जाएगा।',
      processingPayment: 'भुगतान प्रोसेस हो रहा है...',
      pay: 'भुगतान करें',

      selectedPlan: 'चयनित प्लान',
      advancedProtection:
        'आपके डिवाइस के लिए उन्नत एंडपॉइंट सुरक्षा।',
      devices: 'डिवाइस',
      total: 'कुल',

      protectionIncluded: 'शामिल सुरक्षा सुविधाएँ',
      realtimeProtection: 'रियल-टाइम सुरक्षा',
      ransomwareDetection: 'रैनसमवेयर पहचान',
      behavioralMonitoring: 'व्यवहार निगरानी',
      aiThreatDetection: 'AI खतरा पहचान',
      quarantineContainment: 'क्वारंटीन और कंटेनमेंट',
      aiSecurityCopilot: 'AI Security Copilot',

      stateBank: 'भारतीय स्टेट बैंक',
      hdfc: 'HDFC Bank',
      icici: 'ICICI Bank',
      axis: 'Axis Bank',
      kotak: 'Kotak Mahindra Bank',
      otherBank: 'अन्य बैंक'
    }
  }

  const t = (key) => text[language]?.[key] || text.English[key] || key

  const handlePayment = (e) => {
    e.preventDefault()

    setProcessing(true)

    setTimeout(() => {
      setProcessing(false)
      setSuccess(true)
    }, 1500)
  }

  if (success) {
    return (
      <div className="payment-page">
        <div className="payment-success">

          <div className="success-icon">
            ✓
          </div>

          <h1>{t('paymentSuccessful')}</h1>

          <p>
            {t('subscriptionActivated')}
          </p>

          <div className="success-details">

            <div>
              <span>{t('plan')}</span>
              <strong>CyberShield-AI {selectedPlan}</strong>
            </div>

            <div>
              <span>{t('billing')}</span>
              <strong>{selectedBilling}</strong>
            </div>

            <div>
              <span>{t('amount')}</span>
              <strong>
                ₹{selectedPrice.toLocaleString('en-IN')}
              </strong>
            </div>

            <div>
              <span>{t('license')}</span>
              <strong className="active-text">
                {t('active')}
              </strong>
            </div>

          </div>

          <div className="license-box">
            <span>{t('licenseId')}</span>

            <strong>
              CS-{Date.now().toString().slice(-8)}
            </strong>

            <small>
              {t('licenseReady')}
            </small>
          </div>

          <div className="success-actions">

            <button
              className="primary-payment-btn"
              onClick={() => navigate('/windows-agent')}
            >
              {t('setupWindowsAgent')}
            </button>

            <button
              className="secondary-payment-btn"
              onClick={() => navigate('/')}
            >
              {t('goDashboard')}
            </button>

          </div>

        </div>
      </div>
    )
  }

  return (
    <div className="payment-page">

      <div className="payment-header">

        <button
          className="back-btn"
          onClick={() => navigate('/subscription')}
        >
          {t('backSubscription')}
        </button>

        <div>
          <h1>{t('completePurchase')}</h1>

          <p>
            {t('activatePlan')}
          </p>
        </div>

      </div>

      <div className="payment-layout">

        {/* LEFT SIDE */}

        <div className="payment-form-card">

          <div className="payment-section">

            <h2>{t('paymentMethod')}</h2>

            <div className="payment-methods">

              <button
                type="button"
                className={`payment-method ${
                  paymentMethod === 'card' ? 'selected' : ''
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <span className="method-icon">
                  ▣
                </span>

                <span>
                  <strong>{t('creditDebit')}</strong>

                  <small>
                    {t('cardTypes')}
                  </small>
                </span>
              </button>

              <button
                type="button"
                className={`payment-method ${
                  paymentMethod === 'upi' ? 'selected' : ''
                }`}
                onClick={() => setPaymentMethod('upi')}
              >
                <span className="method-icon">
                  ◉
                </span>

                <span>
                  <strong>{t('upi')}</strong>

                  <small>
                    {t('upiApps')}
                  </small>
                </span>
              </button>

              <button
                type="button"
                className={`payment-method ${
                  paymentMethod === 'netbanking' ? 'selected' : ''
                }`}
                onClick={() => setPaymentMethod('netbanking')}
              >
                <span className="method-icon">
                  ▤
                </span>

                <span>
                  <strong>{t('netBanking')}</strong>

                  <small>
                    {t('majorBanks')}
                  </small>
                </span>
              </button>

            </div>

          </div>

          <div className="payment-divider" />

          <form onSubmit={handlePayment}>

            {/* CARD */}

            {paymentMethod === 'card' && (
              <div className="payment-section">

                <h2>{t('cardDetails')}</h2>

                <div className="form-group">

                  <label>
                    {t('cardNumber')}
                  </label>

                  <input
                    type="text"
                    placeholder={t('cardNumberPlaceholder')}
                    maxLength="19"
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    {t('nameOnCard')}
                  </label>

                  <input
                    type="text"
                    placeholder={t('namePlaceholder')}
                    required
                  />

                </div>

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      {t('expiryDate')}
                    </label>

                    <input
                      type="text"
                      placeholder={t('expiryPlaceholder')}
                      required
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      {t('cvv')}
                    </label>

                    <input
                      type="password"
                      placeholder={t('cvvPlaceholder')}
                      maxLength="3"
                      required
                    />

                  </div>

                </div>

              </div>
            )}

            {/* UPI */}

            {paymentMethod === 'upi' && (
              <div className="payment-section">

                <h2>{t('upiDetails')}</h2>

                <div className="form-group">

                  <label>
                    {t('upiId')}
                  </label>

                  <input
                    type="text"
                    placeholder={t('upiPlaceholder')}
                    required
                  />

                </div>

                <div className="payment-info">
                  {t('upiInfo')}
                </div>

              </div>
            )}

            {/* NET BANKING */}

            {paymentMethod === 'netbanking' && (
              <div className="payment-section">

                <h2>{t('netBankingTitle')}</h2>

                <div className="form-group">

                  <label>
                    {t('selectBank')}
                  </label>

                  <select required>

                    <option value="">
                      {t('selectYourBank')}
                    </option>

                    <option>
                      {t('stateBank')}
                    </option>

                    <option>
                      {t('hdfc')}
                    </option>

                    <option>
                      {t('icici')}
                    </option>

                    <option>
                      {t('axis')}
                    </option>

                    <option>
                      {t('kotak')}
                    </option>

                    <option>
                      {t('otherBank')}
                    </option>

                  </select>

                </div>

              </div>
            )}

            <div className="secure-payment">

              <span>🔒</span>

              <div>

                <strong>
                  {t('securePayment')}
                </strong>

                <small>
                  {t('backendPayment')}
                </small>

              </div>

            </div>

            <button
              type="submit"
              className="pay-btn"
              disabled={processing}
            >
              {processing
                ? t('processingPayment')
                : `${t('pay')} ₹${selectedPrice.toLocaleString('en-IN')}`}
            </button>

          </form>

        </div>

        {/* RIGHT SIDE */}

        <div className="order-summary">

          <div className="summary-card">

            <div className="summary-label">
              {t('selectedPlan')}
            </div>

            <h2>
              CyberShield-AI {selectedPlan}
            </h2>

            <p className="summary-description">
              {t('advancedProtection')}
            </p>

            <div className="summary-divider" />

            <div className="summary-row">

              <span>
                {t('plan')}
              </span>

              <strong>
                {selectedPlan}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                {t('billing')}
              </span>

              <strong>
                {selectedBilling}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                {t('devices')}
              </span>

              <strong>
                {selectedPlan === 'Business' ? '5' : '1'}
              </strong>

            </div>

            <div className="summary-divider" />

            <div className="summary-total">

              <span>
                {t('total')}
              </span>

              <strong>
                ₹{selectedPrice.toLocaleString('en-IN')}
              </strong>

            </div>

          </div>

          <div className="protection-summary">

            <h3>
              {t('protectionIncluded')}
            </h3>

            <div>
              ✓ {t('realtimeProtection')}
            </div>

            <div>
              ✓ {t('ransomwareDetection')}
            </div>

            <div>
              ✓ {t('behavioralMonitoring')}
            </div>

            <div>
              ✓ {t('aiThreatDetection')}
            </div>

            <div>
              ✓ {t('quarantineContainment')}
            </div>

            <div>
              ✓ {t('aiSecurityCopilot')}
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Payment