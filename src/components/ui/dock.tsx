'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useState,
} from 'react';
import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
} from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

const DEFAULT_MAGNIFICATION = 70;
const DEFAULT_DISTANCE = 130;
const DEFAULT_PANEL_HEIGHT = 58;

export type DockProps = {
  children?: React.ReactNode;
  items?: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick?: () => void;
    badge?: number | string | null;
    badgeColor?: string;
  }[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

export type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  'aria-label'?: string;
};

export type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom';
};

export type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

type DockContextType = {
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  magnification: number;
  distance: number;
};

type DockProviderProps = {
  children: React.ReactNode;
  value: DockContextType;
};

const DockContext = createContext<DockContextType | undefined>(undefined);

function DockProvider({ children, value }: DockProviderProps) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within a DockProvider');
  }
  return context;
}

export function Dock({
  children,
  items,
  className,
  spring = { mass: 0.1, stiffness: 200, damping: 18 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  // If items array is passed directly (matching user's component pattern)
  if (items && items.length > 0) {
    return (
      <div className={cn("flex items-center justify-center w-full overflow-visible py-1", className)}>
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "flex items-center gap-2 sm:gap-3 px-4 py-2 rounded-full",
            "border border-slate-200/90 bg-white/95 backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] overflow-visible"
          )}
        >
          <TooltipProvider delayDuration={50}>
            {items.map((item, i) => {
              const isActive = active === item.label;
              const isHovered = hovered === i;
              const Icon = item.icon;

              return (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <motion.div
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                      animate={{
                        scale: isHovered ? 1.18 : 1,
                        rotate: isHovered ? -3 : 0,
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 20 }}
                      className="relative flex flex-col items-center"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "rounded-full relative w-10 h-10 transition-colors cursor-pointer",
                          isActive
                            ? "bg-teal-50 border-2 border-teal-400 text-teal-700 shadow-xs"
                            : "bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                          isHovered && "shadow-md shadow-teal-500/10"
                        )}
                        onClick={() => {
                          setActive(item.label);
                          item.onClick?.();
                        }}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 transition-colors stroke-[2.1]",
                            isActive ? "text-teal-600" : "text-slate-700"
                          )}
                        />
                        {/* Glowing ring effect */}
                        {isHovered && (
                          <motion.span
                            layoutId="glow"
                            className="absolute inset-0 rounded-full border border-teal-500/40 pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}

                        {/* Badge if present */}
                        {item.badge && (
                          <span
                            className={cn(
                              "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-heading font-bold flex items-center justify-center ring-2 ring-white shadow-xs",
                              item.badgeColor || "bg-teal-600"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Button>

                      {/* Active indicator dot */}
                      {isActive && (
                        <motion.div
                          layoutId="dot"
                          className="w-1.5 h-1.5 rounded-full bg-teal-600 absolute bottom-0.5"
                        />
                      )}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </motion.div>
      </div>
    );
  }

  // Children composition pattern
  return (
    <div
      style={{
        scrollbarWidth: 'none',
      }}
      className="mx-auto flex max-w-full items-center justify-center overflow-visible select-none py-1"
    >
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn(
          'relative flex w-fit items-center gap-1.5 sm:gap-2.5 rounded-full bg-white/95 border-3 border-black px-3 sm:px-4 py-1.5 shadow-[6px_6px_0px_#000000] backdrop-blur-2xl transition-all duration-200 overflow-visible',
          className
        )}
        style={{ minHeight: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        <DockProvider value={{ mouseX, spring, distance, magnification }}>
          <TooltipProvider delayDuration={50}>
            {children}
          </TooltipProvider>
        </DockProvider>
      </motion.div>
    </div>
  );
}

export function DockItem({ children, className, onClick, ...rest }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { distance, magnification, mouseX, spring } = useDock();

  const mouseDistance = useTransform(mouseX, (val) => {
    if (!Number.isFinite(val) || !ref.current) {
      return distance + 100;
    }
    const domRect = ref.current.getBoundingClientRect();
    return val - (domRect.left + domRect.width / 2);
  });

  const widthTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [40, magnification, 40],
    { clamp: true }
  );

  const width = useSpring(widthTransform, spring);

  return (
    <Tooltip open={isHovered}>
      <motion.div
        ref={ref}
        style={{ width, height: width }}
        whileTap={{ scale: 0.93 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        onClick={onClick}
        animate={{
          scale: isHovered ? 1.14 : 1,
          rotate: isHovered ? -2 : 0,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        className={cn(
          'relative inline-flex items-center justify-center cursor-pointer focus:outline-none shrink-0 select-none overflow-visible',
          isHovered && 'z-30 shadow-lg shadow-black/20',
          className
        )}
        tabIndex={0}
        role="button"
        aria-haspopup="true"
        {...rest}
      >
        {children}
        {/* Glowing ring effect on hover */}
        {isHovered && (
          <motion.span
            layoutId="dock-hover-glow"
            className="absolute inset-0 rounded-full border-2 border-[#CCFF00] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </motion.div>
    </Tooltip>
  );
}

export function DockLabel({ children, className, side = 'bottom' }: DockLabelProps) {
  return (
    <TooltipContent
      side={side}
      className={cn(
        "font-sans font-black text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-xl whitespace-nowrap shadow-[4px_4px_0px_#000] border-2 border-[#CCFF00]",
        "bg-black text-[#CCFF00]",
        className
      )}
    >
      {children}
    </TooltipContent>
  );
}

export function DockIcon({ children, className }: DockIconProps) {
  return (
    <div
      className={cn('flex items-center justify-center shrink-0 text-current w-full h-full p-2', className)}
    >
      {children}
    </div>
  );
}

export default Dock;
