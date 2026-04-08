const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export { API_URL }

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem('token', token)
  else localStorage.removeItem('token')
}

export function authHeaders(): Record<string, string> {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export async function parseErrorDetail(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: unknown }
    const d = data.detail
    if (typeof d === 'string') return d
    if (d && typeof d === 'object' && 'message' in d) {
      return String((d as { message: string }).message)
    }
    return JSON.stringify(d)
  } catch {
    return res.statusText
  }
}
