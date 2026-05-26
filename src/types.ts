export interface Track {
	key: string
	title: string
	bpm?: number
	albumId: string
}
export interface Album {
	id: string;
	title: string;
	releaseYear: number;
	coverArtS3Key: string | null;
	description: string | null;
	isArchived: boolean;
	createdAt: string;
}
