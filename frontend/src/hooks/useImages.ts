import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API_URL, PAGE_SIZE } from '../config/constants'
import type { Image, PaginatedImagesResponse } from '../types'

export type { Image } from '../types'

export function useImages() {
  return useInfiniteQuery({
    queryKey: ['images'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`${API_URL}/?limit=${PAGE_SIZE}&offset=${pageParam}`)
      if (!response.ok) {
        throw new Error('Failed to fetch images')
      }
      return response.json() as Promise<PaginatedImagesResponse>
    },
    getNextPageParam: lastPage => {
      const nextOffset = lastPage.offset + lastPage.limit
      return nextOffset < lastPage.total ? nextOffset : undefined
    },
    initialPageParam: 0,
  })
}

export function useUploadImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to upload image: ${response.statusText}`)
      }

      return response.json() as Promise<Image>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] })
    },
  })
}

export function useUploadImagesBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData()
      // FastAPI expects multiple files with the same field name
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch(`${API_URL}/upload/batch`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to upload images')
      }

      return response.json() as Promise<Image[]>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] })
    },
  })
}

export function useDeleteImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete image: ${response.statusText}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] })
    },
  })
}
