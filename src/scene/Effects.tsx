import { useMemo } from 'react'
import { Bloom, ChromaticAberration, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import { Vector2 } from 'three'

interface Props {
  mobile?: boolean
}

export default function Effects({ mobile = false }: Props) {
  const caOffset = useMemo(() => new Vector2(0.0007, 0.0007), [])

  return (
    <EffectComposer multisampling={mobile ? 0 : 4} enableNormalPass={false}>
      {/* threshold tuned so only energised areas bloom, not the metal */}
      <Bloom mipmapBlur intensity={1.25} luminanceThreshold={0.72} luminanceSmoothing={0.28} radius={0.72} />
      <ChromaticAberration offset={caOffset} radialModulation modulationOffset={0.45} blendFunction={BlendFunction.NORMAL} />
      <Vignette eskil={false} offset={0.22} darkness={0.62} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
