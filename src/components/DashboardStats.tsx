import React from 'react';
import { 
  IndianRupee, 
  Clock, 
  AlertTriangle, 
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Lock
} from 'lucide-react';
import { FDRInstrument, UserRole } from '../types';
import { ArrowBlack1, ArrowBlack2 } from './ui/HandDrawnAccents';

interface DashboardStatsProps {
  instruments: FDRInstrument[];
  currentRole: UserRole;
  onFilterStatus: (status: string) => void;
  onOpenReleaseModal: () => void;
  onOpenRegisterModal: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  instruments,
  onFilterStatus,
}) => {
  const totalAmount = instruments.reduce((sum, item) => sum + item.amount, 0);
  const pendingVerification = instruments.filter(i => i.workflowStatus === 'SUBMITTED' || i.workflowStatus === 'UNDER_VERIFICATION').length;
  const discrepanciesCount = instruments.filter(i => i.workflowStatus === 'DISCREPANCY_FLAGGED').length;
  const renewalDueCount = instruments.filter(i => i.workflowStatus === 'RENEWAL_DUE').length;
  const releasePendingCount = instruments.filter(i => i.workflowStatus === 'RELEASE_REQUESTED').length;

  const formatAmount = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(1)}L`;
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-2">
        <div>
          <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-[#0038FF] bg-[#0038FF]/10 px-3 py-1 rounded-full border border-[#0038FF]/20">
            Real-Time Surveillance Metrics
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight mt-1">
            Custody Overview
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        
        {/* Card 1: Total Escrow */}
        <div 
          onClick={() => onFilterStatus('ALL')}
          className="bg-[#F8F9FA] rounded-[2rem] p-7 flex flex-col items-center text-center relative border border-gray-200/90 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
        >
          <div className="w-full flex justify-between items-center mb-2">
            <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#0038FF] text-white">
              Sec 10(k) Custody
            </span>
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#0038FF] shadow-xs">
              <IndianRupee className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          <h3 className="text-lg md:text-xl uppercase leading-tight mb-1 font-black text-black">
            TOTAL JOINT<br/>ESCROW VAULT
          </h3>
          <p className="text-[10px] md:text-xs text-black/60 font-bold mb-4">
            {instruments.length} active statutory instruments
          </p>

          {/* Pill Graphic */}
          <div className="relative w-full flex justify-center mt-auto">
            <div className="flex items-center bg-[#0038FF] rounded-2xl p-2.5 pr-14 text-white shadow-lg relative z-10 w-full max-w-[220px]">
              <div className="w-8 h-8 bg-white text-[#0038FF] rounded-full mr-2.5 border border-white/30 flex items-center justify-center shrink-0 font-black text-xs">
                FDR
              </div>
              <div className="text-left min-w-0">
                <p className="text-[12px] font-black leading-none">{formatAmount(totalAmount)}</p>
                <p className="text-[8px] text-white/80 leading-none mt-1">AICTE Co-Sign</p>
              </div>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#CCFF00] text-black font-black text-[10px] px-3 py-1.5 rounded-xl z-20 shadow-md border border-black/10">
              100% Locked
            </div>
          </div>

          {/* Arrow pointing to next card on desktop */}
          <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 z-30 pointer-events-none">
            <ArrowBlack1 />
          </div>
        </div>

        {/* Card 2: Renewal Queue */}
        <div 
          onClick={() => onFilterStatus('RENEWAL_DUE')}
          className="bg-[#F8F9FA] rounded-[2rem] p-7 flex flex-col items-center text-center relative border border-gray-200/90 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
        >
          <div className="w-full flex justify-between items-center mb-2">
            <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-white">
              Maturity &lt; 30 Days
            </span>
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-amber-600 shadow-xs">
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          <h3 className="text-lg md:text-xl uppercase leading-tight mb-1 font-black text-black">
            AUTO-RENEWAL<br/>MONITORING
          </h3>
          <p className="text-[10px] md:text-xs text-black/60 font-bold mb-4">
            Notice issuance & renewal drafts
          </p>

          {/* Pill Graphic */}
          <div className="relative w-full flex justify-center mt-auto">
            <div className="flex items-center bg-[#0038FF] rounded-full p-1.5 text-white shadow-lg">
              <div className="bg-white/20 text-[#CCFF00] font-black text-sm px-3.5 py-1.5 rounded-full mr-2">
                {renewalDueCount} DUE
              </div>
              <div className="font-bold text-xs pr-3">
                Action Pending
              </div>
            </div>
            <div className="absolute -bottom-2 right-4 bg-[#CCFF00] rounded-full p-1.5 shadow-md transform rotate-12 z-20">
              <ArrowRight className="w-3.5 h-3.5 text-black stroke-[3]" />
            </div>
          </div>

          {/* Arrow pointing to next card */}
          <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 z-30 pointer-events-none">
            <ArrowBlack2 />
          </div>
        </div>

        {/* Card 3: Lien Discrepancies */}
        <div 
          onClick={() => onFilterStatus('DISCREPANCY_FLAGGED')}
          className="bg-[#F8F9FA] rounded-[2rem] p-7 flex flex-col items-center text-center relative border border-gray-200/90 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
        >
          <div className="w-full flex justify-between items-center mb-2">
            <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white">
              CAP #1 & #3 Alert
            </span>
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-rose-600 shadow-xs">
              <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          <h3 className="text-lg md:text-xl uppercase leading-tight mb-1 font-black text-black">
            DUAL-TRUTH<br/>DISCREPANCIES
          </h3>
          <p className="text-[10px] md:text-xs text-black/60 font-bold mb-4">
            Bank CBS confirmation mismatches
          </p>

          {/* Pill Graphic with Speech Bubble */}
          <div className="flex flex-col items-center bg-[#CCFF00] rounded-[2rem] px-5 py-3 text-black shadow-lg mt-auto relative w-full max-w-[200px] border border-black/10">
            <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5">Flagged Violations</p>
            <p className="text-xl font-black">{discrepanciesCount} Cases</p>
            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-[#CCFF00] transform rotate-45 border-r border-b border-black/10" />
          </div>

          {/* Arrow pointing to next card */}
          <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 z-30 pointer-events-none">
            <ArrowBlack1 />
          </div>
        </div>

        {/* Card 4: Verification Queue */}
        <div 
          onClick={() => onFilterStatus('SUBMITTED')}
          className="bg-[#F8F9FA] rounded-[2rem] p-7 flex flex-col items-center text-center relative border border-gray-200/90 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
        >
          <div className="w-full flex justify-between items-center mb-2">
            <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
              Tier 1-3 Review
            </span>
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-emerald-600 shadow-xs">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          <h3 className="text-lg md:text-xl uppercase leading-tight mb-1 font-black text-black">
            REVIEW & CLEARANCE<br/>PIPELINE
          </h3>
          <p className="text-[10px] md:text-xs text-black/60 font-bold mb-4">
            {pendingVerification} deposits · {releasePendingCount} refunds
          </p>

          {/* Pill Graphic */}
          <div className="relative w-full flex justify-center mt-auto">
            <div className="flex items-center bg-[#0038FF] rounded-2xl p-2.5 pr-14 text-white shadow-lg relative z-10 w-full max-w-[220px]">
              <div className="w-8 h-8 bg-[#CCFF00] text-black rounded-full mr-2.5 flex items-center justify-center shrink-0 font-black text-xs">
                {pendingVerification + releasePendingCount}
              </div>
              <div className="text-left min-w-0">
                <p className="text-[11px] font-bold leading-none truncate">Officers Online</p>
                <p className="text-[8px] text-white/70 leading-none mt-1">NeSL + CBS Active</p>
              </div>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-white text-[#0038FF] font-black text-[10px] px-2.5 py-1.5 rounded-xl z-20 shadow-md border border-gray-200">
              Surveillance
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardStats;
