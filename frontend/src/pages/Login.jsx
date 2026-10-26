import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import './Login.css'

const API_URL = 'http://127.0.0.1:8000'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const saveLoggedInUser = (user) => {
    const displayName =
      user.displayName ||
      user.name ||
      user.full_name ||
      user.email?.split('@')[0] ||
      'User'

    const userData = {
      ...user,
      displayName,
      name: displayName,
      email: user.email || '',
    }

    const storage = rememberMe ? localStorage : sessionStorage

    storage.setItem('cybershield_user_name', displayName)
    storage.setItem('user_name', displayName)
    storage.setItem('userName', displayName)
    storage.setItem('username', displayName)
    storage.setItem('user_email', userData.email)
    storage.setItem('cybershield_user', JSON.stringify(userData))

    window.dispatchEvent(
      new CustomEvent('cybershield-user-updated', {
        detail: userData,
      })
    )

    if (typeof onLogin === 'function') {
      onLogin(userData)
    }
  }

  const handleEmailLogin = async (event) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    try {
      /*
       * This is the existing frontend-only login behavior.
       * It does not verify the password with Firebase or the backend.
       */
      const cleanEmail = email.trim().toLowerCase()
      const displayName = cleanEmail.split('@')[0]

      saveLoggedInUser({
        email: cleanEmail,
        displayName,
        name: displayName,
        role: 'User',
      })
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const firebaseUser = result.user
      const idToken = await firebaseUser.getIdToken()

      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            'Backend authentication failed. Please check your Firebase configuration.'
          )
        }

        throw new Error(
          `Backend request failed (${response.status}). Please try again.`
        )
      }

      const backendUser = await response.json()

      const displayName =
        firebaseUser.displayName ||
        backendUser.displayName ||
        backendUser.name ||
        backendUser.full_name ||
        firebaseUser.email?.split('@')[0] ||
        'User'

      saveLoggedInUser({
        ...backendUser,
        uid: firebaseUser.uid,
        email: firebaseUser.email || backendUser.email || '',
        displayName,
        name: displayName,
        photoURL: firebaseUser.photoURL,
        role: backendUser.role || 'User',
      })
    } catch (err) {
      console.error('Google login failed:', err)

      setError(
        err.code === 'auth/popup-closed-by-user'
          ? 'The Google sign-in window was closed. Please try again.'
          : err.message || 'Google sign-in failed. Please try again.'
      )
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon" aria-hidden="true">
            <svg
              viewBox="0 0 40 40"
              width="40"
              height="40"
              fill="none"
            >
              <path
                d="M20 3 33 8v10c0 9-5.5 15-13 19C12.5 33 7 27 7 18V8L20 3Z"
                stroke="#087cff"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="m14 20 4 4 8-9"
                stroke="#13b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <h1>CyberShield-AI</h1>
            <p>SMART PROTECTION. SAFER TOMORROW.</p>
          </div>
        </div>

        <div className="login-heading">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin}>
          <div className="login-field">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <div className="login-password-label">
              <label htmlFor="login-password">Password</label>
              <button
                type="button"
                className="login-text-button"
                onClick={() =>
                  setError(
                    'Password reset is not configured on this login form yet.'
                  )
                }
              >
                Forgot password?
              </button>
            </div>

            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <label className="login-remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Remember me</span>
          </label>

          <button
            type="submit"
            className="login-submit"
            disabled={loading || googleLoading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-divider">
          <span />
          <p>or continue with</p>
          <span />
        </div>

        <button
          type="button"
          className="login-google"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              fill="#4285F4"
              d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
            />
            <path
              fill="#34A853"
              d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
            />
            <path
              fill="#FBBC05"
              d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
            />
            <path
              fill="#EA4335"
              d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.9 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
            />
          </svg>

          {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
        </button>

        <p className="login-footer">
          Secure access to your CyberShield-AI dashboard
        </p>
      </section>
    </main>
  )
}

export default Login