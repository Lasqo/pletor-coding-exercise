import { Image } from '../../types/image'

interface ImageCardProps {
  image: Image
  onDelete: (id: string) => void
  isDeleting: boolean
}

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x300?text=Image+Not+Found'

/**
 * Displays a single image card with metadata and delete action
 */
export function ImageCard({ image, onDelete, isDeleting }: ImageCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE
  }

  const formattedDate = new Date(image.created_at).toLocaleDateString()

  return (
    <div
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        borderRadius: 12,
        background: '#fff',
        overflow: 'hidden',
        border: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative', paddingTop: '66.67%', background: '#f0f0f0' }}>
        <img
          src={image.url}
          alt={image.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={handleImageError}
        />
      </div>
      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600, color: '#222' }}>
          {image.title}
        </h3>
        <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: 14 }}>
          By <span style={{ color: '#0066cc', fontWeight: 500 }}>{image.user}</span>
        </p>
        <p style={{ margin: '0 0 12px 0', color: '#999', fontSize: 12 }}>{formattedDate}</p>
        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={() => onDelete(image.id)}
            disabled={isDeleting}
            style={{
              background: isDeleting ? '#ccc' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              fontSize: 13,
              width: '100%',
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
