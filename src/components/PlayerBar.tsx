import { useRef, useEffect, useState } from "react";
import { CiVolume, CiVolumeHigh, CiVolumeMute } from "react-icons/ci";
import {
  IoPlaySharp,
  IoPlaySkipBackSharp,
  IoPlaySkipForwardSharp,
  IoPauseSharp,
} from "react-icons/io5";

import { usePlayer } from "../context/PlayerContext";

interface Props {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  expanded: boolean;
  onExpandToggle: () => void;
}

export function PlayerBar({ audioRef, expanded, onExpandToggle }: Props) {
  const { state, dispatch } = usePlayer();
  const { status, currentTrack, tracks, volume } = state;
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const preMuteVolume = useRef(volume);
  const seekingRef = useRef(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (e.code === "Space" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        if (status === "playing" || status === "paused") togglePlayPause();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!currentTrack) return;
    const el = document.getElementById(`track-${CSS.escape(currentTrack.key)}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!seekingRef.current) setCurrentTime(audio.currentTime);
    };
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      const idx = tracks.findIndex((t) => t.key === currentTrack?.key);
      if (idx >= 0) {
        const next = idx < tracks.length - 1 ? tracks[idx + 1] : tracks[0];
        dispatch({ type: "LOAD_TRACK", payload: next });
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioRef, tracks, currentTrack, dispatch]);

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

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!muted) {
      preMuteVolume.current = volume;
      audio.muted = true;
      dispatch({ type: "SET_VOLUME", payload: 0 });
      audio.volume = 0;
    } else {
      audio.muted = false;
      dispatch({ type: "SET_VOLUME", payload: preMuteVolume.current });
      audio.volume = preMuteVolume.current;
    }
    setMuted(!muted);
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    dispatch({ type: "SET_VOLUME", payload: v });
    if (audioRef.current) audioRef.current.volume = v;
  }

  function fmt(s: number) {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  const isActive = !!currentTrack;
  const seekPct = `${((currentTime / (duration || 1)) * 100).toFixed(1)}%`;
  const volPct = `${(volume * 100).toFixed(1)}%`;

  const sliderClass = `outline-none appearance-none disabled:opacity-40 cursor-pointer min-w-0
     [&::-webkit-slider-runnable-track]:h-[4px] [&::-webkit-slider-runnable-track]:rounded-full
     [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,#d1d5db_var(--pct),#4b5563_var(--pct))]
     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
     [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-300
     [&::-moz-range-track]:h-[4px] [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-gray-600
     [&::-moz-range-progress]:bg-gray-300 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3
     [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-300 [&::-moz-range-thumb]:border-none`;

  return (
    <div
      className={`relative shrink-0 px-4
        rounded-md bg-slate-800 shadow-2xl shadow-black/50 mx-3 mb-3
        sm:rounded-none sm:bg-gray-950 sm:border-t sm:border-white/10 sm:shadow-none sm:mx-0 sm:mb-0
        ${expanded ? "hidden sm:block" : "block"}
      `}
    >
      {/* ── Mobile ── */}
      <div className="flex sm:hidden items-center gap-3 py-3">
        <img
          src="/SUSHIBOT_CLOSEUP.jpg"
          alt="Album art"
          className={`w-10 h-10 rounded object-cover shrink-0 shadow-md transition-opacity ${
            isActive ? "opacity-100" : "opacity-30"
          }`}
        />
        <div
          onClick={isActive ? onExpandToggle : undefined}
          className={`flex-1 truncate text-sm font-medium min-w-0 capitalize ${
            isActive
              ? "cursor-pointer text-gray-300 hover:text-white"
              : "text-gray-500"
          }`}
        >
          {currentTrack?.title ?? "No track loaded"}
        </div>
        <button
          onClick={togglePlayPause}
          disabled={!isActive || status === "loading"}
          className="w-10 h-10 rounded-full outline-none bg-white disabled:opacity-40 flex items-center justify-center text-gray-950 cursor-pointer text-sm shrink-0"
          title={status === "playing" ? "Pause" : "Play"}
        >
          {status === "playing" ? <IoPauseSharp /> : <IoPlaySharp />}
        </button>
      </div>

      {/* ── Desktop ── */}
      <div className="hidden sm:grid grid-cols-3 items-center py-3 gap-4">
        {/* Left — album art + track name */}
        <div
          onClick={isActive ? onExpandToggle : undefined}
          className={`flex items-center gap-3 min-w-0 ${
            isActive ? "cursor-pointer" : ""
          }`}
        >
          <img
            src="/SUSHIBOT_CLOSEUP.jpg"
            alt="Album art"
            className={`w-10 h-10 rounded object-cover shrink-0 shadow-md transition-opacity ${
              isActive ? "opacity-100" : "opacity-30"
            }`}
          />
          <span
            className={`truncate text-sm font-medium capitalize ${
              isActive ? "text-gray-300 hover:text-white" : "text-gray-500"
            }`}
          >
            {currentTrack?.title ?? "No track loaded"}
          </span>
          {isActive && (
            <span className="shrink-0 text-gray-500 text-xs">
              {expanded ? "▾" : "▴"}
            </span>
          )}
        </div>

        {/* Center — transport + seek */}
        <div className="flex flex-col items-center gap-2">
          {/* Transport */}
          <div className="flex items-center gap-5">
            <button
              onClick={skipBack}
              disabled={!isActive}
              className="text-gray-400 outline-none hover:text-white disabled:opacity-40 cursor-pointer text-xl"
              title="Skip back"
            >
              <IoPlaySkipBackSharp />
            </button>
            <button
              onClick={togglePlayPause}
              disabled={!isActive || status === "loading"}
              className="w-8 h-8 rounded-full outline-none bg-white disabled:opacity-40 flex items-center justify-center text-gray-950 hover:scale-105 transition-transform cursor-pointer text-sm"
              title={status === "playing" ? "Pause" : "Play"}
            >
              {status === "playing" ? <IoPauseSharp /> : <IoPlaySharp />}
            </button>
            <button
              onClick={skipForward}
              disabled={!isActive}
              className="text-gray-400 outline-none hover:text-white disabled:opacity-40 cursor-pointer text-xl"
              title="Skip forward"
            >
              <IoPlaySkipForwardSharp />
            </button>
          </div>

          {/* Seek */}
          <div className="flex items-center gap-2 w-full text-xs text-gray-200">
            <span className="w-8 text-right tabular-nums shrink-0">
              {fmt(currentTime)}
            </span>
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
              disabled={!isActive}
              style={{ "--pct": seekPct } as React.CSSProperties}
              className={`flex-1 ${sliderClass}`}
            />
            <span className="w-8 tabular-nums shrink-0">{fmt(duration)}</span>
          </div>
        </div>

        {/* Right — volume */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={toggleMute}
            className="text-gray-400 hover:text-white outline-none cursor-pointer text-xl shrink-0"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted || volume === 0 ? (
              <CiVolumeMute />
            ) : volume < 0.5 ? (
              <CiVolume />
            ) : (
              <CiVolumeHigh />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            style={{ "--pct": volPct } as React.CSSProperties}
            className={`w-32 ${sliderClass}`}
          />
        </div>
      </div>

      {/* Visual progress bar — mobile only, not interactive */}
      <div className="sm:hidden absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 rounded-b-md overflow-hidden">
        <div
          className="h-full bg-white/50 rounded-br-none"
          style={{ width: seekPct }}
        />
      </div>
    </div>
  );
}
