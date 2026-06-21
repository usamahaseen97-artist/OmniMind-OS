"use client";

import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { Box, Edges, Grid, OrbitControls, Text } from "@react-three/drei";
import { useMemo, useRef, useState, useCallback } from "react";
import type { SceneAsset } from "./scene-asset-types";
import { SpatialCanvasSizeSync } from "./SpatialCanvasSizeSync";

function parseSpec(prompt: string) {
  const lower = prompt.toLowerCase();
  const rooms = Math.min(12, parseInt(lower.match(/(\d+)\s*(?:bed|room)/)?.[1] ?? "4", 10));
  const hasPool = /pool|swimming/.test(lower);
  const wide = /500|luxury|villa|mall|office|commercial/.test(lower);
  return { rooms, hasPool, scaleX: wide ? 2.6 : 1.8, scaleZ: wide ? 2 : 1.4, height: 0.4 + rooms * 0.04 };
}

function WireBuilding({ prompt, interior }: { prompt: string; interior: boolean }) {
  const spec = useMemo(() => parseSpec(prompt), [prompt]);
  if (interior) {
    return (
      <group>
        <Box args={[4, 0.05, 3.2]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#1e293b" wireframe />
          <Edges color="#64748b" />
        </Box>
        <Box args={[4, 2.4, 3.2]} position={[0, 1.2, 0]}>
          <meshBasicMaterial color="#334155" transparent opacity={0.15} />
          <Edges color="#94a3b8" threshold={15} />
        </Box>
        <Text position={[0, 2.6, 0]} fontSize={0.11} color="#94a3b8" anchorX="center">
          Interior Matrix Grid
        </Text>
      </group>
    );
  }
  return (
    <group position={[0, spec.height / 2, 0]}>
      <Box args={[spec.scaleX, spec.height, spec.scaleZ]}>
        <meshBasicMaterial color="#1e293b" transparent opacity={0.2} />
        <Edges color="#94a3b8" threshold={12} />
      </Box>
      {spec.hasPool ? (
        <mesh position={[0, -spec.height / 2 + 0.02, spec.scaleZ * 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[spec.scaleX * 0.5, spec.scaleZ * 0.35]} />
          <meshBasicMaterial color="#0ea5e9" wireframe />
        </mesh>
      ) : null}
      <Text position={[0, spec.height / 2 + 0.15, 0]} fontSize={0.11} color="#94a3b8" anchorX="center">
        {`${spec.rooms} BR · Matrix Massing`}
      </Text>
    </group>
  );
}

function DraggableAsset({
  asset,
  onDrag,
  onDragActive,
}: {
  asset: SceneAsset;
  onDrag?: (id: string, x: number, z: number) => void;
  onDragActive?: (active: boolean) => void;
}) {
  const [pos, setPos] = useState<[number, number, number]>([asset.x, 0.15, asset.z]);
  const dragging = useRef(false);

  return (
    <mesh
      position={pos}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        dragging.current = true;
        onDragActive?.(true);
        e.stopPropagation();
        (e.target as unknown as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onPointerUp={(e: ThreeEvent<PointerEvent>) => {
        dragging.current = false;
        onDragActive?.(false);
        (e.target as unknown as HTMLElement).releasePointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        if (!dragging.current) return;
        e.stopPropagation();
        const nx = e.point.x;
        const nz = e.point.z;
        setPos([nx, 0.15, nz]);
        onDrag?.(asset.id, nx, nz);
      }}
    >
      <boxGeometry args={[0.16, 0.16, 0.16]} />
      <meshBasicMaterial color="#94a3b8" wireframe />
    </mesh>
  );
}

export function MatrixScene3D({
  prompt,
  assets,
  variant,
  onAssetDrag,
}: {
  prompt: string;
  assets: SceneAsset[];
  variant: "exterior" | "interior";
  onAssetDrag?: (id: string, x: number, z: number) => void;
}) {
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const onDragActive = useCallback((active: boolean) => setOrbitEnabled(!active), []);

  return (
    <Canvas
      camera={{ position: [4, 3.5, 5], fov: 42 }}
      className="!absolute inset-0 h-full w-full touch-none"
      resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
    >
      <SpatialCanvasSizeSync />
      <color attach="background" args={["#070a12"]} />
      <ambientLight intensity={0.6} />
      <directionalLight intensity={0.8} position={[6, 8, 4]} />
      <Grid infiniteGrid fadeDistance={30} cellColor="#334155" sectionColor="#64748b" />
      <WireBuilding prompt={prompt} interior={variant === "interior"} />
      {assets.map((a) => (
        <DraggableAsset key={a.id} asset={a} onDrag={onAssetDrag} onDragActive={onDragActive} />
      ))}
      <OrbitControls
        makeDefault
        enabled={orbitEnabled}
        enablePan
        enableZoom
        maxPolarAngle={Math.PI / 2.1}
        minDistance={2}
        maxDistance={14}
      />
    </Canvas>
  );
}
