import type React from 'react'
import { CiCircleChevDown } from 'react-icons/ci'
import { usePlayer } from '../context/PlayerContext'
import { VectorScope } from './VectorScope'

interface Props {
  onClose: () => void
  expanded: boolean
  analyserLeftRef: React.RefObject<AnalyserNode | null>
  analyserRightRef: React.RefObject<AnalyserNode | null>
}

export function VisualizerView({ onClose, expanded, analyserLeftRef, analyserRightRef }: Props) {
  const { state } = usePlayer()

  return (
    <div className={`h-full w-full bg-gray-900 flex flex-col transition-opacity duration-700 ease-in-out ${expanded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="shrink-0 flex items-center justify-between px-6 pt-4">
        <p className="text-gray-500 text-sm uppercase tracking-widest">Now Playing</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white cursor-pointer"
          title="Close"
        >
          <CiCircleChevDown size={28} />
        </button>
      </div>

      <p className="shrink-0 text-white text-xl font-semibold text-center px-6 mt-2">
        {state.currentTrack?.title ?? '—'}
      </p>

      <div className="flex-1 min-h-0">
        <VectorScope analyserLeftRef={analyserLeftRef} analyserRightRef={analyserRightRef} expanded={expanded} />
      </div>
    </div>
  )
}
