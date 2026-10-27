import React from 'react';
import { 
  FileCheck, 
  Clock, 
  GitFork, 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  Bug,
  Sparkles,
  Play
} from 'lucide-react';

export interface ScenarioItem {
  id: number;
  title: string;
  shortDesc: string;
  badge: string;
  action: () => void;
}

interface InteractiveScenariosBarProps {
  onRunScenario: (scenarioId: number) => void;
}

export const InteractiveScenariosBar: React.FC<InteractiveScenariosBarProps> = ({
  onRunScenario
}) => {
  const scenarios = [
    {
      id: 1,
      title: '1. New FDR Submission & Extraction',
      badge: 'Auto-Triage',
      icon: FileCheck
    },
    {
      id: 2,
      title: '2. Track A NeSL e-BG Verification',
      badge: 'Digital e-BG',
      icon: CheckCircle
    },
    {
      id: 3,
      title: '3. Approaching Maturity (T-30 SLA)',
      badge: 'Escalation',
      icon: Clock
    },
    {
      id: 4,
      title: '4. Renewal Lineage (Parent-Child)',
      badge: 'Custody Chain',
      icon: GitFork
    },
    {
      id: 5,
      title: '5. Discrepancy & Dual-Truth',
      badge: 'Lien Mismatch',
      icon: AlertTriangle
    },
    {
      id: 6,
      title: '6. Authorized Release + QR Order',
      badge: 'Multi-Cell Clearance',
      icon: CheckCircle
    },
    {
      id: 7,
      title: '7. Duplicate Deposit Blocked',
      badge: 'SHA-256 + ELA',
      icon: Copy
    },
    {
      id: 8,
      title: '8. Live DB Tamper Detection Drill',
      badge: 'WORM Chain',
      icon: Bug
    }
  ];

  return (
    <div className="bg-[#0038FF] text-white rounded-[2rem] p-6 md:p-8 border-[3px] border-black/10 shadow-xl relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="bg-[#CCFF00] text-black font-black p-2.5 rounded-2xl shadow-md rotate-[-6deg]">
            <Play className="w-5 h-5 fill-black stroke-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg md:text-xl uppercase tracking-tight text-white">
                Live Simulation Testbed
              </h3>
              <span className="bg-[#CCFF00] text-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-black/20">
                8 Scenarios
              </span>
            </div>
            <p className="text-xs text-white/80 font-bold mt-0.5">
              Click any scenario to simulate end-to-end verification workflows, forensic checks, or cryptographic tamper alarms
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/30 text-[11px] font-black text-[#CCFF00] shrink-0">
          APH 2024-27 Clause 1.12 · 100% Traceable
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-5">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => onRunScenario(sc.id)}
              className="text-left bg-white text-black hover:bg-[#CCFF00] rounded-2xl p-3.5 transition-all duration-200 flex flex-col justify-between group cursor-pointer shadow-md border-2 border-black/5 hover:-translate-y-1 active:translate-y-0"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="w-7 h-7 rounded-full bg-[#0038FF] text-white flex items-center justify-center group-hover:bg-black group-hover:text-[#CCFF00] transition-colors">
                  <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white transition-colors">
                  {sc.badge}
                </span>
              </div>
              <div className="text-xs font-black leading-snug group-hover:text-black">
                {sc.title}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveScenariosBar;
