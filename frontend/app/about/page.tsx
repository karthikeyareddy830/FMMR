import { Activity, Database, Brain, Shield, Zap, Code2 } from "lucide-react"
import { Navbar } from "@/components/navbar"

const technologies = [
  {
    icon: Brain,
    title: "Large Language Models",
    description: "Advanced AI models process and understand complex medical terminology and symptom descriptions.",
  },
  {
    icon: Database,
    title: "Vector Database",
    description: "Medical records and knowledge are stored in a vector database for efficient semantic retrieval.",
  },
  {
    icon: Zap,
    title: "RAG Architecture",
    description: "Retrieval-Augmented Generation combines retrieval and generation for accurate responses.",
  },
  {
    icon: Shield,
    title: "Trust Scoring",
    description: "Confidence metrics based on retrieval similarity help assess the reliability of results.",
  },
]

const teamFeatures = [
  {
    icon: Code2,
    title: "Open Source",
    description: "Built with modern open-source technologies including Next.js, React, and Python.",
  },
  {
    icon: Activity,
    title: "Hackathon Project",
    description: "Developed as a demonstration of AI capabilities in healthcare assistance.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto max-w-4xl px-4 pb-20 pt-24">
        {/* Header */}
        <div className="animate-fade-up mb-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#00d4ff] shadow-[0_0_30px_rgba(0,212,255,0.3)]">
            <Activity className="h-7 w-7 text-[#0a0f1e]" />
          </div>
          <h1 className="mb-4 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            About <span className="text-gradient">MedRAG</span>
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            An AI-powered healthcare assistant that leverages cutting-edge Retrieval-Augmented 
            Generation (RAG) technology to analyze symptoms and provide evidence-based medical insights.
          </p>
        </div>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">
            How It Works
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {technologies.map((tech, index) => (
              <div 
                key={index} 
                className="glass glass-hover animate-fade-up rounded-2xl p-6 transition-all"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#00d4ff]/10">
                  <tech.icon className="h-5 w-5 text-[#00d4ff]" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                  {tech.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {tech.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Process Flow */}
        <section className="mb-16">
          <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">
            The Analysis Process
          </h2>
          <div className="glass rounded-2xl p-6">
            <ol className="space-y-6">
              {[
                {
                  title: "Symptom Input",
                  description: "You describe your symptoms in natural language through our intuitive interface.",
                },
                {
                  title: "Knowledge Retrieval",
                  description: "The system searches a vector database of medical records to find relevant information.",
                },
                {
                  title: "AI Analysis",
                  description: "An LLM processes your symptoms along with retrieved medical context to generate insights.",
                },
                {
                  title: "Results & Evidence",
                  description: "You receive an analysis with confidence scores and the source evidence used.",
                },
              ].map((step, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#00d4ff] font-mono text-sm font-bold text-[#0a0f1e]">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="mb-1 font-heading font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Project Info */}
        <section className="mb-12">
          <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">
            Project Information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {teamFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="glass glass-hover rounded-2xl p-6 transition-all"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <feature.icon className="h-5 w-5 text-secondary-foreground" />
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
        </section>

        {/* Disclaimer */}
        <div className="glass rounded-2xl border-l-2 border-l-[#f59e0b] p-6 text-center">
          <h3 className="mb-2 font-heading font-semibold text-foreground">
            Important Disclaimer
          </h3>
          <p className="text-sm text-muted-foreground">
            This AI healthcare assistant is designed for educational and informational purposes only. 
            It does not provide medical diagnoses, treatment recommendations, or replace professional 
            medical advice. Always consult with a qualified healthcare provider for any medical concerns.
          </p>
        </div>
      </main>
    </div>
  )
}
