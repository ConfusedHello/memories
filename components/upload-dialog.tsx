"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Upload, Check, Loader2 } from "lucide-react"
import Image from "next/image"
import { uploadToDiscord } from "@/app/actions/upload-to-discord"

interface UploadDialogProps {
  open: boolean
  onClose: () => void
}

export function UploadDialog({ open, onClose }: UploadDialogProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [author, setAuthor] = useState("")
  const [caption, setCaption] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!preview || !author) return

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    const formData = new FormData()
    formData.append("author", author)
    formData.append("caption", caption)
    formData.append("image", preview)

    const result = await uploadToDiscord(formData)

    setIsSubmitting(false)

    if (result.success) {
      setSubmitStatus("success")
      setTimeout(() => {
        handleReset()
        setSubmitStatus("idle")
        onClose()
      }, 2000)
    } else {
      setSubmitStatus("error")
      setErrorMessage(result.error || "Failed to submit")
    }
  }

  const handleReset = () => {
    setPreview(null)
    setAuthor("")
    setCaption("")
    setSubmitStatus("idle")
    setErrorMessage("")
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-background border border-border w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-[11px] uppercase tracking-[0.2em] text-foreground">Submit Memory</span>
          <button onClick={onClose} className="text-foreground-muted hover:text-foreground-bright transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitStatus === "success" ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border border-foreground-bright flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-foreground-bright" />
            </div>
            <p className="text-[11px] uppercase tracking-wider text-foreground-bright mb-2">Submitted for Review</p>
            <p className="text-[10px] text-foreground-muted">Your memory will appear after approval</p>
          </div>
        ) : (
          <>
            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Drop zone */}
              {!preview ? (
                <div
                  className={`
                    border border-dashed border-border p-8 text-center cursor-pointer
                    transition-colors hover:border-foreground-muted
                    ${dragActive ? "border-foreground-bright bg-border/20" : ""}
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-6 h-6 mx-auto mb-3 text-foreground-muted" />
                  <p className="text-[11px] uppercase tracking-wider text-foreground-muted">
                    Drop image here or click to browse
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-video">
                  <Image
                    src={preview || "/placeholder.svg"}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 p-1 bg-black/80 text-foreground-bright hover:bg-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Form fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-foreground-muted mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-transparent border border-border px-3 py-2 text-[12px] text-foreground-bright placeholder:text-foreground-muted focus:outline-none focus:border-foreground-muted"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-foreground-muted mb-2">
                    Caption
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full bg-transparent border border-border px-3 py-2 text-[12px] text-foreground-bright placeholder:text-foreground-muted focus:outline-none focus:border-foreground-muted"
                    placeholder="Add a caption (optional)"
                  />
                </div>
              </div>

              {submitStatus === "error" && (
                <p className="text-[10px] text-red-400 uppercase tracking-wider">{errorMessage}</p>
              )}

              <p className="text-[10px] text-foreground-muted leading-relaxed">
                Photos are reviewed before being added to the gallery. Please allow up to 24 hours for approval.
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[11px] uppercase tracking-wider text-foreground-muted hover:text-foreground-bright transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!preview || !author || isSubmitting}
                className="px-4 py-2 text-[11px] uppercase tracking-wider bg-foreground-bright text-background hover:bg-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Submitting
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
