import { useEffect } from 'react'
import { EVENTS } from '../data/events'

/* Loads (or re-processes) the official Instagram embed script */
function useInstagramEmbeds() {
  useEffect(() => {
    let cancelled = false
    const process = () => { if (!cancelled) window.instgrm?.Embeds?.process() }

    if (document.querySelector('script[src*="instagram.com/embed"]')) {
      process()
    } else {
      const s = document.createElement('script')
      s.src = 'https://www.instagram.com/embed.js'
      s.async = true
      s.onload = process
      document.head.appendChild(s)
    }

    return () => { cancelled = true }
  }, [])
}

function EventCard({ event }) {
  return (
    /*
     * flex flex-col h-full: card container fills its grid cell (enforces uniform row height).
     * The blockquote/iframe keeps its natural height — no flex applied to it.
     * The empty spacer div below (flex-grow) absorbs any leftover height so the
     * iframe is never squished or cropped; shorter cards just get seamless white space below.
     */
    <div className="relative group rounded-2xl overflow-hidden shadow-sm hover-lift flex flex-col h-full bg-white">
      <a
        href={event.url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-10 rounded-2xl"
        aria-label={`View "${event.title}" on Instagram`}
      />
      {/* Instagram embed at its natural height — never stretched */}
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={event.url}
        data-instgrm-version="14"
        style={{
          background: '#fff',
          border: 0,
          borderRadius: '16px',
          boxShadow: '0 0 1px 0 rgba(0,0,0,.5),0 1px 10px 0 rgba(0,0,0,.15)',
          margin: '0 auto',
          padding: 0,
          width: '100%',
          minWidth: 'unset',
          maxWidth: '100%',
        }}
      />
      {/* Spacer: grows to fill remaining cell height without touching the iframe */}
      <div className="flex-grow bg-white" />
    </div>
  )
}

export default function Events() {
  useInstagramEmbeds()

  return (
    <section id="events">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-[#C69C6D] font-bold text-xs tracking-widest uppercase flex items-center gap-1.5">
            <i className="fa-brands fa-instagram" /> Instagram
          </span>
          <h2 className="text-3xl font-black text-white mt-2">Our Events</h2>
          <p className="text-white/60 mt-1 text-sm">
            Click any post to view it on Instagram.
          </p>
        </div>

        <a
          href="https://www.instagram.com/utp.army/"
          target="_blank"
          rel="noopener noreferrer"
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 shrink-0"
          style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)' }}
        >
          <i className="fa-brands fa-instagram" />
          View More @utp.army
        </a>
      </div>

      {/* Uniform grid — CSS grid enforces equal height per row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 ig-embed-wrap items-stretch">
        {EVENTS.map(event => (
          <div key={event.id} className="h-full">
            <EventCard event={event} />
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-10">
        <a
          href="https://www.instagram.com/utp.army/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
          style={{ background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)' }}
        >
          <i className="fa-brands fa-instagram text-lg" />
          See All Posts on @utp.army
        </a>
      </div>
    </section>
  )
}
