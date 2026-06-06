import { useRef } from 'react'

const ACTIVITIES = [
  {
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=400',
    badge: 'Completed',
    title: "Iftar Jamai'e & MnA Engagement",
    description: 'Bringing the ARMy community together for an evening of connection and strategic planning with MnA.',
  },
  {
    image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&q=80&w=400',
    badge: 'Partnership',
    title: 'FESCO 2026 Sponsorship',
    description: 'Business and sponsorship execution for the Festival of Colours of the World.',
  },
  {
    image: 'https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=400',
    badge: null,
    title: 'KSS 2.0 Program',
    description: 'A comprehensive 4-day, 3-night development initiative managed by the core team.',
  },
  {
    image: 'https://images.unsplash.com/photo-1523580494112-071dcb849ea4?auto=format&fit=crop&q=80&w=400',
    badge: null,
    title: "O'Week 2026 Directorship",
    description: "Leading the university-wide orientation week, from briefings to full-scale event coordination.",
  },
]

export default function Activities() {
  const sliderRef = useRef(null)

  return (
    <section id="activities">
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-gold font-bold text-xs tracking-widest uppercase">Portfolio</span>
          <h2 className="text-3xl font-black text-gray-900 mt-2">Recent Activities</h2>
        </div>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => sliderRef.current?.scrollBy({ left: -350, behavior: 'smooth' })}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#003865] hover:border-[#003865] transition"
          >
            <i className="fa-solid fa-chevron-left" />
          </button>
          <button
            onClick={() => sliderRef.current?.scrollBy({ left: 350, behavior: 'smooth' })}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#003865] hover:border-[#003865] transition"
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="flex overflow-x-auto gap-6 snap-x snap-mandatory hide-scroll pb-8 -mx-6 px-6 md:mx-0 md:px-0"
      >
        {ACTIVITIES.map((a, i) => (
          <div
            key={i}
            className="snap-start shrink-0 w-80 bg-white rounded-2xl border border-gray-100 shadow-sm hover-lift overflow-hidden"
          >
            <div className="h-40 bg-gray-200 relative">
              <img src={a.image} alt={a.title} className="w-full h-full object-cover" />
              {a.badge && (
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded text-[#003865]">
                  {a.badge}
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">{a.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{a.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
