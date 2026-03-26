// routes/index.js — all routes wired up
import { Router } from 'express'
import { requireAuth, requireSubscription, requireAdmin } from '../middleware/Auth.js'

// Controllers
import { getScores, addScore, updateScore, deleteScore } from '../controllers/scoresController.js'
import { createCheckout, cancelSubscription, getSubscriptionStatus, handleWebhook } from '../controllers/paymentController.js'
import { getDraws, getUpcomingDraw, getMyDraws, simulateDraw, publishDraw } from '../controllers/drawController.js'
import {
  getCharities, getCharity, getUserCharity, updateUserCharity, makeDonation,
  adminCreateCharity, adminUpdateCharity, adminDeleteCharity,
} from '../controllers/charitiesController.js'
import { getMyWinnings, uploadProof, adminGetWinners, adminVerifyWinner, adminMarkPaid } from '../controllers/winnersController.js'
import {
  getProfile, updateProfile,
  adminGetUsers, adminGetUser, adminEditUserScore, adminManageSubscription, adminGetReports,
} from '../controllers/usersController.js'

const router = Router()

// ────────────────────────────────────────────────────────────────
// PUBLIC ROUTES (no auth required)
// ────────────────────────────────────────────────────────────────

// Health check
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Charities (public read)
router.get('/charities', getCharities)
router.get('/charities/:id', getCharity)

// Draws (public read — published only)
router.get('/draws', getDraws)
router.get('/draws/upcoming', getUpcomingDraw)

// ────────────────────────────────────────────────────────────────
// STRIPE WEBHOOK — must be before any json body parsing middleware
// (handled in index.js with raw body)
// ────────────────────────────────────────────────────────────────
// router.post('/payment/webhook', handleWebhook)  // registered separately in index.js

// ────────────────────────────────────────────────────────────────
// AUTHENTICATED USER ROUTES
// ────────────────────────────────────────────────────────────────

// Profile
router.get('/user/profile', requireAuth, getProfile)
router.put('/user/profile', requireAuth, updateProfile)

// Subscription & Payment
router.post('/payment/create-checkout', requireAuth, createCheckout)
router.post('/payment/cancel', requireAuth, cancelSubscription)
router.get('/payment/status', requireAuth, getSubscriptionStatus)

// Scores (requires active subscription)
router.get('/scores', requireAuth, requireSubscription, getScores)
router.post('/scores', requireAuth, requireSubscription, addScore)
router.put('/scores/:id', requireAuth, requireSubscription, updateScore)
router.delete('/scores/:id', requireAuth, requireSubscription, deleteScore)

// User's charity
router.get('/user/charity', requireAuth, getUserCharity)
router.put('/user/charity', requireAuth, updateUserCharity)
router.post('/user/donate', requireAuth, makeDonation)

// User's draws
router.get('/draws/my', requireAuth, getMyDraws)

// User's winnings
router.get('/user/winnings', requireAuth, getMyWinnings)
router.post('/user/winnings/:id/proof', requireAuth, uploadProof)

// ────────────────────────────────────────────────────────────────
// ADMIN ROUTES (requireAuth + requireAdmin)
// ────────────────────────────────────────────────────────────────

// Admin — users
router.get('/admin/users', requireAuth, requireAdmin, adminGetUsers)
router.get('/admin/users/:id', requireAuth, requireAdmin, adminGetUser)
router.put('/admin/users/:id/scores/:scoreId', requireAuth, requireAdmin, adminEditUserScore)
router.put('/admin/users/:id/subscription', requireAuth, requireAdmin, adminManageSubscription)

// Admin — draws
router.post('/admin/draws/simulate', requireAuth, requireAdmin, simulateDraw)
router.post('/admin/draws/publish', requireAuth, requireAdmin, publishDraw)

// Admin — charities
router.post('/admin/charities', requireAuth, requireAdmin, adminCreateCharity)
router.put('/admin/charities/:id', requireAuth, requireAdmin, adminUpdateCharity)
router.delete('/admin/charities/:id', requireAuth, requireAdmin, adminDeleteCharity)

// Admin — winners
router.get('/admin/winners', requireAuth, requireAdmin, adminGetWinners)
router.put('/admin/winners/:id/verify', requireAuth, requireAdmin, adminVerifyWinner)
router.put('/admin/winners/:id/pay', requireAuth, requireAdmin, adminMarkPaid)

// Admin — reports
router.get('/admin/reports', requireAuth, requireAdmin, adminGetReports)

export default router