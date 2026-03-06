"use client"

import { useState, useEffect } from "react"
import { Mic, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QueryInputProps {
  onSubmit: (query: string) => void
  isLoading?: boolean
  className?: string
  defaultValue?: string
}

const MAX_CHARS = 1000

export function QueryInput({ onSubmit, isLoading = false, className, defaultValue = "" }: QueryInputProps) {
  const [query, setQuery] = useState(defaultValue)
  
  // Update query when defaultValue changes (e.g., example chip clicked)
  useEffect(() => {
    if (defaultValue) {
      setQuery(defaultValue)
    }
  }, [defaultValue])
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = () => {
    if (query.trim() && !isLoading) {
      onSubmit(query.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        {/* Floating label */}
        <label 
          className={cn(
            "absolute left-4 transition-all duration-200 pointer-events-none",
            isFocused || query 
              ? "top-2 text-xs text-[#00d4ff]" 
              : "top-5 text-sm text-muted-foreground"
          )}
        >
          Describe what you&apos;re experiencing...
        </label>
        
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          rows={6}
          maxLength={MAX_CHARS}
          className={cn(
            "glass w-full resize-none rounded-xl px-4 pb-4 pt-8 text-base text-foreground",
            "border-0 border-b-2 transition-all duration-300",
            "placeholder:text-transparent focus:outline-none",
            isFocused 
              ? "border-b-[#00d4ff] shadow-[0_0_20px_rgba(0,212,255,0.1)]" 
              : "border-b-transparent"
          )}
        />
        
        {/* Character counter */}
        <span className="absolute bottom-3 right-14 font-mono text-xs text-muted-foreground">
          {query.length}/{MAX_CHARS}
        </span>
        
        {/* Mic button */}
        <button
          type="button"
          disabled={isLoading}
          className={cn(
            "absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full",
            "text-muted-foreground transition-all hover:bg-[#00d4ff]/10 hover:text-[#00d4ff]",
            "focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50"
          )}
          aria-label="Voice input"
        >
          <Mic className="h-4 w-4" />
        </button>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!query.trim() || isLoading}
        size="lg"
        className={cn(
          "w-full gap-2 rounded-xl font-heading font-semibold",
          "bg-gradient-to-r from-[#00d4ff] to-[#06b6d4] text-[#0a0f1e]",
          "shadow-[0_0_30px_rgba(0,212,255,0.3)]",
          "hover:shadow-[0_0_40px_rgba(0,212,255,0.5)]",
          "transition-all duration-300",
          "disabled:from-muted disabled:to-muted disabled:text-muted-foreground disabled:shadow-none"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            Analyze Symptoms
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
      
      <p className="text-center text-xs text-muted-foreground">
        Not a substitute for professional medical advice
      </p>
    </div>
  )
}
