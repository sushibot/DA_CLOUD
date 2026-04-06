import 'dotenv/config'
import { db } from './index.js'
import { albums, tracks } from './schema.js'
import { listAudioKeys, getTrackMetadata } from '../s3.js'
import { eq } from 'drizzle-orm'

const albumName = process.argv[2]
if (!albumName) {
  console.error('Usage: pnpm seed <album-name>')
  process.exit(1)
}

function keyToTitle(key: string): string {
  return key
    .split('/').pop()!
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
}

async function seed() {
  // Create album if it doesn't already exist
  let [album] = await db.select().from(albums).where(eq(albums.title, albumName))

  if (!album) {
    ;[album] = await db.insert(albums).values({
      title: albumName,
      releaseYear: new Date().getFullYear(),
    }).returning()
    console.log(`Created album: "${album.title}" (${album.id})`)
  } else {
    console.log(`Found existing album: "${album.title}" (${album.id})`)
  }

  const keys = await listAudioKeys()
  console.log(`Found ${keys.length} tracks in S3`)

  for (const key of keys) {
    const meta = await getTrackMetadata(key)
    const title = keyToTitle(key)

    await db.insert(tracks).values({
      title,
      s3Key: key,
      albumId: album.id,
      releaseYear: new Date().getFullYear(),
      bpm: meta.bpm ?? null,
      durationMs: meta.durationMs ?? null,
    }).onConflictDoNothing()

    console.log(`  ✓ ${title}${meta.bpm ? ` (${meta.bpm} BPM)` : ''}`)
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
