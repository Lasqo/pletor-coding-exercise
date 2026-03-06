import React from 'react'
import { motion } from 'framer-motion'
import { ImageOff, Trash2 } from 'lucide-react'
import { CONTENT_TRANSITION } from '../constants/animation'
import { IMAGE_SIZES } from '../constants/image'
import {
  getImageDimensions,
  getImageSrcSet,
  getOptimizedImageUrl
} from '../helpers/image'
import { matchIsActivationKey } from '../helpers/keyboard'
import { useDeleteImage } from '../hooks/use-delete-image'
import type { ImageRead } from '../lib/api'

type ImageCardProps = {
  image: ImageRead
  isPriority: boolean
  isInitiallyLoaded: boolean
  onImageClick: (image: ImageRead) => void
  onImageLoaded: (imageId: number) => void
}

const ImageCard = ({
  image,
  isPriority,
  isInitiallyLoaded,
  onImageClick,
  onImageLoaded
}: ImageCardProps) => {
  const deleteImageMutation = useDeleteImage()
  const [isLoaded, setIsLoaded] = React.useState(isInitiallyLoaded)
  const [hasError, setHasError] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation()
    deleteImageMutation.mutate(image.id)
  }

  const handleClick = () => {
    onImageClick(image)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (matchIsActivationKey(event.key)) {
      onImageClick(image)
    }
  }

  const handleImageLoad = () => {
    setIsLoaded(true)
    onImageLoaded(image.id)
  }

  const handleImageError = () => {
    setHasError(true)
  }

  const handleShowOverlay = () => {
    setIsHovered(true)
  }

  const handleHideOverlay = () => {
    setIsHovered(false)
  }

  const handleBlur = (event: React.FocusEvent) => {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return
    }

    setIsHovered(false)
  }

  const thumbnailUrl = getOptimizedImageUrl(image.url)
  const srcSet = getImageSrcSet(image.url)
  const dimensions = getImageDimensions(image.url)

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${image.title} by ${image.user}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleShowOverlay}
      onMouseLeave={handleHideOverlay}
      onFocus={handleShowOverlay}
      onBlur={handleBlur}
      className="relative h-full cursor-pointer"
    >
      <div className="relative h-full overflow-hidden rounded-xl bg-cream-100 shadow-sm">
        {hasError ? (
          <div className="flex size-full flex-col items-center justify-center gap-2 bg-cream-100">
            <ImageOff size={24} className="text-cream-400" aria-hidden />
            <p className="text-xs text-cream-600">Failed to load</p>
          </div>
        ) : (
          <>
            {isLoaded ? null : (
              <div className="absolute inset-0 animate-pulse bg-cream-200" />
            )}
            <img
              src={thumbnailUrl}
              srcSet={srcSet}
              sizes={IMAGE_SIZES}
              width={dimensions.width}
              height={dimensions.height}
              alt={image.title}
              loading={isPriority ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={isPriority ? 'high' : undefined}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className="size-full object-cover"
            />
          </>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-3">
          <p className="truncate text-sm font-medium text-white">
            {image.title}
          </p>
          <p className="truncate text-xs text-white/70">{image.user}</p>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={CONTENT_TRANSITION}
          data-visible={isHovered || undefined}
          className="pointer-events-none absolute inset-0 flex items-start justify-end p-3 data-visible:pointer-events-auto"
        >
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteImageMutation.isPending}
            aria-label="Delete image"
            aria-busy={deleteImageMutation.isPending}
            className="flex size-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-red-500/80 disabled:opacity-50"
          >
            <Trash2 size={14} aria-hidden />
          </button>
        </motion.div>
      </div>
    </div>
  )
}

const MemoizedImageCard = React.memo(ImageCard)

export { MemoizedImageCard as ImageCard }
