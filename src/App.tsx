import { useEffect, useRef, useState } from "react";
import { API_BASE } from "./lib/api";
import { usePlayer } from "./context/PlayerContext";
import { TrackList } from "./components/TrackList";
import { PlayerBar } from "./components/PlayerBar";
import { VisualizerView } from "./components/VisualizerView";

export default function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserLeftRef = useRef<AnalyserNode | null>(null);
  const analyserRightRef = useRef<AnalyserNode | null>(null);
  const { state, dispatch } = usePlayer();
  const [expanded, setExpanded] = useState(false);
  const [playerBarVisible, setPlayerBarVisible] = useState(
    () => localStorage.getItem("playerBarShown") === "true",
  );
  /**
   * Sets up new Audio Context
   */
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    return () => {
      // audio.pause();
    };
  }, []);

  /**
   * Tracks the current audio reference and sets state accordingly.
   */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.status === "playing") audio.play().catch(console.error);
    else if (state.status === "paused") audio.pause();
  }, [state.status]);

  /**
   * Show player bar if a track is playing and player bar is not visible.
   * Save player bar state to local storage
   */
  useEffect(() => {
    if (state.currentTrack && !playerBarVisible) {
      setPlayerBarVisible(true);
      localStorage.setItem("playerBarShown", "true");
    }
  }, [state.currentTrack]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;

    async function load() {
      // Unlock iOS audio before any async work — iOS blocks play() after an await
      audio!.play().catch(() => {});

      const res = await fetch(
        `${API_BASE}/api/tracks/url?key=${encodeURIComponent(state.currentTrack!.key)}`,
      );
      const { url } = await res.json();
      audio!.src = url;
      audio!.volume = state.volume;
      audio!.load();

      if (!sourceRef.current) {
        const ctx = new AudioContext();
        await ctx.resume();
        const source = ctx.createMediaElementSource(audio!);
        const splitter = ctx.createChannelSplitter(2);
        const analyserL = ctx.createAnalyser();
        const analyserR = ctx.createAnalyser();
        analyserL.fftSize = 2048;
        analyserR.fftSize = 2048;
        source.connect(splitter);
        splitter.connect(analyserL, 0);
        splitter.connect(analyserR, 1);
        source.connect(ctx.destination);
        audioContextRef.current = ctx;
        sourceRef.current = source;
        analyserLeftRef.current = analyserL;
        analyserRightRef.current = analyserR;
      } else if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume();
      }

      await audio!.play();
      dispatch({ type: "PLAY" });
    }

    load().catch(console.error);
  }, [state.currentTrack]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-dvh flex flex-col bg-gray-950 text-white">
      <header className="shrink-0 px-6 py-4 border-b border-white/10">
        <h1 className="text-xl font-semibold tracking-tight">Sushi Cloud</h1>
      </header>

      <div className="flex-1 min-h-0 relative overflow-hidden">
        <TrackList />

        <div
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            expanded ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <VisualizerView
            onClose={() => setExpanded(false)}
            expanded={expanded}
            analyserLeftRef={analyserLeftRef}
            analyserRightRef={analyserRightRef}
            audioRef={audioRef}
          />
        </div>
      </div>

      {playerBarVisible && (
        <PlayerBar
          audioRef={audioRef}
          expanded={expanded}
          onExpandToggle={() => setExpanded((v) => !v)}
        />
      )}
    </div>
  );
}
