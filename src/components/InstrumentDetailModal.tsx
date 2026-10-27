import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Landmark, 
  Building2, 
  IndianRupee, 
  Printer, 
  Download, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Stamp,
  ExternalLink,
  Award,
  Lock
} from 'lucide-react';
import { FDRInstrument, UserRole } from '../types';
import { ThreeStatutoryCoin } from './ThreeStatutoryCoin';

interface InstrumentDetailModalProps {
  instrument: FDRInstrument | null;
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onOpenVerificationModal: (instrument: FDRInstrument) => void;
  onOpenRenewalModal: (instrument: FDRInstrument) => void;
  onOpenReleaseModal: (instrument: FDRInstrument) => void;
}

export const InstrumentDetailModal: React.FC<InstrumentDetailModalProps> = ({
  instrument,
  isOpen,
  onClose,
  currentRole,
  onOpenVerificationModal,
  onOpenRenewalModal,
  onOpenReleaseModal
}) => {
  const [activeTab, setActiveTab] = useState<'dossier' | '3d-seal'>('dossier');

  if (!isOpen || !instrument) return null;

  const formatLakhs = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001A99]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-[12px_12px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden max-h-[90vh] flex flex-col text-slate-900">
        
        {/* Top Accent Strip */}
        <div className="h-3 w-full bg-[#CCFF00] border-b-2 border-black" />

        {/* Header */}
        <div className="px-8 py-5 border-b-2 border-black flex items-center justify-between bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0038FF] text-[#CCFF00] flex items-center justify-center font-bold border-2 border-black shadow-[3px_3px_0px_#000]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-black">
                  DEPOSIT DOSSIER
                </h2>
                <span className="text-xs px-3 py-1 rounded-full font-black bg-[#CCFF00] text-black font-mono border-2 border-black shadow-[2px_2px_0px_#000]">
                  {instrument.referenceNumber}
                </span>
              </div>
              <p className="text-xs text-black/70 font-bold mt-0.5">
                {instrument.institutionName} • PID: {instrument.institutionCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-full text-black hover:bg-[#CCFF00] border-2 border-transparent hover:border-black transition font-bold"
              title="Print Dossier"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full text-black hover:bg-rose-500 hover:text-white border-2 border-transparent hover:border-black transition font-bold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-header Tabs */}
        <div className="flex items-center gap-3 px-8 py-3 bg-[#F8F9FA] border-b-2 border-black">
          <button
            onClick={() => setActiveTab('dossier')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition border-2 ${
              activeTab === 'dossier'
                ? 'bg-[#0038FF] text-white border-black shadow-[3px_3px_0px_#000]'
                : 'bg-white text-black border-black/20 hover:border-black'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Deposit Dossier</span>
          </button>

          <button
            onClick={() => setActiveTab('3d-seal')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition border-2 ${
              activeTab === '3d-seal'
                ? 'bg-[#0038FF] text-white border-black shadow-[3px_3px_0px_#000]'
                : 'bg-white text-black border-black/20 hover:border-black'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3D Statutory Joint-Lien Seal</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#CCFF00] text-black font-black uppercase border border-black">3D WebGL</span>
          </button>
        </div>

        {/* Dossier Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === '3d-seal' ? (
            <div className="space-y-6">
              <ThreeStatutoryCoin
                referenceNumber={instrument.referenceNumber}
                institutionName={instrument.institutionName}
                amount={instrument.amount}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Statutory Lien Encumbrance Status</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Under AICTE Regulations Section 10(k), this Security Deposit is held under joint lien with Member Secretary, AICTE. No encashment, premature withdrawal, or loan hypothecation can occur without dual biometric sanction.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span>Escrow Bank Verification</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Instrument confirmed via API escrow confirmation from {instrument.bankName} ({instrument.branchName}). Auto-renewal mandate is locked in accordance with the 8-year statutory tenure.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
          {/* Top highlight Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Principal Amount
              </span>
              <span className="text-2xl font-heading font-bold text-teal-700 block">
                {formatLakhs(instrument.amount)}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Interest: {instrument.interestRate}% p.a.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Maturity Date
              </span>
              <span className="text-lg font-heading font-bold text-slate-900 block">
                {instrument.maturityDate}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Tenure: {instrument.tenureYears} Years Lock-in
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Lien Status
              </span>
              <div className="pt-1">
                {instrument.jointLienAICTE ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Joint Lien Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Lien Missing</span>
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Section: Bank & Statutory Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-heading font-bold text-slate-500 uppercase tracking-wider">
              Banking & Institutional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/90">
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Bank Name</span>
                  <span className="font-semibold text-slate-900">{instrument.bankName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Branch Location</span>
                  <span className="font-semibold text-slate-900">{instrument.branchName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">IFSC Code</span>
                  <span className="font-mono font-bold text-teal-700">{instrument.ifscCode}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Deposit Purpose</span>
                  <span className="font-semibold text-slate-900">{instrument.purpose}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Issue Date</span>
                  <span className="font-semibold text-slate-900">{instrument.issueDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Auto-Renewal Clause</span>
                  <span className="font-semibold text-slate-900">{instrument.autoRenewalClause ? 'Mandated (Enabled)' : 'Not Set'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Document Attachment & OCR Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-heading font-bold text-slate-500 uppercase tracking-wider">
              Document Audit & Extracted Meta
            </h3>
            <div className="p-5 rounded-2xl bg-white border-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[4px_4px_0px_#000]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0038FF] text-[#CCFF00] flex items-center justify-center font-bold border-2 border-black shadow-[3px_3px_0px_#000]">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-black block font-mono">
                      {instrument.documentName || 'Security_Deposit_Receipt.pdf'}
                    </span>
                    {instrument.documentUrl && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#CCFF00] text-black border border-black shadow-[1px_1px_0px_#000]">
                        PC Media
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-700 font-bold block mt-0.5">
                    {instrument.documentSize || '2.4 MB'} • Verified by Scheduled Bank Branch • {instrument.documentType || 'PDF'}
                  </span>
                  {instrument.extractedData?.rawTextDigest && (
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {instrument.extractedData.rawTextDigest}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black border-2 border-black inline-flex items-center gap-1.5 shadow-[2px_2px_0px_#000]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>OCR: {instrument.extractedData?.confidenceScore || 96}%</span>
                </span>

                {instrument.documentUrl ? (
                  <a
                    href={instrument.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-2xl bg-[#0038FF] hover:bg-[#002ecc] text-white border-2 border-black font-black text-xs flex items-center gap-1.5 shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>View PC File</span>
                  </a>
                ) : (
                  <a
                    href={`/api/instruments/${instrument.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 text-black border-2 border-black font-black text-xs flex items-center gap-1.5 shadow-[3px_3px_0px_#000] transition"
                  >
                    <Download className="w-3.5 h-3.5 text-[#0038FF]" />
                    <span>Download</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Section: Renewal History if present */}
          {instrument.renewalHistory && instrument.renewalHistory.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-heading font-bold text-slate-500 uppercase tracking-wider">
                Renewal History
              </h3>
              <div className="divide-y divide-slate-100 rounded-2xl bg-slate-50 border border-slate-200/90 p-4">
                {instrument.renewalHistory.map((ren, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 font-mono">Prior Ref: {ren.reference}</span>
                      <span className="text-slate-500 text-[11px] block">Processed on {ren.date}</span>
                    </div>
                    <span className="font-bold text-teal-700">{formatLakhs(ren.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Observations / Audit History */}
          {instrument.reviewObservations && instrument.reviewObservations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-heading font-bold text-slate-500 uppercase tracking-wider">
                Regulatory Scrutiny Notes
              </h3>
              <div className="space-y-2">
                {instrument.reviewObservations.map(obs => (
                  <div key={obs.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-900">{obs.reviewerName} ({obs.reviewerRole})</span>
                      <span className="text-slate-500 font-mono">{obs.timestamp}</span>
                    </div>
                    <p className="text-slate-600">{obs.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

            </>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t-2 border-black bg-[#F8F9FA] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider bg-white border-2 border-black text-black hover:bg-black hover:text-white transition shadow-[3px_3px_0px_#000]"
          >
            Close Dossier
          </button>

          <div className="flex items-center gap-3">
            {(currentRole === 'OFFICIAL' || currentRole === 'SUPERVISOR') && (
              <button
                onClick={() => { onClose(); onOpenVerificationModal(instrument); }}
                className="px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#0038FF] hover:bg-[#0026b3] text-white border-2 border-black shadow-[3px_3px_0px_#000] transition flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#CCFF00]" />
                <span>Regulatory Scrutiny</span>
              </button>
            )}

            {instrument.workflowStatus === 'RENEWAL_DUE' && (
              <button
                onClick={() => { onClose(); onOpenRenewalModal(instrument); }}
                className="px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#CCFF00] hover:bg-[#b8e600] text-black border-2 border-black shadow-[3px_3px_0px_#000] transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4 text-black" />
                <span>Process Renewal</span>
              </button>
            )}

            {(instrument.workflowStatus === 'RELEASE_REQUESTED' || instrument.tenureYears >= 8) && (
              <button
                onClick={() => { onClose(); onOpenReleaseModal(instrument); }}
                className="px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider bg-purple-600 hover:bg-purple-700 text-white border-2 border-black shadow-[3px_3px_0px_#000] transition flex items-center gap-2"
              >
                <Landmark className="w-4 h-4 text-white" />
                <span>Release Sanction</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default InstrumentDetailModal;
