import { useEffect, useState, useRef } from 'react'
import './App.css'

interface Image {
  id: number
  title: string
  user: string
  url: string
  created_at: string
  file_size: number | null
  content_type: string | null
}

const API_URL = 'http://localhost:8000'

function App() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [user, setUser] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchImages = () => {
    setLoading(true)
    fetch(`${API_URL}/images/`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch images')
        return res.json()
      })
      .then(setImages)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    setSelectedFile(file)
    setError(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFile) {
      setError('Please select a file to upload')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', title)
      formData.append('user', user)

      const res = await fetch(`${API_URL}/images/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || 'Failed to upload image')
      }
      setTitle('')
      setUser('')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchImages()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setError(null)
    try {
      const res = await fetch(`${API_URL}/images/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete image')
      fetchImages()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url
    return `${API_URL}${url}`
  }

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ textAlign: 'center', fontSize: '3rem', fontWeight: 700, marginBottom: 40, letterSpacing: '-2px', color: '#222' }}>Image Gallery</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 40, maxWidth: 600, margin: '0 auto 40px auto' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 500, color: '#333', fontSize: 14 }}>Title<br />
              <input value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', width: '100%', boxSizing: 'border-box' }} />
            </label>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 500, color: '#333', fontSize: 14 }}>User<br />
              <input value={user} onChange={(e) => setUser(e.target.value)} required style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', width: '100%', boxSizing: 'border-box' }} />
            </label>
          </div>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? '#0077cc' : '#ccc'}`,
            borderRadius: 12,
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragging ? '#f0f7ff' : '#fafafa',
            marginBottom: 16,
            transition: 'all 0.2s',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileSelect(file)
            }}
            style={{ display: 'none' }}
          />
          {selectedFile ? (
            <p style={{ margin: 0, color: '#333', fontWeight: 500 }}>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
          ) : (
            <p style={{ margin: 0, color: '#888' }}>Drag & drop an image here, or click to select</p>
          )}
        </div>

        <button type="submit" disabled={submitting} style={{ width: '100%', padding: '12px 22px', borderRadius: 8, background: '#222', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 16, boxShadow: '0 2px 8px #0001', transition: 'background 0.2s' }}>
          {submitting ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>

      {error && <p style={{ color: '#e74c3c', textAlign: 'center', padding: '8px 16px', background: '#fdf0ef', borderRadius: 8, maxWidth: 600, margin: '0 auto 24px auto' }}>{error}</p>}
      {loading && <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p>}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        alignItems: 'stretch',
      }}>
        {images.length === 0 && !loading && <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#888' }}>No images found.</p>}
        {images.map((img) => (
          <div key={img.id} style={{ boxShadow: '0 4px 24px #0002', borderRadius: 16, padding: 0, background: '#fff', overflow: 'hidden', border: '1px solid #eee', transition: 'box-shadow 0.2s', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <img src={getImageUrl(img.url)} alt={img.title} style={{ width: '100%', display: 'block', objectFit: 'cover', height: 220, background: '#eee' }} />
            <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#222' }}>{img.title}</h2>
                <p style={{ margin: '4px 0 0 0', color: '#555', fontSize: 14 }}>by <span style={{ color: '#0077cc' }}>{img.user}</span></p>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#999' }}>{new Date(img.created_at).toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button onClick={() => handleDelete(img.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
