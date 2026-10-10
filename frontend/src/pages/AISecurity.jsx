import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import './AISecurity.css'

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2L13.8 9.2L21 11L13.8 12.8L12 20L10.2 12.8L3 11L10.2 9.2L12 2Z" />
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16L21 21" />
    </svg>
  )
}

function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 4.5C7.3 3.2 4.8 4.2 4.8 6.5C3 6.7 2 8.7 2.8 10.3C1.5 11.8 2.3 14.2 4.2 14.6C4.1 16.8 6.4 18.2 8.2 17.2C9 19 11.4 19.4 12 17.5V6C11.5 4.4 10.2 3.5 9 4.5Z" />
      <path d="M15 4.5C16.7 3.2 19.2 4.2 19.2 6.5C21 6.7 22 8.7 21.2 10.3C22.5 11.8 21.7 14.2 19.8 14.6C19.9 16.8 17.6 18.2 15.8 17.2C15 19 12.6 19.4 12 17.5V6C12.5 4.4 13.8 3.5 15 4.5Z" />
      <path d="M7 9H9M15 9H17M7 13H9M15 13H17" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12H19" />
      <path d="M13 6L19 12L13 18" />
    </svg>
  )
}

function AISecurity() {
  const { language } = useLanguage()

  const [question, setQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const [answer, setAnswer] = useState('')

  const text = {
    English: {
      title: 'AI Security',
      description:
        'AI-powered threat analysis and security assistance.',
      engineReady: 'AI Engine Ready',

      copilotLabel: 'CYBERSHIELD AI COPILOT',

      heroTitle:
        'Understand threats with AI-powered security analysis',

      heroDescription:
        'Ask questions about detected threats, suspicious files, ransomware behavior, and recommended security actions.',

      online: 'Online',

      threatAnalysis: 'Threat Analysis',
      threatAnalysisDescription:
        'AI interpretation of security findings',

      latestAnalysis: 'Latest Analysis',
      staticDetection: 'Static ML Detection',

      detectionEngine: 'Detection Engine',
      behaviorEngine: 'Behavior Engine',
      explainability: 'Explainability',

      viewThreatAnalysis: 'View threat analysis',

      securityKnowledge: 'Security Knowledge',
      securityKnowledgeDescription:
        'Threat intelligence and security context',

      ransomwareDetection: 'Ransomware detection',
      malwareBehavior: 'Malware behavior',
      mitreContext: 'MITRE ATT&CK context',
      endpointProtection: 'Endpoint protection',

      exploreKnowledge: 'Explore security knowledge',

      askCopilot: 'Ask AI Security Copilot',
      askCopilotDescription:
        'Ask a security question and get an AI-assisted explanation.',

      questionPlaceholder:
        'Example: Why was this file detected as suspicious?',

      analyzing: 'Analyzing...',
      askAI: 'Ask AI',

      answerLabel: 'AI SECURITY COPILOT',

      aiResponse:
        'AI Security Copilot is ready to analyze threats, explain detection results, and provide security recommendations.',

      recentActivity: 'Recent AI Security Activity',
      recentActivityDescription:
        'AI-assisted security events and analysis.',

      backendReady: 'Backend Ready',

      noHistory: 'No AI analysis history yet',

      noHistoryDescription:
        'AI-generated threat explanations and recommendations will appear here.',
    },

    Hindi: {
      title: 'AI सुरक्षा',
      description:
        'AI-संचालित खतरा विश्लेषण और सुरक्षा सहायता।',
      engineReady: 'AI इंजन तैयार है',

      copilotLabel: 'CYBERSHIELD AI COPILOT',

      heroTitle:
        'AI-संचालित सुरक्षा विश्लेषण के साथ खतरों को समझें',

      heroDescription:
        'पता लगाए गए खतरों, संदिग्ध फ़ाइलों, रैनसमवेयर व्यवहार और अनुशंसित सुरक्षा कार्रवाइयों के बारे में प्रश्न पूछें।',

      online: 'ऑनलाइन',

      threatAnalysis: 'खतरा विश्लेषण',
      threatAnalysisDescription:
        'सुरक्षा निष्कर्षों की AI व्याख्या',

      latestAnalysis: 'नवीनतम विश्लेषण',
      staticDetection: 'स्टैटिक ML डिटेक्शन',

      detectionEngine: 'डिटेक्शन इंजन',
      behaviorEngine: 'व्यवहार इंजन',
      explainability: 'व्याख्या',

      viewThreatAnalysis: 'खतरा विश्लेषण देखें',

      securityKnowledge: 'सुरक्षा ज्ञान',
      securityKnowledgeDescription:
        'खतरा इंटेलिजेंस और सुरक्षा संदर्भ',

      ransomwareDetection: 'रैनसमवेयर डिटेक्शन',
      malwareBehavior: 'मैलवेयर व्यवहार',
      mitreContext: 'MITRE ATT&CK संदर्भ',
      endpointProtection: 'एंडपॉइंट सुरक्षा',

      exploreKnowledge: 'सुरक्षा ज्ञान देखें',

      askCopilot: 'AI Security Copilot से पूछें',
      askCopilotDescription:
        'सुरक्षा प्रश्न पूछें और AI-सहायता प्राप्त व्याख्या प्राप्त करें।',

      questionPlaceholder:
        'उदाहरण: इस फ़ाइल को संदिग्ध क्यों पाया गया?',

      analyzing: 'विश्लेषण हो रहा है...',
      askAI: 'AI से पूछें',

      answerLabel: 'AI SECURITY COPILOT',

      aiResponse:
        'AI Security Copilot खतरों का विश्लेषण करने, डिटेक्शन परिणामों को समझाने और सुरक्षा सुझाव देने के लिए तैयार है।',

      recentActivity: 'हाल की AI सुरक्षा गतिविधि',
      recentActivityDescription:
        'AI-सहायता प्राप्त सुरक्षा घटनाएँ और विश्लेषण।',

      backendReady: 'बैकएंड तैयार',

      noHistory: 'अभी कोई AI विश्लेषण इतिहास नहीं है',

      noHistoryDescription:
        'AI द्वारा बनाए गए खतरे के स्पष्टीकरण और सुरक्षा सुझाव यहाँ दिखाई देंगे।',
    },
  }

  const t = text[language] || text.English

  const handleAsk = async () => {
    const trimmedQuestion = question.trim()

    if (!trimmedQuestion || asking) return

    setAsking(true)
    setAnswer('')

    try {
      const response = await fetch('http://127.0.0.1:8000/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedQuestion,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Chatbot request failed')
      }

      setAnswer(data.response)
    } catch (error) {
      console.error('Chatbot error:', error)
      setAnswer(
        'Sorry, I could not connect to the CyberShield AI backend. Please make sure the backend and Ollama are running.'
      )
    } finally {
      setAsking(false)
    }
  }

  return (
    <div className="ai-security-page">

      {/* HEADER */}
      <div className="ai-security-header">

        <div>
          <div className="ai-security-title-row">

            <div className="ai-security-title-icon">
              <SparkIcon />
            </div>

            <div>
              <h1>{t.title}</h1>

              <p>
                {t.description}
              </p>
            </div>

          </div>
        </div>

        <div className="ai-security-status">
          <span></span>
          {t.engineReady}
        </div>

      </div>


      {/* HERO */}
      <section className="ai-security-hero">

        <div className="ai-hero-icon">
          <SparkIcon />
        </div>

        <div className="ai-hero-content">

          <span className="ai-hero-label">
            {t.copilotLabel}
          </span>

          <h2>
            {t.heroTitle}
          </h2>

          <p>
            {t.heroDescription}
          </p>

        </div>

        <div className="ai-hero-status">
          <div className="ai-online-dot"></div>

          <span>
            {t.online}
          </span>
        </div>

      </section>


      {/* TOP CARDS */}
      <div className="ai-security-grid">

        {/* THREAT ANALYSIS */}
        <section className="ai-card">

          <div className="ai-card-header">

            <div className="ai-card-icon blue">
              <BrainIcon />
            </div>

            <div>
              <h3>
                {t.threatAnalysis}
              </h3>

              <p>
                {t.threatAnalysisDescription}
              </p>
            </div>

          </div>


          <div className="ai-analysis-box">

            <div className="ai-analysis-row">
              <span>{t.latestAnalysis}</span>
              <strong>{t.staticDetection}</strong>
            </div>

            <div className="ai-analysis-row">
              <span>{t.detectionEngine}</span>
              <strong>XGBoost</strong>
            </div>

            <div className="ai-analysis-row">
              <span>{t.behaviorEngine}</span>
              <strong>LSTM</strong>
            </div>

            <div className="ai-analysis-row">
              <span>{t.explainability}</span>
              <strong>SHAP</strong>
            </div>

          </div>


          <button
            type="button"
            className="ai-card-link"
          >
            {t.viewThreatAnalysis}

            <ArrowIcon />
          </button>

        </section>


        {/* SECURITY KNOWLEDGE */}
        <section className="ai-card">

          <div className="ai-card-header">

            <div className="ai-card-icon green">
              <ShieldIcon />
            </div>

            <div>
              <h3>
                {t.securityKnowledge}
              </h3>

              <p>
                {t.securityKnowledgeDescription}
              </p>
            </div>

          </div>


          <div className="knowledge-list">

            <div className="knowledge-item">
              <span className="knowledge-dot"></span>
              {t.ransomwareDetection}
            </div>

            <div className="knowledge-item">
              <span className="knowledge-dot"></span>
              {t.malwareBehavior}
            </div>

            <div className="knowledge-item">
              <span className="knowledge-dot"></span>
              {t.mitreContext}
            </div>

            <div className="knowledge-item">
              <span className="knowledge-dot"></span>
              {t.endpointProtection}
            </div>

          </div>


          <button
            type="button"
            className="ai-card-link"
          >
            {t.exploreKnowledge}

            <ArrowIcon />
          </button>

        </section>

      </div>


      {/* ASK AI */}
      <section className="ai-chat-card">

        <div className="ai-chat-header">

          <div className="ai-chat-icon">
            <SparkIcon />
          </div>

          <div>
            <h2>
              {t.askCopilot}
            </h2>

            <p>
              {t.askCopilotDescription}
            </p>
          </div>

        </div>


        <div className="ai-question-box">

          <textarea
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
            placeholder={t.questionPlaceholder}
            rows="3"
          />

          <button
            type="button"
            className="ai-ask-button"
            onClick={handleAsk}
            disabled={!question.trim() || asking}
          >

            <span>
              {asking
                ? t.analyzing
                : t.askAI}
            </span>

            <ArrowIcon />

          </button>

        </div>


        {answer && (

          <div className="ai-answer">

            <div className="ai-answer-icon">
              <SparkIcon />
            </div>

            <div>

              <span className="ai-answer-label">
                {t.answerLabel}
              </span>

              <p>
                {answer}
              </p>

            </div>

          </div>

        )}

      </section>


      {/* RECENT AI ACTIVITY */}
      <section className="ai-recent-card">

        <div className="ai-recent-header">

          <div>

            <h2>
              {t.recentActivity}
            </h2>

            <p>
              {t.recentActivityDescription}
            </p>

          </div>

          <span className="ai-coming-soon">
            {t.backendReady}
          </span>

        </div>


        <div className="ai-recent-empty">

          <div className="ai-empty-icon">
            <SearchIcon />
          </div>

          <h3>
            {t.noHistory}
          </h3>

          <p>
            {t.noHistoryDescription}
          </p>

        </div>

      </section>

    </div>
  )
}

export default AISecurity