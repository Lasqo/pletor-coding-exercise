import { API_BASE_URL } from '../constants/api'

const getUploadErrorMessage = (status: number): string => {
  if (status === 413) {
    return 'File is too large for the server.'
  }

  if (status === 415) {
    return 'File type is not supported.'
  }

  if (status === 429) {
    return 'Too many uploads. Please wait and try again.'
  }

  if (status >= 500) {
    return 'Server error. Please try again later.'
  }

  return 'Upload failed. Please try again.'
}

type ImageRead = {
  id: number
  created_at: string
  title: string
  user: string
  url: string
}

type UploadImageParams = {
  file: File
}

const fetchImages = async (): Promise<ImageRead[]> => {
  const response = await fetch(`${API_BASE_URL}/images/`)

  if (!response.ok) {
    throw new Error('Failed to fetch images')
  }

  return response.json()
}

const uploadImage = async ({ file }: UploadImageParams): Promise<ImageRead> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/images/upload`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error(getUploadErrorMessage(response.status))
  }

  return response.json()
}

const deleteImage = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/images/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error('Failed to delete image')
  }
}

export { deleteImage, fetchImages, uploadImage }
export type { ImageRead }
