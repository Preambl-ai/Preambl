import { useEffect, useState, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { heroProgress } from '@/lib/progressStore'
import { scrollToTarget } from '@/lib/lenis'
import { toggleTheme, useTheme } from '@/lib/theme'
import { openContact } from './contact'
import ContactModal from './ContactModal'
import './Nav.css'

export function Wordmark({ className = '' }: { className?: string }) {
  const theme = useTheme()
  return (
    <Link to="/" className={`wordmark ${className}`} aria-label="Preambl home">
      <img src="/preambl-logo.svg" alt="" className="wordmark__icon" width="40" height="40" />
      <img src={theme === 'light' ? '/wordmark-navy.svg' : '/wordmark.svg'} alt="Preambl" className="wordmark__img" />
    </Link>
  )
}

/** Small sun/moon switch. Shows the sun in dark mode (go light) and the moon in light mode (go dark). */
function ThemeToggle() {
  const theme = useTheme()
  const light = theme === 'light'
  return (
    <button
      className="nav__theme"
      onClick={toggleTheme}
      aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'}
      title={light ? 'Dark mode' : 'Light mode'}
    >
      {light ? (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  )
}

export default function Nav() {
  const location = useLocation()
  const navigate = useNavigate()
  const onHome = location.pathname === '/'
  const [dim, setDim] = useState(onHome && heroProgress.value < 0.98)

  useEffect(() => {
    setDim(onHome && heroProgress.value < 0.98)
    return heroProgress.subscribe((v) => setDim(onHome && v < 0.98))
  }, [onHome])

  const goTechnology = (e: MouseEvent) => {
    e.preventDefault()
    if (!onHome) {
      navigate('/#technology')
      return
    }
    scrollToTarget('#technology', -24)
  }

  return (
    <>
      <header className={`nav ${dim ? 'nav--dim' : ''}`}>
        <Wordmark />
        <nav className="nav__links" aria-label="Primary">
          <a href="/#technology" onClick={goTechnology} className="nav__link">
            Technology
          </a>
          <button className="nav__cta" onClick={() => openContact()}>
            Contact
          </button>
          <ThemeToggle />
        </nav>
      </header>
      <ContactModal />
    </>
  )
}
