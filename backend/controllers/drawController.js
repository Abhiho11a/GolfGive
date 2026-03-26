// controllers/drawController.js
import { supabaseAdmin } from '../lib/supabase.js'

// ── Draw Engine ─────────────────────────────────────────────────

// Random draw: picks 5 unique numbers between 1–45
function randomDraw() {
  const numbers = []
  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(n)) numbers.push(n)
  }
  return numbers.sort((a, b) => a - b)
}

// Algorithmic draw: weighted by frequency of all user scores
// Numbers that appear more often across all subscribers are MORE likely to be drawn
async function algorithmicDraw() {
  // Fetch all current scores from active subscribers
  const { data: allScores, error } = await supabaseAdmin
    .from('scores')
    .select('score')

  if (error || !allScores.length) return randomDraw()

  // Build frequency map: score -> count
  const freqMap = {}
  for (let i = 1; i <= 45; i++) freqMap[i] = 0
  allScores.forEach(({ score }) => {
    if (freqMap[score] !== undefined) freqMap[score]++
  })

  // Build weighted pool: numbers with higher freq appear more in pool
  const pool = []
  for (const [num, count] of Object.entries(freqMap)) {
    const weight = count + 1 // +1 so even 0-count numbers have a chance
    for (let i = 0; i < weight; i++) pool.push(Number(num))
  }

  // Pick 5 unique numbers from weighted pool
  const selected = []
  const poolCopy = [...pool]
  while (selected.length < 5 && poolCopy.length > 0) {
    const idx = Math.floor(Math.random() * poolCopy.length)
    const num = poolCopy[idx]
    if (!selected.includes(num)) selected.push(num)
    poolCopy.splice(idx, 1)
  }

  return selected.sort((a, b) => a - b)
}

// Check how many of a user's scores match drawn numbers
function checkMatch(userScores, drawnNumbers) {
  return userScores.filter(s => drawnNumbers.includes(s))
}

// Calculate prize for each tier based on total pool and winner count
function calcPrize(pool, winnerCount) {
  if (!winnerCount || winnerCount === 0) return 0
  return parseFloat((pool / winnerCount).toFixed(2))
}

// ── Controllers ─────────────────────────────────────────────────

// GET /api/draws — list all published draws
export async function getDraws(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('draw_date', { ascending: false })

    if (error) throw error
    res.json({ draws: data })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch draws', error: err.message })
  }
}

// GET /api/draws/upcoming — get the next upcoming draw
export async function getUpcomingDraw(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('status', 'pending')
      .order('draw_date', { ascending: true })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    res.json({ draw: data || null })
  } catch (err) {
    res.status(500).json({ message: 'Failed to get upcoming draw', error: err.message })
  }
}

// GET /api/draws/my — user's draw participation history
export async function getMyDraws(req, res) {
  const userId = req.user.id
  try {
    const { data, error } = await supabaseAdmin
      .from('draw_results')
      .select('*, draws(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Count total draws user has entered
    const { count } = await supabaseAdmin
      .from('draw_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    res.json({ results: data, total: count })
  } catch (err) {
    res.status(500).json({ message: 'Failed to get draw history', error: err.message })
  }
}

// POST /api/admin/draws/simulate — admin: simulate a draw (preview only, does not save)
export async function simulateDraw(req, res) {
  const { draw_type = 'random', month, jackpot_pool, prize_4_pool, prize_3_pool } = req.body

  try {
    // Generate numbers
    const numbers = draw_type === 'algorithmic'
      ? await algorithmicDraw()
      : randomDraw()

    // Fetch all active subscribers and their scores for preview
    const { data: activeSubscribers } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('status', 'active')

    const userIds = activeSubscribers.map(s => s.user_id)

    const { data: allScores } = await supabaseAdmin
      .from('scores')
      .select('user_id, score')
      .in('user_id', userIds)

    // Group scores by user
    const scoresByUser = {}
    allScores.forEach(({ user_id, score }) => {
      if (!scoresByUser[user_id]) scoresByUser[user_id] = []
      scoresByUser[user_id].push(score)
    })

    // Count matches per tier
    let fiveMatch = 0, fourMatch = 0, threeMatch = 0
    for (const [userId, scores] of Object.entries(scoresByUser)) {
      const matches = checkMatch(scores, numbers)
      if (matches.length >= 5) fiveMatch++
      else if (matches.length === 4) fourMatch++
      else if (matches.length === 3) threeMatch++
    }

    res.json({
      numbers,
      draw_type,
      preview: {
        five_match_winners: fiveMatch,
        four_match_winners: fourMatch,
        three_match_winners: threeMatch,
        jackpot_per_winner: calcPrize(jackpot_pool || 0, fiveMatch),
        prize_4_per_winner: calcPrize(prize_4_pool || 0, fourMatch),
        prize_3_per_winner: calcPrize(prize_3_pool || 0, threeMatch),
      }
    })
  } catch (err) {
    res.status(500).json({ message: 'Simulation failed', error: err.message })
  }
}

// POST /api/admin/draws/publish — admin: run and publish the official draw
export async function publishDraw(req, res) {
  const {
    draw_type = 'random',
    month,
    draw_date,
    jackpot_pool,
    prize_4_pool,
    prize_3_pool,
    numbers: presetNumbers, // admin can pass pre-simulated numbers
  } = req.body

  try {
    // Generate or use preset numbers
    let drawnNumbers = presetNumbers
    if (!drawnNumbers || drawnNumbers.length !== 5) {
      drawnNumbers = draw_type === 'algorithmic'
        ? await algorithmicDraw()
        : randomDraw()
    }

    // Create the draw record
    const { data: draw, error: drawError } = await supabaseAdmin
      .from('draws')
      .insert({
        month,
        draw_date: draw_date || new Date().toISOString(),
        draw_type,
        numbers: drawnNumbers,
        jackpot_pool: Number(jackpot_pool) || 0,
        prize_4_pool: Number(prize_4_pool) || 0,
        prize_3_pool: Number(prize_3_pool) || 0,
        status: 'published',
      })
      .select()
      .single()

    if (drawError) throw drawError

    // Fetch all active subscribers + their scores
    const { data: activeSubs } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('status', 'active')

    const userIds = activeSubs.map(s => s.user_id)

    const { data: allScores } = await supabaseAdmin
      .from('scores')
      .select('user_id, score')
      .in('user_id', userIds)

    // Group by user
    const scoresByUser = {}
    allScores.forEach(({ user_id, score }) => {
      if (!scoresByUser[user_id]) scoresByUser[user_id] = []
      scoresByUser[user_id].push(score)
    })

    // Process matches and create draw_results + winners
    const drawResults = []
    const fiveMatchWinners = []
    const fourMatchWinners = []
    const threeMatchWinners = []

    for (const [userId, scores] of Object.entries(scoresByUser)) {
      const matches = checkMatch(scores, drawnNumbers)
      const matchCount = matches.length

      drawResults.push({
        draw_id: draw.id,
        user_id: userId,
        scores_at_draw: scores,
        match_count: matchCount,
        matched_numbers: matches,
      })

      if (matchCount >= 5) fiveMatchWinners.push(userId)
      else if (matchCount === 4) fourMatchWinners.push(userId)
      else if (matchCount === 3) threeMatchWinners.push(userId)
    }

    // Insert all draw results
    if (drawResults.length > 0) {
      await supabaseAdmin.from('draw_results').insert(drawResults)
    }

    // Calculate prize per winner for each tier
    const jackpotPerWinner = calcPrize(jackpot_pool, fiveMatchWinners.length)
    const prize4PerWinner = calcPrize(prize_4_pool, fourMatchWinners.length)
    const prize3PerWinner = calcPrize(prize_3_pool, threeMatchWinners.length)

    // Handle jackpot rollover if no 5-match
    if (fiveMatchWinners.length === 0) {
      await supabaseAdmin
        .from('draws')
        .update({ jackpot_rolled_over: true })
        .eq('id', draw.id)
    }

    // Create winner records
    const winnerRecords = [
      ...fiveMatchWinners.map(uid => ({
        draw_id: draw.id, user_id: uid,
        match_type: '5-match', amount: jackpotPerWinner,
        status: 'pending',
      })),
      ...fourMatchWinners.map(uid => ({
        draw_id: draw.id, user_id: uid,
        match_type: '4-match', amount: prize4PerWinner,
        status: 'pending',
      })),
      ...threeMatchWinners.map(uid => ({
        draw_id: draw.id, user_id: uid,
        match_type: '3-match', amount: prize3PerWinner,
        status: 'pending',
      })),
    ]

    if (winnerRecords.length > 0) {
      await supabaseAdmin.from('winners').insert(winnerRecords)
    }

    res.json({
      message: 'Draw published successfully',
      draw,
      results: {
        total_participants: drawResults.length,
        five_match: fiveMatchWinners.length,
        four_match: fourMatchWinners.length,
        three_match: threeMatchWinners.length,
        jackpot_rolled: fiveMatchWinners.length === 0,
      }
    })
  } catch (err) {
    console.error('Publish draw error:', err)
    res.status(500).json({ message: 'Failed to publish draw', error: err.message })
  }
}