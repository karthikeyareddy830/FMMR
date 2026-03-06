"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw, Search } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { ResultCard } from "@/components/result-card"
import { AnalogGauge } from "@/components/analog-gauge"
import { EvidenceList } from "@/components/evidence-list"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { getDiagnosisResult, type QueryResponse } from "@/lib/api"

export default function ResultsPage() {
  const [result, setResult] = useState<QueryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedResult = getDiagnosisResult()
    if (storedResult) {
      setResult(storedResult)
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center pt-16">
          <LoadingSpinner size="lg" text="Retrieving medical knowledge..." />
        </main>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 pt-16">
          <div className="glass animate-fade-up rounded-2xl p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mb-2 font-heading text-2xl font-bold text-foreground">
              No Results Found
            </h2>
            <p className="mb-6 text-muted-foreground">
              Please start a new diagnosis to see results.
            </p>
            <Link href="/diagnosis">
              <Button className="gap-2 bg-[#00d4ff] text-[#0a0f1e] hover:bg-[#00d4ff]/90">
                <RefreshCw className="h-4 w-4" />
                Start New Diagnosis
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto max-w-6xl px-4 pb-20 pt-24">
        {/* Header */}
        <div className="animate-fade-up mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Analysis Results
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Query:</span>
              <span className="max-w-md truncate rounded-full bg-secondary px-3 py-1 text-sm text-foreground">
                {result.query}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Link href="/diagnosis">
              <Button variant="outline" size="sm" className="gap-2 border-border hover:bg-secondary">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Link href="/diagnosis">
              <Button size="sm" className="gap-2 bg-[#00d4ff] text-[#0a0f1e] hover:bg-[#00d4ff]/90">
                <RefreshCw className="h-4 w-4" />
                New Analysis
              </Button>
            </Link>
          </div>
        </div>

        {/* Results Dashboard - 3 column on desktop */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* AI Diagnosis Card - spans 2 columns */}
          <div className="animate-fade-up lg:col-span-2" style={{ animationDelay: '100ms' }}>
            <ResultCard answer={result.answer} />
          </div>

          {/* Analog Gauge - 1 column */}
          <div className="animate-fade-up lg:col-span-1" style={{ animationDelay: '200ms' }}>
            <AnalogGauge 
              score={result.trust_score} 
              sourcesCount={result.sources?.length || 3}
            />
          </div>

          {/* Evidence List - full width */}
          <div className="animate-fade-up lg:col-span-3" style={{ animationDelay: '300ms' }}>
            <EvidenceList sources={result.sources} />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="animate-fade-up mt-8 rounded-xl border border-border bg-secondary/30 p-4 text-center text-sm text-muted-foreground" style={{ animationDelay: '400ms' }}>
          This analysis is for informational purposes only and should not replace professional medical advice.
          Please consult a healthcare provider for proper diagnosis and treatment.
        </div>
      </main>
    </div>
  )
}
