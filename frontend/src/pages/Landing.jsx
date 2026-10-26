
import './Landing.css'

const features = [
  {
    icon: 'monitor',
    title: 'Real-Time Monitoring',
    description: 'Detect suspicious behavior as it happens.',
  },
  {
    icon: 'shield',
    title: 'Ransomware Detection',
    description: 'Identify potentially malicious files and activity.',
  },
  {
    icon: 'brain',
    title: 'Behavioral Analysis',
    description: 'Use AI/ML to identify unusual patterns.',
  },
  {
    icon: 'file',
    title: 'Explainable Results',
    description: 'Understand security findings with clear insights.',
  },
]

const benefits = [
  {
    icon: 'search',
    title: 'Early Detection',
    description:
      'Identify suspicious files and behavior before they cause further damage.',
  },
  {
    icon: 'shield',
    title: 'Intelligent Protection',
    description:
      'Use machine learning to support ransomware detection and analysis.',
  },
  {
    icon: 'file',
    title: 'Explainable Insights',
    description:
      'Understand why a file or activity has been flagged for review.',
  },
  {
    icon: 'brain',
    title: 'Behavioral Intelligence',
    description:
      'Analyze activity patterns to help identify potential threats.',
  },
]

function FeatureIcon({ type, size = 24 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  switch (type) {
    case 'monitor':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="13" rx="2" />
          <path d="M8 21h8M12 17v4" />
          <path d="m7 13 3-3 3 2 4-5" />
        </svg>
      )

    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )

    case 'brain':
      return (
        <svg {...common}>
          <path d="M12 5a4 4 0 0 0-7-2 4 4 0 0 0-2 6 4 4 0 0 0 1 7 4 4 0 0 0 5 5l3-2Z" />
          <path d="M12 5a4 4 0 0 1 7-2 4 4 0 0 1 2 6 4 4 0 0 1-1 7 4 4 0 0 1-5 5l-3-2Z" />
          <path d="M8 8c2 0 4 2 4 4m-6 2c2 0 3 1 3 3m7-9c-2 0-4 2-4 4m6 2c-2 0-3 1-3 3M12 5v16" />
        </svg>
      )

    case 'file':
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6M8 13h8M8 17h8" />
        </svg>
      )

    case 'search':
      return (
        <svg {...common}>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
      )

    default:
      return null
  }
}

function ShieldIllustration() {
  return (
    <div
      className="landing-visual"
      aria-label="CyberShield AI security illustration"
    >
      <div className="visual-glow" />
      <div className="visual-grid" />

      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="orbit orbit-three" />

      <div className="orbit-dot dot-one" />
      <div className="orbit-dot dot-two" />
      <div className="orbit-dot dot-three" />

      <div className="visual-status">
        <span className="status-indicator" />
        <span>AI SECURITY ACTIVE</span>
      </div>

      <div className="floating-icon floating-computer">
        <FeatureIcon type="monitor" size={25} />
      </div>

      <div className="floating-icon floating-document">
        <FeatureIcon type="file" size={23} />
      </div>

      <div className="floating-icon floating-check">
        <span>✓</span>
      </div>

      <div className="floating-icon floating-threat">
        <span>!</span>
      </div>

      <div className="shield-platform">
        <div className="platform-ring" />
        <div className="platform-base" />
      </div>

      <div className="hero-shield">
        <svg
          className="hero-shield-svg"
          viewBox="0 0 220 260"
          fill="none"
          role="img"
          aria-label="Blue shield with a security lock"
        >
          <defs>
            <linearGradient
              id="shieldOuter"
              x1="20"
              y1="10"
              x2="200"
              y2="250"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#b8f6ff" />
              <stop offset="45%" stopColor="#168aff" />
              <stop offset="100%" stopColor="#0050d8" />
            </linearGradient>

            <linearGradient
              id="shieldInner"
              x1="40"
              y1="25"
              x2="180"
              y2="230"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#168bff" />
              <stop offset="55%" stopColor="#0758e7" />
              <stop offset="100%" stopColor="#0734a9" />
            </linearGradient>

            <linearGradient
              id="lockGradient"
              x1="75"
              y1="95"
              x2="145"
              y2="190"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#b9ddff" />
            </linearGradient>

            <filter
              id="shieldShadow"
              x="-60%"
              y="-50%"
              width="220%"
              height="220%"
            >
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>

          <path
            d="M110 10 198 48v70c0 65-39 106-88 132-49-26-88-67-88-132V48Z"
            fill="#168aff"
            opacity=".35"
            filter="url(#shieldShadow)"
          />

          <path
            d="M110 7 198 47v69c0 64-39 105-88 131-49-26-88-67-88-131V47Z"
            fill="url(#shieldOuter)"
            stroke="#b9f7ff"
            strokeWidth="3"
          />

          <path
            d="M110 25 180 57v59c0 50-28 84-70 108-42-24-70-58-70-108V57Z"
            fill="url(#shieldInner)"
            stroke="#69d9ff"
            strokeWidth="2"
          />

          <path
            d="M110 25 180 57v59c0 50-28 84-70 108Z"
            fill="#003cbf"
            opacity=".3"
          />

          <g stroke="#91e9ff" strokeWidth="2" opacity=".6">
            <path d="M70 82 91 70" />
            <path d="M150 82 129 70" />
            <path d="M69 158 87 173" />
            <path d="M151 158 133 173" />
          </g>

          <rect
            x="76"
            y="112"
            width="68"
            height="65"
            rx="13"
            fill="#ffffff"
            opacity=".22"
          />

          <path
            d="M88 116V99a22 22 0 0 1 44 0v17"
            stroke="url(#lockGradient)"
            strokeWidth="12"
            strokeLinecap="round"
          />

          <rect
            x="75"
            y="111"
            width="70"
            height="70"
            rx="12"
            fill="url(#lockGradient)"
            stroke="#ffffff"
            strokeWidth="2"
          />

          <circle cx="110" cy="138" r="9" fill="#0871e9" />
          <path d="M106 143h8l-2 17h-4Z" fill="#0871e9" />

          <path
            d="M110 7 198 47"
            stroke="#ffffff"
            strokeWidth="2"
            opacity=".7"
          />
        </svg>
      </div>

      {features.map((feature, index) => (
        <div
          className={`floating-feature floating-feature-${index + 1}`}
          key={feature.title}
        >
          <div className="floating-feature-icon">
            <FeatureIcon type={feature.icon} size={23} />
          </div>

          <div className="floating-feature-copy">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        </div>
      ))}

      <div className="visual-caption">
        <span className="caption-pulse" />
        AI-POWERED ENDPOINT SECURITY
      </div>
    </div>
  )
}

function Landing() {
  return (
    <main className="landing-page" id="top">
      <header className="landing-navbar">
        <a
          href="#top"
          className="landing-brand"
          aria-label="CyberShield AI home"
        >
          <div className="brand-shield">
            <FeatureIcon type="shield" size={28} />
          </div>

          <div className="brand-copy">
            <strong>
              CyberShield<span>-AI</span>
            </strong>
            <small>SMART PROTECTION. SAFER TOMORROW.</small>
          </div>
        </a>

        <nav className="landing-nav-links" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </nav>

        <div className="landing-nav-actions">
          <a
            className="landing-button landing-button-outline nav-signin"
            href="/login"
          >
            Sign In
          </a>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <div className="landing-eyebrow">
              <span className="eyebrow-line" />
              AI-POWERED ENDPOINT SECURITY
            </div>

            <h1>
              <span className="headline-line">AI-Powered</span>
              <span className="headline-line headline-blue">
                Ransomware
              </span>
              <span className="headline-line headline-blue">
                Protection
              </span>
              <span className="headline-line">
                for a Safer Tomorrow
              </span>
            </h1>

            <p className="landing-tagline">
              Detect. Prevent. Explain. Stay Protected.
            </p>

            <p className="landing-description">
              CyberShield-AI combines machine learning, behavioral analysis,
              and real-time monitoring to help identify ransomware and
              suspicious activity before it causes serious damage.
            </p>

            <div className="landing-hero-actions">
              <a
                href="/login"
                className="landing-button landing-button-primary hero-start"
              >
                Get Started
                <span aria-hidden="true">→</span>
              </a>

              <a
                href="#features"
                className="landing-button landing-button-outline hero-demo"
              >
                Explore Features
                <span aria-hidden="true">↗</span>
              </a>
            </div>

            <div className="landing-trust-note">
              <span className="trust-check">✓</span>
              Intelligent detection. Clear security insights.
            </div>

            <div className="hero-mini-stats">
              <div>
                <span className="mini-stat-icon">
                  <FeatureIcon type="monitor" size={19} />
                </span>
                <span>
                  <strong>Real-Time</strong>
                  <small>Monitoring</small>
                </span>
              </div>

              <div>
                <span className="mini-stat-icon">
                  <FeatureIcon type="brain" size={19} />
                </span>
                <span>
                  <strong>AI-Powered</strong>
                  <small>Analysis</small>
                </span>
              </div>
            </div>
          </div>

          <ShieldIllustration />
        </div>

        <div className="hero-bottom-glow" />
      </section>

      <section className="landing-benefits" id="features">
        <div className="benefits-heading">
          <span className="section-eyebrow">BUILT FOR SECURITY</span>

          <h2>
            Detect threats before
            <br />
            they become incidents.
          </h2>

          <p>
            Smarter security insights to help you understand and respond
            to suspicious activity.
          </p>
        </div>

        <div className="benefit-grid">
          {benefits.map((benefit, index) => (
            <article className="benefit-card" key={benefit.title}>
              <div className="benefit-icon">
                <FeatureIcon type={benefit.icon} size={27} />
              </div>

              <div className="benefit-copy">
                <span className="benefit-number">
                  0{index + 1}
                </span>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="landing-footer" id="about">
        <a href="#top" className="footer-brand">
          <FeatureIcon type="shield" size={22} />
          <span>CyberShield-AI</span>
        </a>

        <p>Smart protection. Safer tomorrow.</p>

        <a href="#top" className="footer-back">
          Back to top ↑
        </a>
      </footer>
    </main>
  )
}

export default Landing
