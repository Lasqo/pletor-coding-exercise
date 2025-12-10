/**
 * Represents an image entity from the API
 */
export interface Image {
  id: string
  title: string
  user: string
  url: string
  created_at: string
}

/**
 * Status of a staged image during the upload process
 */
export type StagedImageStatus = 'staged' | 'uploading' | 'success' | 'error'

/**
 * Source type for a staged image
 */
export type StagedImageSource = 'file' | 'url'

/**
 * Represents an image staged for upload
 */
export interface StagedImage {
  /** UUID for client-side tracking */
  id: string
  /** Whether the image comes from a file drop or a pasted URL */
  source: StagedImageSource
  /** The file object for file drops */
  file?: File
  /** Preview URL (blob: for files, actual URL for pasted URLs) */
  url: string
  /** Image title */
  title: string
  /** User who uploaded the image */
  user: string
  /** Current status in the upload process */
  status: StagedImageStatus
  /** Error message from server if upload failed */
  error?: string
}

/**
 * Allowed image MIME types for upload
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number]

