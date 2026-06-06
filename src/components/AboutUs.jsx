import { useEffect } from 'react'
import { DEPARTMENTS } from '../data/departments'

function useInstagramEmbeds() {
  useEffect(() => {
    const process = () => window.instgrm?.Embeds?.process()
    if (document.querySelector('script[src*="instagram.com/embed"]')) {
      process()
    } else {
      const s = document.createElement('script')
      s.src = 'https://www.instagram.com/embed.js'
      s.async = true
      s.onload = process
      document.head.appendChild(s)
    }
  }, [])
}

const MISSIONS = [
  'To empower students with real-world marketing knowledge, strategic thinking, and hands-on industry experience.',
  'To foster a collaborative and inclusive community that drives creativity, innovation, and meaningful connections.',
  'To build lasting bridges between academia, industry, and society through impactful programs and partnerships.',
]

/* ── Department card — same flush-bottom technique as Events ── */
function DeptCard({ dept }) {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover-lift">
      {/* Instagram embed at natural height — never stretched */}
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={dept.instagramPost}
        data-instgrm-version="14"
        style={{
          background: '#fff',
          border: 0,
          borderRadius: 0,
          boxShadow: 'none',
          margin: '0 auto',
          padding: 0,
          width: '100%',
          minWidth: 'unset',
          maxWidth: '100%',
        }}
      />

      {/* Text info — sits directly below the embed */}
      <div className="px-5 py-5 border-t-4 border-[#C69C6D]">
        <h3 className="font-black text-[#002B5B] text-[15px] leading-snug">{dept.name}</h3>
        <div className="mt-3 space-y-2.5">
          <div>
            <p className="text-[10px] font-bold text-[#C69C6D] tracking-[0.18em] uppercase mb-0.5">
              Head of Department
            </p>
            <p className="text-gray-800 font-semibold text-sm">{dept.hod}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#C69C6D] tracking-[0.18em] uppercase mb-0.5">
              Assistant Head of Department
            </p>
            <p className="text-gray-500 text-sm">{dept.asst}</p>
          </div>
        </div>
      </div>

      {/* Spacer — fills remaining row height without touching the embed */}
      <div className="flex-grow bg-white" />
    </div>
  )
}

export default function AboutUs() {
  useInstagramEmbeds()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div>

      {/* ══ Dark-blue hero banner ══ */}
      <div className="relative overflow-hidden" style={{ background: '#002B5B' }}>
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(198,156,109,0.15) 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 h-full w-1/3 opacity-10"
          style={{ background: 'radial-gradient(ellipse at 100% 50%, #C69C6D 0%, transparent 70%)' }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="h-1 w-14 bg-[#C69C6D] mb-6 rounded-full" />
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight">
            About<br />Us
          </h1>
          <p className="mt-5 text-[#C69C6D] text-xs font-bold tracking-[0.2em] uppercase">
            ARMy — Ambassador of Marketing Youth &nbsp;·&nbsp; UTP
          </p>
        </div>
      </div>

      {/* ══ Vision & Mission ══ */}
      <section className="bg-[#F4F6F8] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-14">
            <h2 className="text-xl font-bold text-gray-700 tracking-widest uppercase">
              Vision &amp; Mission
            </h2>
            <div className="h-0.5 w-10 bg-[#C69C6D] mx-auto mt-3 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

            {/* Vision card — navy */}
            <div className="relative overflow-hidden rounded-2xl" style={{ background: '#002B5B' }}>
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(198,156,109,0.18) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="relative z-10 p-8 md:p-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#C69C6D]/20 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-eye text-[#C69C6D]" />
                  </div>
                  <span className="text-[#C69C6D] font-black text-xs tracking-[0.25em] uppercase">
                    Vision
                  </span>
                </div>
                <p className="text-white text-xl md:text-2xl font-light leading-relaxed flex-grow">
                  To be the premier youth-driven marketing platform at UTP, cultivating future-ready
                  ambassadors who champion excellence, creativity, and impactful engagement.
                </p>
              </div>
            </div>

            {/* Mission card — white */}
            <div className="bg-white rounded-2xl p-8 md:p-10 border-l-4 border-[#C69C6D] shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#C69C6D]/10 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-bullseye text-[#C69C6D]" />
                </div>
                <span className="text-[#002B5B] font-black text-xs tracking-[0.25em] uppercase">
                  Mission
                </span>
              </div>
              <ul className="space-y-5 flex-grow">
                {MISSIONS.map((m, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="mt-0.5 w-6 h-6 rounded-full bg-[#C69C6D] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-gray-600 leading-relaxed">{m}</p>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ══ Our Exco ══ */}
      <section className="bg-[#080F1E] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-14">
            <p className="text-[#C69C6D] font-bold text-xs tracking-widest uppercase mb-2">
              Executive HICOM
            </p>
            <h2 className="text-3xl font-black text-white">Our Exco</h2>
            <div className="h-0.5 w-10 bg-[#C69C6D] mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 ig-embed-wrap items-stretch">
            {DEPARTMENTS.map(dept => (
              <div key={dept.id} className="h-full">
                <DeptCard dept={dept} />
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  )
}
