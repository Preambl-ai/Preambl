import { useState, type ReactNode } from 'react'
import { useReveal } from '@/lib/useReveal'

interface Props {
  id?: string
  title: ReactNode
  children: ReactNode
  /** Graphic renderer; receives `play` once the section has entered. */
  graphic: (play: boolean) => ReactNode
  reverse?: boolean
}

/** One educational section: headline, copy, and a graphic. */
export default function Section({ id, title, children, graphic, reverse }: Props) {
  const [play, setPlay] = useState(false)
  const ref = useReveal<HTMLElement>(() => setPlay(true))
  return (
    <section id={id} ref={ref} className="section">
      <div className={`container section-grid ${reverse ? 'reverse' : ''}`}>
        <div className="copy">
          <h2 className="h1 reveal">{title}</h2>
          {children}
        </div>
        <div className="reveal">{graphic(play)}</div>
      </div>
    </section>
  )
}
