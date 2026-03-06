"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Database, Shield, Cpu, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { LanguageSelector } from "@/components/language-selector"

export default function HomePage() {
  const [language, setLanguage] = useState("en")

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-20">
          {/* Floating medical icon (subtle background) */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5">
            <Activity className="h-[600px] w-[600px] text-[#00d4ff]" strokeWidth={0.5} />
          </div>
          
          {/* Status badge */}
          <div className="animate-fade-up mb-8 flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
            <span className="pulse-glow h-2 w-2 rounded-full bg-[#10b981]" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              System Online
            </span>
          </div>
          
          {/* Main title */}
          <h1 className="animate-fade-up mb-4 text-center font-heading text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
            AI Healthcare
            <br />
            <span className="text-gradient">Assistant</span>
          </h1>
          
          {/* Subtitle */}
          <p className="animate-fade-up mb-10 max-w-xl text-center text-lg text-muted-foreground" style={{ animationDelay: '100ms' }}>
            Symptom analysis powered by retrieval-augmented medical intelligence
          </p>
          
          {/* CTA buttons */}
          <div className="animate-fade-up mb-8 flex flex-col gap-4 sm:flex-row" style={{ animationDelay: '200ms' }}>
            <Link href="/diagnosis">
              <Button 
                size="lg" 
                className="gap-2 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#06b6d4] px-8 font-heading font-semibold text-[#0a0f1e] shadow-[0_0_30px_rgba(0,212,255,0.3)] transition-all hover:shadow-[0_0_40px_rgba(0,212,255,0.5)]"
              >
                Start Diagnosis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full border-border px-8 font-heading font-semibold text-foreground hover:bg-secondary"
              >
                Learn How It Works
              </Button>
            </Link>
          </div>
          
          {/* Language selector */}
          <div className="animate-fade-up" style={{ animationDelay: '300ms' }}>
            <LanguageSelector value={language} onValueChange={setLanguage} />
          </div>
          
          {/* Stats bar */}
          <div className="animate-fade-up mt-16 flex flex-wrap items-center justify-center gap-6 text-center md:gap-12" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-bold text-[#00d4ff]">47,293</span>
              <span className="text-sm text-muted-foreground">diagnoses analyzed</span>
            </div>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-bold text-[#10b981]">94.2%</span>
              <span className="text-sm text-muted-foreground">accuracy</span>
            </div>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-bold text-[#06b6d4]">12</span>
              <span className="text-sm text-muted-foreground">medical databases</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-3 font-heading text-2xl font-bold text-foreground md:text-3xl">
                How It Works
              </h2>
              <p className="text-muted-foreground">
                Cutting-edge technology for better health insights
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Cpu,
                  title: "AI-Powered Analysis",
                  description: "Advanced language models analyze your symptoms with medical knowledge",
                },
                {
                  icon: Database,
                  title: "RAG Technology",
                  description: "Retrieval-augmented generation for accurate, evidence-based insights",
                },
                {
                  icon: Shield,
                  title: "Trust Scoring",
                  description: "Confidence metrics help you understand the reliability of results",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="glass glass-hover group rounded-2xl p-6 transition-all"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#00d4ff]/10 transition-colors group-hover:bg-[#00d4ff]/20">
                    <feature.icon className="h-6 w-6 text-[#00d4ff]" />
                  </div>
                  <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="border-t border-border py-12">
          <div className="container mx-auto max-w-6xl px-4 text-center">
            <p className="text-sm text-muted-foreground">
              This AI assistant is for informational purposes only and does not replace professional medical advice.
              Always consult a healthcare provider for medical concerns.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
