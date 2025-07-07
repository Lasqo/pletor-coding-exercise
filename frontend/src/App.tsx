import React, { useEffect, useState } from 'react'
import './App.css'

// Image type from backend
interface Image {
  id: number
  title: string
  url: string
  owner_id: number
  created_at: string
}

// Quota usage type
interface QuotaUsage {
  user_daily_quota: number
  user_used: number
  global_daily_quota: number
  global_used: number
}

const API = 'http://localhost:8000'

function App() {
  // Auth state
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'))
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authForm, setAuthForm] = useState({ username: '', password: '' })
  const [authError, setAuthError] = useState<string | null>(null)

  // Images and quota
  const [images, setImages] = useState<Image[]>([])
  const [myImages, setMyImages] = useState<Image[]>([])
  const [quota, setQuota] = useState<QuotaUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Image upload form
  const [form, setForm] = useState({ title: '', url: '' })
  const [submitting, setSubmitting] = useState(false)

  // Fetch all images (public)
  const fetchImages = () => {
    setLoading(true)
    fetch(`${API}/images/`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch images')
        return res.json()
      })
      .then(setImages)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  // Fetch user's own images
  const fetchMyImages = () => {
    if (!token) return
    fetch(`${API}/my-images/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch your images')
        return res.json()
      })
      .then(setMyImages)
      .catch((e) => setError(e.message))
  }

  // Fetch quota usage
  const fetchQuota = () => {
    if (!token) return
    fetch(`${API}/quota-usage/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch quota usage')
        return res.json()
      })
      .then(setQuota)
      .catch((e) => setError(e.message))
  }

  // On mount or auth change, fetch data
  useEffect(() => {
    fetchImages()
    if (token) {
      fetchMyImages()
      fetchQuota()
    } else {
      setMyImages([])
      setQuota(null)
    }
  }, [token])

  // Handle auth form input
  const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value })
  }

  // Handle login/register
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    try {
      const url = authMode === 'login' ? `${API}/token` : `${API}/register`
      const body = authMode === 'login'
        ? new URLSearchParams(authForm as any)
        : JSON.stringify(authForm)
      const headers = authMode === 'login'
        ? { 'Content-Type': 'application/x-www-form-urlencoded' }
        : { 'Content-Type': 'application/json' }
      const res = await fetch(url, {
        method: 'POST',
        body,
        headers,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || 'Authentication failed')
      }
      if (authMode === 'login') {
        const data = await res.json()
        setToken(data.access_token)
        setUsername(authForm.username)
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('username', authForm.username)
      } else {
        // Registration success, switch to login
        setAuthMode('login')
      }
      setAuthForm({ username: '', password: '' })
    } catch (err: any) {
      setAuthError(err.message)
    }
  }

  // Logout
  const handleLogout = () => {
    setToken(null)
    setUsername(null)
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setMyImages([])
    setQuota(null)
  }

  // Handle image form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Handle image upload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      if (!token) throw new Error('You must be logged in to upload images')
      const res = await fetch(`${API}/images/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || 'Failed to add image')
      }
      setForm({ title: '', url: '' })
      fetchImages()
      fetchMyImages()
      fetchQuota()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle image delete (only for user's own images)
  const handleDelete = async (id: number) => {
    setError(null)
    try {
      if (!token) throw new Error('You must be logged in to delete images')
      const res = await fetch(`${API}/images/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || 'Failed to delete image')
      }
      fetchImages()
      fetchMyImages()
      fetchQuota()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ textAlign: 'center', fontSize: '3rem', fontWeight: 700, marginBottom: 40, letterSpacing: '-2px', color: '#222' }}>Image Gallery</h1>
      {/* Auth section */}
      {!token ? (
        <div style={{ maxWidth: 400, margin: '0 auto 2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 12, background: '#fafbfc' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 16 }}>{authMode === 'login' ? 'Login' : 'Register'}</h2>
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input name="username" value={authForm.username} onChange={handleAuthChange} placeholder="Username" required style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb' }} />
            <input name="password" value={authForm.password} onChange={handleAuthChange} placeholder="Password" type="password" required style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb' }} />
            <button type="submit" style={{ padding: '10px 22px', borderRadius: 6, background: '#222', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 16 }}>Submit</button>
          </form>
          {authError && <p style={{ color: 'red', marginTop: 8 }}>{authError}</p>}
          <p style={{ marginTop: 12, textAlign: 'center' }}>
            {authMode === 'login' ? (
              <>Don't have an account? <button onClick={() => setAuthMode('register')} style={{ color: '#0077cc', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Register</button></>
            ) : (
              <>Already have an account? <button onClick={() => setAuthMode('login')} style={{ color: '#0077cc', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Login</button></>
            )}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <span style={{ color: '#333', fontWeight: 500 }}>Logged in as <b>{username}</b></span>
          <button onClick={handleLogout} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 16 }}>Logout</button>
        </div>
      )}
      {/* Quota usage */}
      {token && quota && (
        <div style={{ margin: '0 auto 2rem auto', maxWidth: 500, background: '#f6f8fa', border: '1px solid #eee', borderRadius: 12, padding: 18, textAlign: 'center', fontSize: 16 }}>
          <b>Quota usage:</b><br />
          You have used <b>{quota.user_used}</b> / {quota.user_daily_quota} images today.<br />
          Global usage: <b>{quota.global_used}</b> / {quota.global_daily_quota} images today.
        </div>
      )}
      {/* Image upload form */}
      {token && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 40, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div>
            <label style={{ fontWeight: 500, color: '#333' }}>Title<br /><input name="title" value={form.title} onChange={handleChange} required style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', minWidth: 120 }} /></label>
          </div>
          <div>
            <label style={{ fontWeight: 500, color: '#333' }}>Image URL<br /><input name="url" value={form.url} onChange={handleChange} required style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', minWidth: 220 }} /></label>
          </div>
          <button type="submit" disabled={submitting} style={{ padding: '10px 22px', borderRadius: 6, background: '#222', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 16, boxShadow: '0 2px 8px #0001', transition: 'background 0.2s' }}>Add Image</button>
        </form>
      )}
      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>}
      {/* My Images section */}
      {token && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ textAlign: 'center', color: '#222', marginBottom: 18 }}>My Images</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2rem',
            alignItems: 'stretch',
          }}>
            {myImages.length === 0 && <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>You have no images.</p>}
            {myImages.map((img) => (
              <div key={img.id} style={{ boxShadow: '0 4px 24px #0002', borderRadius: 16, padding: 0, background: '#fff', overflow: 'hidden', border: '1px solid #eee', maxWidth: 500, margin: '0 auto', transition: 'box-shadow 0.2s', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <img src={img.url} alt={img.title} style={{ width: '100%', display: 'block', borderTopLeftRadius: 16, borderTopRightRadius: 16, objectFit: 'cover', maxHeight: 350, minHeight: 200, background: '#eee' }} />
                <div style={{ padding: 24, paddingTop: 18, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#222', textAlign: 'center' }}>{img.title}</h2>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: 13, color: '#888', textAlign: 'center' }}>Created: {new Date(img.created_at).toLocaleString()}</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: 13, color: '#888', textAlign: 'center' }}>ID: {img.id}</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: 13, color: '#888', textAlign: 'center' }}>URL: <a href={img.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0077cc', wordBreak: 'break-all' }}>{img.url}</a></p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
                    <button onClick={() => handleDelete(img.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: 6, padding: '8px 24px', cursor: 'pointer', fontWeight: 600, fontSize: 16, boxShadow: '0 2px 8px #e74c3c22', transition: 'background 0.2s' }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Public Gallery section */}
      <h2 style={{ textAlign: 'center', color: '#222', marginBottom: 18 }}>All Images</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '2rem',
        alignItems: 'stretch',
      }}>
        {images.length === 0 && !loading && <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No images found.</p>}
        {images.map((img) => (
          <div key={img.id} style={{ boxShadow: '0 4px 24px #0002', borderRadius: 16, padding: 0, background: '#fff', overflow: 'hidden', border: '1px solid #eee', maxWidth: 500, margin: '0 auto', transition: 'box-shadow 0.2s', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <img src={img.url} alt={img.title} style={{ width: '100%', display: 'block', borderTopLeftRadius: 16, borderTopRightRadius: 16, objectFit: 'cover', maxHeight: 350, minHeight: 200, background: '#eee' }} />
            <div style={{ padding: 24, paddingTop: 18, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#222', textAlign: 'center' }}>{img.title}</h2>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: 13, color: '#888', textAlign: 'center' }}>Created: {new Date(img.created_at).toLocaleString()}</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: 13, color: '#888', textAlign: 'center' }}>ID: {img.id}</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: 13, color: '#888', textAlign: 'center' }}>URL: <a href={img.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0077cc', wordBreak: 'break-all' }}>{img.url}</a></p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
