"use client"

import { useState, useEffect } from "react"
import InfiniteGallery from "@/components/InfiniteGallery"
import { BottomNav } from "@/components/bottom-nav"
import { UploadDialog } from "@/components/upload-dialog"
import { InfoPanel } from "@/components/info-panel"

type ImageItem = { src: string; alt: string; author?: string }

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

export default function Home() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loadedCount, setLoadedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showGallery, setShowGallery] = useState(false)
  const [galleryOpacity, setGalleryOpacity] = useState(0)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  useEffect(() => {
		async function fetchAndPreloadImages() {
			try {
				// Fetch image list from API
				const response = await fetch('/api/images');
				const data = await response.json();

				if (data.images && data.images.length > 0) {
					const imageList: ImageItem[] = data.images;
					setTotalCount(imageList.length);

					// Preload all images
					let loaded = 0;
					await Promise.all(
						imageList.map(async (img) => {
							try {
								await preloadImage(img.src);
							} catch {
								// Image failed to load, continue anyway
							}
							loaded++;
							setLoadedCount(loaded);
						})
					);

					setImages(imageList);
				}
			} catch (error) {
				console.error('Failed to fetch images:', error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchAndPreloadImages();
	}, []);

  useEffect(() => {
    if (!isLoading && images.length > 0) {
      setShowGallery(true)
      setGalleryOpacity(1)
    }
  }, [isLoading, images.length])

  if (!showGallery) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-foreground-muted mb-2">Loading memories...</p>
          {totalCount > 0 && (
            <p className="text-[10px] font-mono text-foreground-muted/60">
              {loadedCount} / {totalCount}
            </p>
          )}
        </div>
      </main>
    )
  }

  if (images.length === 0) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[11px] uppercase tracking-[0.3em] text-foreground-muted">No memories yet</p>
          <button
            onClick={() => setUploadOpen(true)}
            className="px-4 py-2 text-[11px] uppercase tracking-wider border border-border hover:bg-border/50 transition-colors text-foreground"
          >
            Upload First Memory
          </button>
        </div>
        <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-background text-foreground transition-opacity duration-[4000ms] ${
          galleryOpacity === 1 ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-foreground-muted mb-2">Loading memories...</p>
          {totalCount > 0 && (
            <p className="text-[10px] font-mono text-foreground-muted/60">
              {loadedCount} / {totalCount}
            </p>
          )}
        </div>
      </div>

      <InfiniteGallery
        images={images}
        speed={1.2}
        zSpacing={3}
        visibleCount={12}
        falloff={{ near: 0.8, far: 14 }}
        globalOpacity={galleryOpacity}
        className="h-screen w-full overflow-hidden"
      />

      {/* Photo count indicator */}
      <div className="fixed top-6 right-6 text-[10px] uppercase tracking-wider text-foreground-muted">
        <span className="text-foreground">{images.length}</span> memories
      </div>

      {/* Navigation instructions */}
      <div className="text-center fixed bottom-24 left-0 right-0 font-mono uppercase text-[10px] text-foreground-muted pointer-events-none">
        <p>Use mouse wheel, arrow keys, or touch to navigate</p>
        <p className="opacity-60">Auto-play resumes after 3 seconds of inactivity</p>
      </div>

      {/* Bottom navigation */}
      <BottomNav onUploadClick={() => setUploadOpen(true)} onInfoClick={() => setInfoOpen(true)} />

      {/* Upload dialog */}
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />

      {/* Info panel */}
      <InfoPanel open={infoOpen} onClose={() => setInfoOpen(false)} />
    </main>
  )
}
