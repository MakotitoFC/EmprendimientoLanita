'use client'
import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: string[]
  alt: string
  blurred?: boolean
}

export default function ImageGallery({ images, alt, blurred = false }: ImageGalleryProps) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  if (!images.length) return null

  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length)
  const next = () => setCurrent(i => (i + 1) % images.length)

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div
          className={cn(
            'relative aspect-square rounded-2xl overflow-hidden bg-stone-100 cursor-zoom-in',
            blurred && 'cursor-default'
          )}
          onClick={() => { if (!blurred) setLightbox(true) }}
        >
          <Image
            src={images[current]}
            alt={alt}
            fill
            className={cn('object-cover transition-all duration-300', blurred && 'blur-sm scale-105')}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={current === 0}
          />
          {blurred && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-stone-800/80 text-white text-sm font-semibold px-4 py-2 rounded-full">
                No disponible
              </span>
            </div>
          )}
          {!blurred && (
            <button className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm p-1.5 rounded-lg hover:bg-white transition-colors">
              <ZoomIn size={16} className="text-stone-600" />
            </button>
          )}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors"
              >
                <ChevronLeft size={16} className="text-stone-600" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors"
              >
                <ChevronRight size={16} className="text-stone-600" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors',
                  i === current ? 'border-stone-800' : 'border-transparent hover:border-stone-300'
                )}
              >
                <Image src={img} alt={`${alt} ${i + 1}`} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
            onClick={() => setLightbox(false)}
          >
            <X size={24} />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
          <div className="relative max-w-3xl max-h-[85vh] w-full h-full" onClick={e => e.stopPropagation()}>
            <Image
              src={images[current]}
              alt={alt}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {current + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
