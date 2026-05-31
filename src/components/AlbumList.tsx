import { useAlbums } from "../hooks/useAlbums";
import { LoadingSplash } from "./LoadingSplash";
import { AlbumRow } from './AlbumRow'

interface Props {
	onSelect: (id: string) => void
}

export function AlbumList({ onSelect }: Props) {
	const { albums, loading } = useAlbums()

	if (loading) {
		return <LoadingSplash />;
	}

	return (
		<div className="flex-1 overflow-y-auto h-full">
			<ul className="p-4 space-y-1">
				{albums.map((album) => (
					<AlbumRow
						key={album.id}
						album={album}
						onSelect={onSelect}
					/>
				))}
			</ul>
		</div>
	);
}
