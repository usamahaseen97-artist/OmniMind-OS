"use client";

import { Canvas } from "@react-three/fiber";
import { Box, Environment, Grid, OrbitControls, Text } from "@react-three/drei";
import { useMemo } from "react";
import type { SceneAsset } from "./scene-asset-types";

export type { SceneAsset };

function parseDesignSpec(prompt: string) {
  const lower = prompt.toLowerCase();
  const roomMatch = lower.match(/(\d+)\s*(?:bed|room|bhk)/);
  const rooms = roomMatch ? Math.min(12, parseInt(roomMatch[1], 10)) : 4;
  const hasPool = /pool|swimming|piscine/.test(lower);
  const wide = /500|luxury|villa|dual|double/.test(lower);
  const scaleX = wide ? 2.4 : 1.6;
  const scaleZ = wide ? 1.8 : 1.2;
  const height = 0.35 + rooms * 0.04;
  return { rooms, hasPool, scaleX, scaleZ, height };
}

function Building({ prompt }: { prompt: string }) {
  const spec = useMemo(() => parseDesignSpec(prompt), [prompt]);
  return (
    <group position={[0, spec.height / 2, 0]}>
      <Box args={[spec.scaleX, spec.height, spec.scaleZ]} castShadow receiveShadow>
        <meshStandardMaterial color="#1a122e" metalness={0.35} roughness={0.45} />
      </Box>
      {spec.hasPool ? (
        <mesh position={[0, -spec.height / 2 + 0.02, spec.scaleZ * 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[spec.scaleX * 0.55, spec.scaleZ * 0.35]} />
          <meshStandardMaterial color="#0ea5e9" transparent opacity={0.75} />
        </mesh>
      ) : null}
      <Text position={[0, spec.height / 2 + 0.12, 0]} fontSize={0.12} color="#c084fc" anchorX="center">
        {`${spec.rooms} BR · ${spec.hasPool ? "Pool" : "Garden"}`}
      </Text>
    </group>
  );
}

function AssetMarker({ asset }: { asset: SceneAsset }) {
  return (
    <group position={[asset.x, 0.15, asset.z]}>
      <Box args={[0.18, 0.18, 0.18]}>
        <meshStandardMaterial color="#a855f7" emissive="#7c3aed" emissiveIntensity={0.35} />
      </Box>
    </group>
  );
}

interface ArchitecturalScene3DProps {
  prompt: string;
  assets: SceneAsset[];
}

export function ArchitecturalScene3D({ prompt, assets }: ArchitecturalScene3DProps) {
  return (
    <Canvas shadows camera={{ position: [4, 3.5, 5], fov: 42 }} className="h-full w-full touch-none">
      <color attach="background" args={["#07040d"]} />
      <ambientLight intensity={0.45} />
      <directionalLight castShadow intensity={1.1} position={[6, 8, 4]} />
      <Environment preset="city" />
      <Grid infiniteGrid fadeDistance={28} cellColor="#a855f733" sectionColor="#a855f766" />
      <Building prompt={prompt} />
      {assets.map((a) => (
        <AssetMarker key={a.id} asset={a} />
      ))}
      <OrbitControls makeDefault enablePan enableZoom maxPolarAngle={Math.PI / 2.1} minDistance={2} maxDistance={14} />
    </Canvas>
  );
}
