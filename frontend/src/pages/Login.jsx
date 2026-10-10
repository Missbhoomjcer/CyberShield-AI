
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import './Login.css'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    const cleanEmail = email.trim()
    const cleanPassword = password.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!cleanEmail) {
      setError('Please enter your email address.')
      return
    }

    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    if (!cleanPassword) {
      setError('Please enter your password.')
      return
    }

    if (cleanPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    // Existing frontend-only email/password flow is preserved.
    const user = {
      username: cleanEmail,
      role: 'User',
      rememberMe,
    }

    if (onLogin) {
      onLogin(user)
    } else {
      navigate('/')
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)

    try {
      // Step 1: Sign in with Google through Firebase.
      const result = await signInWithPopup(auth, googleProvider)
      const firebaseUser = result.user

      // Step 2: Get a Firebase ID token.
      const idToken = await firebaseUser.getIdToken()

      // Step 3: Ask FastAPI to verify the token.
      const response = await fetch('http://127.0.0.1:8000/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'Backend authentication failed. Please sign in again.'
            : 'Could not connect to the backend. Please try again.'
        )
      }

      const backendUser = await response.json()

      // Confirm that the backend verified the authenticated user.
      if (
        !backendUser.authenticated ||
        backendUser.user?.uid !== firebaseUser.uid
      ) {
        throw new Error('User verification failed. Please try again.')
      }

      console.log('Backend authenticated user:', backendUser)

      // Step 4: Preserve the existing dashboard login flow.
      const user = {
        username:
          backendUser.user.email ||
          firebaseUser.email ||
          firebaseUser.displayName ||
          'Google User',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        uid: backendUser.user.uid,
        role: 'User',
        rememberMe: false,
        provider: 'google',
      }

      if (onLogin) {
        onLogin(user)
      } else {
        navigate('/')
      }
    } catch (authError) {
      console.error('Google sign-in or backend authentication failed:', authError)

      if (
        authError.code === 'auth/popup-closed-by-user' ||
        authError.code === 'auth/cancelled-popup-request'
      ) {
        setError('Google sign-in was cancelled. Please try again.')
      } else if (authError.code === 'auth/unauthorized-domain') {
        setError(
          'This website domain is not authorized in Firebase. Add localhost in Firebase Authentication settings.'
        )
      } else if (authError.code === 'auth/popup-blocked') {
        setError(
          'Your browser blocked the Google sign-in popup. Allow popups and try again.'
        )
      } else {
        setError(
          authError.message || 'Google sign-in failed. Please try again.'
        )
      }
    } finally {
      setGoogleLoading(false)
    }
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
            <div className="login-brand-name">CyberShield-AI</div>
            <div className="login-brand-sub">
              SMART PROTECTION. SAFER TOMORROW.
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError('')
              }}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div className="login-field password-field">
            <div className="password-label-row">
              <label htmlFor="password">Password</label>
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
              onChange={(event) => {
                setPassword(event.target.value)
                setError('')
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <div className="remember-row">
            <label className="remember-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Remember me</span>
            </label>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="login-button">
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
            disabled={googleLoading}
          >
            <span className="google-icon">G</span>
            <span>{googleLoading ? 'Connecting...' : 'Google'}</span>
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

