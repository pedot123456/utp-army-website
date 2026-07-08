import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc,
  serverTimestamp, query, orderBy, where,
} from 'firebase/firestore'
import { db } from '../firebase'

/* ══════════════════════════════════════════════
   TOAST SYSTEM
══════════════════════════════════════════════ */
function ToastContainer({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-semibold shadow-2xl pointer-events-auto"
          style={{
            background: t.type === 'error' ? 'rgba(30,10,10,0.97)' : 'rgba(10,28,18,0.97)',
            border: `1px solid ${t.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.35)'}`,
            backdropFilter: 'blur(12px)',
            color: t.type === 'error' ? '#f87171' : '#86efac',
            maxWidth: '360px',
          }}
        >
          <i className={`fa-solid ${t.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'} shrink-0`} />
          <span className="leading-snug">{t.message}</span>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════
   SHARED UI PRIMITIVES
══════════════════════════════════════════════ */

function FieldLabel({ children }) {
  return (
    <label className="block text-[11px] font-bold text-[#C69C6D] tracking-[0.2em] uppercase mb-2">
      {children}
    </label>
  )
}

const inputBase = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
}
const inputFocus = {
  border: '1px solid rgba(198,156,109,0.6)',
  background: 'rgba(255,255,255,0.07)',
}

function DarkInput({ type = 'text', value, onChange, placeholder, required = true, autoComplete, readOnly }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      autoComplete={autoComplete}
      readOnly={readOnly}
      className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none transition-all"
      style={{ ...inputBase, ...(readOnly ? { opacity: 0.6, cursor: 'default' } : {}) }}
      onFocus={e => { if (!readOnly) Object.assign(e.target.style, inputFocus) }}
      onBlur={e => { if (!readOnly) Object.assign(e.target.style, inputBase) }}
    />
  )
}

function DarkTextarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      required
      className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none transition-all resize-none"
      style={inputBase}
      onFocus={e => Object.assign(e.target.style, inputFocus)}
      onBlur={e => Object.assign(e.target.style, inputBase)}
    />
  )
}

function DarkSelect({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      required
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

function GoldButton({ loading, loadingLabel, label, disabled }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="flex-1 gold-gradient py-3 rounded-xl text-sm font-black transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(198,156,109,0.35)] flex items-center justify-center gap-2 disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      style={{ color: '#1a0e00' }}
    >
      {loading ? (
        <><i className="fa-solid fa-circle-notch fa-spin" />{loadingLabel}</>
      ) : label}
    </button>
  )
}

function ErrorBanner({ msg }) {
  if (!msg) return null
  return (
    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm">
      <i className="fa-solid fa-circle-exclamation mt-0.5 shrink-0" />
      {msg}
    </div>
  )
}

function Modal({ title, subtitle, onClose, children, maxWidth = 'max-w-lg' }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(5px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={`relative w-full ${maxWidth} max-h-[92vh] overflow-y-auto rounded-2xl border border-white/10`}
        style={{ background: '#0A1628', boxShadow: '0 32px 72px rgba(0,0,0,0.65)' }}
      >
        {title && (
          <div className="flex items-start justify-between px-6 py-5 border-b border-white/8 gap-4">
            <div>
              <h2 className="text-white font-black text-lg leading-snug">{title}</h2>
              {subtitle && <p className="text-white/35 text-xs mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition mt-0.5"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        )}
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   CREATE EVENT MODAL
══════════════════════════════════════════════ */
function CreateEventModal({ user, onClose, onCreated }) {
  const [title,       setTitle]       = useState('')
  const [startDate,   setStartDate]   = useState('')
  const [endDate,     setEndDate]     = useState('')
  const [description, setDescription] = useState('')
  const [securityPin, setSecurityPin] = useState('')
  const [status,      setStatus]      = useState('Upcoming')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (endDate && endDate < startDate) {
      setError('End date cannot be before the start date.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await addDoc(collection(db, 'events'), {
        title,
        startDate,
        endDate:       endDate || startDate,
        description,
        status,
        deletionPin:   securityPin,
        createdBy:     user.uid,
        createdByName: user.displayName || user.email,
        createdAt:     serverTimestamp(),
      })
      onCreated()
    } catch {
      setError('Failed to create event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Create New Event" subtitle="Event will be visible to all members immediately." onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <FieldLabel>Event Title</FieldLabel>
          <DarkInput value={title} onChange={setTitle} placeholder="e.g. ARMy Networking Night 2026" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Start Date</FieldLabel>
            <DarkInput type="date" value={startDate} onChange={setStartDate} />
          </div>
          <div>
            <FieldLabel>End Date</FieldLabel>
            <DarkInput type="date" value={endDate} onChange={setEndDate} required={false} />
          </div>
        </div>
        <p className="text-white/25 text-[11px] -mt-2">Leave End Date blank for a single-day event.</p>

        <div>
          <FieldLabel>Description</FieldLabel>
          <DarkTextarea value={description} onChange={setDescription} placeholder="Brief description of the event, venue, requirements…" />
        </div>

        <div>
          <FieldLabel>Event Status</FieldLabel>
          <DarkSelect value={status} onChange={setStatus} options={['Upcoming', 'Ongoing', 'Completed']} placeholder="Select status" />
        </div>

        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(198,156,109,0.06)', border: '1px solid rgba(198,156,109,0.2)' }}>
          <div className="flex items-center gap-2 mb-1">
            <i className="fa-solid fa-shield-halved text-[#C69C6D] text-xs" />
            <span className="text-[#C69C6D] text-[11px] font-black tracking-widest uppercase">Security PIN</span>
          </div>
          <DarkInput
            value={securityPin}
            onChange={setSecurityPin}
            placeholder="Set a PIN to protect deletion and participant data"
          />
          <p className="text-white/25 text-[11px]">Required to delete this event or download participant data. Keep it safe — it cannot be recovered.</p>
        </div>

        <ErrorBanner msg={error} />
        <div className="flex gap-3 pt-1">
          <button
            type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition"
          >
            Cancel
          </button>
          <GoldButton loading={loading} loadingLabel="Creating…" label="Create Event" />
        </div>
      </form>
    </Modal>
  )
}

/* ══════════════════════════════════════════════
   PIN MODAL  (reused for Delete + CSV download)
══════════════════════════════════════════════ */
function PinModal({ event, title, warningMsg, confirmLabel, confirmStyle, onConfirm, onClose }) {
  const [pin,     setPin]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const noPin = !event.deletionPin

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!noPin && pin !== event.deletionPin) {
      setError('Incorrect Security PIN. Please try again.')
      setPin('')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onConfirm()
    } catch {
      setError('Action failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Modal title={title} subtitle={event.title} onClose={onClose}>
      {warningMsg && (
        <div className="mb-5 flex items-start gap-3 rounded-xl px-4 py-3.5" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <i className="fa-solid fa-triangle-exclamation text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-400/80 text-sm leading-snug" dangerouslySetInnerHTML={{ __html: warningMsg }} />
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        {noPin ? (
          <div className="flex items-start gap-3 rounded-xl px-4 py-3.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <i className="fa-solid fa-lock-open text-white/30 mt-0.5 shrink-0" />
            <p className="text-white/40 text-sm leading-snug">No Security PIN was set for this event. You can proceed without one.</p>
          </div>
        ) : (
          <div>
            <FieldLabel>Security PIN</FieldLabel>
            <DarkInput
              type="password"
              value={pin}
              onChange={setPin}
              placeholder="Enter the Security PIN for this event"
              autoComplete="off"
            />
          </div>
        )}
        <ErrorBanner msg={error} />
        <div className="flex gap-3 pt-1">
          <button
            type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || (!noPin && !pin)}
            className="flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={confirmStyle}
          >
            {loading
              ? <><i className="fa-solid fa-circle-notch fa-spin" /> Please wait…</>
              : confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ══════════════════════════════════════════════
   REGISTER MODAL
══════════════════════════════════════════════ */
const DEPARTMENTS = [
  'Human Resources',
  'Public Relations',
  'Media and Promotion',
  'Economy and Entrepreneurship',
  'Board Members',
  'Others',
]

function RegisterModal({ event, user, onClose, onRegistered, addToast }) {
  const [fullName,   setFullName]   = useState(user?.displayName || '')
  const [studentId,  setStudentId]  = useState('')
  const [email,      setEmail]      = useState(user?.email || '')
  const [phone,      setPhone]      = useState('')
  const [department, setDepartment] = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Safeguard: check for existing registration before inserting
      if (user?.uid) {
        const existing = await getDocs(
          query(
            collection(db, 'events', event.id, 'participants'),
            where('userId', '==', user.uid)
          )
        )
        if (!existing.empty) {
          addToast('You have already registered for this event.', 'error')
          setLoading(false)
          return
        }
      }

      await addDoc(collection(db, 'events', event.id, 'participants'), {
        fullName,
        studentId,
        email,
        phone,
        department,
        userId:       user?.uid ?? null,
        registeredAt: serverTimestamp(),
      })
      onRegistered?.(event.id)
      setSuccess(true)
    } catch {
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Modal title="" onClose={onClose}>
        <div className="text-center py-10">
          <div className="w-[72px] h-[72px] rounded-full bg-[#C69C6D]/15 border border-[#C69C6D]/30 flex items-center justify-center mx-auto mb-5">
            <i className="fa-solid fa-circle-check text-[#C69C6D] text-3xl" />
          </div>
          <h3 className="text-white font-black text-2xl mb-2">You're In!</h3>
          <p className="text-white/45 text-sm leading-relaxed max-w-xs mx-auto">
            You've successfully registered for<br />
            <span className="text-[#C69C6D] font-semibold">{event.title}</span>.
          </p>
          <button
            onClick={onClose}
            className="mt-8 gold-gradient px-8 py-3 rounded-xl text-sm font-black hover:-translate-y-0.5 transition-all"
            style={{ color: '#1a0e00' }}
          >
            Done
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Join Event" subtitle={event.title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <FieldLabel>Full Name</FieldLabel>
          <DarkInput value={fullName} onChange={setFullName} placeholder="Your full name" autoComplete="name" />
        </div>
        <div>
          <FieldLabel>Student ID</FieldLabel>
          <DarkInput value={studentId} onChange={setStudentId} placeholder="e.g. 23005678" />
        </div>
        <div>
          <FieldLabel>Email Address</FieldLabel>
          <DarkInput type="email" value={email} onChange={setEmail} placeholder="your.email@utp.edu.my" autoComplete="email" />
        </div>
        <div>
          <FieldLabel>Phone Number</FieldLabel>
          <DarkInput type="tel" value={phone} onChange={setPhone} placeholder="e.g. 011-23456789" autoComplete="tel" />
        </div>
        <div>
          <FieldLabel>Department</FieldLabel>
          <DarkSelect value={department} onChange={setDepartment} options={DEPARTMENTS} placeholder="Select your department" />
        </div>
        <ErrorBanner msg={error} />
        <div className="flex gap-3 pt-1">
          <button
            type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition"
          >
            Cancel
          </button>
          <GoldButton loading={loading} loadingLabel="Registering…" label="Confirm Registration" />
        </div>
      </form>
    </Modal>
  )
}

/* ══════════════════════════════════════════════
   PARTICIPANTS MODAL
══════════════════════════════════════════════ */
function ParticipantsModal({ event, onClose }) {
  const [participants, setParticipants] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [csvPinOpen,   setCsvPinOpen]   = useState(false)

  useEffect(() => {
    getDocs(collection(db, 'events', event.id, 'participants'))
      .then(snap => setParticipants(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [event.id])

  const executeDownload = () => {
    const headers = ['Full Name', 'Student ID', 'Email Address', 'Phone', 'Department']
    const escape  = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows    = participants.map(p => [
      escape(p.fullName),
      escape(p.studentId),
      escape(p.email),
      escape(p.phone),
      escape(p.department),
    ].join(','))
    const csv  = [headers.map(escape).join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const safe = event.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')
    const a    = Object.assign(document.createElement('a'), {
      href:     url,
      download: `${safe}_Participants.csv`,
    })
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Modal title="Participants" subtitle={event.title} onClose={onClose} maxWidth="max-w-4xl">
        {loading ? (
          <div className="text-center py-16">
            <i className="fa-solid fa-circle-notch fa-spin text-[#C69C6D] text-2xl" />
            <p className="text-white/30 text-sm mt-3">Loading…</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-users text-white/25 text-xl" />
            </div>
            <p className="text-white/40 font-semibold">No registrations yet</p>
            <p className="text-white/25 text-xs mt-1">Share the event so members can join.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5 gap-4">
              <p className="text-white/35 text-xs">
                <span className="text-[#C69C6D] font-bold">{participants.length}</span> registered
              </p>
              <button
                onClick={() => setCsvPinOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(198,156,109,0.35)] shrink-0"
                style={{
                  background: 'linear-gradient(135deg,#002B5B,#0D3A6E)',
                  border: '1px solid rgba(198,156,109,0.35)',
                  color: '#C69C6D',
                }}
              >
                <i className="fa-solid fa-lock text-[11px]" />
                Download CSV
              </button>
            </div>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm min-w-[680px]">
                <thead>
                  <tr>
                    {['#', 'Full Name', 'Student ID', 'Email Address', 'Phone', 'Department'].map(h => (
                      <th
                        key={h}
                        className="text-left text-[10px] font-bold text-[#C69C6D] tracking-[0.18em] uppercase pb-3 pr-4 whitespace-nowrap"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, i) => (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-white/[0.03]"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <td className="py-3.5 pr-4 text-white/25 text-xs font-mono">{i + 1}</td>
                      <td className="py-3.5 pr-4 text-white font-semibold whitespace-nowrap">{p.fullName}</td>
                      <td className="py-3.5 pr-4 text-white/60 font-mono text-xs">{p.studentId}</td>
                      <td className="py-3.5 pr-4 text-white/55 text-xs">{p.email}</td>
                      <td className="py-3.5 pr-4 text-white/60 whitespace-nowrap">{p.phone}</td>
                      <td className="py-3.5 text-white/45 text-xs">{p.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal>

      {csvPinOpen && (
        <PinModal
          event={event}
          title="Download Participant Data"
          warningMsg="This data is <strong>Private &amp; Confidential</strong>. Enter the event Security PIN to proceed."
          confirmLabel={<><i className="fa-solid fa-download" /> Download CSV</>}
          confirmStyle={{
            background: 'linear-gradient(135deg,#002B5B,#0D3A6E)',
            border: '1px solid rgba(198,156,109,0.4)',
            color: '#C69C6D',
          }}
          onConfirm={async () => {
            executeDownload()
            setCsvPinOpen(false)
          }}
          onClose={() => setCsvPinOpen(false)}
        />
      )}
    </>
  )
}

/* ══════════════════════════════════════════════
   DUTY LOG MODAL
══════════════════════════════════════════════ */
function calcDutyHours(start, end) {
  if (!start || !end) return 0
  const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60)
  return Math.max(0, diff)
}

function DutyLogModal({ event, user, onClose, onLogged }) {
  const [startTime, setStartTime] = useState('')
  const [endTime,   setEndTime]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState(false)

  const totalHours      = calcDutyHours(startTime, endTime)
  const memberPay       = totalHours * 8
  const clubContrib     = totalHours * 1
  const totalInvoice    = totalHours * 9
  const hasValidHours   = totalHours > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!startTime || !endTime) {
      setError('Please fill in both start and end times.')
      return
    }
    if (new Date(endTime) <= new Date(startTime)) {
      setError('End time must be after start time.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await addDoc(collection(db, 'duty_logs'), {
        userId:           user.uid,
        userName:         user.displayName || user.email,
        userEmail:        user.email,
        eventId:          event.id,
        eventName:        event.title,
        startTime,
        endTime,
        totalHours,
        memberPay,
        clubContribution: clubContrib,
        totalInvoice,
        loggedAt:         serverTimestamp(),
      })
      onLogged?.(event.id)
      setSuccess(true)
    } catch {
      setError('Failed to save duty log. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Modal title="" onClose={onClose}>
        <div className="text-center py-10">
          <div className="w-[72px] h-[72px] rounded-full bg-[#C69C6D]/15 border border-[#C69C6D]/30 flex items-center justify-center mx-auto mb-5">
            <i className="fa-solid fa-circle-check text-[#C69C6D] text-3xl" />
          </div>
          <h3 className="text-white font-black text-2xl mb-2">Record Saved</h3>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">
            Your duty record has been saved.
          </p>
          <button
            onClick={onClose}
            className="mt-8 gold-gradient px-10 py-3 rounded-xl text-sm font-black hover:-translate-y-0.5 transition-all"
            style={{ color: '#1a0e00' }}
          >
            OK
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Log Duty Hours" subtitle={event.title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Event Name — read-only */}
        <div>
          <FieldLabel>Event Name</FieldLabel>
          <DarkInput value={event.title} onChange={() => {}} readOnly required={false} />
        </div>

        {/* Time inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Duty Start Time</FieldLabel>
            <DarkInput type="datetime-local" value={startTime} onChange={setStartTime} />
          </div>
          <div>
            <FieldLabel>Duty End Time</FieldLabel>
            <DarkInput type="datetime-local" value={endTime} onChange={setEndTime} />
          </div>
        </div>

        {/* Real-time pay summary */}
        <div
          className="rounded-xl p-4 space-y-2.5 transition-all"
          style={{
            background: hasValidHours ? 'rgba(198,156,109,0.07)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${hasValidHours ? 'rgba(198,156,109,0.25)' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <i className={`fa-solid fa-calculator text-xs ${hasValidHours ? 'text-[#C69C6D]' : 'text-white/20'}`} />
            <span className={`text-[11px] font-black tracking-widest uppercase ${hasValidHours ? 'text-[#C69C6D]' : 'text-white/20'}`}>
              Pay Summary
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-white/45">Total Hours</span>
            <span className={`font-bold tabular-nums ${hasValidHours ? 'text-white' : 'text-white/20'}`}>
              {hasValidHours ? `${totalHours.toFixed(2)} hrs` : '—'}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-white/45">Your Pay <span className="text-white/25 text-xs">(RM 8/hr)</span></span>
            <span className={`font-bold tabular-nums ${hasValidHours ? 'text-emerald-400' : 'text-white/20'}`}>
              {hasValidHours ? `RM ${memberPay.toFixed(2)}` : '—'}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-white/45">Club Contribution <span className="text-white/25 text-xs">(RM 1/hr)</span></span>
            <span className={`font-bold tabular-nums ${hasValidHours ? 'text-white/65' : 'text-white/20'}`}>
              {hasValidHours ? `RM ${clubContrib.toFixed(2)}` : '—'}
            </span>
          </div>

          <div
            className="flex justify-between items-center text-sm pt-2.5 mt-1"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className={`font-bold ${hasValidHours ? 'text-white' : 'text-white/25'}`}>Total Invoice Amount</span>
            <span className={`font-black text-base tabular-nums ${hasValidHours ? 'text-[#C69C6D]' : 'text-white/20'}`}>
              {hasValidHours ? `RM ${totalInvoice.toFixed(2)}` : '—'}
            </span>
          </div>
        </div>

        <ErrorBanner msg={error} />

        <div className="flex gap-3 pt-1">
          <button
            type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition"
          >
            Cancel
          </button>
          <GoldButton
            loading={loading}
            loadingLabel="Saving…"
            label={<><i className="fa-solid fa-floppy-disk mr-1.5" />Submit Duty Log</>}
            disabled={!hasValidHours}
          />
        </div>
      </form>
    </Modal>
  )
}

/* ══════════════════════════════════════════════
   EVENT CARD
══════════════════════════════════════════════ */
function fmtDate(iso) {
  if (!iso) return null
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-MY', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  })
}

const STATUS_BADGE = {
  Upcoming:  { bg: 'rgba(147,197,253,0.12)', border: 'rgba(147,197,253,0.3)', color: '#93c5fd' },
  Ongoing:   { bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)',   color: '#4ade80' },
  Completed: { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)' },
}

function EventCard({ event, isPast, isRegistered, isDutySubmitted, user, onRegister, onLogDuty, onViewParticipants, onDelete, onUpdateStatus }) {
  const [downloading, setDownloading] = useState(false)

  const start     = event.startDate || event.date || null
  const end       = event.endDate   || null
  const isSameDay = start && end && start === end
  const isCreator = user?.uid && user.uid === event.createdBy

  const downloadDutyCSV = async () => {
    setDownloading(true)
    try {
      const snap = await getDocs(
        query(collection(db, 'duty_logs'), where('eventId', '==', event.id))
      )
      const logs = snap.docs.map(d => d.data())
      const esc  = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
      const fmtT = (s) => s
        ? new Date(s).toLocaleString('en-MY', { dateStyle: 'short', timeStyle: 'short' })
        : 'N/A'

      const headers = [
        'Member Name', 'Start Time', 'End Time',
        'Total Hours', 'Member Pay (RM)', 'Club Contribution (RM)', 'Total Invoice Amount (RM)',
      ]
      const rows = logs.map(l => [
        esc(l.userName || l.userId || 'Unknown'),
        esc(fmtT(l.startTime)),
        esc(fmtT(l.endTime)),
        (l.totalHours      || 0).toFixed(2),
        (l.memberPay       || 0).toFixed(2),
        (l.clubContribution|| 0).toFixed(2),
        (l.totalInvoice    || 0).toFixed(2),
      ].join(','))

      const csv  = [headers.map(esc).join(','), ...rows].join('\r\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url  = URL.createObjectURL(blob)
      const safe = event.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')
      const a    = Object.assign(document.createElement('a'), {
        href: url, download: `${safe}_Duty_Logs.csv`,
      })
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('downloadDutyCSV:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden border transition-all duration-300"
      style={{
        background:  '#0D1D3A',
        borderColor: isPast ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)',
        boxShadow:   '0 4px 24px rgba(0,0,0,0.35)',
        opacity:     isPast ? 0.85 : 1,
      }}
    >
      <div
        className="h-[3px]"
        style={{
          background: isPast
            ? 'linear-gradient(90deg,#4B5563,#6B7280,#4B5563)'
            : 'linear-gradient(90deg,#C69C6D,#E5C598,#C69C6D)',
        }}
      />

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start gap-3 mb-3">
          <h3 className="text-white font-black text-lg leading-tight flex-grow">{event.title}</h3>
          {isCreator ? (
            /* Creator sees a status select to change it inline */
            <div className="relative shrink-0">
              <select
                value={event.status || 'Upcoming'}
                onChange={e => onUpdateStatus?.(event.id, e.target.value)}
                onClick={e => e.stopPropagation()}
                className="appearance-none rounded-md pl-2 pr-6 py-1 text-[9px] font-black tracking-widest uppercase focus:outline-none cursor-pointer transition-all"
                style={(() => {
                  const s = STATUS_BADGE[event.status] || STATUS_BADGE.Upcoming
                  return { background: s.bg, border: `1px solid ${s.border}`, color: s.color }
                })()}
              >
                <option value="Upcoming"  style={{ background: '#0A1628', color: 'white' }}>Upcoming</option>
                <option value="Ongoing"   style={{ background: '#0A1628', color: 'white' }}>Ongoing</option>
                <option value="Completed" style={{ background: '#0A1628', color: 'white' }}>Completed</option>
              </select>
              <i className="fa-solid fa-chevron-down text-[7px] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                style={{ color: (STATUS_BADGE[event.status] || STATUS_BADGE.Upcoming).color }} />
            </div>
          ) : isPast ? (
            <span className="shrink-0 px-2 py-1 rounded-md text-[9px] font-black tracking-widest uppercase bg-white/8 text-white/35 border border-white/10">
              Completed
            </span>
          ) : isRegistered ? (
            <span className="shrink-0 px-2 py-1 rounded-md text-[9px] font-black tracking-widest uppercase bg-[#C69C6D]/15 text-[#C69C6D] border border-[#C69C6D]/25">
              Registered
            </span>
          ) : (() => {
            const st = STATUS_BADGE[event.status] || STATUS_BADGE.Upcoming
            return (
              <span className="shrink-0 px-2 py-1 rounded-md text-[9px] font-black tracking-widest uppercase"
                style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
                {event.status || 'Upcoming'}
              </span>
            )
          })()}
        </div>

        {start ? (
          <div className="mb-4 space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <i className="fa-solid fa-calendar-day text-[#C69C6D] w-3 text-center shrink-0" />
              <span className="text-white/35 uppercase tracking-widest text-[9px] font-bold w-14 shrink-0">Start</span>
              <span className="text-white/75 font-semibold">{fmtDate(start)}</span>
            </div>
            {end && !isSameDay && (
              <div className="flex items-center gap-2 text-xs">
                <i className="fa-solid fa-calendar-check text-[#C69C6D]/60 w-3 text-center shrink-0" />
                <span className="text-white/35 uppercase tracking-widest text-[9px] font-bold w-14 shrink-0">End</span>
                <span className="text-white/60">{fmtDate(end)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-white/30 text-xs mb-4">
            <i className="fa-solid fa-calendar-day text-[#C69C6D]/50 text-xs" />
            Date TBA
          </div>
        )}

        <p className="text-white/50 text-sm leading-relaxed flex-grow mb-5 line-clamp-3">
          {event.description}
        </p>

        <div
          className="flex items-center gap-2 text-white/25 text-xs mb-5 pt-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <i className="fa-solid fa-user-pen text-[10px]" />
          <span>Created by <span className="text-white/45">{event.createdByName}</span></span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          {isPast ? (
            <button
              disabled
              className="flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 min-w-[90px] cursor-not-allowed"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.2)',
              }}
            >
              <i className="fa-solid fa-lock" />
              Closed
            </button>
          ) : isRegistered ? (
            <button
              disabled
              className="flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 min-w-[90px] cursor-not-allowed"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              <i className="fa-solid fa-check" />
              Registered
            </button>
          ) : (
            <button
              onClick={() => onRegister(event)}
              className="flex-1 gold-gradient py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(198,156,109,0.35)] transition-all duration-200 min-w-[90px]"
              style={{ color: '#1a0e00' }}
            >
              <i className="fa-solid fa-user-plus" />
              Join Event
            </button>
          )}

          <button
            onClick={() => onViewParticipants(event)}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-white/50 hover:text-[#C69C6D] border border-white/10 hover:border-[#C69C6D]/40 transition-all flex items-center gap-1.5"
          >
            <i className="fa-solid fa-users" />
            <span className="hidden sm:inline">Participants</span>
          </button>

          {/* Duty Logs CSV — only visible to the event creator */}
          {isCreator && (
            <button
              onClick={downloadDutyCSV}
              disabled={downloading}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 disabled:hover:translate-y-0"
              style={{
                background: 'rgba(198,156,109,0.08)',
                borderColor: 'rgba(198,156,109,0.3)',
                color: '#C69C6D',
              }}
              title="Download duty logs for this event"
            >
              {downloading
                ? <i className="fa-solid fa-circle-notch fa-spin text-[11px]" />
                : <i className="fa-solid fa-file-csv text-[11px]" />}
              <span className="hidden sm:inline">Duty Logs</span>
            </button>
          )}

          <button
            onClick={() => onDelete(event)}
            className="px-3 py-2.5 rounded-xl text-xs font-bold text-white/30 hover:text-red-400 border border-white/8 hover:border-red-500/30 hover:bg-red-500/8 transition-all flex items-center gap-1"
            title="Delete event"
          >
            <i className="fa-solid fa-trash text-[11px]" />
          </button>
        </div>

        {/* Bottom duty button — only for registered, active events */}
        {!isPast && isRegistered && (
          isDutySubmitted ? (
            <button
              disabled
              className="mt-2 w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-not-allowed"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              <i className="fa-solid fa-circle-check" />
              Duty Submitted
            </button>
          ) : (
            <button
              onClick={() => onLogDuty(event)}
              className="mt-2 w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg,#002B5B,#0D3A6E)',
                border: '1px solid rgba(198,156,109,0.35)',
                color: '#C69C6D',
              }}
            >
              <i className="fa-solid fa-clock" />
              Log Duty Hours
            </button>
          )
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════ */
const todayISO = () => new Date().toISOString().split('T')[0]

// Events with a `status` field use it as source of truth.
// Legacy events (no status) fall back to date comparison.
function isEventCompleted(ev) {
  if (ev.status) return ev.status === 'Completed'
  const end = ev.endDate || ev.startDate || ev.date || null
  return end ? end < todayISO() : false
}

export default function Dashboard({ user }) {
  const [events,            setEvents]            = useState([])
  const [registeredIds,     setRegisteredIds]     = useState(new Set())
  const [dutySubmittedIds,  setDutySubmittedIds]  = useState(new Set())
  const [loading,           setLoading]           = useState(true)
  const [tab,               setTab]               = useState('upcoming')
  const [showCreate,        setShowCreate]        = useState(false)
  const [registerEvent,     setRegisterEvent]     = useState(null)
  const [dutyLogEvent,      setDutyLogEvent]      = useState(null)
  const [participantsEvent, setParticipantsEvent] = useState(null)
  const [deleteEvent,       setDeleteEvent]       = useState(null)
  const [toasts,            setToasts]            = useState([])

  const toastTimers = useRef({})

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    toastTimers.current[id] = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
      delete toastTimers.current[id]
    }, 4500)
  }, [])

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const q    = query(collection(db, 'events'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      const eventsData = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setEvents(eventsData)

      // In parallel: check registrations AND duty log submissions for this user
      if (user?.uid && eventsData.length > 0) {
        const [participantChecks, dutyChecks] = await Promise.all([
          Promise.all(
            eventsData.map(ev =>
              getDocs(query(collection(db, 'events', ev.id, 'participants'), where('userId', '==', user.uid)))
            )
          ),
          Promise.all(
            eventsData.map(ev =>
              getDocs(query(collection(db, 'duty_logs'), where('userId', '==', user.uid), where('eventId', '==', ev.id)))
            )
          ),
        ])
        const regIds  = new Set()
        const dutyIds = new Set()
        eventsData.forEach((ev, i) => {
          if (!participantChecks[i].empty) regIds.add(ev.id)
          if (!dutyChecks[i].empty)        dutyIds.add(ev.id)
        })
        setRegisteredIds(regIds)
        setDutySubmittedIds(dutyIds)
      }
    } catch (err) {
      console.error('fetchEvents:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  // Clean up toast timers on unmount
  useEffect(() => {
    const timers = toastTimers.current
    return () => Object.values(timers).forEach(clearTimeout)
  }, [])

  const handleRegistered = useCallback((eventId) => {
    setRegisteredIds(prev => new Set([...prev, eventId]))
  }, [])

  const handleDutyLogged = useCallback((eventId) => {
    setDutySubmittedIds(prev => new Set([...prev, eventId]))
  }, [])

  const handleUpdateStatus = useCallback(async (eventId, newStatus) => {
    try {
      await updateDoc(doc(db, 'events', eventId), { status: newStatus })
      setEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, status: newStatus } : ev))
    } catch (err) {
      console.error('handleUpdateStatus:', err)
    }
  }, [])

  const upcoming = events.filter(ev => !isEventCompleted(ev))
  const past     = events.filter(ev =>  isEventCompleted(ev))
  const visible  = tab === 'upcoming' ? upcoming : past

  const firstName = user?.displayName?.split(' ')[0] || 'Member'

  return (
    <div className="min-h-screen bg-[#080F1E]">

      {/* ── Banner ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #002B5B 0%, #0D3A6E 100%)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(198,156,109,0.12) 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 h-full w-1/3 opacity-10"
          style={{ background: 'radial-gradient(ellipse at 100% 50%, #C69C6D 0%, transparent 70%)' }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <p className="text-[#C69C6D] text-[10px] font-black tracking-[0.25em] uppercase mb-1.5">
              Member Dashboard
            </p>
            <h1 className="text-white font-black text-3xl md:text-4xl leading-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="text-white/35 text-sm mt-1">{user?.email}</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="self-start sm:self-auto gold-gradient px-6 py-3.5 rounded-xl text-sm font-black flex items-center gap-2 shrink-0 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(198,156,109,0.4)] transition-all duration-200"
            style={{ color: '#1a0e00' }}
          >
            <i className="fa-solid fa-plus" /> Create Event
          </button>
        </div>
      </div>

      {/* ── Events feed ── */}
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Tab bar + refresh */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <div
            className="flex items-center gap-1 rounded-xl p-1 flex-1 min-w-[280px]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {[
              { key: 'upcoming', icon: 'fa-calendar',       label: 'Upcoming Events', count: upcoming.length },
              { key: 'past',     icon: 'fa-calendar-check', label: 'Past Events',     count: past.length     },
            ].map(({ key, icon, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  tab === key ? 'gold-gradient shadow-sm' : 'text-white/40 hover:text-white/70'
                }`}
                style={tab === key ? { color: '#1a0e00' } : undefined}
              >
                <i className={`fa-solid ${icon} text-xs`} />
                <span>{label}</span>
                {!loading && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      tab === key ? 'bg-black/20' : 'bg-white/8 text-white/30'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={fetchEvents}
            className="text-white/30 hover:text-[#C69C6D] transition-colors text-sm flex items-center gap-1.5 shrink-0"
          >
            <i className="fa-solid fa-rotate-right text-xs" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* States */}
        {loading ? (
          <div className="text-center py-28">
            <i className="fa-solid fa-circle-notch fa-spin text-[#C69C6D] text-3xl" />
            <p className="text-white/25 text-sm mt-4">Loading events…</p>
          </div>
        ) : visible.length === 0 ? (
          <div
            className="text-center py-24 rounded-2xl"
            style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
          >
            <div className="w-16 h-16 rounded-full bg-[#C69C6D]/10 border border-[#C69C6D]/20 flex items-center justify-center mx-auto mb-5">
              <i className={`fa-solid ${tab === 'upcoming' ? 'fa-calendar-plus' : 'fa-calendar-xmark'} text-[#C69C6D] text-2xl`} />
            </div>
            {tab === 'upcoming' ? (
              <>
                <h3 className="text-white/60 font-black text-lg">No upcoming events</h3>
                <p className="text-white/25 text-sm mt-2 mb-6">Click 'Create Event' above to schedule one.</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="gold-gradient px-6 py-3 rounded-xl text-sm font-black hover:-translate-y-0.5 transition-all"
                  style={{ color: '#1a0e00' }}
                >
                  <i className="fa-solid fa-plus mr-2" />Create Event
                </button>
              </>
            ) : (
              <>
                <h3 className="text-white/60 font-black text-lg">No past events</h3>
                <p className="text-white/25 text-sm mt-2">Past events will appear here once their end date has passed.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {visible.map(ev => (
              <EventCard
                key={ev.id}
                event={ev}
                isPast={isEventCompleted(ev)}
                isRegistered={registeredIds.has(ev.id)}
                isDutySubmitted={dutySubmittedIds.has(ev.id)}
                user={user}
                onRegister={setRegisterEvent}
                onLogDuty={setDutyLogEvent}
                onViewParticipants={setParticipantsEvent}
                onDelete={setDeleteEvent}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <CreateEventModal
          user={user}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchEvents() }}
        />
      )}
      {registerEvent && (
        <RegisterModal
          event={registerEvent}
          user={user}
          onClose={() => setRegisterEvent(null)}
          onRegistered={handleRegistered}
          addToast={addToast}
        />
      )}
      {dutyLogEvent && (
        <DutyLogModal
          event={dutyLogEvent}
          user={user}
          onClose={() => setDutyLogEvent(null)}
          onLogged={handleDutyLogged}
        />
      )}
      {participantsEvent && (
        <ParticipantsModal
          event={participantsEvent}
          onClose={() => setParticipantsEvent(null)}
        />
      )}
      {deleteEvent && (
        <PinModal
          event={deleteEvent}
          title="Delete Event"
          warningMsg="This action is <strong>permanent</strong>. All event data and participant registrations will be deleted and cannot be recovered."
          confirmLabel={<><i className="fa-solid fa-trash" /> Confirm Delete</>}
          confirmStyle={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.4)',
            color: '#f87171',
          }}
          onConfirm={async () => {
            await deleteDoc(doc(db, 'events', deleteEvent.id))
            setDeleteEvent(null)
            fetchEvents()
          }}
          onClose={() => setDeleteEvent(null)}
        />
      )}

      {/* ── Toast notifications ── */}
      <ToastContainer toasts={toasts} />
    </div>
  )
}
