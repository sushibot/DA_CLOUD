import { useEffect, useState } from 'react'
import { API_BASE } from '../lib/api'
import type { Album } from '../types'

export function useAlbums() {
	const [albums, setAlbums] = useState<Album[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetch(`${API_BASE}/api/albums`)
			.then(r => r.json())
			.then((data: Album[]) => {
				setAlbums(data)
				setLoading(false)
			})
			.catch(err => {
				console.error(err)
				setLoading(false)
			})
	}, [])

	return { albums, loading }
}
