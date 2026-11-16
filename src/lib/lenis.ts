import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let lenis: Lenis | null = null

/** Smoothing per wheel step: lower = floatier. The pinned hero wants the float; the page below should track the wheel. */
export const LERP = { hero: 0.1, page: 0.32 } as const
// Remembered so a value set before Lenis exists (Hero mounts first) still applies.
let currentLerp: number = LERP.page

/** Creates (once) a Lenis instance synced with GSAP ScrollTrigger. */
export function initLenis(enabled: boolean) {
  if (lenis || !enabled) return lenis
  lenis = new Lenis({
    lerp: currentLerp,
    smoothWheel: true,
    syncTouch: false, // native touch scrolling feels best on mobile; Lenis still reports scroll
    touchMultiplier: 1.2,
  })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis?.raf(time * 1000))
  return lenis
}

export function getLenis() {
  return lenis
}

/** Switch smoothing live (Lenis reads `options.lerp` on every wheel event). */
export function setScrollLerp(lerp: number) {
  currentLerp = lerp
  if (lenis) lenis.options.lerp = lerp
}

/** Scroll to a target with Lenis when available, else native. */
export function scrollToTarget(target: string | HTMLElement | number, offset = 0) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 3) })
    return
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target + offset, behavior: 'smooth' })
    return
  }
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: 'smooth' })
}
