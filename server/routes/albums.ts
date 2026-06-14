import { Router } from 'express'
import { db } from '../db/index.js'
import { albums, tracks } from '../db/schema.js'
import { eq, sum, count, desc } from 'drizzle-orm'
import { getPresignedUrl } from '../s3.js'

const router = Router()

router.get('/cover-url', async (req, res) => {
	const key = req.query.key as string | undefined
	if (!key || key.includes('..') || !/\.(jpe?g|png|webp|gif|avif)$/i.test(key)) {
		res.status(400).json({ error: 'Invalid key' }); return
	}
	try {
		const url = await getPresignedUrl(key)
		res.json({ url })
	} catch (err) {
		console.error('Error generating cover art URL:', err)
		res.status(500).json({ error: 'Failed to generate URL' })
	}
})

router.get('/', async (_req, res) => {
	try {
		const rows = await db.select()
			.from(albums)
			.where(eq(albums.isArchived, false))
			.orderBy(desc(albums.title))

		res.json(rows)
	} catch (err) {
		console.error('Error listing albums:', err)
		res.status(500).json({ error: 'Failed to list albums' })
	}
})

router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params

		const [album] = await db.select().from(albums).where(eq(albums.id, id))
		if (!album) { res.status(404).json({ error: 'Album not found' }); return }

		const [stats] = await db
			.select({
				trackCount: count(tracks.id),
				totalDurationMs: sum(tracks.durationMs),
			})
			.from(tracks)
			.where(eq(tracks.albumId, id))


		res.json({
			...album,
			trackCount: Number(stats.trackCount),
			totalDurationMs: Number(stats.totalDurationMs ?? 0),
		})
	} catch (err) {
		console.error('Error fetching album:', err)
		res.status(500).json({ error: 'Failed to fetch album' })
	}
})

export default router
