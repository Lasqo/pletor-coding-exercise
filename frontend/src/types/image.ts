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
 * Form data for creating a new image
 */
export interface ImageFormData {
  title: string
  user: string
  url: string
}
