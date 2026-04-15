import { useEffect, useState } from 'react'
import { API_BASE } from '../lib/api'

interface Album {
  id: string
  title: string
  description: string | null
  releaseYear: number
  coverArtS3Key: string | null
  isArchived: boolean
  createdAt: string
  trackCount: number
  totalDurationMs: number
}

const DEMO_ALBUM_ID = '4fbef431-fd7c-4709-b73f-39aa8d5f4638'

export function useAlbum(id: string = DEMO_ALBUM_ID) {
  const [album, setAlbum] = useState<Album | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/albums/${id}`)
      .then(r => r.json())
      .then(setAlbum)
      .catch(console.error)
  }, [id])

  return album
}
