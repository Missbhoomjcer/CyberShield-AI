import { useState } from 'react'
import './Login.css'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('User')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.')
      return
    }

    onLogin({
      username: username.trim(),
      role,
    })
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-brand">
          <div className="login-mark">◇</div>

          <div>
            <div className="login-brand-name">
              CyberShield-AI
            </div>

            <div className="login-brand-sub">
              RANSOMWARE & MALWARE DETECTION
            </div>
          </div>
        </div>

        <div className="login-header">
          <h1>Welcome Back</h1>

          <p>
            Sign in to access your CyberShield AI dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="login-field">
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <div className="login-field">
            <label htmlFor="role">
              Role
            </label>

            <select
              id="role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value)
              }
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
          >
            Sign In
          </button>

        </form>

        <div className="login-demo-note">
          Demo frontend authentication.
          Backend JWT authentication will be connected later.
        </div>

      </div>
    </div>
  )
}

export default Login