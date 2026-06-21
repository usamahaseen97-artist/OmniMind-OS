"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";

/** Syncs WebGL renderer + camera when spatial panel gutters resize */
export function SpatialCanvasSizeSync() {
  const { gl, camera, invalidate } = useThree();

  useEffect(() => {
    const onResize = () => {
      const parent = gl.domElement.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      gl.setSize(width, height, false);
      const cam = camera as PerspectiveCamera;
      if ("aspect" in cam) {
        cam.aspect = width / height;
        cam.updateProjectionMatrix();
      }
      invalidate();
    };

    window.addEventListener("omnimind:spatial-canvas-resize", onResize);
    window.addEventListener("omnimind:medical-canvas-resize", onResize);
    onResize();
    return () => {
      window.removeEventListener("omnimind:spatial-canvas-resize", onResize);
      window.removeEventListener("omnimind:medical-canvas-resize", onResize);
    };
  }, [gl, camera, invalidate]);

  return null;
}
