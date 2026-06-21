"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { SpatialCanvasSizeSync } from "../ide/matrix/live/SpatialCanvasSizeSync";

function OrganMesh() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 48, 48]} />
        <MeshDistortMaterial color="#fb7185" roughness={0.35} metalness={0.15} distort={0.28} speed={1.2} />
      </mesh>
      <Sphere args={[0.35, 24, 24]} position={[0.55, 0.2, 0.3]}>
        <meshStandardMaterial color="#fda4af" emissive="#9f1239" emissiveIntensity={0.25} />
      </Sphere>
    </group>
  );
}

export function MedicalVolumetricScene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.5], fov: 45 }}
      className="!absolute inset-0 h-full w-full"
      resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
    >
      <SpatialCanvasSizeSync />
      <color attach="background" args={["#0a0416"]} />
      <ambientLight intensity={0.45} />
      <directionalLight intensity={1.1} position={[4, 6, 3]} />
      <OrganMesh />
      <OrbitControls enablePan enableZoom minDistance={2} maxDistance={8} />
    </Canvas>
  );
}
