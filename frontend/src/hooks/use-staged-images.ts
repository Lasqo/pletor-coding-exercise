import { useState, useCallback } from 'react'
import { StagedImage, ALLOWED_IMAGE_TYPES, AllowedImageType } from '../types/image'
import { API_URL } from '../config/api'

interface UseStagedImagesReturn {
  stagedImages: StagedImage[]
  addFiles: (files: File[]) => { accepted: File[]; rejected: File[] }
  addUrls: (urls: string[]) => void
  updateStaged: (id: string, data: Partial<StagedImage>) => void
  removeStaged: (id: string) => void
  uploadStaged: (id: string) => Promise<boolean>
  validationError: string | null
  clearValidationError: () => void
}

/**
 * Generates a unique ID for staged images
 */
function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Validates if a file has an allowed image type
 */
function isAllowedImageType(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType)
}

/**
 * Parses a string of URLs separated by newlines, commas, or spaces
 */
function parseUrls(input: string): string[] {
  return input
    .split(/[\n,\s]+/)
    .map((url) => url.trim())
    .filter((url) => url.length > 0 && (url.startsWith('http://') || url.startsWith('https://')))
}

/**
 * Custom hook for managing staged images before upload
 */
export function useStagedImages(onUploadSuccess: () => void): UseStagedImagesReturn {
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)

  const clearValidationError = useCallback(() => {
    setValidationError(null)
  }, [])

  const addFiles = useCallback((files: File[]) => {
    const accepted: File[] = []
    const rejected: File[] = []

    files.forEach((file) => {
      if (isAllowedImageType(file)) {
        accepted.push(file)
      } else {
        rejected.push(file)
      }
    })

    if (rejected.length > 0) {
      const rejectedNames = rejected.map((f) => f.name).join(', ')
      setValidationError(
        `Unsupported file type(s): ${rejectedNames}. Allowed: JPEG, PNG, GIF, WebP`
      )
    }

    if (accepted.length > 0) {
      const newStagedImages: StagedImage[] = accepted.map((file) => ({
        id: generateId(),
        source: 'file',
        file,
        url: URL.createObjectURL(file),
        title: '',
        user: '',
        status: 'staged',
      }))

      setStagedImages((prev) => [...prev, ...newStagedImages])
    }

    return { accepted, rejected }
  }, [])

  const addUrls = useCallback((urls: string[]) => {
    const parsedUrls = typeof urls[0] === 'string' && urls.length === 1 
      ? parseUrls(urls[0]) 
      : urls.filter((url) => url.startsWith('http://') || url.startsWith('https://'))

    if (parsedUrls.length === 0) return

    const newStagedImages: StagedImage[] = parsedUrls.map((url) => ({
      id: generateId(),
      source: 'url',
      url,
      title: '',
      user: '',
      status: 'staged',
    }))

    setStagedImages((prev) => [...prev, ...newStagedImages])
  }, [])

  const updateStaged = useCallback((id: string, data: Partial<StagedImage>) => {
    setStagedImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...data } : img))
    )
  }, [])

  const removeStaged = useCallback((id: string) => {
    setStagedImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id)
      // Revoke blob URL to prevent memory leak
      if (imageToRemove?.source === 'file' && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url)
      }
      return prev.filter((img) => img.id !== id)
    })
  }, [])

  const uploadStaged = useCallback(
    async (id: string): Promise<boolean> => {
      const image = stagedImages.find((img) => img.id === id)
      if (!image) return false

      // Update status to uploading
      setStagedImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, status: 'uploading', error: undefined } : img))
      )

      try {
        let response: Response

        if (image.source === 'file' && image.file) {
          // Upload file using FormData
          const formData = new FormData()
          formData.append('title', image.title)
          formData.append('user', image.user)
          formData.append('file', image.file)

          response = await fetch(`${API_URL}upload`, {
            method: 'POST',
            body: formData,
          })
        } else {
          // Upload URL using JSON
          response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: image.title,
              user: image.user,
              url: image.url,
            }),
          })
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }))
          throw new Error(errorData.detail || 'Upload failed')
        }

        // Update status to success
        setStagedImages((prev) =>
          prev.map((img) => (img.id === id ? { ...img, status: 'success' } : img))
        )

        // Auto-remove after delay and refresh
        setTimeout(() => {
          removeStaged(id)
          onUploadSuccess()
        }, 1500)

        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        setStagedImages((prev) =>
          prev.map((img) =>
            img.id === id ? { ...img, status: 'error', error: errorMessage } : img
          )
        )
        return false
      }
    },
    [stagedImages, removeStaged, onUploadSuccess]
  )

  return {
    stagedImages,
    addFiles,
    addUrls,
    updateStaged,
    removeStaged,
    uploadStaged,
    validationError,
    clearValidationError,
  }
}

