import { Router } from 'express'
import { listAudioKeys, getPresignedUrl, getTrackMetadata } from '../s3.js'
import type { Track } from '../../src/types.js'

const router = Router()

function keyToTitle(key: string): string {
  return key
    .split('/').pop()!
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
}

router.get('/', async (_req, res) => {
  try {
    const keys = await listAudioKeys()
    const tracks: Track[] = await Promise.all(
      keys.map(async (key) => {
        const meta = await getTrackMetadata(key)
        return { key, title: keyToTitle(key), ...meta }
      })
    )
    res.json(tracks)
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
