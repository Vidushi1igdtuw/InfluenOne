'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { clearGallery, loadGallery, type GalleryItem } from '@/lib/gallery'

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])

  useEffect(() => {
    setItems(loadGallery())
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#3D8BD3]">ASI:One image</p>
          <h1 className="text-3xl font-semibold tracking-tight">Gallery</h1>
          <p className="mt-1 text-sm text-muted-foreground">Graphics generated in Studio, kept on this device.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/ai"><Button className="rounded-full">Generate</Button></Link>
          {items.length > 0 && (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                clearGallery()
                setItems([])
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="lab-glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
          No graphics yet. Generate a post with image on in Studio.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <figure key={item.id} className="lab-glass overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.topic} className="aspect-video w-full object-cover" />
              <figcaption className="p-3 text-xs text-muted-foreground">
                <p className="truncate text-foreground">{item.topic}</p>
                <p className="font-mono">{new Date(item.createdAt).toLocaleString()}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  )
}
