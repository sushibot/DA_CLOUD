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

  const metaClass = `text-sm tabular-nums ${isActive ? "text-violet-200" : "text-gray-500"}`;

  return (
    <li id={`track-${CSS.escape(track.key)}`} onClick={handleClick}>
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className={`grid grid-cols-[1fr_4rem] sm:grid-cols-[2rem_1fr_5rem_4rem] sm:gap-x-8 items-center px-4 py-3 cursor-pointer rounded-sm transition-colors ${
          isActive ? "bg-gray-600 text-white" : "hover:bg-white/10 text-gray-200"
        }`}
      >
        <span className={`hidden sm:flex justify-center ${isActive ? "text-white" : "text-gray-400"}`}>
          {renderTrackIndex()}
        </span>
        <span className="truncate capitalize pr-4">{track.title}</span>
        <span className={`hidden sm:block text-right ${metaClass}`}>{track.bpm ?? "—"}</span>
        <span className={`text-right ${metaClass}`}>{track.duration ?? "—"}</span>
      </div>
    </li>
  );
}
