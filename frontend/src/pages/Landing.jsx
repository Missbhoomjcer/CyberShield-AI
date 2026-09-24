import { useNavigate } from 'react-router-dom'
import './Landing.css'

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">

      {/* ================= TOP NAVBAR ================= */}
      <header className="landing-navbar">

        <div className="landing-brand">

          <div className="landing-logo">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path
                d="M24 3L42 10V21C42 32.5 34.6 42 24 46C13.4 42 6 32.5 6 21V10L24 3Z"
                fill="#ffffff"
                stroke="#20b978"
                strokeWidth="3"
              />

              <path
                d="M17 24L21.5 28.5L31.5 18"
                fill="none"
                stroke="#20b978"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M24 3L42 10V14L24 7L6 14V10L24 3Z"
                fill="#1677ff"
              />
            </svg>
          </div>

          <div>
            <div className="landing-brand-name">
              CyberShield<span>-AI</span>
            </div>

            <div className="landing-brand-sub">
              SMART PROTECTION. SAFER TOMORROW.
            </div>
          </div>

        </div>


        <nav className="landing-nav">

          <a href="#features">Features</a>
          <a href="#security">Security</a>
          <a href="#about">About</a>

          <button
            className="landing-signin"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>

          <button
            className="landing-get-started"
            onClick={() => navigate('/login')}
          >
            Get Started
          </button>

        </nav>

      </header>


      {/* ================= HERO ================= */}
      <main className="landing-hero">

        <div className="landing-hero-content">

          <div className="landing-eyebrow">
            AI-POWERED ENDPOINT SECURITY
          </div>

          <h1>
            AI-Powered
            <br />
            <span>Ransomware Protection</span>
            <br />
            for a Safer Tomorrow
          </h1>

          <p>
            Detect. Prevent. Explain. Stay Protected.
          </p>

          <p className="landing-description">
            CyberShield-AI uses advanced machine learning,
            behavioral monitoring and real-time protection
            to identify ransomware and malicious activity
            before it can cause serious damage.
          </p>

          <div className="landing-buttons">

            <button
              className="hero-primary"
              onClick={() => navigate('/login')}
            >
              Get Started
            </button>

            <button
              className="hero-secondary"
              onClick={() =>
                document
                  .getElementById('features')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Watch Demo
            </button>

          </div>

        </div>


        {/* ================= DASHBOARD PREVIEW ================= */}
        <div className="landing-preview">

          <div className="preview-window">

            <div className="preview-topbar">
              <div className="preview-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <span>CyberShield-AI</span>
            </div>


            <div className="preview-body">

              <div className="preview-sidebar">

                <div className="preview-logo">
                  ◈
                </div>

                <div className="preview-side-item active">
                  Dashboard
                </div>

                <div className="preview-side-item">
                  Scan
                </div>

                <div className="preview-side-item">
                  Protection
                </div>

                <div className="preview-side-item">
                  Threats
                </div>

                <div className="preview-side-item">
                  Reports
                </div>

              </div>


              <div className="preview-main">

                <div className="preview-heading">
                  <div>
                    <h3>Good Evening, Harshita!</h3>
                    <span>
                      Your device is protected.
                    </span>
                  </div>

                  <div className="preview-avatar">
                    H
                  </div>
                </div>


                <div className="preview-protection">

                  <div className="preview-check">
                    ✓
                  </div>

                  <div>
                    <small>YOU ARE PROTECTED</small>
                    <strong>Your device is secure</strong>
                    <span>
                      CyberShield-AI is actively monitoring
                      your device.
                    </span>
                  </div>

                </div>


                <div className="preview-stats">

                  <div>
                    <small>FILES SCANNED</small>
                    <strong>1,284</strong>
                  </div>

                  <div>
                    <small>THREATS</small>
                    <strong className="preview-red">
                      17
                    </strong>
                  </div>

                  <div>
                    <small>ACCURACY</small>
                    <strong className="preview-blue">
                      98.6%
                    </strong>
                  </div>

                </div>


                <div className="preview-bottom">

                  <div className="preview-score">

                    <small>
                      PROTECTION SCORE
                    </small>

                    <div className="preview-ring">
                      <strong>98</strong>
                    </div>

                    <b>Excellent</b>

                  </div>


                  <div className="preview-status">

                    <small>
                      PROTECTION STATUS
                    </small>

                    <div>
                      <span>Real-Time Protection</span>
                      <b>✓</b>
                    </div>

                    <div>
                      <span>Ransomware Protection</span>
                      <b>✓</b>
                    </div>

                    <div>
                      <span>Behavioral Monitoring</span>
                      <b>✓</b>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>


      {/* ================= FEATURES ================= */}
      <section
        id="features"
        className="landing-features"
      >

        <div className="section-heading">
          <span>POWERFUL PROTECTION</span>

          <h2>
            Security powered by intelligence
          </h2>

          <p>
            CyberShield-AI combines machine learning
            and behavioral analysis to protect your endpoint.
          </p>
        </div>


        <div className="feature-grid">

          <div className="feature-card">
            <div className="feature-icon">◉</div>
            <h3>Ransomware Detection</h3>
            <p>
              Machine learning models analyze files
              and identify potentially malicious behavior.
            </p>
          </div>


          <div className="feature-card">
            <div className="feature-icon">◆</div>
            <h3>AI-Powered Detection</h3>
            <p>
              Advanced ML models provide intelligent
              threat classification and analysis.
            </p>
          </div>


          <div className="feature-card">
            <div className="feature-icon">⌁</div>
            <h3>Real-Time Monitoring</h3>
            <p>
              Behavioral activity can be monitored
              continuously for suspicious patterns.
            </p>
          </div>


          <div className="feature-card">
            <div className="feature-icon">◎</div>
            <h3>Explainable AI</h3>
            <p>
              Security analysis can provide meaningful
              information about detected threats.
            </p>
          </div>

        </div>

      </section>


      {/* ================= SECURITY ================= */}
      <section
        id="security"
        className="landing-security"
      >

        <div>
          <span>BUILT FOR SECURITY</span>

          <h2>
            Detect threats before
            <br />
            they become incidents.
          </h2>

          <p>
            CyberShield-AI combines static analysis,
            machine learning and behavioral monitoring
            into a unified endpoint security platform.
          </p>
        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer
        id="about"
        className="landing-footer"
      >

        <div className="landing-footer-brand">
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

export default Landing