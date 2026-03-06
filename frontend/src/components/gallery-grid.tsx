import React from 'react'
import { ImagePlus } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { PRIORITY_IMAGE_COUNT } from '../constants/image'
import { MASONRY_GAP, SKELETON_HEIGHTS } from '../constants/masonry'
import { getImageEstimatedHeight } from '../helpers/masonry'
import { useImages } from '../hooks/use-images'
import { useMasonryColumns } from '../hooks/use-masonry-columns'
import type { ImageRead } from '../lib/api'
import { ImageCard } from './image-card'

type GalleryGridProps = {
  onImageClick: (image: ImageRead) => void
}

const GalleryGrid = React.memo(({ onImageClick }: GalleryGridProps) => {
  const imagesQuery = useImages()

  const parentRef = React.useRef<HTMLDivElement>(null)
  const loadedImageIds = React.useRef(new Set<number>())
  const { columns, containerWidth } = useMasonryColumns(parentRef)

  const columnWidth =
    containerWidth > 0
      ? (containerWidth - (columns - 1) * MASONRY_GAP) / columns
      : 0

  // eslint-disable-next-line no-restricted-syntax -- stable ref needed by useVirtualizer to avoid re-measurements
  const getScrollElement = React.useCallback(() => {
    return parentRef.current
  }, [])

  // eslint-disable-next-line no-restricted-syntax -- stable ref needed by useVirtualizer to avoid re-measurements on every render
  const estimateSize = React.useCallback(
    (index: number) => {
      const image = imagesQuery.data?.[index]

      if (!image) {
        return 0
      }

      return (
        getImageEstimatedHeight({ url: image.url, columnWidth }) + MASONRY_GAP
      )
    },
    [imagesQuery.data, columnWidth]
  )

  // eslint-disable-next-line react-hooks/incompatible-library -- @tanstack/react-virtual is not yet compatible with React Compiler memoization
  const virtualizer = useVirtualizer({
    count: imagesQuery.data?.length ?? 0,
    getScrollElement,
    estimateSize,
    overscan: 5,
    lanes: columns
  })

  const handleImageLoaded = (imageId: number) => {
    loadedImageIds.current.add(imageId)
  }

  const renderContent = () => {
    if (imagesQuery.isPending) {
      return (
        <div
          role="status"
          aria-busy
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <p className="sr-only">Loading images…</p>
          {SKELETON_HEIGHTS.map((height, index) => {
            return (
              <div
                key={index}
                className="animate-pulse rounded-xl bg-cream-200"
                style={{ height }}
              />
            )
          })}
        </div>
      )
    }

    if (imagesQuery.isError) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-sm text-red-600" role="alert">
            {imagesQuery.error.message}
          </p>
          <button
            type="button"
            onClick={() => {
              void imagesQuery.refetch()
            }}
            className="mt-4 rounded-lg bg-cream-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-cream-700"
          >
            Retry
          </button>
        </div>
      )
    }

    if (imagesQuery.data.length === 0) {
      return (
        <div
          role="status"
          className="flex flex-col items-center justify-center py-20"
        >
          <ImagePlus size={48} className="text-cream-300" aria-hidden />
          <p className="mt-4 font-display text-xl text-cream-700">
            No images yet
          </p>
          <p className="mt-1 text-sm text-cream-600">
            Upload your first image to get started
          </p>
        </div>
      )
    }

    const imageCount = imagesQuery.data.length

    return (
      <div
        role="list"
        aria-label={`${imageCount} images`}
        className="relative"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const image = imagesQuery.data[virtualItem.index]

          if (!image) {
            return null
          }

          const xOffset = virtualItem.lane * (columnWidth + MASONRY_GAP)

          return (
            <div
              key={virtualItem.key}
              role="listitem"
              className="absolute top-0 left-0"
              style={{
                width: columnWidth,
                height: virtualItem.size - MASONRY_GAP,
                transform: `translate(${xOffset}px, ${virtualItem.start}px)`
              }}
            >
              <ImageCard
                image={image}
                isPriority={virtualItem.index < PRIORITY_IMAGE_COUNT}
                isInitiallyLoaded={loadedImageIds.current.has(image.id)}
                onImageClick={onImageClick}
                onImageLoaded={handleImageLoaded}
              />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      id="gallery"
      ref={parentRef}
      className="min-h-0 flex-1 overflow-auto px-6 py-4"
    >
      {renderContent()}
    </div>
  )
})

GalleryGrid.displayName = 'GalleryGrid'

export { GalleryGrid }
