import { useState } from 'react'
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
  const [question, setQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const [answer, setAnswer] = useState('')

  const handleAsk = () => {
    const trimmedQuestion = question.trim()

    if (!trimmedQuestion || asking) return

    setAsking(true)
    setAnswer('')

    setTimeout(() => {
      setAnswer(
        'AI Security Copilot is ready to analyze threats, explain detection results, and provide security recommendations.'
      )
      setAsking(false)
    }, 700)
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
              <h1>AI Security</h1>
              <p>
                AI-powered threat analysis and security assistance.
              </p>
            </div>
          </div>
        </div>

        <div className="ai-security-status">
          <span></span>
          AI Engine Ready
        </div>
      </div>


      {/* HERO */}
      <section className="ai-security-hero">

        <div className="ai-hero-icon">
          <SparkIcon />
        </div>

        <div className="ai-hero-content">
          <span className="ai-hero-label">
            CYBERSHIELD AI COPILOT
          </span>

          <h2>
            Understand threats with AI-powered security analysis
          </h2>

          <p>
            Ask questions about detected threats, suspicious files,
            ransomware behavior, and recommended security actions.
          </p>
        </div>

        <div className="ai-hero-status">
          <div className="ai-online-dot"></div>
          <span>Online</span>
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
              <h3>Threat Analysis</h3>
              <p>
                AI interpretation of security findings
              </p>
            </div>

          </div>

          <div className="ai-analysis-box">

            <div className="ai-analysis-row">
              <span>Latest Analysis</span>
              <strong>Static ML Detection</strong>
            </div>

            <div className="ai-analysis-row">
              <span>Detection Engine</span>
              <strong>XGBoost</strong>
            </div>

            <div className="ai-analysis-row">
              <span>Behavior Engine</span>
              <strong>LSTM</strong>
            </div>

            <div className="ai-analysis-row">
              <span>Explainability</span>
              <strong>SHAP</strong>
            </div>

          </div>

          <button
            type="button"
            className="ai-card-link"
          >
            View threat analysis
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
              <h3>Security Knowledge</h3>
              <p>
                Threat intelligence and security context
              </p>
            </div>

          </div>

          <div className="knowledge-list">

            <div className="knowledge-item">
              <span className="knowledge-dot"></span>
              Ransomware detection
            </div>

            <div className="knowledge-item">
              <span className="knowledge-dot"></span>
              Malware behavior
            </div>

            <div className="knowledge-item">
              <span className="knowledge-dot"></span>
              MITRE ATT&amp;CK context
            </div>

            <div className="knowledge-item">
              <span className="knowledge-dot"></span>
              Endpoint protection
            </div>

          </div>

          <button
            type="button"
            className="ai-card-link"
          >
            Explore security knowledge
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
            <h2>Ask AI Security Copilot</h2>
            <p>
              Ask a security question and get an AI-assisted explanation.
            </p>
          </div>

        </div>


        <div className="ai-question-box">

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: Why was this file detected as suspicious?"
            rows="3"
          />

          <button
            type="button"
            className="ai-ask-button"
            onClick={handleAsk}
            disabled={!question.trim() || asking}
          >
            <span>
              {asking ? 'Analyzing...' : 'Ask AI'}
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
                AI SECURITY COPILOT
              </span>

              <p>{answer}</p>
            </div>

          </div>

        )}

      </section>


      {/* RECENT AI ACTIVITY */}
      <section className="ai-recent-card">

        <div className="ai-recent-header">
          <div>
            <h2>Recent AI Security Activity</h2>
            <p>
              AI-assisted security events and analysis.
            </p>
          </div>

          <span className="ai-coming-soon">
            Backend Ready
          </span>
        </div>


        <div className="ai-recent-empty">

          <div className="ai-empty-icon">
            <SearchIcon />
          </div>

          <h3>No AI analysis history yet</h3>

          <p>
            AI-generated threat explanations and recommendations
            will appear here.
          </p>

        </div>

      </section>

    </div>
  )
}

export default AISecurity