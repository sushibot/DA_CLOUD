CREATE TYPE "public"."genre_type" AS ENUM('rock', 'pop', 'hip_hop', 'r_and_b', 'jazz', 'classical', 'electronic', 'country', 'folk', 'metal', 'punk', 'blues', 'reggae', 'latin', 'world', 'other');--> statement-breakpoint
CREATE TABLE "albums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"release_year" smallint NOT NULL,
	"cover_art_s3_key" text,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"album_id" uuid NOT NULL,
	"title" text NOT NULL,
	"s3_key" text NOT NULL,
	"cover_art_s3_key" text,
	"mime_type" text DEFAULT 'audio/mpeg' NOT NULL,
	"file_size_bytes" bigint,
	"duration_ms" integer,
	"genre" "genre_type",
	"bpm" smallint,
	"release_year" smallint NOT NULL,
	"track_number" smallint,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tracks_s3_key_unique" UNIQUE("s3_key")
);
--> statement-breakpoint
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE restrict ON UPDATE no action;