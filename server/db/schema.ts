import { pgTable, pgEnum, uuid, text, smallint, integer, bigint, boolean, timestamp } from 'drizzle-orm/pg-core'

export const genreType = pgEnum('genre_type', [
  'rock', 'pop', 'hip_hop', 'r_and_b', 'jazz', 'classical',
  'electronic', 'country', 'folk', 'metal', 'punk', 'blues',
  'reggae', 'latin', 'world', 'other',
])

export const albums = pgTable('albums', {
  id:            uuid('id').primaryKey().defaultRandom(),
  title:         text('title').notNull(),
  description:   text('description'),
  releaseYear:   smallint('release_year').notNull(),
  coverArtS3Key: text('cover_art_s3_key'),
  isArchived:    boolean('is_archived').notNull().default(false),
  createdAt:     timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const tracks = pgTable('tracks', {
  id:             uuid('id').primaryKey().defaultRandom(),
  albumId:        uuid('album_id').notNull().references(() => albums.id, { onDelete: 'restrict' }),
  title:          text('title').notNull(),
  s3Key:          text('s3_key').notNull().unique(),
  coverArtS3Key:  text('cover_art_s3_key'),
  mimeType:       text('mime_type').notNull().default('audio/mpeg'),
  fileSizeBytes:  bigint('file_size_bytes', { mode: 'number' }),
  durationMs:     integer('duration_ms'),
  genre:          genreType('genre'),
  bpm:            smallint('bpm'),
  releaseYear:    smallint('release_year').notNull(),
  trackNumber:    smallint('track_number'),
  isPublished:    boolean('is_published').notNull().default(false),
  isArchived:     boolean('is_archived').notNull().default(false),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
