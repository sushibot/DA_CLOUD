import {
	IoPlaySharp,
} from "react-icons/io5";
import { useState } from 'react'
import type { Track } from '../types'
import { usePlayer } from '../context/PlayerContext'

interface Props {
	track: Track
	idx: number
	isActive: boolean
}


export function TrackRow({ track, isActive, idx }: Props) {
	const [isHover, setIsHover] = useState(false)
	const { state, dispatch } = usePlayer()

	function handleClick() {
		if (isActive) {
			dispatch({ type: state.status === 'playing' ? 'PAUSE' : 'PLAY' })
		} else {
			dispatch({ type: 'LOAD_TRACK', payload: track })
		}
	}

	function handleMouseOver() {
		console.log('on mouse over');
		return <>
			<IoPlaySharp />
		</>
	}

	function handleMouseOut() {
		return <>
			<p className="text-lg">{idx + 1}</p>
		</>
	}
	return (
		<li
			id={`track-${CSS.escape(track.key)}`}
			onClick={handleClick}
			className={`flex items-center justify-between px-4 py-3 cursor-pointer rounded-lg transition-colors gap-4 ${isActive ? 'bg-violet-600 text-white' : 'hover:bg-white/10 text-gray-200'
				}`}
		>
			<div className="flex items-center gap-3">
				<p className="text-gray-500">{idx + 1} </p>
				{/* Left: title */}
				<span className="truncate">
					{track.title}
				</span>
			</div>
			<div>
				{/* Right: duration + bpm */}
				<span className={`shrink-0 flex items-center gap-3 text-sm tabular-nums ${isActive ? 'text-violet-200' : 'text-gray-500'}`}>
					{track.bpm != null && <span>{track.bpm} BPM</span>}
					<span>0:00</span>
				</span>

			</div>
		</li>
	)
}
