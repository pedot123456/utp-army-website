import { useState, useEffect, useCallback } from 'react'
import {
  collection, addDoc, getDocs, doc, updateDoc,
  serverTimestamp, query, orderBy, where,
} from 'firebase/firestore'
import { db } from '../firebase'

/* ══════════════════════════════════════════════
   SHARED INPUT PRIMITIVES
══════════════════════════════════════════════ */
const inputBase  = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
const inputFocus = { border: '1px solid rgba(198,156,109,0.6)', background: 'rgba(255,255,255,0.07)' }
const inputError = { border: '1px solid rgba(239,68,68,0.5)', background: 'rgba(255,255,255,0.05)' }

function FieldLabel({ children, optional }) {
  return (
    <label className="flex items-center gap-2 text-[11px] font-bold text-[#C69C6D] tracking-[0.2em] uppercase mb-2">
      {children}
      {optional && (
        <span className="text-white/25 normal-case tracking-normal font-normal text-[10px]">optional</span>
      )}
    </label>
  )
}

function DarkInput({ type = 'text', value, onChange, placeholder, required = true, autoFocus, hasError }) {
  const base = hasError ? inputError : inputBase
  return (
    <input
      type={type} value={value} placeholder={placeholder}
      required={required} autoFocus={autoFocus}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none transition-all"
      style={base}
      onFocus={e => Object.assign(e.target.style, hasError ? inputError : inputFocus)}
      onBlur={e => Object.assign(e.target.style, base)}
    />
  )
}

function DarkSelect({ value, onChange, options, placeholder, required = true }) {
  return (
    <select
      value={value} required={required}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all appearance-none"
      style={{ ...inputBase, color: value ? 'white' : 'rgba(255,255,255,0.25)' }}
      onFocus={e => Object.assign(e.target.style, inputFocus)}
      onBlur={e => Object.assign(e.target.style, inputBase)}
    >
      <option value="" disabled style={{ background: '#0A1628' }}>{placeholder}</option>
      {options.map(o => (
        <option key={o} value={o} style={{ background: '#0A1628', color: 'white' }}>{o}</option>
      ))}
    </select>
  )
}

function DarkTextarea({ value, onChange, placeholder, rows = 3, required = false }) {
  return (
    <textarea
      value={value} placeholder={placeholder} rows={rows} required={required}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none transition-all resize-none"
      style={inputBase}
      onFocus={e => Object.assign(e.target.style, inputFocus)}
      onBlur={e => Object.assign(e.target.style, inputBase)}
    />
  )
}

/* ══════════════════════════════════════════════
   TOAST SYSTEM
══════════════════════════════════════════════ */
function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4500) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    if (duration > 0) setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), [])
  return { toasts, addToast, removeToast }
}

const TOAST_STYLES = {
  error:   { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.4)',   color: '#f87171', icon: 'fa-circle-exclamation' },
  success: { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.4)',   color: '#4ade80', icon: 'fa-circle-check'       },
  info:    { bg: 'rgba(198,156,109,0.15)', border: 'rgba(198,156,109,0.4)', color: '#C69C6D', icon: 'fa-circle-info'        },
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const s = TOAST_STYLES[t.type] || TOAST_STYLES.info
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-2xl text-sm font-semibold min-w-[290px] max-w-[420px]"
            style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, backdropFilter: 'blur(16px)' }}
          >
            <i className={`fa-solid ${s.icon} mt-0.5 shrink-0`} />
            <span className="flex-grow leading-snug">{t.message}</span>
            <button onClick={() => onRemove(t.id)} className="opacity-50 hover:opacity-100 transition shrink-0 ml-1">
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════ */
const HICOM_PIN    = 'ARMy2025'
const MEETING_PIN  = '123'
const SESSION_KEY  = 'hicom_unlocked'

const STUDY_LEVELS = ['Undergraduate', 'Foundation']

const COURSES = [
  'Integrated Engineering',
  'Chemical Engineering',
  'Civil Engineering',
  'Computer Engineering',
  'Electrical and Electronics Engineering',
  'Material Engineering',
  'Petroleum Engineering',
  'Business Management',
  'Computer Science',
  'Information System',
  'Information Technology',
  'Applied Chemistry',
  'Petroleum Geoscience',
]

const YEAR_SEMS = [
  'Year 1 Sem 1', 'Year 1 Sem 2', 'Year 1 Sem 3',
  'Year 2 Sem 1', 'Year 2 Sem 2', 'Year 2 Sem 3',
  'Year 3 Sem 1', 'Year 3 Sem 2', 'Year 3 Sem 3',
  'Year 4 Sem 1', 'Year 4 Sem 2', 'Year 4 Sem 3',
]

const POSITIONS = [
  'President',
  'Deputy President',
  'General Secretary',
  'Assistant General Secretary',
  'Treasurer',
  'Head of Department Human Resources',
  'Head of Department Public Relation',
  'Head of Department Economy and Entrepreneurship',
  'Head of Department Media and Promotion',
  'Assistant Head of Department Human Resources',
  'Assistant Head of Department Public Relation',
  'Assistant Head of Department Economy and Entrepreneurship',
  'Assistant Head of Department Media and Promotion',
]

const STATUS_STYLE = {
  Pending:  { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.35)',  text: '#fbbf24', icon: 'fa-clock',        rowBg: 'transparent'          },
  Approved: { bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.35)',   text: '#4ade80', icon: 'fa-circle-check', rowBg: 'rgba(34,197,94,0.04)' },
  Rejected: { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.35)',   text: '#f87171', icon: 'fa-circle-xmark', rowBg: 'rgba(239,68,68,0.04)' },
}

/* ══════════════════════════════════════════════
   PART 1 — PIN GATE  (ARMy2025)
══════════════════════════════════════════════ */
function PinGate({ onUnlock }) {
  const [pin,     setPin]     = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 380))
    if (pin === HICOM_PIN) {
      sessionStorage.setItem(SESSION_KEY, '1')
      onUnlock()
    } else {
      setError('Incorrect PIN. Access denied.')
      setPin('')
    }
    setLoading(false)
  }

  const borderStyle = error ? inputError : inputBase

  return (
    <div className="min-h-screen bg-[#080F1E] flex items-center justify-center p-4">
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(198,156,109,0.07) 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,56,101,0.5) 0%, transparent 65%)' }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #002B5B, #0D3A6E)', border: '1px solid rgba(198,156,109,0.25)', boxShadow: '0 0 48px rgba(198,156,109,0.12)' }}
          >
            <i className="fa-solid fa-shield-halved text-[#C69C6D] text-3xl" />
          </div>
          <h1 className="text-white font-black text-3xl mb-2">Restricted Access</h1>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
            This area is reserved for ARMy HICOM members only.<br />Enter your access PIN to continue.
          </p>
        </div>

        <div className="rounded-2xl p-8"
          style={{ background: '#0A1628', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 64px rgba(0,0,0,0.55)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <FieldLabel>Access PIN</FieldLabel>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin} placeholder="Enter HICOM access PIN"
                  required autoComplete="off" autoFocus
                  onChange={e => { setPin(e.target.value); if (error) setError('') }}
                  className="w-full rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/25 focus:outline-none transition-all pr-11 tracking-widest"
                  style={borderStyle}
                  onFocus={e => !error && Object.assign(e.target.style, inputFocus)}
                  onBlur={e => Object.assign(e.target.style, borderStyle)}
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPin(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1"
                >
                  <i className={`fa-solid ${showPin ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm">
                <i className="fa-solid fa-circle-exclamation shrink-0" />{error}
              </div>
            )}

            <button
              type="submit" disabled={loading || !pin}
              className="w-full gold-gradient py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(198,156,109,0.4)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ color: '#1a0e00' }}
            >
              {loading ? <><i className="fa-solid fa-circle-notch fa-spin" /> Verifying…</> : <><i className="fa-solid fa-unlock-keyhole" /> Unlock Portal</>}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
            <p className="text-white/20 text-xs">
              <i className="fa-solid fa-lock text-[10px] mr-1.5" />ARMy HICOM Internal Portal — Confidential
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   ORGANIZER MEETING PIN MODAL  (PIN: 123)
══════════════════════════════════════════════ */
function ActionPinModal({ action, onClose, onConfirm }) {
  const [pin,     setPin]     = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const isApprove   = action.status === 'Approved'
  const accentColor = isApprove ? '#4ade80' : '#f87171'
  const accentBg    = isApprove ? 'rgba(34,197,94,0.12)'  : 'rgba(239,68,68,0.12)'
  const accentBdr   = isApprove ? 'rgba(34,197,94,0.35)'  : 'rgba(239,68,68,0.35)'
  const actionIcon  = isApprove ? 'fa-circle-check'       : 'fa-circle-xmark'
  const actionLabel = isApprove ? 'Approve'               : 'Reject'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (pin !== MEETING_PIN) {
      setError('Incorrect PIN. Action cancelled.')
      setPin('')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onConfirm()
    } catch {
      setError('Failed to update status. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10"
        style={{ background: '#0A1628', boxShadow: '0 32px 72px rgba(0,0,0,0.7)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-white/[0.08] gap-4">
          <div>
            <h2 className="text-white font-black text-lg">Confirm Action</h2>
            <p className="text-white/35 text-xs mt-0.5">
              {actionLabel}:{' '}
              <span style={{ color: accentColor }}>{action.name}</span>
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition mt-0.5 shrink-0">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Action context banner */}
          <div className="flex items-center gap-3 rounded-xl px-4 py-3.5"
            style={{ background: accentBg, border: `1px solid ${accentBdr}` }}>
            <i className={`fa-solid ${actionIcon} shrink-0`} style={{ color: accentColor }} />
            <p className="text-sm leading-snug" style={{ color: accentColor }}>
              Enter the <strong>Organizer Meeting PIN</strong> to confirm this action.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <FieldLabel>Organizer Meeting PIN</FieldLabel>
              <input
                type="password" value={pin} required autoFocus
                onChange={e => { setPin(e.target.value); if (error) setError('') }}
                placeholder="Enter meeting PIN"
                className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none transition-all tracking-widest"
                style={error ? inputError : inputBase}
                onFocus={e => Object.assign(e.target.style, error ? inputError : inputFocus)}
                onBlur={e => Object.assign(e.target.style, error ? inputError : inputBase)}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm">
                <i className="fa-solid fa-circle-exclamation shrink-0" />{error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition">
                Cancel
              </button>
              <button
                type="submit" disabled={loading || !pin}
                className="flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: accentBg, border: `1px solid ${accentBdr}`, color: accentColor }}
              >
                {loading
                  ? <><i className="fa-solid fa-circle-notch fa-spin" /> Please wait…</>
                  : <><i className={`fa-solid ${isApprove ? 'fa-check' : 'fa-xmark'}`} /> {actionLabel}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   CANDIDATE SECTION CARD (reusable in form)
══════════════════════════════════════════════ */
function CandidateSection({ label, optional, values, onFieldChange, errors = {} }) {
  const f = (field) => (val) => onFieldChange(field, val)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${optional ? 'rgba(255,255,255,0.08)' : 'rgba(198,156,109,0.22)'}` }}
    >
      {/* Section header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{
          background:   optional ? 'rgba(255,255,255,0.03)' : 'rgba(198,156,109,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-black"
          style={{
            background: optional ? 'rgba(255,255,255,0.08)' : 'rgba(198,156,109,0.15)',
            color:      optional ? 'rgba(255,255,255,0.4)'  : '#C69C6D',
            border:     `1px solid ${optional ? 'rgba(255,255,255,0.12)' : 'rgba(198,156,109,0.3)'}`,
          }}
        >
          {optional ? '2' : '1'}
        </div>
        <div>
          <span className="text-white font-bold text-sm">{label}</span>
          {optional && <span className="text-white/30 text-xs ml-2">— optional</span>}
        </div>
      </div>

      {/* Fields */}
      <div className="p-5 space-y-4" style={{ background: 'rgba(0,0,0,0.12)' }}>

        {/* Row 1: Full Name + Student ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Full Name</FieldLabel>
            <DarkInput
              value={values.fullName} onChange={f('fullName')}
              placeholder="e.g. Muhammad Ali bin Hassan"
              required={!optional} hasError={!!errors.fullName}
            />
            {errors.fullName && <p className="text-red-400 text-[11px] mt-1.5 ml-1">{errors.fullName}</p>}
          </div>
          <div>
            <FieldLabel>Student ID</FieldLabel>
            <DarkInput
              value={values.studentId} onChange={f('studentId')}
              placeholder="e.g. 23005678"
              required={!optional} hasError={!!errors.studentId}
            />
            {errors.studentId && <p className="text-red-400 text-[11px] mt-1.5 ml-1">{errors.studentId}</p>}
          </div>
        </div>

        {/* Row 2: Study Level + Course */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Study Level</FieldLabel>
            <DarkSelect
              value={values.studyLevel} onChange={f('studyLevel')}
              options={STUDY_LEVELS} placeholder="Select study level"
              required={!optional}
            />
            {errors.studyLevel && <p className="text-red-400 text-[11px] mt-1.5 ml-1">{errors.studyLevel}</p>}
          </div>
          <div>
            <FieldLabel>Course / Program</FieldLabel>
            <DarkSelect
              value={values.course} onChange={f('course')}
              options={COURSES} placeholder="Select course or program"
              required={!optional}
            />
            {errors.course && <p className="text-red-400 text-[11px] mt-1.5 ml-1">{errors.course}</p>}
          </div>
        </div>

        {/* Row 3: Year / Sem + Internship */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Current Year & Semester</FieldLabel>
            <DarkSelect
              value={values.yearSem} onChange={f('yearSem')}
              options={YEAR_SEMS} placeholder="Select year & semester"
              required={!optional}
            />
            {errors.yearSem && <p className="text-red-400 text-[11px] mt-1.5 ml-1">{errors.yearSem}</p>}
          </div>
          <div>
            <FieldLabel>Expected Internship Year / Semester</FieldLabel>
            <DarkInput
              value={values.internship} onChange={f('internship')}
              placeholder="e.g. 2027, May"
              required={!optional} hasError={!!errors.internship}
            />
            {errors.internship && <p className="text-red-400 text-[11px] mt-1.5 ml-1">{errors.internship}</p>}
          </div>
        </div>

        {/* Row 4: Justification (always optional) */}
        <div>
          <FieldLabel optional>Justification</FieldLabel>
          <DarkTextarea
            value={values.justification} onChange={f('justification')}
            placeholder="Describe why this candidate is suitable — their skills, contributions, leadership qualities, and potential…"
            rows={3}
          />
        </div>

      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   PART 2 — NOMINATION FORM
══════════════════════════════════════════════ */
const BLANK_C    = { fullName: '', studentId: '', studyLevel: '', course: '', yearSem: '', internship: '', justification: '' }
const BLANK_FORM = { position: '', c1: { ...BLANK_C }, c2: { ...BLANK_C } }

function NominationForm({ user, onSubmitted, addToast }) {
  const [form,          setForm]          = useState(BLANK_FORM)
  const [loading,       setLoading]       = useState(false)
  const [errors,        setErrors]        = useState({ c1: {}, c2: {} })
  const [pledgeChecked, setPledgeChecked] = useState(false)

  const setGlobal = (field) => (val) => setForm(prev => ({ ...prev, [field]: val }))

  const makeSectionHandler = (section) => (field, val) => {
    setForm(prev => ({ ...prev, [section]: { ...prev[section], [field]: val } }))
    if (errors[section]?.[field]) {
      setErrors(prev => ({ ...prev, [section]: { ...prev[section], [field]: '' } }))
    }
  }
  const handleC1 = makeSectionHandler('c1')
  const handleC2 = makeSectionHandler('c2')

  const validate = () => {
    const c2Errs   = {}
    const c2Active = !!form.c2.fullName.trim()

    if (c2Active) {
      if (!form.c2.studentId.trim())  c2Errs.studentId = 'Required.'
      if (!form.c2.studyLevel)        c2Errs.studyLevel = 'Required.'
      if (!form.c2.course)            c2Errs.course     = 'Required.'
      if (!form.c2.yearSem)           c2Errs.yearSem    = 'Required.'
      if (!form.c2.internship.trim()) c2Errs.internship = 'Required.'
      if (
        form.c2.studentId.trim() &&
        form.c2.studentId.trim() === form.c1.studentId.trim()
      ) {
        c2Errs.studentId = 'Same Student ID as Candidate 1.'
      }
    }
    return { c1: {}, c2: c2Errs }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs.c2).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const c1Id     = form.c1.studentId.trim()
      const c2Active = !!form.c2.fullName.trim()
      const c2Id     = form.c2.studentId.trim()
      const idsToCheck = (c2Active && c2Id) ? [c1Id, c2Id] : [c1Id]

      /* Duplicate check */
      const dupSnap = await getDocs(
        query(collection(db, 'kpi_evaluations'), where('studentId', 'in', idsToCheck))
      )
      if (!dupSnap.empty) {
        addToast('A candidate with this Student ID has already been nominated.', 'error')
        setLoading(false)
        return
      }

      const meta = {
        position:         form.position,
        status:           'Pending',
        nominatedBy:      user.displayName || user.email,
        nominatedByEmail: user.email,
        createdAt:        serverTimestamp(),
      }

      /* Save Candidate 1 */
      await addDoc(collection(db, 'kpi_evaluations'), {
        ...meta,
        fullName:      form.c1.fullName.trim(),
        studentId:     c1Id,
        studyLevel:    form.c1.studyLevel,
        course:        form.c1.course,
        yearSem:       form.c1.yearSem,
        internship:    form.c1.internship.trim(),
        justification: form.c1.justification.trim(),
      })

      /* Save Candidate 2 if provided */
      if (c2Active) {
        await addDoc(collection(db, 'kpi_evaluations'), {
          ...meta,
          fullName:      form.c2.fullName.trim(),
          studentId:     c2Id,
          studyLevel:    form.c2.studyLevel,
          course:        form.c2.course,
          yearSem:       form.c2.yearSem,
          internship:    form.c2.internship.trim(),
          justification: form.c2.justification.trim(),
        })
        addToast(`Both candidates nominated for ${form.position}!`, 'success')
      } else {
        addToast(`${form.c1.fullName.trim()} nominated for ${form.position}!`, 'success')
      }

      setForm(BLANK_FORM)
      setErrors({ c1: {}, c2: {} })
      setPledgeChecked(false)
      onSubmitted()
    } catch {
      addToast('Failed to save nomination. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{ background: '#0A1628', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}
    >
      {/* Card header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(198,156,109,0.1)', border: '1px solid rgba(198,156,109,0.25)' }}>
          <i className="fa-solid fa-user-tie text-[#C69C6D]" />
        </div>
        <div>
          <h2 className="text-white font-black text-lg">Nominate Candidate(s)</h2>
          <p className="text-white/35 text-xs mt-0.5">Submit up to two nominations per position for HICOM review.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Target Position — global to both candidates */}
        <div>
          <FieldLabel>Target Position</FieldLabel>
          <DarkSelect value={form.position} onChange={setGlobal('position')}
            options={POSITIONS} placeholder="Select target position" />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <span className="text-white/30 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">Candidates</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Candidate 1 */}
        <CandidateSection
          label="Candidate 1" optional={false}
          values={form.c1} onFieldChange={handleC1} errors={errors.c1}
        />

        {/* Candidate 2 */}
        <CandidateSection
          label="Candidate 2" optional
          values={form.c2} onFieldChange={handleC2} errors={errors.c2}
        />

        {/* Integrity Pledge */}
        <label
          className="flex items-start gap-3 rounded-xl px-5 py-4 cursor-pointer select-none transition-all"
          style={{
            background: pledgeChecked ? 'rgba(198,156,109,0.07)' : 'rgba(255,255,255,0.03)',
            border:     `1px solid ${pledgeChecked ? 'rgba(198,156,109,0.35)' : 'rgba(255,255,255,0.1)'}`,
          }}
        >
          <input type="checkbox" checked={pledgeChecked}
            onChange={e => setPledgeChecked(e.target.checked)} className="sr-only" />
          <span
            className="flex-shrink-0 w-5 h-5 rounded-md mt-0.5 flex items-center justify-center transition-all"
            style={{
              background: pledgeChecked ? 'linear-gradient(135deg,#C69C6D,#E5C598)' : 'rgba(255,255,255,0.05)',
              border:     `1px solid ${pledgeChecked ? 'transparent' : 'rgba(255,255,255,0.2)'}`,
              boxShadow:  pledgeChecked ? '0 2px 8px rgba(198,156,109,0.4)' : 'none',
            }}
          >
            {pledgeChecked && <i className="fa-solid fa-check text-[10px] font-black" style={{ color: '#1a0e00' }} />}
          </span>
          <span className="text-sm leading-relaxed" style={{ color: pledgeChecked ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)' }}>
            I hereby declare that this nomination is made with honesty, integrity, and strictly in the best interest of the club. I confirm that the details provided are accurate to the best of my knowledge.
          </span>
        </label>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit" disabled={loading || !pledgeChecked}
            className="gold-gradient px-8 py-3.5 rounded-xl text-sm font-black flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(198,156,109,0.4)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{ color: '#1a0e00' }}
          >
            {loading
              ? <><i className="fa-solid fa-circle-notch fa-spin" /> Submitting…</>
              : <><i className="fa-solid fa-paper-plane" /> Submit Nomination</>}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ══════════════════════════════════════════════
   PART 4 — CANDIDATE REVIEW TABLE
══════════════════════════════════════════════ */
function CandidateTable({ candidates, loading, onStatusChange, addToast }) {
  const [pendingAction, setPendingAction] = useState(null)

  const handleActionClick = (candidate, newStatus) => {
    setPendingAction({ id: candidate.id, status: newStatus, name: candidate.fullName })
  }

  const executeAction = async () => {
    const { id, status, name } = pendingAction
    await updateDoc(doc(db, 'kpi_evaluations', id), { status })
    onStatusChange(id, status, name)
    setPendingAction(null)
  }

  if (loading) {
    return (
      <div className="rounded-2xl text-center py-24"
        style={{ background: '#0A1628', border: '1px solid rgba(255,255,255,0.08)' }}>
        <i className="fa-solid fa-circle-notch fa-spin text-[#C69C6D] text-2xl" />
        <p className="text-white/30 text-sm mt-3">Loading candidates…</p>
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="rounded-2xl text-center py-24"
        style={{ background: '#0A1628', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="w-14 h-14 rounded-full bg-[#C69C6D]/10 border border-[#C69C6D]/20 flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-users text-[#C69C6D] text-xl" />
        </div>
        <p className="text-white/40 font-semibold">No nominations yet</p>
        <p className="text-white/25 text-xs mt-1">Use the form above to nominate a candidate.</p>
      </div>
    )
  }

  const COL_HEADERS = ['#', 'Candidate', 'Student ID', 'Study Level', 'Course', 'Year / Sem', 'Internship', 'Position', 'Status', 'Actions']

  return (
    <>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: '1100px' }}>
            <thead>
              <tr style={{ background: 'rgba(0,43,91,0.85)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {COL_HEADERS.map(h => (
                  <th key={h}
                    className="text-left text-[10px] font-bold text-[#C69C6D] tracking-[0.18em] uppercase px-4 py-4 whitespace-nowrap first:pl-5 last:pr-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, i) => {
                const st = STATUS_STYLE[c.status] || STATUS_STYLE.Pending
                return (
                  <tr key={c.id} className="transition-colors hover:bg-white/[0.02]"
                    style={{ background: st.rowBg, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

                    {/* # */}
                    <td className="px-5 py-4 text-white/25 text-xs font-mono">{i + 1}</td>

                    {/* Candidate */}
                    <td className="px-4 py-4" style={{ maxWidth: '180px' }}>
                      <div className="text-white font-bold whitespace-nowrap truncate">{c.fullName}</div>
                      {c.nominatedBy && (
                        <div className="text-white/30 text-[11px] mt-0.5 truncate" style={{ maxWidth: '160px' }}>
                          <i className="fa-solid fa-user-pen text-[9px] mr-1" />{c.nominatedBy}
                        </div>
                      )}
                    </td>

                    {/* Student ID */}
                    <td className="px-4 py-4 text-white/60 font-mono text-xs whitespace-nowrap">{c.studentId}</td>

                    {/* Study Level */}
                    <td className="px-4 py-4 text-white/55 text-xs whitespace-nowrap">{c.studyLevel || '—'}</td>

                    {/* Course */}
                    <td className="px-4 py-4 text-white/55 text-xs" style={{ maxWidth: '140px' }}>
                      <div className="truncate" title={c.course}>{c.course || '—'}</div>
                    </td>

                    {/* Year / Sem */}
                    <td className="px-4 py-4 text-white/55 text-xs whitespace-nowrap">{c.yearSem || '—'}</td>

                    {/* Internship */}
                    <td className="px-4 py-4 text-white/55 text-xs whitespace-nowrap">{c.internship || '—'}</td>

                    {/* Position */}
                    <td className="px-4 py-4" style={{ maxWidth: '160px' }}>
                      <span
                        className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-black leading-snug"
                        style={{ background: 'rgba(198,156,109,0.12)', border: '1px solid rgba(198,156,109,0.25)', color: '#C69C6D' }}
                        title={c.position}
                      >
                        {c.position || '—'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black whitespace-nowrap"
                        style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.text }}>
                        <i className={`fa-solid ${st.icon} text-[9px]`} />{c.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 pr-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleActionClick(c, 'Approved')}
                          disabled={c.status === 'Approved'}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-black flex items-center gap-1.5 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 whitespace-nowrap"
                          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}
                        >
                          <i className="fa-solid fa-check text-[10px]" /> Approve
                        </button>
                        <button
                          onClick={() => handleActionClick(c, 'Rejected')}
                          disabled={c.status === 'Rejected'}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-black flex items-center gap-1.5 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 whitespace-nowrap"
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
                        >
                          <i className="fa-solid fa-xmark text-[10px]" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {pendingAction && (
        <ActionPinModal
          action={pendingAction}
          onClose={() => setPendingAction(null)}
          onConfirm={executeAction}
        />
      )}
    </>
  )
}

/* ══════════════════════════════════════════════
   CSV EXPORT
══════════════════════════════════════════════ */
function downloadCSV(candidates) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`

  const headers = [
    '#', 'Full Name', 'Student ID', 'Study Level', 'Course / Program',
    'Current Year & Semester', 'Expected Internship', 'Target Position',
    'Justification', 'Status', 'Nominated By', 'Submitted At',
  ]

  const rows = candidates.map((c, i) => [
    i + 1, esc(c.fullName), esc(c.studentId), esc(c.studyLevel), esc(c.course),
    esc(c.yearSem), esc(c.internship), esc(c.position), esc(c.justification),
    esc(c.status), esc(c.nominatedBy), esc(c.createdAt?.toDate?.()?.toLocaleString('en-MY') ?? 'N/A'),
  ].join(','))

  const csv  = [headers.map(esc).join(','), ...rows].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), {
    href: url, download: `ARMy_HICOM_Meeting_Report_${new Date().toISOString().split('T')[0]}.csv`,
  })
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/* ══════════════════════════════════════════════
   STATS ROW
══════════════════════════════════════════════ */
function StatsRow({ candidates }) {
  const total    = candidates.length
  const pending  = candidates.filter(c => c.status === 'Pending').length
  const approved = candidates.filter(c => c.status === 'Approved').length
  const rejected = candidates.filter(c => c.status === 'Rejected').length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[
        { label: 'Total Nominees', value: total,    color: '#C69C6D', icon: 'fa-users'       },
        { label: 'Pending',        value: pending,  color: '#fbbf24', icon: 'fa-clock'        },
        { label: 'Approved',       value: approved, color: '#4ade80', icon: 'fa-circle-check' },
        { label: 'Rejected',       value: rejected, color: '#f87171', icon: 'fa-circle-xmark' },
      ].map(({ label, value, color, icon }) => (
        <div key={label} className="rounded-2xl p-5"
          style={{ background: '#0A1628', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-2">
            <i className={`fa-solid ${icon} text-xs`} style={{ color }} />
            <span className="text-white/35 text-[11px] font-bold uppercase tracking-widest">{label}</span>
          </div>
          <div className="text-3xl font-black" style={{ color }}>{value}</div>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN EXPORT — HICOM DASHBOARD
══════════════════════════════════════════════ */
export default function HicomDashboard({ user }) {
  const [unlocked,   setUnlocked]   = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [candidates, setCandidates] = useState([])
  const [loading,    setLoading]    = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'kpi_evaluations'), orderBy('createdAt', 'desc')))
      setCandidates(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch {
      addToast('Failed to load candidates from the database.', 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { if (unlocked) fetchCandidates() }, [unlocked, fetchCandidates])

  const handleStatusChange = useCallback((id, newStatus, name) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    addToast(
      `${name} has been ${newStatus === 'Approved' ? 'approved' : 'rejected'}.`,
      newStatus === 'Approved' ? 'success' : 'error',
    )
  }, [addToast])

  /* Show PIN gate (user is already verified as logged-in by App.jsx) */
  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />

  return (
    <div className="min-h-screen bg-[#080F1E]">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ── Banner ── */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #002B5B 0%, #0D3A6E 100%)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div aria-hidden="true" className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(198,156,109,0.12) 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
        <div aria-hidden="true" className="absolute right-0 top-0 h-full w-1/3 opacity-10"
          style={{ background: 'radial-gradient(ellipse at 100% 50%, #C69C6D 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <i className="fa-solid fa-shield-halved text-[#C69C6D] text-xs" />
              <span className="text-[#C69C6D] text-[10px] font-black tracking-[0.25em] uppercase">HICOM Internal Portal</span>
            </div>
            <h1 className="text-white font-black text-3xl md:text-4xl leading-tight">Promotion & Selection</h1>
            <p className="text-white/35 text-sm mt-1">New Tenure Candidate Review — ARMy HICOM Confidential</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <button onClick={fetchCandidates}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <i className="fa-solid fa-rotate-right text-xs" /> Refresh
            </button>
            <button
              onClick={() => downloadCSV(candidates)} disabled={candidates.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(198,156,109,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ background: 'linear-gradient(135deg,#002B5B,#0D3A6E)', border: '1px solid rgba(198,156,109,0.35)', color: '#C69C6D' }}>
              <i className="fa-solid fa-file-csv" /> Download Meeting Report (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {!loading && candidates.length > 0 && <StatsRow candidates={candidates} />}

        <NominationForm user={user} onSubmitted={fetchCandidates} addToast={addToast} />

        <div>
          <div className="mb-5">
            <h2 className="text-white font-black text-xl">Candidate Review</h2>
            <p className="text-white/35 text-xs mt-0.5">
              Live view for meeting projection —{' '}
              <span className="text-[#C69C6D] font-bold">{candidates.length}</span>{' '}
              nomination{candidates.length !== 1 ? 's' : ''}
            </p>
          </div>
          <CandidateTable
            candidates={candidates} loading={loading}
            onStatusChange={handleStatusChange} addToast={addToast}
          />
        </div>

      </div>
    </div>
  )
}
