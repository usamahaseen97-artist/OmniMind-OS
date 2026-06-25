/** Spatial render types — shared by engine API and render store. */

export type SpatialRenderMode = "matrix" | "cinematic";

export type SpatialRenderDialogState = {
  duration: number;
  transition: number;
  resolution: string;
  quality_samples: number;
};
