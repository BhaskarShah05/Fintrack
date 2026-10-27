export type UserRole = 
  | 'INSTITUTION' 
  | 'SCRUTINY_OFFICER' 
  | 'VERIFICATION_OFFICER' 
  | 'SECTION_OFFICER' 
  | 'BUREAU_HEAD' 
  | 'FINANCE' 
  | 'AUDITOR' 
  | 'ADMIN'
  | 'OFFICIAL' // alias for Scrutiny Officer
  | 'SUPERVISOR'; // alias for Bureau Head

export interface Institution {
  id: string;
  code: string; // e.g. "1-332901928"
  name: string;
  category: 'Engineering & Tech' | 'Management' | 'Pharmacy' | 'Polytechnic';
  state: string;
  city: string;
  region: 'Northern' | 'Western' | 'Southern' | 'Eastern' | 'South-Western' | 'Central';
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  status: 'APPROVED' | 'PROVISIONAL' | 'NOTICE_SERVED';
  totalDepositedAmount: number; // in INR
  activeInstrumentsCount: number;
}

export type InstrumentStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'EXTRACTION_PENDING'
  | 'BANK_VERIFICATION_PENDING'
  | 'UNDER_VERIFICATION'
  | 'VERIFIED'
  | 'DISCREPANCY_FLAGGED'
  | 'RENEWAL_DUE'
  | 'MATURED'
  | 'RELEASE_REQUESTED'
  | 'RELEASED'
  | 'CLOSED'
  | 'LEGAL_HOLD';

export type InstrumentType = 'FIXED_DEPOSIT_RECEIPT' | 'BANK_GUARANTEE' | 'JOINT_FDR_AICTE';

export interface ExtractedOCRData {
  bankName: string;
  referenceNumber: string;
  amount: number;
  currency: string;
  issueDate: string;
  maturityDate: string;
  interestRate: number;
  jointLienAICTE: boolean;
  confidenceScore: number; // 0 - 100
  fieldConfidence?: {
    referenceNumber: number;
    amount: number;
    bankName: number;
    dates: number;
    jointLienClause: number;
  };
  discrepancies: string[];
  rawTextDigest?: string;
}

export interface ReviewObservation {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  status: InstrumentStatus;
  comment: string;
  timestamp: string;
  decision: 'APPROVED' | 'CORRECTION_REQUIRED' | 'INVESTIGATION_FLAGGED';
}

export interface RenewalRecord {
  id: string;
  previousInstrumentId: string;
  replacementInstrumentId: string;
  submissionDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  reviewer?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface ReleaseRequest {
  id: string;
  instrumentId: string;
  requestedBy: string;
  institutionName: string;
  requestDate: string;
  reason: 'Course Closure with Prior Approval' | 'Tenure Completion (8 Years)' | 'Excess Deposit Adjustment' | 'Institution Voluntary Withdrawal';
  status: 'PENDING_OFFICIAL_REVIEW' | 'PENDING_COMPETENT_AUTHORITY' | 'APPROVED' | 'REJECTED';
  nocDocumentUrl?: string;
  boardResolutionRef?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  competentAuthorityDecision?: string;
  releaseOrderNumber?: string;
  disbursedDate?: string;
}

// --- DUAL-TRUTH RECONCILIATION ENGINE (Cap #1, #3) ---
export interface InstitutionClaim {
  submittedBy: string;
  submissionTimestamp: string;
  referenceNumber: string;
  amount: number;
  bankName: string;
  branchName: string;
  ifsc: string;
  issueDate: string;
  maturityDate: string;
  jointLienClaimed: boolean;
  documentHash: string;
}

export interface BankFact {
  verified: boolean;
  verifierId: string;
  verifierName: string;
  verifierEmail: string;
  bankDomain: string;
  isDomainVerified: boolean;
  verificationMethod: 'TRACK_A_NESL' | 'TRACK_B_NODAL_ATTESTATION' | 'MANUAL_OFFICER';
  confirmedRefNumber: string;
  confirmedAmount: number;
  confirmedMaturityDate: string;
  confirmedLienAICTE: boolean;
  evidenceRef: string;
  timestamp: string;
  status: 'CONFIRMED' | 'DISCREPANCY' | 'PENDING' | 'REJECTED';
  notes?: string;
}

export interface DualTruthReconciliation {
  fdrNoMatch: boolean;
  amountMatch: boolean;
  bankMatch: boolean;
  maturityMatch: boolean;
  lienMatch: boolean;
  reconciliationState: 'SUBMITTED' | 'EXTRACTION_PENDING' | 'BANK_VERIFICATION_PENDING' | 'VERIFIED' | 'DISCREPANCY' | 'MANUAL_REVIEW';
  discrepancyDetails: string[];
}

// --- MULTIMODAL DOCUMENT FORENSICS & TRIAGE (Cap #2, #3) ---
export interface PyMuPDFMetadata {
  producer: string;
  creator: string;
  creationDate: string;
  modDate: string;
  isSigned: boolean;
  fileSignatureValid: boolean;
  anomalies: string[];
}

export interface ELATamperAnalysis {
  tamperScore: number; // 0 - 100
  suspiciousRegionsCount: number;
  flaggedAreas: string[];
  elaIndicator: 'LOW_RISK' | 'SUSPICIOUS_ARTIFACTS' | 'PROBABLE_ALTERATION';
  compressionAnomalyDetected: boolean;
}

export interface DuplicateCheckResult {
  sha256: string;
  isExactDuplicate: boolean;
  duplicateWithInstitutionCode?: string;
  duplicateWithInstitutionName?: string;
  levenshteinSimilarity: number; // 0 - 100%
  nearDuplicateMatches?: { ref: string; inst: string; similarity: number }[];
}

// --- PROACTIVE LIFECYCLE & T-90/60/30/7 ALERTS (Cap #4, #5, #7) ---
export interface MaturityAlertItem {
  threshold: 'T-90' | 'T-60' | 'T-30' | 'T-7';
  triggerDate: string;
  deliveryStatus: 'SENT' | 'PENDING' | 'FAILED';
  deliveryChannel: 'EMAIL' | 'SMS' | 'IN_APP' | 'WHATSAPP';
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  actionTaken: 'NONE' | 'RENEWAL_SUBMITTED' | 'RELEASE_REQUESTED' | 'EXPLAINED';
  escalationTier: 'SCRUTINY_OFFICER' | 'SECTION_OFFICER' | 'BUREAU_HEAD';
  escalationOverdue: boolean;
}

// --- MAKER-CHECKER-APPROVER & MULTI-CELL CLEARANCES (Cap #6, #9) ---
export interface CellClearance {
  cleared: boolean;
  clearedBy?: string;
  timestamp?: string;
  referenceNumber?: string;
  notes?: string;
}

export interface TierApproval {
  approved: boolean;
  officerName?: string;
  timestamp?: string;
  reasonCode?: string;
  notes?: string;
}

export interface MultiCellClearances {
  grievanceCell: CellClearance;
  vigilanceCell: CellClearance;
  financeBureau: CellClearance;
  legalHold: { hasHold: boolean; holdReason?: string };
  aphChecklist: {
    requestLetter: boolean;
    affidavitStampPaper: boolean;
    originalDepositProof: boolean;
    latestLoAEoA: boolean;
  };
  tierApprovals: {
    maker: TierApproval;
    checker: TierApproval;
    approver: TierApproval;
  };
  qrCodePayload?: string;
  sanctionOrderRef?: string;
}

// --- MAIN FDR INSTRUMENT MODEL ---
export interface FDRInstrument {
  id: string;
  institutionId: string;
  institutionName: string;
  institutionCode: string;
  instrumentType: InstrumentType;
  referenceNumber: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  amount: number; // INR
  currency: string;
  issueDate: string;
  maturityDate: string;
  interestRate: number;
  tenureYears: number;
  purpose: 'New Institute Establishment' | 'New Technical Course Addition' | 'Intake Expansion' | 'Endowment Fund';
  jointLienAICTE: boolean; // clause in favor of Regional Officer, AICTE
  autoRenewalClause: boolean;
  workflowStatus: InstrumentStatus;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'DISCREPANCY_FLAGGED';
  documentName: string;
  documentSize: string;
  documentType: 'PDF' | 'IMAGE';
  documentUrl?: string;
  sampleDocumentType?: 'sbi' | 'pnb' | 'hdfc' | 'canara';
  extractedData?: ExtractedOCRData;
  reviewObservations: ReviewObservation[];
  previousInstrumentId?: string;
  renewalHistory?: { date: string; reference: string; amount: number; renewalId: string }[];
  releaseRequest?: ReleaseRequest;
  
  // Extended KOSH-GUARD Capabilities
  institutionClaim?: InstitutionClaim;
  bankFact?: BankFact;
  dualTruth?: DualTruthReconciliation;
  forensicsMetadata?: PyMuPDFMetadata;
  elaAnalysis?: ELATamperAnalysis;
  duplicateCheck?: DuplicateCheckResult;
  maturityAlerts?: MaturityAlertItem[];
  multiCellClearances?: MultiCellClearances;
  verificationTrack?: 'TRACK_A_NESL' | 'TRACK_B_NODAL_ATTESTATION';

  createdAt: string;
  updatedAt: string;
}

// --- CRYPTOGRAPHIC HASH-CHAINED AUDIT LEDGER (Cap #9, Slide 5) ---
export interface CryptographicAuditBlock {
  blockIndex: number;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityId: string;
  details: string;
  previousHash: string;
  payloadHash: string;
  blockHash: string;
  isTampered?: boolean;
}

export interface AuditLog {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'INSTRUMENT' | 'INSTITUTION' | 'RELEASE_REQUEST' | 'RENEWAL' | 'SYSTEM' | 'BLOCKCHAIN';
  entityId: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress: string;
  blockHash?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'EXPIRY_ALERT' | 'DISCREPANCY' | 'VERIFICATION_REQUIRED' | 'RELEASE_FILED' | 'TAMPER_ALERT';
  timestamp: string;
  unread: boolean;
  instrumentId?: string;
}
