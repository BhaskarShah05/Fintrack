import React from 'react';

// --- Custom SVG Components for Hand-Drawn Accents ---

export const ArrowGreenLeft: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={`${className} text-[#CCFF00] stroke-current overflow-visible`} 
    fill="none" 
    strokeWidth="6" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M10,90 C 10,40 40,20 60,50 C 70,65 80,75 95,70" />
    <path d="M80,55 L95,70 L85,85" />
  </svg>
);

export const ArrowGreenRight: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={`${className} text-[#CCFF00] stroke-current overflow-visible`} 
    fill="none" 
    strokeWidth="6" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M90,10 C 80,60 60,80 40,60 C 20,40 40,20 60,30 C 80,40 70,70 50,80" />
    <path d="M65,75 L50,80 L55,65" />
  </svg>
);

export const ArrowBlack1: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={`${className} text-black stroke-current overflow-visible`} 
    fill="none" 
    strokeWidth="5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M20,80 Q 40,20 80,40" />
    <path d="M60,20 L80,40 L50,60" />
  </svg>
);

export const ArrowBlack2: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={`${className} text-black stroke-current overflow-visible`} 
    fill="none" 
    strokeWidth="5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M20,80 Q 40,20 80,40" />
    <path d="M60,20 L80,40 L50,60" />
  </svg>
);

export const CircularBadge: React.FC<{
  text?: string;
  onClick?: () => void;
  className?: string;
}> = ({
  text = "AICTE FDR ESCROW PORTAL • APH 2024-27 • ",
  onClick,
  className = ""
}) => (
  <div 
    onClick={onClick}
    className={`relative w-28 h-28 md:w-36 md:h-36 bg-[#CCFF00] rounded-full flex items-center justify-center shadow-xl rotate-12 hover:scale-105 transition-transform cursor-pointer border-[3px] border-black/10 select-none ${className}`}
  >
    <div className="absolute inset-1 animate-[spin_12s_linear_infinite]">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path id="circlePath" d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" fill="none" />
        <text className="text-[10px] font-black tracking-[0.18em] uppercase" fill="black">
          <textPath href="#circlePath" startOffset="0%">
            {text}
          </textPath>
        </text>
      </svg>
    </div>
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg viewBox="0 0 100 100" className="w-10 h-10 text-black stroke-current overflow-visible" fill="none" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20,80 Q 40,50 30,30 T 80,20" />
        <path d="M60,10 L80,20 L70,40" />
      </svg>
    </div>
  </div>
);

export const textShadow3D = {
  textShadow: '1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99, 6px 6px 0 #001A99, 7px 7px 0 #001A99, 8px 8px 0 #001A99, 9px 9px 0 #001A99, 10px 10px 0 #001A99, 11px 11px 0 #001A99, 12px 12px 0 #001A99, 13px 13px 0 #001A99, 14px 14px 0 #001A99'
};

export const textShadow3DBlack = {
  textShadow: '1px 1px 0 #000, 2px 2px 0 #000, 3px 3px 0 #000, 4px 4px 0 #000, 5px 5px 0 #000, 6px 6px 0 #000, 7px 7px 0 #000, 8px 8px 0 #000'
};
