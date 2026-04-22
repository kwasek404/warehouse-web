import type { Box, BoxWithItems, Item, ItemWithCheckouts, Checkout, CheckoutWithItem } from './types'

export function getApiBase(): string {
  return localStorage.getItem('warehouse_api_url') || import.meta.env.VITE_API_BASE_URL || ''
}

export function getToken(): string {
  return localStorage.getItem('warehouse_api_token') || ''
}

export function isConfigured(): boolean {
  return !!(getApiBase() && getToken())
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = getApiBase()
  const token = getToken()

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!(options.body instanceof FormData) && options.body) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${base}${path}`, { ...options, headers })

  if (res.status === 204) return null as T
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data as T
}

export const api = {
  boxes: {
    list: (parentId?: string | null) => {
      const params = parentId !== undefined
        ? `?parent_id=${parentId === null ? 'null' : parentId}`
        : ''
      return request<Box[]>(`/boxes${params}`)
    },
    get: (id: string) => request<BoxWithItems>(`/boxes/${id}`),
    create: (body: { label: string; parent_id?: string | null; description?: string | null }) =>
      request<Box>('/boxes', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<{ label: string; parent_id: string | null; description: string | null; photo_url: string | null }>) =>
      request<Box>(`/boxes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<null>(`/boxes/${id}`, { method: 'DELETE' }),
  },

  items: {
    list: (params: { box_id?: string; q?: string; tags?: string } = {}) => {
      const qs = new URLSearchParams()
      if (params.box_id !== undefined) qs.set('box_id', params.box_id)
      if (params.q) qs.set('q', params.q)
      if (params.tags) qs.set('tags', params.tags)
      const query = qs.toString() ? `?${qs}` : ''
      return request<Item[]>(`/items${query}`)
    },
    get: (id: string) => request<ItemWithCheckouts>(`/items/${id}`),
    create: (body: { name: string; description?: string | null; quantity?: number; box_id?: string | null; photo_url?: string | null; tags?: string | null }) =>
      request<Item>('/items', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<{ name: string; description: string | null; quantity: number; box_id: string | null; photo_url: string | null; tags: string | null }>) =>
      request<Item>(`/items/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<null>(`/items/${id}`, { method: 'DELETE' }),
  },

  checkouts: {
    list: () => request<CheckoutWithItem[]>('/checkouts'),
    create: (body: { item_id: string; quantity?: number; reason?: string | null }) =>
      request<Checkout>('/checkouts', { method: 'POST', body: JSON.stringify(body) }),
    return: (id: string, returned_quantity?: number) =>
      request<Checkout>(`/checkouts/${id}/return`, {
        method: 'PUT',
        body: JSON.stringify(returned_quantity !== undefined ? { returned_quantity } : {}),
      }),
  },

  photos: {
    upload: async (file: File): Promise<{ key: string; url: string }> => {
      const base = getApiBase()
      const token = getToken()
      const res = await fetch(`${base}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': file.type,
        },
        body: file,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      return { key: data.key, url: `${base}${data.url}` }
    },
  },
}
