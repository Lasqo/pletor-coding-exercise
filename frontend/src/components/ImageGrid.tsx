import { useEffect, useRef } from 'react'
import Masonry from 'react-masonry-css'
import { useImages, useDeleteImage } from '../hooks/useImages'
import { ImageCard } from './ImageCard'
import './ImageGrid.css'

export function ImageGrid() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useImages()
  const deleteMutation = useDeleteImage()
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const breakpointColumnsObj = {
    default: 4,
    1400: 3,
    1000: 2,
    600: 1,
  }

  if (isLoading) {
    return (
      <div className="image-grid-loading" role="status" aria-live="polite">
        <p>Loading images...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="image-grid-error" role="alert">
        <p>Error loading images: {error.message}</p>
      </div>
    )
  }

  const allImages = data?.pages.flatMap(page => page.items) ?? []

  if (allImages.length === 0) {
    return (
      <div className="image-grid-empty" role="status">
        <p>No images found. Add one above!</p>
      </div>
    )
  }

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid-column"
      >
        {allImages.map(image => (
          <ImageCard
            key={image.id}
            image={image}
            onDelete={id => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        ))}
      </Masonry>
      <div ref={observerTarget} className="image-grid-observer-target" aria-hidden="true" />
      {isFetchingNextPage && (
        <div className="image-grid-loading-more" role="status" aria-live="polite">
          <p>Loading more...</p>
        </div>
      )}
    </>
  )
}
