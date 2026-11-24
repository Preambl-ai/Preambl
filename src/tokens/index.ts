/**
 * Preambl design tokens — the single source of truth.
 * The three.js scene, SVG graphics and CSS all read from here.
 * `injectTokens()` mirrors everything into CSS custom properties on :root.
 */

export const color = {
  // Silk palette: Night / Oxblood / Wine / Clay / Copper / Sand / Peach. No pure black or white.
  // Backgrounds: Night is the page, Oxblood the deep surface
  bg0: '#060C1C', // Deep Space
  bg1: '#09152A',
  bg2: '#0B1A33', // Navy
  bg3: '#14284A',

  // Accent: Signal Blue
  accent: '#4A86E5',
  accentHi: '#8CAAE6', // Starlight: highlights
  // Mist is the "signal" colour: key marks, pulses, hottest flashes
  amber: '#F0F4FA',
  // Hottest energy core
  core: '#FFFFFF',

  // Chip metal: blued steel
  graphite: '#0F2142',
  graphiteHi: '#264678', // Steel
  silver: '#5A7FBA',
  silverHi: '#8CAAE6', // Starlight

  // Linework: Steel
  line: '#2F5590', // Steel, lifted so linework reads on Navy
  lineHi: '#4A86E5', // Signal Blue
  grid: '#0C1A33',

  // Text: Mist on dark
  text: '#F0F4FA',
  textDim: '#A9B9D8',
  textMute: '#7C98CC', // for small technical labels
} as const

/**
 * Light theme: white page, blue type. Same keys as `color`; only the page (CSS) uses it.
 * The 3D chip keeps the dark material colours and sits on a light stage.
 */
export const lightColor: Record<keyof typeof color, string> = {
  bg0: '#F7F9FD',
  bg1: '#F0F4FA', // Mist
  bg2: '#FFFFFF', // panels
  bg3: '#E3EAF6',

  accent: '#4A86E5', // Signal Blue
  accentHi: '#264678', // Steel
  amber: '#4A86E5',
  core: '#0F2A5C',

  graphite: '#0F2142',
  graphiteHi: '#264678',
  silver: '#5A7FBA',
  silverHi: '#264678',

  line: '#C3D2EA',
  lineHi: '#4A86E5',
  grid: '#E6ECF6',

  text: '#0F2A5C', // deep blue
  textDim: '#33507F',
  textMute: '#5D7CB0',
}

/** RGB triplets for translucent overlays (nav fade, hero fade, backdrop shading). */
export const overlayRgb = { dark: '6, 12, 28', light: '247, 249, 253' } as const

export type Theme = 'dark' | 'light'

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
export function injectTokens(theme: Theme = 'dark') {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.dataset.theme = theme
  root.style.setProperty('--overlay-rgb', overlayRgb[theme])
  const groups: Record<string, Record<string, string | number>> = {
    color: theme === 'light' ? lightColor : color,
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
