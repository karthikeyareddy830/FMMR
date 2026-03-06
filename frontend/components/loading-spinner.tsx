"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  }

  const circleSizes = {
    sm: { outer: 14, middle: 10, inner: 6 },
    md: { outer: 28, middle: 20, inner: 12 },
    lg: { outer: 42, middle: 30, inner: 18 },
  }

  const circles = circleSizes[size]

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Outer ripple */}
        <div 
          className="ripple absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00d4ff]/40"
          style={{ width: circles.outer, height: circles.outer }}
        />
        {/* Middle ripple */}
        <div 
          className="ripple ripple-delay-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00d4ff]/30"
          style={{ width: circles.middle, height: circles.middle }}
        />
        {/* Inner ripple */}
        <div 
          className="ripple ripple-delay-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00d4ff]/20"
          style={{ width: circles.inner, height: circles.inner }}
        />
        {/* Center dot */}
        <div 
          className="pulse-glow absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00d4ff]"
        />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
}
