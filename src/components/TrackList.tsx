import { useEffect } from "react";
import { IoTimeOutline } from "react-icons/io5";
import { usePlayer } from "../context/PlayerContext";
import { useTracks } from "../hooks/useTracks";
import { useAlbum } from "../hooks/useAlbum";
import { useDominantColor } from "../hooks/useDominantColor";
import { TrackRow } from "./TrackRow";
import { AlbumHeader } from "./AlbumHeader";
import { LoadingSplash } from "./LoadingSplash";

const ALBUM_COVER = "/SUSHIBOT_CLOSEUP.jpg";
const BASE_THEME_COLOR = "#030712";

interface Props {
  albumId: string;
  onBack: () => void;
}

export function TrackList({ albumId, onBack }: Props) {
  const loading = useTracks(albumId);
  const { state } = usePlayer();
  const album = useAlbum(albumId);
  const accentColor = useDominantColor(ALBUM_COVER);

  const tracks = state.tracks;

  const headerStyle = accentColor
    ? {
        background: `linear-gradient(to bottom, rgb(${accentColor.r},${accentColor.g},${accentColor.b}) 0%, #030712 100%)`,
      }
    : undefined;

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) return
    if (accentColor) {
      meta.setAttribute('content', `rgb(${accentColor.r},${accentColor.g},${accentColor.b})`)
    }
    return () => { meta.setAttribute('content', BASE_THEME_COLOR) }
  }, [accentColor])

  if (loading) {
    return <LoadingSplash />;
  }

  return (
    <div className="flex-1 overflow-y-auto h-full bg-gray-950">
      <div style={headerStyle} className="transition-colors duration-700">
        <div className="px-4 pt-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors mb-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Albums
          </button>
        </div>

        <AlbumHeader
          title={album?.title ?? ""}
          songCount={album?.trackCount ?? tracks.length}
          totalDurationMs={album?.totalDurationMs ?? 0}
        />
      </div>

      {tracks.length === 0 ? (
        <div className="flex items-center justify-center text-gray-500 py-16">
          No tracks found
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_4rem] sm:grid-cols-[2rem_1fr_5rem_4rem] sm:gap-x-8 items-center px-4 py-2 mx-4 mb-1 border-b border-white/10 text-xs uppercase tracking-widest text-gray-400">
            <span className="hidden sm:block text-center">#</span>
            <span>Title</span>
            <span className="hidden sm:block text-right">BPM</span>
            <span className="flex justify-end">
              <IoTimeOutline className="w-4 h-4" />
            </span>
          </div>
          <ul className="px-4 space-y-1">
            {tracks.map((track, idx) => (
              <TrackRow
                key={track.key}
                track={track}
                idx={idx}
                isActive={state.currentTrack?.key === track.key}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
