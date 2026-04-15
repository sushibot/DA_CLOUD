import { Router } from 'express'
import { db } from '../db/index.js'
import { sql } from 'drizzle-orm'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`)
    res.json({ status: 'ok', db: 'ok' })
  } catch (err) {
    console.error('[health] DB check failed:', err)
    res.status(503).json({ status: 'error', db: 'unreachable' })
  }
})

export default router
