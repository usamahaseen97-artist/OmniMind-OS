"use client";

import { Canvas } from "@react-three/fiber";
import { Box, ContactShadows, Environment, MeshTransmissionMaterial, OrbitControls, Text } from "@react-three/drei";
import { useMemo } from "react";
import type { SceneAsset } from "./scene-asset-types";
import { SpatialCanvasSizeSync } from "./SpatialCanvasSizeSync";

function parseSpec(prompt: string, interior: boolean) {
  const lower = prompt.toLowerCase();
  const rooms = Math.min(12, parseInt(lower.match(/(\d+)\s*(?:bed|room)/)?.[1] ?? "4", 10));
  const hasPool = /pool|swimming/.test(lower);
  const glass = /glass|window|facade|curtain/.test(lower) || interior;
  return { rooms, hasPool, glass, interior };
}

function CinematicExterior({ prompt }: { prompt: string }) {
  const spec = useMemo(() => parseSpec(prompt, false), [prompt]);
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
      <group position={[0, 0.9, 0]}>
        <Box args={[2.8, 1.8, 2.2]} castShadow receiveShadow>
          <meshPhysicalMaterial color="#e2e8f0" metalness={0.15} roughness={0.35} clearcoat={0.6} />
        </Box>
        {spec.glass ? (
          <Box args={[2.82, 1.2, 0.05]} position={[0, 0.2, 1.12]}>
            <MeshTransmissionMaterial backside thickness={0.4} roughness={0.05} transmission={0.92} ior={1.45} />
          </Box>
        ) : null}
      </group>
      {spec.hasPool ? (
        <mesh position={[0, 0.02, 2.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 1.6]} />
          <meshPhysicalMaterial color="#38bdf8" metalness={0.2} roughness={0.1} transparent opacity={0.85} />
        </mesh>
      ) : null}
      <Text position={[0, 2.2, 0]} fontSize={0.14} color="#f8fafc" anchorX="center">
        Cinematic Exterior · {spec.rooms} BR
      </Text>
      <ContactShadows opacity={0.45} scale={12} blur={2.5} far={8} />
    </group>
  );
}

function CinematicInterior({ prompt }: { prompt: string }) {
  const spec = useMemo(() => parseSpec(prompt, true), [prompt]);
  return (
    <group>
      <Box args={[5, 0.08, 4]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </Box>
      <Box args={[5, 2.8, 0.12]} position={[0, 1.4, -2]}>
        <meshStandardMaterial color="#334155" />
      </Box>
      <Box args={[0.12, 2.8, 4]} position={[-2.5, 1.4, 0]}>
        <meshStandardMaterial color="#475569" />
      </Box>
      <Box args={[1.8, 0.45, 0.9]} position={[-1.2, 0.25, 0.8]} castShadow>
        <meshPhysicalMaterial color="#78716c" roughness={0.55} />
      </Box>
      <Box args={[0.9, 1.4, 0.08]} position={[1.5, 0.75, -1.9]}>
        <MeshTransmissionMaterial transmission={0.85} thickness={0.2} roughness={0.08} />
      </Box>
      <pointLight position={[1.5, 2.2, 1]} intensity={1.2} color="#fbbf24" />
      <Text position={[0, 2.5, 0]} fontSize={0.12} color="#e2e8f0" anchorX="center">
        Interior Composition · {spec.rooms} zones
      </Text>
      <ContactShadows opacity={0.35} scale={8} blur={2} />
    </group>
  );
}

function AssetGlow({ asset }: { asset: SceneAsset }) {
  return (
    <mesh position={[asset.x, 0.2, asset.z]}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="#94a3b8" emissive="#64748b" emissiveIntensity={0.5} />
    </mesh>
  );
}

export function CinematicScene3D({
  prompt,
  assets,
  variant,
}: {
  prompt: string;
  assets: SceneAsset[];
  variant: "exterior" | "interior";
}) {
  return (
    <Canvas
      shadows
      camera={{ position: variant === "interior" ? [3, 2.5, 4] : [5, 4, 6], fov: 38 }}
      className="!absolute inset-0 h-full w-full"
      resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
    >
      <SpatialCanvasSizeSync />
      <color attach="background" args={["#0a0f1a"]} />
      <fog attach="fog" args={["#0a0f1a", 8, 22]} />
      <ambientLight intensity={0.35} />
      <directionalLight castShadow intensity={1.4} position={[5, 8, 3]} color="#fff7ed" />
      <Environment preset="sunset" />
      {variant === "interior" ? <CinematicInterior prompt={prompt} /> : <CinematicExterior prompt={prompt} />}
      {assets.map((a) => (
        <AssetGlow key={a.id} asset={a} />
      ))}
      <OrbitControls enablePan enableZoom maxPolarAngle={Math.PI / 2.05} minDistance={2.5} maxDistance={16} />
    </Canvas>
  );
}
