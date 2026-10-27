import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface TooltipProviderProps {
  children: React.ReactNode
  delayDuration?: number
}

interface TooltipContextType {
  open: boolean
  setOpen: (open: boolean) => void
  delayDuration: number
}

const TooltipContext = React.createContext<TooltipContextType | undefined>(undefined)

export const TooltipProvider: React.FC<TooltipProviderProps> = ({
  children,
  delayDuration = 100,
}) => {
  return (
    <div className="contents">
      {children}
    </div>
  )
}

interface TooltipProps {
  children: React.ReactNode
  delayDuration?: number
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  delayDuration = 100,
  open: controlledOpen,
  onOpenChange,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      if (newOpen) {
        timeoutRef.current = setTimeout(() => {
          if (!isControlled) setUncontrolledOpen(true)
          onOpenChange?.(true)
        }, delayDuration)
      } else {
        if (!isControlled) setUncontrolledOpen(false)
        onOpenChange?.(false)
      }
    },
    [delayDuration, isControlled, onOpenChange]
  )

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <TooltipContext.Provider value={{ open, setOpen, delayDuration }}>
      <div className="relative inline-flex items-center justify-center overflow-visible">
        {children}
      </div>
    </TooltipContext.Provider>
  )
}

export interface TooltipTriggerProps
  extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
  children: React.ReactNode
}

export const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ asChild, children, className, ...props }, ref) => {
    const context = React.useContext(TooltipContext)
    if (!context) {
      throw new Error("TooltipTrigger must be used within Tooltip")
    }

    const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
      context.setOpen(true)
      props.onMouseEnter?.(e)
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
      context.setOpen(false)
      props.onMouseLeave?.(e)
    }

    const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
      context.setOpen(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
      context.setOpen(false)
      props.onBlur?.(e)
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ref,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleFocus,
        onBlur: handleBlur,
        ...props,
        className: cn(children.props.className, className),
      })
    }

    return (
      <div
        ref={ref as any}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn("inline-flex items-center justify-center cursor-pointer", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TooltipTrigger.displayName = "TooltipTrigger"

export interface TooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side = "bottom", sideOffset = 8, children, ...props }, ref) => {
    const context = React.useContext(TooltipContext)
    if (!context) {
      throw new Error("TooltipContent must be used within Tooltip")
    }

    const positionClasses = {
      top: "bottom-full left-1/2 mb-2.5",
      bottom: "top-full left-1/2 mt-2.5",
      left: "right-full top-1/2 mr-2.5",
      right: "left-full top-1/2 ml-2.5",
    }

    const initialOffset = {
      top: { x: "-50%", y: 4, opacity: 0, scale: 0.94 },
      bottom: { x: "-50%", y: -4, opacity: 0, scale: 0.94 },
      left: { x: 4, y: "-50%", opacity: 0, scale: 0.94 },
      right: { x: -4, y: "-50%", opacity: 0, scale: 0.94 },
    }

    const animateTarget = {
      top: { x: "-50%", y: 0, opacity: 1, scale: 1 },
      bottom: { x: "-50%", y: 0, opacity: 1, scale: 1 },
      left: { x: 0, y: "-50%", opacity: 1, scale: 1 },
      right: { x: 0, y: "-50%", opacity: 1, scale: 1 },
    }

    return (
      <AnimatePresence>
        {context.open && (
          <motion.div
            ref={ref}
            initial={initialOffset[side]}
            animate={animateTarget[side]}
            exit={initialOffset[side]}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className={cn(
              "absolute z-50 pointer-events-none whitespace-nowrap rounded-xl",
              "bg-slate-900/95 text-white font-heading font-medium text-[11px] tracking-wide",
              "px-3 py-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.2),0_2px_6px_rgba(0,0,0,0.12)] border border-slate-700/80 backdrop-blur-md",
              "flex items-center gap-1.5 select-none",
              positionClasses[side],
              className
            )}
            role="tooltip"
            {...(props as any)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
)
TooltipContent.displayName = "TooltipContent"
