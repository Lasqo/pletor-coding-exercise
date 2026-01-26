import { useState, useMemo } from 'react'
import type { Image } from '../types'
import { getAspectRatio, getThumbnailUrl } from '../utils/imageUtils'
import { DEFAULT_ASPECT_RATIO, MAX_THUMBNAIL_DIMENSION } from '../config/constants'
import { useImageLoading } from '../hooks/useImageLoading'
import './ImageCard.css'

interface ImageCardProps {
  image: Image
  onDelete: (id: number) => void
  isDeleting?: boolean
}

export function ImageCard({ image, onDelete, isDeleting }: ImageCardProps) {
  const [showOverlay, setShowOverlay] = useState(false)

  const thumbnailUrl = useMemo(() => getThumbnailUrl(image.url, MAX_THUMBNAIL_DIMENSION), [image.url])
  const aspectRatio = useMemo(() => getAspectRatio(image.url), [image.url])
  const urlsAreSame = thumbnailUrl === image.url

  const {
    thumbnailLoaded,
    thumbnailError,
    fullImageLoaded,
    fullImageError,
    shouldLoadFullImage,
    isShowingPlaceholder,
    handleThumbnailLoad,
    handleThumbnailError,
    handleFullImageLoad,
    handleFullImageError,
  } = useImageLoading({ urlsAreSame })

  const getTitleWithStatus = (): string => {
    if (isShowingPlaceholder) {
      return `${image.title} (placeholder)`
    }
    if (fullImageLoaded || urlsAreSame) {
      return image.title
    }
    if (fullImageError && thumbnailLoaded && !thumbnailError && !urlsAreSame) {
      return `${image.title} (thumbnail only)`
    }
    if (thumbnailLoaded && !fullImageLoaded) {
      return `${image.title} (thumbnail)`
    }
    return `${image.title} (loading...)`
  }

  return (
    <article
      className="image-card"
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
      aria-label={`Image: ${image.title}`}
    >
      <div className="image-card-wrapper">
        {!thumbnailLoaded && (
          <div className="image-card-skeleton">
            <div className="skeleton-shimmer" />
          </div>
        )}
        <div
          className="image-card-img-container"
          style={{
            aspectRatio: aspectRatio ? aspectRatio.toString() : DEFAULT_ASPECT_RATIO,
          }}
        >
          {!urlsAreSame && (
            <img
              src={thumbnailUrl}
              alt={image.title}
              loading="lazy"
              decoding="async"
              onLoad={handleThumbnailLoad}
              onError={handleThumbnailError}
              className={`image-card-img image-card-thumbnail ${thumbnailLoaded ? 'loaded' : ''} ${fullImageLoaded ? 'hidden' : ''}`}
            />
          )}
          {(urlsAreSame || shouldLoadFullImage) && (
            <img
              src={image.url}
              alt={image.title}
              loading="lazy"
              decoding="async"
              onLoad={handleFullImageLoad}
              onError={handleFullImageError}
              className={`image-card-img image-card-full ${fullImageLoaded || (urlsAreSame && thumbnailLoaded) ? 'loaded' : ''}`}
            />
          )}
        </div>
        {isShowingPlaceholder && (
          <div className="image-card-placeholder-badge">placeholder</div>
        )}
        {showOverlay && (
          <div className="image-card-overlay">
            <div className="image-card-overlay-content">
              <p className="image-card-title" title={image.title}>
                {getTitleWithStatus()}
              </p>
              <button
                type="button"
                onClick={() => onDelete(image.id)}
                disabled={isDeleting}
                className="image-card-delete-btn"
                aria-label={`Delete ${image.title}`}
                title="Delete image"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
