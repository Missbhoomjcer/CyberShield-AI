import { createContext, useContext, useEffect, useState } from 'react'

const LanguageContext = createContext()

const translations = {
  English: {

    // =========================================================
    // SIDEBAR / NAVIGATION
    // =========================================================

    dashboard: 'Dashboard',
    scan: 'Scan',
    realTimeMonitoring: 'Real-Time Monitoring',
    protection: 'Protection',
    threats: 'Threats',
    quarantine: 'Quarantine',
    aiSecurity: 'AI Security',

    management: 'Management',
    devices: 'Devices',
    windowsAgent: 'Windows Agent',
    reports: 'Reports',
    subscription: 'Subscription',
    settings: 'Settings',

    protected: 'Protected',
    deviceSecure: 'Your device is secure',
    personalDevice: 'Personal Device',
    manageSettings: 'Manage your security and application preferences',


    // =========================================================
    // SETTINGS
    // =========================================================

    generalSettings: 'General Settings',

    generalSettingsDescription:
      'Configure general preferences for your CyberShield-AI protection platform.',

    language: 'Language',

    languageDescription:
      'Choose the language used throughout the CyberShield-AI dashboard.',

    english: 'English',
    hindi: 'Hindi',

    automaticUpdates: 'Automatic Updates',

    automaticUpdatesDescription:
      'Automatically receive the latest security updates and improvements.',

    protectionSettings: 'Protection Settings',

    protectionSettingsDescription:
      'Configure the security protection modules running on your device.',

    realTimeProtection: 'Real-Time Protection',

    realTimeProtectionDescription:
      'Continuously monitor your device for suspicious activity.',

    ransomwareProtection: 'Ransomware Protection',

    ransomwareProtectionDescription:
      'Detect and protect against ransomware-related activity.',

    behavioralMonitoring: 'Behavioral Monitoring',

    behavioralMonitoringDescription:
      'Monitor system behavior for suspicious or malicious patterns.',

    networkProtection: 'Network Protection',

    networkProtectionDescription:
      'Monitor network activity for potentially harmful connections.',

    notifications: 'Notifications',

    notificationsDescription:
      'Manage security alerts and notification preferences.',

    securityNotifications: 'Security Notifications',

    securityNotificationsDescription:
      'Receive alerts when important security events are detected.',

    account: 'Account',

    accountDescription:
      'Manage your CyberShield-AI account and profile information.',

    editProfile: 'Edit Profile',


    // =========================================================
    // DASHBOARD
    // =========================================================

    scanYourDevice: 'Scan Your Device',

    scanDescription:
      'Analyze files and detect potential security threats using AI-powered analysis.',

    quickScan: 'Quick Scan',
    fullScan: 'Full Scan',
    customScan: 'Custom Scan',

    soon: 'Soon',

    aiFileScan: 'AI File Scan',

    aiFileScanDescription:
      'Upload an executable file for AI-powered malware and ransomware analysis.',

    aiEngine: 'AI Engine',

    readyToScan: 'Ready to Scan',

    readyToScanDescription:
      'Upload a supported executable file to begin security analysis.',

    peFeatureAnalysis: 'PE Feature Analysis',
    xgboostThreatDetection: 'XGBoost Threat Detection',
    sha256Identification: 'SHA-256 Identification',
    shapExplanation: 'SHAP Explanation',

    lastScan: 'Last Scan',

    mostRecentAnalysis: 'Most recent security analysis',

    noScanCompleted: 'No scan completed',

    latestScanWillAppear:
      'Your latest scan will appear here.',

    chooseFile: 'Choose File',

    startQuickScan: 'Start Quick Scan',

    scanning: 'Scanning...',

    dragDropFile: 'Drag & drop your file here',

    orClickBrowse: 'or click to browse',

    supportedFiles: 'Supported files:',

    supportedExeDll: '.exe and .dll',

    clickOrDropAnother:
      'Click or drop another file',

    on: 'ON',
    off: 'OFF',


    // =========================================================
    // PROTECTION
    // =========================================================

    protectionStatus: 'Protection Status',

    protectionActive:
      'Your protection modules are active.',

    protectionModules:
      'Protection Modules',

    allSystemsProtected:
      'All protection systems are active.',

    aiPoweredDetection:
      'AI-Powered Threat Detection',

    aiPoweredDetectionDescription:
      'CyberShield-AI combines machine learning and behavioral analysis to detect suspicious activity.',

    automaticResponse:
      'Automatic Response',

    automaticResponseDescription:
      'Suspicious activity can be blocked, contained, or quarantined according to the protection policy.',


    // =========================================================
    // THREATS
    // =========================================================

    threatDetection: 'Threat Detection',

    threatDetectionDescription:
      'Review detected security threats and suspicious activity.',

    totalThreats: 'Total Threats',

    criticalThreats: 'Critical',

    highThreats: 'High',

    mediumThreats: 'Medium',

    lowThreats: 'Low',

    searchThreats: 'Search threats...',

    allThreats: 'All Threats',

    threat: 'Threat',

    severity: 'Severity',

    status: 'Status',

    source: 'Source',

    confidence: 'Confidence',

    detectedAt: 'Detected At',

    noThreatsFound: 'No threats found.',

    failedToFetch: 'Failed to fetch security data.',


    // =========================================================
    // QUARANTINE
    // =========================================================

    quarantineTitle: 'Quarantine',

    quarantineDescription:
      'Manage files that have been isolated from your device.',

    quarantinedItems: 'Quarantined Items',

    refresh: 'Refresh',

    view: 'View',

    restore: 'Restore',

    delete: 'Delete',

    quarantined: 'Quarantined',

    noQuarantinedItems:
      'No quarantined items found.',

    quarantineInfo:
      'Quarantined files are isolated to prevent potential threats from affecting your device.',


    // =========================================================
    // AI SECURITY
    // =========================================================

    aiSecurityTitle: 'AI Security',

    aiSecurityDescription:
      'Use AI-powered analysis to understand security threats and recommendations.',

    threatAnalysis: 'Threat Analysis',

    securityKnowledge: 'Security Knowledge',

    askAI: 'Ask AI',

    askAIPlaceholder:
      'Ask a security-related question...',

    recentAISecurityActivity:
      'Recent AI Security Activity',

    noRecentActivity:
      'No recent AI security activity.',

    aiAnalyzing:
      'AI is analyzing your request...',

    sendQuestion: 'Send Question',

    xgboostAnalysis: 'XGBoost Analysis',
    lstmBehavioralDetection: 'LSTM Behavioral Detection',
    shapExplainability: 'SHAP Explainability',


    // =========================================================
    // DEVICES
    // =========================================================

    devicesTitle: 'Devices',

    devicesDescription:
      'Manage devices protected by CyberShield-AI.',

    totalDevices: 'Total Devices',

    protectedDevices: 'Protected',

    agentOnline: 'Agent Online',

    addDevice: 'Add Device',

    online: 'Online',

    offline: 'Offline',

    lastSeen: 'Last seen',

    agentConnected: 'Agent Connected',

    modulesActive: 'modules active',

    windowsAgentTitle: 'Windows Agent',

    windowsAgentDescription:
      'Install the CyberShield Windows Agent to enable endpoint monitoring and protection.',


    // =========================================================
    // WINDOWS AGENT
    // =========================================================

    downloadWindowsAgent: 'Download Windows Agent',

    windowsAgentSubtitle:
      'Install CyberShield-AI on your Windows device for real-time endpoint protection.',

    downloadAgent: 'Download Windows Agent',

    downloading: 'Preparing Download...',

    setupTitle: 'How to Set Up',

    stepOne: 'Download the Windows Agent',
    stepTwo: 'Install and Sign In',
    stepThree: 'Enable Protection',

    stepOneDescription:
      'Download the CyberShield-AI Windows Agent installer.',

    stepTwoDescription:
      'Install the agent and sign in using your CyberShield-AI account.',

    stepThreeDescription:
      'Enable real-time protection and connect your device to the dashboard.',

    agentFeatures: 'Agent Features',

    realTimeMonitoringFeature:
      'Real-Time System Monitoring',

    ransomwareDetectionFeature:
      'Ransomware Detection',

    behavioralAnalysisFeature:
      'Behavioral Analysis',

    automaticThreatResponse:
      'Automatic Threat Response',

    systemRequirements: 'System Requirements',

    windowsVersion: 'Windows 10 or Windows 11',

    internetConnection: 'Internet connection required',

    minimumRam: 'Minimum 4 GB RAM',

    adminAccess: 'Administrator access required',


    // =========================================================
    // REPORTS
    // =========================================================

    reportsTitle: 'Reports',

    reportsDescription:
      'View and download security analysis reports.',

    scanReports: 'Scan Reports',

    generateReport: 'Generate Report',

    downloadReport: 'Download Report',

    reportDetails: 'Report Details',

    filename: 'Filename',

    fileType: 'File Type',

    fileSize: 'File Size',

    sha256: 'SHA-256',

    entropy: 'Entropy',

    prediction: 'Prediction',

    threatScore: 'Threat Score',

    model: 'Model',

    createdAt: 'Created At',

    noReports: 'No reports available.',

    viewReport: 'View Report',


    // =========================================================
    // SUBSCRIPTION
    // =========================================================

    subscriptionTitle: 'Subscription',

    subscriptionDescription:
      'Choose a protection plan that fits your needs.',

    currentPlan: 'Current Plan',

    freePlan: 'Free',

    freePlanDescription:
      'Basic protection for personal use.',

    proPlan: 'Pro',

    proPlanDescription:
      'Advanced protection for individual users.',

    businessPlan: 'Business',

    businessPlanDescription:
      'Advanced endpoint protection for teams and organizations.',

    monthly: 'Monthly',

    quarterly: 'Quarterly',

    yearly: 'Yearly',

    recommended: 'Recommended',

    activePlan: 'Active Plan',

    upgrade: 'Upgrade',

    getStarted: 'Get Started',

    licenseAndDeviceProtection:
      'License & Device Protection',

    licenseDescription:
      'Your subscription license controls access to premium protection features and protected devices.',

    backendSubscriptionNote:
      'Subscription management and license activation will be connected to the backend.',


    // =========================================================
    // PAYMENT
    // =========================================================

    paymentSuccessful: 'Payment Successful',

    subscriptionActivated:
      'Your CyberShield-AI subscription has been activated successfully.',

    amount: 'Amount',

    license: 'License',

    active: 'Active',

    licenseId: 'License ID',

    licenseReady:
      'Your license is ready for activation on your Windows Agent.',

    setupWindowsAgent: 'Set Up Windows Agent',

    goDashboard: 'Go to Dashboard',

    backSubscription: '← Back to Subscription',

    completePurchase: 'Complete Your Purchase',

    activatePlan:
      'Securely activate your CyberShield-AI protection plan.',

    paymentMethod: 'Payment Method',

    creditDebit: 'Credit / Debit Card',

    cardTypes: 'Visa, Mastercard, RuPay',

    upi: 'UPI',

    upiApps: 'Google Pay, PhonePe, BHIM',

    netBanking: 'Net Banking',

    majorBanks: 'All major Indian banks',

    cardDetails: 'Card Details',

    cardNumber: 'Card Number',

    cardNumberPlaceholder:
      '1234 5678 9012 3456',

    nameOnCard: 'Name on Card',

    namePlaceholder:
      'Harshita Teradale',

    expiryDate: 'Expiry Date',

    expiryPlaceholder: 'MM / YY',

    cvv: 'CVV',

    cvvPlaceholder: '123',

    upiDetails: 'UPI Details',

    upiId: 'UPI ID',

    upiPlaceholder: 'yourname@upi',

    upiInfo:
      'You will be redirected to your UPI application to complete the payment.',

    netBankingTitle: 'Net Banking',

    selectBank: 'Select Bank',

    selectYourBank: 'Select your bank',

    stateBank: 'State Bank of India',

    hdfc: 'HDFC Bank',

    icici: 'ICICI Bank',

    axis: 'Axis Bank',

    kotak: 'Kotak Mahindra Bank',

    otherBank: 'Other Bank',

    securePayment: 'Secure Payment',

    backendPayment:
      'Payment processing will be connected to the backend.',

    processingPayment: 'Processing Payment...',

    pay: 'Pay',

    selectedPlan: 'SELECTED PLAN',

    advancedProtection:
      'Advanced endpoint protection for your device.',

    devices: 'Devices',

    total: 'Total',

    protectionIncluded: 'Protection included',

    quarantineContainment:
      'Quarantine & Containment',

    aiSecurityCopilot:
      'AI Security Copilot',


    // =========================================================
    // PUBLIC WEBSITE
    // =========================================================

    features: 'Features',

    security: 'Security',

    about: 'About',

    signIn: 'Sign In',

    builtForSecurity: 'BUILT FOR SECURITY',

    heroTitle1: 'Detect. Decide.',

    heroTitle2: 'Protect.',

    heroDescription:
      'CyberShield-AI combines static analysis, behavioral monitoring and machine learning to provide a unified endpoint security workflow.',

    pipelineLabel:
      'THREAT PROTECTION PIPELINE',

    pipelineTitle:
      'From detection to response',

    pipelineDescription:
      'Security signals are analyzed and used to determine an appropriate protection response.',

    detect: 'Detect',

    detectDescription:
      'Identify suspicious files, processes and behavioral activity on the endpoint.',

    analyze: 'Analyze',

    analyzeDescription:
      'Apply static machine learning and behavioral analysis to evaluate the detected activity.',

    decide: 'Decide',

    decideDescription:
      'Combine security signals and determine the appropriate threat response.',

    protect: 'Protect',

    protectDescription:
      'Block, contain or quarantine suspicious activity according to the protection policy.',

    technologyLabel:
      'SECURITY TECHNOLOGY',

    technologyTitle:
      'Multiple layers of analysis',

    staticAnalysis:
      'Static Analysis',

    staticDescription:
      'Executable files can be analyzed using extracted PE characteristics and machine learning classification.',

    behavioralAnalysis:
      'Behavioral Analysis',

    behavioralDescription:
      'Endpoint activity can be monitored for behavioral patterns associated with suspicious or ransomware-related activity.',

    explainableAnalysis:
      'Explainable Analysis',

    explainableDescription:
      'Model outputs can be supported with feature importance and explainability information.',

    threatResponse:
      'Threat Response',

    threatResponseDescription:
      'Detected threats can move through a protection workflow including blocking, containment and quarantine.',

    protectionPrinciples:
      'PROTECTION PRINCIPLES',

    principlesTitle:
      'Security focused on early detection',

    principlesDescription:
      'CyberShield-AI is designed to combine file-based analysis with real-time behavioral signals so suspicious activity can be evaluated from multiple security perspectives.',

    multilayerDetection:
      'Multi-layer detection',

    multilayerDescription:
      'Static and behavioral analysis work together.',

    threatScoring:
      'Threat scoring',

    threatScoringDescription:
      'Detection results can be converted into actionable risk information.',

    controlledResponse:
      'Controlled response',

    controlledResponseDescription:
      'Protection actions can isolate suspicious activity and files.',

    ctaTitle:
      'Explore CyberShield-AI',

    ctaDescription:
      'Start exploring the platform and its security capabilities.',

    footerDescription:
      'AI-powered ransomware and malware detection.'
  },


  // ===========================================================
  // HINDI
  // ===========================================================

  Hindi: {

    // =========================================================
    // SIDEBAR / NAVIGATION
    // =========================================================

    dashboard: 'डैशबोर्ड',
    scan: 'स्कैन',
    realTimeMonitoring: 'रियल-टाइम निगरानी',
    protection: 'सुरक्षा',
    threats: 'खतरे',
    quarantine: 'क्वारंटीन',
    aiSecurity: 'AI सुरक्षा',

    management: 'प्रबंधन',
    devices: 'डिवाइस',
    windowsAgent: 'Windows Agent',
    reports: 'रिपोर्ट',
    subscription: 'सदस्यता',
    settings: 'सेटिंग्स',

    protected: 'सुरक्षित',
    deviceSecure: 'आपका डिवाइस सुरक्षित है',
    personalDevice: 'व्यक्तिगत डिवाइस',

    manageSettings:
      'अपनी सुरक्षा और एप्लिकेशन प्राथमिकताओं को प्रबंधित करें',


    // =========================================================
    // SETTINGS
    // =========================================================

    generalSettings: 'सामान्य सेटिंग्स',

    generalSettingsDescription:
      'अपने CyberShield-AI सुरक्षा प्लेटफॉर्म की सामान्य प्राथमिकताओं को कॉन्फ़िगर करें।',

    language: 'भाषा',

    languageDescription:
      'पूरे CyberShield-AI डैशबोर्ड में उपयोग की जाने वाली भाषा चुनें।',

    english: 'अंग्रेज़ी',

    hindi: 'हिंदी',

    automaticUpdates: 'स्वचालित अपडेट',

    automaticUpdatesDescription:
      'नवीनतम सुरक्षा अपडेट और सुधार स्वचालित रूप से प्राप्त करें।',

    protectionSettings: 'सुरक्षा सेटिंग्स',

    protectionSettingsDescription:
      'अपने डिवाइस पर चलने वाले सुरक्षा मॉड्यूल कॉन्फ़िगर करें।',

    realTimeProtection: 'रियल-टाइम सुरक्षा',

    realTimeProtectionDescription:
      'संदिग्ध गतिविधि के लिए अपने डिवाइस की लगातार निगरानी करें।',

    ransomwareProtection: 'रैनसमवेयर सुरक्षा',

    ransomwareProtectionDescription:
      'रैनसमवेयर से संबंधित गतिविधि की पहचान करें और उससे सुरक्षा प्रदान करें।',

    behavioralMonitoring: 'व्यवहार निगरानी',

    behavioralMonitoringDescription:
      'संदिग्ध या हानिकारक व्यवहार पैटर्न के लिए सिस्टम गतिविधि की निगरानी करें।',

    networkProtection: 'नेटवर्क सुरक्षा',

    networkProtectionDescription:
      'संभावित रूप से हानिकारक कनेक्शन के लिए नेटवर्क गतिविधि की निगरानी करें।',

    notifications: 'सूचनाएँ',

    notificationsDescription:
      'सुरक्षा अलर्ट और सूचना प्राथमिकताओं को प्रबंधित करें।',

    securityNotifications: 'सुरक्षा सूचनाएँ',

    securityNotificationsDescription:
      'महत्वपूर्ण सुरक्षा घटनाओं का पता चलने पर अलर्ट प्राप्त करें।',

    account: 'खाता',

    accountDescription:
      'अपने CyberShield-AI खाते और प्रोफ़ाइल की जानकारी प्रबंधित करें।',

    editProfile: 'प्रोफ़ाइल संपादित करें',


    // =========================================================
    // DASHBOARD
    // =========================================================

    scanYourDevice: 'अपने डिवाइस को स्कैन करें',

    scanDescription:
      'AI-संचालित विश्लेषण का उपयोग करके फाइलों का विश्लेषण करें और संभावित सुरक्षा खतरों की पहचान करें।',

    quickScan: 'क्विक स्कैन',
    fullScan: 'फुल स्कैन',
    customScan: 'कस्टम स्कैन',

    soon: 'जल्द ही',

    aiFileScan: 'AI फाइल स्कैन',

    aiFileScanDescription:
      'AI-संचालित मैलवेयर और रैनसमवेयर विश्लेषण के लिए एक एक्जीक्यूटेबल फाइल अपलोड करें।',

    aiEngine: 'AI इंजन',

    readyToScan: 'स्कैन के लिए तैयार',

    readyToScanDescription:
      'सुरक्षा विश्लेषण शुरू करने के लिए समर्थित एक्जीक्यूटेबल फाइल अपलोड करें।',

    peFeatureAnalysis: 'PE फीचर विश्लेषण',

    xgboostThreatDetection:
      'XGBoost खतरा पहचान',

    sha256Identification:
      'SHA-256 पहचान',

    shapExplanation:
      'SHAP व्याख्या',

    lastScan: 'अंतिम स्कैन',

    mostRecentAnalysis:
      'सबसे हालिया सुरक्षा विश्लेषण',

    noScanCompleted:
      'कोई स्कैन पूरा नहीं हुआ',

    latestScanWillAppear:
      'आपका नवीनतम स्कैन यहाँ दिखाई देगा।',

    chooseFile: 'फाइल चुनें',

    startQuickScan:
      'क्विक स्कैन शुरू करें',

    scanning: 'स्कैन हो रहा है...',

    dragDropFile:
      'अपनी फाइल यहाँ ड्रैग और ड्रॉप करें',

    orClickBrowse:
      'या ब्राउज़ करने के लिए क्लिक करें',

    supportedFiles:
      'समर्थित फाइलें:',

    supportedExeDll:
      '.exe और .dll',

    clickOrDropAnother:
      'दूसरी फाइल चुनने या ड्रॉप करने के लिए क्लिक करें',

    on: 'चालू',
    off: 'बंद',


    // =========================================================
    // PROTECTION
    // =========================================================

    protectionStatus:
      'सुरक्षा स्थिति',

    protectionActive:
      'आपके सुरक्षा मॉड्यूल सक्रिय हैं।',

    protectionModules:
      'सुरक्षा मॉड्यूल',

    allSystemsProtected:
      'सभी सुरक्षा सिस्टम सक्रिय हैं।',

    aiPoweredDetection:
      'AI-संचालित खतरा पहचान',

    aiPoweredDetectionDescription:
      'CyberShield-AI संदिग्ध गतिविधि की पहचान करने के लिए मशीन लर्निंग और व्यवहार विश्लेषण को जोड़ता है।',

    automaticResponse:
      'स्वचालित प्रतिक्रिया',

    automaticResponseDescription:
      'सुरक्षा नीति के अनुसार संदिग्ध गतिविधि को ब्लॉक, कंटेन या क्वारंटीन किया जा सकता है।',


    // =========================================================
    // THREATS
    // =========================================================

    threatDetection:
      'खतरा पहचान',

    threatDetectionDescription:
      'पहचाने गए सुरक्षा खतरों और संदिग्ध गतिविधि की समीक्षा करें।',

    totalThreats:
      'कुल खतरे',

    criticalThreats:
      'गंभीर',

    highThreats:
      'उच्च',

    mediumThreats:
      'मध्यम',

    lowThreats:
      'कम',

    searchThreats:
      'खतरों को खोजें...',

    allThreats:
      'सभी खतरे',

    threat:
      'खतरा',

    severity:
      'गंभीरता',

    status:
      'स्थिति',

    source:
      'स्रोत',

    confidence:
      'विश्वास स्तर',

    detectedAt:
      'पहचान का समय',

    noThreatsFound:
      'कोई खतरा नहीं मिला।',

    failedToFetch:
      'सुरक्षा डेटा प्राप्त करने में विफल।',


    // =========================================================
    // QUARANTINE
    // =========================================================

    quarantineTitle:
      'क्वारंटीन',

    quarantineDescription:
      'अपने डिवाइस से अलग की गई फाइलों को प्रबंधित करें।',

    quarantinedItems:
      'क्वारंटीन की गई वस्तुएँ',

    refresh:
      'रिफ्रेश',

    view:
      'देखें',

    restore:
      'पुनर्स्थापित करें',

    delete:
      'हटाएँ',

    quarantined:
      'क्वारंटीन किया गया',

    noQuarantinedItems:
      'कोई क्वारंटीन की गई वस्तु नहीं मिली।',

    quarantineInfo:
      'क्वारंटीन की गई फाइलों को अलग रखा जाता है ताकि संभावित खतरे आपके डिवाइस को प्रभावित न कर सकें।',


    // =========================================================
    // AI SECURITY
    // =========================================================

    aiSecurityTitle:
      'AI सुरक्षा',

    aiSecurityDescription:
      'सुरक्षा खतरों और सुझावों को समझने के लिए AI-संचालित विश्लेषण का उपयोग करें।',

    threatAnalysis:
      'खतरा विश्लेषण',

    securityKnowledge:
      'सुरक्षा ज्ञान',

    askAI:
      'AI से पूछें',

    askAIPlaceholder:
      'सुरक्षा से संबंधित प्रश्न पूछें...',

    recentAISecurityActivity:
      'हाल की AI सुरक्षा गतिविधि',

    noRecentActivity:
      'कोई हाल की AI सुरक्षा गतिविधि नहीं है।',

    aiAnalyzing:
      'AI आपके अनुरोध का विश्लेषण कर रहा है...',

    sendQuestion:
      'प्रश्न भेजें',

    xgboostAnalysis:
      'XGBoost विश्लेषण',

    lstmBehavioralDetection:
      'LSTM व्यवहार पहचान',

    shapExplainability:
      'SHAP व्याख्यात्मक विश्लेषण',


    // =========================================================
    // DEVICES
    // =========================================================

    devicesTitle:
      'डिवाइस',

    devicesDescription:
      'CyberShield-AI द्वारा सुरक्षित डिवाइस प्रबंधित करें।',

    totalDevices:
      'कुल डिवाइस',

    protectedDevices:
      'सुरक्षित',

    agentOnline:
      'Agent ऑनलाइन',

    addDevice:
      'डिवाइस जोड़ें',

    online:
      'ऑनलाइन',

    offline:
      'ऑफलाइन',

    lastSeen:
      'अंतिम बार देखा गया',

    agentConnected:
      'Agent कनेक्टेड',

    modulesActive:
      'मॉड्यूल सक्रिय',

    windowsAgentTitle:
      'Windows Agent',

    windowsAgentDescription:
      'एंडपॉइंट निगरानी और सुरक्षा सक्षम करने के लिए CyberShield Windows Agent इंस्टॉल करें।',


    // =========================================================
    // WINDOWS AGENT
    // =========================================================

    downloadWindowsAgent:
      'Windows Agent डाउनलोड करें',

    windowsAgentSubtitle:
      'रियल-टाइम एंडपॉइंट सुरक्षा के लिए अपने Windows डिवाइस पर CyberShield-AI इंस्टॉल करें।',

    downloadAgent:
      'Windows Agent डाउनलोड करें',

    downloading:
      'डाउनलोड तैयार हो रहा है...',

    setupTitle:
      'सेटअप कैसे करें',

    stepOne:
      'Windows Agent डाउनलोड करें',

    stepTwo:
      'इंस्टॉल करें और साइन इन करें',

    stepThree:
      'सुरक्षा सक्षम करें',

    stepOneDescription:
      'CyberShield-AI Windows Agent इंस्टॉलर डाउनलोड करें।',

    stepTwoDescription:
      'Agent इंस्टॉल करें और अपने CyberShield-AI खाते से साइन इन करें।',

    stepThreeDescription:
      'रियल-टाइम सुरक्षा सक्षम करें और अपने डिवाइस को डैशबोर्ड से कनेक्ट करें।',

    agentFeatures:
      'Agent सुविधाएँ',

    realTimeMonitoringFeature:
      'रियल-टाइम सिस्टम निगरानी',

    ransomwareDetectionFeature:
      'रैनसमवेयर पहचान',

    behavioralAnalysisFeature:
      'व्यवहार विश्लेषण',

    automaticThreatResponse:
      'स्वचालित खतरा प्रतिक्रिया',

    systemRequirements:
      'सिस्टम आवश्यकताएँ',

    windowsVersion:
      'Windows 10 या Windows 11',

    internetConnection:
      'इंटरनेट कनेक्शन आवश्यक है',

    minimumRam:
      'कम से कम 4 GB RAM',

    adminAccess:
      'Administrator access आवश्यक है',


    // =========================================================
    // REPORTS
    // =========================================================

    reportsTitle:
      'रिपोर्ट',

    reportsDescription:
      'सुरक्षा विश्लेषण रिपोर्ट देखें और डाउनलोड करें।',

    scanReports:
      'स्कैन रिपोर्ट',

    generateReport:
      'रिपोर्ट बनाएँ',

    downloadReport:
      'रिपोर्ट डाउनलोड करें',

    reportDetails:
      'रिपोर्ट विवरण',

    filename:
      'फाइल नाम',

    fileType:
      'फाइल प्रकार',

    fileSize:
      'फाइल आकार',

    sha256:
      'SHA-256',

    entropy:
      'Entropy',

    prediction:
      'Prediction',

    threatScore:
      'खतरा स्कोर',

    model:
      'मॉडल',

    createdAt:
      'बनाया गया',

    noReports:
      'कोई रिपोर्ट उपलब्ध नहीं है।',

    viewReport:
      'रिपोर्ट देखें',


    // =========================================================
    // SUBSCRIPTION
    // =========================================================

    subscriptionTitle:
      'सदस्यता',

    subscriptionDescription:
      'अपनी आवश्यकताओं के अनुसार सुरक्षा प्लान चुनें।',

    currentPlan:
      'वर्तमान प्लान',

    freePlan:
      'फ्री',

    freePlanDescription:
      'व्यक्तिगत उपयोग के लिए बेसिक सुरक्षा।',

    proPlan:
      'Pro',

    proPlanDescription:
      'व्यक्तिगत उपयोगकर्ताओं के लिए उन्नत सुरक्षा।',

    businessPlan:
      'Business',

    businessPlanDescription:
      'टीम और संगठनों के लिए उन्नत एंडपॉइंट सुरक्षा।',

    monthly:
      'मासिक',

    quarterly:
      'त्रैमासिक',

    yearly:
      'वार्षिक',

    recommended:
      'अनुशंसित',

    activePlan:
      'सक्रिय प्लान',

    upgrade:
      'अपग्रेड',

    getStarted:
      'शुरू करें',

    licenseAndDeviceProtection:
      'लाइसेंस और डिवाइस सुरक्षा',

    licenseDescription:
      'आपकी सदस्यता का लाइसेंस प्रीमियम सुरक्षा सुविधाओं और सुरक्षित डिवाइसों तक पहुँच को नियंत्रित करता है।',

    backendSubscriptionNote:
      'सदस्यता प्रबंधन और लाइसेंस सक्रियण को बैकएंड से जोड़ा जाएगा।',


    // =========================================================
    // PAYMENT
    // =========================================================

    paymentSuccessful:
      'भुगतान सफल',

    subscriptionActivated:
      'आपकी CyberShield-AI सदस्यता सफलतापूर्वक सक्रिय हो गई है।',

    amount:
      'राशि',

    license:
      'लाइसेंस',

    active:
      'सक्रिय',

    licenseId:
      'लाइसेंस ID',

    licenseReady:
      'आपका लाइसेंस Windows Agent पर सक्रिय करने के लिए तैयार है।',

    setupWindowsAgent:
      'Windows Agent सेट अप करें',

    goDashboard:
      'डैशबोर्ड पर जाएँ',

    backSubscription:
      '← सदस्यता पर वापस जाएँ',

    completePurchase:
      'अपनी खरीदारी पूरी करें',

    activatePlan:
      'अपने CyberShield-AI सुरक्षा प्लान को सुरक्षित रूप से सक्रिय करें।',

    paymentMethod:
      'भुगतान का तरीका',

    creditDebit:
      'क्रेडिट / डेबिट कार्ड',

    cardTypes:
      'Visa, Mastercard, RuPay',

    upi:
      'UPI',

    upiApps:
      'Google Pay, PhonePe, BHIM',

    netBanking:
      'नेट बैंकिंग',

    majorBanks:
      'सभी प्रमुख भारतीय बैंक',

    cardDetails:
      'कार्ड विवरण',

    cardNumber:
      'कार्ड नंबर',

    cardNumberPlaceholder:
      '1234 5678 9012 3456',

    nameOnCard:
      'कार्ड पर नाम',

    namePlaceholder:
      'Harshita Teradale',

    expiryDate:
      'समाप्ति तिथि',

    expiryPlaceholder:
      'MM / YY',

    cvv:
      'CVV',

    cvvPlaceholder:
      '123',

    upiDetails:
      'UPI विवरण',

    upiId:
      'UPI ID',

    upiPlaceholder:
      'yourname@upi',

    upiInfo:
      'भुगतान पूरा करने के लिए आपको आपके UPI एप्लिकेशन पर भेजा जाएगा।',

    netBankingTitle:
      'नेट बैंकिंग',

    selectBank:
      'बैंक चुनें',

    selectYourBank:
      'अपना बैंक चुनें',

    stateBank:
      'भारतीय स्टेट बैंक',

    hdfc:
      'HDFC Bank',

    icici:
      'ICICI Bank',

    axis:
      'Axis Bank',

    kotak:
      'Kotak Mahindra Bank',

    otherBank:
      'अन्य बैंक',

    securePayment:
      'सुरक्षित भुगतान',

    backendPayment:
      'भुगतान प्रक्रिया को बैकएंड से जोड़ा जाएगा।',

    processingPayment:
      'भुगतान प्रोसेस हो रहा है...',

    pay:
      'भुगतान करें',

    selectedPlan:
      'चयनित प्लान',

    advancedProtection:
      'आपके डिवाइस के लिए उन्नत एंडपॉइंट सुरक्षा।',

    total:
      'कुल',

    protectionIncluded:
      'शामिल सुरक्षा सुविधाएँ',

    quarantineContainment:
      'क्वारंटीन और कंटेनमेंट',

    aiSecurityCopilot:
      'AI Security Copilot',


    // =========================================================
    // PUBLIC WEBSITE
    // =========================================================

    features:
      'फीचर्स',

    security:
      'सुरक्षा',

    about:
      'हमारे बारे में',

    signIn:
      'साइन इन',

    builtForSecurity:
      'सुरक्षा के लिए बनाया गया',

    heroTitle1:
      'पहचानें। निर्णय लें।',

    heroTitle2:
      'सुरक्षित रखें।',

    heroDescription:
      'CyberShield-AI एकीकृत एंडपॉइंट सुरक्षा प्रक्रिया प्रदान करने के लिए स्टैटिक विश्लेषण, व्यवहार निगरानी और मशीन लर्निंग को जोड़ता है।',

    pipelineLabel:
      'खतरा सुरक्षा प्रक्रिया',

    pipelineTitle:
      'पहचान से प्रतिक्रिया तक',

    pipelineDescription:
      'सुरक्षा संकेतों का विश्लेषण किया जाता है और उचित सुरक्षा प्रतिक्रिया निर्धारित की जाती है।',

    detect:
      'पहचानें',

    detectDescription:
      'एंडपॉइंट पर संदिग्ध फाइलों, प्रक्रियाओं और व्यवहार संबंधी गतिविधियों की पहचान करें।',

    analyze:
      'विश्लेषण करें',

    analyzeDescription:
      'पहचानी गई गतिविधि का मूल्यांकन करने के लिए स्टैटिक मशीन लर्निंग और व्यवहार विश्लेषण लागू करें।',

    decide:
      'निर्णय लें',

    decideDescription:
      'सुरक्षा संकेतों को मिलाकर उचित खतरा प्रतिक्रिया निर्धारित करें।',

    protect:
      'सुरक्षित रखें',

    protectDescription:
      'सुरक्षा नीति के अनुसार संदिग्ध गतिविधि को ब्लॉक, कंटेन या क्वारंटीन करें।',

    technologyLabel:
      'सुरक्षा तकनीक',

    technologyTitle:
      'विश्लेषण की कई परतें',

    staticAnalysis:
      'स्टैटिक विश्लेषण',

    staticDescription:
      'एक्जीक्यूटेबल फाइलों का विश्लेषण निकाले गए PE फीचर्स और मशीन लर्निंग वर्गीकरण का उपयोग करके किया जा सकता है।',

    behavioralAnalysis:
      'व्यवहार विश्लेषण',

    behavioralDescription:
      'संदिग्ध या रैनसमवेयर से संबंधित व्यवहार पैटर्न की पहचान के लिए एंडपॉइंट गतिविधि की निगरानी की जा सकती है।',

    explainableAnalysis:
      'व्याख्यात्मक विश्लेषण',

    explainableDescription:
      'मॉडल के परिणामों को फीचर महत्व और एक्सप्लेनेबिलिटी जानकारी के साथ समझाया जा सकता है।',

    threatResponse:
      'खतरा प्रतिक्रिया',

    threatResponseDescription:
      'पहचाने गए खतरों को ब्लॉकिंग, कंटेनमेंट और क्वारंटीन सहित सुरक्षा प्रक्रिया के माध्यम से संभाला जा सकता है।',

    protectionPrinciples:
      'सुरक्षा सिद्धांत',

    principlesTitle:
      'जल्दी खतरे की पहचान पर केंद्रित सुरक्षा',

    principlesDescription:
      'CyberShield-AI को फाइल-आधारित विश्लेषण और रियल-टाइम व्यवहार संकेतों को मिलाकर डिजाइन किया गया है, ताकि संदिग्ध गतिविधि का कई सुरक्षा दृष्टिकोणों से मूल्यांकन किया जा सके।',

    multilayerDetection:
      'बहु-स्तरीय पहचान',

    multilayerDescription:
      'स्टैटिक और व्यवहार विश्लेषण एक साथ काम करते हैं।',

    threatScoring:
      'खतरा स्कोरिंग',

    threatScoringDescription:
      'पहचान परिणामों को उपयोगी जोखिम जानकारी में बदला जा सकता है।',

    controlledResponse:
      'नियंत्रित प्रतिक्रिया',

    controlledResponseDescription:
      'सुरक्षा कार्रवाई संदिग्ध गतिविधि और फाइलों को अलग कर सकती है।',

    ctaTitle:
      'CyberShield-AI को एक्सप्लोर करें',

    ctaDescription:
      'प्लेटफॉर्म और इसकी सुरक्षा क्षमताओं को एक्सप्लोर करना शुरू करें।',

    footerDescription:
      'AI-संचालित रैनसमवेयर और मैलवेयर पहचान।'
  }
}


// =============================================================
// PROVIDER
// =============================================================

export function LanguageProvider({ children }) {

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('cybershield_language') || 'English'
  })


  useEffect(() => {

    localStorage.setItem(
      'cybershield_language',
      language
    )

  }, [language])


  const changeLanguage = (newLanguage) => {

    if (
      newLanguage === 'English' ||
      newLanguage === 'Hindi'
    ) {

      setLanguage(newLanguage)

    }

  }


  const t = (key) => {

    return (
      translations[language]?.[key] ||
      translations.English?.[key] ||
      key
    )

  }


  return (

    <LanguageContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        t
      }}
    >

      {children}

    </LanguageContext.Provider>

  )
}


// =============================================================
// HOOK
// =============================================================

export function useLanguage() {

  const context = useContext(LanguageContext)

  if (!context) {

    throw new Error(
      'useLanguage must be used inside LanguageProvider'
    )

  }

  return context
}