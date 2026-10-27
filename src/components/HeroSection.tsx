import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Landmark, 
  Plus, 
  ArrowRight, 
  FileCheck2, 
  Lock, 
  Sparkles
} from 'lucide-react';
import { UserRole } from '../types';
import { 
  ArrowGreenLeft, 
  ArrowGreenRight, 
  CircularBadge, 
  textShadow3D 
} from './ui/HandDrawnAccents';

interface HeroSectionProps {
  currentRole: UserRole;
  onOpenRegisterModal: () => void;
  onNavigateToTab: (tab: string) => void;
  totalDepositAmount: number;
  activeCount: number;
  expiringCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenRegisterModal,
  onNavigateToTab,
  totalDepositAmount,
  activeCount,
  expiringCount
}) => {
  const formatAmount = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
    return `₹${(val / 100000).toFixed(1)}L`;
  };

  return (
    <div className="relative pt-4 pb-20 md:pt-8 md:pb-28 px-4 flex flex-col items-center justify-center w-full max-w-[1440px] mx-auto text-white select-none">
      
      {/* Top Pill Announcement */}
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-white text-black font-black tracking-tight text-xs md:text-sm px-3.5 py-1.5 rounded-2xl rounded-bl-sm relative shadow-md">
          AICTE
          <div 
            className="absolute -bottom-1.5 left-0 w-3 h-3 bg-white" 
            style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
          />
        </div>
        <div className="bg-[#CCFF00] text-black font-black text-xs md:text-sm px-4 py-1.5 rounded-full border-[1.5px] border-white shadow-md flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          <span>KOSH-GUARD ESCROW PORTAL</span>
        </div>
        <span className="hidden sm:inline-block px-3 py-1 rounded-full border border-white/30 text-white/90 text-[11px] font-bold backdrop-blur-sm">
          APH 2024-27 Clause 1.12
        </span>
      </div>

      {/* Massive Typography & Elements Container */}
      <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center z-10 mt-2 mb-12">
        
        {/* Text Stack */}
        <div className="w-full flex flex-col items-center relative z-10 space-y-1 md:space-y-3">
          
          {/* #AICTE */}
          <div className="w-full flex justify-start pl-[6%] md:pl-[18%] relative z-30">
            <h1 
              className="text-[clamp(3.75rem,11vw,150px)] font-black leading-[0.85] tracking-tighter text-[#CCFF00] m-0 p-0 uppercase"
              style={{ 
                fontFamily: '"Arial Black", Impact, sans-serif',
                ...textShadow3D
              }}
            >
              #AICTE
            </h1>
          </div>
          
          {/* STATUTORY */}
          <div className="w-full flex justify-center relative z-20">
            <h1 
              className="text-[clamp(4.25rem,14vw,200px)] font-black leading-[0.85] tracking-tighter text-white m-0 p-0 uppercase"
              style={{ 
                fontFamily: '"Arial Black", Impact, sans-serif',
                ...textShadow3D
              }}
            >
              STATUTORY
            </h1>
          </div>
          
          {/* DEPOSITS */}
          <div className="w-full flex justify-start pl-[12%] md:pl-[26%] relative z-10">
            <h1 
              className="text-[clamp(3.75rem,11vw,150px)] font-black leading-[0.85] tracking-tighter text-white m-0 p-0 uppercase"
              style={{ 
                fontFamily: '"Arial Black", Impact, sans-serif',
                ...textShadow3D
              }}
            >
              DEPOSITS
            </h1>
          </div>

        </div>

        {/* Absolute Overlays (Cards, Arrows, Badge) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          
          {/* Floating Glass Card 1 (Bottom Left) */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[2%] left-[-2%] md:left-[8%] z-30 pointer-events-auto"
          >
            <div className="w-44 md:w-56 aspect-[3/3.5] bg-white/20 backdrop-blur-md border border-white/40 rounded-[2rem] p-5 flex flex-col items-center justify-center rotate-[-12deg] shadow-2xl hover:rotate-0 transition-transform duration-500 cursor-pointer">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-[#CCFF00] rounded-full flex items-center justify-center mb-3 shadow-inner border-[3px] border-white/60 overflow-hidden text-black font-black">
                <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-black stroke-[2.5]" />
              </div>
              <div className="text-center mt-1">
                <p className="font-black text-xs md:text-sm text-white truncate max-w-[170px]">bits-pilani.fdr</p>
                <p className="text-[10px] md:text-xs text-[#CCFF00] font-black mt-0.5">₹2,50,00,000</p>
                <span className="inline-block mt-2 text-[9px] font-black uppercase px-2 py-0.5 bg-white text-black rounded-full shadow-xs">
                  Dual-Truth Verified
                </span>
              </div>
            </div>
          </motion.div>

          {/* Floating Glass Card 2 (Top Right) */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[8%] right-[-2%] md:right-[10%] z-30 pointer-events-auto"
          >
            <div className="w-44 md:w-56 aspect-[3/3.5] bg-white/20 backdrop-blur-md border border-white/40 rounded-[2rem] p-5 flex flex-col items-center justify-center rotate-[12deg] shadow-2xl hover:rotate-0 transition-transform duration-500 cursor-pointer">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mb-3 shadow-inner border-[3px] border-white/60 overflow-hidden text-[#0038FF]">
                <Landmark className="w-8 h-8 md:w-10 md:h-10 text-[#0038FF] stroke-[2.5]" />
              </div>
              <div className="text-center mt-1">
                <p className="font-black text-xs md:text-sm text-white truncate max-w-[170px]">nesl-ebg.sbi</p>
                <p className="text-[10px] md:text-xs text-[#CCFF00] font-black mt-0.5">₹1,80,00,000</p>
                <span className="inline-block mt-2 text-[9px] font-black uppercase px-2 py-0.5 bg-[#CCFF00] text-black rounded-full shadow-xs">
                  Track A e-BG Sealing
                </span>
              </div>
            </div>
          </motion.div>

          {/* Decorative Arrow Left */}
          <div className="absolute bottom-[-5%] left-[-4%] md:left-[2%] w-24 h-24 md:w-32 md:h-32 z-20">
            <ArrowGreenLeft />
          </div>

          {/* Decorative Arrow Right */}
          <div className="absolute top-[0%] right-[-4%] md:right-[2%] w-24 h-24 md:w-32 md:h-32 z-20">
            <ArrowGreenRight />
          </div>

          {/* Circular Badge */}
          <div className="absolute bottom-[-15%] right-[2%] md:right-[8%] z-40 pointer-events-auto">
            <CircularBadge 
              text="AICTE FDR ESCROW PORTAL • APH 2024-27 • " 
              onClick={onOpenRegisterModal}
            />
          </div>

        </div>
      </div>

      {/* Description & Action Buttons */}
      <div className="relative z-20 flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto pt-2">
        <p className="text-sm md:text-base text-white/90 font-bold max-w-2xl leading-relaxed">
          National regulatory infrastructure enforcing Clause 1.12 dual-custody joint lien protocols across technical colleges, depository banks, and Core Banking Systems.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-1">
          <button
            onClick={onOpenRegisterModal}
            className="px-7 py-3.5 rounded-full bg-[#CCFF00] text-black font-black text-xs md:text-sm uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-[0_8px_25px_rgba(204,255,0,0.35)] flex items-center gap-2 cursor-pointer border-2 border-white"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Register New Deposit</span>
          </button>

          <button
            onClick={() => onNavigateToTab('verification')}
            className="px-7 py-3.5 rounded-full bg-white text-black font-black text-xs md:text-sm uppercase tracking-wide hover:bg-white/90 active:scale-95 transition-all shadow-lg flex items-center gap-2 cursor-pointer border-2 border-transparent"
          >
            <FileCheck2 className="w-4 h-4 text-[#0038FF] stroke-[2.5]" />
            <span>Review Queue</span>
          </button>

          <button
            onClick={() => onNavigateToTab('reports')}
            className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/40 text-white font-bold text-xs md:text-sm transition-all backdrop-blur-md cursor-pointer flex items-center gap-1.5"
          >
            <span>Executive KPIs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Live Metrics Pill Strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <div className="flex items-center bg-white/15 backdrop-blur-md border border-white/30 rounded-full px-4 py-1.5 text-xs text-white">
            <span className="text-white/70 font-semibold mr-2">Total Escrow Vault:</span>
            <span className="font-black text-[#CCFF00]">{formatAmount(totalDepositAmount)}</span>
          </div>

          <div className="flex items-center bg-white/15 backdrop-blur-md border border-white/30 rounded-full px-4 py-1.5 text-xs text-white">
            <span className="text-white/70 font-semibold mr-2">Active Instruments:</span>
            <span className="font-black text-white">{activeCount} Verified</span>
          </div>

          <div className="flex items-center bg-white/15 backdrop-blur-md border border-white/30 rounded-full px-4 py-1.5 text-xs text-white">
            <span className="text-white/70 font-semibold mr-2">Maturity Surveillance:</span>
            <span className="font-black text-[#CCFF00]">{expiringCount} Due</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default HeroSection;
