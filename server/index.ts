import 'dotenv/config'
import express from 'express'
import tracksRouter from './routes/tracks.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(express.json())
app.use('/api/tracks', tracksRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
