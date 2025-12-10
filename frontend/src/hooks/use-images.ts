import { useEffect, useState, useCallback } from 'react'
import { Image } from '../types/image'
import { API_URL } from '../config/api'

interface UseImagesReturn {
  images: Image[]
  loading: boolean
  error: Error | null
  deleting: string | null
  refreshImages: () => void
  handleDelete: (id: string) => Promise<void>
  clearError: () => void
}

/**
 * Custom hook for managing image list and delete operations
 */
export function useImages(): UseImagesReturn {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const refreshImages = useCallback(() => {
    setLoading(true)
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch images')
        return res.json()
      })
      .then(setImages)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refreshImages()
  }, [refreshImages])

  const handleDelete = useCallback(async (id: string) => {
    setError(null)
    setDeleting(id)
    try {
      const res = await fetch(`${API_URL}${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete image')
      refreshImages()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setDeleting(null)
    }
  }, [refreshImages])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    images,
    loading,
    error,
    deleting,
    refreshImages,
    handleDelete,
    clearError,
  }
}
