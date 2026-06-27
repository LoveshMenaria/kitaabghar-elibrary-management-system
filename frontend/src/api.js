const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export async function api(path, options = {}) {
  const token = localStorage.getItem('token')
  const isForm = options.body instanceof FormData
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...(isForm ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
  })
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token'); localStorage.removeItem('user')
    if (!path.includes('/auth/')) window.location.reload()
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || `Request failed (${response.status})`)
  }
  return response.status === 204 || response.headers.get('content-length') === '0' ? null : response.json()
}

export async function authBlobUrl(path) {
  const token = localStorage.getItem('token')
  const response = await fetch(`${BASE}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!response.ok) throw new Error(`Request failed (${response.status})`)
  return URL.createObjectURL(await response.blob())
}
