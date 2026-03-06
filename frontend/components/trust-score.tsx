"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TrustScoreProps {
  score: number
  sourcesCount?: number
  className?: string
}

export function TrustScore({ score, sourcesCount = 3, className }: TrustScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  
  // Animate the score on mount
  useEffect(() => {
    const duration = 1500
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(score * eased))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [score])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981" // bio-green
    if (score >= 50) return "#f59e0b" // amber
    return "#ef4444" // red
  }

  const color = getScoreColor(score)
  
  // SVG circle parameters
  const size = 160
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progressOffset = circumference - (animatedScore / 100) * circumference

  return (
    <div className={cn("glass rounded-2xl p-6", className)}>
      <h3 className="mb-6 text-center font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Confidence Score
      </h3>
      
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg className="absolute inset-0" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
        </svg>
        
        {/* Progress circle */}
        <svg 
          className="absolute inset-0 -rotate-90" 
          width={size} 
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${color}40)`,
            }}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className="font-mono text-5xl font-bold"
            style={{ color }}
          >
            {animatedScore}
          </span>
          <span className="font-mono text-lg text-muted-foreground">%</span>
        </div>
      </div>
      
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Based on {sourcesCount} retrieved sources
      </p>
    </div>
  )
}
