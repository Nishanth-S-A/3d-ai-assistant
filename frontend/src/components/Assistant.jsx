import React, { useEffect, useMemo, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export default function Assistant({ isThinking, currentAction = 'idle' }) {
  // Point this to your file in /frontend/public/model.glb
  const { scene, animations } = useGLTF('/model.glb')
  const { actions } = useAnimations(animations, scene)

  const anims = useMemo(() => {
    if (!actions || Object.keys(actions).length === 0) return { idleAnim: null, talkAnim: null, standAnim: null, entryAnim: null, waveAnim: null, cheerAnim: null, clapAnim: null }

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

    const idleAnim = findAnim(['idle', 'wait', 'stay'])
    const talkAnim = findAnim(['talking', 'speak', 'talk', 'mouth'])
    const standAnim = findAnim(['stand', 'up'])
    const entryAnim = findAnim(['entry', 'enter', 'hello'])
    const waveAnim = findAnim(['wave', 'waving'])
    const cheerAnim = findAnim(['cheer', 'cheering', 'victory'])
    const clapAnim = findAnim(['clap', 'clapping'])

    return { idleAnim, talkAnim, standAnim, entryAnim, waveAnim, cheerAnim, clapAnim }
  }, [actions])

  const previousAction = useRef(null)

  useEffect(() => {
    let targetAnimName = 'idleAnim'

    if (currentAction === 'stand') targetAnimName = 'standAnim'
    else if (currentAction === 'entry') targetAnimName = 'entryAnim'
    else if (currentAction === 'waving') targetAnimName = 'waveAnim'
    else if (currentAction === 'cheering') targetAnimName = 'cheerAnim'
    else if (currentAction === 'clapping') targetAnimName = 'clapAnim'
    else if (currentAction === 'talking' || isThinking) targetAnimName = 'talkAnim'

    const targetAction = anims[targetAnimName] || anims.idleAnim

    if (previousAction.current && previousAction.current !== targetAction) {
      previousAction.current.fadeOut(0.3)
    }

    if (targetAction) {
      targetAction.reset().fadeIn(0.3).play()
      previousAction.current = targetAction
    }
  }, [currentAction, isThinking, anims])

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      Object.values(anims).forEach(anim => anim?.stop())
    }
  }, [anims])

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