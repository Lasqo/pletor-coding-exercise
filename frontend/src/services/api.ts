import { API_ENDPOINTS } from '../config/api'
import { Image, AuthToken, AuthFormData, ImageFormData, QuotaStatus } from '../types'

export const fetchImages = async (): Promise<Image[]> => {
  const res = await fetch(API_ENDPOINTS.images)
  if (!res.ok) throw new Error('Failed to fetch images')
  return res.json()
}

export const createImage = async (
  data: ImageFormData,
  authHeaders: Record<string, string>
): Promise<Image> => {
  const res = await fetch(API_ENDPOINTS.images, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to add image' }))
    throw new Error(errorData.detail || 'Failed to add image')
  }
  return res.json()
}

export const deleteImage = async (
  id: string,
  authHeaders: Record<string, string>
): Promise<void> => {
  const res = await fetch(API_ENDPOINTS.images + id, {
    method: 'DELETE',
    headers: authHeaders,
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to delete image' }))
    throw new Error(errorData.detail || 'Failed to delete image')
  }
}

export const authenticate = async (
  data: AuthFormData,
  isLogin: boolean
): Promise<AuthToken> => {
  const endpoint = isLogin ? API_ENDPOINTS.login : API_ENDPOINTS.register
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Authentication failed' }))
    throw new Error(errorData.detail || 'Authentication failed')
  }
  return res.json()
}

export const fetchQuota = async (user: string): Promise<QuotaStatus> => {
  const res = await fetch(API_ENDPOINTS.quota(user))
  if (!res.ok) throw new Error('Failed to fetch quota')
  return res.json()
}
