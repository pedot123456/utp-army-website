export default function Hero() {
  return (
    <div className="bg-[#080F1E] relative overflow-hidden pb-20 pt-10">
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 right-0 w-[600px] h-[600px] bg-[#C69C6D] opacity-10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C69C6D] opacity-8 rounded-full blur-[100px]" />
      </div>

      {/* Subtle dot grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, #C69C6D 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12 md:gap-20">

        {/* ── Left: copy ── */}
        <div className="flex-1 space-y-7">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/8 rounded-full text-[#E5C598] text-xs font-bold uppercase tracking-widest border border-[#C69C6D]/25">
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

          <p className="text-[1.05rem] text-blue-100/70 max-w-lg leading-relaxed">
            A dynamic youth-driven platform championing marketing excellence, creative
            collaboration, and impactful engagement — shaping future-ready ambassadors
            through the power of sharing.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#leadership"
              className="gold-gradient text-[#1a0e00] font-black px-8 py-3.5 rounded-xl shadow-lg hover:shadow-[0_8px_30px_rgba(198,156,109,0.45)] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm tracking-wide"
            >
              Meet Our Leaders <i className="fa-solid fa-arrow-right text-xs" />
            </a>
            <a
              href="#events"
              className="border border-[#C69C6D]/40 text-[#E5C598] font-semibold px-8 py-3.5 rounded-xl hover:bg-[#C69C6D]/10 hover:border-[#C69C6D]/70 transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <i className="fa-brands fa-instagram text-sm" />
              Our Events
            </a>
          </div>

          {/* Stats strip */}
          <div className="flex gap-8 pt-4 border-t border-white/10 mt-4">
            {[
              { num: '2025/26', label: 'Committee Batch' },
              { num: '6', label: 'Core Members' },
              { num: 'UTP', label: 'Campus' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[#E5C598] font-black text-lg leading-none">{s.num}</p>
                <p className="text-white/40 text-xs mt-1 tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: static logo ── */}
        <div className="w-full md:w-5/12 flex items-center justify-center shrink-0">
          <div className="relative flex items-center justify-center w-full max-w-xs">
            {/* Soft glow behind logo */}
            <div
              className="absolute rounded-full"
              style={{
                width: '100%',
                paddingBottom: '100%',
                background: 'radial-gradient(circle, rgba(198,156,109,0.2) 0%, transparent 70%)',
                filter: 'blur(28px)',
              }}
            />
            <img
              src="/board/ARM_1.png"
              alt="ARMy Logo"
              className="relative z-10 w-full max-w-full object-contain drop-shadow-2xl select-none"
              style={{ filter: 'drop-shadow(0 0 28px rgba(198,156,109,0.45))' }}
              draggable={false}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
