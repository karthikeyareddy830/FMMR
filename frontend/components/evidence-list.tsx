"use client"

import { useState } from "react"
import { FileText, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface Source {
  text: string
  score: number
}

interface EvidenceListProps {
  sources: Source[]
  className?: string
}

export function EvidenceList({ sources, className }: EvidenceListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "#10b981" // bio-green
    if (score >= 0.6) return "#f59e0b" // amber
    return "#ef4444" // red
  }

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className={cn("glass rounded-2xl p-6", className)}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
            <FileText className="h-4 w-4 text-secondary-foreground" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Retrieved Medical Evidence
          </h3>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 font-mono text-xs text-muted-foreground">
          {sources.length} sources
        </span>
      </div>
      
      {/* Evidence cards */}
      <div className="space-y-3">
        {sources.map((source, index) => {
          const color = getScoreColor(source.score)
          const isExpanded = expandedIndex === index
          const isLong = source.text.length > 200
          
          return (
            <div
              key={index}
              className={cn(
                "glass-hover group cursor-pointer rounded-xl border-l-2 p-4 transition-all",
                "animate-fade-up"
              )}
              style={{ 
                borderLeftColor: color,
                animationDelay: `${index * 100}ms`,
              }}
              onClick={() => isLong && toggleExpand(index)}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Score badge */}
                <div className="flex items-center gap-2">
                  <div 
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span 
                    className="font-mono text-sm font-semibold"
                    style={{ color }}
                  >
                    {source.score.toFixed(2)}
                  </span>
                </div>
                
                {/* Expand icon for long text */}
                {isLong && (
                  <button className="text-muted-foreground transition-colors hover:text-foreground">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
              
              {/* Source text */}
              <p className={cn(
                "mt-2 text-sm leading-relaxed text-foreground/80",
                !isExpanded && isLong && "line-clamp-3"
              )}>
                {source.text}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
