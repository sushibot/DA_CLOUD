import { useEffect, useState } from 'react'
import { API_BASE } from '../lib/api'
import type { Album } from '../types'

interface AlbumDetail extends Album {
	trackCount: number
	totalDurationMs: number
}

export function useAlbum(id: string) {
	const [album, setAlbum] = useState<AlbumDetail | null>(null)

	useEffect(() => {
		fetch(`${API_BASE}/api/albums/${id}`)
			.then(r => r.json())
			.then(setAlbum)
			.catch(console.error)
	}, [id])

	return album
}
