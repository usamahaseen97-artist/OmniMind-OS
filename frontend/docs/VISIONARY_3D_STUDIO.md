# Visionary Studio — 3D Production Platform (Phase 6)

Phase 6 extends Visionary Studio with a professional 3D production platform — Blender / Unreal / Unity / Character Creator class workflows. Architecture and API stubs only; no rendering engine yet.

## Route

- `/visionary-studio` → sidebar module **3D Studio** (`3d-studio`)

## Frontend layout

```
VisionaryStudioProvider
  VisionaryAIProvider
    VisionaryEditorProvider
      VisionaryVFXProvider
        VisionaryMarketingProvider
          VisionaryStudio3DProvider
            VisionaryStudioLayout
              Studio3DWorkspace (when STUDIO_3D_MODULES active)
```

Module routing priority: **3D Studio** → **Marketing** → **VFX** → **Video Editor** → **default**.

## Library (`frontend/lib/visionary/studio3d/`)

| Module | Role |
|--------|------|
| `types.ts` | Scenes, objects, materials, characters, animation, game assets, digital humans |
| `constants.ts` | `STUDIO_3D_MODULES`, archetypes, presets |
| `SceneManager.ts` | Scenes, collections, hierarchy |
| `MaterialEngine.ts` | PBR materials |
| `CharacterCreatorEngine.ts` | Character archetypes |
| `AnimationEngine.ts` | Clips, rigs, IK/FK |
| `EnvironmentEngine.ts` | Environment + game assets |
| `DigitalHumanEngine.ts` | AI host, presenter, influencer roles |
| `AIEngine.ts` | Text/image/sketch to 3D, auto rig, retopology |
| `studio3d-api.ts` | Client for `/api/v1/visionary/studio3d` |
| `studio3d-context.tsx` | `VisionaryStudio3DProvider` / `useVisionaryStudio3D` |

## UI (`frontend/components/visionary/3d/`)

`Studio3DWorkspace`, `SceneExplorer`, `ObjectHierarchy`, `Viewport3D`, `MaterialEditor`, `ShaderEditor`, `TexturePainter`, `MeshEditor`, `RiggingStudio`, `AnimationStudio`, `MotionCapture`, `PhysicsStudio`, `EnvironmentBuilder`, `LightingStudio`, `CameraStudio`, `AssetBrowser`, `CharacterCreator`, `AvatarCreator`, `GameAssetStudio`, `DigitalHumanStudio`

## Backend (`/api/v1/visionary/studio3d`)

- `GET/PUT /projects/{id}` — scene project save/load
- `POST /scenes/serialize` — scene serialization
- `GET/POST /assets` — asset database
- `GET /materials` — material database
- `GET /characters/presets` — character presets

## Workspace modes

Viewport · Character · Avatar · Animation · Rigging · Environment · Materials · Game Assets · Digital Human · Physics · Motion Capture

## Constraints

- Does not modify OmniForge Engine, Medical Diagnostic, SDK, or Business Analytics
- Extends Visionary Studio only; backward compatible with Phases 1–5
