// src/pages/HomePage.jsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

// Animated number counter
function Counter({ target, prefix = '', suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const ease = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(ease * target))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

const CHARITIES = [
  { name: 'Cancer Research UK', category: 'Health', raised: '£142,400', color: '#7c6aff', desc: 'Funding breakthrough cancer treatments worldwide' },
  { name: 'Action for Children', category: 'Youth', raised: '£98,700', color: '#22d9a0', desc: 'Protecting vulnerable children across the UK' },
  { name: 'Mind Mental Health', category: 'Wellbeing', raised: '£87,200', color: '#f5a623', desc: 'Supporting people with mental health challenges' },
  { name: 'British Heart Foundation', category: 'Health', raised: '£76,500', color: '#ff5b5b', desc: 'Fighting heart and circulatory diseases' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Subscribe', desc: 'Choose monthly or yearly. A portion goes to your chosen charity from day one.', icon: '◎', color: '#7c6aff' },
  { step: '02', title: 'Enter Scores', desc: 'Log your last 5 Stableford scores. The system keeps only your most recent — always fresh.', icon: '◈', color: '#22d9a0' },
  { step: '03', title: 'Monthly Draw', desc: 'Five numbers are drawn each month. Match 3, 4, or all 5 and you win your prize tier.', icon: '◉', color: '#f5a623' },
  { step: '04', title: 'Everyone Wins', desc: 'Even if you don\'t match — your charity gets funded. The platform gives back, always.', icon: '♥', color: '#ff5b5b' },
]

export default function HomePage() {
  const [activeCharity, setActiveCharity] = useState(0)

  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-32 overflow-hidden bg-[#020617]">

        {/* BACKGROUND GLOW */}
        <div className="absolute w-[700px] h-[700px] bg-indigo-500/30 rounded-full blur-[120px] top-20 left-1/2 -translate-x-1/2" />
        <div className="absolute w-[300px] h-[300px] bg-emerald-400/20 rounded-full blur-[100px] bottom-20 left-10" />

        {/* BADGE */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-8 backdrop-blur">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          £406,800 raised this year
        </div>

        {/* HEADING */}
        <h1 className="text-center font-extrabold text-4xl md:text-6xl lg:text-7xl leading-tight mb-6 text-white">
          Play Golf.<br />

          <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Win Prizes.
          </span><br />

          <span className="text-white/80">
            Fund Change.
          </span>
        </h1>

        {/* SUBTEXT */}
        <p className="text-center max-w-xl text-lg text-white/70 mb-10">
          Subscribe, log scores, win prizes — and support charities automatically.
          Every month. Every score.
        </p>

        {/* BUTTONS */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link
            to="/signup"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg"
          >
            Start for £9.99/month →
          </Link>

          <Link
            to="/pricing"
            className="px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 transition"
          >
            See Plans
          </Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ['2,400+', 'Subscribers'],
            ['£406K+', 'Donated'],
            ['12', 'Charities'],
            ['48', 'Winners'],
          ].map(([val, label]) => (
            <div key={label}>
              <div className="text-2xl font-bold text-white">{val}</div>
              <div className="text-sm text-white/60">{label}</div>
            </div>
          ))}
        </div>

        {/* SCROLL INDICATOR */}
        <div className="absolute bottom-8 flex flex-col items-center text-xs text-white/50">
          Scroll
          <div className="w-5 h-8 border border-white/40 rounded-full flex justify-center mt-2">
            <div className="w-1 h-2 bg-white rounded animate-bounce mt-1"></div>
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="py-24 px-4 bg-[#020617]">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-widest text-indigo-400 mb-3">
                Real Impact
              </p>

              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Numbers that matter
              </h2>
            </div>

            {/* Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { value: 406800, prefix: '£', suffix: '+', label: 'Donated', color: 'text-emerald-400', icon: '♥' },
                { value: 2400, suffix: '+', label: 'Subscribers', color: 'text-indigo-400', icon: '◎' },
                { value: 284, label: 'Winners', color: 'text-amber-400', icon: '◈' },
                { value: 12, label: 'Charities', color: 'text-red-400', icon: '♦' },
              ].map(({ value, prefix = '', suffix = '', label, color, icon }) => (
                <div
                  key={label}
                  className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 text-center 
                            border border-white/10 shadow-lg 
                            hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >

                  {/* Glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition pointer-events-none bg-white/5" />

                  {/* Icon */}
                  <div className="text-2xl mb-2 text-white/70">{icon}</div>

                  {/* Value */}
                  <div className={`text-3xl font-extrabold ${color}`}>
                    <Counter target={value} prefix={prefix} suffix={suffix} />
                  </div>

                  {/* Label */}
                  <div className="text-sm text-white/60 mt-2">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-28 px-4 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="text-center mb-16">
              <p className="text-xs font-semibold tracking-widest text-emerald-500 uppercase mb-3">
                Simple Process
              </p>

              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Four steps to change
              </h2>
            </div>

            {/* Steps */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOW_IT_WORKS.map(({ step, title, desc, icon, color }, i) => (
                <div
                  key={step}
                  className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 
                            bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl
                            p-6 transition-all duration-300
                            hover:-translate-y-2 hover:shadow-xl"
                  style={{
                    animation: `fadeUp 0.5s ease ${i * 0.1}s both`
                  }}
                >

                  {/* Big step number */}
                  <div
                    className="absolute top-4 right-4 text-5xl font-extrabold opacity-10"
                    style={{ color }}
                  >
                    {step}
                  </div>

                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4"
                    style={{
                      background: `${color}20`,
                      color: color
                    }}
                  >
                    {icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {desc}
                  </p>

                  {/* Bottom progress line */}
                  <div className="mt-6 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 group-hover:w-full"
                      style={{
                        width: '30%',
                        background: `linear-gradient(90deg, ${color}, #6366f1)`
                      }}
                    />
                  </div>

                  {/* Glow effect */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none"
                    style={{
                      boxShadow: `0 0 50px ${color}25`
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

      {/* ── FEATURED CHARITIES ── */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-950">
  <div className="max-w-7xl mx-auto">

    {/* Header */}
    <div className="flex flex-wrap justify-between items-end gap-6 mb-12">
      <div>
        <p className="text-xs font-semibold tracking-widest text-amber-500 uppercase mb-3">
          Charity Partners
        </p>

        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
          Your subscription helps
        </h2>
      </div>

      <Link
        to="/charities"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
      >
        Browse all →
      </Link>
    </div>

    {/* Cards */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {CHARITIES.map(({ name, category, raised, color, desc }, i) => (
        <div
          key={name}
          onClick={() => setActiveCharity(i)}
          className={`group relative cursor-pointer rounded-2xl border transition-all duration-300
            ${
              activeCharity === i
                ? 'border-indigo-500 shadow-lg -translate-y-1'
                : 'border-slate-200 dark:border-slate-800 hover:shadow-md hover:-translate-y-1'
            }
            bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl
          `}
        >

          {/* Gradient top strip */}
          <div
            className="h-1.5 w-full rounded-t-2xl"
            style={{
              background: `linear-gradient(90deg, ${color}, #6366f1)`
            }}
          />

          <div className="p-6">

            {/* Top row */}
            <div className="flex justify-between items-start mb-4">
              <span
                className="text-[11px] font-semibold px-2 py-1 rounded-full"
                style={{
                  background: `${color}15`,
                  color: color
                }}
              >
                {category}
              </span>

              <span
                className="text-sm font-bold"
                style={{ color: color }}
              >
                {raised}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {name}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
              {desc}
            </p>

            {/* Bottom */}
            <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
              <span>via GolfGive</span>

              <span className="opacity-0 group-hover:opacity-100 transition">
                →
              </span>
            </div>
          </div>

          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none"
            style={{
              boxShadow: `0 0 40px ${color}20`
            }}
          />
        </div>
      ))}
    </div>
  </div>
</section>

      {/* ── DRAW PREVIEW ── */}
      {/* ───────── DRAW SECTION ───────── */}
<section className="py-24 px-4 bg-[#020617] text-white">
  <div className="max-w-5xl mx-auto text-center">

    <p className="text-xs uppercase tracking-widest text-indigo-400 mb-3">
      Monthly Draw
    </p>

    <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
      Win up to <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">£4,000/month</span>
    </h2>

    <p className="text-white/60 max-w-xl mx-auto mb-12">
      Five numbers are drawn every month. Match 3, 4, or all 5 to win.  
      Jackpot rolls over if unclaimed.
    </p>

    {/* Balls */}
    <div className="flex flex-wrap justify-center gap-5 mb-12">
      {[12, 28, 34, 41, 7].map((num, i) => (
        <div
          key={num}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-xl font-bold 
                     bg-gradient-to-br from-indigo-500 to-emerald-400 
                     shadow-lg hover:scale-110 transition"
        >
          {num}
        </div>
      ))}
    </div>

    {/* Prize Cards */}
    <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
      {[
        { match: "5 Match", share: "40%", type: "Jackpot" },
        { match: "4 Match", share: "35%", type: "Prize Pool" },
        { match: "3 Match", share: "25%", type: "Prize Pool" },
      ].map((item) => (
        <div
          key={item.match}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 
                     hover:-translate-y-1 hover:shadow-xl transition"
        >
          <div className="text-3xl font-extrabold text-indigo-400 mb-2">
            {item.share}
          </div>
          <div className="text-sm font-semibold">{item.match}</div>
          <div className="text-xs text-white/60">{item.type}</div>
        </div>
      ))}
    </div>

    <Link
      to="/signup"
      className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-400 
                 hover:opacity-90 transition font-semibold shadow-lg"
    >
      Join the draw →
    </Link>
  </div>
</section>


{/* ───────── TESTIMONIALS ───────── */}
<section className="py-20 px-4 bg-[#020617] text-white border-t border-white/10">
  <div className="max-w-6xl mx-auto">

    <h2 className="text-center text-3xl font-bold mb-12">
      Members love it ❤️
    </h2>

    <div className="grid md:grid-cols-3 gap-6">
      {[
        { name: 'James H.', location: 'Edinburgh', quote: "I track my scores anyway — now my subscription funds Cancer Research.", won: '£320 won' },
        { name: 'Sarah M.', location: 'Bristol', quote: "Won the 4-match in January. My charity got funded too!", won: '£680 won' },
        { name: 'David T.', location: 'Manchester', quote: "Finally a golf platform that doesn’t look like 1998.", won: '£140 won' },
      ].map((t) => (
        <div
          key={t.name}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 
                     hover:-translate-y-1 hover:shadow-xl transition"
        >
          <div className="text-yellow-400 mb-3">★★★★★</div>

          <p className="text-white/70 text-sm mb-6 italic">
            "{t.quote}"
          </p>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{t.name}</p>
              <p className="text-xs text-white/50">{t.location}</p>
            </div>

            <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400">
              {t.won}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>


{/* ───────── FINAL CTA ───────── */}
<section className="py-28 px-4 text-center bg-[#020617] text-white relative overflow-hidden">

  {/* Glow BG */}
  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-emerald-400/10 blur-3xl" />

  <h2 className="text-4xl md:text-6xl font-extrabold mb-6 relative z-10">
    Ready to make every<br />
    <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
      score count?
    </span>
  </h2>

  <p className="text-white/60 mb-10 max-w-xl mx-auto relative z-10">
    Join 2,400+ golfers winning prizes and funding charities every month.
  </p>

  <div className="flex flex-wrap justify-center gap-4 relative z-10">
    <Link
      to="/signup"
      className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-400 
                 font-semibold shadow-lg hover:opacity-90 transition"
    >
      Start for £9.99/month
    </Link>

    <Link
      to="/charities"
      className="px-8 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition"
    >
      Explore charities
    </Link>
  </div>

  <p className="text-xs text-white/40 mt-6 relative z-10">
    Cancel anytime. 10% goes to charity.
  </p>
</section>
    </div>
  )
}