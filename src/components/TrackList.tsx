import { usePlayer } from '../context/PlayerContext'
import { useTracks } from '../hooks/useTracks'
import { TrackRow } from './TrackRow'

export function TrackList() {
  useTracks()
  const { state } = usePlayer()

  if (state.tracks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        No tracks found. Check your S3 bucket configuration.
      </div>
    )
  }

  return (
    <ul className="flex-1 overflow-y-auto p-4 space-y-1">
      {state.tracks.map((track) => (
        <TrackRow
          key={track.key}
          track={track}
          isActive={state.currentTrack?.key === track.key}
        />
      ))}
    </ul>
  )
}
