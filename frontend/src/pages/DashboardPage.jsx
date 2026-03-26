import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import '../App.css'
import WombAnimationCard from "./WombAnimationCard";

export default function DashboardPage() {
  const { user, subscription } = useAuth();

  const [scores, setScores] = useState([]);
  const [charity, setCharity] = useState(null);
  const [charityPercent, setCharityPercent] = useState(10);
  const [draws, setDraws] = useState(null);
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [scoresRes, charityRes, drawsRes, winningsRes] =
        await Promise.all([
          api.get("/scores"),
          api.get("/user/charity"),
          api.get("/draws/my"),
          api.get("/user/winnings"),
        ]);

      setScores(scoresRes.data?.scores || []);
      setCharity(charityRes.data?.charity || null);
      setCharityPercent(charityRes.data?.percent || 10);
      setDraws(drawsRes.data || null);
      setWinnings(winningsRes.data?.winnings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const totalWinnings =
    winnings.reduce((sum, w) => sum + (w.amount || 0), 0) || 0;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617]">
        <div className="w-12 h-12 border-4 border-white/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white px-16 md:px-20 py-20">

      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.email?.split("@")[0]} 👋
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Let’s see how lucky you’ve been today 😏
          </p>
        </div>

        {/* status badge */}
        <div className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
          subscription?.status === "active"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            : "bg-red-500/10 text-red-400 border-red-500/30"
        }`}>
          {subscription?.status || "inactive"} plan
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <StatCard title="Plan" value={subscription?.plan || "Free"} glow="from-indigo-500 to-violet-500" />
        <StatCard title="Scores" value={`${scores.length}/5`} glow="from-emerald-500 to-teal-500" />
        <StatCard title="Charity %" value={`${charityPercent}%`} glow="from-pink-500 to-rose-500" />
        <StatCard title="Winnings" value={`£${totalWinnings}`} glow="from-amber-500 to-orange-500" />
      </div>

      {/* MAIN GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Scores */}
        <Card title="Recent Scores">
          {scores.length === 0 ? (
            <EmptyState text="No scores yet" />
          ) : (
            scores.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center text-sm py-2 px-3 rounded-lg hover:bg-white/5 transition"
              >
                <span className="text-white/60">
                  {new Date(s.date).toDateString()}
                </span>
                <span className="font-bold text-indigo-400">
                  {s.score}
                </span>
              </div>
            ))
          )}
        </Card>

        {/* Charity */}
        <Card title="Your Charity">
          {charity ? (
            <>
              <p className="font-semibold text-white">{charity.name}</p>
              <p className="text-sm text-white/50 mt-1">
                {charityPercent}% contribution
              </p>
            </>
          ) : (
            <EmptyState text="No charity selected" />
          )}
        </Card>

        {/* Draw */}
        <Card title="Draw Participation">
          <p className="text-white/60 text-sm">
            Participated in{" "}
            <span className="text-indigo-400 font-semibold">
              {draws?.total || 0}
            </span>{" "}
            draws
          </p>
        </Card>

        {/* Winnings BIG CARD */}
        <div className="relative bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-emerald-500 to-teal-500 blur-2xl" />
          <h2 className="text-sm text-white/50 mb-2">Total Winnings</h2>
          <p className="text-4xl font-extrabold text-emerald-400">
            £{totalWinnings}
          </p>
        </div>

      </div>
    </div>
  );
}

/* COMPONENTS */

function StatCard({ title, value, glow }) {
  return (
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl 
                    hover:-translate-y-1 hover:border-white/20 transition-all duration-300 overflow-hidden group">
      
      {/* glow line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${glow}`} />

      <p className="text-xs text-white/40">{title}</p>
      <p className="text-2xl font-extrabold mt-2">{value}</p>

      {/* hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-white/5 rounded-2xl" />
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl 
                    hover:border-white/20 transition-all duration-300">
      <h2 className="text-sm text-white/40 mb-4 uppercase tracking-wider">
        {title}
      </h2>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <p className="text-white/40 text-sm italic">{text}</p>
  );
}