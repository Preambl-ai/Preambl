/**
 * Preambl design tokens — the single source of truth.
 * The three.js scene, SVG graphics and CSS all read from here.
 * `injectTokens()` mirrors everything into CSS custom properties on :root.
 */

export const color = {
  // Silk palette: Night / Oxblood / Wine / Clay / Copper / Sand / Peach. No pure black or white.
  // Backgrounds: Night is the page, Oxblood the deep surface
  bg0: '#1A0607', // Night
  bg1: '#220609',
  bg2: '#2D050A', // Oxblood
  bg3: '#3B0B12', // brand maroon

  // Accent: Copper, used as light (glow, traces, links), never as a big flat fill
  accent: '#B88767',
  accentHi: '#D7B599', // Sand: highlights
  // Peach is the "signal" colour: key marks, pulses, hottest flashes
  amber: '#F6DAC7',
  // Hottest energy core
  core: '#FBE9DC',

  // Chip metal: cast copper
  graphite: '#2B100F',
  graphiteHi: '#4A2420',
  silver: '#9C6F55',
  silverHi: '#F6DAC7', // Peach

  // Linework: Wine and Clay
  line: '#7A4A3C', // Clay, lifted so linework reads on Oxblood
  lineHi: '#B88767', // Copper
  grid: '#2B0C0D',

  // Text: Peach on dark
  text: '#F6DAC7',
  textDim: '#C4A898', // Peach at ~75%
  textMute: '#A57B60', // Copper, for small technical labels
} as const

export const font = {
  heading: "'Montserrat', 'Inter', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace",
} as const

export const space = {
  gutter: 'clamp(16px, 5vw, 96px)',
  sectionY: 'clamp(96px, 14vh, 200px)',
  maxW: '1240px',
  maxText: '640px',
} as const

export const radius = {
  sm: '2px',
  md: '4px',
} as const

/** Easing curves. CSS strings + matching GSAP ease names. */
export const ease = {
  // "power on" — slow start, confident settle
  powerOn: 'cubic-bezier(0.22, 1, 0.36, 1)',
  powerOnGsap: 'power3.out',
  // symmetric for scrubbed motion
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  inOutGsap: 'power2.inOut',
  // linear for pulses travelling along traces
  linear: 'linear',
} as const

export const duration = {
  fast: 0.32,
  base: 0.8,
  slow: 1.4,
  reveal: 1.1,
} as const

/** Line weights shared by SVG graphics and the chip linework. */
export const stroke = {
  hair: 1,
  thin: 1.25,
  trace: 1.5,
} as const

/** Scene-specific numbers so the 3D scene and page agree. */
export const scene = {
  heroScrollVh: 350, // scroll distance that scrubs the hero (in vh)
  powerStart: 0.02, // uProgress at which the chip begins to power up
  powerFull: 0.68, // uProgress at which the chip is fully powered
  dollyEnd: 0.4, // camera dolly finishes, arc begins
  maxDpr: 1.75,
} as const

export const tokens = { color, font, space, radius, ease, duration, stroke, scene }
export type Tokens = typeof tokens

/** Hex → [r,g,b] in 0..1 (for shader uniforms). */
export function hexToRgb01(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = parseInt(h, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/** Writes every token to :root as --<group>-<key>. Idempotent. */
export function injectTokens() {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const groups: Record<string, Record<string, string | number>> = {
    color,
    font,
    space,
    radius,
    ease: { powerOn: ease.powerOn, inOut: ease.inOut, linear: ease.linear },
    dur: {
      fast: `${duration.fast}s`,
      base: `${duration.base}s`,
      slow: `${duration.slow}s`,
      reveal: `${duration.reveal}s`,
    },
  }
  for (const [g, vals] of Object.entries(groups)) {
    for (const [k, v] of Object.entries(vals)) {
      root.style.setProperty(`--${g}-${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}`, String(v))
    }
  }
}
