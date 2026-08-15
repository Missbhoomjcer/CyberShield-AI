import { getReports } from '../data/dummyData.js'
import SeverityBadge from '../components/threats/SeverityBadge.jsx'
import './Reports.css'

function Reports() {
  const reports = getReports()

  const handleView = (report) => {
    alert(`Report preview for ${report.id} will be available once connected to the backend.`)
  }

  const handleDownload = (report) => {
    alert(`PDF export for ${report.id} will be available once connected to the backend.`)
  }

  return (
    <div className="reports">
      <h1>Reports</h1>
      <p className="page-subtitle">Generated scan reports and threat analysis summaries</p>

      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Scan Date</th>
              <th>File Name</th>
              <th>Prediction</th>
              <th>Threat Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td className="mono">{r.id}</td>
                <td className="mono">{r.date}</td>
                <td className="mono">{r.fileName}</td>
                <td>
                  <span className={`badge ${r.prediction === 'Malware' ? 'badge-critical' : 'badge-low'}`}>
                    {r.prediction}
                  </span>
                </td>
                <td><SeverityBadge level={r.threatLevel} /></td>
                <td>
                  <div className="report-actions">
                    <button className="btn-link" onClick={() => handleView(r)}>View</button>
                    <button className="btn-link" onClick={() => handleDownload(r)}>Download</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Reports