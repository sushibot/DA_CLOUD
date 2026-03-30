import { Router } from 'express'
import { getPresignedUrl } from '../s3.js'
import { db } from '../db/index.js'
import { tracks } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const rows = await db.select().from(tracks).where(eq(tracks.isPublished, true))
    const result = rows.map(row => ({
      key: row.s3Key,
      title: row.title,
      bpm: row.bpm ?? undefined,
    }))
    res.json(result)
  } catch (err) {
    console.error('Error listing tracks:', err)
    res.status(500).json({ error: 'Failed to list tracks' })
  }
})

router.get('/url', async (req, res) => {
  try {
    const key = req.query.key as string
    if (!key) { res.status(400).json({ error: 'key is required' }); return }
    const url = await getPresignedUrl(key)
    res.json({ url })
  } catch (err) {
    console.error('Error generating presigned URL:', err)
    res.status(500).json({ error: 'Failed to generate URL' })
  }
})

export default router
