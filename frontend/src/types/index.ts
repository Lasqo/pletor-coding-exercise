export interface Image {
  id: string
  title: string
  user: string
  url: string
  created_at: string
}

export interface QuotaStatus {
  user: string
  user_uploads_today: number
  user_limit: number
  user_remaining: number
  global_uploads_today: number
  global_limit: number
  global_remaining: number
}

export interface AuthToken {
  access_token: string
  token_type: string
  username: string
}

export interface AuthFormData {
  username: string
  password: string
}

export interface ImageFormData {
  title: string
  url: string
}
