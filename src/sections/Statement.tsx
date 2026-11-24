import { Fragment, useLayoutEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/lib/hooks'
import './Statement.css'

/**
 * Big statement copy that lights up word by word as you scroll.
 * Each paragraph is one block; words further down stay dim until the reader reaches them.
 */
/** Each inner array is one block; lines in a block sit tight, blocks are spaced apart. */
const BLOCKS: string[][] = [
  ['Every frame a camera understands.', 'Every word a device hears.', 'Every sensor that thinks on milliwatts.', 'Every answer, without a server.'],
  ['That’s inference.'],
  ['And most of it is spent waiting.'],
  ['Today’s chips burn their time and energy fetching weights from memory.'],
  ['Preambl puts the weights in the silicon.'],
  ['The model is not loaded onto the chip.'],
  ['The model is the chip.'],
  ['Nothing to fetch. Nothing to wait on.'],
  ['Identical on every unit. For years.'],
]

/** Length of the soft edge (in letters) between lit and unlit text, so it sweeps like a reader's eye. */
const SOFTNESS = 14
const DIM = 0.16
/** Eye level: a line finishes lighting up when it reaches this point (fraction of screen height from the top). */
const EYE = 0.42
/** A line starts lighting this far below eye level (fraction of screen height), sweeping left to right. */
const BAND = 0.14
/** Over the last stretch of scroll (fraction of screen height) eye level slides to the screen bottom, so every line is lit at the end. */
const BOTTOM_RAMP = 0.3

export default function Statement() {
  const root = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const chars = Array.from(el.querySelectorAll<HTMLSpanElement>('.stmt__c'))
    const setT = (c: HTMLSpanElement, t: number) => {
      c.style.opacity = String(DIM + (1 - DIM) * t)
    }
    if (reduced) {
      chars.forEach((c) => setT(c, 1))
      return
    }

    // Group letters into the visual lines they wrap onto (recomputed on resize / font load).
    type Line = { chars: HTMLSpanElement[]; probe: HTMLSpanElement }
    let lines: Line[] = []
    const measure = () => {
      lines = []
      let lastTop = Number.NaN
      for (const c of chars) {
        const y = Math.round(c.getBoundingClientRect().top)
        if (lines.length === 0 || Math.abs(y - lastTop) > 4) {
          lines.push({ chars: [], probe: c })
          lastTop = y
        }
        lines[lines.length - 1].chars.push(c)
      }
    }

    // Each line lights left to right as it rises through the band just below eye level,
    // and is fully lit once it reaches eye level.
    let frame = 0
    const update = () => {
      frame = 0
      const vh = window.innerHeight
      const doc = document.documentElement
      const remaining = doc.scrollHeight - (window.scrollY + vh)
      const ramp = Math.min(1, Math.max(0, 1 - remaining / (BOTTOM_RAMP * vh)))
      const eye = (EYE + (1 - EYE) * ramp) * vh
      const band = BAND * vh
      for (const line of lines) {
        const r = line.probe.getBoundingClientRect()
        const mid = r.top + r.height / 2
        const p = Math.min(1, Math.max(0, (eye + band - mid) / band))
        const n = line.chars.length
        const head = p * (n + SOFTNESS)
        for (let i = 0; i < n; i++) setT(line.chars[i], Math.min(1, Math.max(0, (head - i) / SOFTNESS)))
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const onResize = () => {
      measure()
      onScroll()
    }
    measure()
    update()
    document.fonts?.ready.then(onResize)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [reduced])

  return (
    <section ref={root} id="technology" className="stmt section" aria-label="What Preambl does">
      <div className="container stmt__inner">
        {BLOCKS.map((lines, bi) => (
          <div key={bi} className="stmt__block">
            {lines.map((line, li) => (
              <p key={li} className="stmt__p">
                {line.split(' ').map((w, wi) => (
                  <Fragment key={wi}>
                    <span className="stmt__w">
                      {Array.from(w).map((ch, ci) => (
                        <span key={ci} className="stmt__c">
                          {ch}
                        </span>
                      ))}
                    </span>{' '}
                  </Fragment>
                ))}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
