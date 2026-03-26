// middleware/auth.js
import { supabaseAdmin } from '../lib/supabase.js'

// Verifies the Supabase JWT sent from the React frontend
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Authentication failed' })
  }
}

// Checks active subscription — must come after requireAuth
export async function requireSubscription(req, res, next) {
  const userId = req.user.id
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error || !data) {
      return res.status(403).json({ message: 'Active subscription required' })
    }

    // Check not expired
    if (new Date(data.current_period_end) < new Date()) {
      return res.status(403).json({ message: 'Subscription has expired' })
    }

    req.subscription = data
    next()
  } catch (err) {
    return res.status(403).json({ message: 'Subscription check failed' })
  }
}

// Admin-only middleware
export async function requireAdmin(req, res, next) {
  const role = req.user?.user_metadata?.role
  if (role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}