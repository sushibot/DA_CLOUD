import 'dotenv/config'
import { db } from './index.js'
import { tracks } from './schema.js'
import { listAudioKeys, getTrackMetadata } from '../s3.js'

function keyToTitle(key: string): string {
  return key
    .split('/').pop()!
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
}

async function seed() {
  const keys = await listAudioKeys()
  console.log(`Found ${keys.length} tracks in S3`)

  for (const key of keys) {
    const meta = await getTrackMetadata(key)
    const title = keyToTitle(key)

    await db.insert(tracks).values({
      title,
      s3Key: key,
      releaseYear: new Date().getFullYear(),
      bpm: meta.bpm ?? null,
      isPublished: true,
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
