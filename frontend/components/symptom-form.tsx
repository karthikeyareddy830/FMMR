"use client"

import { useState } from "react"
import { X, Plus, ArrowRight, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Symptom {
  id: string
  name: string
  severity: "mild" | "moderate" | "severe"
  duration: string
}

interface SymptomFormProps {
  onSubmit: (query: string) => void
  isLoading?: boolean
  className?: string
}

const COMMON_SYMPTOMS = [
  "Fever",
  "Cough",
  "Headache",
  "Fatigue",
  "Nausea",
  "Chest Pain",
  "Dizziness",
  "Insomnia",
  "Shortness of breath",
  "Joint pain",
]

const DURATION_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "2-3-days", label: "2–3 days" },
  { value: "1-week", label: "1 week" },
  { value: "2-weeks", label: "2+ weeks" },
  { value: "1-month", label: "1+ month" },
]

const MAX_SYMPTOMS = 6
const MAX_CONTEXT_CHARS = 300

export function SymptomForm({ onSubmit, isLoading = false, className }: SymptomFormProps) {
  const [symptoms, setSymptoms] = useState<Symptom[]>([
    { id: crypto.randomUUID(), name: "", severity: "moderate", duration: "today" }
  ])
  const [additionalContext, setAdditionalContext] = useState("")
  const [showPatientInfo, setShowPatientInfo] = useState(false)
  const [age, setAge] = useState("")
  const [sex, setSex] = useState("")
  const [activeAutocomplete, setActiveAutocomplete] = useState<string | null>(null)

  const addSymptom = () => {
    if (symptoms.length < MAX_SYMPTOMS) {
      setSymptoms([
        ...symptoms,
        { id: crypto.randomUUID(), name: "", severity: "moderate", duration: "today" }
      ])
    }
  }

  const removeSymptom = (id: string) => {
    if (symptoms.length > 1) {
      setSymptoms(symptoms.filter(s => s.id !== id))
    }
  }

  const updateSymptom = (id: string, updates: Partial<Symptom>) => {
    setSymptoms(symptoms.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const getFilteredSuggestions = (input: string) => {
    if (!input.trim()) return COMMON_SYMPTOMS.slice(0, 5)
    return COMMON_SYMPTOMS.filter(s => 
      s.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5)
  }

  const buildQueryString = () => {
    const symptomStrings = symptoms
      .filter(s => s.name.trim())
      .map((s, i) => {
        const severityLabel = s.severity.charAt(0).toUpperCase() + s.severity.slice(1)
        const durationLabel = DURATION_OPTIONS.find(d => d.value === s.duration)?.label || s.duration
        return `Symptom ${i + 1}: ${s.name} (${severityLabel}, ${durationLabel})`
      })
    
    let query = symptomStrings.join(". ")
    
    if (age || sex) {
      const patientInfo = [age && `Age: ${age}`, sex && sex].filter(Boolean).join(", ")
      query += `. ${patientInfo}.`
    }
    
    if (additionalContext.trim()) {
      query += ` Additional context: ${additionalContext.trim()}`
    }
    
    return query
  }

  const handleSubmit = () => {
    const query = buildQueryString()
    if (query && !isLoading) {
      onSubmit(query)
    }
  }

  const hasValidSymptom = symptoms.some(s => s.name.trim())

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="mb-2 font-heading text-xl font-semibold text-foreground">
          Tell us what you&apos;re experiencing
        </h2>
        <p className="text-sm text-muted-foreground">
          Add up to {MAX_SYMPTOMS} symptoms for a comprehensive analysis
        </p>
      </div>

      {/* Symptom Cards */}
      <div className="space-y-4">
        {symptoms.map((symptom, index) => (
          <div
            key={symptom.id}
            className="animate-fade-up glass relative rounded-xl p-4 transition-all duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {symptoms.length > 1 && (
              <button
                onClick={() => removeSymptom(symptom.id)}
                className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                aria-label="Remove symptom"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              {/* Symptom Name with Autocomplete */}
              <div className="relative md:col-span-1">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Symptom Name
                </label>
                <input
                  type="text"
                  value={symptom.name}
                  onChange={(e) => updateSymptom(symptom.id, { name: e.target.value })}
                  onFocus={() => setActiveAutocomplete(symptom.id)}
                  onBlur={() => setTimeout(() => setActiveAutocomplete(null), 200)}
                  placeholder="e.g. Dizziness, Headache, Fever..."
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]/30"
                />
                
                {/* Autocomplete Dropdown */}
                {activeAutocomplete === symptom.id && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-border bg-card p-1 shadow-lg">
                    {getFilteredSuggestions(symptom.name).map((suggestion) => (
                      <button
                        key={suggestion}
                        onMouseDown={() => updateSymptom(symptom.id, { name: suggestion })}
                        className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-[#00d4ff]/10 hover:text-[#00d4ff]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Severity Selector */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Severity
                </label>
                <div className="flex rounded-lg border border-border bg-secondary/50 p-1">
                  {(["mild", "moderate", "severe"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => updateSymptom(symptom.id, { severity: level })}
                      className={cn(
                        "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
                        symptom.severity === level
                          ? level === "mild"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : level === "moderate"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Dropdown */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Duration
                </label>
                <select
                  value={symptom.duration}
                  onChange={(e) => updateSymptom(symptom.id, { duration: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]/30"
                >
                  {DURATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Another Symptom Button */}
      {symptoms.length < MAX_SYMPTOMS && (
        <button
          onClick={addSymptom}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-[#00d4ff] transition-all hover:border-[#00d4ff]/50 hover:bg-[#00d4ff]/5"
        >
          <Plus className="h-4 w-4" />
          Add Another Symptom
        </button>
      )}

      {/* Additional Context */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Any additional context? <span className="text-muted-foreground/50">(optional)</span>
        </label>
        <div className="relative">
          <textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value.slice(0, MAX_CONTEXT_CHARS))}
            placeholder="e.g. History of diabetes, currently on medication, allergies..."
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]/30"
          />
          <span className="absolute bottom-2 right-3 font-mono text-xs text-muted-foreground">
            {additionalContext.length}/{MAX_CONTEXT_CHARS}
          </span>
        </div>
      </div>

      {/* Patient Quick Info (Collapsible) */}
      <div className="rounded-xl border border-border bg-secondary/30">
        <button
          onClick={() => setShowPatientInfo(!showPatientInfo)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm"
        >
          <span className="text-muted-foreground">
            Optional — helps improve accuracy
          </span>
          {showPatientInfo ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        
        {showPatientInfo && (
          <div className="flex gap-4 border-t border-border px-4 py-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age"
                min="0"
                max="120"
                className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff]/30"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Sex
              </label>
              <div className="flex rounded-lg border border-border bg-secondary/50 p-1">
                {["Male", "Female", "Other"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setSex(sex === option ? "" : option)}
                    className={cn(
                      "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
                      sex === option
                        ? "bg-[#00d4ff]/20 text-[#00d4ff]"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!hasValidSymptom || isLoading}
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
