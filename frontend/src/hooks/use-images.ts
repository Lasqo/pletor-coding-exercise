import { useEffect, useState, useCallback } from 'react'
import { Image, ImageFormData } from '../types/image'
import { API_URL } from '../config/api'

interface UseImagesReturn {
  images: Image[]
  loading: boolean
  error: Error | null
  form: ImageFormData
  submitting: boolean
  deleting: string | null
  showSuccess: boolean
  setForm: React.Dispatch<React.SetStateAction<ImageFormData>>
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  handleDelete: (id: string) => Promise<void>
  clearError: () => void
}

const INITIAL_FORM_STATE: ImageFormData = {
  title: '',
  user: '',
  url: '',
}

/**
 * Custom hook for managing image CRUD operations
 */
export function useImages(): UseImagesReturn {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [form, setForm] = useState<ImageFormData>(INITIAL_FORM_STATE)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const fetchImages = useCallback(() => {
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
    fetchImages()
  }, [fetchImages])

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to add image')
      setForm(INITIAL_FORM_STATE)
      setShowSuccess(true)
      fetchImages()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setSubmitting(false)
    }
  }, [form, fetchImages])

  const handleDelete = useCallback(async (id: string) => {
    setError(null)
    setDeleting(id)
    try {
      const res = await fetch(`${API_URL}${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete image')
      fetchImages()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setDeleting(null)
    }
  }, [fetchImages])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    images,
    loading,
    error,
    form,
    submitting,
    deleting,
    showSuccess,
    setForm,
    handleChange,
    handleSubmit,
    handleDelete,
    clearError,
  }
}
