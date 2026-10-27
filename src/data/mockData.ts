import { 
  Institution, 
  FDRInstrument, 
  AuditLog, 
  NotificationItem, 
  CryptographicAuditBlock 
} from '../types';
import { createAuditBlock } from '../lib/cryptoLedger';

export const INITIAL_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-1',
    code: '1-438920191',
    name: 'Delhi Technological University (Faculty of Engineering)',
    category: 'Engineering & Tech',
    state: 'Delhi',
    city: 'New Delhi',
    region: 'Northern',
    contactPerson: 'Dr. Rameshwar K. Sharma (Registrar)',
    contactEmail: 'registrar@dtu.ac.in',
    contactPhone: '+91 11 27871018',
    status: 'APPROVED',
    totalDepositedAmount: 8500000,
    activeInstrumentsCount: 3,
  },
  {
    id: 'inst-2',
    code: '1-748291043',
    name: 'College of Engineering Pune (COEP Tech University)',
    category: 'Engineering & Tech',
    state: 'Maharashtra',
    city: 'Pune',
    region: 'Western',
    contactPerson: 'Prof. Anjali Deshmukh (Finance Dean)',
    contactEmail: 'fdr.desk@coep.ac.in',
    contactPhone: '+91 20 25507000',
    status: 'APPROVED',
    totalDepositedAmount: 12000000,
    activeInstrumentsCount: 4,
  },
  {
    id: 'inst-3',
    code: '1-992014812',
    name: 'Rashtreeya Vidyalaya (RV) College of Engineering',
    category: 'Engineering & Tech',
    state: 'Karnataka',
    city: 'Bengaluru',
    region: 'South-Western',
    contactPerson: 'Sri K. Narayana Swamy (Trustee)',
    contactEmail: 'admin@rvce.edu.in',
    contactPhone: '+91 80 68188100',
    status: 'APPROVED',
    totalDepositedAmount: 6500000,
    activeInstrumentsCount: 2,
  },
  {
    id: 'inst-4',
    code: '1-610294821',
    name: 'Vellore Institute of Management Studies',
    category: 'Management',
    state: 'Tamil Nadu',
    city: 'Vellore',
    region: 'Southern',
    contactPerson: 'Dr. S. R. Ramanathan (Director)',
    contactEmail: 'accounts@vims.ac.in',
    contactPhone: '+91 416 2202011',
    status: 'PROVISIONAL',
    totalDepositedAmount: 3500000,
    activeInstrumentsCount: 1,
  },
  {
    id: 'inst-5',
    code: '1-558291048',
    name: 'Bengal College of Pharmaceutical Sciences',
    category: 'Pharmacy',
    state: 'West Bengal',
    city: 'Durgapur',
    region: 'Eastern',
    contactPerson: 'Mr. Prabal Banerjee (Principal)',
    contactEmail: 'principal@bcps.edu.in',
    contactPhone: '+91 343 2503344',
    status: 'NOTICE_SERVED',
    totalDepositedAmount: 2500000,
    activeInstrumentsCount: 1,
  },
  {
    id: 'inst-6',
    code: '1-889102431',
    name: 'Malaviya National Institute of Technology (MNIT)',
    category: 'Engineering & Tech',
    state: 'Rajasthan',
    city: 'Jaipur',
    region: 'Northern',
    contactPerson: 'Prof. K. P. Singh (Dean Academics)',
    contactEmail: 'registrar@mnit.ac.in',
    contactPhone: '+91 141 2529087',
    status: 'APPROVED',
    totalDepositedAmount: 10000000,
    activeInstrumentsCount: 2,
  }
];

// --- AICTE CURATED BANK NODAL DIRECTORY (Slide 4 & 5) ---
export interface BankNodalContact {
  bankName: string;
  officialDomain: string;
  nodalOfficerName: string;
  nodalEmail: string;
  phone: string;
  ifscPrefix: string;
  supportsNeSLTrackA: boolean;
  status: 'ACTIVE' | 'INTEGRATED' | 'PILOT';
}

export const BANK_NODAL_DIRECTORY: BankNodalContact[] = [
  {
    bankName: 'State Bank of India',
    officialDomain: 'sbi.co.in',
    nodalOfficerName: 'Shri Arvind R. Kulkarni (AGM - Institutional Deposits)',
    nodalEmail: 'agm.gov@sbi.co.in',
    phone: '+91 22 22740500',
    ifscPrefix: 'SBIN',
    supportsNeSLTrackA: true,
    status: 'INTEGRATED'
  },
  {
    bankName: 'Punjab National Bank',
    officialDomain: 'pnbindia.in',
    nodalOfficerName: 'Ms. Sunita Mathur (Chief Manager - Escrow)',
    nodalEmail: 'nodal.aicte@pnbindia.in',
    phone: '+91 11 26102300',
    ifscPrefix: 'PUNB',
    supportsNeSLTrackA: true,
    status: 'INTEGRATED'
  },
  {
    bankName: 'Canara Bank',
    officialDomain: 'canarabank.com',
    nodalOfficerName: 'Sri Raghavan Venkat (DGM - Corporate Desk)',
    nodalEmail: 'aicte.cell@canarabank.com',
    phone: '+91 80 22221581',
    ifscPrefix: 'CNRB',
    supportsNeSLTrackA: true,
    status: 'ACTIVE'
  },
  {
    bankName: 'Bank of Baroda',
    officialDomain: 'bankofbaroda.co.in',
    nodalOfficerName: 'Shri Dinesh Parekh (Nodal Lead)',
    nodalEmail: 'govt.business@bankofbaroda.co.in',
    phone: '+91 265 2316012',
    ifscPrefix: 'BARB',
    supportsNeSLTrackA: true,
    status: 'ACTIVE'
  },
  {
    bankName: 'HDFC Bank',
    officialDomain: 'hdfcbank.com',
    nodalOfficerName: 'Mr. Rohan Mehta (Vice President - Institutional)',
    nodalEmail: 'aicte.escrow@hdfcbank.com',
    phone: '+91 22 66521000',
    ifscPrefix: 'HDFC',
    supportsNeSLTrackA: false, // Fallback to Track B
    status: 'PILOT'
  },
  {
    bankName: 'ICICI Bank',
    officialDomain: 'icicibank.com',
    nodalOfficerName: 'Ms. Pooja Singhania (Head - Govt Banking)',
    nodalEmail: 'govt.cell@icicibank.com',
    phone: '+91 22 26531414',
    ifscPrefix: 'ICIC',
    supportsNeSLTrackA: true,
    status: 'ACTIVE'
  }
];

export const INITIAL_INSTRUMENTS: FDRInstrument[] = [
  {
    id: 'fdr-101',
    institutionId: 'inst-1',
    institutionName: 'Delhi Technological University (Faculty of Engineering)',
    institutionCode: '1-438920191',
    instrumentType: 'JOINT_FDR_AICTE',
    referenceNumber: 'SBI-ND-2021-984022',
    bankName: 'State Bank of India',
    branchName: 'Bawana Road, Shahbad Daulatpur Branch',
    ifscCode: 'SBIN0010446',
    amount: 3500000,
    currency: 'INR',
    issueDate: '2021-04-10',
    maturityDate: '2026-11-15', // Expiring in ~20 days!
    interestRate: 7.10,
    tenureYears: 5,
    purpose: 'New Institute Establishment',
    jointLienAICTE: true,
    autoRenewalClause: true,
    workflowStatus: 'RENEWAL_DUE',
    verificationStatus: 'VERIFIED',
    verificationTrack: 'TRACK_A_NESL',
    documentName: 'SBI_FDR_35L_DTU_Lien_Marked.pdf',
    documentSize: '1.8 MB',
    documentType: 'PDF',
    sampleDocumentType: 'sbi',
    extractedData: {
      bankName: 'State Bank of India',
      referenceNumber: 'SBI-ND-2021-984022',
      amount: 3500000,
      currency: 'INR',
      issueDate: '2021-04-10',
      maturityDate: '2026-11-15',
      interestRate: 7.10,
      jointLienAICTE: true,
      confidenceScore: 98,
      fieldConfidence: {
        referenceNumber: 99.4,
        amount: 99.8,
        bankName: 98.7,
        dates: 97.5,
        jointLienClause: 96.9
      },
      discrepancies: []
    },
    institutionClaim: {
      submittedBy: 'Dr. Rameshwar K. Sharma (Registrar)',
      submissionTimestamp: '2021-04-12 10:15:00',
      referenceNumber: 'SBI-ND-2021-984022',
      amount: 3500000,
      bankName: 'State Bank of India',
      branchName: 'Bawana Road Branch',
      ifsc: 'SBIN0010446',
      issueDate: '2021-04-10',
      maturityDate: '2026-11-15',
      jointLienClaimed: true,
      documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    bankFact: {
      verified: true,
      verifierId: 'BANK-OFF-SBI-099',
      verifierName: 'Arvind R. Kulkarni (AGM)',
      verifierEmail: 'agm.gov@sbi.co.in',
      bankDomain: 'sbi.co.in',
      isDomainVerified: true,
      verificationMethod: 'TRACK_A_NESL',
      confirmedRefNumber: 'SBI-ND-2021-984022',
      confirmedAmount: 3500000,
      confirmedMaturityDate: '2026-11-15',
      confirmedLienAICTE: true,
      evidenceRef: 'NESL-CERT-2021-IN-994821',
      timestamp: '2021-04-20 14:10:00',
      status: 'CONFIRMED',
      notes: 'NeSL e-BG digital registry certificate cryptographically verified against SBI core treasury.'
    },
    dualTruth: {
      fdrNoMatch: true,
      amountMatch: true,
      bankMatch: true,
      maturityMatch: true,
      lienMatch: true,
      reconciliationState: 'VERIFIED',
      discrepancyDetails: []
    },
    forensicsMetadata: {
      producer: 'iText 7.1.15 ©2000-2021 iText Group NV',
      creator: 'SBI Core Banking Document Generator v4.2',
      creationDate: '2021-04-10T11:42:10+05:30',
      modDate: '2021-04-10T11:42:10+05:30',
      isSigned: true,
      fileSignatureValid: true,
      anomalies: []
    },
    elaAnalysis: {
      tamperScore: 2, // very low risk
      suspiciousRegionsCount: 0,
      flaggedAreas: [],
      elaIndicator: 'LOW_RISK',
      compressionAnomalyDetected: false
    },
    duplicateCheck: {
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      isExactDuplicate: false,
      levenshteinSimilarity: 0
    },
    maturityAlerts: [
      {
        threshold: 'T-90',
        triggerDate: '2026-08-17',
        deliveryStatus: 'SENT',
        deliveryChannel: 'EMAIL',
        acknowledgedAt: '2026-08-18 10:20',
        acknowledgedBy: 'Dr. Rameshwar K. Sharma',
        actionTaken: 'EXPLAINED',
        escalationTier: 'SCRUTINY_OFFICER',
        escalationOverdue: false
      },
      {
        threshold: 'T-60',
        triggerDate: '2026-09-16',
        deliveryStatus: 'SENT',
        deliveryChannel: 'SMS',
        acknowledgedAt: '2026-09-17 09:45',
        acknowledgedBy: 'Dr. Rameshwar K. Sharma',
        actionTaken: 'NONE',
        escalationTier: 'SECTION_OFFICER',
        escalationOverdue: false
      },
      {
        threshold: 'T-30',
        triggerDate: '2026-10-16',
        deliveryStatus: 'SENT',
        deliveryChannel: 'WHATSAPP',
        acknowledgedAt: '2026-10-17 11:30',
        acknowledgedBy: 'Dr. Rameshwar K. Sharma',
        actionTaken: 'NONE',
        escalationTier: 'SECTION_OFFICER',
        escalationOverdue: true
      },
      {
        threshold: 'T-7',
        triggerDate: '2026-11-08',
        deliveryStatus: 'PENDING',
        deliveryChannel: 'EMAIL',
        actionTaken: 'NONE',
        escalationTier: 'BUREAU_HEAD',
        escalationOverdue: false
      }
    ],
    reviewObservations: [
      {
        id: 'rev-1',
        reviewerName: 'Er. Alok Nath (Regional Officer - North)',
        reviewerRole: 'SCRUTINY_OFFICER',
        status: 'VERIFIED',
        comment: 'Verified joint lien lien marked to AICTE New Delhi as per APH 2021 Appendix 14. Document sealed with branch manager signature.',
        timestamp: '2021-04-22 14:30',
        decision: 'APPROVED'
      }
    ],
    createdAt: '2021-04-12T10:00:00Z',
    updatedAt: '2026-10-20T09:15:00Z'
  },
  {
    id: 'fdr-102',
    institutionId: 'inst-2',
    institutionName: 'College of Engineering Pune (COEP Tech University)',
    institutionCode: '1-748291043',
    instrumentType: 'FIXED_DEPOSIT_RECEIPT',
    referenceNumber: 'BOB-PUN-88492019',
    bankName: 'Bank of Baroda',
    branchName: 'Shivajinagar Premier Branch, Pune',
    ifscCode: 'BARB0SHIVAJ',
    amount: 5000000,
    currency: 'INR',
    issueDate: '2023-08-14',
    maturityDate: '2028-08-14',
    interestRate: 7.25,
    tenureYears: 5,
    purpose: 'New Technical Course Addition',
    jointLienAICTE: true,
    autoRenewalClause: true,
    workflowStatus: 'VERIFIED',
    verificationStatus: 'VERIFIED',
    verificationTrack: 'TRACK_B_NODAL_ATTESTATION',
    documentName: 'BankOfBaroda_50L_JointDeposit_COEP.pdf',
    documentSize: '2.4 MB',
    documentType: 'PDF',
    sampleDocumentType: 'canara',
    extractedData: {
      bankName: 'Bank of Baroda',
      referenceNumber: 'BOB-PUN-88492019',
      amount: 5000000,
      currency: 'INR',
      issueDate: '2023-08-14',
      maturityDate: '2028-08-14',
      interestRate: 7.25,
      jointLienAICTE: true,
      confidenceScore: 96,
      fieldConfidence: {
        referenceNumber: 97.8,
        amount: 99.2,
        bankName: 98.1,
        dates: 95.4,
        jointLienClause: 96.0
      },
      discrepancies: []
    },
    institutionClaim: {
      submittedBy: 'Prof. Anjali Deshmukh (Finance Dean)',
      submissionTimestamp: '2023-08-16 11:00:00',
      referenceNumber: 'BOB-PUN-88492019',
      amount: 5000000,
      bankName: 'Bank of Baroda',
      branchName: 'Shivajinagar Branch',
      ifsc: 'BARB0SHIVAJ',
      issueDate: '2023-08-14',
      maturityDate: '2028-08-14',
      jointLienClaimed: true,
      documentHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
    },
    bankFact: {
      verified: true,
      verifierId: 'BOB-NODAL-441',
      verifierName: 'Dinesh Parekh (Lead Nodal)',
      verifierEmail: 'govt.business@bankofbaroda.co.in',
      bankDomain: 'bankofbaroda.co.in',
      isDomainVerified: true,
      verificationMethod: 'TRACK_B_NODAL_ATTESTATION',
      confirmedRefNumber: 'BOB-PUN-88492019',
      confirmedAmount: 5000000,
      confirmedMaturityDate: '2028-08-14',
      confirmedLienAICTE: true,
      evidenceRef: 'BOB-CONF-LTR-2023-PUN-88',
      timestamp: '2023-08-24 16:30:00',
      status: 'CONFIRMED',
      notes: 'Attested by Bank of Baroda authorized Nodal Desk via AICTE single-use cryptographic token.'
    },
    dualTruth: {
      fdrNoMatch: true,
      amountMatch: true,
      bankMatch: true,
      maturityMatch: true,
      lienMatch: true,
      reconciliationState: 'VERIFIED',
      discrepancyDetails: []
    },
    forensicsMetadata: {
      producer: 'Adobe PDF Library 15.0',
      creator: 'Bank of Baroda Document Suite',
      creationDate: '2023-08-14T10:15:00+05:30',
      modDate: '2023-08-14T10:15:00+05:30',
      isSigned: true,
      fileSignatureValid: true,
      anomalies: []
    },
    elaAnalysis: {
      tamperScore: 1,
      suspiciousRegionsCount: 0,
      flaggedAreas: [],
      elaIndicator: 'LOW_RISK',
      compressionAnomalyDetected: false
    },
    duplicateCheck: {
      sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      isExactDuplicate: false,
      levenshteinSimilarity: 0
    },
    reviewObservations: [
      {
        id: 'rev-2',
        reviewerName: 'Smt. Kavita R. Rao (Deputy Director)',
        reviewerRole: 'SECTION_OFFICER',
        status: 'VERIFIED',
        comment: 'Satisfactory confirmation received via authorized bank branch verification letter.',
        timestamp: '2023-08-25 11:20',
        decision: 'APPROVED'
      }
    ],
    createdAt: '2023-08-16T11:00:00Z',
    updatedAt: '2024-01-05T12:00:00Z'
  },
  {
    id: 'fdr-103',
    institutionId: 'inst-4',
    institutionName: 'Vellore Institute of Management Studies',
    institutionCode: '1-610294821',
    instrumentType: 'FIXED_DEPOSIT_RECEIPT',
    referenceNumber: 'HDFC-VLR-0091823',
    bankName: 'HDFC Bank',
    branchName: 'Katpadi Main Road, Vellore',
    ifscCode: 'HDFC0000428',
    amount: 3500000,
    currency: 'INR',
    issueDate: '2026-10-01',
    maturityDate: '2031-10-01',
    interestRate: 7.40,
    tenureYears: 5,
    purpose: 'Intake Expansion',
    jointLienAICTE: false, // Discrepancy!
    autoRenewalClause: false,
    workflowStatus: 'DISCREPANCY_FLAGGED',
    verificationStatus: 'DISCREPANCY_FLAGGED',
    verificationTrack: 'TRACK_B_NODAL_ATTESTATION',
    documentName: 'HDFC_Receipt_Scanned_Upload.pdf',
    documentSize: '1.2 MB',
    documentType: 'PDF',
    sampleDocumentType: 'hdfc',
    extractedData: {
      bankName: 'HDFC Bank Ltd',
      referenceNumber: 'HDFC-VLR-0091823',
      amount: 3500000,
      currency: 'INR',
      issueDate: '2026-10-01',
      maturityDate: '2031-10-01',
      interestRate: 7.40,
      jointLienAICTE: false,
      confidenceScore: 91,
      fieldConfidence: {
        referenceNumber: 94.2,
        amount: 98.1,
        bankName: 96.5,
        dates: 92.0,
        jointLienClause: 48.0 // Low confidence on statutory clause!
      },
      discrepancies: [
        'Missing mandatory joint lien clause in favor of Member Secretary, AICTE New Delhi',
        'Auto-renewal endorsement missing from bank remarks clause',
        'Bank Fact shows plain commercial deposit, not Joint Escrow'
      ]
    },
    institutionClaim: {
      submittedBy: 'Dr. S. R. Ramanathan (Director)',
      submissionTimestamp: '2026-10-05 14:30:00',
      referenceNumber: 'HDFC-VLR-0091823',
      amount: 3500000,
      bankName: 'HDFC Bank',
      branchName: 'Katpadi Branch',
      ifsc: 'HDFC0000428',
      issueDate: '2026-10-01',
      maturityDate: '2031-10-01',
      jointLienClaimed: true, // College claimed it had lien
      documentHash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d'
    },
    bankFact: {
      verified: true,
      verifierId: 'HDFC-NODAL-902',
      verifierName: 'Rohan Mehta (VP Institutional)',
      verifierEmail: 'aicte.escrow@hdfcbank.com',
      bankDomain: 'hdfcbank.com',
      isDomainVerified: true,
      verificationMethod: 'TRACK_B_NODAL_ATTESTATION',
      confirmedRefNumber: 'HDFC-VLR-0091823',
      confirmedAmount: 3500000,
      confirmedMaturityDate: '2031-10-01',
      confirmedLienAICTE: false, // Bank confirmed NO lien marked!
      evidenceRef: 'HDFC-DOSSIER-VLR-8819',
      timestamp: '2026-10-18 15:30:00',
      status: 'DISCREPANCY',
      notes: 'Customer opened general institutional term deposit. Joint lien clause favoring Member Secretary AICTE was NOT registered in CBS.'
    },
    dualTruth: {
      fdrNoMatch: true,
      amountMatch: true,
      bankMatch: true,
      maturityMatch: true,
      lienMatch: false, // MISMATCH!
      reconciliationState: 'DISCREPANCY',
      discrepancyDetails: [
        'CRITICAL: Institution claimed Joint Lien with AICTE, but HDFC Bank attested lien clause is NOT marked in CBS.',
        'APH 2024-27 Clause 1.12 Violation: Non-compliant deposit structure.'
      ]
    },
    forensicsMetadata: {
      producer: 'PDFSharp 1.50.5147',
      creator: 'Scanned Document Tool',
      creationDate: '2026-10-02T16:20:00+05:30',
      modDate: '2026-10-04T18:11:00+05:30',
      isSigned: false,
      fileSignatureValid: false,
      anomalies: [
        'ModDate is 2 days after creation date with different Producer signature',
        'Digital signature tag missing from document trailer'
      ]
    },
    elaAnalysis: {
      tamperScore: 68, // elevated risk
      suspiciousRegionsCount: 2,
      flaggedAreas: ['Remarks Section line 4', 'Branch stamp edge compression variance'],
      elaIndicator: 'SUSPICIOUS_ARTIFACTS',
      compressionAnomalyDetected: true
    },
    duplicateCheck: {
      sha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
      isExactDuplicate: false,
      levenshteinSimilarity: 12
    },
    reviewObservations: [
      {
        id: 'rev-3',
        reviewerName: 'Dr. T. Sundaram (Assistant Director - South)',
        reviewerRole: 'SCRUTINY_OFFICER',
        status: 'DISCREPANCY_FLAGGED',
        comment: 'AICTE lien endorsement clause is missing from FDR physical certificate. Bank confirmation confirms no lien marked. Notice served under APH Cl. 1.12.',
        timestamp: '2026-10-18 16:45',
        decision: 'CORRECTION_REQUIRED'
      }
    ],
    createdAt: '2026-10-05T14:30:00Z',
    updatedAt: '2026-10-18T16:45:00Z'
  },
  {
    id: 'fdr-104',
    institutionId: 'inst-3',
    institutionName: 'Rashtreeya Vidyalaya (RV) College of Engineering',
    institutionCode: '1-992014812',
    instrumentType: 'JOINT_FDR_AICTE',
    referenceNumber: 'CAN-BLR-2018-449102',
    bankName: 'Canara Bank',
    branchName: 'Mysore Road Corporate Branch, Bengaluru',
    ifscCode: 'CNRB0001824',
    amount: 4000000,
    currency: 'INR',
    issueDate: '2018-09-10',
    maturityDate: '2026-09-10', // 8-year statutory tenure matured
    interestRate: 6.85,
    tenureYears: 8,
    purpose: 'New Institute Establishment',
    jointLienAICTE: true,
    autoRenewalClause: false,
    workflowStatus: 'RELEASE_REQUESTED',
    verificationStatus: 'VERIFIED',
    verificationTrack: 'TRACK_A_NESL',
    documentName: 'Canara_8Yr_Matured_Receipt.pdf',
    documentSize: '3.1 MB',
    documentType: 'PDF',
    sampleDocumentType: 'canara',
    extractedData: {
      bankName: 'Canara Bank',
      referenceNumber: 'CAN-BLR-2018-449102',
      amount: 4000000,
      currency: 'INR',
      issueDate: '2018-09-10',
      maturityDate: '2026-09-10',
      interestRate: 6.85,
      jointLienAICTE: true,
      confidenceScore: 99,
      fieldConfidence: {
        referenceNumber: 99.8,
        amount: 99.9,
        bankName: 99.5,
        dates: 99.1,
        jointLienClause: 99.0
      },
      discrepancies: []
    },
    institutionClaim: {
      submittedBy: 'Sri K. Narayana Swamy (Trustee)',
      submissionTimestamp: '2018-09-12 09:00:00',
      referenceNumber: 'CAN-BLR-2018-449102',
      amount: 4000000,
      bankName: 'Canara Bank',
      branchName: 'Mysore Road Branch',
      ifsc: 'CNRB0001824',
      issueDate: '2018-09-10',
      maturityDate: '2026-09-10',
      jointLienClaimed: true,
      documentHash: 'c775e7b757ede630cd0aa1113bd102661ab38829ca52a6422ab782862f268646'
    },
    bankFact: {
      verified: true,
      verifierId: 'CANARA-NODAL-102',
      verifierName: 'Raghavan Venkat (DGM)',
      verifierEmail: 'aicte.cell@canarabank.com',
      bankDomain: 'canarabank.com',
      isDomainVerified: true,
      verificationMethod: 'TRACK_A_NESL',
      confirmedRefNumber: 'CAN-BLR-2018-449102',
      confirmedAmount: 4000000,
      confirmedMaturityDate: '2026-09-10',
      confirmedLienAICTE: true,
      evidenceRef: 'NESL-CAN-2018-BLR-4491',
      timestamp: '2018-09-20 12:00:00',
      status: 'CONFIRMED'
    },
    dualTruth: {
      fdrNoMatch: true,
      amountMatch: true,
      bankMatch: true,
      maturityMatch: true,
      lienMatch: true,
      reconciliationState: 'VERIFIED',
      discrepancyDetails: []
    },
    forensicsMetadata: {
      producer: 'Canara Document Engine v2.1',
      creator: 'Canara Core Banking Suite',
      creationDate: '2018-09-10T14:22:00+05:30',
      modDate: '2018-09-10T14:22:00+05:30',
      isSigned: true,
      fileSignatureValid: true,
      anomalies: []
    },
    elaAnalysis: {
      tamperScore: 3,
      suspiciousRegionsCount: 0,
      flaggedAreas: [],
      elaIndicator: 'LOW_RISK',
      compressionAnomalyDetected: false
    },
    duplicateCheck: {
      sha256: 'c775e7b757ede630cd0aa1113bd102661ab38829ca52a6422ab782862f268646',
      isExactDuplicate: false,
      levenshteinSimilarity: 0
    },
    releaseRequest: {
      id: 'rel-901',
      instrumentId: 'fdr-104',
      requestedBy: 'Sri K. Narayana Swamy (Trustee)',
      institutionName: 'Rashtreeya Vidyalaya (RV) College of Engineering',
      requestDate: '2026-09-25',
      reason: 'Tenure Completion (8 Years)',
      status: 'PENDING_COMPETENT_AUTHORITY',
      nocDocumentUrl: 'RVCE_AICTE_NOC_Inspection_Report.pdf',
      boardResolutionRef: 'RV-TRUST-RES-2026/088',
      reviewedBy: 'Er. Rajesh K. Varma (Regional Officer)',
      reviewedAt: '2026-10-04 10:15',
      competentAuthorityDecision: 'Inspection report verified, all academic audit criteria satisfied under APH Cl. 6.46. Awaiting final Bureau Head sign-off.'
    },
    multiCellClearances: {
      grievanceCell: {
        cleared: true,
        clearedBy: 'Dr. Neeta Bansal (Grievance Officer)',
        timestamp: '2026-09-28 14:15',
        referenceNumber: 'GRV-CLR-2026-904',
        notes: 'Zero pending grievances regarding student fees or capitation.'
      },
      vigilanceCell: {
        cleared: true,
        clearedBy: 'Shri A. P. Mathur (Chief Vigilance Officer)',
        timestamp: '2026-09-30 11:00',
        referenceNumber: 'VIG-NOC-2026-118',
        notes: 'No vigilance inquiry or court stay active against college management.'
      },
      financeBureau: {
        cleared: true,
        clearedBy: 'Smt. Renuka Sundaram (Finance Officer)',
        timestamp: '2026-10-02 16:30',
        referenceNumber: 'FIN-AUD-2026-552',
        notes: 'Council fees and regulatory levies fully reconciled.'
      },
      legalHold: {
        hasHold: false
      },
      aphChecklist: {
        requestLetter: true,
        affidavitStampPaper: true,
        originalDepositProof: true,
        latestLoAEoA: true
      },
      tierApprovals: {
        maker: {
          approved: true,
          officerName: 'Er. Rajesh K. Varma (Regional Scrutiny Officer)',
          timestamp: '2026-10-04 10:15',
          reasonCode: 'APH_6_46_TENURE_8YR_VALIDATED',
          notes: 'Maker scrutiny complete: 8-year lock-in period successfully completed. Clearances verified.'
        },
        checker: {
          approved: true,
          officerName: 'Smt. Sangeeta Nair (Section Officer)',
          timestamp: '2026-10-10 15:45',
          reasonCode: 'CHECKER_COMPLIANCE_CONFIRMED',
          notes: 'Checker review complete: All 3 cell NOCs matched against council records.'
        },
        approver: {
          approved: false, // Ready for final Bureau Head sign-off!
          officerName: 'Prof. T. G. Sitharam (Bureau Head / Competent Authority)'
        }
      },
      qrCodePayload: 'AICTE-SANCTION:CAN-BLR-2018-449102:INST-3:INR-4000000:APH-CL-6.46:MAKER-VERIFIED:CHECKER-CLEARED',
      sanctionOrderRef: 'AICTE/RO-SW/REL/2026/00918'
    },
    reviewObservations: [
      {
        id: 'rev-4',
        reviewerName: 'Er. Rajesh K. Varma (Regional Officer)',
        reviewerRole: 'SCRUTINY_OFFICER',
        status: 'RELEASE_REQUESTED',
        comment: '8-year lock-in period successfully completed. Multi-cell clearances active. Ready for final sanction order.',
        timestamp: '2026-10-04 10:15',
        decision: 'APPROVED'
      }
    ],
    createdAt: '2018-09-12T09:00:00Z',
    updatedAt: '2026-10-04T10:15:00Z'
  },
  {
    id: 'fdr-105',
    institutionId: 'inst-5',
    institutionName: 'Bengal College of Pharmaceutical Sciences',
    institutionCode: '1-558291048',
    instrumentType: 'FIXED_DEPOSIT_RECEIPT',
    referenceNumber: 'PNB-DGP-3301982',
    bankName: 'Punjab National Bank',
    branchName: 'City Centre Branch, Durgapur',
    ifscCode: 'PUNB0182900',
    amount: 2500000,
    currency: 'INR',
    issueDate: '2026-10-20',
    maturityDate: '2031-10-20',
    interestRate: 7.20,
    tenureYears: 5,
    purpose: 'Endowment Fund',
    jointLienAICTE: true,
    autoRenewalClause: true,
    workflowStatus: 'SUBMITTED',
    verificationStatus: 'PENDING',
    verificationTrack: 'TRACK_B_NODAL_ATTESTATION',
    documentName: 'PNB_Deposit_Receipt_Endowment.pdf',
    documentSize: '1.5 MB',
    documentType: 'PDF',
    sampleDocumentType: 'pnb',
    extractedData: {
      bankName: 'Punjab National Bank',
      referenceNumber: 'PNB-DGP-3301982',
      amount: 2500000,
      currency: 'INR',
      issueDate: '2026-10-20',
      maturityDate: '2031-10-20',
      interestRate: 7.20,
      jointLienAICTE: true,
      confidenceScore: 94,
      fieldConfidence: {
        referenceNumber: 96.1,
        amount: 98.4,
        bankName: 95.0,
        dates: 94.2,
        jointLienClause: 93.8
      },
      discrepancies: []
    },
    institutionClaim: {
      submittedBy: 'Mr. Prabal Banerjee (Principal)',
      submissionTimestamp: '2026-10-22 15:20:00',
      referenceNumber: 'PNB-DGP-3301982',
      amount: 2500000,
      bankName: 'Punjab National Bank',
      branchName: 'City Centre Branch',
      ifsc: 'PUNB0182900',
      issueDate: '2026-10-20',
      maturityDate: '2031-10-20',
      jointLienClaimed: true,
      documentHash: '01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b'
    },
    bankFact: {
      verified: false,
      verifierId: '',
      verifierName: '',
      verifierEmail: 'nodal.aicte@pnbindia.in',
      bankDomain: 'pnbindia.in',
      isDomainVerified: true,
      verificationMethod: 'TRACK_B_NODAL_ATTESTATION',
      confirmedRefNumber: '',
      confirmedAmount: 0,
      confirmedMaturityDate: '',
      confirmedLienAICTE: false,
      evidenceRef: '',
      timestamp: '',
      status: 'PENDING',
      notes: 'Awaiting Bank Nodal Officer attestation via time-bound verification portal.'
    },
    dualTruth: {
      fdrNoMatch: false,
      amountMatch: false,
      bankMatch: false,
      maturityMatch: false,
      lienMatch: false,
      reconciliationState: 'BANK_VERIFICATION_PENDING',
      discrepancyDetails: ['Bank Nodal confirmation pending. Verification dossier dispatched to PNB Nodal Desk.']
    },
    forensicsMetadata: {
      producer: 'PNB Core Printing Module',
      creator: 'PNB Finacle Suite',
      creationDate: '2026-10-20T11:00:00+05:30',
      modDate: '2026-10-20T11:00:00+05:30',
      isSigned: true,
      fileSignatureValid: true,
      anomalies: []
    },
    elaAnalysis: {
      tamperScore: 4,
      suspiciousRegionsCount: 0,
      flaggedAreas: [],
      elaIndicator: 'LOW_RISK',
      compressionAnomalyDetected: false
    },
    duplicateCheck: {
      sha256: '01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b',
      isExactDuplicate: false,
      levenshteinSimilarity: 0
    },
    reviewObservations: [],
    createdAt: '2026-10-22T15:20:00Z',
    updatedAt: '2026-10-22T15:20:00Z'
  },
  // --- SCENARIO 7 INSTRUMENT: CROSS-INSTITUTION DUPLICATE REUSE ATTEMPT ---
  {
    id: 'fdr-106',
    institutionId: 'inst-5',
    institutionName: 'Bengal College of Pharmaceutical Sciences',
    institutionCode: '1-558291048',
    instrumentType: 'FIXED_DEPOSIT_RECEIPT',
    referenceNumber: 'BOB-PUN-88492019-X', // Attempting to reuse COEP deposit with slight modification!
    bankName: 'Bank of Baroda',
    branchName: 'Shivajinagar Premier Branch, Pune',
    ifscCode: 'BARB0SHIVAJ',
    amount: 5000000,
    currency: 'INR',
    issueDate: '2023-08-14',
    maturityDate: '2028-08-14',
    interestRate: 7.25,
    tenureYears: 5,
    purpose: 'New Technical Course Addition',
    jointLienAICTE: true,
    autoRenewalClause: true,
    workflowStatus: 'DISCREPANCY_FLAGGED',
    verificationStatus: 'DISCREPANCY_FLAGGED',
    verificationTrack: 'TRACK_B_NODAL_ATTESTATION',
    documentName: 'Suspect_Reused_BOB_Deposit.pdf',
    documentSize: '2.1 MB',
    documentType: 'PDF',
    sampleDocumentType: 'canara',
    extractedData: {
      bankName: 'Bank of Baroda',
      referenceNumber: 'BOB-PUN-88492019',
      amount: 5000000,
      currency: 'INR',
      issueDate: '2023-08-14',
      maturityDate: '2028-08-14',
      interestRate: 7.25,
      jointLienAICTE: true,
      confidenceScore: 82,
      fieldConfidence: {
        referenceNumber: 85.0,
        amount: 98.0,
        bankName: 96.0,
        dates: 94.0,
        jointLienClause: 90.0
      },
      discrepancies: [
        'SECURITY ALERT: Exact instrument reference number registered under COEP Pune (1-748291043)',
        'Levenshtein fuzzy matching similarity score: 94.7% with active deposit',
        'ELA Analysis detected altered font rasterization on Institution Beneficiary line'
      ]
    },
    institutionClaim: {
      submittedBy: 'Unknown Liaison Agent',
      submissionTimestamp: '2026-10-24 16:40:00',
      referenceNumber: 'BOB-PUN-88492019-X',
      amount: 5000000,
      bankName: 'Bank of Baroda',
      branchName: 'Shivajinagar Branch',
      ifsc: 'BARB0SHIVAJ',
      issueDate: '2023-08-14',
      maturityDate: '2028-08-14',
      jointLienClaimed: true,
      documentHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a' // EXACT HASH MATCH WITH COEP!
    },
    bankFact: {
      verified: true,
      verifierId: 'AICTE-CENTRAL-SURVEILLANCE',
      verifierName: 'Central Duplicate Detection Engine',
      verifierEmail: 'surveillance@aicte-india.org',
      bankDomain: 'aicte-india.org',
      isDomainVerified: true,
      verificationMethod: 'TRACK_B_NODAL_ATTESTATION',
      confirmedRefNumber: 'BOB-PUN-88492019',
      confirmedAmount: 5000000,
      confirmedMaturityDate: '2028-08-14',
      confirmedLienAICTE: true,
      evidenceRef: 'NATIONAL-DUPLICATE-TRIPWIRE-2026-091',
      timestamp: '2026-10-24 16:41:00',
      status: 'REJECTED',
      notes: 'Cross-institution duplicate instrument blocked. Instrument is actively pledged by COEP Tech University.'
    },
    dualTruth: {
      fdrNoMatch: false,
      amountMatch: true,
      bankMatch: true,
      maturityMatch: true,
      lienMatch: true,
      reconciliationState: 'DISCREPANCY',
      discrepancyDetails: [
        'SECURITY EXCEPTION: Cross-Institution Duplicate Detected.',
        'Deposit BOB-PUN-88492019 already pledged by College of Engineering Pune.',
        'SHA-256 binary hash collision detected in central document vault.'
      ]
    },
    forensicsMetadata: {
      producer: 'Modified via GIMP 2.10',
      creator: 'Scan Modify Tool',
      creationDate: '2023-08-14T10:15:00+05:30',
      modDate: '2026-10-24T14:12:00+05:30',
      isSigned: false,
      fileSignatureValid: false,
      anomalies: [
        'ModDate is 3 years after creation date',
        'PDF Producer indicates graphic editing software (GIMP)',
        'Font encoding mismatch on College Name line'
      ]
    },
    elaAnalysis: {
      tamperScore: 92, // Severe Tampering!
      suspiciousRegionsCount: 3,
      flaggedAreas: [
        'Beneficiary College Name (High variance pixel grid)',
        'Reference suffix "-X" overlaid in different DPI',
        'Digital stamp artifact around AICTE lien mark'
      ],
      elaIndicator: 'PROBABLE_ALTERATION',
      compressionAnomalyDetected: true
    },
    duplicateCheck: {
      sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      isExactDuplicate: true,
      duplicateWithInstitutionCode: '1-748291043',
      duplicateWithInstitutionName: 'College of Engineering Pune (COEP Tech University)',
      levenshteinSimilarity: 94.7,
      nearDuplicateMatches: [
        {
          ref: 'BOB-PUN-88492019',
          inst: 'College of Engineering Pune',
          similarity: 94.7
        }
      ]
    },
    reviewObservations: [
      {
        id: 'rev-6',
        reviewerName: 'Er. Alok Nath (Regional Scrutiny Officer)',
        reviewerRole: 'SCRUTINY_OFFICER',
        status: 'DISCREPANCY_FLAGGED',
        comment: 'CRITICAL SECURITY BREACH: Cross-institution reuse detected. Show-cause notice initiated under APH Regulations. Legal hold applied.',
        timestamp: '2026-10-24 17:00',
        decision: 'INVESTIGATION_FLAGGED'
      }
    ],
    createdAt: '2026-10-24T16:40:00Z',
    updatedAt: '2026-10-24T17:00:00Z'
  },
  // --- SCENARIO 1 & 4 INSTRUMENT: MNIT DIGITAL NESL e-BG WITH RENEWAL LINEAGE ---
  {
    id: 'fdr-107',
    institutionId: 'inst-6',
    institutionName: 'Malaviya National Institute of Technology (MNIT)',
    institutionCode: '1-889102431',
    instrumentType: 'BANK_GUARANTEE',
    referenceNumber: 'NESL-eBG-2024-MNIT-0082',
    bankName: 'State Bank of India',
    branchName: 'CAG Branch, New Delhi',
    ifscCode: 'SBIN0009999',
    amount: 10000000, // 1 Crore
    currency: 'INR',
    issueDate: '2024-06-01',
    maturityDate: '2029-06-01',
    interestRate: 7.50,
    tenureYears: 5,
    purpose: 'New Institute Establishment',
    jointLienAICTE: true,
    autoRenewalClause: true,
    workflowStatus: 'VERIFIED',
    verificationStatus: 'VERIFIED',
    verificationTrack: 'TRACK_A_NESL',
    documentName: 'NeSL_Digital_eBG_10Cr_Signed.pdf',
    documentSize: '850 KB',
    documentType: 'PDF',
    sampleDocumentType: 'sbi',
    extractedData: {
      bankName: 'State Bank of India',
      referenceNumber: 'NESL-eBG-2024-MNIT-0082',
      amount: 10000000,
      currency: 'INR',
      issueDate: '2024-06-01',
      maturityDate: '2029-06-01',
      interestRate: 7.50,
      jointLienAICTE: true,
      confidenceScore: 100,
      fieldConfidence: {
        referenceNumber: 100,
        amount: 100,
        bankName: 100,
        dates: 100,
        jointLienClause: 100
      },
      discrepancies: []
    },
    institutionClaim: {
      submittedBy: 'Prof. K. P. Singh (Dean)',
      submissionTimestamp: '2024-06-02 11:20:00',
      referenceNumber: 'NESL-eBG-2024-MNIT-0082',
      amount: 10000000,
      bankName: 'State Bank of India',
      branchName: 'CAG Branch, New Delhi',
      ifsc: 'SBIN0009999',
      issueDate: '2024-06-01',
      maturityDate: '2029-06-01',
      jointLienClaimed: true,
      documentHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'
    },
    bankFact: {
      verified: true,
      verifierId: 'NESL-AUTHORITATIVE-API',
      verifierName: 'National E-Governance Services Ltd (NeSL)',
      verifierEmail: 'support@nesl.co.in',
      bankDomain: 'nesl.co.in',
      isDomainVerified: true,
      verificationMethod: 'TRACK_A_NESL',
      confirmedRefNumber: 'NESL-eBG-2024-MNIT-0082',
      confirmedAmount: 10000000,
      confirmedMaturityDate: '2029-06-01',
      confirmedLienAICTE: true,
      evidenceRef: 'NESL-TOKEN-99482104-SFMS-OK',
      timestamp: '2024-06-02 11:21:00',
      status: 'CONFIRMED',
      notes: 'Authoritative e-BG verifiable via NeSL repository. Cryptographic signature and timestamp stamped under IT Act Section 10A.'
    },
    dualTruth: {
      fdrNoMatch: true,
      amountMatch: true,
      bankMatch: true,
      maturityMatch: true,
      lienMatch: true,
      reconciliationState: 'VERIFIED',
      discrepancyDetails: []
    },
    forensicsMetadata: {
      producer: 'NeSL Digital Guarantee Engine v3.0',
      creator: 'National E-Governance Services Ltd',
      creationDate: '2024-06-01T10:00:00+05:30',
      modDate: '2024-06-01T10:00:00+05:30',
      isSigned: true,
      fileSignatureValid: true,
      anomalies: []
    },
    elaAnalysis: {
      tamperScore: 0,
      suspiciousRegionsCount: 0,
      flaggedAreas: [],
      elaIndicator: 'LOW_RISK',
      compressionAnomalyDetected: false
    },
    duplicateCheck: {
      sha256: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
      isExactDuplicate: false,
      levenshteinSimilarity: 0
    },
    previousInstrumentId: 'fdr-legacy-mnit-2019',
    renewalHistory: [
      {
        date: '2019-05-20',
        reference: 'SBI-MNIT-2014-ORIGINAL',
        amount: 8000000,
        renewalId: 'fdr-legacy-mnit-2014'
      },
      {
        date: '2024-06-01',
        reference: 'SBI-MNIT-2019-RENEWAL',
        amount: 10000000,
        renewalId: 'fdr-legacy-mnit-2019'
      }
    ],
    reviewObservations: [
      {
        id: 'rev-7',
        reviewerName: 'Er. Alok Nath (Regional Scrutiny Officer)',
        reviewerRole: 'SCRUTINY_OFFICER',
        status: 'VERIFIED',
        comment: 'NeSL e-BG digital certificate verified instantly via authoritative digital lookup. Unbroken custody since establishment (2014).',
        timestamp: '2024-06-03 09:30',
        decision: 'APPROVED'
      }
    ],
    createdAt: '2024-06-02T11:20:00Z',
    updatedAt: '2024-06-03T09:30:00Z'
  }
];

// --- INITIAL CRYPTOGRAPHIC BLOCKS (WORM Hash-Chained Audit Ledger) ---
export const INITIAL_CRYPTO_BLOCKS: CryptographicAuditBlock[] = [
  createAuditBlock(null, {
    actorName: 'SYSTEM (Genesis Guardian)',
    actorRole: 'SYSTEM',
    action: 'GENESIS_BLOCK_INITIALIZED',
    entityId: 'AICTE-CUSTODIAL-ROOT',
    details: 'WORM Vault & SHA-256 cryptographic root initialized under AICTE APH 2024-27 Guidelines.',
    timestamp: '2026-08-01 00:00:00'
  }),
  createAuditBlock(null, {
    actorName: 'Dr. Rameshwar K. Sharma',
    actorRole: 'INSTITUTION',
    action: 'FDR_SUBMISSION_LODGED',
    entityId: 'fdr-101',
    details: 'Delhi Technological University lodged SBI FDR-984022 (₹35 Lakhs) with statutory joint lien declaration.',
    timestamp: '2026-08-10 10:14:22'
  }),
  createAuditBlock(null, {
    actorName: 'AICTE PaddleOCR Engine',
    actorRole: 'AI_AGENT',
    action: 'MULTIMODAL_EXTRACTION_COMPLETED',
    entityId: 'fdr-101',
    details: 'PaddleOCR extracted 5/5 mandatory fields with 98.4% mean confidence. PyMuPDF verified valid file signature.',
    timestamp: '2026-08-10 10:15:05'
  }),
  createAuditBlock(null, {
    actorName: 'Arvind R. Kulkarni (SBI Nodal AGM)',
    actorRole: 'BANK_NODAL',
    action: 'BANK_FACT_ATTESTED_TRACK_A',
    entityId: 'fdr-101',
    details: 'State Bank of India confirmed FDR existence, ₹35L balance, 2026-11-15 maturity and AICTE Lien registration.',
    timestamp: '2026-08-12 14:30:00'
  }),
  createAuditBlock(null, {
    actorName: 'Er. Alok Nath (Scrutiny Desk)',
    actorRole: 'SCRUTINY_OFFICER',
    action: 'DUAL_TRUTH_RECONCILIATION_SEALED',
    entityId: 'fdr-101',
    details: 'Dual-Truth Engine reconciled Institution Claim against Bank Fact: 5/5 Match. No discrepancy.',
    timestamp: '2026-08-15 11:20:10'
  }),
  createAuditBlock(null, {
    actorName: 'Central Surveillance Engine',
    actorRole: 'SECURITY',
    action: 'CROSS_INSTITUTION_DUPLICATE_BLOCKED',
    entityId: 'fdr-106',
    details: 'SHA-256 fingerprint collision detected. Deposit BOB-PUN-88492019 reuse blocked from Bengal College.',
    timestamp: '2026-10-24 16:41:00'
  })
];

// Recalculate hash chain properly from block 0
export function getInitialChainedBlocks(): CryptographicAuditBlock[] {
  const blocks: CryptographicAuditBlock[] = [];
  
  const b0 = createAuditBlock(null, {
    actorName: 'SYSTEM (Genesis Guardian)',
    actorRole: 'ADMIN',
    action: 'GENESIS_BLOCK_INITIALIZED',
    entityId: 'AICTE-CUSTODIAL-ROOT',
    details: 'WORM Vault & SHA-256 cryptographic root initialized under AICTE APH 2024-27 Guidelines.',
    timestamp: '2026-08-01 00:00:00'
  });
  blocks.push(b0);

  const b1 = createAuditBlock(b0, {
    actorName: 'Dr. Rameshwar K. Sharma',
    actorRole: 'INSTITUTION',
    action: 'FDR_SUBMISSION_LODGED',
    entityId: 'fdr-101',
    details: 'Delhi Technological University lodged SBI FDR-984022 (₹35 Lakhs) with statutory joint lien declaration.',
    timestamp: '2026-08-10 10:14:22'
  });
  blocks.push(b1);

  const b2 = createAuditBlock(b1, {
    actorName: 'AICTE PaddleOCR Engine',
    actorRole: 'AUDITOR',
    action: 'MULTIMODAL_EXTRACTION_COMPLETED',
    entityId: 'fdr-101',
    details: 'PaddleOCR extracted 5/5 mandatory fields with 98.4% mean confidence. PyMuPDF verified valid file signature.',
    timestamp: '2026-08-10 10:15:05'
  });
  blocks.push(b2);

  const b3 = createAuditBlock(b2, {
    actorName: 'Arvind R. Kulkarni (SBI Nodal AGM)',
    actorRole: 'VERIFICATION_OFFICER',
    action: 'BANK_FACT_ATTESTED_TRACK_A',
    entityId: 'fdr-101',
    details: 'State Bank of India confirmed FDR existence, ₹35L balance, 2026-11-15 maturity and AICTE Lien registration.',
    timestamp: '2026-08-12 14:30:00'
  });
  blocks.push(b3);

  const b4 = createAuditBlock(b3, {
    actorName: 'Er. Alok Nath (Scrutiny Desk)',
    actorRole: 'SCRUTINY_OFFICER',
    action: 'DUAL_TRUTH_RECONCILIATION_SEALED',
    entityId: 'fdr-101',
    details: 'Dual-Truth Engine reconciled Institution Claim against Bank Fact: 5/5 Match. Sealed into custody.',
    timestamp: '2026-08-15 11:20:10'
  });
  blocks.push(b4);

  const b5 = createAuditBlock(b4, {
    actorName: 'Central Surveillance Engine',
    actorRole: 'AUDITOR',
    action: 'CROSS_INSTITUTION_DUPLICATE_BLOCKED',
    entityId: 'fdr-106',
    details: 'SHA-256 fingerprint collision detected. Deposit BOB-PUN-88492019 reuse blocked from Bengal College.',
    timestamp: '2026-10-24 16:41:00'
  });
  blocks.push(b5);

  return blocks;
}

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    actorName: 'Dr. Rameshwar K. Sharma',
    actorRole: 'INSTITUTION',
    action: 'INSTRUMENT_SUBMITTED',
    entityType: 'INSTRUMENT',
    entityId: 'fdr-101',
    details: 'Submitted SBI FDR Renewal notice for 35,00,000 INR with joint lien endorsement scan.',
    timestamp: '2026-10-20 09:15:22',
    ipAddress: '14.139.224.66'
  },
  {
    id: 'log-2',
    actorName: 'Er. Alok Nath',
    actorRole: 'OFFICIAL',
    action: 'DISCREPANCY_FLAGGED',
    entityType: 'INSTRUMENT',
    entityId: 'fdr-103',
    details: 'Flagged missing joint lien clause in favor of AICTE for Vellore Institute HDFC deposit.',
    previousValue: 'SUBMITTED',
    newValue: 'DISCREPANCY_FLAGGED',
    timestamp: '2026-10-18 16:45:10',
    ipAddress: '164.100.158.42'
  },
  {
    id: 'log-3',
    actorName: 'Sri K. Narayana Swamy',
    actorRole: 'INSTITUTION',
    action: 'RELEASE_REQUEST_FILED',
    entityType: 'RELEASE_REQUEST',
    entityId: 'rel-901',
    details: 'Filed FDR security deposit refund request upon completion of 8-year statutory tenure.',
    timestamp: '2026-09-25 11:32:04',
    ipAddress: '117.218.44.12'
  },
  {
    id: 'log-4',
    actorName: 'Central Surveillance Sentinel',
    actorRole: 'AUDITOR',
    action: 'DUPLICATE_INTERCEPTION',
    entityType: 'SYSTEM',
    entityId: 'fdr-106',
    details: 'Cross-institution duplicate instrument blocked. Exact hash match with COEP Tech University deposit.',
    timestamp: '2026-10-24 16:41:00',
    ipAddress: '10.24.1.99'
  },
  {
    id: 'log-5',
    actorName: 'Prof. T. G. Sitharam (Chairman / Supervisory)',
    actorRole: 'SUPERVISOR',
    action: 'POLICY_ESC_RULE_UPDATE',
    entityType: 'SYSTEM',
    entityId: 'SYS_POLICY_2026',
    details: 'Updated automated maturity escalation interval to T-90, T-60, T-30, and T-7 days with multi-channel delivery tracking.',
    timestamp: '2026-09-01 10:00:00',
    ipAddress: '10.24.1.18'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'FDR Renewal Due in 20 Days (T-30 SLA Escalation)',
    description: 'Delhi Technological University FDR (SBI-ND-2021-984022) matures on 15 Nov 2026. Escalated to Section Officer.',
    type: 'EXPIRY_ALERT',
    timestamp: 'Today, 09:30 AM',
    unread: true,
    instrumentId: 'fdr-101'
  },
  {
    id: 'notif-2',
    title: 'Cross-Institution Duplicate Detected',
    description: 'Security Sentinel blocked suspect re-pledge of deposit BOB-PUN-88492019. SHA-256 collision logged.',
    type: 'TAMPER_ALERT',
    timestamp: '24 Oct, 04:41 PM',
    unread: true,
    instrumentId: 'fdr-106'
  },
  {
    id: 'notif-3',
    title: 'Dual-Truth Discrepancy Action Required',
    description: 'Vellore Institute of Management FDR missing joint lien clause. Bank Fact mismatch flagged.',
    type: 'DISCREPANCY',
    timestamp: 'Yesterday, 04:45 PM',
    unread: true,
    instrumentId: 'fdr-103'
  },
  {
    id: 'notif-4',
    title: 'Multi-Cell Release Sanction Ready',
    description: 'RV College of Engineering ₹40L deposit cleared by Grievance, Vigilance & Finance. Awaiting Bureau Head seal.',
    type: 'RELEASE_FILED',
    timestamp: '3 days ago',
    unread: false,
    instrumentId: 'fdr-104'
  }
];
