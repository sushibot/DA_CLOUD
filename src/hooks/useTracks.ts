import { useEffect } from 'react'
import { usePlayer } from '../context/PlayerContext'
import type { Track } from '../types'

export function useTracks() {
  const { dispatch } = usePlayer()

  useEffect(() => {
    fetch('/api/tracks')
      .then((res) => res.json())
      .then((tracks: Track[]) => dispatch({ type: 'SET_TRACKS', payload: tracks }))
      .catch(console.error)
  }, [dispatch])
}
