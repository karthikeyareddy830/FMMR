"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnalogGaugeProps {
  score: number
  sourcesCount?: number
  className?: string
}

export function AnalogGauge({ score, sourcesCount = 3, className }: AnalogGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  
  // Animate the score on mount
  useEffect(() => {
    const duration = 1200
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(score * eased)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [score])

  // Determine zone color based on score
  const getZoneColor = (score: number) => {
    if (score >= 70) return { color: "#10b981", label: "High confidence — strong evidence match" }
    if (score >= 40) return { color: "#f59e0b", label: "Moderate confidence — review sources" }
    return { color: "#ef4444", label: "Low confidence — consult a doctor" }
  }

  const { color: zoneColor, label: confidenceLabel } = getZoneColor(score)
  
  // SVG parameters for the semicircular gauge
  const width = 280
  const height = 160
  const centerX = width / 2
  const centerY = 140
  const radius = 110
  const strokeWidth = 16
  
  // Arc helper function
  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = (angle - 180) * Math.PI / 180
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    }
  }
  
  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, startAngle)
    const end = polarToCartesian(cx, cy, r, endAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
  }
  
  // Calculate needle rotation (0% = -90deg, 100% = 90deg, so 180deg sweep)
  const needleRotation = -90 + (animatedScore / 100) * 180
  
  // Zone boundaries (in degrees, 0-180 mapped to the semicircle)
  // 0-40% = Red, 40-70% = Amber, 70-100% = Green
  const zones = [
    { start: 0, end: 72, color: "#ef4444" },    // 0-40% (Red)
    { start: 72, end: 126, color: "#f59e0b" },   // 40-70% (Amber)
    { start: 126, end: 180, color: "#10b981" },  // 70-100% (Green)
  ]

  return (
    <div 
      className={cn("glass rounded-2xl p-6", className)}
      style={{
        boxShadow: `0 0 40px ${zoneColor}20, inset 0 0 30px ${zoneColor}08`,
      }}
    >
      <h3 className="mb-4 text-center font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Confidence Score
      </h3>
      
      <div className="relative mx-auto" style={{ width, height: height + 20 }}>
        <svg width={width} height={height} className="overflow-visible">
          {/* Background track */}
          <path
            d={describeArc(centerX, centerY, radius, 0, 180)}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Colored zone segments */}
          {zones.map((zone, i) => (
            <path
              key={i}
              d={describeArc(centerX, centerY, radius, zone.start, zone.end)}
              fill="none"
              stroke={zone.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              opacity={0.3}
            />
          ))}
          
          {/* Active progress arc */}
          <path
            d={describeArc(centerX, centerY, radius, 0, (animatedScore / 100) * 180)}
            fill="none"
            stroke={zoneColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 12px ${zoneColor}80)`,
            }}
          />
          
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = (tick / 100) * 180
            const innerPoint = polarToCartesian(centerX, centerY, radius - strokeWidth / 2 - 8, angle)
            const outerPoint = polarToCartesian(centerX, centerY, radius - strokeWidth / 2 - 2, angle)
            return (
              <line
                key={tick}
                x1={innerPoint.x}
                y1={innerPoint.y}
                x2={outerPoint.x}
                y2={outerPoint.y}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={2}
              />
            )
          })}
          
          {/* Needle */}
          <g 
            style={{
              transform: `rotate(${needleRotation}deg)`,
              transformOrigin: `${centerX}px ${centerY}px`,
              transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Needle body */}
            <line
              x1={centerX}
              y1={centerY}
              x2={centerX}
              y2={centerY - radius + 25}
              stroke={zoneColor}
              strokeWidth={4}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 8px ${zoneColor}80)`,
              }}
            />
            {/* Needle point */}
            <polygon
              points={`${centerX},${centerY - radius + 18} ${centerX - 6},${centerY - radius + 35} ${centerX + 6},${centerY - radius + 35}`}
              fill={zoneColor}
              style={{
                filter: `drop-shadow(0 0 8px ${zoneColor}80)`,
              }}
            />
          </g>
          
          {/* Center cap */}
          <circle
            cx={centerX}
            cy={centerY}
            r={12}
            fill="#1a1f2e"
            stroke={zoneColor}
            strokeWidth={3}
            style={{
              filter: `drop-shadow(0 0 10px ${zoneColor}60)`,
            }}
          />
        </svg>
        
        {/* Score display */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <span 
            className="font-mono text-5xl font-bold"
            style={{ color: zoneColor }}
          >
            {Math.round(animatedScore)}%
          </span>
        </div>
      </div>
      
      {/* Confidence label */}
      <p 
        className="mt-2 text-center text-sm font-medium"
        style={{ color: zoneColor }}
      >
        {confidenceLabel}
      </p>
      
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Based on {sourcesCount} retrieved sources
      </p>
    </div>
  )
}
