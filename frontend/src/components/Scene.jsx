import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import Assistant from './Assistant'

export default function Scene({ isThinking }) {
  return (
    <Canvas camera={{ position: [0, 1.5, 3], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} />
      <Assistant isThinking={isThinking} />
      <Environment preset="city" />
      <ContactShadows opacity={0.4} scale={10} blur={2.5} far={4} />
      <OrbitControls enablePan={false} minDistance={2} maxDistance={5} />
    </Canvas>
  )
}