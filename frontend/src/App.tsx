import './App.css'

import { API_URL, GLOBAL_STATS_URL, QUOTAS_URL } from './config'
import { GlobalStats, Image, Quota } from './types'
import { useEffect, useState } from 'react'

import ImageGallery from './components/ImageGallery'
import Login from './components/Login'
import Register from './components/Register'
import SubmissionForm from './components/SubmissionForm'
import UserStats from './components/UserStats'

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [allQuotas, setAllQuotas] = useState<Quota[]>([])
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const handleSetToken = (newToken: string) => {
    setToken(newToken)
    localStorage.setItem('token', newToken)
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('token')
    setImages([])
  }

  const fetchImages = () => {
    if (!token) return
    setLoading(true)
    fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.status === 401) {
            handleLogout()
            throw new Error('Session expired')
        }
        if (!res.ok) throw new Error('Failed to fetch images')
        return res.json()
      })
      .then(setImages)
      .catch(setError)
      .finally(() => setLoading(false))
  }

  const fetchAllQuotas = () => {
    fetch(QUOTAS_URL)
      .then((res) => {
        if (res.ok) return res.json()
        throw new Error('Failed to fetch quotas')
      })
      .then(setAllQuotas)
      .catch((err) => console.error('Error fetching all quotas:', err))
  }

  const fetchGlobalStats = () => {
    fetch(GLOBAL_STATS_URL)
      .then((res) => {
        if (res.ok) return res.json()
        throw new Error('Failed to fetch global stats')
      })
      .then(setGlobalStats)
      .catch((err) => console.error('Error fetching global stats:', err))
  }

  useEffect(() => {
    if (token) {
      fetchImages()
      fetchAllQuotas()
      fetchGlobalStats()
    }
  }, [token])

  const handleImageAdded = () => {
    fetchImages()
    fetchAllQuotas()
    fetchGlobalStats()
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    setError(null)
    try {
      const res = await fetch(API_URL + id, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.status === 401) {
          handleLogout()
          throw new Error('Session expired')
      }
      if (!res.ok) throw new Error('Failed to delete image')
      fetchImages()
    } catch (err: any) {
      setError(err)
    }
  }

  if (!token) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        {authMode === 'login' ? (
          <Login setToken={handleSetToken} switchToRegister={() => setAuthMode('register')} />
        ) : (
          <Register setToken={handleSetToken} switchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      <SubmissionForm token={token} onSuccess={handleImageAdded} onError={setError} onLogout={handleLogout} error={error} />
      <ImageGallery images={images} loading={loading} onDelete={handleDelete} />
      <UserStats globalStats={globalStats} allQuotas={allQuotas} />
    </div>
  )
}

export default App
