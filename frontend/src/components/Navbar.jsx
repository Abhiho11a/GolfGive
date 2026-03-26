import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = loggedUser?.role === "admin";

  const handleSignOut = async () => {
    await signOut()
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate('/')
  }

  const navLinks = [
    { label: 'How It Works', href: '/' },
    { label: 'Charities', href: '/charities' },
    { label: 'Draw', href: '/draw' },
    { label: 'Pricing', href: '/pricing' },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center text-white font-bold shadow-md">
            G
          </div>
          <span className="font-bold text-lg text-white">GolfGive</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className={`text-sm font-medium transition ${
                location.pathname === l.href
                  ? 'text-indigo-400'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full 
                           bg-white/10 hover:bg-white/20 transition backdrop-blur"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 text-white flex items-center justify-center text-sm font-bold">
                  {user.email?.[0]?.toUpperCase()}
                </div>

                <span className="text-sm font-medium text-white hidden sm:block">
                  {user.user_metadata?.full_name?.split(' ')[0] ||
                    user.email?.split('@')[0]}
                </span>
              </button>

              {/* Dropdown */}
              {dropOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#020617] border border-white/10 
                                rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-[fadeUp_0.2s_ease]">

                  {[
                    ...(isAdmin ? [{ label: 'Admin Panel', href: '/dashboard' }] : [{ label: 'Dashboard', href: '/dashboard' }]),
                    !isAdmin&&{ label: 'My Scores', href: '/dashboard/scores' },
                    { label: 'My Charity', href: '/dashboard/charity' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setDropOpen(false)}
                      className="block px-4 py-2 text-sm text-white/70 hover:bg-white/10"
                    >
                      {item.label}
                    </Link>
                  ))}

                  <div className="border-t border-white/10 my-1" />

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block text-sm text-white/60 hover:text-white">
                Sign In
              </Link>

              <Link
                to="/signup"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-400 
                           text-white text-sm font-semibold shadow-md hover:opacity-90 transition"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white text-xl">
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#020617] border-t border-white/10 px-4 py-3 space-y-2">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm text-white/70 hover:text-white py-2"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}