import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#020617] border-t border-white/10 text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">

        <div className="grid md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center font-bold">
                G
              </div>
              <span className="font-bold text-lg">GolfGive</span>
            </div>

            <p className="text-white/60 text-sm mb-4">
              Where every score drives real change. Play golf, win prizes, fund charities.
            </p>

            <div className="flex gap-3">
              {['♦','◈','◉'].map((i, idx) => (
                <div key={idx} className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer">
                  {i}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: 'Platform',
              links: [
                ['How It Works', '/#how-it-works'],
                ['Charities', '/charities'],
                ['Draw', '/draw'],
                ['Pricing', '/pricing'],
              ],
            },
            {
              title: 'Account',
              links: [
                ['Sign Up', '/signup'],
                ['Login', '/login'],
                ['Dashboard', '/dashboard'],
              ],
            },
            {
              title: 'Legal',
              links: [
                ['Privacy Policy', '/privacy'],
                ['Terms', '/terms'],
                ['Contact', '/contact'],
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="text-xs uppercase text-white/40 mb-4 tracking-widest">
                {section.title}
              </h4>

              {section.links.map(([label, href]) => (
                <Link
                  key={label}
                  to={href}
                  className="block text-sm text-white/60 hover:text-white mb-2 transition"
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 flex flex-wrap justify-between items-center gap-3 text-sm text-white/40">
          <p>© 2025 GolfGive. All rights reserved.</p>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}