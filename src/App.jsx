import { useState, useRef, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Header         from './components/Header'
import Hero           from './components/Hero'
import Leaders        from './components/Leaders'
import Events         from './components/Events'
import AboutUs        from './components/AboutUs'
import Login          from './components/Login'
import Dashboard      from './components/Dashboard'
import HicomDashboard from './components/HicomDashboard'
import Footer         from './components/Footer'

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
