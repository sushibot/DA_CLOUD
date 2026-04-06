import { usePlayer } from '../context/PlayerContext'
import { useTracks } from '../hooks/useTracks'
import { useAlbum } from '../hooks/useAlbum'
import { TrackRow } from './TrackRow'
import { AlbumHeader } from './AlbumHeader'

export function TrackList() {
	useTracks()
	const { state } = usePlayer()
	const album = useAlbum()

	if (state.tracks.length === 0) {
		return (
			<div className="flex-1 flex items-center justify-center text-gray-500">
				No tracks found. Check your S3 bucket configuration.
			</div>
		)
	}

	return (
		<div className="flex-1 overflow-y-auto h-full">
			<AlbumHeader
				title={album?.title ?? ''}
				songCount={album?.trackCount ?? state.tracks.length}
				totalDurationMs={album?.totalDurationMs ?? 0}
			/>
			<ul className="p-4 space-y-1">
				{state.tracks.map((track) => (
					<TrackRow
						key={track.key}
						track={track}
						isActive={state.currentTrack?.key === track.key}
					/>
				))}
			</ul>
		</div>
	)
}
