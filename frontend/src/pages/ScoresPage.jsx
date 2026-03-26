// src/pages/ScoresPage.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

export default function ScoresPage() {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editScore, setEditScore] = useState(null)
  const [form, setForm] = useState({
    score: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchScores()
  }, [])

  async function fetchScores() {
    try {
      const res = await api.get('/scores')
      setScores(res.data?.scores || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditScore(null)
    setForm({
      score: '',
      date: new Date().toISOString().split('T')[0],
    })
    setError('')
    setShowModal(true)
  }

  function openEdit(s) {
    setEditScore(s)
    setForm({ score: s.score, date: s.date })
    setError('')
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    const val = Number(form.score)

    if (isNaN(val) || val < 1 || val > 45) {
      setError('Score must be between 1 and 45')
      return
    }

    setSaving(true)
    try {
      if (editScore) {
        await api.put(`/scores/${editScore.id}`, form)
      } else {
        await api.post('/scores', form)
      }
      setShowModal(false)
      fetchScores()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save score')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this score?')) return
    try {
      await api.delete(`/scores/${id}`)
      fetchScores()
    } catch (e) {
      console.error(e)
    }
  }

  const avgScore = scores.length
    ? (
        scores.reduce((s, sc) => s + sc.score, 0) / scores.length
      ).toFixed(1)
    : '—'

  const bestScore = scores.length
    ? Math.max(...scores.map((s) => s.score))
    : '—'

  return (
    <div className="max-w-5xl mx-auto px-4 py-24">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <Link
            to="/dashboard"
            className="text-sm text-slate-500 hover:text-indigo-600"
          >
            ← Dashboard
          </Link>

          <h1 className="text-3xl font-bold mt-2">My Scores</h1>
          <p className="text-sm text-slate-500">
            Your last 5 Stableford scores.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700"
        >
          + Add Score
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Scores" value={`${scores.length}/5`} />
        <Stat label="Average" value={avgScore} />
        <Stat label="Best" value={bestScore} />
      </div>

      {/* Scores */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : scores.length === 0 ? (
        <div className="text-center py-10 border rounded-xl">
          No scores yet
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          {scores.map((s, i) => (
            <div
              key={s.id}
              className="flex justify-between items-center px-4 py-3 border-b hover:bg-slate-50"
            >
              <div>
                <div className="font-bold text-lg">{s.score}</div>
                <div className="text-xs text-slate-500">
                  {new Date(s.date).toDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(s)}
                  className="text-sm text-indigo-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-sm text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) =>
            e.target === e.currentTarget && setShowModal(false)
          }
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 animate-[fadeUp_0.3s_ease]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editScore ? 'Edit Score' : 'Add Score'}
              </h2>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && (
              <div className="mb-4 text-red-500 text-sm">{error}</div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <input
                type="number"
                min="1"
                max="45"
                required
                value={form.score}
                onChange={(e) =>
                  setForm({ ...form, score: e.target.value })
                }
                placeholder="Score (1-45)"
                className="w-full px-4 py-3 border rounded-xl text-center text-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              <input
                type="date"
                required
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-xl"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border rounded-xl py-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 text-white rounded-xl py-2"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border rounded-xl p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  )
}