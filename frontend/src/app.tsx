import React from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { Toaster } from 'sonner'
import { GalleryGrid } from './components/gallery-grid'
import { ImageLightbox } from './components/image-lightbox'
import { UploadForm } from './components/upload-form'
import type { ImageRead } from './lib/api'

const App = () => {
  const [selectedImage, setSelectedImage] = React.useState<ImageRead | null>(
    null
  )

  const handleCloseLightbox = () => {
    setSelectedImage(null)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-dvh flex-col">
        <a
          href="#gallery"
          className="absolute -top-10 left-4 z-50 rounded-lg bg-cream-900 px-4 py-2 text-sm font-medium text-white focus:top-4"
        >
          Skip to gallery
        </a>
        <header className="shrink-0 border-b border-cream-200">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <h1 className="font-display text-3xl text-cream-900">PictoShare</h1>
            <UploadForm />
          </div>
        </header>
        <main
          aria-label="Image gallery"
          className="mx-auto flex w-full max-w-7xl min-h-0 flex-1 flex-col"
        >
          <GalleryGrid onImageClick={setSelectedImage} />
        </main>
        <AnimatePresence>
          {selectedImage ? (
            <ImageLightbox
              key={selectedImage.id}
              image={selectedImage}
              onClose={handleCloseLightbox}
            />
          ) : null}
        </AnimatePresence>
        <Toaster position="bottom-right" />
      </div>
    </MotionConfig>
  )
}

export default App
