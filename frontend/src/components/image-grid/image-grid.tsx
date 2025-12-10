import { Image } from '../../types/image'
import { ImageCard } from '../image-card/image-card'

interface ImageGridProps {
  images: Image[]
  loading: boolean
  onDelete: (id: string) => void
  deletingId: string | null
}

/**
 * Grid container for displaying image cards
 */
export function ImageGrid({ images, loading, onDelete, deletingId }: ImageGridProps) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p>Loading images...</p>
      </div>
    )
  }

  const isEmpty = images.length === 0

  return (
    <>
      <p style={{ color: '#666', marginBottom: 20 }}>Showing {images.length} images</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          alignItems: 'stretch',
        }}
      >
        {isEmpty && (
          <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#666' }}>
            No images found. Add one above!
          </p>
        )}
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onDelete={onDelete}
            isDeleting={deletingId === image.id}
          />
        ))}
      </div>
    </>
  )
}
