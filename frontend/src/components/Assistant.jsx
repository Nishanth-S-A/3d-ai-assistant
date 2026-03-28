import React, { useEffect, useMemo } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export default function Assistant({ isThinking }) {
  // Point this to your file in /frontend/public/model.glb
  const { scene, animations } = useGLTF('/model.glb')
  const { actions } = useAnimations(animations, scene)

  const { idleAnim, talkAnim } = useMemo(() => {
    if (!actions || Object.keys(actions).length === 0) return { idleAnim: null, talkAnim: null }

    const actionValues = Object.values(actions)
    
    // Improved matching logic
    const findAnim = (patterns) => {
      // 1. Try exact match from predefined names
      for (const p of patterns) {
        if (actions[p]) return actions[p]
      }
      // 2. Try case-insensitive substring match
      return actionValues.find(a => 
        patterns.some(p => a._clip.name.toLowerCase().includes(p.toLowerCase()))
      )
    }

    const idle = findAnim(['idle', 'wait', 'stay'])
    const talking = findAnim(['talking', 'speak', 'talk', 'mouth'])

    return { idleAnim: idle, talkAnim: talking }
  }, [actions])

  useEffect(() => {
    if (isThinking) {
      idleAnim?.fadeOut(0.3)
      talkAnim?.reset().fadeIn(0.3).play()
    } else {
      talkAnim?.fadeOut(0.3)
      idleAnim?.reset().fadeIn(0.3).play()
    }

    return () => {
      idleAnim?.stop()
      talkAnim?.stop()
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