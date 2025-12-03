"use client"

import { X } from "lucide-react"

interface InfoPanelProps {
  open: boolean
  onClose: () => void
}

export function InfoPanel({ open, onClose }: InfoPanelProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Panel - slides from left */}
      <div className="relative bg-background border-r border-border w-full max-w-sm h-full overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-[11px] uppercase tracking-[0.2em] text-foreground">Info</span>
          <button onClick={onClose} className="text-foreground-muted hover:text-foreground-bright transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Title */}
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-foreground-muted mb-2">Graduation Memories</h2>
            <h3 className="font-serif text-3xl italic text-foreground-bright">Class of 2026</h3>
          </div>

          {/* Description */}
          <p className="text-[12px] leading-relaxed text-foreground">
            A collaborative photo bank celebrating our journey together. Upload your favorite memories from our time as
            students and relive the moments that defined our experience.
          </p>

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex justify-between text-[11px] uppercase tracking-wider">
              <span className="text-foreground-muted">Contributors</span>
              <span className="text-foreground-bright">24</span>
            </div>
            <div className="flex justify-between text-[11px] uppercase tracking-wider">
              <span className="text-foreground-muted">Memories</span>
              <span className="text-foreground-bright">128</span>
            </div>
            <div className="flex justify-between text-[11px] uppercase tracking-wider">
              <span className="text-foreground-muted">Since</span>
              <span className="text-foreground-bright">Idk</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Instructions */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-foreground-muted">Navigation</h4>
            <div className="space-y-2 text-[11px]">
              <p className="text-foreground">
                <span className="text-foreground-muted">Scroll</span> — Navigate through memories
              </p>
              <p className="text-foreground">
                <span className="text-foreground-muted">Arrow Keys</span> — Manual navigation
              </p>
              <p className="text-foreground">
                <span className="text-foreground-muted">Hover</span> — View photo details
              </p>
            </div>
          </div>

          {/* Credits */}
          <div className="pt-8 border-t border-border">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">
              Built with love for the Class of 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
