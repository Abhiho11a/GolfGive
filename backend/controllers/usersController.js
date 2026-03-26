// controllers/usersController.js
import { supabaseAdmin } from '../lib/supabase.js'

// GET /api/user/profile — get own profile
export async function getProfile(req, res) {
  const userId = req.user.id
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*, charities(name, category)')
      .eq('id', userId)
      .single()

    if (error) throw error
    res.json({ profile: data })
  } catch (err) {
    res.status(500).json({ message: 'Failed to get profile', error: err.message })
  }
}

// PUT /api/user/profile — update own profile
export async function updateProfile(req, res) {
  const userId = req.user.id
  const { full_name, phone } = req.body

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ full_name, phone, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    res.json({ profile: data, message: 'Profile updated' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message })
  }
}

// ── Admin user management ──

// GET /api/admin/users — list all users
export async function adminGetUsers(req, res) {
  const { status, search } = req.query
  try {
    let query = supabaseAdmin
      .from('profiles')
      .select('*, subscriptions(status, plan, current_period_end), charities(name)')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (error) throw error

    // Filter by subscription status if needed
    let filtered = data
    if (status && status !== 'all') {
      filtered = data.filter(u => u.subscriptions?.[0]?.status === status)
    }

    res.json({ users: filtered, total: filtered.length })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message })
  }
}

// GET /api/admin/users/:id — single user detail
export async function adminGetUser(req, res) {
  const { id } = req.params
  try {
    const [profileRes, scoresRes, winnersRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*, subscriptions(*), charities(name, category)').eq('id', id).single(),
      supabaseAdmin.from('scores').select('*').eq('user_id', id).order('date', { ascending: false }),
      supabaseAdmin.from('winners').select('*, draws(month)').eq('user_id', id),
    ])

    res.json({
      profile: profileRes.data,
      scores: scoresRes.data,
      winners: winnersRes.data,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user', error: err.message })
  }
}

// PUT /api/admin/users/:id/scores/:scoreId — admin edits a user's score
export async function adminEditUserScore(req, res) {
  const { id, scoreId } = req.params
  const { score, date } = req.body

  const scoreNum = Number(score)
  if (!scoreNum || scoreNum < 1 || scoreNum > 45) {
    return res.status(400).json({ message: 'Score must be between 1 and 45' })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('scores')
      .update({ score: scoreNum, date })
      .eq('id', scoreId)
      .eq('user_id', id)
      .select()
      .single()

    if (error) throw error
    res.json({ score: data, message: 'Score updated by admin' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update score', error: err.message })
  }
}

// PUT /api/admin/users/:id/subscription — admin manages subscription
export async function adminManageSubscription(req, res) {
  const { id } = req.params
  const { status } = req.body

  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update({ status })
      .eq('user_id', id)
      .select()
      .single()

    if (error) throw error
    res.json({ subscription: data, message: 'Subscription updated' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update subscription', error: err.message })
  }
}

// GET /api/admin/reports — analytics summary
export async function adminGetReports(req, res) {
  try {
    const [usersCount, activeSubs, draws, winners, charityDonations] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('draws').select('*').eq('status', 'published'),
      supabaseAdmin.from('winners').select('amount, status'),
      supabaseAdmin.from('donations').select('amount'),
    ])

    const totalPrizePool = winners.data?.reduce((s, w) => s + (w.amount || 0), 0) || 0
    const totalCharity = charityDonations.data?.reduce((s, d) => s + (d.amount || 0), 0) || 0
    const pendingVerifs = winners.data?.filter(w => w.status === 'proof_submitted').length || 0

    res.json({
      total_users: usersCount.count,
      active_subscribers: activeSubs.count,
      draws_run: draws.data?.length || 0,
      total_prize_pool: totalPrizePool,
      total_charity_donated: totalCharity,
      pending_verifications: pendingVerifs,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate report', error: err.message })
  }
}