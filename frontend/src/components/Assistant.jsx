import React, { useEffect, useMemo } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export default function Assistant({ isThinking }) {
  // Point this to your file in /frontend/public/model.glb
  const { scene, animations } = useGLTF('/model.glb')
  const { actions } = useAnimations(animations, scene)

  const { idleAnim, talkAnim } = useMemo(() => {
    const actionValues = Object.values(actions || {})
    const idle = actions?.idle || actions?.Idle || actionValues.find((a) => a?._clip?.name?.toLowerCase() === 'idle')
    const talking =
      actions?.talking ||
      actions?.Talking ||
      actionValues.find((a) => a?._clip?.name?.toLowerCase() === 'talking')

    return { idleAnim: idle, talkAnim: talking }
  }, [actions])

  useEffect(() => {
    if (!idleAnim && !talkAnim) {
      return
    }

    if (isThinking) {
      idleAnim?.fadeOut(0.2)
      talkAnim?.reset().fadeIn(0.2).play()
    } else {
      talkAnim?.fadeOut(0.2)
      idleAnim?.reset().fadeIn(0.2).play()
    }
  }, [isThinking, idleAnim, talkAnim])

  return (
    <primitive
      object={scene}
      scale={1.2}          // Adjust based on your Blender export size
      position={[0, -1, 0]} // Positions feet on the "floor"
      rotation={[0, 0, 0]}
    />
  )
}

// Pre-load the model to prevent "popping" later
useGLTF.preload('/model.glb')