import { useState } from 'react'
import './Subscription.css'

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12L10 17L19 7" />
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

function Subscription() {
  const [billing, setBilling] = useState('monthly')

  const plans = [
    {
      name: 'Free',
      description: 'Basic protection for personal use.',
      monthly: '₹0',
      quarterly: '₹0',
      yearly: '₹0',
      label: 'Current Plan',
      features: [
        'Manual file scanning',
        'Basic threat detection',
        'Security dashboard',
        'Threat history',
      ],
    },
    {
      name: 'Pro',
      description: 'Advanced endpoint protection for individuals.',
      monthly: '₹299',
      quarterly: '₹799',
      yearly: '₹2,999',
      label: 'Upgrade',
      popular: true,
      features: [
        'Real-time protection',
        'Ransomware protection',
        'Behavioral monitoring',
        'AI threat detection',
        'Quarantine & containment',
        'AI Security Copilot',
      ],
    },
    {
      name: 'Business',
      description: 'Centralized protection for teams and devices.',
      monthly: '₹799',
      quarterly: '₹2,099',
      yearly: '₹7,999',
      label: 'Choose Plan',
      features: [
        'Everything in Pro',
        'Multiple device management',
        'Centralized security dashboard',
        'Advanced threat history',
        'Device monitoring',
        'Priority security support',
      ],
    },
  ]

  const getPrice = (plan) => {
    if (billing === 'quarterly') return plan.quarterly
    if (billing === 'yearly') return plan.yearly
    return plan.monthly
  }

  const getPeriod = () => {
    if (billing === 'quarterly') return '/quarter'
    if (billing === 'yearly') return '/year'
    return '/month'
  }

  return (
    <div className="subscription-page">

      {/* HEADER */}
      <div className="subscription-header">
        <div>
          <h1>Subscription</h1>
          <p>
            Manage your CyberShield-AI protection plan and license.
          </p>
        </div>

        <div className="subscription-status">
          <span></span>
          Free Plan Active
        </div>
      </div>


      {/* CURRENT PLAN */}
      <section className="current-plan-card">

        <div className="current-plan-icon">
          <ShieldIcon />
        </div>

        <div className="current-plan-content">
          <span className="current-plan-label">
            CURRENT PLAN
          </span>

          <h2>CyberShield-AI Free</h2>

          <p>
            Your account is currently protected with the Free plan.
          </p>
        </div>

        <div className="license-info">
          <span>License Status</span>
          <strong>Active</strong>
          <small>No expiry</small>
        </div>

      </section>


      {/* BILLING */}
      <div className="billing-section">

        <div>
          <h2>Choose your protection</h2>
          <p>
            Select a plan based on the level of endpoint protection you need.
          </p>
        </div>

        <div className="billing-toggle">

          <button
            type="button"
            className={billing === 'monthly' ? 'active' : ''}
            onClick={() => setBilling('monthly')}
          >
            Monthly
          </button>

          <button
            type="button"
            className={billing === 'quarterly' ? 'active' : ''}
            onClick={() => setBilling('quarterly')}
          >
            Quarterly
          </button>

          <button
            type="button"
            className={billing === 'yearly' ? 'active' : ''}
            onClick={() => setBilling('yearly')}
          >
            Yearly
          </button>

        </div>

      </div>


      {/* PLANS */}
      <div className="plans-grid">

        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`plan-card${plan.popular ? ' popular' : ''}`}
          >

            {plan.popular && (
              <div className="popular-badge">
                Recommended Plan
              </div>
            )}

            <div className="plan-card-top">

              <h3>{plan.name}</h3>

              <p>{plan.description}</p>

              <div className="plan-price">
                <strong>{getPrice(plan)}</strong>
                <span>{getPeriod()}</span>
              </div>

            </div>


            <div className="plan-divider"></div>


            <div className="plan-features">

              <span className="features-title">
                Includes:
              </span>

              {plan.features.map((feature) => (
                <div
                  className="plan-feature"
                  key={feature}
                >
                  <span className="feature-check">
                    <CheckIcon />
                  </span>

                  <span>{feature}</span>
                </div>
              ))}

            </div>


            <button
              type="button"
              className={`plan-button${plan.name === 'Free' ? ' secondary' : ''}`}
            >
              {plan.label}
            </button>

          </div>
        ))}

      </div>


      {/* LICENSE */}
      <section className="license-card">

        <div className="license-card-icon">
          <ShieldIcon />
        </div>

        <div>
          <h2>License & Device Protection</h2>

          <p>
            Your subscription will determine the number of protected
            devices, available security features, and license duration.
          </p>
        </div>

        <div className="license-details">

          <div>
            <span>Devices</span>
            <strong>1</strong>
          </div>

          <div>
            <span>Status</span>
            <strong className="active-text">Active</strong>
          </div>

          <div>
            <span>Plan</span>
            <strong>Free</strong>
          </div>

        </div>

      </section>


      <div className="subscription-note">
        <ShieldIcon />
        <span>
          Payment processing, license generation, activation, expiry,
          and subscription synchronization will be connected to the backend.
        </span>
      </div>

    </div>
  )
}

export default Subscription