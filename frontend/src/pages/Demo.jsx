import { useNavigate } from 'react-router-dom'
import './Demo.css'

function Demo() {
  const navigate = useNavigate()

  return (
    <div className="demo-page">

      {/* ================= NAVBAR ================= */}

      <header className="demo-navbar">

        <button
          className="demo-brand"
          onClick={() => navigate('/')}
        >
          <span className="demo-brand-icon">
            ◈
          </span>

          <span>
            CyberShield<span>-AI</span>
          </span>
        </button>


        <nav className="demo-nav">

          <button onClick={() => navigate('/features')}>
            Features
          </button>

          <button onClick={() => navigate('/security')}>
            Security
          </button>

          <button onClick={() => navigate('/about')}>
            About
          </button>

          <button
            className="demo-signin"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>

          <button
            className="demo-get-started"
            onClick={() => navigate('/login')}
          >
            Get Started
          </button>

        </nav>

      </header>


      {/* ================= HERO ================= */}

      <section className="demo-hero">

        <div className="demo-eyebrow">
          HOW CYBERSHIELD-AI WORKS
        </div>

        <h1>
          See the security
          <br />
          <span>workflow in action.</span>
        </h1>

        <p>
          CyberShield-AI combines file analysis, behavioral
          monitoring and threat decision logic to create
          a structured endpoint protection workflow.
        </p>

      </section>


      {/* ================= STATIC SCAN ================= */}

      <section className="demo-section">

        <div className="demo-section-heading">

          <span>
            USER-INITIATED SCAN
          </span>

          <h2>
            Static file analysis
          </h2>

          <p>
            The user starts a scan when they choose to
            analyze an executable or library.
          </p>

        </div>


        <div className="demo-flow">

          <div className="demo-flow-card">
            <strong>01</strong>
            <h3>Upload File</h3>
            <p>
              User selects an EXE or DLL file.
            </p>
          </div>

          <div className="demo-flow-arrow">→</div>

          <div className="demo-flow-card">
            <strong>02</strong>
            <h3>Extract Features</h3>
            <p>
              PE characteristics are extracted for analysis.
            </p>
          </div>

          <div className="demo-flow-arrow">→</div>

          <div className="demo-flow-card">
            <strong>03</strong>
            <h3>ML Prediction</h3>
            <p>
              The trained model evaluates the file.
            </p>
          </div>

          <div className="demo-flow-arrow">→</div>

          <div className="demo-flow-card">
            <strong>04</strong>
            <h3>Threat Result</h3>
            <p>
              The result includes threat information and
              analysis details.
            </p>
          </div>

        </div>

      </section>


      {/* ================= BEHAVIORAL ================= */}

      <section className="demo-section demo-section-light">

        <div className="demo-section-heading">

          <span>
            REAL-TIME PROTECTION
          </span>

          <h2>
            Behavioral monitoring
          </h2>

          <p>
            Endpoint activity can be monitored continuously
            to identify suspicious behavioral patterns.
          </p>

        </div>


        <div className="demo-flow">

          <div className="demo-flow-card">
            <strong>01</strong>
            <h3>Monitor</h3>
            <p>
              Observe processes, files and system activity.
            </p>
          </div>

          <div className="demo-flow-arrow">→</div>

          <div className="demo-flow-card">
            <strong>02</strong>
            <h3>Collect</h3>
            <p>
              Behavioral features are collected from activity.
            </p>
          </div>

          <div className="demo-flow-arrow">→</div>

          <div className="demo-flow-card">
            <strong>03</strong>
            <h3>LSTM Analysis</h3>
            <p>
              Behavioral sequences are evaluated by the model.
            </p>
          </div>

          <div className="demo-flow-arrow">→</div>

          <div className="demo-flow-card">
            <strong>04</strong>
            <h3>Threat Decision</h3>
            <p>
              Suspicious behavior can trigger a protection
              response.
            </p>
          </div>

        </div>

      </section>


      {/* ================= RESPONSE ================= */}

      <section className="demo-response">

        <div className="demo-section-heading">

          <span>
            PROTECTION RESPONSE
          </span>

          <h2>
            Detect → Decide → Protect
          </h2>

        </div>


        <div className="response-grid">

          <div>
            <span>01</span>
            <strong>Detect</strong>
            <p>
              Identify suspicious activity.
            </p>
          </div>

          <div>
            <span>02</span>
            <strong>Decide</strong>
            <p>
              Determine the appropriate response.
            </p>
          </div>

          <div>
            <span>03</span>
            <strong>Block / Contain</strong>
            <p>
              Apply the protection policy.
            </p>
          </div>

          <div>
            <span>04</span>
            <strong>Quarantine</strong>
            <p>
              Isolate suspicious files when required.
            </p>
          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="demo-cta">

        <h2>
          Explore the platform
        </h2>

        <p>
          Start with CyberShield-AI and explore its
          endpoint security capabilities.
        </p>

        <button onClick={() => navigate('/login')}>
          Get Started
        </button>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="demo-footer">

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

export default Demo