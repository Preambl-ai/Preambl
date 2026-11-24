import { Color } from 'three'
import { color, lightColor, type Theme } from '@/tokens'

/**
 * Stage (background / floor) colours for the 3D scene.
 * In light mode the page colour is pushed above 1.0 so that, after the ACES tone mapping
 * pass, the canvas lands on the same near-white as the page around it.
 */
export const LIGHT_LIFT = 2.4

export function stageColor(theme: Theme, key: 'bg0' | 'bg1' | 'line'): Color {
  if (theme === 'light') return new Color(lightColor[key]).multiplyScalar(key === 'line' ? 1 : LIGHT_LIFT)
  return new Color(color[key])
}
