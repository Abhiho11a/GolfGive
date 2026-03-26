// controllers/winnersController.js
import { supabaseAdmin } from '../lib/supabase.js'

// GET /api/user/winnings — user's own winnings
export async function getMyWinnings(req, res) {
  const userId = req.user.id
  try {
    const { data, error } = await supabaseAdmin
      .from('winners')
      .select('*, draws(month, draw_date)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const total = data.reduce((sum, w) => sum + (w.amount || 0), 0)
    res.json({ winnings: data, total_won: total })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch winnings', error: err.message })
  }
}

// POST /api/user/winnings/:id/proof — winner uploads proof screenshot
export async function uploadProof(req, res) {
  const userId = req.user.id
  const { id } = req.params
  const { proof_url } = req.body // URL of uploaded screenshot (stored in Supabase Storage)

  if (!proof_url) {
    return res.status(400).json({ message: 'proof_url is required' })
  }

  try {
    // Check the winner record belongs to this user
    const { data: winner } = await supabaseAdmin
      .from('winners')
      .select('user_id, status')
      .eq('id', id)
      .single()

    if (!winner) return res.status(404).json({ message: 'Winner record not found' })
    if (winner.user_id !== userId) return res.status(403).json({ message: 'Not authorised' })
    if (winner.status === 'paid') return res.status(400).json({ message: 'Already paid' })

    const { data, error } = await supabaseAdmin
      .from('winners')
      .update({ proof_url, status: 'proof_submitted' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json({ winner: data, message: 'Proof submitted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload proof', error: err.message })
  }
}

// ── Admin winner management ──

// GET /api/admin/winners — list all winners (admin)
export async function adminGetWinners(req, res) {
  const { status, draw_id } = req.query
  try {
    let query = supabaseAdmin
      .from('winners')
      .select('*, draws(month), profiles(full_name, email)')
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (draw_id) query = query.eq('draw_id', draw_id)

    const { data, error } = await query
    if (error) throw error
    res.json({ winners: data })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch winners', error: err.message })
  }
}

// PUT /api/admin/winners/:id/verify — admin approves winner
export async function adminVerifyWinner(req, res) {
  const { id } = req.params
  const { action } = req.body // 'approve' or 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'action must be approve or reject' })
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected'

  try {
    const { data, error } = await supabaseAdmin
      .from('winners')
      .update({ status: newStatus, verified_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json({ winner: data, message: `Winner ${action}d` })
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify winner', error: err.message })
  }
}

// PUT /api/admin/winners/:id/pay — admin marks winner as paid
export async function adminMarkPaid(req, res) {
  const { id } = req.params
  const { payment_reference } = req.body

  try {
    const { data, error } = await supabaseAdmin
      .from('winners')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_reference: payment_reference || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json({ winner: data, message: 'Winner marked as paid' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as paid', error: err.message })
  }
}