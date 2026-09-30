import { useNavigate } from 'react-router-dom'
import './Security.css'
import { useLanguage } from '../context/LanguageContext.jsx'

function Security() {
  const navigate = useNavigate()
  const { language } = useLanguage()

  const text = {
    English: {
      builtForSecurity: 'BUILT FOR SECURITY',

      heroTitle1: 'Detect. Decide.',
      heroTitle2: 'Protect.',
      heroDescription:
        'CyberShield-AI combines static analysis, behavioral monitoring and machine learning to provide a unified endpoint security workflow.',

      pipelineLabel: 'THREAT PROTECTION PIPELINE',
      pipelineTitle: 'From detection to response',
      pipelineDescription:
        'Security signals are analyzed and used to determine an appropriate protection response.',

      detect: 'Detect',
      detectDescription:
        'Identify suspicious files, processes and behavioral activity on the endpoint.',

      analyze: 'Analyze',
      analyzeDescription:
        'Apply static machine learning and behavioral analysis to evaluate the detected activity.',

      decide: 'Decide',
      decideDescription:
        'Combine security signals and determine the appropriate threat response.',

      protect: 'Protect',
      protectDescription:
        'Block, contain or quarantine suspicious activity according to the protection policy.',

      technologyLabel: 'SECURITY TECHNOLOGY',
      technologyTitle: 'Multiple layers of analysis',

      staticAnalysis: 'Static Analysis',
      staticDescription:
        'Executable files can be analyzed using extracted PE characteristics and machine learning classification.',

      behavioralAnalysis: 'Behavioral Analysis',
      behavioralDescription:
        'Endpoint activity can be monitored for behavioral patterns associated with suspicious or ransomware-related activity.',

      explainableAnalysis: 'Explainable Analysis',
      explainableDescription:
        'Model outputs can be supported with feature importance and explainability information.',

      threatResponse: 'Threat Response',
      threatResponseDescription:
        'Detected threats can move through a protection workflow including blocking, containment and quarantine.',

      protectionPrinciples: 'PROTECTION PRINCIPLES',
      principlesTitle: 'Security focused on early detection',
      principlesDescription:
        'CyberShield-AI is designed to combine file-based analysis with real-time behavioral signals so suspicious activity can be evaluated from multiple security perspectives.',

      multilayerDetection: 'Multi-layer detection',
      multilayerDescription:
        'Static and behavioral analysis work together.',

      threatScoring: 'Threat scoring',
      threatScoringDescription:
        'Detection results can be converted into actionable risk information.',

      controlledResponse: 'Controlled response',
      controlledResponseDescription:
        'Protection actions can isolate suspicious activity and files.',

      ctaTitle: 'Explore CyberShield-AI',
      ctaDescription:
        'Start exploring the platform and its security capabilities.',
      getStarted: 'Get Started',

      features: 'Features',
      security: 'Security',
      about: 'About',
      signIn: 'Sign In',

      footerDescription:
        'AI-powered ransomware and malware detection.'
    },

    Hindi: {
      builtForSecurity: 'सुरक्षा के लिए बनाया गया',

      heroTitle1: 'पहचानें। निर्णय लें।',
      heroTitle2: 'सुरक्षित रखें।',
      heroDescription:
        'CyberShield-AI एकीकृत एंडपॉइंट सुरक्षा प्रक्रिया प्रदान करने के लिए स्टैटिक विश्लेषण, व्यवहार निगरानी और मशीन लर्निंग को जोड़ता है।',

      pipelineLabel: 'खतरा सुरक्षा प्रक्रिया',
      pipelineTitle: 'पहचान से प्रतिक्रिया तक',
      pipelineDescription:
        'सुरक्षा संकेतों का विश्लेषण किया जाता है और उचित सुरक्षा प्रतिक्रिया निर्धारित की जाती है।',

      detect: 'पहचानें',
      detectDescription:
        'एंडपॉइंट पर संदिग्ध फाइलों, प्रक्रियाओं और व्यवहार संबंधी गतिविधियों की पहचान करें।',

      analyze: 'विश्लेषण करें',
      analyzeDescription:
        'पहचानी गई गतिविधि का मूल्यांकन करने के लिए स्टैटिक मशीन लर्निंग और व्यवहार विश्लेषण लागू करें।',

      decide: 'निर्णय लें',
      decideDescription:
        'सुरक्षा संकेतों को मिलाकर उचित खतरा प्रतिक्रिया निर्धारित करें।',

      protect: 'सुरक्षित रखें',
      protectDescription:
        'सुरक्षा नीति के अनुसार संदिग्ध गतिविधि को ब्लॉक, कंटेन या क्वारंटीन करें।',

      technologyLabel: 'सुरक्षा तकनीक',
      technologyTitle: 'विश्लेषण की कई परतें',

      staticAnalysis: 'स्टैटिक विश्लेषण',
      staticDescription:
        'एक्जीक्यूटेबल फाइलों का विश्लेषण निकाले गए PE फीचर्स और मशीन लर्निंग वर्गीकरण का उपयोग करके किया जा सकता है।',

      behavioralAnalysis: 'व्यवहार विश्लेषण',
      behavioralDescription:
        'संदिग्ध या रैनसमवेयर से संबंधित व्यवहार पैटर्न की पहचान के लिए एंडपॉइंट गतिविधि की निगरानी की जा सकती है।',

      explainableAnalysis: 'व्याख्यात्मक विश्लेषण',
      explainableDescription:
        'मॉडल के परिणामों को फीचर महत्व और एक्सप्लेनेबिलिटी जानकारी के साथ समझाया जा सकता है।',

      threatResponse: 'खतरा प्रतिक्रिया',
      threatResponseDescription:
        'पहचाने गए खतरों को ब्लॉकिंग, कंटेनमेंट और क्वारंटीन सहित सुरक्षा प्रक्रिया के माध्यम से संभाला जा सकता है।',

      protectionPrinciples: 'सुरक्षा सिद्धांत',
      principlesTitle: 'जल्दी खतरे की पहचान पर केंद्रित सुरक्षा',
      principlesDescription:
        'CyberShield-AI को फाइल-आधारित विश्लेषण और रियल-टाइम व्यवहार संकेतों को मिलाकर डिजाइन किया गया है, ताकि संदिग्ध गतिविधि का कई सुरक्षा दृष्टिकोणों से मूल्यांकन किया जा सके।',

      multilayerDetection: 'बहु-स्तरीय पहचान',
      multilayerDescription:
        'स्टैटिक और व्यवहार विश्लेषण एक साथ काम करते हैं।',

      threatScoring: 'खतरा स्कोरिंग',
      threatScoringDescription:
        'पहचान परिणामों को उपयोगी जोखिम जानकारी में बदला जा सकता है।',

      controlledResponse: 'नियंत्रित प्रतिक्रिया',
      controlledResponseDescription:
        'सुरक्षा कार्रवाई संदिग्ध गतिविधि और फाइलों को अलग कर सकती है।',

      ctaTitle: 'CyberShield-AI को एक्सप्लोर करें',
      ctaDescription:
        'प्लेटफॉर्म और इसकी सुरक्षा क्षमताओं को एक्सप्लोर करना शुरू करें।',
      getStarted: 'शुरू करें',

      features: 'फीचर्स',
      security: 'सुरक्षा',
      about: 'हमारे बारे में',
      signIn: 'साइन इन',

      footerDescription:
        'AI-संचालित रैनसमवेयर और मैलवेयर पहचान।'
    }
  }

  const t = (key) =>
    text[language]?.[key] || text.English[key] || key

  return (
    <div className="security-page">

      {/* ================= NAVBAR ================= */}

      <header className="security-navbar">

        <button
          className="security-brand"
          onClick={() => navigate('/')}
        >
          <span className="security-brand-icon">
            ◈
          </span>

          <span>
            CyberShield<span>-AI</span>
          </span>
        </button>

        <nav className="security-nav">

          <button onClick={() => navigate('/features')}>
            {t('features')}
          </button>

          <button className="active">
            {t('security')}
          </button>

          <button onClick={() => navigate('/about')}>
            {t('about')}
          </button>

          <button
            className="security-signin"
            onClick={() => navigate('/login')}
          >
            {t('signIn')}
          </button>

          <button
            className="security-get-started"
            onClick={() => navigate('/login')}
          >
            {t('getStarted')}
          </button>

        </nav>

      </header>


      {/* ================= HERO ================= */}

      <section className="security-hero">

        <div className="security-eyebrow">
          {t('builtForSecurity')}
        </div>

        <h1>
          {t('heroTitle1')}
          <br />
          <span>{t('heroTitle2')}</span>
        </h1>

        <p>
          {t('heroDescription')}
        </p>

      </section>


      {/* ================= SECURITY PIPELINE ================= */}

      <section className="security-pipeline-section">

        <div className="security-section-heading">

          <span>
            {t('pipelineLabel')}
          </span>

          <h2>
            {t('pipelineTitle')}
          </h2>

          <p>
            {t('pipelineDescription')}
          </p>

        </div>


        <div className="security-pipeline">

          <div className="security-pipeline-card">

            <div className="pipeline-number">
              01
            </div>

            <div className="pipeline-icon">
              ◉
            </div>

            <h3>
              {t('detect')}
            </h3>

            <p>
              {t('detectDescription')}
            </p>

          </div>


          <div className="pipeline-arrow">
            →
          </div>


          <div className="security-pipeline-card">

            <div className="pipeline-number">
              02
            </div>

            <div className="pipeline-icon">
              ◈
            </div>

            <h3>
              {t('analyze')}
            </h3>

            <p>
              {t('analyzeDescription')}
            </p>

          </div>


          <div className="pipeline-arrow">
            →
          </div>


          <div className="security-pipeline-card">

            <div className="pipeline-number">
              03
            </div>

            <div className="pipeline-icon">
              ◆
            </div>

            <h3>
              {t('decide')}
            </h3>

            <p>
              {t('decideDescription')}
            </p>

          </div>


          <div className="pipeline-arrow">
            →
          </div>


          <div className="security-pipeline-card">

            <div className="pipeline-number">
              04
            </div>

            <div className="pipeline-icon">
              ✓
            </div>

            <h3>
              {t('protect')}
            </h3>

            <p>
              {t('protectDescription')}
            </p>

          </div>

        </div>

      </section>


      {/* ================= SECURITY TECHNOLOGIES ================= */}

      <section className="security-technologies">

        <div className="security-section-heading">

          <span>
            {t('technologyLabel')}
          </span>

          <h2>
            {t('technologyTitle')}
          </h2>

        </div>


        <div className="security-tech-grid">

          <article className="security-tech-card">

            <div className="tech-icon">
              ML
            </div>

            <h3>
              {t('staticAnalysis')}
            </h3>

            <p>
              {t('staticDescription')}
            </p>

            <strong>
              XGBoost
            </strong>

          </article>


          <article className="security-tech-card">

            <div className="tech-icon">
              AI
            </div>

            <h3>
              {t('behavioralAnalysis')}
            </h3>

            <p>
              {t('behavioralDescription')}
            </p>

            <strong>
              LSTM
            </strong>

          </article>


          <article className="security-tech-card">

            <div className="tech-icon">
              SH
            </div>

            <h3>
              {t('explainableAnalysis')}
            </h3>

            <p>
              {t('explainableDescription')}
            </p>

            <strong>
              SHAP
            </strong>

          </article>


          <article className="security-tech-card">

            <div className="tech-icon">
              QR
            </div>

            <h3>
              {t('threatResponse')}
            </h3>

            <p>
              {t('threatResponseDescription')}
            </p>

            <strong>
              Protection Engine
            </strong>

          </article>

        </div>

      </section>


      {/* ================= SECURITY PRINCIPLES ================= */}

      <section className="security-principles">

        <div>

          <span>
            {t('protectionPrinciples')}
          </span>

          <h2>
            {t('principlesTitle')}
          </h2>

          <p>
            {t('principlesDescription')}
          </p>

        </div>


        <div className="security-principle-list">

          <div>
            <span>01</span>

            <strong>
              {t('multilayerDetection')}
            </strong>

            <p>
              {t('multilayerDescription')}
            </p>
          </div>


          <div>
            <span>02</span>

            <strong>
              {t('threatScoring')}
            </strong>

            <p>
              {t('threatScoringDescription')}
            </p>
          </div>


          <div>
            <span>03</span>

            <strong>
              {t('controlledResponse')}
            </strong>

            <p>
              {t('controlledResponseDescription')}
            </p>
          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="security-cta">

        <h2>
          {t('ctaTitle')}
        </h2>

        <p>
          {t('ctaDescription')}
        </p>

        <button onClick={() => navigate('/login')}>
          {t('getStarted')}
        </button>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="security-footer">

        <div>

          <strong>
            CyberShield<span>-AI</span>
          </strong>

          <p>
            {t('footerDescription')}
          </p>

        </div>

        <span>
          © 2026 CyberShield-AI
        </span>

      </footer>

    </div>
  )
}

export default Security