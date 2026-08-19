import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import Sidebar from './components/layout/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ScanFile from './pages/ScanFile.jsx'
import ActivityMonitor from './pages/ActivityMonitor.jsx'
import ThreatDetection from './pages/ThreatDetection.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import Login from './pages/Login.jsx'

import './App.css'

function ProtectedRoutes({ user, onLogout }) {
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">

        <div className="account-bar">
          <span>
            {user.username} · {user.role}
          </span>

          <button
            className="account-logout"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>

        <Routes>
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/scan"
            element={<ScanFile />}
          />

          <Route
            path="/activity-monitor"
            element={<ActivityMonitor />}
          />

          <Route
            path="/threats"
            element={<ThreatDetection />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>

      </main>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const savedUser =
      localStorage.getItem(
        'cybershield_user'
      )

    if (savedUser) {
      try {
        setUser(
          JSON.parse(savedUser)
        )
      } catch {
        localStorage.removeItem(
          'cybershield_user'
        )
      }
    }
  }, [])

  const handleLogin = (userData) => {
    localStorage.setItem(
      'cybershield_user',
      JSON.stringify(userData)
    )

    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem(
      'cybershield_user'
    )

    setUser(null)
  }

  if (!user) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              onLogin={handleLogin}
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    )
  }

  return (
    <ProtectedRoutes
      user={user}
      onLogout={handleLogout}
    />
  )
}

export default App