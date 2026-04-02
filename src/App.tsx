import { useEffect, useRef, useState } from 'react'
import { usePlayer } from './context/PlayerContext'
import { TrackList } from './components/TrackList'
import { PlayerBar } from './components/PlayerBar'
import { VisualizerView } from './components/VisualizerView'

export default function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const { state, dispatch } = usePlayer()
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audioRef.current = audio
    return () => { audio.pause() }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (state.status === 'playing') audio.play().catch(console.error)
    else if (state.status === 'paused') audio.pause()
  }, [state.status])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !state.currentTrack) return

    async function load() {
      const res = await fetch(`/api/tracks/url?key=${encodeURIComponent(state.currentTrack!.key)}`)
      const { url } = await res.json()
      audio!.src = url
      audio!.volume = state.volume

      if (!sourceRef.current) {
        const ctx = new AudioContext()
        await ctx.resume()
        const source = ctx.createMediaElementSource(audio!)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        analyser.connect(ctx.destination)
        audioContextRef.current = ctx
        sourceRef.current = source
        analyserRef.current = analyser
      } else if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      await audio!.play()
      dispatch({ type: 'PLAY' })
    }

    load().catch(console.error)
  }, [state.currentTrack]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-dvh flex flex-col bg-gray-950 text-white">
      <header className="shrink-0 px-6 py-4 border-b border-white/10">
        <h1 className="text-xl font-semibold tracking-tight">Sushi Cloud</h1>
      </header>

      <div className="flex-1 min-h-0 relative overflow-hidden">
        <TrackList />

        <div className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
          expanded ? 'translate-y-0' : 'translate-y-full'
        }`}>
          <VisualizerView onClose={() => setExpanded(false)} expanded={expanded} analyserRef={analyserRef} />
        </div>
      </div>

      <PlayerBar audioRef={audioRef} expanded={expanded} onExpandToggle={() => setExpanded(v => !v)} />
    </div>
  )
}
