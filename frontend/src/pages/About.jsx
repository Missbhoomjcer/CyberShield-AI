import { useNavigate } from 'react-router-dom'
import './About.css'

function About() {
  const navigate = useNavigate()

  return (
    <div className="about-page">

      {/* ================= NAVBAR ================= */}

      <header className="about-navbar">

        <button
          className="about-brand"
          onClick={() => navigate('/')}
        >
          <span className="about-brand-icon">
            ◈
          </span>

          <span>
            CyberShield<span>-AI</span>
          </span>
        </button>


        <nav className="about-nav">

          <button onClick={() => navigate('/features')}>
            Features
          </button>

          <button onClick={() => navigate('/security')}>
            Security
          </button>

          <button className="active">
            About
          </button>

          <button
            className="about-signin"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>

          <button
            className="about-get-started"
            onClick={() => navigate('/login')}
          >
            Get Started
          </button>

        </nav>

      </header>


      {/* ================= HERO ================= */}

      <section className="about-hero">

        <div className="about-eyebrow">
          ABOUT CYBERSHIELD-AI
        </div>

        <h1>
          Smarter protection.
          <br />
          <span>Safer endpoints.</span>
        </h1>

        <p>
          CyberShield-AI is an AI-powered endpoint security
          platform focused on ransomware and malicious
          activity detection, analysis and protection.
        </p>

      </section>


      {/* ================= ABOUT CONTENT ================= */}

      <section className="about-content">

        <div className="about-content-card">

          <span>
            OUR PLATFORM
          </span>

          <h2>
            Intelligent endpoint security
          </h2>

          <p>
            CyberShield-AI brings together static file analysis,
            machine learning, behavioral monitoring, explainable
            AI and protection workflows into a unified security
            platform.
          </p>

          <p>
            The platform is designed to help users understand
            potential threats and provide a structured response
            when suspicious activity is detected.
          </p>

        </div>


        <div className="about-highlight">

          <div>
            <strong>
              AI
            </strong>

            <span>
              Machine learning driven detection
            </span>
          </div>

          <div>
            <strong>
              RT
            </strong>

            <span>
              Real-time behavioral monitoring
            </span>
          </div>

          <div>
            <strong>
              XAI
            </strong>

            <span>
              Explainable security analysis
            </span>
          </div>

          <div>
            <strong>
              PRO
            </strong>

            <span>
              Protection and quarantine workflow
            </span>
          </div>

        </div>

      </section>


      {/* ================= OBJECTIVE ================= */}

      <section className="about-objective">

        <div className="about-section-title">

          <span>
            PROJECT OBJECTIVE
          </span>

          <h2>
            Detect threats early and respond intelligently.
          </h2>

        </div>


        <div className="about-objective-grid">

          <article>
            <span>01</span>
            <h3>Detect</h3>
            <p>
              Analyze files and endpoint behavior for
              suspicious characteristics.
            </p>
          </article>

          <article>
            <span>02</span>
            <h3>Understand</h3>
            <p>
              Use machine learning and explainability to
              provide meaningful security analysis.
            </p>
          </article>

          <article>
            <span>03</span>
            <h3>Respond</h3>
            <p>
              Support controlled protection actions such
              as blocking, containment and quarantine.
            </p>
          </article>

        </div>

      </section>


      {/* ================= TECHNOLOGY ================= */}

      <section className="about-technology">

        <div className="about-section-title">

          <span>
            TECHNOLOGY
          </span>

          <h2>
            Built around modern security technologies.
          </h2>

        </div>


        <div className="about-tech-grid">

          <div>
            <strong>
              XGBoost
            </strong>

            <p>
              Static file classification.
            </p>
          </div>

          <div>
            <strong>
              LSTM
            </strong>

            <p>
              Behavioral sequence detection.
            </p>
          </div>

          <div>
            <strong>
              SHAP
            </strong>

            <p>
              Explainable model analysis.
            </p>
          </div>

          <div>
            <strong>
              FastAPI
            </strong>

            <p>
              Backend API integration.
            </p>
          </div>

          <div>
            <strong>
              React
            </strong>

            <p>
              Security dashboard interface.
            </p>
          </div>

          <div>
            <strong>
              RAG + LLM
            </strong>

            <p>
              AI security assistance.
            </p>
          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="about-cta">

        <h2>
          Explore CyberShield-AI
        </h2>

        <p>
          Experience the platform and explore its security
          capabilities.
        </p>

        <button onClick={() => navigate('/login')}>
          Get Started
        </button>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="about-footer">

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

export default About