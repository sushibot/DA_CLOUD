import { useEffect, useRef, useState } from "react";
import type React from "react";
import { CiCircleChevDown } from "react-icons/ci";
import {
  IoPlaySharp,
  IoPlaySkipBackSharp,
  IoPlaySkipForwardSharp,
  IoPauseSharp,
} from "react-icons/io5";
import { usePlayer } from "../context/PlayerContext";
import { VectorScope3D } from "./VectorScope3D";

interface Props {
  onClose: () => void;
  expanded: boolean;
  analyserLeftRef: React.RefObject<AnalyserNode | null>;
  analyserRightRef: React.RefObject<AnalyserNode | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export function VisualizerView({
  onClose,
  expanded,
  analyserLeftRef,
  audioRef,
}: Props) {
  const { state, dispatch } = usePlayer();
  const { status, currentTrack, tracks } = state;
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const seekingRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Seed with current values in case events already fired
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration || 0);

    const onTimeUpdate = () => {
      if (!seekingRef.current) setCurrentTime(audio.currentTime);
    };
    const onDurationChange = () => setDuration(audio.duration || 0);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
    };
  }, [audioRef, currentTrack]);

  function togglePlayPause() {
    const audio = audioRef.current;
    if (!audio) return;
    if (status === "playing") {
      audio.pause();
      dispatch({ type: "PAUSE" });
    } else {
      audio.play();
      dispatch({ type: "PLAY" });
    }
  }

  function skipBack() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const idx = tracks.findIndex((t) => t.key === currentTrack?.key);
    const prev = idx > 0 ? tracks[idx - 1] : tracks[tracks.length - 1];
    if (prev) dispatch({ type: "LOAD_TRACK", payload: prev });
  }

  function skipForward() {
    const idx = tracks.findIndex((t) => t.key === currentTrack?.key);
    if (idx >= 0) {
      const next = idx < tracks.length - 1 ? tracks[idx + 1] : tracks[0];
      dispatch({ type: "LOAD_TRACK", payload: next });
    }
  }

  function handleSeekChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCurrentTime(Number(e.target.value));
  }

  function handleSeekCommit(e: React.ChangeEvent<HTMLInputElement>) {
    seekingRef.current = false;
    const audio = audioRef.current;
    if (audio) audio.currentTime = Number(e.target.value);
  }

  function fmt(s: number) {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div
      className={`relative h-full w-full bg-gray-950 transition-opacity duration-700 ease-in-out ${
        expanded ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Canvas fills entire container */}
      <VectorScope3D analyserLeftRef={analyserLeftRef} expanded={expanded} />

      {/* Top: close button */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-4">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white cursor-pointer"
          title="Close"
        >
          <CiCircleChevDown size={28} />
        </button>
        {/* Desktop: track name centered */}
        <p className="hidden sm:block text-white text-lg font-semibold truncate px-4">
          {currentTrack?.title ?? "—"}
        </p>
        <div className="hidden sm:block w-7" />
      </div>

      {/* Mobile: bottom overlay */}
      <div className="sm:hidden absolute inset-x-0 bottom-0 px-6 pb-6 pt-6 flex flex-col gap-4 bg-gradient-to-t from-gray-950/95 to-transparent">
        {/* Track name */}
        <p className="text-white text-2xl font-bold truncate">
          {currentTrack?.title ?? "—"}
        </p>

        {/* Seek bar */}
        <div className="flex flex-col gap-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeekChange}
            onMouseDown={() => {
              seekingRef.current = true;
            }}
            onMouseUp={handleSeekCommit as any}
            onTouchEnd={handleSeekCommit as any}
            disabled={!currentTrack}
            className="w-full accent-violet-500 disabled:opacity-40 cursor-pointer [&::-webkit-slider-runnable-track]:h-[5px] [&::-webkit-slider-runnable-track]:rounded-none [&::-webkit-slider-thumb]:w-[13px] [&::-webkit-slider-thumb]:h-[13px] [&::-webkit-slider-thumb]:mt-[-4px] [&::-moz-range-track]:h-[5px] [&::-moz-range-track]:rounded-none [&::-moz-range-thumb]:w-[13px] [&::-moz-range-thumb]:h-[13px]"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-10">
          <button
            onClick={skipBack}
            disabled={!currentTrack}
            className="text-gray-300 hover:text-white disabled:opacity-40 cursor-pointer text-4xl"
          >
            <IoPlaySkipBackSharp />
          </button>
          <button
            onClick={togglePlayPause}
            disabled={!currentTrack || status === "loading"}
            className="w-16 h-16 rounded-full bg-violet-50 disabled:opacity-40 flex items-center justify-center text-gray-950 cursor-pointer text-3xl"
          >
            {status === "playing" ? <IoPauseSharp /> : <IoPlaySharp />}
          </button>
          <button
            onClick={skipForward}
            disabled={!currentTrack}
            className="text-gray-300 hover:text-white disabled:opacity-40 cursor-pointer text-4xl"
          >
            <IoPlaySkipForwardSharp />
          </button>
        </div>
      </div>
    </div>
  );
}
