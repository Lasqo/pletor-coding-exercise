export interface Image {
  id: string
  title: string
  user: string
  url: string
  created_at: string
}

export interface Quota {
  user: string
  usage: number
  limit: number
}

export interface GlobalStats {
  date: string
  total_count: number
  limit: number
}

