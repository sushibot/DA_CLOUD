import { usePlayer } from "../context/PlayerContext";
import { useTracks } from "../hooks/useTracks";
import { useAlbum } from "../hooks/useAlbum";
import { TrackRow } from "./TrackRow";
import { AlbumHeader } from "./AlbumHeader";
import { LoadingSplash } from "./LoadingSplash";

interface Props {
  albumId: string
  onBack: () => void
}

export function TrackList({ albumId, onBack }: Props) {
  const loading = useTracks(albumId);
  const { state } = usePlayer();
  const album = useAlbum(albumId);

  const tracks = state.tracks

  if (loading) {
    return <LoadingSplash />;
  }

  return (
    <div className="flex-1 overflow-y-auto h-full">
      <div className="px-4 pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Albums
        </button>
      </div>

      <AlbumHeader
        title={album?.title ?? ""}
        songCount={album?.trackCount ?? tracks.length}
        totalDurationMs={album?.totalDurationMs ?? 0}
      />

      {tracks.length === 0 ? (
        <div className="flex items-center justify-center text-gray-500 py-16">
          No tracks found
        </div>
      ) : (
        <ul className="p-4 space-y-1">
          {tracks.map((track) => (
            <TrackRow
              key={track.key}
              track={track}
              isActive={state.currentTrack?.key === track.key}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
