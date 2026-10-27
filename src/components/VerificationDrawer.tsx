import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Landmark, 
  Calendar, 
  Clock, 
  Stamp, 
  Send,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FDRInstrument, InstrumentStatus, ReviewObservation, UserRole } from '../types';

interface VerificationDrawerProps {
  instrument: FDRInstrument | null;
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onUpdateInstrument: (updated: FDRInstrument) => void;
  onAddAuditLog: (action: string, details: string, prev?: string, next?: string) => void;
}

export const VerificationDrawer: React.FC<VerificationDrawerProps> = ({
  instrument,
  isOpen,
  onClose,
  currentRole,
  onUpdateInstrument,
  onAddAuditLog
}) => {
  const [reviewNote, setReviewNote] = useState('');
  const [decision, setDecision] = useState<'APPROVED' | 'CORRECTION_REQUIRED' | 'INVESTIGATION_FLAGGED'>('APPROVED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !instrument) return null;

  const handleDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      let newWorkflowStatus: InstrumentStatus = instrument.workflowStatus;
      let newVerifStatus: 'PENDING' | 'VERIFIED' | 'DISCREPANCY_FLAGGED' = 'VERIFIED';

      if (decision === 'APPROVED') {
        newWorkflowStatus = 'VERIFIED';
        newVerifStatus = 'VERIFIED';
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.5 }
          });
        } catch (err) {}
      } else if (decision === 'CORRECTION_REQUIRED') {
        newWorkflowStatus = 'DISCREPANCY_FLAGGED';
        newVerifStatus = 'DISCREPANCY_FLAGGED';
      } else {
        newWorkflowStatus = 'UNDER_VERIFICATION';
        newVerifStatus = 'PENDING';
      }

      const newObs: ReviewObservation = {
        id: `rev-${Date.now()}`,
        reviewerName: currentRole === 'SUPERVISOR' ? 'Prof. T. G. Sitharam (Supervisory Chairman)' : 'Er. Alok Nath (Regional Regulatory Officer)',
        reviewerRole: currentRole,
        status: newWorkflowStatus,
        comment: reviewNote || (decision === 'APPROVED' ? 'Approved upon document scrutiny and joint lien verification.' : 'Discrepancy notice issued to institution.'),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        decision
      };

      const updatedInstrument: FDRInstrument = {
        ...instrument,
        workflowStatus: newWorkflowStatus,
        verificationStatus: newVerifStatus,
        reviewObservations: [newObs, ...(instrument.reviewObservations || [])],
        updatedAt: new Date().toISOString()
      };

      onUpdateInstrument(updatedInstrument);
      onAddAuditLog(
        'VERIFICATION_DECISION_RECORDED',
        `Official scrutiny completed for FDR #${instrument.referenceNumber}. Decision: ${decision}. Note: ${reviewNote || 'Standard approval'}`,
        instrument.workflowStatus,
        newWorkflowStatus
      );

      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const formatLakhs = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#001A99]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-[-12px_0px_0px_#000] border-l-4 border-black flex flex-col justify-between text-slate-900">
          
          <div>
            {/* Top accent bar */}
            <div className="h-3 w-full bg-[#CCFF00] border-b-2 border-black" />

            {/* Drawer Header */}
            <div className="p-6 border-b-2 border-black flex items-center justify-between bg-white">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#0038FF] text-[#CCFF00] flex items-center justify-center font-bold border-2 border-black shadow-[3px_3px_0px_#000]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-black">
                    OFFICIAL SCRUTINY
                  </h2>
                  <p className="text-xs text-black/70 font-bold mt-0.5">
                    Deposit certificate & joint lien verification
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2.5 rounded-full text-black hover:bg-rose-500 hover:text-white border-2 border-transparent hover:border-black transition font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">
              
              {/* Instrument Overview Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Institution & Ref
                    </span>
                    <h3 className="text-sm font-heading font-bold text-slate-900">
                      {instrument.institutionName}
                    </h3>
                    <span className="text-xs font-mono font-bold text-teal-700">
                      {instrument.referenceNumber}
                    </span>
                  </div>

                  <span className="text-xl font-heading font-bold text-teal-700">
                    {formatLakhs(instrument.amount)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/70 text-slate-600">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Bank</span>
                    <span className="font-semibold text-slate-800">{instrument.bankName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Maturity Date</span>
                    <span className="font-semibold text-slate-800">{instrument.maturityDate}</span>
                  </div>
                </div>
              </div>

              {/* Scrutiny Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-heading font-bold text-slate-500 uppercase tracking-wider">
                  Compliance Checks
                </h4>
                
                <div className="space-y-2 text-xs">
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {instrument.jointLienAICTE ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold block text-slate-900">Joint Lien AICTE Endorsement</span>
                        <span className="text-[11px] text-slate-500">
                          {instrument.jointLienAICTE ? 'Present on face of deposit instrument' : 'Clause missing or unclear'}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      instrument.jointLienAICTE ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {instrument.jointLienAICTE ? 'PASSED' : 'FLAGGED'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold block text-slate-900">Scheduled Commercial Bank</span>
                        <span className="text-[11px] text-slate-500">RBI Second Schedule verified</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      PASSED
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold block text-slate-900">Lock-in Tenure Match</span>
                        <span className="text-[11px] text-slate-500">{instrument.tenureYears} Years required tenure met</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      PASSED
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrutiny Decision Form */}
              <form onSubmit={handleDecisionSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Scrutiny Determination
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    <label className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition ${
                      decision === 'APPROVED' ? 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-500/20' : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}>
                      <input
                        type="radio"
                        name="decision"
                        checked={decision === 'APPROVED'}
                        onChange={() => setDecision('APPROVED')}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Approve & Endorse Lien</span>
                        <span className="text-[11px] text-slate-500">Certificate complies with regulatory standards</span>
                      </div>
                    </label>

                    <label className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition ${
                      decision === 'CORRECTION_REQUIRED' ? 'border-rose-600 bg-rose-50/80 ring-1 ring-rose-500/20' : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}>
                      <input
                        type="radio"
                        name="decision"
                        checked={decision === 'CORRECTION_REQUIRED'}
                        onChange={() => setDecision('CORRECTION_REQUIRED')}
                        className="w-4 h-4 accent-rose-600 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Flag Discrepancy Notice</span>
                        <span className="text-[11px] text-slate-500">Send rectification memo to institution</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Scrutiny Remarks & Official Memo
                  </label>
                  <textarea
                    rows={3}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Enter compliance observations or instructions for institution..."
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-[#0038FF] hover:bg-[#0026b3] text-white text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] transition flex items-center justify-center gap-2"
                >
                  <Stamp className="w-4 h-4 text-[#CCFF00]" />
                  <span>{isSubmitting ? 'Recording Decision...' : 'Commit Regulatory Decision'}</span>
                </button>
              </form>

            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500">
              Authenticated Session: Er. Alok Nath • Regional Regulatory Officer
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VerificationDrawer;
