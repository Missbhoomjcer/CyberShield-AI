import { useNavigate } from 'react-router-dom'
import './Features.css'

function Features() {
  const navigate = useNavigate()

  return (
    <div className="features-page">

      {/* ================= NAVBAR ================= */}

      <header className="features-navbar">

        <button
          className="features-brand"
          onClick={() => navigate('/')}
        >
          <span className="features-brand-icon">
            ◈
          </span>

          <span>
            CyberShield<span>-AI</span>
          </span>
        </button>


        <nav className="features-nav">

          <button
            className="active"
            onClick={() => navigate('/features')}
          >
            Features
          </button>

          <button
            onClick={() => navigate('/')}
          >
            Security
          </button>

          <button
            onClick={() => navigate('/')}
          >
            About
          </button>

          <button
            className="features-signin"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>

          <button
            className="features-get-started"
            onClick={() => navigate('/login')}
          >
            Get Started
          </button>

        </nav>

      </header>


      {/* ================= HERO ================= */}

      <section className="features-hero">

        <div className="features-eyebrow">
          CYBERSHIELD-AI PLATFORM
        </div>

        <h1>
          Intelligent security for
          <br />
          <span>modern endpoints.</span>
        </h1>

        <p>
          CyberShield-AI combines machine learning,
          behavioral monitoring and security intelligence
          to detect and respond to ransomware and malicious activity.
        </p>

      </section>


      {/* ================= FEATURE GRID ================= */}

      <section className="features-grid-section">

        <div className="features-grid">


          {/* RANSOMWARE DETECTION */}

          <article className="feature-detail-card">

            <div className="feature-number">
              01
            </div>

            <div className="feature-detail-icon">
              🛡
            </div>

            <h2>
              Ransomware Detection
            </h2>

            <p>
              Analyze executable files using machine learning
              models to identify potentially malicious and
              ransomware-related characteristics.
            </p>

            <ul>
              <li>Static PE analysis</li>
              <li>72-feature analysis pipeline</li>
              <li>XGBoost classification</li>
              <li>Threat score generation</li>
            </ul>

          </article>


          {/* BEHAVIORAL DETECTION */}

          <article className="feature-detail-card">

            <div className="feature-number">
              02
            </div>

            <div className="feature-detail-icon">
              ◉
            </div>

            <h2>
              Behavioral Detection
            </h2>

            <p>
              Monitor system behavior and identify suspicious
              activity patterns that may indicate ransomware
              execution.
            </p>

            <ul>
              <li>Process monitoring</li>
              <li>File activity monitoring</li>
              <li>Behavioral feature collection</li>
              <li>LSTM-based detection</li>
            </ul>

          </article>


          {/* REAL-TIME PROTECTION */}

          <article className="feature-detail-card">

            <div className="feature-number">
              03
            </div>

            <div className="feature-detail-icon">
              ⚡
            </div>

            <h2>
              Real-Time Protection
            </h2>

            <p>
              Continuously monitor endpoint activity and
              identify suspicious behavior while the system
              is running.
            </p>

            <ul>
              <li>Continuous monitoring</li>
              <li>Suspicious activity detection</li>
              <li>Threat alerts</li>
              <li>Protection response</li>
            </ul>

          </article>


          {/* THREAT DECISION ENGINE */}

          <article className="feature-detail-card">

            <div className="feature-number">
              04
            </div>

            <div className="feature-detail-icon">
              ◈
            </div>

            <h2>
              Threat Decision Engine
            </h2>

            <p>
              Combine available security signals to determine
              the risk level of detected activity and decide
              the appropriate response.
            </p>

            <ul>
              <li>Threat scoring</li>
              <li>Risk assessment</li>
              <li>Detection fusion</li>
              <li>Response decision</li>
            </ul>

          </article>


          {/* EXPLAINABLE AI */}

          <article className="feature-detail-card">

            <div className="feature-number">
              05
            </div>

            <div className="feature-detail-icon">
              ✦
            </div>

            <h2>
              Explainable AI
            </h2>

            <p>
              Provide understandable security information
              about model predictions and detected threats.
            </p>

            <ul>
              <li>SHAP-based explanations</li>
              <li>Feature importance</li>
              <li>Threat analysis</li>
              <li>Security recommendations</li>
            </ul>

          </article>


          {/* QUARANTINE */}

          <article className="feature-detail-card">

            <div className="feature-number">
              06
            </div>

            <div className="feature-detail-icon">
              ◫
            </div>

            <h2>
              Quarantine & Response
            </h2>

            <p>
              Suspicious files and threats can be isolated
              through the protection and quarantine workflow
              to help prevent further impact.
            </p>

            <ul>
              <li>Threat isolation</li>
              <li>Quarantine management</li>
              <li>Protection response</li>
              <li>Threat history</li>
            </ul>

          </article>

        </div>

      </section>


      {/* ================= WORKFLOW ================= */}

      <section className="features-workflow">

        <div className="workflow-heading">

          <span>
            SECURITY WORKFLOW
          </span>

          <h2>
            From detection to protection
          </h2>

          <p>
            CyberShield-AI is designed around a continuous
            security workflow.
          </p>

        </div>


        <div className="workflow">

          <div className="workflow-step">
            <strong>01</strong>
            <span>Detect</span>
            <small>Identify suspicious activity</small>
          </div>

          <div className="workflow-arrow">
            →
          </div>

          <div className="workflow-step">
            <strong>02</strong>
            <span>Analyze</span>
            <small>ML and behavioral analysis</small>
          </div>

          <div className="workflow-arrow">
            →
          </div>

          <div className="workflow-step">
            <strong>03</strong>
            <span>Decide</span>
            <small>Determine threat response</small>
          </div>

          <div className="workflow-arrow">
            →
          </div>

          <div className="workflow-step">
            <strong>04</strong>
            <span>Protect</span>
            <small>Block, contain or isolate</small>
          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="features-cta">

        <h2>
          Ready to protect your endpoint?
        </h2>

        <p>
          Explore CyberShield-AI and its intelligent
          ransomware protection platform.
        </p>

        <button
          onClick={() => navigate('/login')}
        >
          Get Started
        </button>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="features-footer">

        <div>

          <strong>
            CyberShield<span>-AI</span>
          </strong>

          <p>
            AI-powered ransomware and malware detection.
          </p>

        </div>

        <span>
          © 2026 CyberShield-AI
        </span>

      </footer>

    </div>
  )
}

export default Features