# Visionary Studio — Hollywood VFX Engine (Phase 4)

Phase 4 extends Visionary Studio with a professional VFX and motion graphics pipeline comparable to After Effects, Fusion, Nuke, and Cinema 4D — architecture and API stubs only; no real rendering engine yet.

## Route

- `/visionary-studio` → sidebar modules **VFX Studio** (`vfx-studio`) and **Animation Studio** (`animation-studio`)

## Frontend layout

```
VisionaryStudioProvider
  VisionaryAIProvider
    VisionaryEditorProvider
      VisionaryVFXProvider
        VisionaryStudioLayout
          VFXWorkspace (when VFX_MODULES active)
```

Module routing priority: **VFX** → **Video Editor** → **Phase 1/2 default layout**.

## Library (`frontend/lib/visionary/vfx/`)

| Module | Role |
|--------|------|
| `types.ts` | Compositions, nodes, tracking, particles, physics, 3D, AI, export |
| `constants.ts` | `VFX_MODULES`, presets, templates |
| `NodeGraphEngine.ts` | Node add/move/connect |
| `CompositionManager.ts` | Layers, blend modes, nested comps |
| `EffectStackManager.ts` | Effect stack |
| `ParticleSystem.ts` | Emitter architecture stub |
| `PhysicsSimulation.ts` | Rigid/soft/cloth/hair placeholders |
| `LightingSystem.ts` | Light definitions |
| `CameraTracker.ts` | 2D/3D tracking sessions |
| `CompositorEngine.ts` | Layer stack evaluation stub |
| `vfx-api.ts` | Client for `/api/v1/visionary/vfx` |
| `vfx-context.tsx` | `VisionaryVFXProvider` / `useVisionaryVFX` |

## UI (`frontend/components/visionary/vfx/`)

`VFXWorkspace`, `NodeEditor`, `CompositionManager`, `EffectStack`, `ParticleSystem`, `PhysicsSimulation`, `LightingSystem`, `CameraTracker`, `MotionTracker`, `RotoBrush`, `MaskEditor`, `GreenScreenEditor`, `Compositor`, `MotionGraphicsStudio`, `AnimationGraph`, `MaterialEditor`, `ShaderGraph`, `SceneHierarchy`, `3DViewport`, `InspectorPanel`, `VFXExportPanel`

## Backend (`/api/v1/visionary/vfx`)

- `GET/PUT /projects/{id}` — composition save/load
- `POST /graph/serialize` — node graph serialization
- `GET /presets` — effect and animation presets
- `GET/POST /assets` — VFX asset library
- `POST/GET /export/queue` — background render queue

## Workspace modes

Compositor · Node Graph · Motion Graphics · 3D · Particles · Green Screen · Tracking

## Constraints

- Does not modify OmniForge Engine, Medical Diagnostic, or SDK
- Extends Visionary Studio only; backward compatible with Phases 1–3
