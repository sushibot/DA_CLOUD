import { useEffect, useState } from 'react'
import { usePlayer } from '../context/PlayerContext'
import { API_BASE } from '../lib/api'
import type { Track } from '../types'

export function useTracks() {
  const { dispatch } = usePlayer()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/tracks`)
      .then((res) => res.json())
      .then((tracks: Track[]) => {
        dispatch({ type: 'SET_TRACKS', payload: tracks })
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [dispatch])

  return loading
}
