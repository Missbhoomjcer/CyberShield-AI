import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ScanFile from './pages/ScanFile.jsx'
import ActivityMonitor from './pages/ActivityMonitor.jsx'
import ThreatDetection from './pages/ThreatDetection.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scan" element={<ScanFile />} />
          <Route path="/activity-monitor" element={<ActivityMonitor />} />
          <Route path="/threats" element={<ThreatDetection />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

export default App