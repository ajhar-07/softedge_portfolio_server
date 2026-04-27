import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { closeMongo, connectMongo } from './config/mongodb.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = Number(process.env.PORT) || 5000
const MONGODB_URI = process.env.MONGODB_URI

const uploadDir = path.join(__dirname, 'uploads')
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname.replace(/[^\w.-]/g, '_')}`
    cb(null, safe)
  },
})
const upload = multer({ storage })

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'softedge_server', mongo: Boolean(MONGODB_URI) })
})

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file (field name: file)' })
  }
  res.json({
    message: 'File uploaded',
    file: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    },
  })
})

async function shutdown(signal) {
  console.log(`\n${signal} received, closing…`)
  await closeMongo().catch(() => {})
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

async function start() {
  if (MONGODB_URI) {
    await connectMongo(MONGODB_URI)
  } else {
    console.warn('[warn] MONGODB_URI is not set — add it to .env')
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
