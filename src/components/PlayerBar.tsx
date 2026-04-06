import { useRef, useEffect, useState } from "react";
import {
  CiPause1,
  CiPlay1,
  CiVolume,
  CiVolumeHigh,
  CiVolumeMute,
} from "react-icons/ci";
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
  const [volumeOpen, setVolumeOpen] = useState(false);
  const preMuteVolume = useRef(volume);
  const seekingRef = useRef(false);
  const volumeRef = useRef<HTMLDivElement>(null);

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
    if (!volumeOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (volumeRef.current && !volumeRef.current.contains(e.target as Node)) {
        setVolumeOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [volumeOpen]);

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

  return (
    <div
      className={`bg-gray-950 px-4 py-3 flex items-center gap-4 w-full ${
        expanded ? "" : "border-t border-white/10"
      }`}
    >
      {/* Left: controls */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={skipBack}
          disabled={!isActive}
          className="text-gray-300 hover:text-white disabled:opacity-40 cursor-pointer text-4xl sm:text-3xl"
          title="Skip back"
        >
          <IoPlaySkipBackSharp />
        </button>
        <button
          onClick={togglePlayPause}
          disabled={!isActive || status === "loading"}
          className="w-14 h-14 sm:w-10 sm:h-10 rounded-full outline-none bg-violet-50 disabled:opacity-40 flex items-center justify-center text-gray-950 cursor-pointer text-3xl sm:text-xl"
          title={status === "playing" ? "Pause" : "Play"}
        >
          {status === "playing" ? <IoPauseSharp /> : <IoPlaySharp />}
        </button>
        <button
          onClick={skipForward}
          disabled={!isActive}
          className="text-gray-300 hover:text-white disabled:opacity-40 cursor-pointer text-4xl sm:text-3xl"
          title="Skip forward"
        >
          <IoPlaySkipForwardSharp />
        </button>
      </div>

      {/* Middle: seek bar + volume */}
      <div className="flex-1 flex items-center gap-2 text-xs text-gray-400 min-w-0">
        <span className="w-10 text-right shrink-0">{fmt(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeekChange}
          onMouseDown={() => { seekingRef.current = true }}
          onMouseUp={handleSeekCommit as any}
          onTouchEnd={handleSeekCommit as any}
          disabled={!isActive}
          className="flex-1 accent-violet-500 disabled:opacity-40 cursor-pointer min-w-0"
        />
        <span className="w-10 shrink-0">{fmt(duration)}</span>

        {/* Volume */}
        <div ref={volumeRef} className="relative hidden sm:flex items-center shrink-0 text-gray-400">
          <button
            onClick={() => setVolumeOpen((v) => !v)}
            className="cursor-pointer hover:text-white text-3xl sm:text-xl"
            title="Volume"
          >
            {muted ? <CiVolumeMute /> : volume === 0 ? <CiVolume /> : <CiVolumeHigh />}
          </button>

          {volumeOpen && (
            <div className="absolute bottom-full right-0 mb-3 flex flex-col items-center gap-2 bg-gray-800 border border-white/10 rounded-xl px-3 py-4 shadow-xl">
              <CiVolumeHigh size={18} className="text-gray-400" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                className="accent-violet-500 cursor-pointer"
                style={{ writingMode: "vertical-lr", direction: "rtl", height: "96px" }}
              />
              <button
                onClick={toggleMute}
                className="cursor-pointer hover:text-white"
                title={muted ? "Unmute" : "Mute"}
              >
                {muted ? <CiVolumeMute size={18} /> : <CiVolume size={18} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: track name */}
      <div
        onClick={isActive ? onExpandToggle : undefined}
        className={`shrink-0 w-1/4 text-right truncate sm:text-sm text-xl ${
          isActive ? "cursor-pointer text-gray-300 hover:text-white" : "text-gray-500"
        }`}
      >
        {currentTrack?.title ?? "No track loaded"}
        {isActive && (
          <span className="ml-2 text-gray-500 text-xs">
            {expanded ? "▾" : "▴"}
          </span>
        )}
      </div>
    </div>
  );
}
