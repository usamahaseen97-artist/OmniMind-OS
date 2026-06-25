# Visionary Studio — Video Editor (Phase 3)

## Overview

Phase 3 adds a professional non-linear video editor (NLE) to Visionary Studio. No real rendering engine — all edits are application-state driven with API persistence stubs.

## Activation

Open **Video Studio**, **Video Editor**, or **VFX Studio** from the Visionary sidebar. The full `VideoEditorWorkspace` replaces the Phase 1/2 layout while preserving the top toolbar, status bar, and AI copilot.

## Architecture

```
frontend/lib/visionary/editor/       # Engine layer
frontend/lib/visionary/editor-context.tsx
frontend/components/visionary/editor/  # NLE UI
```

### Engine modules

| Module | Role |
|--------|------|
| `TimelineEngine` | Timecode, markers, regions, serialize |
| `TrackManager` | Unlimited tracks (video/audio/subtitle/overlay/adjustment) |
| `ClipManager` | Split, join, trim, ripple, effects |
| `AutoSaveManager` | Debounced project save |

### UI components

`VideoEditorWorkspace`, `TimelineEngine`, `TrackManager`, `ClipManager`, `MediaPool`, `InspectorPanel`, `EffectsBrowser`, `TransitionsBrowser`, `TextEditor`, `SubtitleEditor`, `AudioMixer`, `ColorWorkspace`, `PlaybackControls`, `PreviewMonitor`, `KeyframeEditor`, `HistoryPanel`, `ExportQueue`, `AutoSaveManager`

## Features (state-wired)

- Multi-track timeline with ruler, minimap, snap, magnetic mode
- Edit tools: select, ripple, trim, razor/split, slip, slide
- Media pool: import, favorites, double-click insert
- Preview: play/pause/stop, loop, frame step, speed, quality, safe margins
- Effects (13) and transitions (9) applied to selected clips
- Color grading sliders + LUT selector
- Audio mixer with gain, fades, EQ/compression placeholders
- AI timeline assistant (8 actions — architecture stubs)
- Export presets: YouTube, TikTok, Instagram, Facebook, LinkedIn, 4K, 8K HDR

## Backend (`/api/v1/visionary/editor`)

| Endpoint | Purpose |
|----------|---------|
| `PUT /projects/{id}` | Project persistence |
| `POST /timeline/serialize` | Timeline JSON serialization |
| `GET/POST /media` | Media pool metadata |
| `POST /export/queue` | Background render queue stub |

## Phase 4 (future)

- WebCodecs / FFmpeg WASM preview
- Real waveform analysis
- Scope panels (waveform, vectorscope)
- Nested sequence editing UI
