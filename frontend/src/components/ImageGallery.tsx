import { Image } from '../types'

interface ImageGalleryProps {
  images: Image[]
  loading: boolean
  onDelete: (id: string) => void
}

export default function ImageGallery({ images, loading, onDelete }: ImageGalleryProps) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: '#fff' }}>
      {loading && <p style={{ textAlign: 'center', marginTop: 40 }}>Loading images...</p>}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem',
        alignItems: 'start',
        maxWidth: 1400,
        margin: '0 auto'
      }}>
        {images.length === 0 && !loading && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666' }}>No images found.</p>}
        {images.map((img) => (
          <div key={img.id} style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 12, overflow: 'hidden', background: '#fff', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '100%', height: 200, background: '#f0f0f0', overflow: 'hidden' }}>
              <img src={img.url} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600, color: '#222' }}>{img.title}</h2>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: 13, color: '#888', textAlign: 'center' }}>Created: {new Date(img.created_at).toLocaleString()}</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: 13, color: '#888', textAlign: 'center' }}>ID: {img.id}</p>
              <p style={{ margin: 0, fontSize: 14, color: '#555' }}>By <span style={{ fontWeight: 500, color: '#333' }}>{img.user}</span></p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: 13, color: '#888', textAlign: 'center' }}>URL: <a href={img.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0077cc', wordBreak: 'break-all' }}>{img.url}</a></p>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#999' }}>{new Date(img.created_at).toLocaleDateString()}</span>
                <button onClick={() => onDelete(img.id)} style={{ background: 'transparent', color: '#e74c3c', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '4px 8px', borderRadius: 4, transition: 'background 0.1s' }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

