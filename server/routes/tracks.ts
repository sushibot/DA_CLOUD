import { Router } from 'express'
import { getPresignedUrl } from '../s3.js'
import { db } from '../db/index.js'
import { tracks } from '../db/schema.js'
import { and, eq } from 'drizzle-orm'

const router = Router()

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function formatDuration(ms: number | null): string | null {
  if (ms == null) return null
  const totalSec = Math.floor(ms / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const trackCache = new Map<string, { data: unknown; expiresAt: number }>()

router.get('/', async (req, res) => {
  try {
    const albumId = req.query.albumId as string | undefined

    if (albumId !== undefined && !UUID_RE.test(albumId)) {
      res.status(400).json({ error: 'Invalid albumId' }); return
    }

    const cacheKey = albumId ?? 'all'
    const cached = trackCache.get(cacheKey)
    if (cached && Date.now() < cached.expiresAt) {
      console.log(`[tracks] cache hit (${cacheKey})`)
      res.json(cached.data)
      return
    }

    console.log(`[tracks] cache miss — querying DB (${cacheKey})`)
    const where = albumId
      ? and(eq(tracks.isPublished, true), eq(tracks.albumId, albumId))
      : eq(tracks.isPublished, true)

    const rows = await db.select().from(tracks).where(where)
    const result = rows.map(row => ({
      key: row.s3Key,
      title: row.title,
      bpm: row.bpm ?? undefined,
      albumId: row.albumId,
      duration: formatDuration(row.durationMs),
    }))
    trackCache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS })
    res.json(result)
  } catch (err) {
    console.error('Error listing tracks:', err)
    res.status(500).json({ error: 'Failed to list tracks' })
  }
})

router.get('/url', async (req, res) => {
  try {
    const key = req.query.key as string
    if (!key || key.includes('..') || !/\.(mp3|flac|wav|ogg|aac|m4a)$/i.test(key)) {
      res.status(400).json({ error: 'Invalid key' }); return
    }
    const url = await getPresignedUrl(key)
    res.json({ url })
  } catch (err) {
    console.error('Error generating presigned URL:', err)
    res.status(500).json({ error: 'Failed to generate URL' })
  }
})

export default router
