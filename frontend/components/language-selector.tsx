"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const languages = [
  { value: "en", label: "EN" },
  { value: "hi", label: "\u0939\u093f\u0902" },
  { value: "te", label: "\u0c24\u0c46" },
]

interface LanguageSelectorProps {
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

export function LanguageSelector({ value, onValueChange, className }: LanguageSelectorProps) {
  const [selected, setSelected] = useState(value || "en")

  const handleSelect = (val: string) => {
    setSelected(val)
    onValueChange?.(val)
  }

  return (
    <div className={cn("inline-flex rounded-full bg-secondary p-1", className)}>
      {languages.map((lang) => (
        <button
          key={lang.value}
          onClick={() => handleSelect(lang.value)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-all",
            selected === lang.value
              ? "bg-[#00d4ff] text-[#0a0f1e]"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
