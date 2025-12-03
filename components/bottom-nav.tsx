"use client"

import { Grid3X3 } from "lucide-react"

interface BottomNavProps {
  onUploadClick: () => void
  onInfoClick: () => void
}

export function BottomNav({ onUploadClick, onInfoClick }: BottomNavProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-0 bg-background border border-border">
        {/* Left icon */}
        <button className="p-4 border-r border-border hover:bg-border/50 transition-colors" onClick={onInfoClick}>
          <div className="w-3 h-3 bg-foreground-bright" />
        </button>

        {/* Center text */}
        <div className="px-16 py-4 flex items-center gap-8">
          <button
            onClick={onUploadClick}
            className="text-[11px] uppercase tracking-[0.2em] text-foreground hover:text-foreground-bright transition-colors"
          >
            Upload
          </button>
          <span className="text-foreground-muted">|</span>
          <span className="text-[11px] uppercase tracking-[0.2em] text-foreground-muted">Memories</span>
        </div>

        {/* Right icon - grid/more */}
        <button className="p-4 border-l border-border hover:bg-border/50 transition-colors group">
          <div className="flex gap-0.5">
            <div className="w-1 h-1 bg-foreground group-hover:bg-foreground-bright rounded-full" />
            <div className="w-1 h-1 bg-foreground group-hover:bg-foreground-bright rounded-full" />
            <div className="w-1 h-1 bg-foreground group-hover:bg-foreground-bright rounded-full" />
          </div>
        </button>
      </div>

      {/* Grid icon above */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2">
        <button className="p-2 hover:bg-border/30 transition-colors rounded">
          <Grid3X3 className="w-5 h-5 text-foreground-muted hover:text-foreground-bright" />
        </button>
      </div>
    </div>
  )
}
