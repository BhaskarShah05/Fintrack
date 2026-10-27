import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  Landmark, 
  AlertCircle,
  HelpCircle,
  Lock,
  FileCheck
} from 'lucide-react';

export const RegulatoryLifecycleGuide: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(1);

  const stages = [
    {
      step: 1,
      shortTitle: 'FDR Lodgement',
      title: 'Joint Lien Deposit Creation',
      tagline: 'Section 10(k) AICTE Act 1987',
      description: 'The technical institution creates a Fixed Deposit Receipt (FDR) in a Scheduled Commercial Bank in the joint name of "Regional Officer, AICTE" and the institution.',
      tenure: '8 to 10 Years Mandatory Lock-in',
      documents: [
        'Original Bank Fixed Deposit Receipt',
        'Bank Confirmation Letter with Joint Lien endorsement',
        'Board of Governors / Trust Resolution'
      ],
      authority: 'Issuing Scheduled Bank & Institution',
      icon: Landmark,
      statusBadge: 'Scheduled Escrow'
    },
    {
      step: 2,
      shortTitle: 'AICTE Scrutiny',
      title: 'Regulatory Audit & Verification',
      tagline: 'Statutory Compliance Check',
      description: 'AICTE Regional Officers verify the joint lien clause, deposit value against Approval Process Handbook norms, and authenticate the bank confirmation with the branch manager.',
      tenure: 'Scrutiny turnaround: 7 Working Days',
      documents: [
        'SFMS / Bank Confirmation Verification',
        'Non-encashment clause audit without AICTE consent',
        'Interest credit mandate verification'
      ],
      authority: 'AICTE Regional Regulatory Officer',
      icon: ShieldCheck,
      statusBadge: 'Lien Endorsed'
    },
    {
      step: 3,
      shortTitle: 'Maturity Watch',
      title: 'Automated Lock-in & Surveillance',
      tagline: 'Proactive Rollover System',
      description: 'FinTrack continuously tracks maturity milestones. System dispatches automated notifications at 90, 60, and 30 days prior to expiry to guarantee timely renewal without gap in approval.',
      tenure: 'Continuous 30-Day Critical Window',
      documents: [
        'Maturity schedule notification',
        'Institution renewal undertaking',
        'Bank rollover acknowledgment request'
      ],
      authority: 'Automated Compliance Engine',
      icon: Clock,
      statusBadge: 'Surveillance'
    },
    {
      step: 4,
      shortTitle: 'Sanctioned Release',
      title: 'Closure or Refund Sanction',
      tagline: 'Post-Tenure Release Authorization',
      description: 'Upon completion of mandatory approval tenure or institutional closure sanction, AICTE executes lien discharge letter instructing the bank to release proceeds.',
      tenure: 'Executive Council Sanction Order',
      documents: [
        'AICTE Council Clearance Order',
        'Joint Lien Discharge Letter',
        'No Due Certificate from Regulatory Directorate'
      ],
      authority: 'AICTE Member Secretary & Regional Officer',
      icon: CheckCircle2,
      statusBadge: 'Release Cleared'
    }
  ];

  const currentStageData = stages.find(s => s.step === activeStage) || stages[0];
  const StageIcon = currentStageData.icon;

  return (
    <section className="space-y-6 pt-2">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0038FF]" />
            <span className="text-xs font-black text-[#0038FF] uppercase tracking-wider bg-[#0038FF]/10 px-3 py-1 rounded-full">
              Statutory Process Protocol
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight mt-1.5">
            Security Deposit Lifecycle
          </h2>
          <p className="text-xs sm:text-sm text-black/70 font-bold mt-0.5">
            Four mandatory phases governing institutional FDR compliance under AICTE statutory regulations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-black text-black bg-[#CCFF00] border-2 border-black px-4 py-2 rounded-full shadow-md">
          <Lock className="w-3.5 h-3.5" />
          <span>Section 10(k) Mandate</span>
        </div>
      </div>

      {/* 4 Interactive Stage Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stages.map((st) => {
          const Icon = st.icon;
          const isSelected = activeStage === st.step;

          return (
            <button
              key={st.step}
              onClick={() => setActiveStage(st.step)}
              className={`p-4 rounded-[1.75rem] text-left transition-all duration-200 border-2 relative group cursor-pointer shadow-sm ${
                isSelected
                  ? 'bg-[#0038FF] text-white border-black shadow-lg translate-y-[-2px]'
                  : 'bg-[#F8F9FA] hover:bg-white border-gray-200 text-black'
              }`}
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                  isSelected ? 'bg-[#CCFF00] text-black' : 'bg-black/10 text-black'
                }`}>
                  {st.step}
                </span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-white/20 text-[#CCFF00]' : 'bg-gray-200 text-black/70'
                }`}>
                  {st.statusBadge}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#CCFF00]' : 'text-[#0038FF]'}`} />
                <h4 className="text-sm font-black uppercase tracking-tight">
                  {st.shortTitle}
                </h4>
              </div>

              <p className={`text-[11px] font-bold mt-1 line-clamp-1 ${isSelected ? 'text-white/80' : 'text-black/60'}`}>
                {st.tagline}
              </p>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Card */}
      <div className="rounded-[2.5rem] bg-[#F8F9FA] border-[3px] border-black/10 shadow-xl p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left 7 cols: In-depth stage explanation */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0038FF] text-[#CCFF00] flex items-center justify-center shrink-0 shadow-md border-2 border-white">
                <StageIcon className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#0038FF] uppercase tracking-wider bg-[#0038FF]/10 px-2.5 py-0.5 rounded-full">
                    Stage {currentStageData.step} of 4
                  </span>
                  <span className="text-black/30">•</span>
                  <span className="text-xs text-black/60 font-black">{currentStageData.tagline}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-black uppercase mt-1">
                  {currentStageData.title}
                </h3>
              </div>
            </div>

            <p className="text-sm text-black/80 font-bold leading-relaxed">
              {currentStageData.description}
            </p>

            {/* Statutory Tenure & Authority Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
                <span className="text-[10px] uppercase font-black text-black/50 block tracking-wider">
                  Tenure Requirement
                </span>
                <span className="text-xs font-black text-black mt-1 block">
                  {currentStageData.tenure}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
                <span className="text-[10px] uppercase font-black text-black/50 block tracking-wider">
                  Signatory Authority
                </span>
                <span className="text-xs font-black text-black mt-1 block">
                  {currentStageData.authority}
                </span>
              </div>
            </div>

            {/* Stepper navigation footer */}
            <div className="pt-2 flex items-center gap-3">
              <button
                disabled={activeStage === 1}
                onClick={() => setActiveStage(prev => Math.max(1, prev - 1))}
                className="px-5 py-2.5 border-2 border-black rounded-full text-xs font-black text-black bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Previous Step
              </button>

              <button
                disabled={activeStage === 4}
                onClick={() => setActiveStage(prev => Math.min(4, prev + 1))}
                className="px-6 py-2.5 bg-[#0038FF] hover:bg-[#0030db] text-white text-xs font-black rounded-full shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 cursor-pointer border-2 border-black/20"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

          </div>

          {/* Right 5 cols: Verification Checklist & Rules */}
          <div className="lg:col-span-5 bg-white rounded-[2rem] p-6 border-2 border-gray-200 shadow-md space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#0038FF]" />
                <h4 className="text-xs font-black text-black uppercase tracking-wider">
                  Mandatory Dossier Checklist
                </h4>
              </div>
              <span className="text-[10px] font-black bg-[#CCFF00] text-black px-2.5 py-0.5 rounded-full border border-black/10">
                AICTE APH 2026
              </span>
            </div>

            <div className="space-y-2.5">
              {currentStageData.documents.map((doc, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-black font-bold bg-[#F8F9FA] p-3.5 rounded-2xl border border-gray-100">
                  <CheckCircle2 className="w-4 h-4 text-[#0038FF] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span className="leading-snug">{doc}</span>
                </div>
              ))}
            </div>

            {/* Statutory Note */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-bold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="leading-snug">
                Fixed deposits cannot be prematurely encashed, pledged, or modified without prior written authorization from AICTE.
              </span>
            </div>

          </div>

        </div>
      </div>

    </section>
  );
};

export default RegulatoryLifecycleGuide;
