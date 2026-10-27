import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Landmark, 
  Building2, 
  Clock, 
  FileCheck2, 
  Hash, 
  Lock, 
  ExternalLink,
  Info
} from 'lucide-react';
import { FDRInstrument, UserRole } from '../types';
import confetti from 'canvas-confetti';

interface DualTruthReconciliationWorkbenchProps {
  instrument: FDRInstrument | null;
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onUpdateInstrument: (updated: FDRInstrument) => void;
  onAddAuditLog: (action: string, details: string, prev?: string, next?: string) => void;
  onOpenBankPortal?: (instrument: FDRInstrument) => void;
  onOpenForensics?: (instrument: FDRInstrument) => void;
}

export const DualTruthReconciliationWorkbench: React.FC<DualTruthReconciliationWorkbenchProps> = ({
  instrument,
  isOpen,
  onClose,
  currentRole,
  onUpdateInstrument,
  onAddAuditLog,
  onOpenBankPortal,
  onOpenForensics
}) => {
  if (!isOpen || !instrument) return null;

  const claim = instrument.institutionClaim || {
    submittedBy: 'Institution Representative',
    submissionTimestamp: instrument.createdAt,
    referenceNumber: instrument.referenceNumber,
    amount: instrument.amount,
    bankName: instrument.bankName,
    branchName: instrument.branchName,
    ifsc: instrument.ifscCode,
    issueDate: instrument.issueDate,
    maturityDate: instrument.maturityDate,
    jointLienClaimed: instrument.jointLienAICTE,
    documentHash: instrument.duplicateCheck?.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  };

  const fact = instrument.bankFact || {
    verified: instrument.workflowStatus === 'VERIFIED',
    verifierId: 'BANK-OFFICER-PENDING',
    verifierName: 'Awaiting Bank Attestation',
    verifierEmail: 'nodal@bank.gov.in',
    bankDomain: instrument.bankName.toLowerCase().includes('sbi') ? 'sbi.co.in' : 'bank.co.in',
    isDomainVerified: true,
    verificationMethod: instrument.verificationTrack || 'TRACK_B_NODAL_ATTESTATION',
    confirmedRefNumber: instrument.workflowStatus === 'VERIFIED' ? instrument.referenceNumber : 'UNCONFIRMED',
    confirmedAmount: instrument.workflowStatus === 'VERIFIED' ? instrument.amount : 0,
    confirmedMaturityDate: instrument.workflowStatus === 'VERIFIED' ? instrument.maturityDate : 'PENDING',
    confirmedLienAICTE: instrument.jointLienAICTE,
    evidenceRef: 'PENDING-ATTESTATION-DOSSIER',
    timestamp: instrument.updatedAt,
    status: instrument.workflowStatus === 'VERIFIED' ? 'CONFIRMED' : 'PENDING'
  };

  const isLienMismatch = claim.jointLienClaimed !== fact.confirmedLienAICTE && fact.verified;
  const isAmountMismatch = claim.amount !== fact.confirmedAmount && fact.verified;
  const isRefMismatch = claim.referenceNumber !== fact.confirmedRefNumber && fact.verified;

  const handleApproveReconciliation = () => {
    const updated: FDRInstrument = {
      ...instrument,
      workflowStatus: 'VERIFIED',
      verificationStatus: 'VERIFIED',
      dualTruth: {
        fdrNoMatch: true,
        amountMatch: true,
        bankMatch: true,
        maturityMatch: true,
        lienMatch: true,
        reconciliationState: 'VERIFIED',
        discrepancyDetails: []
      },
      updatedAt: new Date().toISOString()
    };
    onUpdateInstrument(updated);
    onAddAuditLog(
      'DUAL_TRUTH_RECONCILIATION_CONFIRMED',
      `Dual-Truth reconciled for FDR #${instrument.referenceNumber}. Institution Claim matches verified Bank Fact.`,
      instrument.workflowStatus,
      'VERIFIED'
    );
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
    onClose();
  };

  const handleFlagDiscrepancy = () => {
    const updated: FDRInstrument = {
      ...instrument,
      workflowStatus: 'DISCREPANCY_FLAGGED',
      verificationStatus: 'DISCREPANCY_FLAGGED',
      dualTruth: {
        fdrNoMatch: !isRefMismatch,
        amountMatch: !isAmountMismatch,
        bankMatch: true,
        maturityMatch: true,
        lienMatch: !isLienMismatch,
        reconciliationState: 'DISCREPANCY',
        discrepancyDetails: [
          'CRITICAL: Bank Fact diverges from Institution Claim.',
          isLienMismatch ? 'Joint Lien in favor of AICTE was NOT attested by issuing bank.' : '',
          isAmountMismatch ? 'Principal deposit amount mismatch.' : ''
        ].filter(Boolean)
      },
      updatedAt: new Date().toISOString()
    };
    onUpdateInstrument(updated);
    onAddAuditLog(
      'DUAL_TRUTH_DISCREPANCY_FLAGGED',
      `Discrepancy notice served for FDR #${instrument.referenceNumber}. Bank Fact diverges from college claim.`,
      instrument.workflowStatus,
      'DISCREPANCY_FLAGGED'
    );
    onClose();
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
        aria-labelledby="dual-truth-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4.5 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="dual-truth-title" className="text-lg font-heading font-bold text-slate-900">
                  Dual-Truth Reconciliation Engine
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  CAP #1 & #3
                </span>
              </div>
              <p className="text-xs text-slate-500">
                AICTE APH 2024-27 Clause 1.12 · Strict Schema Separation: Institution Claim vs Official Bank Fact
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-200/90 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Hard Guardrail Notification Banner */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Constitutional System Guardrail:</span>{' '}
              Institution Claim stored in separate schema from Bank Fact. High OCR confidence does <strong>NOT</strong> prove authenticity. Bank-domain email address or OTP access alone does <strong>NOT</strong> constitute authority to attest. No silent auto-approvals permitted.
            </div>
          </div>

          {/* Side-by-Side Dual-Truth Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* COLUMN 1: Institution Claim */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-800">
                    1. Institution Claim (Self-Reported)
                  </h3>
                </div>
                <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                  Applicant Schema
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Submitting Institution:</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[240px] truncate">{instrument.institutionName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Signatory:</span>
                  <span className="font-medium text-slate-700">{claim.submittedBy}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Claimed FDR Ref:</span>
                  <span className="font-mono font-bold text-slate-800">{claim.referenceNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Claimed Principal:</span>
                  <span className="font-bold text-slate-900">{formatINR(claim.amount)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Depository Bank:</span>
                  <span className="font-medium text-slate-800">{claim.bankName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Branch & IFSC:</span>
                  <span className="font-mono text-slate-700">{claim.branchName} ({claim.ifsc})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Issue / Maturity:</span>
                  <span className="font-medium text-slate-700">{claim.issueDate} → {claim.maturityDate}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Joint Lien Claimed:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${claim.jointLienClaimed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {claim.jointLienClaimed ? 'YES — In favor of AICTE' : 'NO / MISSING'}
                  </span>
                </div>
              </div>

              {/* Document Hash Provenance */}
              <div className="pt-2 text-[10px] text-slate-400 font-mono break-all bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-600 block">SHA-256 Upload Fingerprint:</span>
                {claim.documentHash}
              </div>
            </div>

            {/* COLUMN 2: Bank Fact */}
            <div className={`border rounded-2xl p-5 space-y-4 ${
              isLienMismatch || isAmountMismatch 
                ? 'bg-rose-50/50 border-rose-200' 
                : fact.verified 
                ? 'bg-emerald-50/40 border-emerald-200' 
                : 'bg-amber-50/40 border-amber-200'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-teal-700" />
                  <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-800">
                    2. Bank Fact (Independent Attestation)
                  </h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  fact.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                  fact.status === 'DISCREPANCY' ? 'bg-rose-100 text-rose-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {fact.status}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Attestation Channel:</span>
                  <span className="font-semibold text-teal-800">
                    {fact.verificationMethod === 'TRACK_A_NESL' ? 'Track A: NeSL Digital e-BG' : 'Track B: Nodal Desk Attestation'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Nodal Verifier:</span>
                  <span className="font-medium text-slate-800">{fact.verifierName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Bank Official Domain:</span>
                  <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                    {fact.bankDomain}
                    {fact.isDomainVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Confirmed FDR Ref:</span>
                  <span className="font-mono font-bold text-slate-900">{fact.confirmedRefNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Confirmed Principal:</span>
                  <span className="font-bold text-slate-900">{formatINR(fact.confirmedAmount)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Confirmed Maturity:</span>
                  <span className="font-medium text-slate-800">{fact.confirmedMaturityDate}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">AICTE Joint Lien Marked:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                    fact.confirmedLienAICTE ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 font-bold'
                  }`}>
                    {fact.confirmedLienAICTE ? 'YES — Officially Liened' : 'NO LIEN RECORDED IN CBS'}
                  </span>
                </div>
              </div>

              {/* Evidence Reference */}
              <div className="pt-2 text-[10px] text-slate-500 bg-white/90 p-2.5 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-700 block">Bank Audit Evidence Ref:</span>
                <span className="font-mono text-slate-800">{fact.evidenceRef}</span>
                {fact.notes && <p className="mt-1 text-slate-600 italic">"{fact.notes}"</p>}
              </div>
            </div>
          </div>

          {/* Discrepancy Breakdown Warning */}
          {isLienMismatch && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 space-y-1">
                <div className="font-bold text-rose-800 text-sm">Dual-Truth Discrepancy Detected (APH Cl. 1.12 Violation)</div>
                <p>
                  The institution claimed a joint lien favoring AICTE, but the bank's independent Core Banking System (CBS) attestation confirmed <strong>NO statutory lien is marked</strong>. The deposit can be liquidated prematurely by the college without AICTE knowledge.
                </p>
              </div>
            </div>
          )}

          {/* Auxiliary Action Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-3">
              {onOpenBankPortal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBankPortal(instrument);
                  }}
                  className="font-medium text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Open Bank Verification Portal (Track A / B)</span>
                </button>
              )}
              {onOpenForensics && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenForensics(instrument);
                  }}
                  className="font-medium text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Inspect Multimodal Forensics & ELA Scan</span>
                </button>
              )}
            </div>

            <div className="text-slate-400 text-[11px]">
              Evidence Ref: {claim.referenceNumber} · State: {instrument.workflowStatus}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200/90 rounded-b-3xl flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            {isLienMismatch || isAmountMismatch ? (
              <button
                type="button"
                onClick={handleFlagDiscrepancy}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Issue Discrepancy Notice (APH Cl. 1.12)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApproveReconciliation}
                className="px-6 py-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm & Seal Dual-Truth Record</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
