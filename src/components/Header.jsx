import { useState } from 'react'

export default function Header({ onNavigate, currentPage, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const go = (target) => (e) => {
    e.preventDefault()
    setMenuOpen(false)
    onNavigate(target)
  }

  /* First letter of display name or email as avatar initial */
  const initial = user?.displayName?.[0]?.toUpperCase()
             ?? user?.email?.[0]?.toUpperCase()
             ?? '?'

  /* First name only for the greeting */
  const firstName = user?.displayName?.split(' ')[0] ?? 'Member'

  return (
    <header className="sticky top-0 z-30 w-full bg-[#003865] border-b border-white/15 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo — always goes home */}
        <button onClick={go('home')} className="flex items-center gap-3 focus:outline-none">
          <img
            src="/board/ARM_1.png"
            alt="ARMy Logo"
            className="h-12 w-auto object-contain drop-shadow-md"
          />
          <span className="text-white font-bold text-xl tracking-wide ml-2">ARMy</span>
        </button>

        {/* Centre nav links */}
        <div className="hidden md:flex gap-8 text-white/80 font-medium text-sm">
          {user && (
            <button
              onClick={go('dashboard')}
              className={`hover:text-white transition-colors ${currentPage === 'dashboard' ? 'text-[#C69C6D]' : ''}`}
            >
              Dashboard
            </button>
          )}
          <button
            onClick={go('about')}
            className={`hover:text-white transition-colors ${currentPage === 'about' ? 'text-[#C69C6D]' : ''}`}
          >
            About Us
          </button>
          <a
            href={currentPage === 'home' ? '#events' : undefined}
            onClick={currentPage !== 'home' ? go('events') : undefined}
            className="hover:text-white transition-colors"
          >
            Events
          </a>
          <a
            href={currentPage === 'home' ? '#leadership' : undefined}
            onClick={currentPage !== 'home' ? go('leadership') : undefined}
            className="hover:text-white transition-colors"
          >
            Leadership
          </a>
          <button
            onClick={go('hicom')}
            className={`hover:text-white transition-colors ${currentPage === 'hicom' ? 'text-[#C69C6D]' : ''}`}
          >
            Admin
          </button>
        </div>

        {/* Hamburger — mobile only */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Right — login / user session (desktop only; mobile handled inside dropdown) */}
        {user ? (
          /* ── Logged-in state ── */
          <div className="hidden md:flex items-center gap-3">
            {/* Avatar + name */}
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#C69C6D]/20 border border-[#C69C6D]/50 flex items-center justify-center">
                <span className="text-[#C69C6D] text-xs font-black">{initial}</span>
              </div>
              <span className="text-white/70 text-sm font-medium">{firstName}</span>
            </div>

            {/* Log out button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border"
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderColor: 'rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.85)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background     = 'rgba(239,68,68,0.15)'
                e.currentTarget.style.borderColor    = 'rgba(239,68,68,0.4)'
                e.currentTarget.style.color          = '#f87171'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background     = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.borderColor    = 'rgba(255,255,255,0.18)'
                e.currentTarget.style.color          = 'rgba(255,255,255,0.85)'
              }}
            >
              <i className="fa-solid fa-right-from-bracket text-xs" />
              Log Out
            </button>
          </div>
        ) : (
          /* ── Logged-out state ── */
          <button
            onClick={go('login')}
            className={`hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
              currentPage === 'login'
                ? 'bg-[#C69C6D]/20 border-[#C69C6D]/50 text-[#C69C6D]'
                : 'bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-md'
            }`}
          >
            <i className="fa-solid fa-lock text-xs" /> Member Login
          </button>
        )}

      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/15 bg-[#002a4d]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
            {user && (
              <button
                onClick={go('dashboard')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-[#C69C6D]/20 text-[#C69C6D]'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                Dashboard
              </button>
            )}
            <button
              onClick={go('about')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'about'
                  ? 'bg-[#C69C6D]/20 text-[#C69C6D]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              About Us
            </button>
            <a
              href={currentPage === 'home' ? '#events' : undefined}
              onClick={currentPage !== 'home' ? go('events') : () => setMenuOpen(false)}
              className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              Events
            </a>
            <a
              href={currentPage === 'home' ? '#leadership' : undefined}
              onClick={currentPage !== 'home' ? go('leadership') : () => setMenuOpen(false)}
              className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              Leadership
            </a>
            <button
              onClick={go('hicom')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'hicom'
                  ? 'bg-[#C69C6D]/20 text-[#C69C6D]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              Admin
            </button>

            {/* Divider */}
            <div className="my-2 border-t border-white/10" />

            {/* Login / logout in mobile menu */}
            {user ? (
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#C69C6D]/20 border border-[#C69C6D]/50 flex items-center justify-center">
                    <span className="text-[#C69C6D] text-xs font-black">{initial}</span>
                  </div>
                  <span className="text-white/70 text-sm font-medium">{firstName}</span>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); onLogout() }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white/80 border border-white/20 bg-white/06 hover:bg-red-500/15 hover:border-red-400/40 hover:text-red-400 transition-all"
                >
                  <i className="fa-solid fa-right-from-bracket text-xs" />
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={go('login')}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold bg-[#C69C6D]/20 border border-[#C69C6D]/50 text-[#C69C6D] hover:bg-[#C69C6D]/30 transition-all"
              >
                <i className="fa-solid fa-lock text-xs" /> Member Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
