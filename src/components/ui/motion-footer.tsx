"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, FileCheck, Landmark, ArrowUpRight, Lock, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Register ScrollTrigger safely for React
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------------------
// 1. THEME-ADAPTIVE INLINE STYLES
// -------------------------------------------------------------------------
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  
  --foreground: #ffffff;
  --background: #001A99;
  --primary: #CCFF00;
  --secondary: #0038FF;
  --destructive: #ff3366;

  /* Neobrutalist Electric Blue & Neon Green Variables */
  --pill-bg-1: rgba(255, 255, 255, 0.15);
  --pill-bg-2: rgba(255, 255, 255, 0.08);
  --pill-shadow: rgba(0, 0, 0, 0.3);
  --pill-highlight: rgba(255, 255, 255, 0.3);
  --pill-inset-shadow: rgba(255, 255, 255, 0.05);
  --pill-border: rgba(255, 255, 255, 0.25);
  
  --pill-bg-1-hover: #CCFF00;
  --pill-bg-2-hover: #b8e600;
  --pill-border-hover: #CCFF00;
  --pill-shadow-hover: rgba(204, 255, 0, 0.4);
  --pill-highlight-hover: #ffffff;
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.9; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(204, 255, 0, 0.5)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 8px rgba(204, 255, 0, 0.8)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 35s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

/* Theme-adaptive Grid Background */
.footer-bg-grid {
  background-size: 60px 60px;
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 25%, black 75%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 25%, black 75%, transparent);
}

/* Theme-adaptive Aurora Glow */
.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%, 
    rgba(0, 56, 255, 0.4) 0%, 
    rgba(204, 255, 0, 0.15) 35%, 
    transparent 70%
  );
}

/* Glass Pill Theming */
.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow: 
      0 4px 16px -2px var(--pill-shadow), 
      inset 0 1px 1px var(--pill-highlight);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  color: var(--foreground);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow: 
      0 12px 28px -4px var(--pill-shadow-hover), 
      inset 0 1px 1px var(--pill-highlight-hover);
  color: #000000;
}

/* Giant Background Text Masking */
.footer-giant-bg-text {
  font-size: 14vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(15, 23, 42, 0.05);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* Clean Dark Heading Text */
.footer-text-glow {
  color: #0f172a;
  filter: drop-shadow(0px 2px 8px rgba(15, 23, 42, 0.08));
}
`;

// -------------------------------------------------------------------------
// 2. MAGNETIC BUTTON PRIMITIVE (Zero Dependency)
// -------------------------------------------------------------------------
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & 
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

export const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          gsap.to(element, {
            x: x * 0.4,
            y: y * 0.4,
            rotationX: -y * 0.15,
            rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out",
            duration: 0.4,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };

        element.addEventListener("mousemove", handleMouseMove as EventListener);
        element.addEventListener("mouseleave", handleMouseLeave as EventListener);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove as EventListener);
          element.removeEventListener("mouseleave", handleMouseLeave as EventListener);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement | null) => {
          (localRef as any).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as any).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// -------------------------------------------------------------------------
// 3. MAIN COMPONENT
// -------------------------------------------------------------------------
const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>Statutory Compliance Guaranteed</span> <span className="text-primary/70">✦</span>
    <span>Joint Lien Endorsement</span> <span className="text-secondary/70">✦</span>
    <span>Real-Time Bank Verification</span> <span className="text-primary/70">✦</span>
    <span>Automated Maturity Alerts</span> <span className="text-secondary/70">✦</span>
    <span>Zero Penalty Governance</span> <span className="text-primary/70">✦</span>
    <span>Immutable Audit Trail</span> <span className="text-primary/70">✦</span>
  </div>
);

export interface CinematicFooterProps {
  onOpenRegisterModal?: () => void;
  onNavigateToTab?: (tab: string) => void;
  headline?: string;
  giantText?: string;
}

export function CinematicFooter({
  onOpenRegisterModal,
  onNavigateToTab,
  headline = "Ready to begin?",
  giantText = "FINTRACK",
}: CinematicFooterProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    // React strict mode compatible GSAP context cleanup
    const ctx = gsap.context(() => {
      // Background Parallax
      if (giantTextRef.current) {
        gsap.fromTo(
          giantTextRef.current,
          { y: "5vh", scale: 0.9, opacity: 0 },
          {
            y: "0vh",
            scale: 1,
            opacity: 1,
            ease: "power1.out",
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: "top 85%",
              end: "bottom bottom",
              scrub: 1,
            },
          }
        );
      }

      // Staggered Content Reveal
      if (headingRef.current && linksRef.current) {
        gsap.fromTo(
          [headingRef.current, linksRef.current],
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: "top 70%",
              end: "bottom bottom",
              scrub: 1,
            },
          }
        );
      }
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      
      {/* 
        The "Curtain Reveal" Wrapper:
        It sits in standard flow. Because it has clip-path, its contents
        are ONLY visible within its bounding box. 
      */}
      <div
        ref={wrapperRef}
        className="relative min-h-[460px] sm:min-h-[500px] h-[52vh] sm:h-[56vh] w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        {/* The actual footer stays fixed to the viewport underneath everything */}
        <footer className="fixed bottom-0 left-0 flex h-[52vh] sm:h-[56vh] min-h-[460px] sm:min-h-[500px] w-full flex-col justify-between overflow-hidden bg-[#001A99] text-white cinematic-footer-wrapper z-0">
          
          {/* Ambient Light & Grid Background */}
          <div className="footer-aurora absolute left-1/2 top-1/2 h-[45vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[70px] pointer-events-none z-0" />
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

          {/* Giant background text */}
          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute -bottom-[2vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none tracking-tighter text-white/5"
          >
            {giantText}
          </div>

          {/* 1. Diagonal Sleek Marquee (Top of footer) */}
          <div className="absolute top-4 sm:top-5 left-0 w-full overflow-hidden border-y border-white/20 bg-[#0038FF]/80 backdrop-blur-md py-2 sm:py-2.5 z-10 -rotate-1 scale-105 shadow-md">
            <div className="flex w-max animate-footer-scroll-marquee text-[11px] sm:text-xs font-black tracking-[0.2em] text-[#CCFF00] uppercase">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          {/* 2. Main Center Content (Scaled to compact balanced size) */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 sm:px-6 mt-12 sm:mt-14 mb-2 w-full max-w-[1472px] mx-auto">
            <h2
              ref={headingRef}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-5 sm:mb-6 text-center uppercase"
              style={{
                fontFamily: '"Arial Black", Impact, sans-serif',
                textShadow: '1px 1px 0 #000d4d, 2px 2px 0 #000d4d, 3px 3px 0 #000d4d, 4px 4px 0 #000d4d'
              }}
            >
              {headline}
            </h2>

            {/* Interactive Magnetic Pills Layout */}
            <div ref={linksRef} className="flex flex-col items-center gap-3.5 sm:gap-4 w-full">
              {/* Primary Actions (Pills) */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-3.5 w-full">
                {onOpenRegisterModal ? (
                  <MagneticButton
                    as="button"
                    onClick={onOpenRegisterModal}
                    className="footer-glass-pill px-6 sm:px-7 py-3 sm:py-3.5 rounded-full text-slate-900 font-bold text-xs sm:text-sm flex items-center gap-2.5 group"
                  >
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 group-hover:text-teal-700 transition-colors" />
                    <span>Register FDR Deposit</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                  </MagneticButton>
                ) : (
                  <MagneticButton
                    as="a"
                    href="#register"
                    className="footer-glass-pill px-6 sm:px-7 py-3 sm:py-3.5 rounded-full text-slate-900 font-bold text-xs sm:text-sm flex items-center gap-2.5 group"
                  >
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 group-hover:text-teal-700 transition-colors" />
                    <span>Register FDR Deposit</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                  </MagneticButton>
                )}
                
                <MagneticButton
                  as="button"
                  onClick={() => onNavigateToTab?.('instruments')}
                  className="footer-glass-pill px-6 sm:px-7 py-3 sm:py-3.5 rounded-full text-slate-900 font-bold text-xs sm:text-sm flex items-center gap-2.5 group"
                >
                  <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 group-hover:text-sky-700 transition-colors" />
                  <span>Verify Instruments</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </MagneticButton>

                <MagneticButton
                  as="button"
                  onClick={() => onNavigateToTab?.('institutions')}
                  className="footer-glass-pill px-6 sm:px-7 py-3 sm:py-3.5 rounded-full text-slate-900 font-bold text-xs sm:text-sm flex items-center gap-2.5 group"
                >
                  <Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 group-hover:text-teal-700 transition-colors" />
                  <span>Institutions Directory</span>
                </MagneticButton>
              </div>

              {/* Secondary Navigation Links */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full mt-0.5">
                <MagneticButton
                  as="button"
                  onClick={() => onNavigateToTab?.('audit')}
                  className="footer-glass-pill px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-muted-foreground font-medium text-[11px] sm:text-xs hover:text-foreground flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3 text-accent" />
                  <span>Audit Trail</span>
                </MagneticButton>

                <MagneticButton
                  as="button"
                  onClick={() => onNavigateToTab?.('lifecycle')}
                  className="footer-glass-pill px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-muted-foreground font-medium text-[11px] sm:text-xs hover:text-foreground"
                >
                  Regulatory Norms
                </MagneticButton>

                <MagneticButton
                  as="button"
                  onClick={() => onNavigateToTab?.('lifecycle')}
                  className="footer-glass-pill px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-muted-foreground font-medium text-[11px] sm:text-xs hover:text-foreground"
                >
                  Joint Lien Protocol
                </MagneticButton>

                <MagneticButton
                  as="button"
                  onClick={() => onNavigateToTab?.('ai-guide')}
                  className="footer-glass-pill px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-muted-foreground font-medium text-[11px] sm:text-xs hover:text-foreground flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3 h-3 text-secondary" />
                  <span>AI Compliance Desk</span>
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* 3. Bottom Bar / Credits */}
          <div className="relative z-20 w-full pb-5 sm:pb-6 px-4 md:px-10 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            
            {/* Copyright */}
            <div className="text-muted-foreground text-[10px] md:text-[11px] font-semibold tracking-wider uppercase order-2 md:order-1 text-center md:text-left">
              © {new Date().getFullYear()} FinTrack • AICTE Security Deposit Governance Portal
            </div>

            {/* "Made with Love" Badge */}
            <div className="footer-glass-pill px-4 sm:px-5 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 order-1 md:order-2 cursor-default border-border/50 text-[10px] sm:text-[11px]">
              <span className="text-muted-foreground font-bold uppercase tracking-wider">Crafted with</span>
              <span className="animate-footer-heartbeat text-xs sm:text-sm text-destructive">❤</span>
              <span className="text-muted-foreground font-bold uppercase tracking-wider">by</span>
              <span className="text-foreground font-black tracking-normal ml-0.5">FinTrack Systems</span>
            </div>

            {/* Back to top */}
            <MagneticButton
              as="button"
              onClick={scrollToTop}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full footer-glass-pill flex items-center justify-center text-muted-foreground hover:text-foreground group order-3"
              aria-label="Scroll back to top"
            >
              <svg className="w-4 h-4 transform group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
            </MagneticButton>

          </div>
        </footer>
      </div>
    </>
  );
}

export default CinematicFooter;
