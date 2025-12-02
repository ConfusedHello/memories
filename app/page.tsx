'use client';

import { useEffect, useState } from 'react';
import InfiniteGallery from '@/components/InfiniteGallery';

type ImageItem = { src: string; alt: string };

function preloadImage(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve();
		img.onerror = reject;
		img.src = src;
	});
}

export default function Home() {
	const [images, setImages] = useState<ImageItem[]>([]);
	const [loadedCount, setLoadedCount] = useState(0);
	const [totalCount, setTotalCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [showGallery, setShowGallery] = useState(false);
	const [galleryOpacity, setGalleryOpacity] = useState(0);

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

	// Handle the transition from loading to gallery
	useEffect(() => {
		if (!isLoading && images.length > 0) {
			// Show gallery container and start fade immediately
			setShowGallery(true);
			setGalleryOpacity(1);
		}
	}, [isLoading, images.length]);

	if (!showGallery) {
		return (
			<main className="min-h-screen flex items-center justify-center bg-black text-white">
				<div className="text-center">
					<p className="text-lg mb-2">Loading memories...</p>
					{totalCount > 0 && (
						<p className="text-sm opacity-60 font-mono">
							{loadedCount} / {totalCount}
						</p>
					)}
				</div>
			</main>
		);
	}

	if (images.length === 0) {
		return (
			<main className="min-h-screen flex items-center justify-center bg-black text-white">
				<div className="text-center">
					<p className="text-lg">No memories found</p>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen ">
			{/* Loading overlay that fades out */}
			<div
				className={`fixed inset-0 z-50 flex items-center justify-center bg-black text-white transition-opacity duration-[4000ms] ${
					galleryOpacity === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'
				}`}
			>
				<div className="text-center">
					<p className="text-lg mb-2">Loading memories...</p>
					{totalCount > 0 && (
						<p className="text-sm opacity-60 font-mono">
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
				className="h-screen w-full rounded-lg overflow-hidden"
			/>
			<div className="h-screen inset-0 pointer-events-none fixed flex items-center justify-center text-center px-3 mix-blend-exclusion text-white">
				<h1 className="font-serif text-4xl md:text-7xl tracking-tight">
					<span className="italic">I create;</span> therefore I am
				</h1>
			</div>

			<div className="text-center fixed bottom-10 left-0 right-0 font-mono uppercase text-[11px] font-semibold">
				<p>Use mouse wheel, arrow keys, or touch to navigate</p>
				<p className=" opacity-60">
					Auto-play resumes after 3 seconds of inactivity
				</p>
			</div>
		</main>
	);
}
