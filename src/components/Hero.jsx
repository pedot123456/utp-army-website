import { useHeroParallax } from './Parallax'

export default function Hero() {
  // Three depth layers — each moves slightly faster than the one behind it
  const bgRef   = useHeroParallax(0.32)  // gradient sky — slowest
  const glowRef = useHeroParallax(0.20)  // ambient gold blobs — mid
  const logoRef = useHeroParallax(0.10)  // ARMy logo — closest to foreground

  return (
    <div
      className="relative overflow-hidden"
      style={{ minHeight: 'calc(100vh - 73px)', background: '#080F1E' }}
    >

      {/* ── Layer 1: Parallax gradient sky (slowest) ─────────────────────── */}
      <div
        ref={bgRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-30%', bottom: '-30%', left: 0, right: 0,
          background: 'radial-gradient(ellipse at 58% 38%, #0D3A6E 0%, #002B5B 40%, #080F1E 82%)',
          willChange: 'transform',
        }}
      />

      {/* ── Layer 2: Dot grid (static — thin texture, no motion needed) ──── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(198,156,109,0.10) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* ── Layer 3: Gold ambient glow blobs (mid speed) ─────────────────── */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-30%', bottom: '-30%', left: 0, right: 0,
          willChange: 'transform',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          position: 'absolute',
          top: '10%', right: '-5%',
          width: '580px', height: '580px',
          background: 'radial-gradient(circle, rgba(198,156,109,0.13) 0%, transparent 70%)',
          filter: 'blur(80px)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '5%', left: '-8%',
          width: '420px', height: '420px',
          background: 'radial-gradient(circle, rgba(198,156,109,0.09) 0%, transparent 70%)',
          filter: 'blur(90px)',
          borderRadius: '50%',
        }} />
      </div>

      {/* ── Foreground content (scrolls at 1× — full speed) ──────────────── */}
      <div
        className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12 md:gap-20"
        style={{
          minHeight: 'calc(100vh - 73px)',
          paddingTop: '3rem',
          paddingBottom: '6rem',
        }}
      >

        {/* Left: copy */}
        <div className="flex-1 space-y-7">

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[#E5C598] text-xs font-bold uppercase tracking-widest border border-[#C69C6D]/25"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5C598] animate-pulse" />
            Marketing &amp; Admission Division
          </span>

          <h1 className="text-4xl md:text-[3.75rem] font-black text-white leading-[1.1] tracking-tight">
            Ambassador of<br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #C69C6D 0%, #E5C598 50%, #C69C6D 100%)' }}
            >
              Marketing Youth
            </span>
            <br />
            <span className="text-white/90">ARMy</span>
          </h1>

          <p className="text-[1.05rem] leading-relaxed max-w-lg" style={{ color: 'rgba(219,234,254,0.70)' }}>
            A dynamic youth-driven platform championing marketing excellence, creative
            collaboration, and impactful engagement — shaping future-ready ambassadors
            through the power of sharing.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#leadership"
              className="gold-gradient text-[#1a0e00] font-black px-8 py-3.5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm tracking-wide"
              style={{ boxShadow: '0 6px 24px rgba(198,156,109,0.35)' }}
            >
              Meet Our Leaders <i className="fa-solid fa-arrow-right text-xs" />
            </a>
            <a
              href="#events"
              className="font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm"
              style={{
                border: '1px solid rgba(198,156,109,0.40)',
                color: '#E5C598',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(198,156,109,0.10)'
                e.currentTarget.style.borderColor = 'rgba(198,156,109,0.70)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(198,156,109,0.40)'
              }}
            >
              <i className="fa-brands fa-instagram text-sm" />
              Our Events
            </a>
          </div>

          {/* Stats strip */}
          <div
            className="flex gap-8 pt-4 mt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}
          >
            {[
              { num: '2025/26', label: 'Committee Batch' },
              { num: '6',       label: 'Core Members'    },
              { num: 'UTP',     label: 'Campus'          },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[#E5C598] font-black text-lg leading-none">{s.num}</p>
                <p className="text-xs mt-1 tracking-wide" style={{ color: 'rgba(255,255,255,0.40)' }}>{s.label}</p>
              </div>
            ))}
          </div>

        </div>

        {/* Right: Logo — layer 4, parallax at 0.10× (nearly foreground speed, gentle depth) */}
        <div className="w-full md:w-5/12 flex items-center justify-center shrink-0">
          <div
            ref={logoRef}
            className="relative flex items-center justify-center w-full max-w-xs"
            style={{ willChange: 'transform' }}
          >
            {/* Soft radial glow behind logo */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, rgba(198,156,109,0.22) 0%, transparent 68%)',
                filter: 'blur(32px)',
              }}
            />
            <img
              src="/board/ARM_1.png"
              alt="ARMy Logo"
              className="relative z-10 w-full max-w-full object-contain select-none"
              style={{ filter: 'drop-shadow(0 0 28px rgba(198,156,109,0.45))' }}
              draggable={false}
            />
          </div>
        </div>

      </div>

      {/* ── Scroll cue ────────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-6 left-1/2 z-10 flex flex-col items-center gap-2"
        style={{ transform: 'translateX(-50%)', opacity: 0.38 }}
        aria-hidden="true"
      >
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          Scroll
        </span>
        <div
          style={{
            width: '1px',
            height: '48px',
            background: 'linear-gradient(to bottom, rgba(198,156,109,0.65), transparent)',
          }}
        />
        <i className="fa-solid fa-chevron-down text-[10px]" style={{ color: 'rgba(198,156,109,0.6)' }} />
      </div>

    </div>
  )
}
