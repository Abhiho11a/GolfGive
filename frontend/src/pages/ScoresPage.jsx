import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function ScoresPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editScore, setEditScore] = useState(null);
  const [form, setForm] = useState({
    score: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchScores();
  }, []);

  async function fetchScores() {
    try {
      const res = await api.get("/scores");
      setScores(res.data?.scores || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditScore(null);
    setForm({
      score: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  }

  function openEdit(s) {
    setEditScore(s);
    setForm({ score: s.score, date: s.date });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const val = Number(form.score);

    if (isNaN(val) || val < 1 || val > 45) {
      setError("Score must be between 1 and 45");
      return;
    }

    setSaving(true);
    try {
      if (editScore) {
        await api.put(`/scores/${editScore.id}`, form);
      } else {
        await api.post("/scores", form);
      }
      setShowModal(false);
      fetchScores();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this score?")) return;
    await api.delete(`/scores/${id}`);
    fetchScores();
  }

  const avgScore = scores.length
    ? (scores.reduce((s, sc) => s + sc.score, 0) / scores.length).toFixed(1)
    : "—";

  const bestScore = scores.length
    ? Math.max(...scores.map((s) => s.score))
    : "—";

  return (
    <div className="min-h-screen bg-[#020617] text-white px-16 md:px-20 py-24">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <Link to="/dashboard" className="text-white/50 text-sm hover:text-indigo-400">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold mt-2">My Scores</h1>
          <p className="text-white/50 text-sm">Track your performance</p>
        </div>

        <button
          onClick={openAdd}
          className="bg-indigo-500 px-4 py-2 rounded-xl hover:bg-indigo-600 transition"
        >
          + Add Score
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard title="Total" value={`${scores.length}/5`} />
        <StatCard title="Average" value={avgScore} />
        <StatCard title="Best" value={bestScore} />
      </div>

      {/* LIST */}
      {loading ? (
        <Loader />
      ) : scores.length === 0 ? (
        <div className="text-center py-20 text-white/50">
          No scores yet 😢
        </div>
      ) : (
        <div className="space-y-4">
          {scores.map((s) => (
            <div
              key={s.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-xl flex justify-between items-center hover:shadow-xl transition"
            >
              <div>
                <p className="text-2xl font-bold text-indigo-400">
                  {s.score}
                </p>
                <p className="text-sm text-white/50">
                  {new Date(s.date).toDateString()}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => openEdit(s)}
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-red-400 hover:text-red-300"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-[#020617] border border-white/10 rounded-2xl p-6 w-full max-w-md animate-[fadeUp_0.3s]">

            <h2 className="text-xl font-bold mb-4">
              {editScore ? "Edit Score" : "Add Score"}
            </h2>

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            <form onSubmit={handleSave} className="space-y-4">
              <input
                type="number"
                value={form.score}
                onChange={(e) => setForm({ ...form, score: e.target.value })}
                placeholder="Score"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-center text-xl outline-none"
              />

              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-white/10 rounded-xl py-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-indigo-500 rounded-xl py-2"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* COMPONENTS */

function StatCard({ title, value }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-xl text-center">
      <p className="text-white/50 text-sm">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-white/20 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
}