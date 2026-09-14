import { useEffect, useState } from "react";
import "./App.css";

const documentSections = [
  {
    title: "Case Documents",
    icon: "▣",
    folderType: "CASE",
    description: "Core documents and records created or received during the case."
  },
  {
    title: "Persons and Statements",
    icon: "♙",
    folderType: "PERSONS",
    description: "Persons connected to the case, witness details and recorded statements."
  },
  {
    title: "Evidence Documents",
    icon: "◈",
    folderType: "EVIDENCE",
    description: "Documents related to seized, submitted and verified evidence."
  },
  {
    title: "Forensic Documents",
    icon: "⌁",
    folderType: "FORENSIC",
    description: "Forensic reports, examination records and technical findings."
  },
  {
    title: "Legal and Court Documents",
    icon: "§",
    folderType: "LEGAL",
    description: "Legal notices, court records, orders and case proceedings."
  },
  {
    title: "Media and Digital Records",
    icon: "▤",
    folderType: "MEDIA",
    description: "Photos, videos, audio, device records and other digital material."
  }
];

const initialDocumentLibrary = {
  "Case Documents": [
    { id: "cd-001", name: "FIR / Complaint", verified: true, type: "PDF", size: "2.4 MB" },
    { id: "cd-002", name: "Initial Report", verified: true, type: "PDF", size: "1.8 MB" },
    { id: "cd-003", name: "Incident Report", verified: true, type: "PDF", size: "3.2 MB" },
    { id: "cd-004", name: "Initial Statements", verified: true, type: "PDF", size: "2.1 MB" }
  ],
  "Persons and Statements": [
    { id: "ps-001", name: "Witness Documents", verified: true, type: "PDF", size: "1.6 MB" },
    { id: "ps-002", name: "Suspect Documents", verified: true, type: "PDF", size: "2.0 MB" },
    { id: "ps-003", name: "Victim Documents", verified: true, type: "PDF", size: "1.4 MB" },
    { id: "ps-004", name: "Officer Reports", verified: true, type: "PDF", size: "1.2 MB" }
  ],
  "Evidence Documents": [
    { id: "ed-001", name: "Evidence Collection Reports", verified: true, type: "PDF", size: "2.7 MB" },
    { id: "ed-002", name: "Evidence Seizure Documents", verified: true, type: "PDF", size: "2.1 MB" },
    { id: "ed-003", name: "Evidence Photos", verified: true, type: "JPG", size: "5.8 MB" },
    { id: "ed-004", name: "Evidence Inventory", verified: true, type: "PDF", size: "1.1 MB" },
    { id: "ed-005", name: "Evidence Receipts", verified: true, type: "PDF", size: "820 KB" },
    { id: "ed-006", name: "Chain of Custody Documents", verified: true, type: "PDF", size: "1.5 MB" },
    { id: "ed-007", name: "Evidence of Transfer Records", verified: true, type: "PDF", size: "1.0 MB" }
  ],
  "Forensic Documents": [
    { id: "fd-001", name: "Forensic Examination Reports", verified: true, type: "PDF", size: "4.3 MB" },
    { id: "fd-002", name: "Laboratory Reports", verified: true, type: "PDF", size: "2.8 MB" },
    { id: "fd-003", name: "Digital Forensic Reports", verified: true, type: "PDF", size: "3.9 MB" },
    { id: "fd-004", name: "Cyber Forensic Reports", verified: true, type: "PDF", size: "2.5 MB" },
    { id: "fd-005", name: "Fingerprint Reports", verified: true, type: "PDF", size: "1.7 MB" },
    { id: "fd-006", name: "DNA Reports", verified: true, type: "PDF", size: "3.1 MB" },
    { id: "fd-007", name: "Technical Analysis Reports", verified: true, type: "PDF", size: "2.2 MB" },
    { id: "fd-008", name: "Expert Opinions Report", verified: true, type: "PDF", size: "1.9 MB" }
  ],
  "Legal and Court Documents": [
    { id: "lc-001", name: "Warrants", verified: true, type: "PDF", size: "780 KB" },
    { id: "lc-002", name: "Court Orders", verified: true, type: "PDF", size: "1.1 MB" },
    { id: "lc-003", name: "Notices", verified: true, type: "PDF", size: "640 KB" },
    { id: "lc-004", name: "Summons", verified: true, type: "PDF", size: "720 KB" },
    { id: "lc-005", name: "Legal Requests", verified: true, type: "PDF", size: "890 KB" },
    { id: "lc-006", name: "Authorization Documents", verified: true, type: "PDF", size: "1.3 MB" },
    { id: "lc-007", name: "Court Submission", verified: true, type: "PDF", size: "2.0 MB" },
    { id: "lc-008", name: "Judgment Orders Report", verified: true, type: "PDF", size: "1.6 MB" }
  ],
  "Media and Digital Records": [
    { id: "md-001", name: "CCTV Recordings", verified: true, type: "MP4", size: "84 MB" },
    { id: "md-002", name: "Photographs", verified: true, type: "JPG", size: "6.4 MB" },
    { id: "md-003", name: "Videos", verified: true, type: "MP4", size: "42 MB" },
    { id: "md-004", name: "Audio Recordings", verified: true, type: "MP3", size: "11 MB" },
    { id: "md-005", name: "Screenshots", verified: true, type: "PNG", size: "3.1 MB" },
    { id: "md-006", name: "Digital Files", verified: true, type: "ZIP", size: "18 MB" },
    { id: "md-007", name: "Device Exports", verified: true, type: "ZIP", size: "24 MB" }
  ]
};

const initialAuditEntries = [
  {
    id: "audit-001",
    action: "CaseVault access granted",
    detail: "Authorized session established",
    documentName: "System",
    section: "Security",
    user: "Authorized Officer",
    time: new Date().toLocaleString()
  }
];

const organizationLabelMap = {
  police: "Police Department",
  cbi: "Central Bureau of Investigation",
  advocate: "Legal / Advocate Department",
  court: "Court / Judiciary",
  other: "Other Authorized Department"
};

const organizationRoleMap = {
  police: [
    "Constable",
    "Head Constable",
    "Assistant Sub-Inspector (ASI)",
    "Sub-Inspector (SI)",
    "Inspector",
    "Assistant Commissioner of Police (ACP)",
    "Deputy Superintendent of Police (DySP/DSP)",
    "Assistant Superintendent of Police (ASP)",
    "Additional Superintendent of Police (Addl. SP)",
    "Superintendent of Police (SP)",
    "Deputy Commissioner of Police (DCP)",
    "Additional Commissioner of Police",
    "Commissioner of Police"
  ],
  cbi: [
    "Sub-Inspector",
    "Inspector",
    "Deputy Superintendent of Police (DSP)",
    "Additional Superintendent of Police",
    "Superintendent of Police",
    "Senior Superintendent of Police",
    "Deputy Inspector General (DIG)",
    "Additional Director",
    "Joint Director",
    "Special Director",
    "Director"
  ],
  advocate: [
    "Legal Associate",
    "Junior Advocate",
    "Advocate",
    "Senior Advocate",
    "Public Prosecutor",
    "Assistant Public Prosecutor",
    "Legal Counsel",
    "Government Counsel",
    "Investigating Counsel"
  ],
  court: [
    "Court Clerk",
    "Court Officer",
    "Magistrate",
    "Civil Judge",
    "Senior Civil Judge",
    "District Judge",
    "Sessions Judge",
    "Public Prosecutor",
    "Registrar"
  ],
  other: [
    "Authorized Officer",
    "Case Administrator",
    "Compliance Officer",
    "Legal Officer",
    "Technical Officer",
    "Forensic Officer",
    "Department Head",
    "Other Authorized Role"
  ]
};

const defaultCases = [
  {
    id: "CASE-98432-X7B2",
    name: "Digital Fraud Investigation",
    description: "Digital evidence and investigation documents related to the case.",
    status: "Active",
    date: "12 Sep 2026",
    registeredDate: "12 Sep 2026",
    investigator: "R. Sharma",
    summary: "Investigation into suspected digital fraud involving verified electronic records.",
    passcode: "9843",
    shareLink: "casevault://join?case=CASE-98432-X7B2&passcode=9843"
  },
  {
    id: "CASE-23489-X8C3",
    name: "Cyber Crime Investigation",
    description: "Financial records, statements and digital evidence.",
    status: "Pending",
    date: "08 Sep 2026",
    registeredDate: "08 Sep 2026",
    investigator: "S. Rao",
    summary: "Cyber crime records, financial statements and digital evidence under review.",
    passcode: "2348",
    shareLink: "casevault://join?case=CASE-23489-X8C3&passcode=2348"
  },
  {
    id: "CASE-71245-M4A1",
    name: "Missing Person Case",
    description: "Investigation records and verified case documents.",
    status: "Completed",
    date: "02 Sep 2026",
    registeredDate: "02 Sep 2026",
    investigator: "A. Kumar",
    summary: "Verified investigation records for a missing-person case.",
    passcode: "7124",
    shareLink: "casevault://join?case=CASE-71245-M4A1&passcode=7124"
  },
  {
    id: "CASE-58126-P6D4",
    name: "Property Dispute Investigation",
    description: "Legal records, statements and supporting documents.",
    status: "Active",
    date: "28 Aug 2026",
    registeredDate: "28 Aug 2026",
    investigator: "N. Iyer",
    summary: "Legal records, statements and supporting documents under investigation.",
    passcode: "5812",
    shareLink: "casevault://join?case=CASE-58126-P6D4&passcode=5812"
  },
  {
    id: "CASE-40317-R2K9",
    name: "Identity Theft Investigation",
    description: "Identity records and digital evidence submitted for review.",
    status: "Pending",
    date: "24 Aug 2026",
    registeredDate: "24 Aug 2026",
    investigator: "P. Das",
    summary: "Identity records and supporting digital evidence submitted for review.",
    passcode: "4031",
    shareLink: "casevault://join?case=CASE-40317-R2K9&passcode=4031"
  }
];

const initialNotifications = [
  {
    id: "n1",
    title: "Secure login policy",
    message: "Your protected CaseVault workspace is ready for authorized use.",
    time: "Just now",
    unread: true
  },
  {
    id: "n2",
    title: "Integrity monitoring",
    message: "Document actions are recorded in the audit trail.",
    time: "Today",
    unread: true
  },
  {
    id: "n3",
    title: "Case updates",
    message: "Your assigned cases will appear in My Cases.",
    time: "Today",
    unread: false
  }
];


function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showFinalPage, setShowFinalPage] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [fingerprintVerified, setFingerprintVerified] =
    useState(false);
  const [faceVerified, setFaceVerified] =
    useState(false);
  const [biometricMode, setBiometricMode] =
    useState("registration");
  const [termsAccepted, setTermsAccepted] =
    useState(false);
  const [showTermsPopup, setShowTermsPopup] =
    useState(false);
  const [registrationData, setRegistrationData] = useState({
    fullName: "",
    aadhaar: "",
    password: "",
    confirmPassword: "",
    organization: "",
    role: "",
    officerId: "",
    mobile: "",
  });
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] =
    useState("Dashboard");
  const [activeBottom, setActiveBottom] =
    useState("Home");
  const [openCaseMenu, setOpenCaseMenu] =
    useState(null);
  const [selectedCase, setSelectedCase] =
    useState(null);
  const [selectedDocumentSection, setSelectedDocumentSection] =
    useState(null);
  const [openedDocument, setOpenedDocument] =
    useState(null);
  const [documentContextMenu, setDocumentContextMenu] =
    useState(null);
  const [documentLibrary, setDocumentLibrary] =
    useState(initialDocumentLibrary);
  const [auditEntries, setAuditEntries] =
    useState(initialAuditEntries);
  const [documentSearch, setDocumentSearch] =
    useState("");
  const [showCaseAudit, setShowCaseAudit] =
    useState(false);
  const [uploadTargetSection, setUploadTargetSection] =
    useState(null);
  const [starredDocuments, setStarredDocuments] =
    useState([]);
  const [loginOfficerId, setLoginOfficerId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [hasAccount, setHasAccount] = useState(false);
  const [dashboardPage, setDashboardPage] = useState("documents");
  const [starredCases, setStarredCases] = useState([]);
  const [recentDownloads, setRecentDownloads] = useState([]);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [chats, setChats] = useState([]);
  const [chatDraft, setChatDraft] = useState("");
  const [aiMessages, setAiMessages] = useState([
    {
      id: "ai-welcome",
      from: "ai",
      text: "Hello. I am the CaseVault AI Overview assistant. I can help you review case structure, identify similar case themes, suggest relevant document categories, and explain the audit trail."
    }
  ]);
  const [aiDraft, setAiDraft] = useState("");
  const [caseForm, setCaseForm] = useState({
    id: "",
    name: "",
    description: "",
    registeredDate: "",
    investigator: "",
    summary: "",
    passcode: "",
    confirmPasscode: ""
  });
  const [createdCaseLink, setCreatedCaseLink] = useState("");
  const [joinCaseForm, setJoinCaseForm] = useState({
    caseId: "",
    passcode: "",
    link: ""
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [collaborationJoinPasscode, setCollaborationJoinPasscode] = useState("");
  const [collaborationForm, setCollaborationForm] = useState({
    name: "",
    passcode: ""
  });
  const [sharedWorkspaces, setSharedWorkspaces] = useState([]);
  const [cases, setCases] = useState(() => {
    try {
      const saved = localStorage.getItem("casevaultCases");
      return saved ? JSON.parse(saved) : defaultCases;
    } catch {
      return defaultCases;
    }
  });


  const addAuditEntry = (
    action,
    detail,
    documentName = "System",
    section = "Security"
  ) => {
    const auditEntry = {
      id: `audit-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,
      action,
      detail,
      documentName,
      section,
      user: registrationData.fullName || "Authorized Officer",
      time: new Date().toLocaleString()
    };
    setAuditEntries((current) => [
      auditEntry,
      ...current
    ]);
    setNotifications((current) => [
      {
        id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: action,
        message: detail,
        time: "Just now",
        unread: true
      },
      ...current
    ].slice(0, 20));
  };

  const currentUser =
    registrationData.fullName || "Authorized Officer";

  const getFileIcon = (type) => {
    const normalized = String(type || "").toUpperCase();
    if (["JPG", "JPEG", "PNG", "GIF", "WEBP"].includes(normalized)) {
      return "▧";
    }
    if (["MP4", "MOV", "AVI", "MKV"].includes(normalized)) {
      return "▶";
    }
    if (["MP3", "WAV", "M4A"].includes(normalized)) {
      return "♫";
    }
    if (["ZIP", "RAR", "7Z"].includes(normalized)) {
      return "▱";
    }
    return "▤";
  };

  const openDocumentSection = (sectionTitle) => {
    setSelectedDocumentSection(sectionTitle);
    setOpenedDocument(null);
    setDocumentContextMenu(null);
    setDocumentSearch("");
    setShowCaseAudit(false);
    addAuditEntry(
      "Opened document folder",
      `Opened ${sectionTitle}`,
      sectionTitle,
      sectionTitle
    );
  };

  const openDocument = (document) => {
    setOpenedDocument(document);
    setDocumentContextMenu(null);
    addAuditEntry(
      "Opened document",
      `Document opened in secure read-only viewer`,
      document.name,
      selectedDocumentSection || "Documents"
    );
  };

  const openDocumentContextMenu = (event, document) => {
    event.preventDefault();
    event.stopPropagation();
    const menuWidth = 194;
    const menuHeight = 315;
    const x = Math.max(
      10,
      Math.min(
        event.clientX || 18,
        window.innerWidth - menuWidth - 10
      )
    );
    const y = Math.max(
      10,
      Math.min(
        event.clientY || 180,
        window.innerHeight - menuHeight - 10
      )
    );
    setDocumentContextMenu({
      document,
      x,
      y
    });
  };

  const copyDocumentName = async (document) => {
    try {
      await navigator.clipboard.writeText(document.name);
      alert("Document name copied.");
      addAuditEntry(
        "Copied document name",
        "Document name copied to clipboard",
        document.name,
        selectedDocumentSection || "Documents"
      );
    } catch (error) {
      alert("Clipboard access is not available in this browser.");
    }
    setDocumentContextMenu(null);
  };

  const toggleStarDocument = (document) => {
    setStarredDocuments((current) =>
      current.includes(document.id)
        ? current.filter((id) => id !== document.id)
        : [...current, document.id]
    );
    const isStarred = starredDocuments.includes(document.id);
    addAuditEntry(
      isStarred ? "Removed from Starred" : "Added to Starred",
      isStarred
        ? "Document removed from the protected Starred list"
        : "Document added to the protected Starred list",
      document.name,
      selectedDocumentSection || "Documents"
    );
    setDocumentContextMenu(null);
  };

  const verifyDocumentIntegrity = async (document) => {
    let integrityHash = document.sha256 || "DEMO-INTEGRITY-LOCK";

    if (document.file) {
      try {
        const buffer = await document.file.arrayBuffer();
        const digest = await crypto.subtle.digest(
          "SHA-256",
          buffer
        );
        integrityHash = Array.from(
          new Uint8Array(digest)
        )
          .map((byte) =>
            byte.toString(16).padStart(2, "0")
          )
          .join("");
      } catch (error) {
        integrityHash = "HASH-CALCULATION-UNAVAILABLE";
      }
    }

    setDocumentLibrary((current) => {
      const next = { ...current };
      Object.keys(next).forEach((section) => {
        next[section] = next[section].map((item) =>
          item.id === document.id
            ? {
                ...item,
                verified: true,
                sha256: integrityHash,
                lastVerified: new Date().toLocaleString()
              }
            : item
        );
      });
      return next;
    });

    setOpenedDocument((current) =>
      current && current.id === document.id
        ? {
            ...current,
            verified: true,
            sha256: integrityHash,
            lastVerified: new Date().toLocaleString()
          }
        : current
    );

    addAuditEntry(
      "Integrity verification",
      "SHA-256 integrity verification completed",
      document.name,
      selectedDocumentSection || "Documents"
    );
    alert("Document integrity verified successfully.");
    setDocumentContextMenu(null);
  };

  const downloadDocument = (document) => {
    if (!document.url) {
      addAuditEntry(
        "Download requested",
        "Demo record does not have a physical file attached yet",
        document.name,
        selectedDocumentSection || "Documents"
      );
      alert(
        "This prototype record has no physical file attached yet. Upload a real file in this folder to enable the download."
      );
      setDocumentContextMenu(null);
      return;
    }

    const link = document.createDownloadUrl
      ? document.createDownloadUrl()
      : document.url;
    setRecentDownloads((current) => [
      {
        id: `download-${Date.now()}`,
        name: document.name,
        type: document.type,
        size: document.size,
        section: selectedDocumentSection || "Documents",
        caseId: selectedCase?.id || "Protected Case",
        time: new Date().toLocaleString()
      },
      ...current
    ].slice(0, 20));
    const anchor = window.document.createElement("a");
    anchor.href = link;
    anchor.download = document.name;
    window.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    addAuditEntry(
      "Downloaded document",
      "Protected document downloaded to the local device",
      document.name,
      selectedDocumentSection || "Documents"
    );
    setDocumentContextMenu(null);
  };

  const uploadDocuments = async (event) => {
    const files = Array.from(event.target.files || []);
    const target =
      uploadTargetSection || selectedDocumentSection;

    if (!target || files.length === 0) {
      event.target.value = "";
      return;
    }

    const uploaded = await Promise.all(
      files.map(async (file, index) => {
        let hash = "";
        try {
          const buffer = await file.arrayBuffer();
          const digest = await crypto.subtle.digest(
            "SHA-256",
            buffer
          );
          hash = Array.from(
            new Uint8Array(digest)
          )
            .map((byte) =>
              byte.toString(16).padStart(2, "0")
            )
            .join("");
        } catch (error) {
          hash = "";
        }

        const extension =
          file.name.includes(".")
            ? file.name.split(".").pop().toUpperCase()
            : "FILE";

        return {
          id: `upload-${Date.now()}-${index}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
          name: file.name,
          verified: false,
          type: extension,
          size:
            file.size >= 1024 * 1024
              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
              : `${Math.max(
                  1,
                  Math.round(file.size / 1024)
                )} KB`,
          file,
          url: URL.createObjectURL(file),
          sha256: hash,
          uploadedAt: new Date().toLocaleString()
        };
      })
    );

    setDocumentLibrary((current) => ({
      ...current,
      [target]: [
        ...(current[target] || []),
        ...uploaded
      ]
    }));

    uploaded.forEach((file) => {
      addAuditEntry(
        "Uploaded document",
        "New file added to the protected case document store",
        file.name,
        target
      );
    });

    alert(
      `${uploaded.length} document${
        uploaded.length === 1 ? "" : "s"
      } uploaded successfully.`
    );

    setUploadTargetSection(null);
    event.target.value = "";
  };

  const triggerDocumentUpload = (sectionTitle) => {
    setUploadTargetSection(sectionTitle);
    window.document
      .getElementById("casevault-upload-input")
      ?.click();
  };
  const hiddenUploadInput = (
    <input
      id="casevault-upload-input"
      type="file"
      multiple
      hidden
      onChange={uploadDocuments}
    />
  );

  useEffect(() => {
    try {
      const savedAccount = localStorage.getItem("casevaultAccount");
      const savedStars = localStorage.getItem("casevaultStarredCases");
      const savedDownloads = localStorage.getItem("casevaultRecentDownloads");
      const savedNotifications = localStorage.getItem("casevaultNotifications");
      const savedChats = localStorage.getItem("casevaultChats");
      const savedShared = localStorage.getItem("casevaultSharedWorkspaces");

      if (savedAccount) {
        const account = JSON.parse(savedAccount);
        setRegistrationData((current) => ({
          ...current,
          ...account
        }));
        setHasAccount(true);
      }
      if (savedStars) setStarredCases(JSON.parse(savedStars));
      if (savedDownloads) setRecentDownloads(JSON.parse(savedDownloads));
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
      if (savedChats) setChats(JSON.parse(savedChats));
      if (savedShared) setSharedWorkspaces(JSON.parse(savedShared));
    } catch (error) {
      console.warn("CaseVault local storage could not be loaded.", error);
    }

    const timer = setTimeout(() => {
      // Login is always the default page after the splash screen.
      // New users can choose "Create New Account" from the login page.
      setShowRegister(false);
      setShowOtp(false);
      setShowBiometric(false);
      setShowTerms(false);
      setShowFinalPage(false);
      setShowDashboard(false);
      setShowLogin(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("casevaultCases", JSON.stringify(cases));
      localStorage.setItem("casevaultStarredCases", JSON.stringify(starredCases));
      localStorage.setItem("casevaultRecentDownloads", JSON.stringify(recentDownloads));
      localStorage.setItem("casevaultNotifications", JSON.stringify(notifications));
      localStorage.setItem("casevaultChats", JSON.stringify(chats));
      localStorage.setItem("casevaultSharedWorkspaces", JSON.stringify(sharedWorkspaces));
    } catch (error) {
      console.warn("CaseVault local storage update failed.", error);
    }
  }, [cases, starredCases, recentDownloads, notifications, chats, sharedWorkspaces]);
  if (!showLogin && !showRegister && !showOtp && !showBiometric && !showTerms && !showFinalPage) {
    return (
      <main className="splash-screen">
        <div className="splash-grid" />
        <section className="logo-container">
          <div className="logo-orbit">
            <div className="orbit-dot" />
            <img
              src="/logo.png"
              alt="CaseVault secure evidence logo"
              className="security-logo"
            />
          </div>
          <h1>CASEVAULT</h1>
          <p>
            Digital Document Management System
          </p>
          <div className="loading-line">
            <div className="loading-progress" />
          </div>
          <span className="system-status">
            Initializing secure system...
          </span>
        </section>
      </main>
    );
  }
  if (showFinalPage) {
    return (
      <main className="login-page">
        <div className="login-background" />
        <section className="login-card final-card">
          <div className="login-logo">
            <img
              src="/logo.png"
              alt="CaseVault secure evidence logo"
            />
          </div>
          <div className="success-icon">
            ✓
          </div>
          <p className="eyebrow">
            ACCESS APPROVED
          </p>
          <h1>
            Welcome to CaseVault
          </h1>
          <p className="login-subtitle">
            Your identity has been successfully verified
            and the Terms & Conditions have been accepted.
          </p>
          <div className="final-status-box">
            <div>
              <span>✓</span>
              OTP Verification
            </div>
            <div>
              <span>✓</span>
              Fingerprint Authentication
            </div>
            <div>
              <span>✓</span>
              Face ID Authentication
            </div>
            <div>
              <span>✓</span>
              Terms & Conditions Accepted
            </div>
          </div>
          <button
            type="button"
            className="login-btn"
            onClick={() => {
              setShowFinalPage(false);
              setDashboardPage("documents");
              setActiveBottom("Documents");
              setActiveMenu("Dashboard");
              setShowDashboard(true);
            }}
          >
            Continue to CaseVault
          </button>
          <p className="authorized">
            🔒 Secure access granted
          </p>
        </section>
      </main>
    );
  }
  if (showTerms) {
    const handleTermsNext = () => {
      if (!termsAccepted) {
        setShowTermsPopup(true);
        return;
      }
      setShowTerms(false);
      setDashboardPage("documents");
      setActiveBottom("Documents");
      setActiveMenu("Dashboard");
      setShowDashboard(true);
    };
    return (
      <main className="login-page terms-page">
        <div className="login-background" />
        <section className="login-card terms-card">
          <div className="login-logo">
            <img
              src="/logo.png"
              alt="CaseVault secure evidence logo"
            />
          </div>
          <p className="eyebrow">
            CASEVAULT SECURITY POLICY
          </p>
          <h1>
            Terms & Conditions
          </h1>
          <p className="login-subtitle">
            Please read and accept the following terms
            before accessing the CaseVault system.
          </p>
          <div className="terms-content">
            <div className="term-item">
              <strong>
                1. Authorized Access
              </strong>
              <p>
                CaseVault is intended only for authorized
                personnel. You must use the system only
                within the scope of your official role
                and assigned responsibilities.
              </p>
            </div>
            <div className="term-item">
              <strong>
                2. Confidential Information
              </strong>
              <p>
                Case files, evidence, documents, reports
                and other information available through
                CaseVault must be treated as confidential.
              </p>
            </div>
            <div className="term-item">
              <strong>
                3. Account Security
              </strong>
              <p>
                You are responsible for protecting your
                Officer ID, password and authentication
                credentials. Do not share your account
                credentials with another person.
              </p>
            </div>
            <div className="term-item">
              <strong>
                4. Evidence Protection
              </strong>
              <p>
                Evidence and case documents must not be
                copied, modified, deleted, downloaded or
                shared unless you have the required
                authorization.
              </p>
            </div>
            <div className="term-item">
              <strong>
                5. Case-Based Access
              </strong>
              <p>
                Access to case information is limited
                according to your assigned authority and
                role. Attempting to access unauthorized
                cases is prohibited.
              </p>
            </div>
            <div className="term-item">
              <strong>
                6. Activity Monitoring
              </strong>
              <p>
                System activity may be recorded for
                security, auditing and investigation
                purposes. Unauthorized activity may be
                reviewed by the responsible authority.
              </p>
            </div>
            <div className="term-item">
              <strong>
                7. Responsible Use
              </strong>
              <p>
                CaseVault must be used only for legitimate
                official purposes. Any misuse of the
                system may result in access restrictions
                or appropriate action by the authorized
                organization.
              </p>
            </div>
            <div className="term-item">
              <strong>
                8. Security Compliance
              </strong>
              <p>
                By using CaseVault, you agree to follow
                applicable organizational security
                procedures and protect all information
                accessed through the platform.
              </p>
            </div>
          </div>
          <label className="terms-checkbox">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(event) =>
                setTermsAccepted(
                  event.target.checked
                )
              }
            />
            <span>
              I have read and agree to the CaseVault
              Terms & Conditions and Security Policy.
            </span>
          </label>
          <button
            type="button"
            className="login-btn terms-next-btn"
            onClick={handleTermsNext}
          >
            Next
          </button>
          <p className="authorized">
            🔒 Authorized personnel only
          </p>
          {showTermsPopup && (
            <div className="terms-popup-overlay">
              <div className="terms-popup">
                <div className="popup-icon">
                  !
                </div>
                <h2>
                  Approval Required
                </h2>
                <p>
                  Please read and accept the Terms &
                  Conditions before continuing to
                  CaseVault.
                </p>
                <button
                  type="button"
                  className="login-btn popup-btn"
                  onClick={() =>
                    setShowTermsPopup(false)
                  }
                >
                  I Understand
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    );
  }

  const navigateDashboard = (page, bottom = null) => {
    setDashboardPage(page);
    if (bottom) {
      setActiveBottom(bottom);
    }
    setMenuOpen(false);
    setProfileOpen(false);
    setSelectedCase(null);
    setSelectedDocumentSection(null);
    setOpenedDocument(null);
    setShowCaseAudit(false);
    setDocumentContextMenu(null);
    setOpenCaseMenu(null);
  };

  const toggleStarCase = (caseItem) => {
    setStarredCases((current) =>
      current.includes(caseItem.id)
        ? current.filter((id) => id !== caseItem.id)
        : [...current, caseItem.id]
    );
    addAuditEntry(
      starredCases.includes(caseItem.id) ? "Case removed from Starred" : "Case added to Starred",
      starredCases.includes(caseItem.id)
        ? "Case removed from the protected Starred list"
        : "Case added to the protected Starred list",
      caseItem.id,
      "Cases"
    );
  };

  const persistAccount = (data) => {
    try {
      localStorage.setItem("casevaultAccount", JSON.stringify(data));
      setHasAccount(true);
    } catch (error) {
      console.warn("Unable to persist CaseVault account.", error);
    }
  };

  const openProfile = () => {
    setProfileOpen(true);
    setMenuOpen(false);
    setActiveBottom("");
  };

  const sendAiMessage = (text = aiDraft) => {
    const message = text.trim();
    if (!message) return;

    const lower = message.toLowerCase();
    let response = "I can help you review the current case structure, documents, evidence categories, legal records and audit activity.";
    if (lower.includes("similar") || lower.includes("same") || lower.includes("related")) {
      response = `Based on the current workspace, the closest themes are: ${cases.slice(0, 3).map((item) => item.name).join(", ")}. Similarity here is a prototype metadata comparison, not a legal or investigative conclusion.`;
    } else if (lower.includes("evidence")) {
      response = "For an evidence-focused review, start with Evidence Documents, then inspect Chain of Custody Documents, Evidence Inventory, Evidence Receipts and Evidence of Transfer Records.";
    } else if (lower.includes("forensic")) {
      response = "Forensic review can be organized through Forensic Examination Reports, Laboratory Reports, Digital Forensic Reports, Cyber Forensic Reports, Fingerprint Reports, DNA Reports, Technical Analysis Reports and Expert Opinions Report.";
    } else if (lower.includes("audit") || lower.includes("security")) {
      response = "The Audit Trail records document and case activity with the user, time, folder and activity metadata. Use the audit icon in a case to review the complete log.";
    } else if (lower.includes("legal") || lower.includes("court")) {
      response = "For court-related work, review Warrants, Court Orders, Notices, Summons, Legal Requests, Authorization Documents, Court Submission and Judgment Orders Report.";
    } else if (lower.includes("case")) {
      response = `You currently have ${cases.length} case${cases.length === 1 ? "" : "s"} in My Cases. I can help you navigate case documents, evidence, forensic records, legal records or collaboration.`;
    }

    setAiMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, from: "user", text: message },
      { id: `ai-${Date.now()}-reply`, from: "ai", text: response }
    ]);
    setAiDraft("");
  };

  const createChat = () => {
    const name = chatDraft.trim();
    if (!name) {
      alert("Enter a chat name or participant name.");
      return;
    }
    const chat = {
      id: `chat-${Date.now()}`,
      name,
      lastMessage: "Secure chat created",
      time: "Just now"
    };
    setChats((current) => [chat, ...current]);
    setChatDraft("");
    setNotifications((current) => [
      {
        id: `notification-chat-${Date.now()}`,
        title: "Secure chat created",
        message: `Chat with ${name} is ready in the protected workspace.`,
        time: "Just now",
        unread: true
      },
      ...current
    ]);
  };

  const createCase = () => {
    if (!caseForm.id.trim() || !caseForm.name.trim() || !caseForm.description.trim() || !caseForm.registeredDate || !caseForm.investigator.trim() || !caseForm.summary.trim() || !caseForm.passcode || !caseForm.confirmPasscode) {
      alert("Please complete all case details.");
      return;
    }
    if (caseForm.passcode !== caseForm.confirmPasscode) {
      alert("Passcodes do not match.");
      return;
    }
    const caseId = caseForm.id.trim().toUpperCase();
    if (cases.some((item) => item.id === caseId)) {
      alert("A case with this Case ID already exists.");
      return;
    }
    const newCase = {
      id: caseId,
      name: caseForm.name.trim(),
      description: caseForm.description.trim(),
      status: "Active",
      date: caseForm.registeredDate,
      registeredDate: caseForm.registeredDate,
      investigator: caseForm.investigator.trim(),
      summary: caseForm.summary.trim(),
      passcode: caseForm.passcode,
      shareLink: `casevault://join?case=${encodeURIComponent(caseId)}&passcode=${encodeURIComponent(caseForm.passcode)}`
    };
    setCases((current) => [newCase, ...current]);
    setCreatedCaseLink(newCase.shareLink);
    setCaseForm({ id: "", name: "", description: "", registeredDate: "", investigator: "", summary: "", passcode: "", confirmPasscode: "" });
    addAuditEntry("Created case", "New case created in the protected CaseVault workspace", newCase.id, "Cases");
    alert("Case created successfully.");
  };

  const copyCaseLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      alert("App-only case link copied.");
    } catch (error) {
      alert("Clipboard access is not available in this browser.");
    }
  };

  const parseCaseLink = (link) => {
    try {
      const url = new URL(link);
      const caseId = url.searchParams.get("case") || "";
      const passcode = url.searchParams.get("passcode") || "";
      return { caseId, passcode };
    } catch (error) {
      const match = link.match(/case=([^&]+).*passcode=([^&]+)/i);
      if (!match) return { caseId: "", passcode: "" };
      return { caseId: decodeURIComponent(match[1]), passcode: decodeURIComponent(match[2]) };
    }
  };

  const joinExistingCase = () => {
    let caseId = joinCaseForm.caseId.trim().toUpperCase();
    let passcode = joinCaseForm.passcode.trim();

    if (joinCaseForm.link.trim()) {
      const parsed = parseCaseLink(joinCaseForm.link.trim());
      caseId = parsed.caseId.toUpperCase();
      passcode = parsed.passcode;
    }

    if (!caseId || !passcode) {
      alert("Enter a Case ID and passcode, or paste an app-only case link.");
      return;
    }

    const existing = cases.find((item) => item.id === caseId);
    if (!existing) {
      alert("This app-only link does not belong to a case available in this workspace.");
      return;
    }
    if (existing.passcode !== passcode) {
      alert("Incorrect case passcode.");
      return;
    }

    setJoinCaseForm({ caseId: "", passcode: "", link: "" });
    setActiveBottom("Documents");
    setDashboardPage("documents");
    addAuditEntry("Joined case", "Authorized case join completed using the protected passcode", existing.id, "Cases");
    alert(`You joined ${existing.id} successfully.`);
  };

  const joinCollaboration = () => {
    const passcode = collaborationJoinPasscode.trim();
    if (!passcode) {
      alert("Enter the collaboration passcode.");
      return;
    }
    const workspace = sharedWorkspaces.find((item) => item.passcode === passcode);
    if (!workspace) {
      alert("Collaboration passcode is incorrect for this workspace.");
      return;
    }
    setCollaborationJoinPasscode("");
    alert(`Joined ${workspace.name} successfully.`);
    addAuditEntry("Joined collaboration workspace", "Authorized collaboration access completed", workspace.name, "Shared");
  };

  const createCollaboration = () => {
    if (!collaborationForm.name.trim() || !collaborationForm.passcode.trim()) {
      alert("Enter a collaboration name and passcode.");
      return;
    }
    const workspace = {
      id: `workspace-${Date.now()}`,
      name: collaborationForm.name.trim(),
      passcode: collaborationForm.passcode.trim(),
      members: 1,
      status: "Private",
      createdBy: currentUser,
      createdAt: new Date().toLocaleString()
    };
    setSharedWorkspaces((current) => [workspace, ...current]);
    setCollaborationForm({ name: "", passcode: "" });
    setShowCollaborationModal(false);
    addAuditEntry("Created collaboration workspace", "Private collaboration workspace created", workspace.name, "Shared");
    alert("Collaboration workspace created.");
  };

  if (showDashboard) {
    const handleCaseMenu = (caseId) => {
      setOpenCaseMenu(openCaseMenu === caseId ? null : caseId);
    };

    const selectMenuItem = (item) => {
      const map = {
        Dashboard: ["documents", "Documents"],
        "Recent Downloads": ["recent", "Documents"],
        Backup: ["backup", "Documents"],
        Bin: ["bin", "Documents"],
        Storage: ["storage", "Documents"],
        "Audit Trail": ["audit", "Documents"]
      };
      const [page, bottom] = map[item] || ["documents", "Documents"];
      setActiveMenu(item);
      navigateDashboard(page, bottom);
    };

    const renderBottomNavigation = () => (
      <nav className="mobile-bottom-navigation">
        <button
          type="button"
          className={activeBottom === "Home" ? "mobile-bottom-active" : ""}
          onClick={() => navigateDashboard("home", "Home")}
        >
          <span>⌂</span>
          <small>Home</small>
        </button>
        <button
          type="button"
          className={activeBottom === "Starred" ? "mobile-bottom-active" : ""}
          onClick={() => navigateDashboard("starred", "Starred")}
        >
          <span>☆</span>
          <small>Starred</small>
        </button>
        <button
          type="button"
          className={activeBottom === "Shared" ? "mobile-bottom-active" : ""}
          onClick={() => navigateDashboard("shared", "Shared")}
        >
          <span>♧</span>
          <small>Shared</small>
        </button>
        <button
          type="button"
          className={activeBottom === "Documents" ? "mobile-bottom-active" : ""}
          onClick={() => navigateDashboard("documents", "Documents")}
        >
          <span>▣</span>
          <small>Documents</small>
        </button>
      </nav>
    );

    const renderDashboardHeader = (title = "Documents") => (
      <header className="mobile-dashboard-header">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation"
        >
          <span />
          <span />
          <span />
        </button>
        <div className="mobile-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder={`Search ${title}`}
            onChange={(event) => setDocumentSearch(event.target.value)}
            value={documentSearch}
          />
        </div>
        <button
          type="button"
          className="mobile-profile"
          onClick={openProfile}
          aria-label="Open profile"
        >
          {currentUser.charAt(0).toUpperCase()}
        </button>
      </header>
    );

    const renderSideMenu = () => (
      <>
        {menuOpen && <div className="dashboard-menu-overlay" onClick={() => setMenuOpen(false)} />}
        <aside className={`dashboard-side-menu ${menuOpen ? "open" : ""}`}>
          <div className="side-menu-header">
            <div className="side-menu-logo">
              <img src="/logo.png" alt="CaseVault" />
            </div>
            <div>
              <strong>CASEVAULT</strong>
              <span>Secure Document System</span>
            </div>
          </div>
          {[
            ["Dashboard", "⌂"],
            ["Recent Downloads", "↓"],
            ["Backup", "☁"],
            ["Bin", "▱"],
            ["Storage", "▦"]
          ].map(([label, icon]) => (
            <button
              key={label}
              type="button"
              className={`side-menu-item ${activeMenu === label ? "side-menu-active" : ""}`}
              onClick={() => selectMenuItem(label)}
            >
              <span>{icon}</span>
              <strong>{label}</strong>
            </button>
          ))}
          <div className="audit-menu-gap" />
          <button
            type="button"
            className={`side-menu-item ${activeMenu === "Audit Trail" ? "side-menu-active" : ""}`}
            onClick={() => selectMenuItem("Audit Trail")}
          >
            <span>◈</span>
            <strong>Audit Trail</strong>
          </button>
          <button
            type="button"
            className="side-menu-item"
            onClick={openProfile}
          >
            <span>◉</span>
            <strong>Profile</strong>
          </button>
        </aside>
      </>
    );

    const searchTerm = documentSearch.trim().toLowerCase();
    const filteredCases = cases.filter((caseItem) => {
      if (!searchTerm) return true;
      return `${caseItem.id} ${caseItem.name} ${caseItem.description} ${caseItem.investigator}`.toLowerCase().includes(searchTerm);
    });

    const renderCaseCards = (caseList = filteredCases, compact = false) => (
      <div className={`mobile-cases-list ${compact ? "compact-case-list" : ""}`}>
        {caseList.length === 0 && (
          <div className="document-empty-state">
            <div>⌕</div>
            <strong>No cases found</strong>
            <p>Try another search or add a new protected case.</p>
          </div>
        )}
        {caseList.map((caseItem) => (
          <article
            className="mobile-case-card enhanced-case-card"
            key={caseItem.id}
            onClick={() => {
              setOpenCaseMenu(null);
              setSelectedCase(caseItem);
            }}
          >
            <div className="mobile-case-content">
              <div className="mobile-case-information">
                <div className="mobile-case-id">{caseItem.id}</div>
                <div className="mobile-case-name">{caseItem.name}</div>
                <div className="mobile-case-description">{caseItem.description}</div>
                <div className="mobile-case-date">Registered {caseItem.registeredDate || caseItem.date}</div>
              </div>
              <div className="mobile-case-actions">
                <span className={`mobile-status ${String(caseItem.status).toLowerCase()}`}>{caseItem.status}</span>
                <button
                  type="button"
                  className="mobile-three-dots"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCaseMenu(caseItem.id);
                  }}
                  aria-label={`Case options for ${caseItem.id}`}
                >
                  ⋮
                </button>
                {openCaseMenu === caseItem.id && (
                  <div className="mobile-case-options">
                    <button type="button" onClick={(event) => { event.stopPropagation(); setOpenCaseMenu(null); setSelectedCase(caseItem); }}>Case Summary</button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); setOpenCaseMenu(null); setSelectedCase(caseItem); setShowCaseAudit(true); }}>Audit Trail</button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); toggleStarCase(caseItem); setOpenCaseMenu(null); }}>
                      {starredCases.includes(caseItem.id) ? "Remove from Starred" : "Star Case"}
                    </button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); setOpenCaseMenu(null); navigateDashboard("shared", "Shared"); }}>Share / Collaborate</button>
                  </div>
                )}
              </div>
            </div>
            <div className="mobile-case-footer">
              <span>♙ {caseItem.investigator || "Case Handler"}</span>
              <span>{starredCases.includes(caseItem.id) ? "★ Starred" : "Securely Stored"}</span>
            </div>
          </article>
        ))}
      </div>
    );

    const renderAiOverviewCard = () => (
      <button type="button" className="dashboard-top-column ai-overview-column" onClick={() => navigateDashboard("ai", "Documents")}>
        <span className="ai-star">✦</span>
        <span>AI Overview</span>
      </button>
    );

    const renderCaseAndAiOverview = (heading = "My Cases") => (
      <>
        <div className="dashboard-top-columns">
          <div className="dashboard-top-column my-cases-column">
            <h1>{heading}</h1>
            <p>Verified cases in your protected workspace</p>
          </div>
          {renderAiOverviewCard()}
        </div>
        <div className="dashboard-quick-actions">
          <button type="button" onClick={() => navigateDashboard("chats", "Home")}>
            <span>◌</span><strong>Chats</strong><small>Secure conversations</small>
          </button>
          <button type="button" onClick={() => navigateDashboard("notifications", "Home")}>
            <span>◉</span><strong>Notifications</strong><small>System updates</small>
          </button>
        </div>
        {renderCaseCards()}
      </>
    );

    const renderHomePage = () => (
      <main className="mobile-dashboard dashboard-subpage">
        {renderSideMenu()}
        {renderDashboardHeader("Home")}
        <section className="mobile-dashboard-content">
          <div className="page-kicker">CASEVAULT HOME</div>
          <div className="home-welcome-card">
            <div>
              <span>WELCOME</span>
              <h1>{currentUser}</h1>
              <p>{registrationData.role || "Authorized user"} • {organizationLabelMap[registrationData.organization] || "Authorized Department"}</p>
            </div>
            <div className="home-profile-letter">{currentUser.charAt(0).toUpperCase()}</div>
          </div>
          {renderCaseAndAiOverview("My Cases")}
        </section>
        {renderBottomNavigation()}
      </main>
    );

    const renderDocumentsPage = () => (
      <main className="mobile-dashboard dashboard-subpage">
        {renderSideMenu()}
        {renderDashboardHeader("Documents")}
        <section className="mobile-dashboard-content">
          <div className="page-kicker">DOCUMENTS</div>
          {renderCaseAndAiOverview("My Cases")}
        </section>
        <button type="button" className="mobile-add-case-floating" onClick={() => navigateDashboard("caseActions", "Documents")}>
          <span>+</span>
          <small>Add Case</small>
        </button>
        {renderBottomNavigation()}
      </main>
    );

    const renderStarredPage = () => {
      const caseStarred = cases.filter((item) => starredCases.includes(item.id));
      const docStarred = Object.values(documentLibrary).flat().filter((item) => starredDocuments.includes(item.id));
      return (
        <main className="mobile-dashboard dashboard-subpage">
          {renderSideMenu()}
          {renderDashboardHeader("Starred")}
          <section className="mobile-dashboard-content">
            <div className="page-kicker">STARRED</div>
            <div className="section-heading-row"><div><h1>Starred Cases</h1><p>Quick access to marked cases.</p></div><span className="count-pill">{caseStarred.length}</span></div>
            {caseStarred.length ? renderCaseCards(caseStarred) : <div className="empty-workspace-card">No starred cases yet. Open the three-dot menu on a case and choose <strong>Star Case</strong>.</div>}
            <div className="section-heading-row"><div><h1>Starred Documents</h1><p>Protected document shortcuts.</p></div><span className="count-pill">{docStarred.length}</span></div>
            <div className="mini-document-list">
              {docStarred.length === 0 && <div className="empty-workspace-card">No starred documents yet.</div>}
              {docStarred.map((doc) => (
                <button type="button" key={doc.id} className="mini-document-row" onClick={() => { const owner = Object.keys(documentLibrary).find((section) => documentLibrary[section].some((item) => item.id === doc.id)); setActiveBottom("Documents"); setSelectedCase(cases[0]); setSelectedDocumentSection(owner); setOpenedDocument(doc); }}>
                  <span className="mini-document-icon">{getFileIcon(doc.type)}</span>
                  <span><strong>{doc.name}</strong><small>{doc.type} • {doc.size}</small></span>
                  <b>›</b>
                </button>
              ))}
            </div>
          </section>
          {renderBottomNavigation()}
        </main>
      );
    };

    const renderSharedPage = () => (
      <main className="mobile-dashboard dashboard-subpage">
        {renderSideMenu()}
        {renderDashboardHeader("Shared")}
        <section className="mobile-dashboard-content">
          <div className="page-kicker">COLLABORATION</div>
          <div className="collaboration-header-card">
            <div><span>PRIVATE WORKSPACE</span><h1>Shared & Collaborative</h1><p>Collaborate on authorized cases through protected access codes.</p></div>
            <button type="button" onClick={() => setShowCollaborationModal(true)}>+</button>
          </div>
          <div className="collaboration-join-card">
            <span>JOIN COLLABORATION</span>
            <h2>Enter shared passcode</h2>
            <div className="collaboration-inline-form"><input value={collaborationJoinPasscode} placeholder="Enter passcode" onChange={(event) => setCollaborationJoinPasscode(event.target.value)} /><button type="button" onClick={joinCollaboration}>Join</button></div>
          </div>
          <div className="section-heading-row"><div><h1>Your workspaces</h1><p>Private collaborative rooms.</p></div><span className="count-pill">{sharedWorkspaces.length}</span></div>
          <div className="shared-workspace-list">
            {sharedWorkspaces.length === 0 && <div className="empty-workspace-card">No collaboration workspace yet. Use the <strong>+</strong> button to create one.</div>}
            {sharedWorkspaces.map((workspace) => (
              <article className="shared-workspace-card" key={workspace.id}><div><span>PRIVATE</span><h3>{workspace.name}</h3><p>Created by {workspace.createdBy} • {workspace.createdAt}</p></div><strong>{workspace.members} member</strong></article>
            ))}
          </div>
        </section>
        {showCollaborationModal && (
          <div className="case-modal-backdrop" onClick={() => setShowCollaborationModal(false)}>
            <div className="case-form-modal" onClick={(event) => event.stopPropagation()}>
              <div className="modal-top-row"><div><span>NEW COLLABORATION</span><h2>Create workspace</h2></div><button type="button" onClick={() => setShowCollaborationModal(false)}>×</button></div>
              <input placeholder="Workspace name" value={collaborationForm.name} onChange={(event) => setCollaborationForm({ ...collaborationForm, name: event.target.value })} />
              <input placeholder="Create collaboration passcode" value={collaborationForm.passcode} onChange={(event) => setCollaborationForm({ ...collaborationForm, passcode: event.target.value })} />
              <button type="button" className="primary-full-btn" onClick={createCollaboration}>Create workspace</button>
            </div>
          </div>
        )}
        {renderBottomNavigation()}
      </main>
    );

    const renderAddCaseActions = () => (
      <main className="mobile-dashboard dashboard-subpage">
        {renderSideMenu()}
        {renderDashboardHeader("Case Access")}
        <section className="mobile-dashboard-content">
          <div className="page-kicker">CASE ACCESS</div>
          <div className="case-actions-title"><span>+</span><div><h1>Manage Case Access</h1><p>Create a protected case or join an authorized case.</p></div></div>
          <button type="button" className="case-access-option" onClick={() => { setCreatedCaseLink(""); setDashboardPage("addCase"); }}><span>＋</span><div><strong>Add New Case</strong><small>Create a case with an ID, investigator, summary and passcode.</small></div><b>›</b></button>
          <button type="button" className="case-access-option" onClick={() => setDashboardPage("joinCase")}><span>↗</span><div><strong>Join New Case</strong><small>Enter Case ID + passcode or paste an app-only link.</small></div><b>›</b></button>
        </section>
        {renderBottomNavigation()}
      </main>
    );

    const renderAddCasePage = () => (
      <main className="mobile-dashboard dashboard-subpage">
        {renderSideMenu()}
        {renderDashboardHeader("Add New Case")}
        <section className="mobile-dashboard-content">
          <div className="page-kicker">ADD NEW CASE</div>
          <div className="case-form-card">
            <div className="form-title"><span>CASE CREATION</span><h1>Protected case details</h1><p>All fields are stored for this local prototype and shown in the case profile.</p></div>
            {[
              ["id", "Case ID", "CASE-2026-0142"],
              ["name", "Case Name", "Enter case name"],
              ["description", "Case Description", "Enter case description"]
            ].map(([key, label, placeholder]) => (
              <label className="form-field" key={key}><span>{label}</span><input value={caseForm[key]} placeholder={placeholder} onChange={(event) => setCaseForm({ ...caseForm, [key]: event.target.value })} /></label>
            ))}
            <label className="form-field"><span>Registered Date</span><input type="date" value={caseForm.registeredDate} onChange={(event) => setCaseForm({ ...caseForm, registeredDate: event.target.value })} /></label>
            <label className="form-field"><span>Investigator Head Name</span><input value={caseForm.investigator} placeholder="Enter investigator head name" onChange={(event) => setCaseForm({ ...caseForm, investigator: event.target.value })} /></label>
            <label className="form-field"><span>Case Summary</span><textarea value={caseForm.summary} placeholder="Enter case summary" onChange={(event) => setCaseForm({ ...caseForm, summary: event.target.value })} /></label>
            <div className="two-field-row"><label className="form-field"><span>Passcode</span><input type="password" value={caseForm.passcode} placeholder="Create passcode" onChange={(event) => setCaseForm({ ...caseForm, passcode: event.target.value })} /></label><label className="form-field"><span>Confirm Passcode</span><input type="password" value={caseForm.confirmPasscode} placeholder="Confirm passcode" onChange={(event) => setCaseForm({ ...caseForm, confirmPasscode: event.target.value })} /></label></div>
            <button type="button" className="primary-full-btn" onClick={createCase}>Create Case</button>
          </div>
          {createdCaseLink && <div className="case-link-card"><span>APP-ONLY JOIN LINK</span><p>{createdCaseLink}</p><button type="button" onClick={() => copyCaseLink(createdCaseLink)}>Copy link</button><small>This link is intended to be pasted into CaseVault. External pages cannot use it as a public case URL.</small></div>}
        </section>
        {renderBottomNavigation()}
      </main>
    );

    const renderJoinCasePage = () => (
      <main className="mobile-dashboard dashboard-subpage">
        {renderSideMenu()}
        {renderDashboardHeader("Join Case")}
        <section className="mobile-dashboard-content">
          <div className="page-kicker">JOIN CASE</div>
          <div className="case-form-card join-case-card">
            <div className="form-title"><span>AUTHORIZED ACCESS</span><h1>Join a protected case</h1><p>Use a Case ID and passcode, or paste the app-only link you received.</p></div>
            <label className="form-field"><span>Case ID</span><input value={joinCaseForm.caseId} placeholder="Enter Case ID" onChange={(event) => setJoinCaseForm({ ...joinCaseForm, caseId: event.target.value })} /></label>
            <label className="form-field"><span>Passcode</span><input type="password" value={joinCaseForm.passcode} placeholder="Enter passcode" onChange={(event) => setJoinCaseForm({ ...joinCaseForm, passcode: event.target.value })} /></label>
            <div className="or-divider"><span>OR</span></div>
            <label className="form-field"><span>Paste App-only Link</span><input value={joinCaseForm.link} placeholder="casevault://join?..." onChange={(event) => setJoinCaseForm({ ...joinCaseForm, link: event.target.value })} /></label>
            <button type="button" className="primary-full-btn" onClick={joinExistingCase}>Join Case</button>
          </div>
        </section>
        {renderBottomNavigation()}
      </main>
    );

    const renderRecentPage = () => (
      <main className="mobile-dashboard dashboard-subpage">
        {renderSideMenu()}
        {renderDashboardHeader("Recent Downloads")}
        <section className="mobile-dashboard-content">
          <div className="page-kicker">RECENT DOWNLOADS</div>
          <div className="section-heading-row"><div><h1>Downloaded Documents</h1><p>Your recent protected file downloads.</p></div><span className="count-pill">{recentDownloads.length}</span></div>
          <div className="mini-document-list">{recentDownloads.length === 0 && <div className="empty-workspace-card">No documents have been downloaded from this session yet.</div>}{recentDownloads.map((item) => <article className="mini-document-row static" key={item.id}><span className="mini-document-icon">{getFileIcon(item.type)}</span><span><strong>{item.name}</strong><small>{item.section} • {item.size}</small></span><b>↓</b></article>)}</div>
        </section>
        {renderBottomNavigation()}
      </main>
    );

    const renderSimpleUtilityPage = (type) => {
      const content = {
        backup: ["BACKUP", "Secure Backup", "Backup status is monitored for this prototype workspace.", "Last protected snapshot: Ready"],
        bin: ["BIN", "Protected Bin", "Deleted case documents are not physically removed from the audit system in this prototype.", "No recoverable items"],
        storage: ["STORAGE", "Storage Overview", "Current local prototype storage is browser-based.", `${Object.values(documentLibrary).flat().length} document records indexed`]
      }[type];
      return (
        <main className="mobile-dashboard dashboard-subpage">
          {renderSideMenu()}
          {renderDashboardHeader(content[1])}
          <section className="mobile-dashboard-content">
            <div className="page-kicker">{content[0]}</div>
            <div className="utility-status-card"><span>CASEVAULT STATUS</span><h1>{content[1]}</h1><p>{content[2]}</p><strong>{content[3]}</strong></div>
            {type === "storage" && <div className="storage-meter"><span><b>Protected records</b><b>{Object.values(documentLibrary).flat().length}</b></span><div><i style={{ width: "62%" }} /></div><small>Prototype storage visualization</small></div>}
            {type === "backup" && <div className="utility-list-card"><div><span>✓</span><strong>Local workspace</strong><small>Available</small></div><div><span>✓</span><strong>Audit metadata</strong><small>Recorded</small></div><div><span>✓</span><strong>Case metadata</strong><small>Saved locally</small></div></div>}
          </section>
          {renderBottomNavigation()}
        </main>
      );
    };

    const renderNotificationsPage = () => (
      <main className="mobile-dashboard dashboard-subpage">
        {renderSideMenu()}
        {renderDashboardHeader("Notifications")}
        <section className="mobile-dashboard-content">
          <div className="page-kicker">NOTIFICATIONS</div>
          <div className="section-heading-row"><div><h1>Updates</h1><p>Security and workspace notifications.</p></div><button type="button" className="text-action-button" onClick={() => setNotifications((current) => current.map((item) => ({ ...item, unread: false })))}>Mark all read</button></div>
          <div className="notification-list">{notifications.map((item) => <article className={`notification-card ${item.unread ? "unread" : ""}`} key={item.id}><span>◉</span><div><strong>{item.title}</strong><p>{item.message}</p><small>{item.time}</small></div></article>)}</div>
        </section>
        {renderBottomNavigation()}
      </main>
    );

    const renderChatsPage = () => (
      <main className="mobile-dashboard dashboard-subpage">
        {renderSideMenu()}
        {renderDashboardHeader("Chats")}
        <section className="mobile-dashboard-content">
          <div className="page-kicker">SECURE CHATS</div>
          <div className="chat-create-card"><span>CREATE NEW CHAT</span><h1>Protected conversation</h1><p>Use a participant or team name to create a secure chat entry.</p><div className="chat-create-row"><input value={chatDraft} placeholder="Officer / team / legal contact" onChange={(event) => setChatDraft(event.target.value)} /><button type="button" onClick={createChat}>Create</button></div></div>
          <div className="section-heading-row"><div><h1>Your chats</h1><p>Conversation shortcuts.</p></div><span className="count-pill">{chats.length}</span></div>
          <div className="chat-list">{chats.length === 0 && <div className="empty-workspace-card">No secure chats yet.</div>}{chats.map((chat) => <article className="chat-card" key={chat.id}><span className="chat-avatar">{chat.name.charAt(0).toUpperCase()}</span><div><strong>{chat.name}</strong><p>{chat.lastMessage}</p><small>{chat.time}</small></div><b>›</b></article>)}</div>
        </section>
        {renderBottomNavigation()}
      </main>
    );

    const renderAiPage = () => (
      <main className="mobile-dashboard dashboard-subpage ai-page">
        <header className="document-screen-header ai-page-header"><button type="button" className="document-back-button" onClick={() => navigateDashboard("documents", "Documents")}>←</button><div className="document-screen-heading"><span>CASEVAULT AI</span><strong>AI Overview Assistant</strong></div><div className="document-secure-pill">PROTOTYPE</div></header>
        <section className="ai-chat-content">
          <div className="ai-intro-card"><span>✦</span><div><strong>Secure case assistant</strong><p>Ask about case structure, document categories, similar themes or audit activity.</p></div></div>
          <div className="ai-suggestion-row"><button type="button" onClick={() => sendAiMessage("Show similar cases")}>Similar cases</button><button type="button" onClick={() => sendAiMessage("What evidence documents should I review?")}>Evidence help</button><button type="button" onClick={() => sendAiMessage("Explain the audit trail")}>Audit help</button></div>
          <div className="ai-message-list">{aiMessages.map((message) => <div className={`ai-message ${message.from}`} key={message.id}><span>{message.from === "ai" ? "✦" : currentUser.charAt(0).toUpperCase()}</span><p>{message.text}</p></div>)}</div>
          <div className="ai-input-row"><input value={aiDraft} placeholder="Ask CaseVault AI..." onChange={(event) => setAiDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendAiMessage(); }} /><button type="button" onClick={() => sendAiMessage()}>➤</button></div>
        </section>
      </main>
    );

    const renderProfilePage = () => {
      const maskedAadhaar = registrationData.aadhaar ? `•••• •••• ${registrationData.aadhaar.slice(-4)}` : "Not provided";
      return (
        <main className="mobile-dashboard dashboard-subpage profile-page">
          {renderSideMenu()}
          <header className="document-screen-header"><button type="button" className="document-back-button" onClick={() => { setProfileOpen(false); navigateDashboard("documents", "Documents"); }}>←</button><div className="document-screen-heading"><span>ACCOUNT</span><strong>Profile</strong></div><div className="document-secure-pill">VIEW ONLY</div></header>
          <section className="mobile-dashboard-content">
            <div className="profile-hero"><div className="profile-large-letter">{currentUser.charAt(0).toUpperCase()}</div><div><span>AUTHORIZED USER</span><h1>{currentUser}</h1><p>{registrationData.role || "Authorized role"}</p></div></div>
            <div className="profile-info-card"><div><span>Full Name</span><strong>{registrationData.fullName || "Not provided"}</strong></div><div><span>Organization / Department</span><strong>{organizationLabelMap[registrationData.organization] || "Not provided"}</strong></div><div><span>Role</span><strong>{registrationData.role || "Not provided"}</strong></div><div><span>Officer ID</span><strong>{registrationData.officerId || "Not provided"}</strong></div><div><span>Registered Mobile</span><strong>{registrationData.mobile ? `+91 ${registrationData.mobile.slice(0, 2)}••••••${registrationData.mobile.slice(-2)}` : "Not provided"}</strong></div><div><span>Aadhaar</span><strong>{maskedAadhaar}</strong></div></div>
            <div className="profile-security-note"><span>🔒</span><div><strong>Profile is read-only</strong><p>Personal and official registration details are shown for reference. Editing is intentionally unavailable from the CaseVault front end.</p></div></div>
          </section>
          {renderBottomNavigation()}
        </main>
      );
    };

    const renderGlobalAuditPage = () => (
      <main className="mobile-dashboard document-audit-screen">
        <header className="document-screen-header"><button type="button" className="document-back-button" onClick={() => navigateDashboard("documents", "Documents")}>←</button><div className="document-screen-heading"><span>CASEVAULT SECURITY</span><strong>Complete Audit Trail</strong></div><div className="document-secure-pill">LOCKED</div></header>
        <section className="document-screen-content"><div className="document-case-banner"><div><span>WORKSPACE</span><strong>All protected activity</strong></div><div className="document-integrity-summary"><span>●</span> Append-only prototype log</div></div><div className="audit-summary-grid"><div><strong>{auditEntries.length}</strong><span>Total events</span></div><div><strong>{auditEntries.filter((entry) => entry.documentName !== "System").length}</strong><span>Document / case events</span></div><div><strong>{auditEntries.filter((entry) => entry.action.toLowerCase().includes("integrity")).length}</strong><span>Integrity checks</span></div></div><div className="audit-list-card"><div className="audit-list-header"><div><span>SECURITY LOG</span><strong>Recent and historical activity</strong></div><span className="audit-live-badge">LIVE</span></div><div className="audit-entry-list">{auditEntries.map((entry) => <article className="audit-entry" key={entry.id}><div className="audit-entry-dot">✓</div><div className="audit-entry-main"><div className="audit-entry-top"><strong>{entry.action}</strong><span>{entry.time}</span></div><p>{entry.detail}</p><div className="audit-entry-meta"><span>{entry.documentName}</span><span>{entry.section}</span><span>{entry.user}</span></div></div></article>)}</div></div><div className="audit-security-note"><span>🔒</span><div><strong>Security note</strong><p>Audit events in this prototype are stored in the browser. A real law-enforcement deployment should move the audit log to an immutable server-side system.</p></div></div></section>
      </main>
    );

    if (profileOpen) return renderProfilePage();

    if (dashboardPage === "home") return renderHomePage();
    if (dashboardPage === "documents" && !selectedCase) return renderDocumentsPage();
    if (dashboardPage === "starred") return renderStarredPage();
    if (dashboardPage === "shared") return renderSharedPage();
    if (dashboardPage === "caseActions") return renderAddCaseActions();
    if (dashboardPage === "addCase") return renderAddCasePage();
    if (dashboardPage === "joinCase") return renderJoinCasePage();
    if (dashboardPage === "recent") return renderRecentPage();
    if (dashboardPage === "backup") return renderSimpleUtilityPage("backup");
    if (dashboardPage === "bin") return renderSimpleUtilityPage("bin");
    if (dashboardPage === "storage") return renderSimpleUtilityPage("storage");
    if (dashboardPage === "notifications") return renderNotificationsPage();
    if (dashboardPage === "chats") return renderChatsPage();
    if (dashboardPage === "ai") return renderAiPage();
    if (dashboardPage === "audit") return renderGlobalAuditPage();

    if (selectedCase) {
      const activeDocuments = selectedDocumentSection ? documentLibrary[selectedDocumentSection] || [] : [];
      const filteredDocuments = activeDocuments.filter((document) => !documentSearch.trim() || document.name.toLowerCase().includes(documentSearch.toLowerCase()) || document.type.toLowerCase().includes(documentSearch.toLowerCase()));
      const sectionMeta = documentSections.find((section) => section.title === selectedDocumentSection) || { title: selectedDocumentSection || "Documents", icon: "▤", folderType: "FILES", description: "Protected case documents." };

      if (showCaseAudit) {
        return (
          <main className="mobile-dashboard document-audit-screen">
            <header className="document-screen-header"><button type="button" className="document-back-button" onClick={() => setShowCaseAudit(false)}>←</button><div className="document-screen-heading"><span>CASEVAULT SECURITY</span><strong>Complete Audit Trail</strong></div><div className="document-secure-pill">LOCKED</div></header>
            <section className="document-screen-content"><div className="document-case-banner"><div><span>CASE</span><strong>{selectedCase.id}</strong></div><div className="document-integrity-summary"><span>●</span> Append-only activity log</div></div><div className="audit-summary-grid"><div><strong>{auditEntries.length}</strong><span>Total events</span></div><div><strong>{auditEntries.filter((entry) => entry.documentName !== "System").length}</strong><span>Document events</span></div><div><strong>{auditEntries.filter((entry) => entry.action.toLowerCase().includes("integrity")).length}</strong><span>Integrity checks</span></div></div><div className="audit-list-card"><div className="audit-list-header"><div><span>SECURITY LOG</span><strong>Recent and historical activity</strong></div><span className="audit-live-badge">LIVE</span></div><div className="audit-entry-list">{auditEntries.map((entry) => <article className="audit-entry" key={entry.id}><div className="audit-entry-dot">✓</div><div className="audit-entry-main"><div className="audit-entry-top"><strong>{entry.action}</strong><span>{entry.time}</span></div><p>{entry.detail}</p><div className="audit-entry-meta"><span>{entry.documentName}</span><span>{entry.section}</span><span>{entry.user}</span></div></div></article>)}</div></div></section>
          </main>
        );
      }

      if (openedDocument) {
        const doc = openedDocument;
        const normalizedType = String(doc.type || "").toUpperCase();
        const canPreviewImage = ["JPG", "JPEG", "PNG", "GIF", "WEBP"].includes(normalizedType);
        const canPreviewVideo = ["MP4", "WEBM", "MOV"].includes(normalizedType);
        const canPreviewAudio = ["MP3", "WAV", "M4A", "OGG"].includes(normalizedType);
        const canPreviewPdf = normalizedType === "PDF";
        return (
          <main className="mobile-dashboard document-viewer-screen">
            <header className="document-screen-header"><button type="button" className="document-back-button" onClick={() => setOpenedDocument(null)}>←</button><div className="document-screen-heading"><span>SECURE DOCUMENT VIEWER</span><strong>{doc.name}</strong></div><div className="document-secure-pill">READ ONLY</div></header>
            <section className="document-screen-content"><div className="document-viewer-card"><div className="document-viewer-file-icon">{getFileIcon(doc.type)}</div><div className="document-viewer-title"><span className="document-type-label">{doc.type} FILE</span><h1>{doc.name}</h1><div className="document-verification-line"><span className={doc.verified ? "verified-badge" : "pending-badge"}>{doc.verified ? "✓ VERIFIED" : "⚠ PENDING VERIFICATION"}</span><span>{doc.size}</span></div></div><div className="document-viewer-actions"><button type="button" onClick={() => downloadDocument(doc)}>↓<span>Download</span></button><button type="button" onClick={() => toggleStarDocument(doc)}>{starredDocuments.includes(doc.id) ? "★" : "☆"}<span>Star</span></button><button type="button" onClick={() => verifyDocumentIntegrity(doc)}>✓<span>Verify</span></button><button type="button" onClick={() => copyDocumentName(doc)}>⧉<span>Copy name</span></button></div><div className="document-preview-shell">{doc.url && canPreviewImage && <img src={doc.url} alt={doc.name} className="document-image-preview" />}{doc.url && canPreviewVideo && <video controls className="document-media-preview" src={doc.url} />}{doc.url && canPreviewAudio && <audio controls className="document-audio-preview" src={doc.url} />}{doc.url && canPreviewPdf && <iframe title={doc.name} className="document-pdf-preview" src={doc.url} />}{!doc.url && <div className="document-demo-preview"><div className="document-demo-icon">{getFileIcon(doc.type)}</div><strong>Protected preview</strong><p>This demo record is a protected metadata entry. Upload the real file from the folder to enable live preview and download.</p><span>READ-ONLY • INTEGRITY PROTECTED</span></div>}{doc.url && !canPreviewImage && !canPreviewVideo && !canPreviewAudio && !canPreviewPdf && <div className="document-demo-preview"><div className="document-demo-icon">{getFileIcon(doc.type)}</div><strong>Protected file</strong><p>The file is stored securely, but this type does not have an inline browser preview.</p></div>}</div><div className="document-metadata-grid"><div><span>Document type</span><strong>{doc.type}</strong></div><div><span>Size</span><strong>{doc.size}</strong></div><div><span>Verification</span><strong>{doc.verified ? "Verified" : "Pending"}</strong></div><div><span>Access mode</span><strong>Read only</strong></div></div><div className="document-integrity-card"><div><span>INTEGRITY RECORD</span><strong>SHA-256</strong></div><code>{doc.sha256 || "DEMO-INTEGRITY-LOCKED-RECORD"}</code><small>Last verified: {doc.lastVerified || "Protected system record"}</small></div><button type="button" className="document-audit-button" onClick={() => setShowCaseAudit(true)}>◈ View document audit history</button></div></section>
          </main>
        );
      }

      if (selectedDocumentSection) {
        return (
          <main className="mobile-dashboard document-library-screen">
            <header className="document-screen-header"><button type="button" className="document-back-button" onClick={() => { setSelectedDocumentSection(null); setDocumentSearch(""); setDocumentContextMenu(null); }}>←</button><div className="document-screen-heading"><span>{selectedCase.id}</span><strong>{sectionMeta.title}</strong></div><button type="button" className="document-audit-header-button" onClick={() => setShowCaseAudit(true)}>◈</button></header>
            <section className="document-screen-content"><div className="document-breadcrumb"><span>CASEVAULT</span><b>›</b><span>{selectedCase.id}</span><b>›</b><strong>{sectionMeta.title}</strong></div><div className="document-folder-card"><div className="document-folder-icon">{sectionMeta.icon}</div><div className="document-folder-copy"><span>PROTECTED FOLDER</span><h1>{sectionMeta.title}</h1><p>{sectionMeta.description}</p><div className="document-folder-meta"><span>{activeDocuments.length} items</span><span>{activeDocuments.filter((document) => document.verified).length} verified</span><span>Read-only records</span></div></div></div><div className="document-toolbar"><div className="document-toolbar-search"><span>⌕</span><input type="text" placeholder="Search this folder" value={documentSearch} onChange={(event) => setDocumentSearch(event.target.value)} /></div><button type="button" className="document-upload-button" onClick={() => triggerDocumentUpload(selectedDocumentSection)}>+<span>Upload</span></button></div><div className="document-security-strip"><span>🔒</span><div><strong>Integrity protected document store</strong><small>Existing records are read-only. New uploads are logged and can be SHA-256 verified.</small></div></div><div className="document-table-shell"><div className="document-table-scroll"><div className="document-table"><div className="document-table-header"><span>Name</span><span>Verified</span><span>Type</span><span>Size</span></div>{filteredDocuments.map((document) => <div className={`document-table-row ${documentContextMenu?.document?.id === document.id ? "document-row-selected" : ""}`} key={document.id} onContextMenu={(event) => openDocumentContextMenu(event, document)}><button type="button" className="document-name-cell" onClick={() => openDocument(document)}><span className="document-file-icon">{getFileIcon(document.type)}</span><span className="document-name-copy"><strong>{document.name}</strong><small>Protected record</small></span></button><span className={document.verified ? "document-status-cell verified" : "document-status-cell pending"}>{document.verified ? "✓" : "!"}</span><span className="document-type-cell">{document.type}</span><span className="document-size-cell">{document.size}</span><button type="button" className="document-row-menu-button" onClick={(event) => openDocumentContextMenu(event, document)} aria-label={`Options for ${document.name}`}>⋮</button></div>)}{filteredDocuments.length === 0 && <div className="document-empty-state"><div>⌕</div><strong>No matching documents</strong><p>Try another search or upload a document to this protected folder.</p></div>}</div></div></div><div className="document-audit-mini-card"><div><span>SECURITY AUDIT</span><strong>{auditEntries.filter((entry) => entry.section === selectedDocumentSection).length} events in this folder</strong></div><button type="button" onClick={() => setShowCaseAudit(true)}>View audit →</button></div></section>
            {documentContextMenu && <><button type="button" className="document-context-backdrop" onClick={() => setDocumentContextMenu(null)} aria-label="Close document menu" /><div className="document-context-menu" style={{ left: documentContextMenu.x, top: documentContextMenu.y }}><div className="context-menu-title"><span>{getFileIcon(documentContextMenu.document.type)}</span><div><strong>{documentContextMenu.document.name}</strong><small>{documentContextMenu.document.type} • {documentContextMenu.document.size}</small></div></div><button type="button" onClick={() => openDocument(documentContextMenu.document)}><span>▤</span>Open</button><button type="button" onClick={() => downloadDocument(documentContextMenu.document)}><span>↓</span>Download</button><button type="button" onClick={() => verifyDocumentIntegrity(documentContextMenu.document)}><span>✓</span>Verify integrity</button><button type="button" onClick={() => toggleStarDocument(documentContextMenu.document)}><span>{starredDocuments.includes(documentContextMenu.document.id) ? "★" : "☆"}</span>{starredDocuments.includes(documentContextMenu.document.id) ? "Remove from Starred" : "Add to Starred"}</button><button type="button" onClick={() => copyDocumentName(documentContextMenu.document)}><span>⧉</span>Copy name</button><button type="button" onClick={() => openDocument(documentContextMenu.document)}><span>ⓘ</span>View details</button><button type="button" onClick={() => { setDocumentContextMenu(null); setShowCaseAudit(true); }}><span>◈</span>Audit history</button></div></>}
            {hiddenUploadInput}
          </main>
        );
      }

      return (
        <main className="mobile-dashboard case-detail-screen">
          <header className="case-detail-header"><button type="button" className="case-detail-back" onClick={() => { setSelectedCase(null); setDashboardPage("documents"); setActiveBottom("Documents"); }} aria-label="Back to cases">←</button><div className="case-detail-heading"><span>CASEVAULT</span><strong>{selectedCase.id}</strong></div><button type="button" className="case-detail-audit" onClick={() => setShowCaseAudit(true)}>◈</button></header>
          <section className="case-detail-content"><div className="case-detail-title-card"><p>CASE ID</p><h1>{selectedCase.id}</h1><h2>{selectedCase.name}</h2><span className={`case-detail-status ${selectedCase.status.toLowerCase()}`}>{selectedCase.status}</span></div><div className="case-detail-summary-panel"><div><span>INVESTIGATOR HEAD</span><strong>{selectedCase.investigator || "Assigned investigator"}</strong></div><div><span>REGISTERED DATE</span><strong>{selectedCase.registeredDate || selectedCase.date}</strong></div><div><span>CASE SUMMARY</span><p>{selectedCase.summary || selectedCase.description}</p></div></div><div className="case-detail-section-label">CASE RECORDS</div><div className="case-detail-options">{documentSections.map((section) => <button type="button" className="case-detail-option" key={section.title} onClick={() => openDocumentSection(section.title)}><span className="case-detail-option-icon">{section.icon}</span><span className="case-detail-option-text"><strong>{section.title}</strong><small>{section.description}</small></span><span className="case-detail-arrow">›</span></button>)}</div></section>
          <nav className="mobile-bottom-navigation"><button type="button" onClick={() => navigateDashboard("home", "Home")}><span>⌂</span><small>Home</small></button><button type="button" className="mobile-bottom-active" onClick={() => navigateDashboard("starred", "Starred")}><span>☆</span><small>Starred</small></button><button type="button" onClick={() => navigateDashboard("shared", "Shared")}><span>♧</span><small>Shared</small></button><button type="button" onClick={() => navigateDashboard("documents", "Documents")}><span>▣</span><small>Documents</small></button></nav>
        </main>
      );
    }

    return renderDocumentsPage();
  }
  if (showBiometric) {
    const verifyFingerprint = () => {
      setFingerprintVerified(true);
      alert(
        "Fingerprint authentication verified successfully."
      );
    };
    const verifyFaceId = () => {
      setFaceVerified(true);
      alert(
        "Face ID authentication verified successfully."
      );
    };
    const completeAuthentication = () => {
      if (biometricMode === "login") {
        if (!fingerprintVerified && !faceVerified) {
          alert(
            "Please choose either Fingerprint or Face ID to authenticate."
          );
          return;
        }

        setShowBiometric(false);
        setShowOtp(false);
        setShowTerms(false);
        setShowFinalPage(false);
        setDashboardPage("documents");
        setActiveBottom("Documents");
        setActiveMenu("Dashboard");
        setShowDashboard(true);
        return;
      }

      if (!fingerprintVerified || !faceVerified) {
        alert(
          "For a new account, both Fingerprint and Face ID authentication are mandatory."
        );
        return;
      }

      setShowBiometric(false);
      setShowTerms(true);
    };
    return (
      <main className="login-page">
        <div className="login-background" />
        <section className="login-card biometric-card">
          <div className="login-logo">
            <img
              src="/logo.png"
              alt="CaseVault secure evidence logo"
            />
          </div>
          <p className="eyebrow">
            DOUBLE AUTHENTICATION
          </p>
          <h1>
            Identity Verification
          </h1>
          <p className="login-subtitle">
            {biometricMode === "login"
              ? "Choose either Fingerprint or Face ID to securely sign in."
              : "Complete both authentication methods to securely activate your CaseVault account."}
          </p>
          <div className="biometric-options">
            <button
              type="button"
              className={`biometric-box ${
                fingerprintVerified
                  ? "biometric-verified"
                  : ""
              }`}
              onClick={verifyFingerprint}
            >
              <div className="biometric-icon">
                {fingerprintVerified
                  ? "✓"
                  : "☝"}
              </div>
              <div className="biometric-text">
                <h2>
                  Fingerprint
                </h2>
                <p>
                  {fingerprintVerified
                    ? "Authentication successful"
                    : "Tap to authenticate"}
                </p>
              </div>
              <span
                className={`biometric-status ${
                  fingerprintVerified
                    ? "status-success"
                    : ""
                }`}
              >
                {fingerprintVerified
                  ? "VERIFIED"
                  : "PENDING"}
              </span>
            </button>
            <button
              type="button"
              className={`biometric-box ${
                faceVerified
                  ? "biometric-verified"
                  : ""
              }`}
              onClick={verifyFaceId}
            >
              <div className="biometric-icon">
                {faceVerified
                  ? "✓"
                  : "◉"}
              </div>
              <div className="biometric-text">
                <h2>
                  Face ID
                </h2>
                <p>
                  {faceVerified
                    ? "Authentication successful"
                    : "Tap to authenticate"}
                </p>
              </div>
              <span
                className={`biometric-status ${
                  faceVerified
                    ? "status-success"
                    : ""
                }`}
              >
                {faceVerified
                  ? "VERIFIED"
                  : "PENDING"}
              </span>
            </button>
          </div>
          <button
            type="button"
            className="login-btn complete-auth-btn"
            onClick={
              completeAuthentication
            }
          >
            Complete Authentication
          </button>
          <p className="authorized">
            {biometricMode === "login"
              ? "🔒 One biometric method is required for login"
              : "🔒 Both biometric methods are required for new account creation"}
          </p>
        </section>
      </main>
    );
  }
  if (showOtp) {
    const handleOtpChange = (
      value,
      index
    ) => {
      if (!/^\d*$/.test(value)) {
        return;
      }
      const newOtp = [...otp];
      newOtp[index] =
        value.slice(-1);
      setOtp(newOtp);
      if (
        value &&
        index < 3
      ) {
        document
          .getElementById(
            `otp-${index + 1}`
          )
          ?.focus();
      }
    };
    const handleOtpKeyDown = (
      event,
      index
    ) => {
      if (
        event.key === "Backspace" &&
        !otp[index] &&
        index > 0
      ) {
        document
          .getElementById(
            `otp-${index - 1}`
          )
          ?.focus();
      }
    };
    const verifyOtp = () => {
      const enteredOtp =
        otp.join("");
      if (
        enteredOtp.length !== 4
      ) {
        alert(
          "Please enter the complete 4-digit OTP."
        );
        return;
      }
      if (
        enteredOtp === generatedOtp
      ) {
        alert(
          "OTP verified successfully!"
        );
        setShowOtp(false);
        setBiometricMode("registration");
        setFingerprintVerified(false);
        setFaceVerified(false);
        setShowBiometric(true);
      } else {
        alert(
          "Invalid OTP. Please try again."
        );
      }
    };
    const resendOtp = () => {
      const newOtp =
        Math.floor(
          1000 +
          Math.random() * 9000
        ).toString();
      setGeneratedOtp(newOtp);
      setOtp([
        "",
        "",
        "",
        "",
      ]);
      alert(
        "New OTP generated for demo: " +
        newOtp
      );
    };
    return (
      <main className="login-page">
        <div className="login-background" />
        <section className="login-card otp-card">
          <div className="login-logo">
            <img
              src="/logo.png"
              alt="CaseVault secure evidence logo"
            />
          </div>
          <p className="eyebrow">
            IDENTITY VERIFICATION
          </p>
          <h1>
            Verify OTP
          </h1>
          <p className="login-subtitle">
            We have sent an OTP to your registered
            mobile number ending with{" "}
            <strong>
              {registrationData.mobile.slice(-4)}
            </strong>
          </p>
          <div className="otp-boxes">
            {otp.map(
              (
                digit,
                index
              ) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(event) =>
                    handleOtpChange(
                      event.target.value,
                      index
                    )
                  }
                  onKeyDown={(event) =>
                    handleOtpKeyDown(
                      event,
                      index
                    )
                  }
                  className="otp-input"
                />
              )
            )}
          </div>
          <p className="otp-info">
            Enter the 4-digit OTP to continue.
          </p>
          <button
            type="button"
            className="login-btn"
            onClick={verifyOtp}
          >
            Next
          </button>
          <button
            type="button"
            className="resend-btn"
            onClick={resendOtp}
          >
            Resend OTP
          </button>
          <p className="authorized">
            🔒 Authorized personnel only
          </p>
        </section>
      </main>
    );
  }
  if (showRegister) {
    const handleRegistrationChange = (event) => {
      const { id, value } = event.target;
      setRegistrationData((current) => ({
        ...current,
        [id]: value,
        ...(id === "organization" ? { role: "" } : {})
      }));
    };
    const handleRegistrationNext = () => {
      if (
        !registrationData.fullName ||
        !registrationData.aadhaar ||
        !registrationData.password ||
        !registrationData.confirmPassword ||
        !registrationData.organization ||
        !registrationData.role ||
        !registrationData.officerId ||
        !registrationData.mobile
      ) {
        alert(
          "Please fill in all the details."
        );
        return;
      }
      if (
        registrationData.password !==
        registrationData.confirmPassword
      ) {
        alert(
          "Passwords do not match."
        );
        return;
      }
      if (
        registrationData.mobile.length !== 10
      ) {
        alert(
          "Please enter a valid 10-digit mobile number."
        );
        return;
      }
      const registeredDate = new Date().toISOString().slice(0, 10);
      const accountToSave = {
        ...registrationData,
        registeredDate
      };
      persistAccount(accountToSave);
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(newOtp);
      setRegistrationData(accountToSave);
      setBiometricMode("registration");
      setFingerprintVerified(false);
      setFaceVerified(false);
      setTermsAccepted(false);
      setShowRegister(false);
      setShowOtp(true);
      alert("OTP sent successfully!\n\nDemo OTP: " + newOtp);
    };
    const availableRoles = organizationRoleMap[registrationData.organization] || [];

    return (
      <main className="login-page">
        <div className="login-background" />
        <section className="login-card register-card">
          <div className="login-logo">
            <img
              src="/logo.png"
              alt="CaseVault secure evidence logo"
            />
          </div>
          <p className="eyebrow">
            AUTHORIZED REGISTRATION
          </p>
          <h1>
            Create Account
          </h1>
          <p className="login-subtitle">
            Register your official details to access CaseVault for the first time. Your department controls the role list shown below.
          </p>
          <form className="login-form">
            <label htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={
                registrationData.fullName
              }
              onChange={
                handleRegistrationChange
              }
            />
            <label htmlFor="aadhaar">
              Aadhaar No.
            </label>
            <input
              id="aadhaar"
              type="text"
              inputMode="numeric"
              maxLength="12"
              placeholder="Enter 12-digit Aadhaar number"
              value={
                registrationData.aadhaar
              }
              onChange={
                handleRegistrationChange
              }
            />
            <label htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create your password"
              value={
                registrationData.password
              }
              onChange={
                handleRegistrationChange
              }
            />
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={
                registrationData.confirmPassword
              }
              onChange={
                handleRegistrationChange
              }
            />
            <label htmlFor="organization">
              Organization / Department
            </label>
            <select
              id="organization"
              className="register-select"
              value={
                registrationData.organization
              }
              onChange={
                handleRegistrationChange
              }
            >
              <option value="">
                Select organization / department
              </option>
              <option value="police">
                Police Department
              </option>
              <option value="cbi">
                Central Bureau of Investigation
              </option>
              <option value="advocate">
                Legal / Advocate Department
              </option>
              <option value="court">
                Court / Judiciary
              </option>
              <option value="other">
                Other Authorized Department
              </option>
            </select>
            <label htmlFor="role">
              Role
            </label>
            <select
              id="role"
              className="register-select"
              value={registrationData.role}
              onChange={handleRegistrationChange}
              disabled={!registrationData.organization}
            >
              <option value="">
                {registrationData.organization ? "Select your role" : "Select organization first"}
              </option>
              {availableRoles.map((role) => (
                <option value={role} key={role}>
                  {role}
                </option>
              ))}
            </select>
            <label htmlFor="officerId">
              Officer ID
            </label>
            <input
              id="officerId"
              type="text"
              placeholder="Enter your official Officer ID"
              value={
                registrationData.officerId
              }
              onChange={
                handleRegistrationChange
              }
            />
            <label htmlFor="mobile">
              Registered Mobile Number
            </label>
            <input
              id="mobile"
              type="text"
              inputMode="numeric"
              maxLength="10"
              placeholder="Enter registered mobile number"
              value={
                registrationData.mobile
              }
              onChange={
                handleRegistrationChange
              }
            />
            <label className="confirm-check">
              <input type="checkbox" />
              <span>
                I confirm everything is right
              </span>
            </label>
            <button
              type="button"
              className="login-btn"
              onClick={
                handleRegistrationNext
              }
            >
              Next
            </button>
          </form>
          <button
            type="button"
            className="back-login-btn"
            onClick={() => {
              setShowRegister(false);
              setShowOtp(false);
              setShowBiometric(false);
              setShowTerms(false);
              setShowFinalPage(false);
              setBiometricMode("registration");
              setShowLogin(true);
            }}
          >
            ← Back to Login
          </button>
          <p className="authorized">
            🔒 Authorized personnel only
          </p>
        </section>
      </main>
    );
  }
  const handleLogin = () => {
    if (!loginOfficerId.trim() || !loginPassword) {
      alert("Please enter your Officer ID and password.");
      return;
    }

    let account = null;
    try {
      account = JSON.parse(localStorage.getItem("casevaultAccount") || "null");
    } catch (error) {
      account = null;
    }

    if (!account) {
      alert("No CaseVault account is registered on this device. Please create an account first.");
      setShowLogin(false);
      setShowRegister(true);
      return;
    }

    if (loginOfficerId.trim() !== account.officerId || loginPassword !== account.password) {
      alert("Incorrect Officer ID or password. Access denied.");
      return;
    }

    setRegistrationData((current) => ({ ...current, ...account }));
    setBiometricMode("login");
    setFingerprintVerified(false);
    setFaceVerified(false);
    setShowOtp(false);
    setShowTerms(false);
    setShowFinalPage(false);
    setShowDashboard(false);
    setDashboardPage("documents");
    setActiveBottom("Documents");
    setActiveMenu("Dashboard");
    setShowBiometric(true);
  };

  const handleForgotPassword = () => {
    alert("For this prototype, password recovery is handled by the authorized administrator.");
  };

  return (
    <main className="login-page">
      <div className="login-background" />
      <section className="login-card">
        <div className="login-logo">
          <img
            src="/logo.png"
            alt="CaseVault secure evidence logo"
          />
        </div>
        <p className="eyebrow">
          SECURE ACCESS PORTAL
        </p>
        <h1>
          Welcome
        </h1>
        <p className="login-subtitle">
          Sign in to access protected evidence and
          documents.
        </p>
        <form className="login-form">
          <label htmlFor="loginOfficerId">
            Officer ID
          </label>
          <input
            id="loginOfficerId"
            type="text"
            placeholder="Enter your Officer ID"
            value={loginOfficerId}
            onChange={(event) => setLoginOfficerId(event.target.value)}
          />
          <label htmlFor="loginPassword">
            Password
          </label>
          <input
            id="loginPassword"
            type="password"
            placeholder="Enter your password"
            value={loginPassword}
            onChange={(event) => setLoginPassword(event.target.value)}
          />
          <button
            type="button"
            className="forgot-btn"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
          <button
            type="button"
            className="login-btn"
            onClick={handleLogin}
          >
            Secure Login
          </button>
        </form>
        <div className="card-divider">
          <span />
          <p>OR</p>
          <span />
        </div>
        <div className="create-section">
          <p>
            New to CaseVault?
          </p>
          <button
            type="button"
            className="create-btn"
            onClick={() => {
              setBiometricMode("registration");
              setFingerprintVerified(false);
              setFaceVerified(false);
              setTermsAccepted(false);
              setShowOtp(false);
              setShowBiometric(false);
              setShowTerms(false);
              setShowFinalPage(false);
              setShowRegister(true);
            }}
          >
            Create New Account
          </button>
        </div>
        <p className="authorized">
          🔒 Authorized personnel only
        </p>
      </section>
    </main>
  );
}
export default App;
