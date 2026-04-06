import 'dotenv/config'
import { db } from './index.js'
import { tracks } from './schema.js'
import { getTrackMetadata } from '../s3.js'
import { isNull, eq } from 'drizzle-orm'

async function backfill() {
  const rows = await db.select({ id: tracks.id, s3Key: tracks.s3Key, title: tracks.title })
    .from(tracks)
    .where(isNull(tracks.durationMs))

  console.log(`Found ${rows.length} tracks missing duration`)

  for (const row of rows) {
    const meta = await getTrackMetadata(row.s3Key)
    if (!meta.durationMs) {
      console.log(`  ✗ ${row.title} — no duration found`)
      continue
    }
    await db.update(tracks).set({ durationMs: meta.durationMs }).where(eq(tracks.id, row.id))
    console.log(`  ✓ ${row.title} — ${(meta.durationMs / 1000).toFixed(1)}s`)
  }

  console.log('Backfill complete.')
  process.exit(0)
}

backfill().catch((err) => {
  console.error('Backfill failed:', err)
  process.exit(1)
})
