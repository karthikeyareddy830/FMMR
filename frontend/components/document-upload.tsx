"use client"

import { useState, useCallback } from "react"
import { FileText, Upload, X, Loader2, CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DocumentUploadProps {
  onSubmit: (query: string) => void
  isLoading?: boolean
  className?: string
}

interface UploadedFile {
  name: string
  size: number
  type: string
}

type ExtractionStatus = "idle" | "extracting" | "complete" | "error"

export function DocumentUpload({ onSubmit, isLoading = false, className }: DocumentUploadProps) {
  const [file, setFile] = useState<UploadedFile | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus>("idle")
  const [extractedText, setExtractedText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const simulateOCR = async (fileName: string) => {
    setExtractionStatus("extracting")
    setError(null)
    
    // Simulate 2 second OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulated extracted text for demo purposes
    const simulatedText = `Medical Document Analysis - ${fileName}

Patient presents with symptoms including fatigue, intermittent chest discomfort, and mild shortness of breath during physical activity. Blood pressure readings show elevated systolic pressure (145/92 mmHg). Lab results indicate slightly elevated cholesterol levels (LDL: 142 mg/dL). ECG shows normal sinus rhythm with no significant abnormalities. Recommended follow-up with cardiologist for further evaluation and lifestyle modification counseling.

Additional notes: Patient reports stress-related symptoms and irregular sleep patterns over the past 3 months. No known drug allergies. Family history includes hypertension (mother) and type 2 diabetes (father).`
    
    setExtractedText(simulatedText)
    setExtractionStatus("complete")
  }

  const handleFile = useCallback((selectedFile: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, JPG, or PNG file")
      return
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError("File size must be less than 10MB")
      return
    }
    
    setFile({
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
    })
    setError(null)
    simulateOCR(selectedFile.name)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFile(droppedFile)
    }
  }, [handleFile])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFile(selectedFile)
    }
  }

  const removeFile = () => {
    setFile(null)
    setExtractedText("")
    setExtractionStatus("idle")
    setError(null)
  }

  const handleSubmit = () => {
    if (extractedText && extractionStatus === "complete" && !isLoading) {
      onSubmit(extractedText)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="mb-2 font-heading text-xl font-semibold text-foreground">
          Upload Medical Document
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload lab reports, prescriptions, or discharge summaries for analysis
        </p>
      </div>

      {!file ? (
        <>
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all duration-300",
              isDragging
                ? "border-[#00d4ff] bg-[#00d4ff]/10"
                : "border-border bg-secondary/30 hover:border-[#00d4ff]/50 hover:bg-secondary/50"
            )}
          >
            <div className={cn(
              "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors",
              isDragging ? "bg-[#00d4ff]/20" : "bg-secondary"
            )}>
              <FileText className={cn(
                "h-8 w-8 transition-colors",
                isDragging ? "text-[#00d4ff]" : "text-muted-foreground"
              )} />
            </div>
            
            <p className="mb-1 text-center font-medium text-foreground">
              Drag & drop your report here
            </p>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Supports PDF, JPG, PNG — lab reports, prescriptions, discharge summaries
            </p>
            
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80">
                <Upload className="h-4 w-4" />
                Browse Files
              </span>
            </label>
          </div>
          
          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}
        </>
      ) : (
        <>
          {/* File Selected State */}
          <div className="glass rounded-xl p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00d4ff]/10">
                  <FileText className="h-5 w-5 text-[#00d4ff]" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
              
              <button
                onClick={removeFile}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Extraction Status */}
            <div className="flex items-center gap-2 text-sm">
              {extractionStatus === "extracting" && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#00d4ff]" />
                  <span className="text-muted-foreground">Extracting text via OCR...</span>
                </>
              )}
              {extractionStatus === "complete" && (
                <>
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-400">Text extracted — ready to analyze</span>
                </>
              )}
              {extractionStatus === "error" && (
                <span className="text-destructive">Failed to extract text. Please try again.</span>
              )}
            </div>
          </div>
          
          {/* Extracted Text Preview */}
          {extractionStatus === "complete" && extractedText && (
            <div className="glass rounded-xl p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Extracted Text Preview
              </p>
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="font-mono text-sm text-muted-foreground">
                  {extractedText.slice(0, 200)}...
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={extractionStatus !== "complete" || isLoading}
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
            Analyze Document
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        OCR powered by Tesseract / Google Vision
      </p>
    </div>
  )
}
