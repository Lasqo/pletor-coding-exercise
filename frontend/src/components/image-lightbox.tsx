import React from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import {
  CONTENT_TRANSITION,
  FADE_ANIMATION,
  OVERLAY_TRANSITION
} from '../constants/animation'
import { getOptimizedImageUrl } from '../helpers/image'
import type { ImageRead } from '../lib/api'

type ImageLightboxProps = {
  image: ImageRead
  onClose: () => void
}

const ImageLightbox = ({ image, onClose }: ImageLightboxProps) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <Dialog.Root open onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 z-50 bg-cream-900/80"
            {...FADE_ANIMATION}
            transition={OVERLAY_TRANSITION}
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-8"
            {...FADE_ANIMATION}
            transition={CONTENT_TRANSITION}
            onClick={handleBackdropClick}
          >
            <Dialog.Title className="sr-only">{image.title}</Dialog.Title>
            <Dialog.Description className="sr-only">
              Full size view of {image.title} by {image.user}
            </Dialog.Description>
            <div className="relative max-h-full max-w-full overflow-hidden rounded-xl">
              <img
                src={getOptimizedImageUrl(image.url)}
                alt={image.title}
                className="max-h-lightbox-image max-w-full object-contain"
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-5">
                <p className="font-display text-xl text-white">{image.title}</p>
                <p className="mt-0.5 text-sm text-white/70">{image.user}</p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X size={20} aria-hidden />
              </button>
            </Dialog.Close>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export { ImageLightbox }
