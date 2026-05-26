import type { Album } from '../types'

interface Props {
	album: Album
	onSelect: (id: string) => void
}

export function AlbumRow({ album, onSelect }: Props) {
	return (
		<li
			id={`album-${album.id}`}
			onClick={() => onSelect(album.id)}
			className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors hover:bg-white/5 active:bg-white/10"
		>
			<img
				src="/no_album_art_placeholder.jpg"
				alt={`${album.title} cover`}
				className="w-14 h-14 rounded object-cover shrink-0 shadow-md"
			/>
			<div className="flex flex-col min-w-0">
				<span className="font-semibold text-white truncate">{album.title}</span>
				<span className="text-sm text-gray-400">{album.releaseYear}</span>
			</div>
		</li>
	)
}
