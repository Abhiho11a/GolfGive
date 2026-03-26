// index.js — Main Express server
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { handleWebhook } from './controllers/paymentController.js'
import routes from './routes/index.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Stripe Webhook (MUST come BEFORE express.json) ────────────
// Stripe sends raw body — we must not parse it as JSON
app.post(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
)

// ── Body parsers ─────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Request logger (dev only) ─────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`)
    next()
  })
}

// ── Routes ────────────────────────────────────────────────────
app.use('/api', routes)

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` })
})

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    message: 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { error: err.message }),
  })
})

// ── Start ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ Golf Platform API running on port ${PORT}`)
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Client URL  : ${process.env.CLIENT_URL}`)
  console.log(`   Health      : http://localhost:${PORT}/api/health\n`)
})      