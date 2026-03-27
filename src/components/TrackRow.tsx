import type { Track } from '../types'
import { usePlayer } from '../context/PlayerContext'

interface Props {
  track: Track
  isActive: boolean
}


export function TrackRow({ track, isActive }: Props) {
  const { state, dispatch } = usePlayer()

  function handleClick() {
    if (isActive) {
      dispatch({ type: state.status === 'playing' ? 'PAUSE' : 'PLAY' })
    } else {
      dispatch({ type: 'LOAD_TRACK', payload: track })
    }
  }

  return (
    <li
      id={`track-${CSS.escape(track.key)}`}
      onClick={handleClick}
      className={`flex items-center justify-between px-4 py-3 cursor-pointer rounded-lg transition-colors gap-4 ${
        isActive ? 'bg-violet-600 text-white' : 'hover:bg-white/10 text-gray-200'
      }`}
    >
      {/* Left: title */}
      <span className="truncate">{track.title}</span>

      {/* Right: duration + bpm */}
      <span className={`shrink-0 flex items-center gap-3 text-sm tabular-nums ${isActive ? 'text-violet-200' : 'text-gray-500'}`}>
        {track.bpm != null && <span>{track.bpm} BPM</span>}
        <span>0:00</span>
      </span>
    </li>
  )
}
