import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import Sidebar from './components/layout/Sidebar.jsx'

import Landing from './pages/Landing.jsx'
import Features from './pages/Features.jsx'
import Security from './pages/Security.jsx'
import About from './pages/About.jsx'
import Demo from './pages/Demo.jsx'

import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ScanFile from './pages/ScanFile.jsx'
import ActivityMonitor from './pages/ActivityMonitor.jsx'
import ThreatDetection from './pages/ThreatDetection.jsx'
import Protection from './pages/Protection.jsx'
import Quarantine from './pages/Quarantine.jsx'
import AISecurity from './pages/AISecurity.jsx'
import Devices from './pages/Devices.jsx'
import WindowsAgent from './pages/WindowsAgent.jsx'
import Reports from './pages/Reports.jsx'
import Subscription from './pages/Subscription.jsx'
import Settings from './pages/Settings.jsx'
import Payment from './pages/Payment.jsx'

import './App.css'


/* =========================================================
   PROTECTED LAYOUT
   ========================================================= */

function ProtectedLayout({ children }) {
  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">
        {children}
      </main>

    </div>
  )
}


/* =========================================================
   APP
   ========================================================= */

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(
    sessionStorage.getItem('cybershield_logged_in') === 'true'
  )

  const navigate = useNavigate()


  /* =======================================================
     LOGIN
     ======================================================= */

  const handleLogin = () => {

    sessionStorage.setItem(
      'cybershield_logged_in',
      'true'
    )

    setIsLoggedIn(true)

    navigate('/dashboard')
  }


  /* =======================================================
     LOGOUT
     ======================================================= */

  const handleLogout = () => {

    sessionStorage.removeItem(
      'cybershield_logged_in'
    )

    setIsLoggedIn(false)

    navigate('/')
  }


  return (

    <Routes>

      {/* ===================================================
          PUBLIC WEBSITE
          =================================================== */}

      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/landing"
        element={<Landing />}
      />

      <Route
        path="/features"
        element={<Features />}
      />

      <Route
        path="/security"
        element={<Security />}
      />

      <Route
        path="/about"
        element={<About />}
      />

      <Route
        path="/demo"
        element={<Demo />}
      />


      {/* ===================================================
          LOGIN
          =================================================== */}

      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <Login
              onLogin={handleLogin}
            />
          )
        }
      />


      {/* ===================================================
          DASHBOARD
          =================================================== */}

      <Route
        path="/dashboard"
        element={
          isLoggedIn ? (
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />


      {/* ===================================================
          SCAN
          =================================================== */}

      <Route
        path="/scan"
        element={
          isLoggedIn ? (
            <ProtectedLayout>
              <ScanFile />
            </ProtectedLayout>
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />


      {/* ===================================================
          REAL-TIME MONITORING
          =================================================== */}

      <Route
        path="/activity-monitor"
        element={
          isLoggedIn ? (
            <ProtectedLayout>
              <ActivityMonitor />
            </ProtectedLayout>
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />


      {/* ===================================================
          THREATS
          =================================================== */}

      <Route
        path="/threats"
        element={
          isLoggedIn ? (
            <ProtectedLayout>
              <ThreatDetection />
            </ProtectedLayout>
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />


      {/* ===================================================
          PROTECTION
          =================================================== */}

      <Route
        path="/protection"
        element={
          isLoggedIn ? (
            <ProtectedLayout>
              <Protection />
            </ProtectedLayout>
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />


      {/* ===================================================
          QUARANTINE
          =================================================== */}

      <Route
        path="/quarantine"
        element={
          isLoggedIn ? (
            <ProtectedLayout>
              <Quarantine />
            </ProtectedLayout>
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />


      {/* ===================================================
          AI SECURITY
          =================================================== */}

      <Route
        path="/ai-security"
        element={
          isLoggedIn ? (
            <ProtectedLayout>
              <AISecurity />
            </ProtectedLayout>
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />


      {/* ===================================================
          DEVICES
          =================================================== */}

      <Route
        path="/devices"
        element={
          isLoggedIn ? (
            <ProtectedLayout>
              <Devices />
            </ProtectedLayout>
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />


      {/* ===================================================
          WINDOWS AGENT
          =================================================== */}

      <Route
        path="/windows-agent"
        element={
          isLoggedIn ? (
            <ProtectedLayout>
              <WindowsAgent />
            </ProtectedLayout>
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />


      {/* ===================================================
          REPORTS
          =================================================== */}

      <Route
        path="/reports"
        element={
          isLoggedIn ? (
            <ProtectedLayout>
              <Reports />
            </ProtectedLayout>
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />


      {/* ===================================================
          SUBSCRIPTION
          =================================================== */}

      <Route
        path="/subscription"
        element={
          isLoggedIn ? (
            <ProtectedLayout>
              <Subscription />
            </ProtectedLayout>
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />


      {/* ===================================================
          PAYMENT
          =================================================== */}

      <Route
        path="/payment"
        element={
          isLoggedIn ? (
            <ProtectedLayout>
              <Payment />
            </ProtectedLayout>
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />


      {/* ===================================================
          SETTINGS
          =================================================== */}

      <Route
        path="/settings"
        element={
          isLoggedIn ? (
            <ProtectedLayout>
              <Settings />
            </ProtectedLayout>
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />


      {/* ===================================================
          UNKNOWN ROUTE
          =================================================== */}

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
  )
}

export default App