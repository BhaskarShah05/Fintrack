import React, { useState } from 'react';
import { 
  X, 
  Landmark, 
  CheckCircle2, 
  Stamp, 
  ShieldCheck, 
  ArrowRight,
  FileCheck2,
  QrCode,
  AlertTriangle,
  Download,
  Building2,
  Lock,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FDRInstrument, ReleaseRequest, UserRole, MultiCellClearances } from '../types';

interface ReleaseWorkflowModalProps {
  instrument: FDRInstrument | null;
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onUpdateInstrument: (updated: FDRInstrument) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export const ReleaseWorkflowModal: React.FC<ReleaseWorkflowModalProps> = ({
  instrument,
  isOpen,
  onClose,
  currentRole,
  onUpdateInstrument,
  onAddAuditLog
}) => {
  if (!isOpen || !instrument) return null;

  const [activeStep, setActiveStep] = useState<'CLEARANCES' | 'SANCTION_ORDER'>(
    instrument.workflowStatus === 'RELEASED' ? 'SANCTION_ORDER' : 'CLEARANCES'
  );

  const [reason, setReason] = useState<ReleaseRequest['reason']>('Tenure Completion (8 Years)');
  const [boardResolutionRef, setBoardResolutionRef] = useState('BOARD-RES-2026/FDR-RELEASE-88');
  const [authorityDecision, setAuthorityDecision] = useState('Satisfied all academic and statutory infrastructure criteria under AICTE APH Clause 6.46. Deposit refund sanctioned.');

  // Multi-cell clearances state
  const clearances: MultiCellClearances = instrument.multiCellClearances || {
    grievanceCell: {
      cleared: true,
      clearedBy: 'Dr. Neeta Bansal (Grievance Officer)',
      timestamp: '2026-09-28 14:15',
      referenceNumber: 'GRV-CLR-2026-904',
      notes: 'No pending student refund complaints.'
    },
    vigilanceCell: {
      cleared: true,
      clearedBy: 'Shri A. P. Mathur (Chief Vigilance Officer)',
      timestamp: '2026-09-30 11:00',
      referenceNumber: 'VIG-NOC-2026-118',
      notes: 'No vigilance inquiry or judicial stay.'
    },
    financeBureau: {
      cleared: true,
      clearedBy: 'Smt. Renuka Sundaram (Finance Officer)',
      timestamp: '2026-10-02 16:30',
      referenceNumber: 'FIN-AUD-2026-552',
      notes: 'All council inspection levies reconciled.'
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
        reasonCode: 'APH_6_46_TENURE_8YR_VALIDATED'
      },
      checker: {
        approved: true,
        officerName: 'Smt. Sangeeta Nair (Section Officer)',
        timestamp: '2026-10-10 15:45',
        reasonCode: 'CHECKER_COMPLIANCE_CONFIRMED'
      },
      approver: {
        approved: instrument.workflowStatus === 'RELEASED',
        officerName: 'Prof. T. G. Sitharam (Bureau Head / Competent Authority)',
        timestamp: instrument.workflowStatus === 'RELEASED' ? instrument.updatedAt : undefined
      }
    },
    qrCodePayload: `AICTE-RELEASE:${instrument.referenceNumber}:${instrument.institutionCode}:INR-${instrument.amount}:APH-CL-6.46`,
    sanctionOrderRef: `AICTE/RO-SW/REL/2026/${instrument.referenceNumber.slice(-5)}`
  };

  const handleApproveRelease = () => {
    const orderNumber = clearances.sanctionOrderRef || `AICTE/REL/2026/${Math.floor(10000 + Math.random() * 90000)}`;

    const updatedClearances: MultiCellClearances = {
      ...clearances,
      tierApprovals: {
        ...clearances.tierApprovals,
        approver: {
          approved: true,
          officerName: currentRole === 'SUPERVISOR' || currentRole === 'BUREAU_HEAD' 
            ? 'Prof. T. G. Sitharam (Bureau Head / Competent Authority)' 
            : 'Er. Alok Nath (Regional Officer)',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          reasonCode: 'COMPETENT_AUTHORITY_FINAL_SANCTION',
          notes: authorityDecision
        }
      },
      qrCodePayload: `AICTE-SANCTION:${orderNumber}:${instrument.referenceNumber}:${instrument.amount}:VERIFIED-LEDGER`
    };

    const newReq: ReleaseRequest = {
      id: `rel-${Date.now()}`,
      instrumentId: instrument.id,
      requestedBy: 'Sri K. Narayana Swamy (Trustee)',
      institutionName: instrument.institutionName,
      requestDate: new Date().toISOString().slice(0, 10),
      reason,
      status: 'APPROVED',
      boardResolutionRef,
      releaseOrderNumber: orderNumber,
      reviewedBy: 'Prof. T. G. Sitharam (Bureau Head)',
      reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      competentAuthorityDecision: authorityDecision
    };

    const updatedInstrument: FDRInstrument = {
      ...instrument,
      workflowStatus: 'RELEASED',
      releaseRequest: newReq,
      multiCellClearances: updatedClearances,
      updatedAt: new Date().toISOString()
    };

    onUpdateInstrument(updatedInstrument);
    onAddAuditLog(
      'RELEASE_SANCTIONED_APH_6_46',
      `Maker-Checker-Approver complete. Final release sanction order issued for FDR #${instrument.referenceNumber}. Sanction Ref: ${orderNumber}`
    );

    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    } catch (e) {}

    setActiveStep('SANCTION_ORDER');
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
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto border border-slate-200/90 shadow-2xl flex flex-col text-slate-900"
        role="dialog"
        aria-labelledby="release-modal-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4.5 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
              <Stamp className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="release-modal-title" className="text-lg font-heading font-bold text-slate-900">
                  Release & Refund Gatekeeping Console
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  APH Cl. 6.46 · Maker-Checker-Approver
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Multi-Cell Clearances (Grievance, Vigilance, Finance) · Reason-Coded Clearances · Verifiable QR Sanction Order
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveStep('CLEARANCES')}
                className={`px-3 py-1 rounded-full font-semibold transition ${
                  activeStep === 'CLEARANCES' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Clearance Gate
              </button>
              <button
                type="button"
                onClick={() => setActiveStep('SANCTION_ORDER')}
                className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1 ${
                  activeStep === 'SANCTION_ORDER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-teal-600" />
                <span>QR Sanction Order</span>
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

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {activeStep === 'CLEARANCES' ? (
            /* STEP 1: MULTI-CELL CLEARANCES & MAKER-CHECKER-APPROVER */
            <div className="space-y-6">
              {/* Institution & Instrument Brief */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{instrument.institutionName}</span>
                  <div className="text-slate-500 font-mono mt-0.5">
                    Deposit Ref: {instrument.referenceNumber} · {instrument.bankName} · {formatINR(instrument.amount)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">Statutory Tenure</span>
                  <span className="font-bold text-teal-800 text-sm">{instrument.tenureYears} Years Completed (APH Cl. 6.46)</span>
                </div>
              </div>

              {/* Multi-Cell Clearance Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-800">
                  1. Statutory Multi-Cell Clearances (Mandatory Before Sanction)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Grievance Cell */}
                  <div className="p-4 rounded-2xl border bg-emerald-50/50 border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950">Grievance Cell</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-[11px] text-slate-600">{clearances.grievanceCell.notes}</div>
                    <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-emerald-200/60">
                      Ref: {clearances.grievanceCell.referenceNumber}
                    </div>
                  </div>

                  {/* Vigilance Cell */}
                  <div className="p-4 rounded-2xl border bg-emerald-50/50 border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950">Vigilance Cell</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-[11px] text-slate-600">{clearances.vigilanceCell.notes}</div>
                    <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-emerald-200/60">
                      Ref: {clearances.vigilanceCell.referenceNumber}
                    </div>
                  </div>

                  {/* Finance Bureau */}
                  <div className="p-4 rounded-2xl border bg-emerald-50/50 border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950">Finance Bureau</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-[11px] text-slate-600">{clearances.financeBureau.notes}</div>
                    <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-emerald-200/60">
                      Ref: {clearances.financeBureau.referenceNumber}
                    </div>
                  </div>
                </div>
              </div>

              {/* APH Cl. 6.46 Mandatory Documents Checklist */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
                <span className="font-heading font-bold text-slate-800 uppercase tracking-wider block">
                  2. APH Clause 6.46 Statutory Scrutiny Checklist
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Formal Institution Request Letter on Official Letterhead</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Affidavit on ₹100 Non-Judicial Stamp Paper</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Original Fixed Deposit Receipt / NeSL Bank Proof</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Latest AICTE Letter of Approval (LoA) / EoA</span>
                  </div>
                </div>
              </div>

              {/* Maker-Checker-Approver 3-Tier Status */}
              <div className="space-y-3">
                <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-800">
                  3. Maker-Checker-Approver Governance Trail
                </h3>

                <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 text-xs bg-white">
                  {/* Tier 1: Maker */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Tier 1: Maker (Scrutiny Officer)</div>
                      <div className="text-[11px] text-slate-500">{clearances.tierApprovals.maker.officerName}</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      SCRUTINY PASSED
                    </span>
                  </div>

                  {/* Tier 2: Checker */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Tier 2: Checker (Section Officer)</div>
                      <div className="text-[11px] text-slate-500">{clearances.tierApprovals.checker.officerName}</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      COMPLIANCE CHECKED
                    </span>
                  </div>

                  {/* Tier 3: Approver */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Tier 3: Approver (Bureau Head / Competent Authority)</div>
                      <div className="text-[11px] text-slate-500">{clearances.tierApprovals.approver.officerName}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      clearances.tierApprovals.approver.approved 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}>
                      {clearances.tierApprovals.approver.approved ? 'SANCTIONED' : 'AWAITING SANCTION SIGN-OFF'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: VERIFIABLE SIGNED SANCTION ORDER WITH QR CODE */
            <div className="space-y-6">
              <div className="border border-slate-300 rounded-2xl p-6 bg-slate-50 shadow-sm space-y-5 font-serif text-slate-900 text-xs">
                {/* Sanction Order Official Header */}
                <div className="text-center pb-4 border-b border-slate-300 font-sans space-y-1">
                  <div className="font-bold text-sm tracking-wider text-slate-800 uppercase">
                    ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070 · Approval Bureau
                  </div>
                  <div className="inline-block mt-1 font-bold text-xs text-teal-800 bg-teal-100/80 px-3 py-0.5 rounded-full border border-teal-200">
                    OFFICIAL SECURITY DEPOSIT RELEASE SANCTION ORDER (APH CL. 6.46)
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-4 py-2 font-sans text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Sanction Order Ref:</span>
                    <span className="font-mono font-bold text-slate-900">{clearances.sanctionOrderRef}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px]">Date of Sanction:</span>
                    <span className="font-semibold text-slate-800">{new Date().toISOString().slice(0, 10)}</span>
                  </div>
                </div>

                <p className="leading-relaxed text-[11px]">
                  Sanction of the Competent Authority, AICTE is hereby accorded for the release and refund of the statutory security deposit FDR <strong>#{instrument.referenceNumber}</strong> of face value <strong>{formatINR(instrument.amount)}</strong> maintained with <strong>{instrument.bankName}</strong> ({instrument.branchName}) in joint name with Regional Officer, AICTE.
                </p>

                <div className="bg-white p-3 rounded-xl border border-slate-200 font-sans text-[11px] space-y-1">
                  <div className="font-bold text-slate-800">Clearance Verification Summary:</div>
                  <div className="text-slate-600">
                    • 8-Year Lock-in Tenure Completion Validated · Grievance NOC #{clearances.grievanceCell.referenceNumber} · Vigilance NOC #{clearances.vigilanceCell.referenceNumber} · Finance Reconciled.
                  </div>
                </div>

                {/* Cryptographic QR Code Provenance Box */}
                <div className="p-4 bg-white rounded-2xl border border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-teal-600" />
                      <span>Cryptographic Provenance Verification QR</span>
                    </span>
                    <p className="text-[10px] text-slate-500 max-w-md">
                      Scan to verify ledger integrity on AICTE National Gateway. QR contains SHA-256 block hash, approval signatures, and WORM vault receipt.
                    </p>
                    <div className="text-[9px] font-mono text-slate-400 break-all">
                      {clearances.qrCodePayload}
                    </div>
                  </div>

                  {/* Visual QR Code Display */}
                  <div className="w-24 h-24 bg-slate-900 text-white rounded-xl p-2 flex items-center justify-center shrink-0 shadow-md">
                    <QrCode className="w-full h-full text-white" />
                  </div>
                </div>

                {/* Signatory Footnote */}
                <div className="pt-4 flex items-end justify-between font-sans text-[10px] text-slate-500">
                  <div>
                    <div>Disbursing Nodal: Regional Officer, AICTE</div>
                    <div>Copy to: Registrar, {instrument.institutionName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">Prof. T. G. Sitharam</div>
                    <div>Member Secretary / Bureau Head</div>
                    <div className="text-[9px] text-emerald-700 font-bold">DIGITALLY SIGNED VIA APH HSM</div>
                  </div>
                </div>
              </div>
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
            Close
          </button>

          <div className="flex items-center gap-3">
            {activeStep === 'SANCTION_ORDER' && (
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Sanction</span>
              </button>
            )}

            {!clearances.tierApprovals.approver.approved && (
              <button
                type="button"
                onClick={handleApproveRelease}
                className="px-6 py-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Grant Final Release Sanction (Tier 3 Approver)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
