import { useRef, useEffect, useState } from 'react'
import { CiCircleChevLeft, CiCircleChevRight, CiPause1, CiPlay1, CiStop1, CiVolume, CiVolumeHigh, CiVolumeMute } from 'react-icons/ci'
import { usePlayer } from '../context/PlayerContext'

interface Props {
	audioRef: React.RefObject<HTMLAudioElement | null>
}

export function PlayerBar({ audioRef }: Props) {
	const { state, dispatch } = usePlayer()
	const { status, currentTrack, tracks, volume } = state
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const [muted, setMuted] = useState(false)
	const preMuteVolume = useRef(volume)
	const seekingRef = useRef(false)

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			const tag = (e.target as HTMLElement).tagName
			if (e.code === 'Space' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
				e.preventDefault()
				if (status === 'playing' || status === 'paused') togglePlayPause()
			}
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [status]) // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (!currentTrack) return
		const el = document.getElementById(`track-${CSS.escape(currentTrack.key)}`)
		el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
	}, [currentTrack])

	useEffect(() => {
		const audio = audioRef.current
		if (!audio) return

		const onTimeUpdate = () => {
			if (!seekingRef.current) setCurrentTime(audio.currentTime)
		}
		const onDurationChange = () => setDuration(audio.duration || 0)
		const onEnded = () => {
			const idx = tracks.findIndex((t) => t.key === currentTrack?.key)
			if (idx >= 0) {
				const next = idx < tracks.length - 1 ? tracks[idx + 1] : tracks[0]
				dispatch({ type: 'LOAD_TRACK', payload: next })
			}
		}

		audio.addEventListener('timeupdate', onTimeUpdate)
		audio.addEventListener('durationchange', onDurationChange)
		audio.addEventListener('ended', onEnded)
		return () => {
			audio.removeEventListener('timeupdate', onTimeUpdate)
			audio.removeEventListener('durationchange', onDurationChange)
			audio.removeEventListener('ended', onEnded)
		}
	}, [audioRef, tracks, currentTrack, dispatch])

	function togglePlayPause() {
		const audio = audioRef.current
		if (!audio) return
		if (status === 'playing') {
			audio.pause()
			dispatch({ type: 'PAUSE' })
		} else {
			audio.play()
			dispatch({ type: 'PLAY' })
		}
	}

	function stop() {
		const audio = audioRef.current
		if (!audio) return
		audio.pause()
		audio.currentTime = 0
		setCurrentTime(0)
		dispatch({ type: 'STOP' })
	}

	function skipBack() {
		const audio = audioRef.current
		if (!audio) return
		if (audio.currentTime > 3) {
			audio.currentTime = 0
			return
		}
		const idx = tracks.findIndex((t) => t.key === currentTrack?.key)
		if (idx > 0) dispatch({ type: 'LOAD_TRACK', payload: tracks[idx - 1] })
	}

	function skipForward() {
		const idx = tracks.findIndex((t) => t.key === currentTrack?.key)
		if (idx >= 0) {
			const next = idx < tracks.length - 1 ? tracks[idx + 1] : tracks[0]
			dispatch({ type: 'LOAD_TRACK', payload: next })
		}
	}

	function handleSeekChange(e: React.ChangeEvent<HTMLInputElement>) {
		setCurrentTime(Number(e.target.value))
	}

	function handleSeekCommit(e: React.ChangeEvent<HTMLInputElement>) {
		seekingRef.current = false
		const audio = audioRef.current
		if (audio) audio.currentTime = Number(e.target.value)
	}

	function toggleMute() {
		const audio = audioRef.current
		if (!audio) return
		if (!muted) {
			preMuteVolume.current = volume
			audio.muted = true
			dispatch({ type: 'SET_VOLUME', payload: 0 })
			audio.volume = 0
		} else {
			audio.muted = false
			dispatch({ type: 'SET_VOLUME', payload: preMuteVolume.current })
			audio.volume = preMuteVolume.current
		}
		setMuted(!muted)
	}

	function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
		const v = Number(e.target.value)
		dispatch({ type: 'SET_VOLUME', payload: v })
		if (audioRef.current) audioRef.current.volume = v
	}

	function fmt(s: number) {
		if (!isFinite(s)) return '0:00'
		const m = Math.floor(s / 60)
		const sec = Math.floor(s % 60)
		return `${m}:${sec.toString().padStart(2, '0')}`
	}

	const isActive = !!currentTrack

	return (
		<div className="border-t border-white/10 bg-gray-900 px-4 py-3 flex flex-col gap-2">
			{/* Track name */}
			<div className="text-center text-sm text-gray-300 truncate">
				{currentTrack?.title ?? 'No track loaded'}
			</div>

			{/* Seek bar */}
			<div className="flex items-center gap-2 text-xs text-gray-400">
				<span className="w-10 text-right">{fmt(currentTime)}</span>
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
					className="flex-1 accent-violet-500 disabled:opacity-40 cursor-pointer"
				/>
				<span className="w-10">{fmt(duration)}</span>
			</div>

			{/* Controls + volume */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<button
						onClick={skipBack}
						disabled={!isActive}
						className="text-gray-300 hover:text-white disabled:opacity-40 cursor-pointer"
						title="Skip back"
					><CiCircleChevLeft size={28} /></button>
					<button
						onClick={togglePlayPause}
						disabled={!isActive || status === 'loading'}
						className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 flex items-center justify-center text-white cursor-pointer"
						title={status === 'playing' ? 'Pause' : 'Play'}
					>
						{status === 'playing' ? <CiPause1 size={22} /> : <CiPlay1 size={22} />}
					</button>
					<button
						onClick={stop}
						disabled={!isActive}
						className="text-gray-300 hover:text-white disabled:opacity-40 cursor-pointer"
						title="Stop"
					><CiStop1 size={28} /></button>
					<button
						onClick={skipForward}
						disabled={!isActive}
						className="text-gray-300 hover:text-white disabled:opacity-40 cursor-pointer"
						title="Skip forward"
					><CiCircleChevRight size={28} /></button>
				</div>

				{/* Volume */}
				<div className="flex items-center gap-2 text-gray-400 text-sm">
					<button onClick={toggleMute} className="cursor-pointer hover:text-white" title={muted ? 'Unmute' : 'Mute'}>
						{muted ? <CiVolumeMute size={22} /> : <CiVolume size={22} />}
					</button>
					<input
						type="range"
						min={0}
						max={1}
						step={0.01}
						value={volume}
						onChange={handleVolumeChange}
						className="w-24 accent-violet-500 cursor-pointer"
					/>
					<CiVolumeHigh size={22} />
				</div>
			</div>
		</div>
	)
}
