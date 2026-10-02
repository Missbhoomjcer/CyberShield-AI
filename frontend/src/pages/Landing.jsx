import { useNavigate } from 'react-router-dom'
import './Landing.css'

function Landing() {

  const navigate = useNavigate()


  return (

    <div className="landing-page">


      {/* =================================================
          NAVBAR
          ================================================= */}

      <header className="landing-navbar">

        <button
          className="landing-brand"
          onClick={() => navigate('/')}
        >

          <div className="landing-logo">

            <svg
              viewBox="0 0 48 48"
              aria-hidden="true"
            >

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

        </button>


        {/* NAVIGATION */}

        <nav className="landing-nav">

          <button
            type="button"
            onClick={() => navigate('/features')}
          >
            Features
          </button>


          <button
            type="button"
            onClick={() => navigate('/security')}
          >
            Security
          </button>


          <button
            type="button"
            onClick={() => navigate('/about')}
          >
            About
          </button>


          <button
            type="button"
            className="landing-signin"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>


          <button
            type="button"
            className="landing-get-started"
            onClick={() => navigate('/login')}
          >
            Get Started
          </button>

        </nav>

      </header>


      {/* =================================================
          HERO
          ================================================= */}

      <main className="landing-hero">

        <div className="landing-hero-content">


          <div className="landing-eyebrow">
            AI-POWERED ENDPOINT SECURITY
          </div>


          <h1>

            AI-Powered

            <br />

            <span>
              Ransomware Protection
            </span>

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
              type="button"
              className="hero-primary"
              onClick={() => navigate('/login')}
            >
              Get Started
            </button>


            <button
              type="button"
              className="hero-secondary"
              onClick={() => navigate('/demo')}
            >
              Watch Demo
            </button>


          </div>

        </div>


        {/* =================================================
            DASHBOARD PREVIEW
            ================================================= */}

        <div className="landing-preview">

          <div className="preview-window">


            <div className="preview-topbar">

              <div className="preview-dots">

                <span></span>
                <span></span>
                <span></span>

              </div>

              <span>
                CyberShield-AI
              </span>

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

                    <h3>
                      Good Evening, Harshita!
                    </h3>

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

                    <small>
                      YOU ARE PROTECTED
                    </small>

                    <strong>
                      Your device is secure
                    </strong>

                    <span>
                      CyberShield-AI is actively monitoring
                      your device.
                    </span>

                  </div>

                </div>


                <div className="preview-stats">


                  <div>

                    <small>
                      FILES SCANNED
                    </small>

                    <strong>
                      1,284
                    </strong>

                  </div>


                  <div>

                    <small>
                      THREATS
                    </small>

                    <strong className="preview-red">
                      17
                    </strong>

                  </div>


                  <div>

                    <small>
                      ACCURACY
                    </small>

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

                      <strong>
                        98
                      </strong>

                    </div>


                    <b>
                      Excellent
                    </b>

                  </div>


                  <div className="preview-status">

                    <small>
                      PROTECTION STATUS
                    </small>


                    <div>

                      <span>
                        Real-Time Protection
                      </span>

                      <b>
                        ✓
                      </b>

                    </div>


                    <div>

                      <span>
                        Ransomware Protection
                      </span>

                      <b>
                        ✓
                      </b>

                    </div>


                    <div>

                      <span>
                        Behavioral Monitoring
                      </span>

                      <b>
                        ✓
                      </b>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>


      {/* =================================================
          SECURITY PREVIEW
          ================================================= */}

      <section className="landing-security">

        <div>

          <span>
            BUILT FOR SECURITY
          </span>


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


          <div className="landing-security-flow">


            <div>
              <strong>01</strong>
              <span>Detect</span>
            </div>


            <div>
              <strong>02</strong>
              <span>Decide</span>
            </div>


            <div>
              <strong>03</strong>
              <span>Protect</span>
            </div>


            <div>
              <strong>04</strong>
              <span>Quarantine</span>
            </div>


          </div>

        </div>

      </section>


      {/* =================================================
          ABOUT PREVIEW
          ================================================= */}

      <section className="landing-about">

        <div className="section-heading">

          <span>
            ABOUT CYBERSHIELD-AI
          </span>


          <h2>
            Intelligent endpoint protection
          </h2>


          <p>
            CyberShield-AI is designed to detect,
            analyze and respond to ransomware and
            malicious activity using machine learning,
            behavioral monitoring and explainable AI.
          </p>


          <button
            type="button"
            className="landing-section-button"
            onClick={() => navigate('/about')}
          >
            Learn More About CyberShield-AI
          </button>

        </div>

      </section>


      {/* =================================================
          FOOTER
          ================================================= */}

      <footer className="landing-footer">


        <div className="landing-footer-brand">

          <strong>
            CyberShield<span>-AI</span>
          </strong>

          <p>
            AI-powered ransomware and malware detection.
          </p>

        </div>


        <div className="landing-footer-links">

          <button onClick={() => navigate('/features')}>
            Features
          </button>

          <button onClick={() => navigate('/security')}>
            Security
          </button>

          <button onClick={() => navigate('/about')}>
            About
          </button>

          <button onClick={() => navigate('/demo')}>
            Demo
          </button>

        </div>


        <span>
          © 2026 CyberShield-AI
        </span>


      </footer>

    </div>
  )
}

export default Landing