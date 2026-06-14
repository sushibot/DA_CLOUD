interface Props {
  title: string;
  songCount: number;
  totalDurationMs: number;
}
const ALBUM_COVER = "/SUSHIBOT_CLOSEUP.jpg";
function formatDuration(totalMs: number): string {
  const totalSec = Math.floor(totalMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (hours > 0) {
    return `${hours} hr ${mins} min`;
  }
  return `${mins} min ${secs} sec`;
}

export function AlbumHeader({ title, songCount, totalDurationMs }: Props) {
  return (
    <div className="px-6 pt-8 pb-6 sm:px-8">
      <div className="flex flex-col items-center sm:flex-row sm:items-end gap-6">
        <img
          src={ALBUM_COVER}
          alt={`${title} cover`}
          className="w-60 h-60 sm:w-50 sm:h-50 rounded object-cover shrink-0 drop-shadow-2xl"
        />
        <div className="min-w-0 w-full text-left">
          <h1 className="text-4xl sm:text-7xl font-black text-white leading-none tracking-tight mb-3 capitalize">
            {title}
          </h1>
          <p className="text-sm text-gray-300">
            Album • {songCount} {songCount === 1 ? "song" : "songs"} •{" "}
            {formatDuration(totalDurationMs)}
          </p>
        </div>
      </div>
    </div>
  );
}
