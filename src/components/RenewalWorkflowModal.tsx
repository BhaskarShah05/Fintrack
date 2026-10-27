import React, { useState } from 'react';
import { 
  X, 
  RefreshCw, 
  ArrowRight, 
  FileText, 
  Calendar, 
  IndianRupee, 
  ShieldCheck, 
  Landmark, 
  Clock,
  GitFork,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FDRInstrument } from '../types';

interface RenewalWorkflowModalProps {
  instrument: FDRInstrument | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteRenewal: (previousId: string, renewalData: {
    newRefNumber: string;
    newMaturityDate: string;
    newAmount: number;
    renewalDocumentName: string;
    tenureYears: number;
  }) => void;
}

export const RenewalWorkflowModal: React.FC<RenewalWorkflowModalProps> = ({
  instrument,
  isOpen,
  onClose,
  onCompleteRenewal
}) => {
  if (!isOpen || !instrument) return null;

  const [activeTab, setActiveTab] = useState<'RENEWAL_FORM' | 'LINEAGE_TREE'>('LINEAGE_TREE');

  const [newRefNumber, setNewRefNumber] = useState(`${instrument.bankName.slice(0, 3).toUpperCase()}-REN-2026-${Math.floor(100000 + Math.random() * 900000)}`);
  const [newMaturityDate, setNewMaturityDate] = useState('2031-11-15');
  const [newAmount, setNewAmount] = useState<number>(instrument.amount);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [uploadedFile, setUploadedFile] = useState('Renewal_FDR_Receipt_Endorsed.pdf');

  const history = instrument.renewalHistory || [
    {
      date: '2016-04-10',
      reference: 'SBI-ND-2016-GENESIS',
      amount: 2500000,
      renewalId: 'fdr-root-2016'
    },
    {
      date: '2021-04-10',
      reference: instrument.referenceNumber,
      amount: instrument.amount,
      renewalId: instrument.id
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onCompleteRenewal(instrument.id, {
      newRefNumber,
      newMaturityDate,
      newAmount: Number(newAmount),
      renewalDocumentName: uploadedFile,
      tenureYears: Number(tenureYears)
    });

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

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
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto border border-slate-200/90 shadow-2xl flex flex-col text-slate-900"
        role="dialog"
        aria-labelledby="renewal-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4.5 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
              <RefreshCw className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="renewal-title" className="text-lg font-heading font-bold text-slate-900">
                  Renewal Lineage & Maturity Intelligence
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  CAP #4 & #5 · Parent-Child Lineage
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Unbroken Statutory Chain of Custody · Relational Linkage · T-90/60/30/7 Escalation History
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('LINEAGE_TREE')}
                className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1 ${
                  activeTab === 'LINEAGE_TREE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GitFork className="w-3.5 h-3.5 text-amber-600" />
                <span>Lineage Tree</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('RENEWAL_FORM')}
                className={`px-3 py-1 rounded-full font-semibold transition ${
                  activeTab === 'RENEWAL_FORM' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Submit Renewal
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
          {activeTab === 'LINEAGE_TREE' ? (
            /* LINEAGE TREE VIEW (Slide 2 Cap #5 & Slide 4 Stage 4) */
            <div className="space-y-6">
              {/* Institution Context Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{instrument.institutionName}</span>
                  <div className="text-slate-500 font-mono mt-0.5">
                    Current Instrument: {instrument.referenceNumber} · {instrument.bankName} · {formatINR(instrument.amount)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    Matures: {instrument.maturityDate}
                  </span>
                </div>
              </div>

              {/* Visual Parent -> Child Lineage Tree */}
              <div className="space-y-3">
                <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <GitFork className="w-4 h-4 text-amber-600" />
                  <span>Statutory Custodial Lineage Tree (Continuous Chain of Custody)</span>
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-300">
                  {/* Block 1: Establishment */}
                  <div className="relative bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1 text-xs">
                    <div className="absolute -left-6 top-4 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-xs" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">GENESIS / ESTABLISHMENT DEPOSIT</span>
                      <span className="text-[10px] font-mono text-slate-400">2016-04-10</span>
                    </div>
                    <div className="text-slate-600 font-mono">Ref: SBI-ND-2016-GENESIS · Face Value: ₹25,00,000</div>
                    <div className="text-[11px] text-emerald-700 font-medium">✓ Archived in WORM vault with complete audit seal.</div>
                  </div>

                  {/* Block 2: 2021 Extension */}
                  <div className="relative bg-amber-50/50 p-4 rounded-2xl border border-amber-200 shadow-xs space-y-1 text-xs">
                    <div className="absolute -left-6 top-4 w-4 h-4 rounded-full bg-teal-600 border-2 border-white shadow-xs" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">FIRST STATUTORY RENEWAL (5-YEAR TENURE)</span>
                      <span className="text-[10px] font-mono text-slate-400">2021-04-10</span>
                    </div>
                    <div className="text-slate-600 font-mono">Ref: {instrument.referenceNumber} · Face Value: {formatINR(instrument.amount)}</div>
                    <div className="text-[11px] text-amber-800 font-medium">⚠ Active custody — Approaching 2026 maturity threshold.</div>
                  </div>

                  {/* Block 3: Pending Replacement */}
                  <div className="relative bg-white p-4 rounded-2xl border border-dashed border-slate-300 space-y-1 text-xs">
                    <div className="absolute -left-6 top-4 w-4 h-4 rounded-full bg-slate-300 border-2 border-white" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500">PENDING 2026 REPLACEMENT INSTRUMENT</span>
                      <span className="text-[10px] font-mono text-amber-600 font-bold">T-30 SLA ALERT ACTIVE</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Awaiting institution lodgement of renewed deposit receipt or NeSL e-BG extension.
                    </p>
                  </div>
                </div>
              </div>

              {/* T-90/60/30/7 Escalation Schedule */}
              {instrument.maturityAlerts && instrument.maturityAlerts.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-700" />
                    <span>Maturity Alert Escalation Ledger (Slide 4 Stage 3)</span>
                  </h3>

                  <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 text-xs overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 font-bold text-slate-700 grid grid-cols-12 gap-2 text-[11px]">
                      <div className="col-span-2">Threshold</div>
                      <div className="col-span-2">Trigger Date</div>
                      <div className="col-span-3">Delivery & Channel</div>
                      <div className="col-span-3">Escalation Tier</div>
                      <div className="col-span-2 text-right">Action State</div>
                    </div>

                    {instrument.maturityAlerts.map((al, idx) => (
                      <div key={idx} className="px-4 py-2.5 grid grid-cols-12 gap-2 items-center text-[11px]">
                        <div className="col-span-2 font-mono font-bold text-teal-800">{al.threshold}</div>
                        <div className="col-span-2 font-mono text-slate-600">{al.triggerDate}</div>
                        <div className="col-span-3 text-slate-700">
                          <span className="font-semibold">{al.deliveryChannel}</span> ({al.deliveryStatus})
                        </div>
                        <div className="col-span-3 text-slate-600 font-medium">{al.escalationTier}</div>
                        <div className="col-span-2 text-right">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            al.actionTaken === 'NONE' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {al.actionTaken}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* SUBMIT RENEWAL FORM VIEW */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">New FDR / e-BG Reference Number:</label>
                  <input
                    type="text"
                    required
                    value={newRefNumber}
                    onChange={(e) => setNewRefNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">New Maturity Date:</label>
                  <input
                    type="date"
                    required
                    value={newMaturityDate}
                    onChange={(e) => setNewMaturityDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Renewed Principal (INR):</label>
                  <input
                    type="number"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Tenure (Years):</label>
                  <select
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-teal-500"
                  >
                    <option value={3}>3 Years</option>
                    <option value={5}>5 Years (Standard APH Term)</option>
                    <option value={8}>8 Years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Upload Endorsed Bank Receipt (PDF):</label>
                <input
                  type="text"
                  value={uploadedFile}
                  onChange={(e) => setUploadedFile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-700"
                />
              </div>

              <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-[11px] leading-relaxed">
                <strong>Relational Integrity Guarantee:</strong> Submitting this renewal links the replacement FDR to parent ID <code>{instrument.id}</code>. The legacy record will be preserved in unbroken historical custody under APH Clause 1.12.
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs transition cursor-pointer"
                >
                  Link & Complete Renewal
                </button>
              </div>
            </form>
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

          {activeTab === 'LINEAGE_TREE' && (
            <button
              type="button"
              onClick={() => setActiveTab('RENEWAL_FORM')}
              className="px-5 py-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Proceed to Renewal Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
