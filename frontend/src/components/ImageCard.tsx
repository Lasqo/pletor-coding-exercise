import { Image } from '../types'

interface ImageCardProps {
  image: Image
  onDelete: (id: string) => void
  canDelete: boolean
}

export const ImageCard = ({ image, onDelete, canDelete }: ImageCardProps) => {
  return (
    <div 
      style={{ 
        boxShadow: '0 4px 24px #0002', 
        borderRadius: 16, 
        padding: 0, 
        background: '#fff', 
        overflow: 'hidden', 
        border: '1px solid #eee', 
        maxWidth: 500, 
        margin: '0 auto', 
        transition: 'box-shadow 0.2s', 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%' 
      }}
    >
      <img 
        src={image.url} 
        alt={image.title} 
        style={{ 
          width: '100%', 
          display: 'block', 
          borderTopLeftRadius: 16, 
          borderTopRightRadius: 16, 
          objectFit: 'cover', 
          maxHeight: 350, 
          minHeight: 200, 
          background: '#eee' 
        }} 
      />
      <div 
        style={{ 
          padding: 24, 
          paddingTop: 18, 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between' 
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#222', textAlign: 'center' }}>
            {image.title}
          </h2>
          <p style={{ margin: '0.5rem 0 0 0', color: '#555', textAlign: 'center', fontWeight: 500 }}>
            By: <span style={{ color: '#0077cc' }}>{image.user}</span>
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: 13, color: '#888', textAlign: 'center' }}>
            Created: {new Date(image.created_at).toLocaleString()}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: 13, color: '#888', textAlign: 'center' }}>
            ID: {image.id}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: 13, color: '#888', textAlign: 'center' }}>
            URL: <a href={image.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0077cc', wordBreak: 'break-all' }}>
              {image.url}
            </a>
          </p>
        </div>
        {canDelete && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
            <button 
              onClick={() => onDelete(image.id)} 
              style={{ 
                background: '#e74c3c', 
                color: 'white', 
                border: 'none', 
                borderRadius: 6, 
                padding: '8px 24px', 
                cursor: 'pointer', 
                fontWeight: 600, 
                fontSize: 16, 
                boxShadow: '0 2px 8px #e74c3c22', 
                transition: 'background 0.2s' 
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
