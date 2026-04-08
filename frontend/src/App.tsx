import React, { useCallback, useEffect, useRef, useState, type DragEvent, type FormEvent } from 'react'
import './App.css'
import { API_URL, authHeaders, getToken, parseErrorDetail, setToken } from './api'

interface Image {
  id: number
  title: string
  user: string
  url: string
  created_at: string
  file_size: number | null
  content_type: string | null
}

interface ImageListResponse {
  items: Image[]
  total: number
}

interface Quota {
  user_uploads_today: number
  user_limit: number
  user_remaining: number
  global_uploads_today: number
  global_limit: number
  global_remaining: number
}

interface Me {
  id: number
  username: string
}

const PAGE_SIZE = 12

function xhrUpload(
  url: string,
  formData: FormData,
  token: string,
  onProgress: (p: number) => void,
): Promise<Image> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as Image)
        } catch {
          reject(new Error('Invalid response'))
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText) as { detail?: unknown }
          const d = err.detail
          const msg =
            typeof d === 'string'
              ? d
              : d && typeof d === 'object' && 'message' in d
                ? String((d as { message: string }).message)
                : JSON.stringify(d)
          reject(new Error(msg))
        } catch {
          reject(new Error(xhr.statusText))
        }
      }
    }
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(formData)
  })
}

function App() {
  const [me, setMe] = useState<Me | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [images, setImages] = useState<Image[]>([])
  const [total, setTotal] = useState(0)
  const [pageOffset, setPageOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [quota, setQuota] = useState<Quota | null>(null)

  const [title, setTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [regUser, setRegUser] = useState('')
  const [regPass, setRegPass] = useState('')
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')

  const fetchQuota = useCallback(async () => {
    const t = getToken()
    if (!t) {
      setQuota(null)
      return
    }
    const res = await fetch(`${API_URL}/quota`, { headers: authHeaders() })
    if (!res.ok) {
      setQuota(null)
      return
    }
    setQuota((await res.json()) as Quota)
  }, [])

  const fetchMe = useCallback(async () => {
    const t = getToken()
    if (!t) {
      setMe(null)
      return
    }
    const res = await fetch(`${API_URL}/auth/me`, { headers: authHeaders() })
    if (!res.ok) {
      setToken(null)
      setMe(null)
      return
    }
    setMe((await res.json()) as Me)
  }, [])

  const fetchImages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${API_URL}/images/?limit=${PAGE_SIZE}&offset=${pageOffset}`,
      )
      if (!res.ok) throw new Error(await parseErrorDetail(res))
      const data = (await res.json()) as ImageListResponse
      setImages(data.items)
      setTotal(data.total)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch images')
    } finally {
      setLoading(false)
    }
  }, [pageOffset])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setAuthLoading(true)
      await fetchMe()
      if (!cancelled) setAuthLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [fetchMe])

  useEffect(() => {
    if (me) fetchQuota()
    else setQuota(null)
  }, [me, fetchQuota])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const handleLogout = () => {
    setToken(null)
    setMe(null)
    setQuota(null)
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const body = new URLSearchParams()
    body.set('username', loginUser)
    body.set('password', loginPass)
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    if (!res.ok) {
      setError(await parseErrorDetail(res))
      return
    }
    const data = (await res.json()) as { access_token: string }
    setToken(data.access_token)
    setLoginUser('')
    setLoginPass('')
    await fetchMe()
    await fetchQuota()
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: regUser, password: regPass }),
    })
    if (!res.ok) {
      setError(await parseErrorDetail(res))
      return
    }
    const body = new URLSearchParams()
    body.set('username', regUser)
    body.set('password', regPass)
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    if (!loginRes.ok) {
      setError(await parseErrorDetail(loginRes))
      return
    }
    const data = (await loginRes.json()) as { access_token: string }
    setToken(data.access_token)
    setRegUser('')
    setRegPass('')
    await fetchMe()
    await fetchQuota()
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    setSelectedFile(file)
    setError(null)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!me) {
      setError('Please log in to upload.')
      return
    }
    if (!selectedFile) {
      setError('Please select a file to upload')
      return
    }
    const t = getToken()
    if (!t) {
      setError('Please log in to upload.')
      return
    }

    setSubmitting(true)
    setError(null)
    setUploadPct(0)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', title)

      await xhrUpload(`${API_URL}/images/upload`, formData, t, setUploadPct)

      setTitle('')
      setSelectedFile(null)
      setUploadPct(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await fetchImages()
      await fetchQuota()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploadPct(0)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    setError(null)
    const t = getToken()
    if (!t) {
      setError('Please log in to delete.')
      return
    }
    try {
      const res = await fetch(`${API_URL}/images/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${t}` },
      })
      if (!res.ok) throw new Error(await parseErrorDetail(res))
      await fetchImages()
      await fetchQuota()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url
    return `${API_URL}${url}`
  }

  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1)
  const currentPage = Math.floor(pageOffset / PAGE_SIZE)

  if (authLoading) {
    return (
      <div style={{ maxWidth: 1200, margin: '2rem auto', textAlign: 'center', color: '#888' }}>
        Loading…
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', fontFamily: 'Inter, sans-serif' }}>
      <h1
        style={{
          textAlign: 'center',
          fontSize: '3rem',
          fontWeight: 700,
          marginBottom: 40,
          letterSpacing: '-2px',
          color: '#222',
        }}
      >
        Image Gallery
      </h1>

      {!me ? (
        <div
          style={{
            maxWidth: 420,
            margin: '0 auto 40px auto',
            padding: 24,
            border: '1px solid #eee',
            borderRadius: 12,
            background: '#fafafa',
          }}
        >
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => setAuthTab('login')}
              style={{
                flex: 1,
                padding: 10,
                border: 'none',
                borderRadius: 8,
                background: authTab === 'login' ? '#222' : '#eee',
                color: authTab === 'login' ? '#fff' : '#333',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('register')}
              style={{
                flex: 1,
                padding: 10,
                border: 'none',
                borderRadius: 8,
                background: authTab === 'register' ? '#222' : '#eee',
                color: authTab === 'register' ? '#fff' : '#333',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Register
            </button>
          </div>
          {authTab === 'login' ? (
            <form onSubmit={handleLogin}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
                Username
                <input
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  required
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: 4,
                    padding: 8,
                    borderRadius: 6,
                    border: '1px solid #bbb',
                    boxSizing: 'border-box',
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: 16, fontWeight: 500, fontSize: 14 }}>
                Password
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  required
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: 4,
                    padding: 8,
                    borderRadius: 6,
                    border: '1px solid #bbb',
                    boxSizing: 'border-box',
                  }}
                />
              </label>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  background: '#222',
                  color: 'white',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Log in
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
                Username
                <input
                  value={regUser}
                  onChange={(e) => setRegUser(e.target.value)}
                  required
                  minLength={2}
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: 4,
                    padding: 8,
                    borderRadius: 6,
                    border: '1px solid #bbb',
                    boxSizing: 'border-box',
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: 16, fontWeight: 500, fontSize: 14 }}>
                Password
                <input
                  type="password"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: 4,
                    padding: 8,
                    borderRadius: 6,
                    border: '1px solid #bbb',
                    boxSizing: 'border-box',
                  }}
                />
              </label>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  background: '#222',
                  color: 'white',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Register
              </button>
            </form>
          )}
          <p style={{ marginTop: 16, fontSize: 13, color: '#666', textAlign: 'center' }}>
            For demo accounts, use password <code>demo123</code>
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 24,
            maxWidth: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <span style={{ fontWeight: 600, color: '#333' }}>
            Signed in as <span style={{ color: '#0077cc' }}>{me.username}</span>
          </span>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #ccc',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Log out
          </button>
        </div>
      )}

      {me && quota && (
        <div
          style={{
            maxWidth: 600,
            margin: '0 auto 24px auto',
            padding: '12px 16px',
            background: '#f0f7ff',
            borderRadius: 8,
            border: '1px solid #cce5ff',
            fontSize: 14,
            color: '#333',
          }}
        >
          <strong>Uploads today (UTC):</strong> you have{' '}
          <strong>{quota.user_remaining}</strong> / {quota.user_limit} left; global pool{' '}
          <strong>{quota.global_remaining}</strong> / {quota.global_limit} remaining.
        </div>
      )}

      {me && (
        <form
          onSubmit={handleSubmit}
          style={{ marginBottom: 40, maxWidth: 600, margin: '0 auto 40px auto' }}
        >
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500, color: '#333', fontSize: 14 }}>
              Title
              <br />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  padding: 8,
                  borderRadius: 6,
                  border: '1px solid #bbb',
                  width: '100%',
                  boxSizing: 'border-box',
                  marginTop: 4,
                }}
              />
            </label>
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
              <p style={{ margin: 0, color: '#333', fontWeight: 500 }}>
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            ) : (
              <p style={{ margin: 0, color: '#888' }}>
                Drag & drop an image here, or click to select
              </p>
            )}
          </div>

          {submitting && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  height: 8,
                  background: '#eee',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${uploadPct}%`,
                    height: '100%',
                    background: '#0077cc',
                    transition: 'width 0.1s',
                  }}
                />
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: 13, color: '#555', textAlign: 'center' }}>
                {uploadPct}%
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px 22px',
              borderRadius: 8,
              background: '#222',
              color: 'white',
              fontWeight: 600,
              border: 'none',
              cursor: submitting ? 'wait' : 'pointer',
              fontSize: 16,
              boxShadow: '0 2px 8px #0001',
              transition: 'background 0.2s',
            }}
          >
            {submitting ? 'Uploading…' : 'Upload Image'}
          </button>
        </form>
      )}

      {!me && (
        <p style={{ textAlign: 'center', color: '#888', marginBottom: 24 }}>
          Log in to upload images. You can still browse the gallery below.
        </p>
      )}

      {error && (
        <p
          style={{
            color: '#e74c3c',
            textAlign: 'center',
            padding: '8px 16px',
            background: '#fdf0ef',
            borderRadius: 8,
            maxWidth: 600,
            margin: '0 auto 24px auto',
          }}
        >
          {error}
        </p>
      )}
      {loading && <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p>}

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          disabled={pageOffset === 0 || loading}
          onClick={() => setPageOffset((o) => Math.max(0, o - PAGE_SIZE))}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: pageOffset === 0 ? '#f5f5f5' : '#fff',
            cursor: pageOffset === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          Previous
        </button>
        <span style={{ fontSize: 14, color: '#555' }}>
          Page {currentPage + 1} of {Math.max(1, maxPage + 1)} ({total} images)
        </span>
        <button
          type="button"
          disabled={pageOffset + PAGE_SIZE >= total || loading}
          onClick={() => setPageOffset((o) => o + PAGE_SIZE)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: pageOffset + PAGE_SIZE >= total ? '#f5f5f5' : '#fff',
            cursor: pageOffset + PAGE_SIZE >= total ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          Next
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch',
        }}
      >
        {images.length === 0 && !loading && (
          <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#888' }}>
            No images found.
          </p>
        )}
        {images.map((img) => (
          <div
            key={img.id}
            style={{
              boxShadow: '0 4px 24px #0002',
              borderRadius: 16,
              padding: 0,
              background: '#fff',
              overflow: 'hidden',
              border: '1px solid #eee',
              transition: 'box-shadow 0.2s',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <img
              src={getImageUrl(img.url)}
              alt={img.title}
              style={{
                width: '100%',
                display: 'block',
                objectFit: 'cover',
                height: 220,
                background: '#eee',
              }}
            />
            <div
              style={{
                padding: 16,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#222' }}>
                  {img.title}
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#555', fontSize: 14 }}>
                  by <span style={{ color: '#0077cc' }}>{img.user}</span>
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#999' }}>
                  {new Date(img.created_at).toLocaleString()}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                {me && me.username === img.user ? (
                  <button
                    onClick={() => handleDelete(img.id)}
                    style={{
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 16px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    Delete
                  </button>
                ) : (
                  <span style={{ fontSize: 12, color: '#bbb' }}> </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
