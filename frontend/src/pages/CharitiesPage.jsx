// src/pages/CharitiesPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

const MOCK_CHARITIES = [
  { id: 1, name: 'Cancer Research UK', category: 'Health', description: 'Funding breakthrough cancer research and treatments across the UK and beyond.', raised: 142400, subscribers: 340, color: '#7c6aff', events: ['Golf Day — Mar 15', 'Charity Auction — Apr 2'] },
  { id: 2, name: 'Action for Children', category: 'Youth', description: 'Protecting and supporting vulnerable children and young people.', raised: 98700, subscribers: 280, color: '#22d9a0', events: ['Awareness Walk — Feb 20'] },
  { id: 3, name: 'Mind Mental Health', category: 'Wellbeing', description: 'Providing support to empower mental health awareness.', raised: 87200, subscribers: 210, color: '#f59e0b', events: ['Golf Day — Mar 8'] },
  { id: 4, name: 'British Heart Foundation', category: 'Health', description: 'Fighting heart diseases across the UK.', raised: 76500, subscribers: 190, color: '#ef4444', events: [] },
];

const CATEGORIES = ['All', 'Health', 'Youth', 'Wellbeing', 'Elderly', 'Rescue', 'Housing'];

export default function CharitiesPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = MOCK_CHARITIES.filter(c =>
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())) &&
    (category === 'All' || c.category === category)
  )

  return (
    <div className="min-h-screen bg-[#020617] text-white px-12 md:px-20 py-24">

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-indigo-400 text-xs uppercase tracking-widest mb-3">
          Charity Partners
        </p>
        <h1 className="text-4xl font-bold mb-4">
          Choose who you support ❤️
        </h1>
        <p className="text-white/60 text-sm">
          Every subscription funds real charities.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-10">
        <input
          className="w-full md:w-1/3 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white outline-none"
          placeholder="Search charities..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs ${
                category === cat
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div
            key={c.id}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 
                       hover:-translate-y-1 hover:shadow-xl transition"
          >
            <div className="flex justify-between mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ background: c.color }}
              >♥</div>

              <span className="text-xs px-2 py-1 rounded-full bg-white/10">
                {c.category}
              </span>
            </div>

            <h3 className="font-semibold text-lg mb-2">{c.name}</h3>

            <p className="text-sm text-white/60 mb-4">
              {c.description}
            </p>

            <div className="flex justify-between mb-4 text-sm">
              <div>
                <p className="text-white/40 text-xs">Raised</p>
                <p className="font-bold text-indigo-400">
                  £{c.raised.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-white/40 text-xs">Supporters</p>
                <p className="font-bold">{c.subscribers}</p>
              </div>
            </div>

            <Link
              to={`/charities/${c.id}`}
              className="block text-center py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-emerald-400"
            >
              View Profile →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}