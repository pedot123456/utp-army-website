import { useState, useEffect, useCallback } from 'react'
import {
  collection, getDocs, doc, updateDoc, query, orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'

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
          <div key={t.id}
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
   PIN GATE — ARMy2025
══════════════════════════════════════════════ */
const HICOM_PIN   = 'ARMy2025'
const SESSION_KEY = 'hicom_unlocked'

const inputBase  = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
const inputFocus = { border: '1px solid rgba(198,156,109,0.6)', background: 'rgba(255,255,255,0.07)' }
const inputError = { border: '1px solid rgba(239,68,68,0.5)', background: 'rgba(255,255,255,0.05)' }

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
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #002B5B, #0D3A6E)', border: '1px solid rgba(198,156,109,0.25)', boxShadow: '0 0 48px rgba(198,156,109,0.12)' }}>
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
              <label className="block text-[11px] font-bold text-[#C69C6D] tracking-[0.2em] uppercase mb-2">
                Access PIN
              </label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1">
                  <i className={`fa-solid ${showPin ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-400 text-sm">
                <i className="fa-solid fa-circle-exclamation shrink-0" />{error}
              </div>
            )}

            <button type="submit" disabled={loading || !pin}
              className="w-full gold-gradient py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(198,156,109,0.4)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ color: '#1a0e00' }}>
              {loading
                ? <><i className="fa-solid fa-circle-notch fa-spin" /> Verifying…</>
                : <><i className="fa-solid fa-unlock-keyhole" /> Unlock Portal</>}
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
   STATUS CONSTANTS
══════════════════════════════════════════════ */
const VERIFICATION = {
  Pending:  { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)',  icon: 'fa-clock',        rowBg: 'transparent'             },
  Approved: { bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.35)',   color: '#4ade80',                icon: 'fa-circle-check', rowBg: 'rgba(34,197,94,0.03)'   },
  Rejected: { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)',   color: '#f87171',                icon: 'fa-circle-xmark', rowBg: 'rgba(239,68,68,0.03)'   },
}

const PAYMENT_OPTS = ['Pending Client Payment', 'Ready to Pay', 'Paid to Member']
const PAYMENT_STYLE = {
  'Pending Client Payment': { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)'  },
  'Ready to Pay':           { color: '#93c5fd', bg: 'rgba(147,197,253,0.1)', border: 'rgba(147,197,253,0.3)' },
  'Paid to Member':         { color: '#4ade80', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.35)'  },
}

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function fmtTime(s) {
  if (!s) return '—'
  return new Date(s).toLocaleString('en-MY', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtTimeCSV(s) {
  if (!s) return 'N/A'
  return new Date(s).toLocaleString('en-MY', { dateStyle: 'short', timeStyle: 'short' })
}

function downloadCSV(logs, eventFilter) {
  const esc  = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const headers = [
    '#', 'Member Name', 'Email', 'Event Name', 'Start Time', 'End Time',
    'Total Hours', 'Member Pay (RM)', 'Club Contribution (RM)', 'Total Invoice Amount (RM)',
    'Verification', 'Payment Status',
  ]
  const rows = logs.map((l, i) => [
    i + 1,
    esc(l.userName  || l.userId || 'Unknown'),
    esc(l.userEmail || ''),
    esc(l.eventName || ''),
    esc(fmtTimeCSV(l.startTime)),
    esc(fmtTimeCSV(l.endTime)),
    (l.totalHours       || 0).toFixed(2),
    (l.memberPay        || 0).toFixed(2),
    (l.clubContribution || 0).toFixed(2),
    (l.totalInvoice     || 0).toFixed(2),
    esc(l.verificationStatus || 'Pending'),
    esc(l.paymentStatus      || 'Pending Client Payment'),
  ].join(','))

  const csv    = [headers.map(esc).join(','), ...rows].join('\r\n')
  const blob   = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url    = URL.createObjectURL(blob)
  const suffix = eventFilter ? `_${eventFilter.replace(/[^\w]/g, '_')}` : '_Master'
  const date   = new Date().toISOString().split('T')[0]
  const a      = Object.assign(document.createElement('a'), {
    href: url, download: `ARMy_Duty_Report${suffix}_${date}.csv`,
  })
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/* ══════════════════════════════════════════════
   SUMMARY STAT TILES
══════════════════════════════════════════════ */
function SummaryTiles({ logs }) {
  const all      = logs.length
  const approved = logs.filter(l => l.verificationStatus === 'Approved').length
  const hours    = logs.reduce((s, l) => s + (l.totalHours       || 0), 0)
  const member   = logs.reduce((s, l) => s + (l.memberPay        || 0), 0)
  const club     = logs.reduce((s, l) => s + (l.clubContribution || 0), 0)
  const invoice  = logs.reduce((s, l) => s + (l.totalInvoice     || 0), 0)
  const paid     = logs.filter(l => l.paymentStatus === 'Paid to Member').length

  const tiles = [
    { icon: 'fa-file-lines',  label: 'Duty Records',     value: all,                        sub: `${approved} verified`,   color: '#C69C6D' },
    { icon: 'fa-clock',       label: 'Total Hours',       value: `${hours.toFixed(2)} hrs`,  sub: null,                     color: '#93c5fd' },
    { icon: 'fa-money-bill',  label: 'Member Earnings',   value: `RM ${member.toFixed(2)}`,  sub: null,                     color: '#4ade80' },
    { icon: 'fa-building',    label: 'Club Collection',   value: `RM ${club.toFixed(2)}`,    sub: null,                     color: '#a78bfa' },
    { icon: 'fa-receipt',     label: 'Total Invoice',     value: `RM ${invoice.toFixed(2)}`, sub: `${paid} members paid`,   color: '#C69C6D' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {tiles.map(({ icon, label, value, sub, color }) => (
        <div key={label} className="rounded-2xl p-5 flex flex-col gap-1.5"
          style={{ background: '#0A1628', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <i className={`fa-solid ${icon} text-xs`} style={{ color }} />
            <span className="text-white/35 text-[10px] font-bold uppercase tracking-widest leading-snug">{label}</span>
          </div>
          <div className="text-2xl font-black leading-tight" style={{ color }}>{value}</div>
          {sub && <div className="text-white/30 text-[11px]">{sub}</div>}
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════
   DUTY LOGS TABLE
══════════════════════════════════════════════ */
const COL_HEADERS = [
  '#', 'Member Name', 'Event', 'Start Time', 'End Time',
  'Hours', 'Member Pay', 'Club Cut', 'Total',
  'Verification', 'Payment Status',
]

function VerificationCell({ log, onUpdate }) {
  const vs  = log.verificationStatus || 'Pending'
  const st  = VERIFICATION[vs] || VERIFICATION.Pending
  const [busy, setBusy] = useState(false)

  const toggle = async (newStatus) => {
    if (busy) return
    setBusy(true)
    await onUpdate(log.id, 'verificationStatus', vs === newStatus ? 'Pending' : newStatus)
    setBusy(false)
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Current status chip */}
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black whitespace-nowrap"
        style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
        <i className={`fa-solid ${st.icon} text-[9px]`} />{vs}
      </span>

      {/* Action buttons */}
      <div className="flex gap-1">
        <button
          onClick={() => toggle('Approved')}
          disabled={busy}
          title={vs === 'Approved' ? 'Click to reset' : 'Approve'}
          className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: vs === 'Approved' ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.08)',
            border: `1px solid ${vs === 'Approved' ? 'rgba(34,197,94,0.5)' : 'rgba(34,197,94,0.2)'}`,
            color: '#4ade80',
          }}
        >
          {busy ? <i className="fa-solid fa-circle-notch fa-spin text-[9px]" /> : <i className="fa-solid fa-check text-[9px]" />}
        </button>
        <button
          onClick={() => toggle('Rejected')}
          disabled={busy}
          title={vs === 'Rejected' ? 'Click to reset' : 'Reject'}
          className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: vs === 'Rejected' ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${vs === 'Rejected' ? 'rgba(239,68,68,0.5)' : 'rgba(239,68,68,0.2)'}`,
            color: '#f87171',
          }}
        >
          <i className="fa-solid fa-xmark text-[9px]" />
        </button>
      </div>
    </div>
  )
}

function PaymentCell({ log, onUpdate }) {
  const ps  = log.paymentStatus || 'Pending Client Payment'
  const st  = PAYMENT_STYLE[ps] || PAYMENT_STYLE['Pending Client Payment']
  const [busy, setBusy] = useState(false)

  const handleChange = async (e) => {
    if (busy) return
    setBusy(true)
    await onUpdate(log.id, 'paymentStatus', e.target.value)
    setBusy(false)
  }

  return (
    <div className="relative">
      <select
        value={ps}
        onChange={handleChange}
        disabled={busy}
        className="rounded-lg px-2.5 py-1.5 text-[10px] font-black focus:outline-none appearance-none pr-6 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color, minWidth: '148px' }}
      >
        {PAYMENT_OPTS.map(o => (
          <option key={o} value={o} style={{ background: '#0A1628', color: 'white', fontWeight: 'bold' }}>{o}</option>
        ))}
      </select>
      <i className="fa-solid fa-chevron-down text-[8px] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: st.color, opacity: 0.7 }} />
    </div>
  )
}

function DutyTable({ logs, loading, onUpdate }) {
  if (loading) {
    return (
      <div className="rounded-2xl text-center py-24"
        style={{ background: '#0A1628', border: '1px solid rgba(255,255,255,0.08)' }}>
        <i className="fa-solid fa-circle-notch fa-spin text-[#C69C6D] text-2xl" />
        <p className="text-white/30 text-sm mt-3">Loading duty records…</p>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl text-center py-24"
        style={{ background: '#0A1628', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="w-16 h-16 rounded-full bg-[#C69C6D]/10 border border-[#C69C6D]/20 flex items-center justify-center mx-auto mb-5">
          <i className="fa-solid fa-clock text-[#C69C6D] text-2xl" />
        </div>
        <p className="text-white/50 font-black text-lg">No duty records found</p>
        <p className="text-white/25 text-sm mt-2">Records appear here once members log their duty hours.</p>
      </div>
    )
  }

  const totals = logs.reduce(
    (acc, l) => ({
      hours:  acc.hours  + (l.totalHours       || 0),
      member: acc.member + (l.memberPay        || 0),
      club:   acc.club   + (l.clubContribution || 0),
      total:  acc.total  + (l.totalInvoice     || 0),
    }),
    { hours: 0, member: 0, club: 0, total: 0 }
  )

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: '1280px' }}>

          <thead>
            <tr style={{ background: 'rgba(0,43,91,0.9)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {COL_HEADERS.map(h => (
                <th key={h}
                  className="text-left text-[10px] font-bold text-[#C69C6D] tracking-[0.18em] uppercase px-4 py-4 whitespace-nowrap first:pl-5 last:pr-5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {logs.map((l, i) => {
              const vs = l.verificationStatus || 'Pending'
              const rowBg = VERIFICATION[vs]?.rowBg ?? 'transparent'
              return (
                <tr key={l.id ?? i}
                  className="transition-colors hover:brightness-125"
                  style={{ background: rowBg === 'transparent' ? '#0A1628' : rowBg, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

                  <td className="px-5 py-3.5 text-white/25 text-xs font-mono">{i + 1}</td>

                  <td className="px-4 py-3.5" style={{ maxWidth: '170px' }}>
                    <div className="text-white font-bold truncate">{l.userName || '—'}</div>
                    {l.userEmail && <div className="text-white/35 text-[11px] truncate mt-0.5">{l.userEmail}</div>}
                  </td>

                  <td className="px-4 py-3.5" style={{ maxWidth: '150px' }}>
                    <span
                      className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-black max-w-full truncate"
                      style={{ background: 'rgba(198,156,109,0.1)', border: '1px solid rgba(198,156,109,0.2)', color: '#C69C6D' }}
                      title={l.eventName}
                    >
                      {l.eventName || '—'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-white/60 text-xs whitespace-nowrap">{fmtTime(l.startTime)}</td>
                  <td className="px-4 py-3.5 text-white/60 text-xs whitespace-nowrap">{fmtTime(l.endTime)}</td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-white font-bold tabular-nums">{(l.totalHours || 0).toFixed(2)}</span>
                    <span className="text-white/30 text-xs ml-1">hrs</span>
                  </td>

                  <td className="px-4 py-3.5 text-emerald-400 font-bold tabular-nums whitespace-nowrap">
                    RM {(l.memberPay || 0).toFixed(2)}
                  </td>

                  <td className="px-4 py-3.5 text-violet-300 font-semibold tabular-nums whitespace-nowrap">
                    RM {(l.clubContribution || 0).toFixed(2)}
                  </td>

                  <td className="px-4 py-3.5 text-[#C69C6D] font-black tabular-nums whitespace-nowrap">
                    RM {(l.totalInvoice || 0).toFixed(2)}
                  </td>

                  <td className="px-4 py-3.5">
                    <VerificationCell log={l} onUpdate={onUpdate} />
                  </td>

                  <td className="px-4 pr-5 py-3.5">
                    <PaymentCell log={l} onUpdate={onUpdate} />
                  </td>
                </tr>
              )
            })}
          </tbody>

          <tfoot>
            <tr style={{ background: 'rgba(0,43,91,0.65)', borderTop: '2px solid rgba(198,156,109,0.3)' }}>
              <td colSpan={5} className="px-5 py-4 text-[#C69C6D] text-[11px] font-black uppercase tracking-widest">
                <i className="fa-solid fa-sigma mr-2" />
                Totals — {logs.length} record{logs.length !== 1 ? 's' : ''}
              </td>
              <td className="px-4 py-4 text-white font-black tabular-nums whitespace-nowrap">
                {totals.hours.toFixed(2)} <span className="text-white/35 font-normal text-xs">hrs</span>
              </td>
              <td className="px-4 py-4 text-emerald-400 font-black tabular-nums whitespace-nowrap">
                RM {totals.member.toFixed(2)}
              </td>
              <td className="px-4 py-4 text-violet-300 font-black tabular-nums whitespace-nowrap">
                RM {totals.club.toFixed(2)}
              </td>
              <td className="px-4 pr-5 py-4 text-[#C69C6D] font-black tabular-nums whitespace-nowrap">
                RM {totals.total.toFixed(2)}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>

        </table>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN EXPORT — HICOM DUTY TRACKER
══════════════════════════════════════════════ */
export default function HicomDashboard() {
  const [unlocked,    setUnlocked]    = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [dutyLogs,    setDutyLogs]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [eventFilter, setEventFilter] = useState('')
  const { toasts, addToast, removeToast } = useToast()

  const fetchDutyLogs = useCallback(async () => {
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'duty_logs'), orderBy('loggedAt', 'desc')))
      setDutyLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch {
      addToast('Failed to load duty records from the database.', 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { if (unlocked) fetchDutyLogs() }, [unlocked, fetchDutyLogs])

  // Optimistic update: write to Firestore then patch local state
  const handleUpdateLog = useCallback(async (logId, field, value) => {
    try {
      await updateDoc(doc(db, 'duty_logs', logId), { [field]: value })
      setDutyLogs(prev => prev.map(l => l.id === logId ? { ...l, [field]: value } : l))
    } catch {
      addToast('Failed to update record. Please try again.', 'error')
    }
  }, [addToast])

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />

  const eventNames = [...new Set(dutyLogs.map(l => l.eventName).filter(Boolean))].sort()
  const filtered   = eventFilter ? dutyLogs.filter(l => l.eventName === eventFilter) : dutyLogs

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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <i className="fa-solid fa-shield-halved text-[#C69C6D] text-xs" />
              <span className="text-[#C69C6D] text-[10px] font-black tracking-[0.25em] uppercase">HICOM Internal Portal</span>
            </div>
            <h1 className="text-white font-black text-3xl md:text-4xl leading-tight">Duty Tracker</h1>
            <p className="text-white/35 text-sm mt-1">Financial & Attendance Records — ARMy HICOM Confidential</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <button onClick={fetchDutyLogs}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <i className="fa-solid fa-rotate-right text-xs" /> Refresh
            </button>

            <button
              onClick={() => { downloadCSV(filtered, eventFilter); addToast('Report downloaded!', 'success') }}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(198,156,109,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ background: 'linear-gradient(135deg,#002B5B,#0D3A6E)', border: '1px solid rgba(198,156,109,0.4)', color: '#C69C6D' }}>
              <i className="fa-solid fa-file-csv" />
              <span className="hidden sm:inline">Download Master Report (CSV)</span>
              <span className="sm:hidden">Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">

        {!loading && <SummaryTiles logs={filtered} />}

        <div>
          {/* Section header + filter */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
            <div>
              <h2 className="text-white font-black text-xl">Duty Hour Logs</h2>
              <p className="text-white/35 text-xs mt-0.5">
                {loading ? 'Loading…' : (
                  <>
                    <span className="text-[#C69C6D] font-bold">{filtered.length}</span>
                    {' '}record{filtered.length !== 1 ? 's' : ''}
                    {eventFilter && <> — <span className="text-[#C69C6D]">{eventFilter}</span></>}
                  </>
                )}
              </p>
            </div>

            {!loading && eventNames.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                <label className="text-white/35 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                  Filter by Event
                </label>
                <div className="relative">
                  <select
                    value={eventFilter}
                    onChange={e => setEventFilter(e.target.value)}
                    className="rounded-xl px-4 py-2.5 text-sm focus:outline-none appearance-none pr-9 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${eventFilter ? 'rgba(198,156,109,0.45)' : 'rgba(255,255,255,0.12)'}`,
                      color: eventFilter ? 'white' : 'rgba(255,255,255,0.45)',
                      minWidth: '200px',
                    }}
                    onFocus={e => Object.assign(e.target.style, inputFocus)}
                    onBlur={e => {
                      e.target.style.background = 'rgba(255,255,255,0.05)'
                      e.target.style.border = `1px solid ${eventFilter ? 'rgba(198,156,109,0.45)' : 'rgba(255,255,255,0.12)'}`
                    }}
                  >
                    <option value="" style={{ background: '#0A1628' }}>All Events</option>
                    {eventNames.map(n => (
                      <option key={n} value={n} style={{ background: '#0A1628', color: 'white' }}>{n}</option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down text-white/30 text-[10px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {eventFilter && (
                  <button onClick={() => setEventFilter('')}
                    className="text-white/30 hover:text-white/70 transition-colors text-xs flex items-center gap-1">
                    <i className="fa-solid fa-xmark" /> Clear
                  </button>
                )}
              </div>
            )}
          </div>

          <DutyTable logs={filtered} loading={loading} onUpdate={handleUpdateLog} />
        </div>

      </div>
    </div>
  )
}
