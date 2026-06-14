import { IoPlaySharp, IoPauseSharp } from "react-icons/io5";
import { useState } from "react";
import type { Track } from "../types";
import { usePlayer } from "../context/PlayerContext";

interface Props {
  track: Track;
  idx: number;
  isActive: boolean;
}

export function TrackRow({ track, isActive, idx }: Props) {
  const [isHover, setIsHover] = useState(false);
  const { state, dispatch } = usePlayer();

  function handleClick() {
    if (isActive) {
      dispatch({ type: state.status === "playing" ? "PAUSE" : "PLAY" });
    } else {
      dispatch({ type: "LOAD_TRACK", payload: track });
    }
  }

  function renderTrackIndex() {
    if (isHover || isActive) {
      const isPlaying = isActive && state.status === "playing";
      return isPlaying && !isHover ? (
        <IoPauseSharp className="w-4 h-4" />
      ) : (
        <IoPlaySharp className="w-4 h-4" />
      );
    }
    return <span className="text-sm tabular-nums">{idx + 1}</span>;
  }

  return (
    <li id={`track-${CSS.escape(track.key)}`} onClick={handleClick}>
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className={`flex items-center justify-between px-4 py-3 cursor-pointer rounded-sm transition-colors gap-4 ${
          isActive
            ? "bg-gray-500 text-white"
            : "hover:bg-white/10 text-gray-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`w-4 flex justify-center ${isActive ? "text-white" : "text-gray-400"}`}
          >
            {renderTrackIndex()}
          </span>
          {/* Left: title */}
          <span className="truncate">{track.title}</span>
        </div>
        <div>
          {/* Right: duration + bpm */}
          <span
            className={`shrink-0 flex items-center gap-3 text-sm tabular-nums ${isActive ? "text-violet-200" : "text-gray-500"}`}
          >
            {track.bpm != null && <span>{track.bpm} BPM</span>}
            <span>{track.duration ?? '—'}</span>
          </span>
        </div>
      </div>
    </li>
  );
}
