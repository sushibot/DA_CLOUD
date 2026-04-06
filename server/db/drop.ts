import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function drop() {
  await sql`DROP TABLE IF EXISTS tracks CASCADE`
  await sql`DROP TABLE IF EXISTS albums CASCADE`
  await sql`DROP TYPE IF EXISTS genre_type CASCADE`
  console.log('Dropped tables and enum')
}

drop().catch(console.error)
