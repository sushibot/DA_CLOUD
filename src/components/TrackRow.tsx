import type { Track } from '../types'
import { usePlayer } from '../context/PlayerContext'

interface Props {
  track: Track
  isActive: boolean
}

export function TrackRow({ track, isActive }: Props) {
  const { dispatch } = usePlayer()

  return (
    <li
      id={`track-${CSS.escape(track.key)}`}
      onClick={() => dispatch({ type: 'LOAD_TRACK', payload: track })}
      className={`px-4 py-3 cursor-pointer rounded-lg transition-colors ${
        isActive
          ? 'bg-violet-600 text-white'
          : 'hover:bg-white/10 text-gray-200'
      }`}
    >
      {track.title}
    </li>
  )
}
