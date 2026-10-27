# FinTrack · KOSH-GUARD
### AICTE Statutory Joint Lien Endorsement & Security Deposit Governance Architecture

**Live Demo**: [https://fintrack-mu-bay.vercel.app](https://fintrack-mu-bay.vercel.app)

FinTrack (KOSH-GUARD) is an institutional-grade security deposit governance and lifecycle management system designed for AICTE statutory compliance. It provides complete oversight over Fixed Deposit Receipts (FDRs), joint lien endorsements, automated maturity alerts, dual-truth banking reconciliation, and immutable cryptographic audit logging under Approval Process Handbook (APH 2024–27) standards.

---

## ⚡ Key Capabilities

- **Institutional Escrow Vault**: Real-time surveillance of multi-crore statutory security deposits with automated tenure tracking and AICTE co-sign verification.
- **Dual-Truth Reconciliation Workbench**: Cross-references institution-submitted claims against independent bank facts to eliminate forged liens and phantom deposits.
- **Forensics & ELA Analysis**: Automated document tamper detection using Error Level Analysis (ELA) and OCR text extraction.
- **Hybrid Bank Verification Protocol**: Dual verification pathways supporting **Track A (NeSL Digital e-BG)** and **Track B (Scheduled Commercial Bank Nodal Attestation)**.
- **APH Clause 6.46 Release Gate**: Multi-cell Maker-Checker-Approver release workflow with cryptographically signed, verifiable QR sanction orders.
- **WORM Cryptographic Audit Ledger**: Write-Once-Read-Many SHA-256 hash-chained immutable event blocks preventing retroactive tampering.
- **8-Scenario Interactive Simulation**: One-click sandbox to demonstrate all lifecycle workflows, escalations, and tamper detection drills.
- **Direct PC Media Upload**: High-performance multi-part media upload pipeline storing raw documents safely in local storage.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Framer Motion, Three.js / React Three Fiber, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express, TypeScript (`tsx`), Multer (PC Media Uploads)
- **Database & Storage**: Atomic Write-Ahead JSON DB (`server/data/fintrack.json`), SHA-256 WORM Cryptographic Engine
- **Build Tool**: Vite

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 2. Installation
```bash
git clone https://github.com/BhaskarShah05/Fintrack.git
cd Fintrack
npm install
```

### 3. Run Locally

#### Start the Backend Server (Port 5001)
```bash
npm run server
```

#### Start the Vite Frontend (Port 5173)
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔒 Security & Statutory Standards
- Compliant with **AICTE Approval Process Handbook (APH 2024–27)** Section 10(k), Clause 1.12, and Clause 6.46.
- Role-Based Access Control (RBAC) supporting 8 distinct administrative and institutional personas.
