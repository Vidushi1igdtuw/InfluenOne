export type GalleryItem = {
  id: string
  url: string
  topic: string
  createdAt: string
}

const KEY = 'influenone_image_gallery'
const MAX = 24

export function loadGallery(): GalleryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const items = JSON.parse(raw) as GalleryItem[]
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

export function saveGalleryItem(item: Omit<GalleryItem, 'id' | 'createdAt'>) {
  if (!item.url || item.url.startsWith('data:')) return
  const next: GalleryItem = {
    ...item,
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  const items = [next, ...loadGallery().filter((g) => g.url !== item.url)].slice(0, MAX)
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function clearGallery() {
  localStorage.removeItem(KEY)
}
