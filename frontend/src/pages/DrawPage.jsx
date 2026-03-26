// src/pages/DrawPage.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

const MOCK_DRAWS = [
  {
    id: 'd3', month: 'December 2024', status: 'published',
    numbers: [12, 28, 34, 41, 7],
    jackpot: 4200, prize_4: 3675, prize_3: 2625,
    winners: { five: 1, four: 3, three: 8 },
    total_subscribers: 2400,
  },
  {
    id: 'd2', month: 'November 2024', status: 'published',
    numbers: [5, 19, 23, 38, 44],
    jackpot: 3800, prize_4: 3325, prize_3: 2375,
    winners: { five: 0, four: 2, three: 11 },
    total_subscribers: 2200,
    jackpot_rolled: true,
  },
  {
    id: 'd1', month: 'October 2024', status: 'published',
    numbers: [3, 17, 29, 35, 42],
    jackpot: 3600, prize_4: 3150, prize_3: 2250,
    winners: { five: 2, four: 4, three: 9 },
    total_subscribers: 2100,
  },
]

const UPCOMING = {
  month: 'January 2025',
  draw_date: '2025-01-31',
  jackpot_pool: 4800,
  prize_4_pool: 4200,
  prize_3_pool: 3000,
  total_subscribers: 2400,
}

export default function DrawPage() {
  const { isSubscribed } = useAuth();


  return (
    <div className="min-h-screen bg-[#020617] text-white  py-24 px-12 md:px-20">

      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-indigo-400 text-xs uppercase tracking-widest mb-2">
          Monthly Draw
        </p>
        <h1 className="text-4xl font-bold mb-3">
          Win every month 🎯
        </h1>
        <p className="text-white/60 max-w-xl mx-auto text-sm">
          Match your scores and win real prizes.
        </p>
      </div>

      {/* Upcoming */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-emerald-400/10 border border-white/10 rounded-2xl p-8 mb-10 text-center">
        <h2 className="text-2xl font-bold mb-2">Next Draw: Jan 2025</h2>
        <p className="text-white/60 mb-6">5 days remaining</p>

        <div className="flex justify-center gap-4">
          {[12, 28, 34, 41, 7].map(n => (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center font-bold">
              {n}
            </div>
          ))}
        </div>

        {!isSubscribed && (
          <button className="mt-6 px-6 py-2 bg-indigo-500 rounded-lg hover:bg-indigo-600 transition">
            Subscribe to Enter
          </button>
        )}
      </div>

      {/* Past draws */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Past Draws</h2>

        <div className="space-y-4">
          {MOCK_DRAWS.map(draw => (
            <div className="bg-white/5 border border-white/10 p-5 rounded-xl flex justify-between items-center hover:shadow-lg transition">
              <span>{draw.month}</span>

              <div className="flex gap-2">
                {draw.numbers.map(n => (
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm">
                    {n}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}