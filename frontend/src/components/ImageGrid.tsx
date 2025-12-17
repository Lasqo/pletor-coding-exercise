import { Image } from '../types'
import { ImageCard } from './ImageCard'

interface ImageGridProps {
  images: Image[]
  loading: boolean
  onDelete: (id: string) => void
  currentUser: string | null
}

export const ImageGrid = ({ images, loading, onDelete, currentUser }: ImageGridProps) => {
  if (loading) {
    return <p style={{ textAlign: 'center' }}>Loading...</p>
  }

  if (images.length === 0) {
    return <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No images found.</p>
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '2rem',
        alignItems: 'stretch',
      }}
    >
      {images.map((img) => (
        <ImageCard
          key={img.id}
          image={img}
          onDelete={onDelete}
          canDelete={currentUser === img.user}
        />
      ))}
    </div>
  )
}
