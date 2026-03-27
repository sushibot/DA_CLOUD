import { CiCircleChevDown } from 'react-icons/ci'
import { usePlayer } from '../context/PlayerContext'

interface Props {
  onClose: () => void
}

export function VisualizerView({ onClose }: Props) {
  const { state } = usePlayer()
  const { currentTrack } = state

  return (
    <div className="h-full w-full bg-gray-950 flex flex-col items-center justify-center px-8">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
        title="Close"
      >
        <CiCircleChevDown size={32} />
      </button>

      <p className="text-gray-500 text-sm uppercase tracking-widest mb-4">Now Playing</p>
      <h2 className="text-white text-3xl font-semibold text-center">
        {currentTrack?.title ?? '—'}
      </h2>
    </div>
  )
}
