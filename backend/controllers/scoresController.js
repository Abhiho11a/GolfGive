// controllers/scoresController.js
import { supabaseAdmin } from '../lib/supabase.js'

// GET /api/scores — fetch user's last 5 scores
export async function getScores(req, res) {
  const userId = req.user.id
  try {
    const { data, error } = await supabaseAdmin
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5)

    if (error) throw error
    res.json({ scores: data })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch scores', error: err.message })
  }
}

// POST /api/scores — add a new score (rolling 5-score logic enforced here)
export async function addScore(req, res) {
  const userId = req.user.id
  const { score, date } = req.body

  // Validate score range
  const scoreNum = Number(score)
  if (!scoreNum || scoreNum < 1 || scoreNum > 45) {
    return res.status(400).json({ message: 'Score must be between 1 and 45' })
  }
  if (!date) {
    return res.status(400).json({ message: 'Date is required' })
  }
  // Date cannot be in the future
  if (new Date(date) > new Date()) {
    return res.status(400).json({ message: 'Date cannot be in the future' })
  }

  try {
    // ── Rolling 5-score logic ──
    // 1. Count existing scores
    const { data: existingScores, error: countError } = await supabaseAdmin
      .from('scores')
      .select('id, date')
      .eq('user_id', userId)
      .order('date', { ascending: true }) // oldest first

    if (countError) throw countError

    // 2. If already at 5, delete the oldest before inserting new
    if (existingScores.length >= 5) {
      const oldestId = existingScores[0].id
      const { error: deleteError } = await supabaseAdmin
        .from('scores')
        .delete()
        .eq('id', oldestId)
        .eq('user_id', userId) // safety: only delete own scores

      if (deleteError) throw deleteError
    }

    // 3. Insert the new score
    const { data: newScore, error: insertError } = await supabaseAdmin
      .from('scores')
      .insert({ user_id: userId, score: scoreNum, date })
      .select()
      .single()

    if (insertError) throw insertError

    res.status(201).json({ score: newScore, message: 'Score added successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to add score', error: err.message })
  }
}

// PUT /api/scores/:id — edit an existing score
export async function updateScore(req, res) {
  const userId = req.user.id
  const { id } = req.params
  const { score, date } = req.body

  const scoreNum = Number(score)
  if (!scoreNum || scoreNum < 1 || scoreNum > 45) {
    return res.status(400).json({ message: 'Score must be between 1 and 45' })
  }
  if (new Date(date) > new Date()) {
    return res.status(400).json({ message: 'Date cannot be in the future' })
  }

  try {
    // Only allow user to update their own scores
    const { data, error } = await supabaseAdmin
      .from('scores')
      .update({ score: scoreNum, date })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ message: 'Score not found' })

    res.json({ score: data, message: 'Score updated' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update score', error: err.message })
  }
}

// DELETE /api/scores/:id — delete a score
export async function deleteScore(req, res) {
  const userId = req.user.id
  const { id } = req.params

  try {
    const { error } = await supabaseAdmin
      .from('scores')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
    res.json({ message: 'Score deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete score', error: err.message })
  }
}