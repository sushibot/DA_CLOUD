interface Props {
  title: string
  songCount: number
  totalDurationMs: number
}

function formatDuration(totalMs: number): string {
  const totalSec = Math.floor(totalMs / 1000)
  const hours = Math.floor(totalSec / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  const secs = totalSec % 60

  if (hours > 0) {
    return `${hours} hr ${mins} min`
  }
  return `${mins} min ${secs} sec`
}

export function AlbumHeader({ title, songCount, totalDurationMs }: Props) {
  return (
    <div className="px-8 pt-8 pb-6">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Album</p>
      <h1 className="text-7xl sm:text-8xl font-black text-white leading-none tracking-tight mb-4">
        {title}
      </h1>
      <p className="text-sm text-gray-400">
        {songCount} {songCount === 1 ? 'song' : 'songs'} • {formatDuration(totalDurationMs)}
      </p>
    </div>
  )
}
