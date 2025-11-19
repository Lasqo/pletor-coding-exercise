import './App.css'

import { API_URL, GLOBAL_STATS_URL, QUOTAS_URL } from './config'
import { GlobalStats, Image, Quota } from './types'
import { useEffect, useState } from 'react'

import ImageGallery from './components/ImageGallery'
import SubmissionForm from './components/SubmissionForm'
import UserStats from './components/UserStats'

function App() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [allQuotas, setAllQuotas] = useState<Quota[]>([])
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)

  const fetchImages = () => {
    setLoading(true)
    fetch(API_URL)
      .then((res) => {
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
    fetchImages()
    fetchAllQuotas()
    fetchGlobalStats()
  }, [])

  const handleImageAdded = () => {
    fetchImages()
    fetchAllQuotas()
    fetchGlobalStats()
  }

  const handleDelete = async (id: string) => {
    setError(null)
    try {
      const res = await fetch(API_URL + id, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete image')
      fetchImages()
    } catch (err: any) {
      setError(err)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      <SubmissionForm onSuccess={handleImageAdded} onError={setError} error={error} />
      <ImageGallery images={images} loading={loading} onDelete={handleDelete} />
      <UserStats globalStats={globalStats} allQuotas={allQuotas} />
    </div>
  )
}

export default App
