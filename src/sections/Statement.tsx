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

export default function Statement() {
  const root = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const words = Array.from(el.querySelectorAll<HTMLSpanElement>('.stmt__c'))
    const paint = (p: number) => {
      const head = p * (words.length + SOFTNESS)
      for (let i = 0; i < words.length; i++) {
        const t = Math.min(1, Math.max(0, (head - i) / SOFTNESS))
        words[i].style.opacity = String(DIM + (1 - DIM) * t)
      }
    }
    if (reduced) {
      paint(1)
      return
    }
    // Progress is read straight from where the text sits on screen, so the hero's pinned
    // scroll can't throw it off. It starts when the section top reaches 70% down the screen
    // and finishes when the last line's bottom reaches 72%, which is always reachable.
    const last = el.querySelector<HTMLElement>('.stmt__block:last-child') ?? el
    let frame = 0
    const update = () => {
      frame = 0
      const vh = window.innerHeight
      const top = el.getBoundingClientRect().top
      const span = last.getBoundingClientRect().bottom - top - 0.02 * vh
      paint(Math.min(1, Math.max(0, (0.7 * vh - top) / Math.max(1, span))))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
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
