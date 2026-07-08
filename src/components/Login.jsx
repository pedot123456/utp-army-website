import { useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

const FIREBASE_ERRORS = {
  'auth/invalid-email':        'Invalid email address.',
  'auth/user-not-found':       'No account found with this email.',
  'auth/wrong-password':       'Incorrect password.',
  'auth/invalid-credential':   'Invalid email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password':        'Password must be at least 6 characters.',
  'auth/too-many-requests':    'Too many attempts. Please try again later.',
  'auth/missing-email':        'Please enter your email address.',
}

function Field({ label, type = 'text', value, onChange, placeholder, autoComplete }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-[#C69C6D] tracking-[0.2em] uppercase mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onFocus={(e) => {
          e.target.style.border = '1px solid rgba(198,156,109,0.6)'
          e.target.style.background = 'rgba(255,255,255,0.07)'
        }}
        onBlur={(e) => {
          e.target.style.border = '1px solid rgba(255,255,255,0.1)'
          e.target.style.background = 'rgba(255,255,255,0.05)'
        }}
      />
    </div>
  )
}

export default function Login({ onSuccess }) {
  const [mode,      setMode]      = useState('login') // 'login' | 'signup' | 'forgot'
  const [fullName,  setFullName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const switchMode = (m) => {
    setMode(m)
    setFullName('')
    setEmail('')
    setPassword('')
    setError('')
    setResetSent(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
        onSuccess()
      } else if (mode === 'signup') {
        const { user } = await createUserWithEmailAndPassword(auth, email, password)

        /* Attach display name so the nav greeting works immediately */
        await updateProfile(user, { displayName: fullName })

        /* Persist member record in Firestore users collection */
        await setDoc(doc(db, 'users', user.uid), {
          name:     fullName,
          email,
          joinedAt: serverTimestamp(),
          role:     'member',
        })
        onSuccess()
      } else {
        /* Forgot password */
        await sendPasswordResetEmail(auth, email)
        setResetSent(true)
      }
    } catch (err) {
      setError(FIREBASE_ERRORS[err.code] ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 py-16 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #080F1E 0%, #0D1D3A 100%)' }}
    >
      {/* Ambient gold glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '520px', height: '320px',
          background: 'radial-gradient(ellipse, rgba(198,156,109,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative w-full max-w-md">

        {/* ── Card ── */}
        <div
          className="rounded-2xl overflow-hidden border border-white/10"
          style={{ background: '#0A1628', boxShadow: '0 30px 70px rgba(0,0,0,0.55)' }}
        >

          {/* Card header */}
          <div
            className="px-8 pt-8 pb-6 text-center"
            style={{ background: 'linear-gradient(135deg, #002B5B 0%, #0D3A6E 100%)' }}
          >
            <img
              src="/board/ARM_1.png"
              alt="ARMy"
              className="h-16 w-auto object-contain mx-auto mb-4 drop-shadow-lg"
              draggable={false}
            />
            <h1 className="text-white font-black text-xl tracking-wide">ARMy Member Portal</h1>
            <p className="text-white/35 text-xs mt-1 tracking-wide">
              Ambassador of Marketing Youth · UTP
            </p>
          </div>

          {/* Tab toggle — hidden in forgot mode */}
          {mode === 'forgot' ? (
            <div className="flex items-center gap-3 px-8 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="flex items-center gap-1.5 text-white/40 hover:text-[#C69C6D] transition-colors text-xs font-bold"
              >
                <i className="fa-solid fa-arrow-left text-[10px]" />
                Back to Log In
              </button>
              <span className="text-white/15 text-xs">·</span>
              <span className="text-white/50 text-sm font-bold">Reset Password</span>
            </div>
          ) : (
            <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {[
                { key: 'login',  label: 'Log In' },
                { key: 'signup', label: 'Sign Up' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchMode(key)}
                  className={`flex-1 py-3.5 text-sm font-bold tracking-wide transition-all ${
                    mode === key
                      ? 'text-[#C69C6D]'
                      : 'text-white/35 hover:text-white/60'
                  }`}
                  style={mode === key ? {
                    borderBottom: '2px solid #C69C6D',
                    marginBottom: '-1px',
                  } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">

            {/* ── Forgot password mode ── */}
            {mode === 'forgot' ? (
              resetSent ? (
                /* Success screen */
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ background: 'rgba(198,156,109,0.12)', border: '1px solid rgba(198,156,109,0.3)' }}>
                    <i className="fa-solid fa-envelope-circle-check text-[#C69C6D] text-2xl" />
                  </div>
                  <h3 className="text-white font-black text-lg mb-2">Check Your Inbox</h3>
                  <p className="text-white/45 text-sm leading-relaxed max-w-xs mx-auto">
                    A password reset link has been sent to<br />
                    <span className="text-[#C69C6D] font-semibold break-all">{email}</span>.
                  </p>
                  <p className="text-white/25 text-xs mt-3">Didn't receive it? Check your spam folder.</p>
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="mt-7 gold-gradient px-8 py-3 rounded-xl text-sm font-black hover:-translate-y-0.5 transition-all"
                    style={{ color: '#1a0e00' }}
                  >
                    Back to Log In
                  </button>
                </div>
              ) : (
                /* Forgot password input */
                <>
                  <p className="text-white/40 text-sm leading-relaxed -mt-1">
                    Enter your registered email address and we'll send you a link to reset your password.
                  </p>
                  <Field
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="Enter your registered email"
                    autoComplete="email"
                  />
                  {error && (
                    <div className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <i className="fa-solid fa-circle-exclamation text-red-400 text-sm mt-0.5 shrink-0" />
                      <p className="text-red-400 text-sm leading-snug">{error}</p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full gold-gradient font-black py-3.5 rounded-xl shadow-lg hover:shadow-[0_8px_30px_rgba(198,156,109,0.4)] hover:-translate-y-0.5 transition-all duration-200 text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    style={{ color: '#1a0e00' }}
                  >
                    {loading
                      ? <><i className="fa-solid fa-circle-notch fa-spin" /> Sending…</>
                      : <><i className="fa-solid fa-paper-plane" /> Send Reset Link</>}
                  </button>
                </>
              )
            ) : (
              /* ── Login / Sign Up mode ── */
              <>
                {mode === 'signup' && (
                  <Field
                    label="Full Name"
                    value={fullName}
                    onChange={setFullName}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                )}

                <Field
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="Enter your email"
                  autoComplete="email"
                />

                <div>
                  <Field
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder={mode === 'signup' ? 'Create a password (min. 6 chars)' : 'Enter your password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                  {mode === 'login' && (
                    <div className="mt-2 text-right">
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-white/35 hover:text-[#C69C6D] text-xs font-semibold transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <i className="fa-solid fa-circle-exclamation text-red-400 text-sm mt-0.5 shrink-0" />
                    <p className="text-red-400 text-sm leading-snug">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full gold-gradient font-black py-3.5 rounded-xl shadow-lg hover:shadow-[0_8px_30px_rgba(198,156,109,0.4)] hover:-translate-y-0.5 transition-all duration-200 text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={{ color: '#1a0e00' }}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin" />
                      {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                    </>
                  ) : (
                    mode === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </button>

                <p className="text-center text-white/35 text-xs">
                  {mode === 'login' ? "Don't have an account? " : 'Already a member? '}
                  <button
                    type="button"
                    onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-[#C69C6D] font-bold hover:underline"
                  >
                    {mode === 'login' ? 'Sign Up' : 'Log In'}
                  </button>
                </p>
              </>
            )}

          </form>
        </div>

        <p className="text-center text-white/20 text-[11px] mt-6 tracking-wide">
          ARMy © 2025/2026 · Universiti Teknologi PETRONAS
        </p>
      </div>
    </div>
  )
}
