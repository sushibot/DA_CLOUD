import { useEffect, useRef } from 'react'
import { usePlayer } from './context/PlayerContext'
import { TrackList } from './components/TrackList'
import { PlayerBar } from './components/PlayerBar'

export default function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { state, dispatch } = usePlayer()

  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio
    return () => { audio.pause() }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !state.currentTrack) return

    async function load() {
      const res = await fetch(`/api/tracks/url?key=${encodeURIComponent(state.currentTrack!.key)}`)
      const { url } = await res.json()
      audio!.src = url
      audio!.volume = state.volume
      await audio!.play()
      dispatch({ type: 'PLAY' })
    }

    load().catch(console.error)
  }, [state.currentTrack]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      <header className="px-6 py-4 border-b border-white/10">
        <h1 className="text-xl font-semibold tracking-tight">Sushi Cloud</h1>
      </header>

      <TrackList />

      <PlayerBar audioRef={audioRef} />
    </div>
  )
}
