import { useState, useRef, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Header           from './components/Header'
import Hero             from './components/Hero'
import Leaders          from './components/Leaders'
import Events           from './components/Events'
import AboutUs          from './components/AboutUs'
import Login            from './components/Login'
import Dashboard        from './components/Dashboard'
import HicomDashboard   from './components/HicomDashboard'
import Footer           from './components/Footer'
import { ParallaxBand } from './components/Parallax'

export default function App() {
  const [page,      setPage]      = useState('home')
  const [user,      setUser]      = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const scrollTargetRef  = useRef(null)
  const intendedPageRef  = useRef(null)  // remembers where to redirect after login

  /* ── Firebase auth state listener ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setAuthReady(true)
    })
    return unsub
  }, [])

  /* ── Route protection: redirect unauthenticated users away from protected pages ── */
  useEffect(() => {
    if (!authReady) return
    if (!user && (page === 'dashboard' || page === 'hicom')) setPage('login')
  }, [user, page, authReady])

  /* ── After login, redirect to the page the user originally requested ── */
  useEffect(() => {
    if (user && page === 'login') {
      const target = intendedPageRef.current || 'dashboard'
      intendedPageRef.current = null
      setPage(target)
    }
  }, [user, page])

  /* ── Scroll to section after navigating back to home ── */
  useEffect(() => {
    if (page === 'home' && scrollTargetRef.current) {
      const id = scrollTargetRef.current
      scrollTargetRef.current = null
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 60)
    }
  }, [page])

  const navigate = (target) => {
    if (['about', 'login', 'home', 'dashboard', 'hicom'].includes(target)) {
      /* Guard: dashboard and hicom require login */
      if ((target === 'dashboard' || target === 'hicom') && !user) {
        intendedPageRef.current = target
        setPage('login')
        return
      }
      setPage(target)
    } else {
      scrollTargetRef.current = target
      setPage('home')
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    setPage('home')
  }

  /* Prevent content flash while Firebase resolves the session */
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#080F1E] flex items-center justify-center">
        <i className="fa-solid fa-circle-notch fa-spin text-[#C69C6D] text-3xl" />
      </div>
    )
  }

  const renderPage = () => {
    switch (page) {
      case 'about':
        return <AboutUs />
      case 'login':
        return <Login onSuccess={() => {}} />
      case 'dashboard':
        return user ? <Dashboard user={user} /> : null
      case 'hicom':
        return user ? <HicomDashboard user={user} /> : null
      default:
        return (
          <>
            {/* ── Parallax hero ─────────────────────────────── */}
            <Hero />

            {/* ── Parallax Band 1: ARMy Motto ──────────────── */}
            <ParallaxBand
              minHeight="46vh"
              speed={0.28}
              overlay="rgba(2,8,20,0.58)"
              bgStyle={{
                background: 'linear-gradient(150deg, #002B5B 0%, #071829 55%, #0D3A6E 100%)',
                backgroundImage:
                  'radial-gradient(circle, rgba(198,156,109,0.13) 1.5px, transparent 1.5px)',
                backgroundSize: '28px 28px',
              }}
            >
              <div className="flex items-center justify-center" style={{ minHeight: '46vh' }}>
                <div className="text-center px-6 py-20 max-w-3xl mx-auto">
                  <div
                    className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em]"
                    style={{ background: 'rgba(198,156,109,0.12)', border: '1px solid rgba(198,156,109,0.3)', color: '#C69C6D' }}
                  >
                    <i className="fa-solid fa-quote-left text-[9px]" /> ARMy Motto
                  </div>
                  <blockquote
                    className="text-4xl md:text-6xl font-black leading-tight mb-6"
                    style={{
                      background: 'linear-gradient(90deg, #C69C6D 0%, #E5C598 50%, #C69C6D 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    "Sharing is Rewarding"
                  </blockquote>
                  <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: 'rgba(219,234,254,0.65)' }}>
                    Success is never a solo journey. We thrive by passing down knowledge,
                    uplifting our fellow students, and building a collaborative ecosystem
                    where every shared idea sparks a new opportunity.
                  </p>
                </div>
              </div>
            </ParallaxBand>

            {/* ── Static section: Leadership ────────────────── */}
            <Leaders />

            {/* ── Parallax Band 2: Events CTA ──────────────── */}
            <ParallaxBand
              minHeight="40vh"
              speed={0.24}
              overlay="rgba(4,10,24,0.60)"
              bgStyle={{
                background: 'linear-gradient(225deg, #0D3A6E 0%, #080F1E 60%, #002B5B 100%)',
                backgroundImage:
                  'radial-gradient(circle, rgba(198,156,109,0.10) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
              }}
            >
              <div className="flex items-center justify-center" style={{ minHeight: '40vh' }}>
                <div className="text-center px-6 py-16 max-w-2xl mx-auto">
                  <p
                    className="text-[10px] font-black uppercase tracking-[0.3em] mb-4"
                    style={{ color: '#C69C6D' }}
                  >
                    <i className="fa-brands fa-instagram mr-2" />Instagram
                  </p>
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                    Explore Our Events
                  </h2>
                  <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(219,234,254,0.60)' }}>
                    Follow along as ARMy brings marketing education, networking, and
                    community experiences to life on campus.
                  </p>
                  <a
                    href="https://www.instagram.com/utp.army/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-black transition-all hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
                      color: 'white',
                      boxShadow: '0 6px 24px rgba(131,58,180,0.40)',
                    }}
                  >
                    <i className="fa-brands fa-instagram text-base" />
                    Follow @utp.army
                  </a>
                </div>
              </div>
            </ParallaxBand>

            {/* ── Static section: Events grid ──────────────── */}
            <main className="max-w-7xl mx-auto px-6 py-16">
              <Events />
            </main>
          </>
        )
    }
  }

  return (
    <div className="bg-[#080F1E] text-gray-800 antialiased">
      <Header
        onNavigate={navigate}
        currentPage={page}
        user={user}
        onLogout={handleLogout}
      />
      {renderPage()}
      <Footer />
    </div>
  )
}
