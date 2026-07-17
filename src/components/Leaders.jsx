import { useEffect } from 'react'
import { ADVISORS, BOARD } from '../data/leaders'

/* ─── Load (or re-trigger) Instagram's embed.js once per page ─── */
function useInstagramEmbeds() {
  useEffect(() => {
    const process = () => window.instgrm?.Embeds?.process()
    if (document.querySelector('script[src*="instagram.com/embed"]')) {
      process()
    } else {
      const s = document.createElement('script')
      s.src   = 'https://www.instagram.com/embed.js'
      s.async = true
      s.onload = process
      document.head.appendChild(s)
    }
  }, [])
}

/*
 * How the photo technique works:
 *
 * Instagram's embed renders:  [header ~70px] → [square post image] → [actions + caption]
 *
 * We clip the card image area to 1:1 (square) and add margin-top: -70px
 * to the inner wrapper — this shifts the entire embed UP so the header moves
 * above the visible boundary (which is clipped by overflow:hidden on the outer
 * div).  The first visible pixel is then the top of the post image.
 *
 * Instagram's embed.js loads the actual photo from Instagram — no API key needed.
 */
function LeaderCard({ leader, top = false }) {
  return (
    <article
      className="flex flex-col overflow-hidden bg-white"
      style={{
        boxShadow: top
          ? '0 4px 20px rgba(198,156,109,0.25), 0 1px 6px rgba(0,0,0,0.09)'
          : '0 1px 6px rgba(0,0,0,0.09)',
      }}
    >
      {/* ── Photo area ── */}
      <div
        className="relative w-full overflow-hidden bg-[#DDE0E5]"
        style={{ aspectRatio: '1 / 1' }}
      >
        {/* Transparent overlay captures the click → opens Instagram post */}
        <a
          href={leader.instagramPost}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10"
          aria-label={`View ${leader.name || leader.position} on Instagram`}
        />

        {/*
         * The -70px margin shifts the embed up, hiding the Instagram header.
         * overflow:hidden on the parent clips it cleanly.
         */}
        <div className="leader-ig-wrap" style={{ marginTop: '-70px' }}>
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={leader.instagramPost}
            data-instgrm-version="14"
            style={{
              margin: 0,
              padding: 0,
              border: 0,
              background: '#DDE0E5',
              width: '100%',
              minWidth: 'unset',
              maxWidth: '100%',
            }}
          />
        </div>
      </div>

      {/* ── Text area ── */}
      <div className={`px-5 py-4 bg-white ${top ? 'border-t-4' : 'border-t-2'} border-[#C69C6D]`}>
        <p className="font-bold text-[#8B5E1A] text-[15px] leading-snug">
          {leader.name || '—'}
        </p>
        <p className="text-gray-500 text-sm mt-0.5">{leader.position}</p>
      </div>
    </article>
  )
}

/* ─── Sub-section label ─── */
function SubHeading({ title }) {
  return (
    <div className="text-center mb-10">
      <h3 className="text-xs font-bold text-gray-400 tracking-[0.25em] uppercase">{title}</h3>
      <div className="h-0.5 w-8 bg-[#C69C6D] mx-auto mt-2 rounded-full" />
    </div>
  )
}

/*
 * Org-chart pyramid — desktop (lg+):
 *
 *  6-column grid, every card = col-span-2 (identical width)
 *
 *  Row 1  |  ·  ·  [PRESIDENT]  ·  ·   col 3-4  → centred
 *  Row 2  |  [DEP]   [VP1]    [VP2]    col 1-2, 3-4, 5-6
 *  Row 3  |  ·  [SEC]    [TRE]  ·  ·   col 2-3, 4-5  → centred
 */
function BoardPyramid({ board }) {
  const [president, deputy, vp1, vp2, secretary, treasurer] = board

  return (
    <>
      {/* ── Desktop pyramid (lg+) ── */}
      <div className="hidden lg:grid grid-cols-6 gap-x-6 gap-y-10">
        {/* Row 1 — President: centred over the three below */}
        <div className="col-start-3 col-span-2 row-start-1">
          <LeaderCard leader={president} top />
        </div>

        {/* Row 2 — Deputy, VP1, VP2 */}
        <div className="col-start-1 col-span-2 row-start-2">
          <LeaderCard leader={deputy} />
        </div>
        <div className="col-start-3 col-span-2 row-start-2">
          <LeaderCard leader={vp1} />
        </div>
        <div className="col-start-5 col-span-2 row-start-2">
          <LeaderCard leader={vp2} />
        </div>

        {/* Row 3 — Secretary & Treasurer: centred (col 2-3 and 4-5) */}
        <div className="col-start-2 col-span-2 row-start-3">
          <LeaderCard leader={secretary} />
        </div>
        <div className="col-start-4 col-span-2 row-start-3">
          <LeaderCard leader={treasurer} />
        </div>
      </div>

      {/* ── Mobile / tablet fallback (<lg): 2-col grid ── */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
        {board.map(l => <LeaderCard key={l.id} leader={l} />)}
      </div>
    </>
  )
}

/* ─── Full section ─── */
export default function Leaders() {
  useInstagramEmbeds()

  return (
    <div id="leadership">

      {/* ══ Dark-blue hero banner ══ */}
      <div className="relative overflow-hidden" style={{ background: '#002B5B' }}>
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(198,156,109,0.15) 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 h-full w-1/3 opacity-10"
          style={{ background: 'radial-gradient(ellipse at 100% 50%, #C69C6D 0%, transparent 70%)' }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-28">
          <div className="h-1 w-14 bg-[#C69C6D] mb-6 rounded-full" />
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight">
            Our<br />Leaders
          </h1>
          <p className="mt-5 text-[#C69C6D] text-xs font-bold tracking-[0.2em] uppercase">
            ARMy Core Committee &nbsp;·&nbsp; 2025 / 2026
          </p>
        </div>
      </div>

      {/* ══ Cards section ══ */}
      <section className="bg-[#F4F6F8] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-14">
            <h2 className="text-xl font-bold text-gray-700 tracking-widest uppercase">
              Board of Directors
            </h2>
            <div className="h-0.5 w-10 bg-[#C69C6D] mx-auto mt-3 rounded-full" />
          </div>

          {/* Advisors — 2 cards centred */}
          <SubHeading title="Advisors" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto mb-16">
            {ADVISORS.map(l => <LeaderCard key={l.id} leader={l} />)}
          </div>

          {/* Executive Board — hierarchical pyramid */}
          <SubHeading title="Executive Board" />
          <BoardPyramid board={BOARD} />

        </div>
      </section>
    </div>
  )
}
