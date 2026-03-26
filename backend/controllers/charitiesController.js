// controllers/charitiesController.js
import { supabaseAdmin } from '../lib/supabase.js'

// GET /api/charities — list all charities (public)
export async function getCharities(req, res) {
  const { search, category } = req.query
  try {
    let query = supabaseAdmin
      .from('charities')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (category && category !== 'All') {
      query = query.eq('category', category)
    }
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    res.json({ charities: data })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch charities', error: err.message })
  }
}

// GET /api/charities/:id — single charity profile (public)
export async function getCharity(req, res) {
  const { id } = req.params
  try {
    const { data, error } = await supabaseAdmin
      .from('charities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ message: 'Charity not found' })

    // Get subscriber count for this charity
    const { count } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('charity_id', id)

    res.json({ charity: { ...data, subscriber_count: count } })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch charity', error: err.message })
  }
}

// GET /api/user/charity — get current user's selected charity
export async function getUserCharity(req, res) {
  const userId = req.user.id
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('charity_id, charity_percent, charities(*)')
      .eq('id', userId)
      .single()

    if (error) throw error

    res.json({
      charity: data?.charities || null,
      percent: data?.charity_percent || 10,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user charity', error: err.message })
  }
}

// PUT /api/user/charity — update user's charity selection and/or percentage
export async function updateUserCharity(req, res) {
  const userId = req.user.id
  const { charity_id, charity_percent } = req.body

  // Validate percent
  const pct = Number(charity_percent)
  if (pct < 10 || pct > 100) {
    return res.status(400).json({ message: 'Charity percentage must be between 10 and 100' })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ charity_id, charity_percent: pct })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    res.json({ message: 'Charity updated', profile: data })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update charity', error: err.message })
  }
}

// POST /api/user/donate — independent donation (not tied to subscription)
export async function makeDonation(req, res) {
  const userId = req.user.id
  const { charity_id, amount } = req.body

  if (!charity_id || !amount || amount < 1) {
    return res.status(400).json({ message: 'charity_id and amount (min £1) are required' })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('donations')
      .insert({ user_id: userId, charity_id, amount: Number(amount), type: 'independent' })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ donation: data, message: 'Donation recorded' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to record donation', error: err.message })
  }
}

// ── Admin charity management ──

// POST /api/admin/charities — create new charity
export async function adminCreateCharity(req, res) {
  const { name, category, description, website, image_url } = req.body

  if (!name || !category) {
    return res.status(400).json({ message: 'name and category are required' })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('charities')
      .insert({ name, category, description, website, image_url, is_active: true })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ charity: data, message: 'Charity created' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to create charity', error: err.message })
  }
}

// PUT /api/admin/charities/:id — update charity
export async function adminUpdateCharity(req, res) {
  const { id } = req.params
  const updates = req.body

  try {
    const { data, error } = await supabaseAdmin
      .from('charities')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json({ charity: data, message: 'Charity updated' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update charity', error: err.message })
  }
}

// DELETE /api/admin/charities/:id — soft delete (set is_active false)
export async function adminDeleteCharity(req, res) {
  const { id } = req.params
  try {
    await supabaseAdmin
      .from('charities')
      .update({ is_active: false })
      .eq('id', id)

    res.json({ message: 'Charity removed' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove charity', error: err.message })
  }
}