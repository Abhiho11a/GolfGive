// src/pages/admin/AdminDashboard.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Mock Data ─────────────────────────────────────────────────
const STATS = {
  totalUsers: 2416, activeSubs: 2201,
  monthlyRev: 22008, charityTotal: 511200,
  drawsRun: 14, pendingVerifs: 3,
}

const USERS = [
  { id:1, name:'James Harrison', email:'james@example.com', plan:'yearly',  status:'active', charity:'Cancer Research UK',      scores:5, joined:'12 Mar 2024' },
  { id:2, name:'Sarah Mitchell', email:'sarah@example.com', plan:'monthly', status:'active', charity:'Mind Mental Health',       scores:4, joined:'01 Jun 2024' },
  { id:3, name:'David Thompson', email:'david@example.com', plan:'monthly', status:'lapsed', charity:'Action for Children',     scores:2, joined:'18 Jan 2024' },
  { id:4, name:'Emma Clarke',    email:'emma@example.com',  plan:'yearly',  status:'active', charity:'British Heart Foundation',scores:5, joined:'22 Aug 2024' },
  { id:5, name:'Robert Wilson',  email:'robert@example.com',plan:'monthly', status:'active', charity:'RNLI',                    scores:3, joined:'05 Nov 2024' },
  { id:6, name:'Lisa Evans',     email:'lisa@example.com',  plan:'yearly',  status:'active', charity:'Cancer Research UK',      scores:5, joined:'14 Sep 2024' },
]

const CHARITIES = [
  { id:1, name:'Cancer Research UK',       cat:'Health',    subs:340, donated:142400, status:'active' },
  { id:2, name:'Action for Children',       cat:'Youth',     subs:280, donated:98700,  status:'active' },
  { id:3, name:'Mind Mental Health',        cat:'Wellbeing', subs:210, donated:87200,  status:'active' },
  { id:4, name:'British Heart Foundation',  cat:'Health',    subs:190, donated:76500,  status:'active' },
  { id:5, name:'Age UK',                    cat:'Elderly',   subs:140, donated:54300,  status:'active' },
  { id:6, name:'RNLI',                      cat:'Rescue',    subs:120, donated:47800,  status:'active' },
]

const WINNERS = [
  { id:1, name:'James Harrison', draw:'December 2024', match:'5-Match', amount:4200, status:'pending',  proof:true  },
  { id:2, name:'Sarah Mitchell', draw:'December 2024', match:'4-Match', amount:1225, status:'paid',     proof:true  },
  { id:3, name:'Emma Clarke',    draw:'December 2024', match:'3-Match', amount:328,  status:'pending',  proof:false },
  { id:4, name:'Robert Wilson',  draw:'November 2024', match:'4-Match', amount:1108, status:'paid',     proof:true  },
  { id:5, name:'Lisa Evans',     draw:'November 2024', match:'3-Match', amount:312,  status:'rejected', proof:true  },
]

const NAV = [
  { id:'overview',  label:'Overview',    icon:'⊞' },
  { id:'users',     label:'Users',       icon:'👥' },
  { id:'draw',      label:'Draw Engine', icon:'🎯' },
  { id:'charities', label:'Charities',   icon:'♥'  },
  { id:'winners',   label:'Winners',     icon:'🏆' },
  { id:'reports',   label:'Reports',     icon:'📊' },
]

// ── Reusable Badge ─────────────────────────────────────────────
function Badge({ children, color = 'indigo' }) {
  const colors = {
    green:  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    red:    'bg-red-500/20 text-red-400 border border-red-500/30',
    amber:  'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    indigo: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
    gray:   'bg-white/10 text-white/50 border border-white/10',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ label, value, color, icon, sub }) {
  return (
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:-translate-y-1 hover:border-white/20 transition-all duration-300 overflow-hidden group">
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${color}`} />
      <div className="flex justify-between items-start mb-4">
        <span className="text-2xl">{icon}</span>
        {sub && <span className="text-xs text-white/40">{sub}</span>}
      </div>
      <div className="text-2xl font-extrabold text-white mb-1">{value}</div>
      <div className="text-xs text-white/50">{label}</div>
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none bg-white/2" />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// PANEL 1 — OVERVIEW
// ══════════════════════════════════════════════════════════════
function OverviewPanel() {
  const activity = [
    { msg:'James Harrison uploaded winner proof for December draw', time:'5 min ago', dot:'bg-emerald-400' },
    { msg:'Emma Clarke subscribed to Monthly plan',                  time:'23 min ago',dot:'bg-indigo-400'  },
    { msg:'December 2024 draw results published',                    time:'2 hrs ago', dot:'bg-amber-400'   },
    { msg:'Robert Wilson changed charity to RNLI',                   time:'4 hrs ago', dot:'bg-pink-400'    },
    { msg:'Sarah Mitchell paid — 4-match winner',                    time:'1 day ago', dot:'bg-emerald-400' },
  ]
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white mb-1">Overview</h1>
        <p className="text-white/50 text-sm">Platform health at a glance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Users"        value={STATS.totalUsers.toLocaleString()} color="bg-indigo-500"  icon="◎"  />
        <StatCard label="Active Subscribers" value={STATS.activeSubs.toLocaleString()} color="bg-emerald-500" icon="◉"  />
        <StatCard label="Monthly Revenue"    value={`£${STATS.monthlyRev.toLocaleString()}`} color="bg-amber-500" icon="£" />
        <StatCard label="Charity Donated"    value={`£${(STATS.charityTotal/1000).toFixed(0)}K`} color="bg-pink-500" icon="♥" />
        <StatCard label="Draws Run"          value={STATS.drawsRun}   color="bg-violet-500" icon="◈" />
        <StatCard label="Pending Verifs"     value={STATS.pendingVerifs} color="bg-red-500" icon="⚠" sub="needs action" />
      </div>

      {/* Recent activity */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-5">Recent Activity</h3>
        <div className="space-y-4">
          {activity.map(({ msg, time, dot }, i) => (
            <div key={i} className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
              <span className={`w-2 h-2 rounded-full ${dot} mt-1.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80">{msg}</p>
                <p className="text-xs text-white/40 mt-0.5">{time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// PANEL 2 — USER MANAGEMENT
// ══════════════════════════════════════════════════════════════
function UsersPanel() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [editUser, setEditUser] = useState(null)

  const filtered = USERS.filter(u => {
    const ms = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const mf = filter === 'all' || u.status === filter
    return ms && mf
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white mb-1">User Management</h1>
        <p className="text-white/50 text-sm">View and edit user profiles, scores, and subscriptions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-base">⌕</span>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-9 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
        <div className="flex gap-2">
          {['all','active','lapsed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${filter===f ? 'bg-indigo-600 text-white' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'}`}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_90px_80px_60px_130px] gap-3 px-5 py-3 border-b border-white/10">
          {['Name / Email','Charity','Plan','Status','Scores','Actions'].map(h => (
            <div key={h} className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</div>
          ))}
        </div>
        {filtered.map((u, i) => (
          <div key={u.id}
            className={`grid grid-cols-[1fr_1fr_90px_80px_60px_130px] gap-3 px-5 py-4 items-center transition hover:bg-white/5 ${i < filtered.length-1 ? 'border-b border-white/5' : ''}`}>
            <div>
              <div className="text-sm font-semibold text-white">{u.name}</div>
              <div className="text-xs text-white/40">{u.email}</div>
            </div>
            <div className="text-xs text-white/50 truncate">{u.charity}</div>
            <Badge color="indigo">{u.plan}</Badge>
            <Badge color={u.status === 'active' ? 'green' : 'red'}>
              <span className={`w-1.5 h-1.5 rounded-full ${u.status==='active'?'bg-emerald-400':'bg-red-400'}`} />
              {u.status}
            </Badge>
            <div className={`text-sm font-bold ${u.scores >= 5 ? 'text-emerald-400' : 'text-amber-400'}`}>{u.scores}/5</div>
            <div className="flex gap-2">
              <button onClick={() => setEditUser(u)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 text-xs font-medium hover:bg-indigo-600/50 transition">
                Edit
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 text-xs hover:text-white transition">
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={e => e.target===e.currentTarget && setEditUser(null)}>
          <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl p-7 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Edit User — {editUser.name}</h2>
              <button onClick={() => setEditUser(null)} className="text-white/40 hover:text-white text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wider">Full Name</label>
                <input defaultValue={editUser.name} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wider">Edit Scores</label>
                <div className="grid grid-cols-5 gap-2">
                  {[34,28,41,22,37].map((s,i) => (
                    <input key={i} type="number" defaultValue={s} min="1" max="45"
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-center text-white focus:outline-none focus:border-indigo-500 transition" />
                  ))}
                </div>
                <p className="text-xs text-white/30 mt-1.5">5 Stableford scores · range 1–45</p>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wider">Subscription Status</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition">
                  <option value="active">Active</option>
                  <option value="lapsed">Lapsed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-7">
              <button onClick={() => setEditUser(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white transition">Cancel</button>
              <button onClick={() => setEditUser(null)} className="flex-2 flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// PANEL 3 — DRAW ENGINE
// ══════════════════════════════════════════════════════════════
function DrawPanel() {
  const [drawType, setDrawType] = useState('random')
  const [simNums, setSimNums]   = useState(null)
  const [simming, setSimming]   = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [jackpot, setJackpot]   = useState(4800)
  const [p4, setP4]             = useState(4200)
  const [p3, setP3]             = useState(3000)

  function simulate() {
    setSimming(true); setSimNums(null); setPublished(false)
    setTimeout(() => {
      const n = []; while (n.length < 5) { const x = Math.floor(Math.random()*45)+1; if (!n.includes(x)) n.push(x) }
      setSimNums(n.sort((a,b)=>a-b)); setSimming(false)
    }, 1400)
  }

  function publish() {
    setPublishing(true)
    setTimeout(() => { setPublishing(false); setPublished(true) }, 1600)
  }

  const BALL_COLORS = [
    'from-indigo-500 to-violet-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-sky-500 to-blue-500',
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white mb-1">Draw Engine</h1>
        <p className="text-white/50 text-sm">Configure draw logic, run simulations, and publish results</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Config card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-5">Configuration</h3>

          <div className="space-y-5">
            <div>
              <label className="text-xs text-white/50 mb-2 block uppercase tracking-wider">Draw Month</label>
              <input type="month" defaultValue="2025-01"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition" />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-3 block uppercase tracking-wider">Draw Algorithm</label>
              <div className="grid grid-cols-2 gap-3">
                {[{id:'random',l:'Random',d:'Standard lottery draw'},{id:'algorithmic',l:'Algorithmic',d:'Weighted by score frequency'}].map(t => (
                  <div key={t.id} onClick={() => setDrawType(t.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${drawType===t.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-white">{t.l}</span>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${drawType===t.id ? 'border-indigo-500 bg-indigo-500' : 'border-white/20'}`}>
                        {drawType===t.id && <span className="text-white text-[8px] font-bold">✓</span>}
                      </div>
                    </div>
                    <p className="text-xs text-white/40">{t.d}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[['Jackpot Pool (£)', jackpot, setJackpot], ['4-Match Pool (£)', p4, setP4], ['3-Match Pool (£)', p3, setP3]].map(([l, v, sv]) => (
                <div key={l}>
                  <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">{l}</label>
                  <input type="number" value={v} onChange={e => sv(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Simulation card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-5">Simulation & Publish</h3>

          {/* Number display */}
          <div className="min-h-[110px] bg-black/30 rounded-xl flex items-center justify-center mb-5 border border-white/5">
            {simming ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-7 h-7 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-xs text-white/40">Generating draw…</span>
              </div>
            ) : simNums ? (
              <div className="flex flex-col items-center gap-3">
                <div className="text-[10px] text-white/30 uppercase tracking-widest">Simulated result</div>
                <div className="flex gap-3">
                  {simNums.map((n, i) => (
                    <div key={i}
                      className={`w-11 h-11 rounded-full bg-gradient-to-br ${BALL_COLORS[i]} flex items-center justify-center text-white font-extrabold text-sm shadow-lg`}
                      style={{ animation: `fadeUp 0.3s ease ${i*0.08}s both` }}>
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/30">Run a simulation to preview draw numbers</p>
            )}
          </div>

          <button onClick={simulate} disabled={simming}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition mb-3 flex items-center justify-center gap-2 disabled:opacity-50">
            {simming ? '⏳ Simulating…' : '▶ Run Simulation'}
          </button>

          {simNums && !published && (
            <button onClick={publish} disabled={publishing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 text-white text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 mb-4">
              {publishing ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Publishing…</> : '⬆ Publish Draw Results'}
            </button>
          )}

          {published && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-4 text-center mb-4">
              <div className="text-emerald-400 font-semibold text-sm">✓ Draw published successfully!</div>
              <div className="text-white/40 text-xs mt-1">Results sent to all subscribers</div>
            </div>
          )}

          {/* Projected winners */}
          {simNums && (
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Projected winners</div>
              <div className="grid grid-cols-3 gap-3">
                {[['5-Match',1,'text-indigo-400'],['4-Match',3,'text-emerald-400'],['3-Match',8,'text-amber-400']].map(([l,n,c]) => (
                  <div key={l} className="bg-black/20 rounded-xl p-3 text-center border border-white/5">
                    <div className={`text-2xl font-extrabold ${c}`}>{n}</div>
                    <div className="text-[10px] text-white/40 mt-1">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// PANEL 4 — CHARITY MANAGEMENT
// ══════════════════════════════════════════════════════════════
function CharitiesPanel() {
  const [charities, setCharities] = useState(CHARITIES)
  const [showAdd, setShowAdd]     = useState(false)
  const [form, setForm]           = useState({ name:'', category:'', description:'' })

  function addCharity() {
    if (!form.name || !form.category) return
    setCharities([...charities, { id: Date.now(), name: form.name, cat: form.category, subs: 0, donated: 0, status:'active' }])
    setForm({ name:'', category:'', description:'' })
    setShowAdd(false)
  }

  const CAT_COLORS = { Health:'indigo', Youth:'emerald', Wellbeing:'amber', Elderly:'violet', Rescue:'sky', Housing:'pink' }

  return (
    <div>
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Charity Management</h1>
          <p className="text-white/50 text-sm">Add, edit, delete charities and manage content & media</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition flex items-center gap-2">
          + Add Charity
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {charities.map(ch => (
          <div key={ch.id} className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
            {/* top strip */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-emerald-400" />
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-lg">♥</div>
                <Badge color="green">Active</Badge>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{ch.name}</h3>
              <Badge color={CAT_COLORS[ch.cat] || 'indigo'}>{ch.cat}</Badge>

              <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
                <div className="bg-black/20 rounded-xl p-3">
                  <div className="text-[10px] text-white/40 mb-1">Supporters</div>
                  <div className="text-base font-bold text-white">{ch.subs}</div>
                </div>
                <div className="bg-black/20 rounded-xl p-3">
                  <div className="text-[10px] text-white/40 mb-1">Donated</div>
                  <div className="text-sm font-bold text-emerald-400">£{ch.donated.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-medium hover:bg-indigo-600/40 transition">Edit</button>
                <button className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs hover:text-red-400 hover:border-red-500/30 transition">Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={e => e.target===e.currentTarget && setShowAdd(false)}>
          <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl p-7 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Add New Charity</h2>
              <button onClick={() => setShowAdd(false)} className="text-white/40 hover:text-white text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wider">Charity Name</label>
                <input value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="e.g. Cancer Research UK"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 transition" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wider">Category</label>
                <select value={form.category} onChange={e => setForm({...form,category:e.target.value})}
                  className="w-full bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition">
                  <option value="">Select category…</option>
                  {['Health','Youth','Wellbeing','Elderly','Rescue','Housing'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wider">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Brief description…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 transition resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white transition">Cancel</button>
              <button onClick={addCharity} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition">Add Charity</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// PANEL 5 — WINNERS MANAGEMENT
// ══════════════════════════════════════════════════════════════
function WinnersPanel() {
  const [winners, setWinners] = useState(WINNERS)
  const [filter, setFilter]   = useState('all')
  const [viewProof, setViewProof] = useState(null)

  const pending = winners.filter(w => w.status === 'pending').length
  const filtered = winners.filter(w => filter === 'all' || w.status === filter)

  function update(id, status) { setWinners(winners.map(w => w.id===id ? {...w, status} : w)) }

  const statusColor = { pending:'amber', paid:'green', rejected:'red', proof_submitted:'indigo' }
  const matchColor  = { '5-Match':'text-indigo-400', '4-Match':'text-emerald-400', '3-Match':'text-amber-400' }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white mb-1">Winners Management</h1>
        <p className="text-white/50 text-sm">View full winners list, verify submissions, mark payouts as completed</p>
      </div>

      {/* Alert banner */}
      {pending > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-amber-400 text-lg flex-shrink-0">⚠</span>
          <div>
            <div className="text-amber-400 font-semibold text-sm">{pending} verification{pending>1?'s':''} pending</div>
            <div className="text-white/50 text-xs mt-0.5">Review and approve winner submissions below</div>
          </div>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all','pending','paid','rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${filter===f ? 'bg-indigo-600 text-white' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white'}`}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      {/* Winner cards */}
      <div className="space-y-4">
        {filtered.map(w => (
          <div key={w.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition">
            <div className="flex flex-wrap justify-between items-center gap-4">

              {/* Left info */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-xl flex-shrink-0">
                  {w.match==='5-Match'?'🏆':w.match==='4-Match'?'🥈':'🥉'}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{w.name}</div>
                  <div className="text-xs text-white/40 mt-0.5">{w.draw} · <span className={`font-semibold ${matchColor[w.match]}`}>{w.match}</span></div>
                </div>
                <Badge color={statusColor[w.status] || 'gray'}>
                  {w.status === 'paid' && '✓ '}
                  {w.status === 'pending' && '⏳ '}
                  {w.status === 'rejected' && '✕ '}
                  {w.status.charAt(0).toUpperCase()+w.status.slice(1)}
                </Badge>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xl font-extrabold text-emerald-400">£{w.amount.toLocaleString()}</span>

                {w.proof
                  ? <button onClick={() => setViewProof(w)} className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-medium hover:bg-indigo-500/30 transition">View Proof</button>
                  : <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">No proof uploaded</span>
                }

                {w.status === 'pending' && w.proof && (
                  <div className="flex gap-2">
                    <button onClick={() => update(w.id,'paid')}
                      className="px-4 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/30 transition">
                      ✓ Approve & Pay
                    </button>
                    <button onClick={() => update(w.id,'rejected')}
                      className="px-4 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition">
                      ✕ Reject
                    </button>
                  </div>
                )}

                {w.status === 'paid' && (
                  <span className="text-xs text-white/30 italic">Paid ✓</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Proof modal */}
      {viewProof && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={e => e.target===e.currentTarget && setViewProof(null)}>
          <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl p-7 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-white">Winner Proof — {viewProof.name}</h2>
              <button onClick={() => setViewProof(null)} className="text-white/40 hover:text-white text-xl">✕</button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-center min-h-[180px] mb-5">
              <div className="text-center">
                <div className="text-4xl mb-3">🖼</div>
                <p className="text-white/40 text-sm">Screenshot proof uploaded</p>
                <p className="text-white/20 text-xs mt-1">{viewProof.draw} · {viewProof.match}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { update(viewProof.id,'rejected'); setViewProof(null) }}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition">Reject</button>
              <button onClick={() => { update(viewProof.id,'paid'); setViewProof(null) }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold hover:opacity-90 transition">Approve & Pay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// PANEL 6 — REPORTS & ANALYTICS
// ══════════════════════════════════════════════════════════════
function ReportsPanel() {
  const metrics = [
    { label:'Total Users',             value:'2,416',  change:'+12%',  good:true,  color:'text-indigo-400' },
    { label:'Active Subscribers',      value:'2,201',  change:'+8.4%', good:true,  color:'text-emerald-400' },
    { label:'Monthly Revenue',         value:'£22,008',change:'+5.1%', good:true,  color:'text-amber-400' },
    { label:'Total Prize Pool (YTD)',   value:'£284,400',change:'+9.2%',good:true, color:'text-violet-400' },
    { label:'Charity Contributions',   value:'£511,200',change:'+9.1%',good:true, color:'text-emerald-400' },
    { label:'Draws Run',               value:'14',     change:'3 jackpots rolled', good:null, color:'text-indigo-400' },
    { label:'Avg Match Rate (3+)',      value:'18.4%',  change:'+2.1%', good:true, color:'text-amber-400' },
    { label:'Pending Payouts',         value:'£4,528', change:'2 winners',good:null,color:'text-red-400' },
  ]

  const drawStats = [
    { month:'Dec 2024', five:1, four:3, three:8,  participants:2400 },
    { month:'Nov 2024', five:0, four:2, three:11, participants:2200 },
    { month:'Oct 2024', five:2, four:4, three:9,  participants:2100 },
    { month:'Sep 2024', five:1, four:3, three:7,  participants:1980 },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white mb-1">Reports & Analytics</h1>
        <p className="text-white/50 text-sm">Platform performance, financial summary, and draw statistics</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map(({ label, value, change, good, color }) => (
          <div key={label} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition">
            <div className="text-xs text-white/40 mb-3">{label}</div>
            <div className={`text-xl font-extrabold mb-2 ${color}`}>{value}</div>
            <div className={`text-xs font-medium ${good===true?'text-emerald-400':good===false?'text-red-400':'text-white/40'}`}>
              {good===true && '↑ '}{good===false && '↓ '}{change}
            </div>
          </div>
        ))}
      </div>

      {/* Draw stats table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-sm font-bold text-white">Draw Statistics</h3>
        </div>
        <div className="grid grid-cols-5 gap-3 px-6 py-3 border-b border-white/5">
          {['Month','5-Match','4-Match','3-Match','Participants'].map(h => (
            <div key={h} className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</div>
          ))}
        </div>
        {drawStats.map((d, i) => (
          <div key={d.month}
            className={`grid grid-cols-5 gap-3 px-6 py-4 items-center hover:bg-white/5 transition ${i < drawStats.length-1 ? 'border-b border-white/5' : ''}`}>
            <div className="text-sm font-semibold text-white">{d.month}</div>
            <div className={`text-sm font-bold ${d.five > 0 ? 'text-indigo-400' : 'text-white/20'}`}>{d.five > 0 ? d.five : '—'}</div>
            <div className="text-sm font-bold text-emerald-400">{d.four}</div>
            <div className="text-sm font-bold text-amber-400">{d.three}</div>
            <div className="text-sm text-white/50">{d.participants.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { isAdmin, loading, user, signOut } = useAuth()
  const navigate = useNavigate()
  const [panel, setPanel]   = useState('overview')
  const [sideOpen, setSideOpen] = useState(false)

  // In dev mode allow access — remove this guard in production
  // useEffect(() => { if (!loading && !isAdmin) navigate('/dashboard') }, [loading, isAdmin])

  const panels = {
    overview:  <OverviewPanel />,
    users:     <UsersPanel />,
    draw:      <DrawPanel />,
    charities: <CharitiesPanel />,
    winners:   <WinnersPanel />,
    reports:   <ReportsPanel />,
  }

  return (
    <div className="min-h-screen bg-[#020617] flex" style={{ paddingTop: 66 }}>

      {/* ── SIDEBAR ── */}
      {true && <aside className={`fixed top-[66px] left-0 bottom-0 z-40 flex flex-col
        w-60 bg-[#020617]/95 backdrop-blur-xl border-r border-white/8
        transition-transform duration-300
        ${sideOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        {/* Brand strip */}
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">A</div>
            <div>
              <div className="text-xs font-bold text-white">Admin Panel</div>
              <div className="text-[10px] text-white/30">GolfGive Platform</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[9px] text-white/20 font-semibold uppercase tracking-widest px-3 mb-3">Navigation</div>
          {NAV.map(item => (
            <button key={item.id} onClick={() => { setPanel(item.id); setSideOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                ${panel===item.id
                  ? 'bg-indigo-500/15 border border-indigo-500/25 text-indigo-300'
                  : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                }`}>
              <span className="text-base w-5 text-center ">{item.icon}</span>
              {item.label}
              {item.id === 'winners' && WINNERS.filter(w=>w.status==='pending').length > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                  {WINNERS.filter(w=>w.status==='pending').length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/8 space-y-1">
          <Link to="/dashboard"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition text-left">
            <span className="text-base w-5 text-center">←</span>
            User Dashboard
          </Link>
          <button onClick={async () => { await signOut(); navigate('/') }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition text-left">
            <span className="text-base w-5 text-center">⎋</span>
            Sign Out
          </button>
        </div>
      </aside>}

      {/* Mobile overlay */}
      {sideOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSideOpen(false)} />
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 lg:ml-60 min-w-0">

        {/* Top bar */}
        <div className="sticky top-[66px] z-20 bg-[#020617]/80 backdrop-blur-xl border-b border-white/8 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button onClick={() => setSideOpen(!sideOpen)} className="lg:hidden text-white/50 hover:text-white">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
            <div>
              <span className="text-xs text-white/30">Admin /</span>
              <span className="text-xs text-white/70 ml-1 font-medium">{NAV.find(n=>n.id===panel)?.label}</span>
            </div>
          </div>
        </div>

        {/* Panel content */}
        <main className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div key={panel} style={{ animation: 'fadeUp 0.35s ease' }}>
            {panels[panel]}
          </div>
        </main>
      </div>

      {/* fadeUp keyframe */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}