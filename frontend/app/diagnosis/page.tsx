"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Lightbulb, FileText, ClipboardList } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { SymptomForm } from "@/components/symptom-form"
import { DocumentUpload } from "@/components/document-upload"
import { LanguageSelector } from "@/components/language-selector"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { analyzeSymptoms, storeDiagnosisResult, type QueryResponse } from "@/lib/api"
import { cn } from "@/lib/utils"

type TabType = "symptoms" | "upload"

export default function DiagnosisPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("symptoms")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState("en")

  const handleSubmit = async (query: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response: QueryResponse = await analyzeSymptoms(query)
      storeDiagnosisResult(response)
      router.push("/results")
    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message 
          : "Failed to connect to the analysis service. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto max-w-6xl px-4 pb-20 pt-24">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="animate-shake mx-auto mb-6 max-w-2xl border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left Sidebar - Tips */}
          <div className="lg:col-span-2">
            <div className="glass sticky top-24 rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00d4ff]/10">
                  <Lightbulb className="h-4 w-4 text-[#00d4ff]" />
                </div>
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  {activeTab === "symptoms" ? "Tips for accurate results" : "Document guidelines"}
                </h2>
              </div>
              
              {activeTab === "symptoms" ? (
                <ul className="mb-6 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#00d4ff]" />
                    Add multiple symptoms for a more comprehensive analysis
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#00d4ff]" />
                    Be accurate about severity — it affects the diagnosis
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#00d4ff]" />
                    Include how long you&apos;ve had each symptom
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#00d4ff]" />
                    Add medical history in the context field
                  </li>
                </ul>
              ) : (
                <ul className="mb-6 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#00d4ff]" />
                    Upload clear, readable documents
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#00d4ff]" />
                    Supported formats: PDF, JPG, PNG
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#00d4ff]" />
                    Works best with lab reports and prescriptions
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#00d4ff]" />
                    Maximum file size: 10MB
                  </li>
                </ul>
              )}
              
              <div className="border-t border-border pt-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Language
                </h3>
                <LanguageSelector value={language} onValueChange={setLanguage} />
              </div>
            </div>
          </div>
          
          {/* Right Panel - Main Input */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="mb-2 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Symptom Analysis
              </h1>
              <p className="text-muted-foreground">
                Describe your symptoms or upload a medical document
              </p>
            </div>
            
            {/* Tab Toggle */}
            <div className="mb-6 inline-flex rounded-xl bg-secondary/50 p-1">
              <button
                onClick={() => setActiveTab("symptoms")}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  activeTab === "symptoms"
                    ? "bg-[#00d4ff] text-[#0a0f1e] shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ClipboardList className="h-4 w-4" />
                Describe Symptoms
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  activeTab === "upload"
                    ? "bg-[#00d4ff] text-[#0a0f1e] shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <FileText className="h-4 w-4" />
                Upload Medical Document
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="glass rounded-2xl p-6 md:p-8">
              <div 
                className={cn(
                  "transition-opacity duration-300",
                  activeTab === "symptoms" ? "opacity-100" : "hidden opacity-0"
                )}
              >
                <SymptomForm onSubmit={handleSubmit} isLoading={isLoading} />
              </div>
              
              <div 
                className={cn(
                  "transition-opacity duration-300",
                  activeTab === "upload" ? "opacity-100" : "hidden opacity-0"
                )}
              >
                <DocumentUpload onSubmit={handleSubmit} isLoading={isLoading} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
