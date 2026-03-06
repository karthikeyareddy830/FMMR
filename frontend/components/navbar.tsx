"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { LanguageSelector } from "@/components/language-selector"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/diagnosis", label: "Diagnosis" },
  { href: "/about", label: "About" },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="glass fixed left-0 right-0 top-0 z-50">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00d4ff]">
            <span className="font-heading text-sm font-bold text-[#0a0f1e]">M</span>
          </div>
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">
            MedRAG
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-[#00d4ff]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-[#00d4ff]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSelector />
          <Link href="/diagnosis">
            <Button 
              size="sm" 
              className="gap-1.5 bg-[#00d4ff] text-[#0a0f1e] hover:bg-[#00d4ff]/90"
            >
              <Plus className="h-4 w-4" />
              New Diagnosis
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="glass border-t border-border md:hidden">
          <nav className="container mx-auto flex flex-col gap-2 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-[#00d4ff]/10 text-[#00d4ff]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-border pt-4">
              <LanguageSelector />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
