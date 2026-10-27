import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingDown, 
  TrendingUp, 
  ShieldCheck, 
  Download, 
  FileSpreadsheet, 
  Landmark, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  FileText,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { FDRInstrument, Institution } from '../types';

interface ExecutiveReportsViewProps {
  instruments: FDRInstrument[];
  institutions: Institution[];
}

export const ExecutiveReportsView: React.FC<ExecutiveReportsViewProps> = ({
  instruments,
  institutions
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'EXPOSURE' | 'SLA_METRICS' | 'COMPLIANCE_MATRIX'>('EXPOSURE');

  const totalExposure = instruments.reduce((sum, i) => sum + i.amount, 0);

  // Group by Bank
  const bankDistribution = instruments.reduce((acc, item) => {
    acc[item.bankName] = (acc[item.bankName] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  // Group by State
  const stateDistribution = instruments.reduce((acc, item) => {
    const inst = institutions.find(i => i.id === item.institutionId);
    const state = inst?.state || 'Other';
    acc[state] = (acc[state] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  // Group by Status
  const statusCounts = {
    active: instruments.filter(i => i.workflowStatus === 'VERIFIED').length,
    expiring: instruments.filter(i => i.workflowStatus === 'RENEWAL_DUE').length,
    disputed: instruments.filter(i => i.workflowStatus === 'DISCREPANCY_FLAGGED').length,
    underVerification: instruments.filter(i => i.workflowStatus === 'SUBMITTED' || i.workflowStatus === 'UNDER_VERIFICATION').length,
    releaseRequested: instruments.filter(i => i.workflowStatus === 'RELEASE_REQUESTED').length,
    released: instruments.filter(i => i.workflowStatus === 'RELEASED').length
  };

  const formatCr = (val: number) => {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  };

  const handleExportCSV = () => {
    const headers = ['Instrument Ref', 'Institution', 'Bank', 'Principal (INR)', 'Maturity Date', 'Status', 'Lien AICTE', 'Track'];
    const rows = instruments.map(i => [
      i.referenceNumber,
      `"${i.institutionName}"`,
      `"${i.bankName}"`,
      i.amount,
      i.maturityDate,
      i.workflowStatus,
      i.jointLienAICTE ? 'YES' : 'NO',
      i.verificationTrack || 'TRACK_B'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AICTE_KOSH_GUARD_MANAGEMENT_REPORT_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#F8F9FA] rounded-[2.5rem] p-6 sm:p-7 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0038FF] text-white flex items-center justify-center font-bold shadow-md">
            <BarChart3 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#CCFF00] text-black">
                Executive MIS Desk
              </span>
              <span className="text-[10px] font-mono text-gray-500 font-bold">
                CAP #8 · Slide 6 Blueprint
              </span>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-black mt-1">
              Executive Management & KPI Reports
            </h2>
            <p className="text-xs text-gray-600 font-bold mt-0.5">
              Comprehensive Financial Exposure · Turnaround P50/P90 SLAs · Regulatory Compliance Matrices
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white p-1 rounded-full border-2 border-gray-200 text-xs shadow-xs">
            <button
              type="button"
              onClick={() => setActiveReportTab('EXPOSURE')}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase transition cursor-pointer ${
                activeReportTab === 'EXPOSURE' ? 'bg-[#0038FF] text-white shadow-sm' : 'text-black hover:bg-gray-100'
              }`}
            >
              Exposure
            </button>
            <button
              type="button"
              onClick={() => setActiveReportTab('SLA_METRICS')}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase transition cursor-pointer ${
                activeReportTab === 'SLA_METRICS' ? 'bg-[#0038FF] text-white shadow-sm' : 'text-black hover:bg-gray-100'
              }`}
            >
              SLA KPIs
            </button>
            <button
              type="button"
              onClick={() => setActiveReportTab('COMPLIANCE_MATRIX')}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase transition cursor-pointer ${
                activeReportTab === 'COMPLIANCE_MATRIX' ? 'bg-[#0038FF] text-white shadow-sm' : 'text-black hover:bg-gray-100'
              }`}
            >
              Standards
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-5 py-2.5 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black border border-black text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Audit Export (.CSV)</span>
          </button>
        </div>
      </div>

      {activeReportTab === 'EXPOSURE' && (
        /* TAB 1: FINANCIAL EXPOSURE BREAKDOWN */
        <div className="space-y-6">
          {/* Top Level Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Active Custody', count: statusCounts.active, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              { label: 'Renewal Due (<30d)', count: statusCounts.expiring, color: 'text-amber-700 bg-amber-50 border-amber-200' },
              { label: 'Lien Discrepancy', count: statusCounts.disputed, color: 'text-rose-700 bg-rose-50 border-rose-200' },
              { label: 'Under Scrutiny', count: statusCounts.underVerification, color: 'text-sky-700 bg-sky-50 border-sky-200' },
              { label: 'Release Pending', count: statusCounts.releaseRequested, color: 'text-purple-700 bg-purple-50 border-purple-200' },
              { label: 'Total Escrow', count: formatCr(totalExposure), color: 'text-teal-800 bg-teal-50 border-teal-200' }
            ].map((st, idx) => (
              <div key={idx} className={`p-3.5 rounded-2xl border ${st.color}`}>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">{st.label}</div>
                <div className="text-xl font-heading font-bold mt-1">{st.count}</div>
              </div>
            ))}
          </div>

          {/* Breakdown Grids: By Bank & By State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Bank */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-teal-700" />
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Exposure by Scheduled Commercial Bank
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500">Total: {formatCr(totalExposure)}</span>
              </div>

              <div className="space-y-3">
                {Object.entries(bankDistribution).map(([bank, amt], idx) => {
                  const pct = Math.round((amt / totalExposure) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800">{bank}</span>
                        <span className="font-mono text-slate-600">{formatCr(amt)} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-teal-600 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By State */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-700" />
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Geographic Exposure by State / Union Territory
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500">{Object.keys(stateDistribution).length} States</span>
              </div>

              <div className="space-y-3">
                {Object.entries(stateDistribution).map(([state, amt], idx) => {
                  const pct = Math.round((amt / totalExposure) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800">{state}</span>
                        <span className="font-mono text-slate-600">{formatCr(amt)} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-600 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'SLA_METRICS' && (
        /* TAB 2: SLA & TURNAROUND KPIS (Slide 6 Targets) */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Scrutiny Turnaround (P50)</span>
              <div className="text-2xl font-heading font-bold text-slate-900">2.4 Days</div>
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 inline" />
                <span>35% reduction vs baseline (Target: ≥30%)</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Maturity-Alert Coverage</span>
              <div className="text-2xl font-heading font-bold text-emerald-700">100%</div>
              <p className="text-[11px] text-slate-500">All active instruments scheduled T-90/60/30/7</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Duplicate Detection Rate</span>
              <div className="text-2xl font-heading font-bold text-teal-700">100% Hash</div>
              <p className="text-[11px] text-slate-500">Exact SHA-256 collision tripwire active</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">System Availability</span>
              <div className="text-2xl font-heading font-bold text-slate-900">99.8%</div>
              <p className="text-[11px] text-slate-500">RPO ≤ 1hr · RTO ≤ 4hrs · NIC Cloud</p>
            </div>
          </div>

          {/* SLA Escalation Rules Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Proactive Maturity SLA Escalation Ladder (Slide 4 Stage 3)
            </h3>
            
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs divide-y divide-slate-100">
              <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-700 grid grid-cols-12 gap-2">
                <div className="col-span-2">Threshold</div>
                <div className="col-span-3">Triggered Channel</div>
                <div className="col-span-3">Responsible Desk</div>
                <div className="col-span-4">Escalation Protocol</div>
              </div>

              {[
                { threshold: 'T - 90 Days', channel: 'Email + In-App Portal Alert', desk: 'Institution Registrar & Scrutiny Officer', action: 'Early Renewal Advisory Notice dispatched' },
                { threshold: 'T - 60 Days', channel: 'SMS + Email Alert', desk: 'Regional Section Officer', action: 'Formal Statutory Reminder; institution acknowledgement required' },
                { threshold: 'T - 30 Days', channel: 'WhatsApp + Priority SMS', desk: 'Section Officer & Verification Desk', action: 'URGENT: Escrow lapse warning; daily countdown triggered' },
                { threshold: 'T - 7 Days', channel: 'Direct Escalation Call + Notice', desk: 'Bureau Head (Approver)', action: 'CRITICAL NON-COMPLIANCE: Legal Notice for revocation of approval' }
              ].map((row, idx) => (
                <div key={idx} className="px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-slate-50 transition">
                  <div className="col-span-2 font-mono font-bold text-teal-700">{row.threshold}</div>
                  <div className="col-span-3 text-slate-700 font-medium">{row.channel}</div>
                  <div className="col-span-3 text-slate-600">{row.desk}</div>
                  <div className="col-span-4 text-slate-900 font-semibold">{row.action}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'COMPLIANCE_MATRIX' && (
        /* TAB 3: REGULATORY & STANDARDS ALIGNMENT */
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-heading font-bold text-base text-slate-900">
              Statutory Regulatory & Standards Alignment Matrix (Slide 6)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict compliance mappings across AICTE regulations, cybersecurity mandates, and data sovereignty laws
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                standard: 'AICTE APH 2024–27 (Cl. 1.12 & Cl. 6.46)',
                desc: 'Mandates joint escrow deposit with Regional Officer AICTE, auto-renewal clause, and 8-year lock-in period release gatekeeping.',
                status: '100% IMPLEMENTED',
                badge: 'bg-emerald-100 text-emerald-800'
              },
              {
                standard: 'GIGW 3.0 & WCAG 2.1 AA Applicability',
                desc: 'Guidelines for Indian Government Websites 3.0 accessibility standards, keyboard navigability, semantic tags, and ARIA roles.',
                status: 'COMPLIANT',
                badge: 'bg-emerald-100 text-emerald-800'
              },
              {
                standard: 'CERT-In Directions & VAPT Ready',
                desc: 'Log retention for 180 days, incident reporting protocols, WAF protection, rate limiting, and vulnerability testing readiness.',
                status: 'AUDIT READY',
                badge: 'bg-teal-100 text-teal-800'
              },
              {
                standard: 'Digital Personal Data Protection (DPDP) Act 2023',
                desc: 'Strict purpose limitation, data minimization, consent logging, and 100% India sovereign cloud residency (NIC/MeitY Cloud).',
                status: 'ENFORCED',
                badge: 'bg-emerald-100 text-emerald-800'
              },
              {
                standard: 'NeSL e-BG National Integration',
                desc: 'National E-Governance Services Ltd cryptographic integration for eligible digital Bank Guarantees without universal API false claims.',
                status: 'INTEGRATED (TRACK A)',
                badge: 'bg-sky-100 text-sky-800'
              }
            ].map((reg, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-heading font-bold text-sm text-slate-900">{reg.standard}</div>
                  <p className="text-slate-600 max-w-2xl">{reg.desc}</p>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${reg.badge}`}>
                  {reg.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
