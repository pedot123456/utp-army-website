import { useState, useRef, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Header    from './components/Header'
import Hero      from './components/Hero'
import Leaders   from './components/Leaders'
import Events    from './components/Events'
import AboutUs   from './components/AboutUs'
import Login     from './components/Login'
import Dashboard from './components/Dashboard'
import Footer    from './components/Footer'

export default function App() {
  const [page,      setPage]      = useState('home')
  const [user,      setUser]      = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const scrollTargetRef = useRef(null)

  /* ── Firebase auth state listener ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setAuthReady(true)
    })
    return unsub
  }, [])

  /* ── Route protection: redirect unauthenticated users away from dashboard ── */
  useEffect(() => {
    if (!authReady) return
    if (!user && page === 'dashboard') setPage('login')
  }, [user, page, authReady])

  /* ── After login, send user to dashboard ── */
  useEffect(() => {
    if (user && page === 'login') setPage('dashboard')
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
    if (['about', 'login', 'home', 'dashboard'].includes(target)) {
      /* Guard: dashboard requires login */
      if (target === 'dashboard' && !user) { setPage('login'); return }
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
        return <Login onSuccess={() => setPage('dashboard')} />
      case 'dashboard':
        return user ? <Dashboard user={user} /> : null
      default:
        return (
          <>
            <Hero />
            <Leaders />
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
