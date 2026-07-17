/**
 * Parallax utilities for public-facing pages only.
 * NOT imported by Dashboard, HicomDashboard, or Login.
 *
 * Two hooks + one component:
 *   useHeroParallax(speed)   — for elements at the very top of the page (uses raw scrollY)
 *   useMidParallax(speed)    — for mid-page elements (uses rect-center relative to viewport)
 *   <ParallaxBand>           — pre-built section with parallax bg + dark overlay + foreground slot
 */

import { useRef, useEffect, useCallback } from 'react'

/* ─── Hero parallax ─────────────────────────────────────────────────────────
 * Returns a ref to attach to the element that should move slower.
 * As scrollY increases, the element gets translateY(+scrollY * speed),
 * which counters the page's upward movement, making it appear to lag behind.
 * Net viewport speed = (1 - speed) × scroll rate.
 */
export function useHeroParallax(speed = 0.3) {
  const ref = useRef(null)

  useEffect(() => {
    let raf
    const tick = () => {
      if (ref.current) {
        ref.current.style.transform = `translateY(${window.scrollY * speed}px)`
      }
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    tick()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [speed])

  return ref
}

/* ─── Mid-page parallax ─────────────────────────────────────────────────────
 * Returns [outerRef, innerRef].
 * Attach outerRef to the clip container and innerRef to the parallax layer.
 * Uses rect-center-relative calculation so it works at any scroll position.
 */
export function useMidParallax(speed = 0.25) {
  const outerRef = useRef(null)
  const innerRef = useRef(null)

  const tick = useCallback(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return
    const rect = outer.getBoundingClientRect()
    const vh = window.innerHeight
    // Skip update when element is far off-screen
    if (rect.bottom < -120 || rect.top > vh + 120) return
    // Distance of element center from viewport center (negative = above)
    const relCenter = rect.top + rect.height / 2 - vh / 2
    inner.style.transform = `translateY(${relCenter * speed}px)`
  }, [speed])

  useEffect(() => {
    let raf
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', tick, { passive: true })
    tick()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', tick)
      cancelAnimationFrame(raf)
    }
  }, [tick])

  return [outerRef, innerRef]
}

/* ─── ParallaxBand ──────────────────────────────────────────────────────────
 * A full-width section with a parallax background layer.
 *
 * Props:
 *   bgStyle    — inline styles for the parallax layer (background, backgroundImage…)
 *   overlay    — rgba string for the dark overlay. Default dark enough for white text.
 *   minHeight  — section height
 *   speed      — parallax speed fraction (0 = static, 0.5 = half speed, …)
 *   children   — foreground content (rendered above the overlay at z-index 2)
 */
export function ParallaxBand({
  bgStyle   = {},
  overlay   = 'rgba(2, 8, 20, 0.52)',
  minHeight = '52vh',
  speed     = 0.28,
  children,
}) {
  const [outerRef, innerRef] = useMidParallax(speed)

  return (
    <div
      ref={outerRef}
      style={{ position: 'relative', overflow: 'hidden', minHeight }}
    >
      {/* Background — extends ±30% vertically so movement never exposes the clip edge */}
      <div
        ref={innerRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-30%',
          bottom: '-30%',
          left: 0,
          right: 0,
          willChange: 'transform',
          ...bgStyle,
        }}
      />

      {/* Readability overlay */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, background: overlay }}
      />

      {/* Foreground content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  )
}
