import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login({ onLogin }) {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }

    const user = {
      username: email.trim(),
      role: 'User',
      rememberMe,
    }

    if (onLogin) {
      onLogin(user)
    } else {
      navigate('/')
    }
  }

  const handleGoogleLogin = () => {
    setError('Google sign-in will be connected later.')
  }

  const handleMicrosoftLogin = () => {
    setError('Microsoft sign-in will be connected later.')
  }

  return (
    <div className="login-page">

      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <svg
            viewBox="0 0 48 48"
            className="login-shield"
            aria-hidden="true"
          >
            <path
              d="M24 3L42 10V21C42 32.5 34.6 42 24 46C13.4 42 6 32.5 6 21V10L24 3Z"
              fill="#ffffff"
              stroke="#16b879"
              strokeWidth="3"
            />

            <path
              d="M17 24L21.5 28.5L31.5 18"
              fill="none"
              stroke="#16b879"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M24 3L42 10V14L24 7L6 14V10L24 3Z"
              fill="#1677ff"
            />
          </svg>

          <div className="login-logo-text">
            <div className="login-brand-name">
              CyberShield-AI
            </div>

            <div className="login-brand-sub">
              SMART PROTECTION. SAFER TOMORROW.
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="login-header">
          <h1>Welcome Back</h1>

          <p>
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="login-field">
            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="login-field password-field">
            <div className="password-label-row">
              <label htmlFor="password">
                Password
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={() =>
                  setError('Password recovery will be connected later.')
                }
              >
                Forgot password?
              </button>
            </div>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {/* Remember me */}
          <div className="remember-row">

            <label className="remember-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
              />

              <span>Remember me</span>
            </label>

          </div>

          {/* Error */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* Sign In */}
          <button
            type="submit"
            className="login-button"
          >
            Sign In
          </button>

        </form>

        {/* Divider */}
        <div className="login-divider">
          <span>or continue with</span>
        </div>

        {/* Social buttons */}
        <div className="social-buttons">

          <button
            type="button"
            className="social-button"
            onClick={handleGoogleLogin}
          >
            <span className="google-icon">G</span>
            <span>Google</span>
          </button>

          <button
            type="button"
            className="social-button"
            onClick={handleMicrosoftLogin}
          >
            <span className="microsoft-icon">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </span>

            <span>Microsoft</span>
          </button>

        </div>

        {/* Sign up */}
        <div className="signup-text">
          Don't have an account?
          <button
            type="button"
            onClick={() =>
              setError('Account creation will be connected later.')
            }
          >
            Create one
          </button>
        </div>

      </div>

    </div>
  )
}

export default Login