import { useEffect, useState } from 'react'
import './App.css'
import { Image, QuotaStatus, ImageFormData, AuthFormData } from './types'
import { useAuth } from './hooks/useAuth'
import * as api from './services/api'
import { Header, AuthForm, QuotaDisplay, ImageUploadForm, ImageGrid } from './components'

function App() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ImageFormData>({ title: '', url: '' })
  const [submitting, setSubmitting] = useState(false)
  const [quota, setQuota] = useState<QuotaStatus | null>(null)
  const [authForm, setAuthForm] = useState<AuthFormData>({ username: '', password: '' })
  const [showLogin, setShowLogin] = useState(true)

  const { isAuthenticated, currentUser, login, logout, getAuthHeaders } = useAuth()

  const loadImages = async () => {
    setLoading(true)
    try {
      const data = await api.fetchImages()
      setImages(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadQuota = async (user: string) => {
    if (!user) return
    try {
      const data = await api.fetchQuota(user)
      setQuota(data)
    } catch (err: any) {
      console.error('Quota fetch error:', err)
    }
  }

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>, isLogin: boolean) => {
    e.preventDefault()
    setError(null)
    try {
      const data = await api.authenticate(authForm, isLogin)
      login(data)
      setAuthForm({ username: '', password: '' })
      loadImages()
      loadQuota(data.username)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleLogout = () => {
    logout()
    setQuota(null)
  }

  useEffect(() => {
    loadImages()
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadQuota(currentUser)
    }
  }, [currentUser])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api.createImage(form, getAuthHeaders())
      setForm({ title: '', url: '' })
      loadImages()
      if (currentUser) loadQuota(currentUser)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setError(null)
    try {
      await api.deleteImage(id, getAuthHeaders())
      loadImages()
      if (currentUser) loadQuota(currentUser)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', fontFamily: 'Inter, sans-serif' }}>
      <Header 
        isAuthenticated={isAuthenticated} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
      />

      {!isAuthenticated && (
        <AuthForm
          authForm={authForm}
          setAuthForm={setAuthForm}
          onSubmit={handleAuth}
          showLogin={showLogin}
          setShowLogin={setShowLogin}
        />
      )}

      {quota && <QuotaDisplay quota={quota} />}

      {isAuthenticated && (
        <ImageUploadForm
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}

      {error && (
        <p style={{ color: '#e74c3c', textAlign: 'center', padding: 16, background: '#fee', borderRadius: 8, fontWeight: 600 }}>
          ⚠️ {error}
        </p>
      )}

      <ImageGrid
        images={images}
        loading={loading}
        onDelete={handleDelete}
        currentUser={currentUser}
      />
    </div>
  )
}

export default App
