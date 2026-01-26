export interface Image {
  id: number
  title: string
  url: string
  created_at: string
  user: string
}

export interface PaginatedImagesResponse {
  items: Image[]
  total: number
  limit: number
  offset: number
}

