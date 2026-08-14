// Central dummy data store.
// When FastAPI is ready, replace each function body with a fetch() call.
// Keep the function names and return shapes the same so components don't change.

export function getDashboardStats() {
  return {
    systemStatus: 'Protected',
    filesScanned: 1284,
    threatsDetected: 17,
    suspiciousActivities: 5,
    detectionAccuracy: 98.6,
  }
}

export function getThreatOverview() {
  return [
    { label: 'Ransomware', count: 8 },
    { label: 'Trojan', count: 5 },
    { label: 'Spyware', count: 2 },
    { label: 'Adware', count: 2 },
  ]
}

export function getRecentScans() {
  return [
    { id: 1, fileName: 'invoice_report.exe', type: 'EXE', prediction: 'Malware', confidence: 97.2, time: '2026-08-13 21:04' },
    { id: 2, fileName: 'setup_driver.dll', type: 'DLL', prediction: 'Benign', confidence: 99.1, time: '2026-08-13 20:47' },
    { id: 3, fileName: 'update_patch.exe', type: 'EXE', prediction: 'Benign', confidence: 95.8, time: '2026-08-13 19:32' },
    { id: 4, fileName: 'crack_tool.exe', type: 'EXE', prediction: 'Malware', confidence: 99.6, time: '2026-08-13 18:15' },
    { id: 5, fileName: 'photo_viewer.dll', type: 'DLL', prediction: 'Benign', confidence: 96.4, time: '2026-08-13 17:02' },
  ]
}
export function getScanResult(file) {
  const isMalware = Math.random() < 0.4
  return {
    fileName: file.name,
    fileType: file.name.split('.').pop().toUpperCase(),
    fileSize: (file.size / 1024).toFixed(1) + ' KB',
    prediction: isMalware ? 'Malware' : 'Benign',
    threatScore: isMalware ? (Math.random() * 30 + 70).toFixed(1) : (Math.random() * 15).toFixed(1),
    confidence: (Math.random() * 5 + 94).toFixed(1),
    sha256: Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join(''),
    entropy: (Math.random() * 2 + 6).toFixed(3),
    analysisTime: (Math.random() * 1.5 + 0.4).toFixed(2) + 's',
  }
}
export function getDetectedThreats() {
  return [
    { id: 1, name: 'ransom_encrypt.exe', type: 'Ransomware', severity: 'Critical', confidence: 99.2, time: '2026-08-13 21:04', status: 'Quarantined' },
    { id: 2, name: 'svc_host_fake.dll', type: 'Trojan', severity: 'High', confidence: 96.7, time: '2026-08-13 20:12', status: 'Quarantined' },
    { id: 3, name: 'keylogger_mod.exe', type: 'Spyware', severity: 'High', confidence: 94.3, time: '2026-08-13 19:48', status: 'Blocked' },
    { id: 4, name: 'toolbar_installer.exe', type: 'Adware', severity: 'Medium', confidence: 88.1, time: '2026-08-13 18:30', status: 'Flagged' },
    { id: 5, name: 'macro_dropper.dll', type: 'Trojan', severity: 'Critical', confidence: 98.5, time: '2026-08-13 17:55', status: 'Quarantined' },
    { id: 6, name: 'unwanted_ext.exe', type: 'Adware', severity: 'Low', confidence: 72.4, time: '2026-08-13 16:20', status: 'Flagged' },
    { id: 7, name: 'reg_injector.dll', type: 'Ransomware', severity: 'Critical', confidence: 99.8, time: '2026-08-13 15:03', status: 'Quarantined' },
    { id: 8, name: 'suspicious_svc.exe', type: 'Spyware', severity: 'Medium', confidence: 85.6, time: '2026-08-13 14:11', status: 'Flagged' },
  ]
}
const ACTIVITY_TEMPLATES = [
  { type: 'file', text: 'File read: C:\\Users\\Documents\\report.docx' },
  { type: 'file', text: 'File modified: C:\\Temp\\cache_182.tmp' },
  { type: 'process', text: 'Process started: svchost.exe (PID 4021)' },
  { type: 'process', text: 'Process started: explorer.exe (PID 1188)' },
  { type: 'warning', text: 'Suspicious rename pattern detected: 14 files in 2s' },
  { type: 'file', text: 'File access: C:\\ProgramData\\config.dat' },
  { type: 'process', text: 'Process terminated: notepad.exe (PID 3390)' },
  { type: 'warning', text: 'High entropy write detected on new_file_9284.tmp' },
]

export function getRandomActivityEvent() {
  const template = ACTIVITY_TEMPLATES[Math.floor(Math.random() * ACTIVITY_TEMPLATES.length)]
  return {
    id: Date.now() + Math.random(),
    ...template,
    time: new Date().toLocaleTimeString(),
  }
}

export function getLiveMetrics() {
  return {
    cpuUsage: (Math.random() * 25 + 5).toFixed(1),
    fileModRate: Math.floor(Math.random() * 12 + 1),
    fileRenameRate: Math.floor(Math.random() * 5),
    fileAccessFreq: Math.floor(Math.random() * 40 + 10),
    entropy: (Math.random() * 1.5 + 5.5).toFixed(2),
  }
}
export function getReports() {
  return [
    { id: 'RPT-2026-0091', date: '2026-08-13', fileName: 'invoice_report.exe', prediction: 'Malware', threatLevel: 'Critical' },
    { id: 'RPT-2026-0090', date: '2026-08-13', fileName: 'setup_driver.dll', prediction: 'Benign', threatLevel: 'Low' },
    { id: 'RPT-2026-0089', date: '2026-08-12', fileName: 'update_patch.exe', prediction: 'Benign', threatLevel: 'Low' },
    { id: 'RPT-2026-0088', date: '2026-08-12', fileName: 'crack_tool.exe', prediction: 'Malware', threatLevel: 'Critical' },
    { id: 'RPT-2026-0087', date: '2026-08-11', fileName: 'toolbar_installer.exe', prediction: 'Malware', threatLevel: 'Medium' },
    { id: 'RPT-2026-0086', date: '2026-08-11', fileName: 'photo_viewer.dll', prediction: 'Benign', threatLevel: 'Low' },
    { id: 'RPT-2026-0085', date: '2026-08-10', fileName: 'keylogger_mod.exe', prediction: 'Malware', threatLevel: 'High' },
  ]
}