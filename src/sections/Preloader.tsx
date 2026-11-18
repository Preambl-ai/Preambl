import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import './Preloader.css'

interface Props {
  ready: boolean
  onDone: () => void
}

/**
 * Minimal preloader: the logo's eight bars (1010 0101) lighting in steps, plus a percentage.
 * Climbs to ~85% on a timer while shaders compile, snaps to 100% on `ready`,
 * then crossfades into the dormant chip. The overlay shares the page
 * background so there is never a flash of empty canvas.
 */
export default function Preloader({ ready, onDone }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const bits = useRef<HTMLDivElement>(null)
  const pct = useRef<HTMLSpanElement>(null)
  const state = useRef({ v: 0 })
  const tween = useRef<gsap.core.Tween | null>(null)
  const done = useRef(onDone)
  done.current = onDone
  const lit = (v: number) => {
    const n = Math.round(v * 8)
    bits.current?.querySelectorAll('span').forEach((el, i) => el.classList.toggle('is-lit', i < n))
  }

  useEffect(() => {
    const s = state.current
    const render = () => {
      lit(s.v)
      if (pct.current) pct.current.textContent = `${Math.round(s.v * 100).toString().padStart(3, '0')}`
    }
    tween.current = gsap.to(s, { v: 0.86, duration: 1.1, ease: 'power2.out', onUpdate: render })
    return () => {
      tween.current?.kill()
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    const s = state.current
    tween.current?.kill()
    const tl = gsap.timeline({ onComplete: () => done.current() })
    tl.to(s, {
      v: 1,
      duration: 0.28,
      ease: 'power2.inOut',
      onUpdate: () => {
        lit(s.v)
        if (pct.current) pct.current.textContent = `${Math.round(s.v * 100).toString().padStart(3, '0')}`
      },
    })
      .to(root.current, { opacity: 0, duration: 0.65, ease: 'power2.inOut' }, '+=0.1')
    return () => {
      tl.kill()
    }
  }, [ready])

  return (
    <div ref={root} className="preloader" aria-live="polite" aria-busy={!ready}>
      <div className="preloader__inner">
        <div ref={bits} className="preloader__bits" aria-hidden>
          {[1, 0, 1, 0, 0, 1, 0, 1].map((b, i) => (
            <span key={i} className={b ? 'is-tall' : ''} />
          ))}
        </div>
        <span className="mono preloader__pct">
          <span ref={pct}>000</span>
          <span className="preloader__unit">%</span>
        </span>
      </div>
    </div>
  )
}
