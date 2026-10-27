import React, { useState } from 'react';
import { 
  Landmark, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Mail, 
  Key, 
  FileText, 
  Lock, 
  Search,
  Check,
  Building,
  RefreshCw
} from 'lucide-react';
import { FDRInstrument, UserRole } from '../types';
import { BANK_NODAL_DIRECTORY, BankNodalContact } from '../data/mockData';
import confetti from 'canvas-confetti';

interface BankVerificationPortalModalProps {
  instrument: FDRInstrument | null;
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onUpdateInstrument: (updated: FDRInstrument) => void;
  onAddAuditLog: (action: string, details: string, prev?: string, next?: string) => void;
}

export const BankVerificationPortalModal: React.FC<BankVerificationPortalModalProps> = ({
  instrument,
  isOpen,
  onClose,
  onUpdateInstrument,
  onAddAuditLog
}) => {
  if (!isOpen || !instrument) return null;

  const [activeTab, setActiveTab] = useState<'VERIFY_FLOW' | 'COVERAGE_MATRIX'>('VERIFY_FLOW');
  const [selectedTrack, setSelectedTrack] = useState<'TRACK_A' | 'TRACK_B'>(
    instrument.verificationTrack === 'TRACK_A_NESL' || instrument.instrumentType === 'BANK_GUARANTEE' 
      ? 'TRACK_A' 
      : 'TRACK_B'
  );

  // Track B Nodal verification form state
  const [testDomain, setTestDomain] = useState(
    instrument.bankFact?.bankDomain || (instrument.bankName.toLowerCase().includes('sbi') ? 'sbi.co.in' : 'bank.co.in')
  );
  const [isLienConfirmed, setIsLienConfirmed] = useState(instrument.jointLienAICTE);
  const [confirmedAmount, setConfirmedAmount] = useState(instrument.amount);
  const [confirmedRef, setConfirmedRef] = useState(instrument.referenceNumber);
  const [attestationNotes, setAttestationNotes] = useState('Attested against Core Banking System records under AICTE Standing Guidelines.');
  const [isVerifying, setIsVerifying] = useState(false);

  // Lookalike domain checker logic
  const checkDomainSafety = (domain: string) => {
    const d = domain.toLowerCase().trim();
    const legitDomains = ['sbi.co.in', 'pnbindia.in', 'canarabank.com', 'bankofbaroda.co.in', 'hdfcbank.com', 'icicibank.com', 'nesl.co.in', 'gov.in', 'nic.in'];
    if (legitDomains.includes(d)) {
      return { safe: true, message: 'AICTE-curated authentic bank domain verified.' };
    }
    if (d.includes('sbi') || d.includes('pnb') || d.includes('hdfc') || d.includes('bank')) {
      return { safe: false, message: 'WARNING: Lookalike or uncurated domain detected! Potential bank email spoofing attempt.' };
    }
    return { safe: false, message: 'Domain not in AICTE approved nodal directory.' };
  };

  const domainAnalysis = checkDomainSafety(testDomain);

  const matchedNodal = BANK_NODAL_DIRECTORY.find(b => 
    b.bankName.toLowerCase().includes(instrument.bankName.toLowerCase()) ||
    instrument.bankName.toLowerCase().includes(b.bankName.toLowerCase())
  );

  const handleExecuteAttestation = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const isApproved = isLienConfirmed && confirmedAmount === instrument.amount;

      const updated: FDRInstrument = {
        ...instrument,
        workflowStatus: isApproved ? 'VERIFIED' : 'DISCREPANCY_FLAGGED',
        verificationStatus: isApproved ? 'VERIFIED' : 'DISCREPANCY_FLAGGED',
        verificationTrack: selectedTrack === 'TRACK_A' ? 'TRACK_A_NESL' : 'TRACK_B_NODAL_ATTESTATION',
        bankFact: {
          verified: true,
          verifierId: selectedTrack === 'TRACK_A' ? 'NESL-AUTHORITATIVE-API' : (matchedNodal?.nodalOfficerName || 'BANK-NODAL-OFFICER'),
          verifierName: selectedTrack === 'TRACK_A' ? 'National E-Governance Services Ltd (NeSL)' : (matchedNodal?.nodalOfficerName || 'Bank Authorized Signatory'),
          verifierEmail: selectedTrack === 'TRACK_A' ? 'support@nesl.co.in' : (matchedNodal?.nodalEmail || `officer@${testDomain}`),
          bankDomain: testDomain,
          isDomainVerified: domainAnalysis.safe,
          verificationMethod: selectedTrack === 'TRACK_A' ? 'TRACK_A_NESL' : 'TRACK_B_NODAL_ATTESTATION',
          confirmedRefNumber: confirmedRef,
          confirmedAmount,
          confirmedMaturityDate: instrument.maturityDate,
          confirmedLienAICTE: isLienConfirmed,
          evidenceRef: selectedTrack === 'TRACK_A' ? `NESL-TOKEN-${Math.floor(100000 + Math.random() * 900000)}` : `BANK-DOSSIER-${Math.floor(10000 + Math.random() * 90000)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          status: isApproved ? 'CONFIRMED' : 'DISCREPANCY',
          notes: attestationNotes
        },
        dualTruth: {
          fdrNoMatch: confirmedRef === instrument.referenceNumber,
          amountMatch: confirmedAmount === instrument.amount,
          bankMatch: true,
          maturityMatch: true,
          lienMatch: isLienConfirmed === instrument.jointLienAICTE,
          reconciliationState: isApproved ? 'VERIFIED' : 'DISCREPANCY',
          discrepancyDetails: isApproved ? [] : ['Bank Attestation divergence: AICTE lien clause not marked or amount mismatch.']
        },
        updatedAt: new Date().toISOString()
      };

      onUpdateInstrument(updated);
      onAddAuditLog(
        selectedTrack === 'TRACK_A' ? 'TRACK_A_NESL_VERIFIED' : 'TRACK_B_NODAL_ATTESTED',
        `Bank verification logged via ${selectedTrack}. Result: ${isApproved ? 'CONFIRMED' : 'DISCREPANCY'}. Evidence: ${updated.bankFact?.evidenceRef}`,
        instrument.workflowStatus,
        updated.workflowStatus
      );

      setIsVerifying(false);
      try {
        if (isApproved) confetti({ particleCount: 80, spread: 60 });
      } catch (e) {}
      onClose();
    }, 600);
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto border border-slate-200/90 shadow-2xl flex flex-col"
        role="dialog"
        aria-labelledby="bank-portal-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4.5 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
              <Landmark className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="bank-portal-title" className="text-lg font-heading font-bold text-slate-900">
                  Hybrid Bank Verification Protocol
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  CAP #10 · Zero False Claims
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Track A: NeSL e-BG Digital Interface · Track B: Conventional Bank Nodal Attestation Dossier (Fallback)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('VERIFY_FLOW')}
                className={`px-3 py-1 rounded-full font-semibold transition ${
                  activeTab === 'VERIFY_FLOW' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Verification Flow
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('COVERAGE_MATRIX')}
                className={`px-3 py-1 rounded-full font-semibold transition ${
                  activeTab === 'COVERAGE_MATRIX' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bank Coverage Matrix
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-slate-200/90 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {activeTab === 'COVERAGE_MATRIX' ? (
            /* BANK COVERAGE MATRIX VIEW */
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-heading font-bold text-slate-900">
                    AICTE National Banking Network Integration Directory
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time status of scheduled commercial banks authorized for security deposit lien custody
                  </p>
                </div>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                  6 Curated Nodal Desks
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                <div className="bg-slate-100/80 px-4 py-2.5 font-bold text-slate-700 grid grid-cols-12 gap-2">
                  <div className="col-span-3">Bank Name</div>
                  <div className="col-span-3">Official Domain</div>
                  <div className="col-span-3">Authorized Nodal Officer</div>
                  <div className="col-span-3 text-right">Channel Capability</div>
                </div>

                {BANK_NODAL_DIRECTORY.map((bank, idx) => (
                  <div key={idx} className="px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-slate-50 transition">
                    <div className="col-span-3 font-semibold text-slate-900 flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-teal-600" />
                      <span>{bank.bankName}</span>
                    </div>
                    <div className="col-span-3 font-mono text-emerald-700 font-medium">
                      @{bank.officialDomain}
                    </div>
                    <div className="col-span-3 text-slate-600">
                      <div className="font-medium text-slate-800">{bank.nodalOfficerName}</div>
                      <div className="text-[11px] text-slate-400">{bank.nodalEmail}</div>
                    </div>
                    <div className="col-span-3 text-right">
                      {bank.supportsNeSLTrackA ? (
                        <span className="inline-flex items-center gap-1 font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full text-[10px]">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Track A (NeSL) + Track B</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px]">
                          <span>Track B (Nodal Fallback)</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* VERIFICATION FLOW VIEW */
            <div className="space-y-6">
              {/* Target Instrument Header Card */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                    Instrument Under Scrutiny
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-1">{instrument.institutionName}</div>
                  <div className="text-slate-500 font-mono mt-0.5">
                    Ref: {instrument.referenceNumber} · {instrument.bankName} · {formatINR(instrument.amount)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTrack('TRACK_A')}
                    className={`px-3 py-1.5 rounded-full font-bold text-xs border transition cursor-pointer flex items-center gap-1.5 ${
                      selectedTrack === 'TRACK_A' 
                        ? 'bg-teal-600 border-teal-600 text-white shadow-xs' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>Track A (NeSL Digital)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTrack('TRACK_B')}
                    className={`px-3 py-1.5 rounded-full font-bold text-xs border transition cursor-pointer flex items-center gap-1.5 ${
                      selectedTrack === 'TRACK_B' 
                        ? 'bg-teal-600 border-teal-600 text-white shadow-xs' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>Track B (Nodal Fallback)</span>
                  </button>
                </div>
              </div>

              {selectedTrack === 'TRACK_A' ? (
                /* TRACK A: NeSL Digital e-BG Channel */
                <div className="space-y-4">
                  <div className="border border-teal-200 bg-teal-50/50 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-teal-700" />
                        <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-teal-900">
                          Track A: NeSL Authoritative Digital Repository Lookup
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                        SFMS / NeSL Active Interface
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      For eligible electronic Bank Guarantees (e-BG), verification queries the National E-Governance Services Ltd (NeSL) authoritative repository directly using the SFMS digital certificate stamp.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                      <div className="bg-white p-3 rounded-xl border border-teal-100">
                        <span className="text-slate-400 block text-[11px]">NeSL Token Lookup:</span>
                        <span className="font-mono font-bold text-slate-900">NESL-CERT-2024-IN-889102</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-teal-100">
                        <span className="text-slate-400 block text-[11px]">Digital Signature Algorithm:</span>
                        <span className="font-mono font-bold text-emerald-700">RSA-SHA256 (CCA India Certified)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* TRACK B: Conventional Bank Nodal Attestation */
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-700" />
                        <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-900">
                          Track B: Case-Specific Verification Dossier & Lookalike Domain Filter
                        </h4>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        APH Cl. 1.12 Nodal Protocol
                      </span>
                    </div>

                    {/* Lookalike Domain Analyzer */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Simulate Verifier Domain Check (Anti-Spoofing Filter):</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          domainAnalysis.safe ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {domainAnalysis.safe ? 'VERIFIED BANK DOMAIN' : 'SUSPICIOUS / SPOOFED'}
                        </span>
                      </label>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={testDomain}
                          onChange={(e) => setTestDomain(e.target.value)}
                          placeholder="e.g. sbi.co.in or fake-sbi-portal.com"
                          className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 w-full focus:outline-none focus:border-teal-500"
                        />
                        <button
                          type="button"
                          onClick={() => setTestDomain('sbi.co.in')}
                          className="text-[11px] text-teal-700 hover:underline shrink-0"
                        >
                          Reset Legit
                        </button>
                        <button
                          type="button"
                          onClick={() => setTestDomain('sbi-nodal-verify.net')}
                          className="text-[11px] text-rose-700 hover:underline shrink-0 font-bold"
                        >
                          Simulate Phish
                        </button>
                      </div>

                      <p className={`text-[11px] ${domainAnalysis.safe ? 'text-emerald-700' : 'text-rose-700 font-bold'}`}>
                        {domainAnalysis.message}
                      </p>
                    </div>

                    {/* Nodal Attestation Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                      <div>
                        <label className="text-slate-600 font-medium block mb-1">Confirmed Deposit Reference #:</label>
                        <input
                          type="text"
                          value={confirmedRef}
                          onChange={(e) => setConfirmedRef(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-slate-600 font-medium block mb-1">Confirmed Amount in CBS (INR):</label>
                        <input
                          type="number"
                          value={confirmedAmount}
                          onChange={(e) => setConfirmedAmount(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Joint Lien Checkbox */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-800">
                          AICTE Joint Lien Clause Attestation
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Bank nodal officer explicitly confirms lien registered favoring Member Secretary, AICTE New Delhi
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={isLienConfirmed}
                        onChange={(e) => setIsLienConfirmed(e.target.checked)}
                        className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200/90 rounded-b-3xl flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecuteAttestation}
            disabled={isVerifying || !domainAnalysis.safe}
            className={`px-6 py-2 rounded-full text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer ${
              !domainAnalysis.safe 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Validating Cryptographic Channel...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Submit Bank Attestation ({selectedTrack})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
