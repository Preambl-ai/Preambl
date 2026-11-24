import { useMemo } from 'react'
import { Bloom, ChromaticAberration, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import { Vector2 } from 'three'

interface Props {
  mobile?: boolean
  theme?: 'dark' | 'light'
}

export default function Effects({ mobile = false, theme = 'dark' }: Props) {
  const caOffset = useMemo(() => new Vector2(0.0007, 0.0007), [])

  return (
    <EffectComposer multisampling={mobile ? 0 : 4} enableNormalPass={false}>
      {/* threshold tuned so only energised areas bloom, not the metal */}
      <Bloom mipmapBlur intensity={1.25} luminanceThreshold={theme === 'light' ? 2.6 : 0.72} luminanceSmoothing={0.28} radius={0.72} />
      <ChromaticAberration offset={caOffset} radialModulation modulationOffset={0.45} blendFunction={BlendFunction.NORMAL} />
      {/* a dark vignette would grey the edges of the light stage */}
      <Vignette eskil={false} offset={0.22} darkness={theme === 'light' ? 0 : 0.62} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
