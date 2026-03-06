"use client"

import { useEffect, useState } from "react"
import { Brain, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResultCardProps {
  answer: string
  className?: string
}

export function ResultCard({ answer, className }: ResultCardProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showSources, setShowSources] = useState(false)

  // Typewriter effect
  useEffect(() => {
    if (!answer) return
    
    setDisplayedText("")
    setIsTyping(true)
    
    let index = 0
    const speed = 15 // ms per character
    
    const timer = setInterval(() => {
      if (index < answer.length) {
        setDisplayedText(answer.slice(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(timer)
      }
    }, speed)
    
    return () => clearInterval(timer)
  }, [answer])

  return (
    <div className={cn("glass glass-hover rounded-2xl p-6 transition-all", className)}>
      {/* Header badge */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00d4ff]/10">
          <Brain className="h-4 w-4 text-[#00d4ff]" />
        </div>
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00d4ff]">
          AI Analysis
        </span>
      </div>
      
      {/* Answer text with typewriter effect */}
      <div className="min-h-[120px]">
        <p className={cn(
          "text-base leading-relaxed text-foreground/90",
          isTyping && "cursor-blink"
        )}>
          {displayedText}
        </p>
      </div>
      
      {/* Expandable sources section */}
      {!isTyping && (
        <div className="mt-6 border-t border-border pt-4">
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex w-full items-center justify-between text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>View Sources</span>
            {showSources ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {showSources && (
            <div className="mt-3 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
              Retrieved from medical knowledge base using RAG technology.
              Sources are ranked by semantic similarity to your query.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
