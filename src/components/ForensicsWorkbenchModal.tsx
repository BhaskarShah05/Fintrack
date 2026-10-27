import React, { useState } from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  AlertTriangle, 
  Eye, 
  Hash, 
  Search, 
  Layers, 
  FileText, 
  CheckCircle2, 
  XCircle,
  Copy,
  ScanLine
} from 'lucide-react';
import { FDRInstrument, UserRole } from '../types';

interface ForensicsWorkbenchModalProps {
  instrument: FDRInstrument | null;
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onOpenDualTruth?: (instrument: FDRInstrument) => void;
  onAddAuditLog?: (action: string, details: string, previousValue?: string, newValue?: string) => void;
}

export const ForensicsWorkbenchModal: React.FC<ForensicsWorkbenchModalProps> = ({
  instrument,
  isOpen,
  onClose,
  onOpenDualTruth
}) => {
  if (!isOpen || !instrument) return null;

  const [viewMode, setViewMode] = useState<'ORIGINAL' | 'ELA_HEATMAP'>('ORIGINAL');

  const forensics = instrument.forensicsMetadata || {
    producer: 'Adobe PDF Engine / Core Banking Suite',
    creator: 'CBS Automated Deposit Receipt Generator',
    creationDate: instrument.createdAt,
    modDate: instrument.updatedAt,
    isSigned: true,
    fileSignatureValid: true,
    anomalies: []
  };

  const ela = instrument.elaAnalysis || {
    tamperScore: instrument.workflowStatus === 'DISCREPANCY_FLAGGED' ? 68 : 2,
    suspiciousRegionsCount: instrument.workflowStatus === 'DISCREPANCY_FLAGGED' ? 2 : 0,
    flaggedAreas: instrument.workflowStatus === 'DISCREPANCY_FLAGGED' ? ['Lien Endorsement Clause', 'Date Alignment'] : [],
    elaIndicator: instrument.workflowStatus === 'DISCREPANCY_FLAGGED' ? 'SUSPICIOUS_ARTIFACTS' : 'LOW_RISK',
    compressionAnomalyDetected: instrument.workflowStatus === 'DISCREPANCY_FLAGGED'
  };

  const duplicates = instrument.duplicateCheck || {
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    isExactDuplicate: false,
    levenshteinSimilarity: 0
  };

  const fieldConf = instrument.extractedData?.fieldConfidence || {
    referenceNumber: 99.2,
    amount: 99.8,
    bankName: 98.4,
    dates: 97.1,
    jointLienClause: instrument.jointLienAICTE ? 96.5 : 42.0
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto border border-slate-200/90 shadow-2xl flex flex-col"
        role="dialog"
        aria-labelledby="forensics-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4.5 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
              <ScanLine className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="forensics-title" className="text-lg font-heading font-bold text-slate-900">
                  Multimodal Document Forensics & HITL Scrutiny
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  CAP #2 & #3 · PyMuPDF + PaddleOCR + ELA
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pixel-level Error Level Analysis (ELA) · PDF Structural Metadata · Field Confidence Scores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('ORIGINAL')}
                className={`px-3 py-1 rounded-full font-semibold transition ${
                  viewMode === 'ORIGINAL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Original Document
              </button>
              <button
                type="button"
                onClick={() => setViewMode('ELA_HEATMAP')}
                className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1.5 ${
                  viewMode === 'ELA_HEATMAP' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>ELA Tamper Heatmap</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: Side-by-Side Document Scan / ELA Heatmap View (7 Cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Document View ({viewMode === 'ORIGINAL' ? 'Standard Scan' : 'OpenCV Error Level Analysis'})</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  ela.elaIndicator === 'LOW_RISK' ? 'bg-emerald-100 text-emerald-800' :
                  ela.elaIndicator === 'SUSPICIOUS_ARTIFACTS' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  Tamper Risk: {ela.elaIndicator.replace('_', ' ')}
                </span>
              </div>

              {/* Document Simulator Container */}
              <div className="relative rounded-2xl border border-slate-300 bg-slate-900 p-4 overflow-hidden shadow-inner min-h-[380px] flex items-center justify-center">
                {viewMode === 'ORIGINAL' ? (
                  /* Standard Document Preview */
                  <div className="bg-white rounded-xl p-6 w-full max-w-md text-slate-900 shadow-md font-serif text-[11px] leading-relaxed border border-slate-200">
                    <div className="text-center pb-3 border-b border-slate-200 font-sans">
                      <div className="font-bold text-sm tracking-wide text-slate-800">{instrument.bankName.toUpperCase()}</div>
                      <div className="text-[10px] text-slate-500">{instrument.branchName} · IFSC: {instrument.ifscCode}</div>
                      <div className="text-[10px] text-teal-700 font-bold mt-1">TERM DEPOSIT RECEIPT / JOINT ESCROW</div>
                    </div>

                    <div className="py-3 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Deposit A/c No:</span>
                        <span className="font-mono font-bold">{instrument.referenceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Institution:</span>
                        <span className="font-bold text-right truncate max-w-[200px]">{instrument.institutionName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Principal Amount:</span>
                        <span className="font-bold">₹{instrument.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Interest Rate / Tenure:</span>
                        <span>{instrument.interestRate}% p.a. ({instrument.tenureYears} Years)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Maturity Date:</span>
                        <span className="font-semibold text-emerald-700">{instrument.maturityDate}</span>
                      </div>
                    </div>

                    <div className={`mt-2 p-2.5 rounded-lg border text-[10px] ${
                      instrument.jointLienAICTE 
                        ? 'bg-teal-50 border-teal-200 text-teal-800' 
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                      <div className="font-bold uppercase tracking-wider text-[9px] mb-0.5">Statutory Lien Endorsement:</div>
                      {instrument.jointLienAICTE 
                        ? 'Lien registered in favor of Regional Officer, AICTE New Delhi as per APH regulations. No premature withdrawal without Council NOC.'
                        : 'NO LIEN RECORDED IN FAVOR OF AICTE.'}
                    </div>

                    <div className="pt-4 flex items-center justify-between text-[9px] text-slate-400 font-sans">
                      <span>Auth Signatory: Bank Manager</span>
                      <span>Rubber Seal Verified</span>
                    </div>
                  </div>
                ) : (
                  /* ELA Heatmap View Simulation */
                  <div className="relative bg-slate-950 rounded-xl p-6 w-full max-w-md text-slate-400 font-mono text-[10px] leading-relaxed border border-rose-900/40 shadow-2xl overflow-hidden">
                    {/* Simulated ELA Noise Matrix overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:8px_8px] opacity-40 pointer-events-none" />

                    <div className="text-center pb-3 border-b border-slate-800">
                      <div className="text-rose-400 font-bold text-xs">OPEN_CV ELA COMPRESSION MAP (RESAVE AT 95%)</div>
                      <div className="text-slate-500 text-[9px]">Analyzing 8-bit DCT coefficient variances across raster blocks</div>
                    </div>

                    <div className="py-4 space-y-2 relative">
                      <div className="flex justify-between text-slate-600">
                        <span>A/c: {instrument.referenceNumber}</span>
                        <span className="text-emerald-500">[Uniform DCT]</span>
                      </div>

                      {/* Highlighted anomaly if flagged */}
                      {ela.suspiciousRegionsCount > 0 ? (
                        <div className="bg-rose-900/30 border border-rose-500/80 p-2 rounded text-rose-300 font-bold animate-pulse">
                          <span>[!] HIGH VARIANCE ARTIFACT DETECTED:</span>
                          <div className="text-[9px] text-rose-200 mt-0.5">
                            {ela.flaggedAreas.join(' · ') || 'Compression mismatch indicating localized text alteration'}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-950/40 border border-emerald-500/50 p-2 rounded text-emerald-300">
                          <span>[✓] Zero compression anomalies detected. Uniform pixel noise signature.</span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-600">
                        <span>Principal: ₹{instrument.amount.toLocaleString()}</span>
                        <span className="text-emerald-500">[Consistent]</span>
                      </div>
                    </div>

                    <div className="pt-2 text-[9px] text-amber-400 flex items-center justify-between border-t border-slate-900">
                      <span>Tamper Score: {ela.tamperScore}/100</span>
                      <span>Anomalies: {ela.suspiciousRegionsCount} regions</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Metadata & Confidence Scores (5 Cols) */}
            <div className="lg:col-span-5 space-y-4 text-xs">
              
              {/* PaddleOCR Calibrated Field Confidence */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-slate-800 uppercase tracking-wider">
                    PaddleOCR Field Confidence
                  </span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                    {instrument.extractedData?.confidenceScore || 96}% Mean
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    { label: 'Reference Number', val: fieldConf.referenceNumber },
                    { label: 'Principal Deposit Amount', val: fieldConf.amount },
                    { label: 'Bank & Branch Name', val: fieldConf.bankName },
                    { label: 'Issue & Maturity Dates', val: fieldConf.dates },
                    { label: 'Joint Lien AICTE Clause', val: fieldConf.jointLienClause }
                  ].map((field, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-600">{field.label}</span>
                        <span className={`font-mono font-bold ${field.val < 70 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {field.val.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            field.val < 70 ? 'bg-rose-500' : field.val < 90 ? 'bg-amber-500' : 'bg-teal-500'
                          }`}
                          style={{ width: `${field.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PyMuPDF Structural Metadata Inspector */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <span className="font-heading font-bold text-slate-800 uppercase tracking-wider block">
                  PyMuPDF Structural Metadata
                </span>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                    <span className="text-slate-500">PDF Producer:</span>
                    <span className="font-mono text-slate-800 text-right truncate max-w-[180px]">{forensics.producer}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                    <span className="text-slate-500">Creation Date:</span>
                    <span className="font-mono text-slate-700">{forensics.creationDate}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                    <span className="text-slate-500">Digital Signature:</span>
                    <span className={`font-bold ${forensics.isSigned ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {forensics.isSigned ? 'Valid Cryptographic Cert' : 'Unsigned / Raster Scan'}
                    </span>
                  </div>
                </div>

                {forensics.anomalies.length > 0 && (
                  <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-xl text-[10px] text-rose-800 space-y-0.5">
                    <span className="font-bold block">Structural Flags:</span>
                    {forensics.anomalies.map((anom, idx) => (
                      <div key={idx}>• {anom}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Duplicate & Levenshtein Near-Duplicate Check */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="font-heading font-bold text-slate-800 uppercase tracking-wider block">
                  SHA-256 & Cross-Institution Registry Check
                </span>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Exact Hash Collision:</span>
                    <span className={`font-bold ${duplicates.isExactDuplicate ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {duplicates.isExactDuplicate ? 'DUPLICATE CAUGHT (!)' : 'Unique Document (100%)'}
                    </span>
                  </div>

                  {duplicates.duplicateWithInstitutionName && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-[10px] text-rose-800">
                      <strong>Reused From:</strong> {duplicates.duplicateWithInstitutionName} ({duplicates.duplicateWithInstitutionCode})
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-500">Fuzzy Matching Score:</span>
                    <span className="font-mono font-bold text-slate-800">{duplicates.levenshteinSimilarity}%</span>
                  </div>
                </div>
              </div>

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

          {onOpenDualTruth && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDualTruth(instrument);
              }}
              className="px-6 py-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <span>Proceed to Dual-Truth Reconciliation</span>
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
