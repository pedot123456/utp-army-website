export default function Header({ onNavigate, currentPage, user, onLogout }) {
  const go = (target) => (e) => {
    e.preventDefault()
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
        </div>

        {/* Right — login / user session */}
        {user ? (
          /* ── Logged-in state ── */
          <div className="flex items-center gap-3">
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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
              currentPage === 'login'
                ? 'bg-[#C69C6D]/20 border-[#C69C6D]/50 text-[#C69C6D]'
                : 'bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-md'
            }`}
          >
            <i className="fa-solid fa-lock text-xs" /> Member Login
          </button>
        )}

      </nav>
    </header>
  )
}
