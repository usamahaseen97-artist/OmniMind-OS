# OmniMusic Studio — Digital Audio Workstation

## Phase 5 — Professional Mixing Console + Mastering Suite + DSP Architecture

Enterprise mixing and mastering workstation — unlimited channels/buses, FX sends, sidechain, mastering targets, analysis meters, AI mix assistant suggestions, automation curves, DSP graph. No real DSP processing yet.

### Mixing library (`frontend/lib/omnimusic-studio/mixing/`)

| Module | Role |
|--------|------|
| `ProMixerEngine.ts` | Unlimited channels, sends, inserts, sidechain |
| `BusManagerCore.ts` | Aux, group, master, monitor, cue, folder buses |
| `RoutingMatrixCore.ts` | DSP routing connections |
| `FXRackCore.ts` / `PluginHostCore.ts` | FX inserts + plugin catalog |
| `MasteringEngineCore.ts` | Streaming, radio, podcast, cinema, club, broadcast, vinyl targets |
| `AnalysisEngineCore.ts` | LUFS, spectrum, mix report |
| `MixAssistantCore.ts` | EQ, compression, limiter, stereo, gain, master suggestions |
| `AutomationCurvesCore.ts` | Volume, pan, send, plugin, tempo automation + bezier |
| `DSPArchitectureCore.ts` | DSP graph nodes |
| `mixing-api.ts` | Client for `/api/v1/omnimusic/studio/mixing` |

### Mixing UI (`frontend/components/omnimusic/mixing/`)

`MixingWorkspace`, `MasteringSuite`, `MixerEngine`, `ChannelStrip`, `MasterBus`, `BusManager`, `RoutingMatrix`, `FXRack`, `PluginHost`, `EQStudio`, `CompressorStudio`, `LimiterStudio`, `GateStudio`, `ReverbStudio`, `DelayStudio`, `StereoImager`, `SaturationStudio`, `MultibandCompressor`, `LoudnessMeter`, `SpectrumAnalyzer`, `Oscilloscope`, `PhaseAnalyzer`, `CorrelationMeter`, `ReferenceTrackManager`, `PresetManager`, `AutomationCurves`, `DSPArchitecture`

### Backend (`/api/v1/omnimusic/studio/mixing`)

- `PUT/GET /mixer/{projectId}` — mixer state
- `PUT /routing/{projectId}` — DSP routing
- `PUT/GET /mastering/{projectId}` — mastering chain
- `PUT /automation/{projectId}` — automation lanes
- `GET/POST /presets` · `GET /references`

---

## Phase 4 — AI Vocal Studio + Smart Recording

Enterprise vocal production workflow — smart recording, voice analysis, processing chain architecture, lyrics sync, voice library with **legal authorization** for third-party voices. No real AI inference.

### Vocal library (`frontend/lib/omnimusic-studio/vocal/`)

| Module | Role |
|--------|------|
| `VoiceAuthorizationEngine.ts` | Consent-gated voice profiles — no third-party cloning without authorization |
| `SmartRecordingEngine.ts` | Live, multi-take, loop, punch recording |
| `VocalTakeManagerEngine.ts` | Take comping, starring, session database |
| `VoiceAnalyzerCore.ts` | Pitch, timing, dynamics, pronunciation, performance report |
| `AutoTuneEngineCore.ts` | Auto-tune, formant, vibrato architecture |
| `VocalHarmonyEngineCore.ts` | Harmony, double-tracking, choir, backing vocals |
| `LyricsSyncEngine.ts` | Karaoke view, word/line timing, multi-language |
| `VocalAssistantEngine.ts` | EQ, compression, mic, layering suggestions |
| `vocal-api.ts` | Client for `/api/v1/omnimusic/studio/vocal` |

### Vocal UI (`frontend/components/omnimusic/vocal/`)

`VocalStudio`, `RecordingWorkspace`, `VoiceAnalyzer`, `PitchAnalyzer`, `HarmonyEngine`, `AutoTuneEngine`, `VoiceCleaner`, `NoiseReducer`, `BreathRemoval`, `DeEsser`, `EQAssistant`, `CompressorAssistant`, `ReverbAssistant`, `DelayAssistant`, `DoubleTracking`, `ChoirGenerator`, `BackingVocals`, `VoiceLibrary`, `TakeManager`, `CompEditor`, `LyricsSync`, `PronunciationGuide`, `PerformanceMonitor`, `VocalAssistant`

### Legal safety

- Third-party voice profiles default to `pending` authorization
- `canUseVoiceProfile()` blocks use until explicit consent record exists
- No default cloning of external voices

### Backend (`/api/v1/omnimusic/studio/vocal`)

- `PUT /sessions/{projectId}` — recording session state
- `GET/POST /takes/{projectId}` — take database
- `GET /voice-profiles` · `POST /voice-profiles/{id}/authorize`
- `POST /lyrics-timing` · `POST /performance-analysis` · `GET/POST /presets`

---

## Phase 3 — AI Composer + Beat Maker + Lyrics Studio

Enterprise AI music creation architecture — provider-independent, no hardcoded inference. Manual DAW workflows preserved via DAW/AI view toggle.

### AI library (`frontend/lib/omnimusic-studio/ai/`)

| Module | Role |
|--------|------|
| `ModelRouter.ts` | Provider adapters — OpenAI, Google, Local, OmniMusic Future |
| `GenerationQueueEngine.ts` | Background jobs — pause, resume, cancel, retry, priority |
| `PromptEngine.ts` | Professional prompt spec + validation |
| `ComposerEngine.ts` | Text→Music, Lyrics→Song, and all workflow kinds |
| `BeatGeneratorEngine.ts` | Genre beat templates (Hip Hop, Trap, Lo-Fi, …) |
| `ChordEngineCore.ts` | Chord progressions |
| `MelodyEngineCore.ts` | Melody sketches |
| `LyricsEngineCore.ts` | Verse/chorus/bridge, rhyme assistant, syllables |
| `AssetLibraryEngine.ts` | Generated songs, beats, lyrics, favorites |
| `ai-api.ts` | Client for `/api/v1/omnimusic/studio/ai` |
| `use-ai-bridge.ts` | React bridge → `useOmniMusicStudio()` |

### AI UI (`frontend/components/omnimusic/ai/`)

`AIComposer`, `MusicCopilot`, `BeatGenerator`, `ChordEngine`, `MelodyEngine`, `HarmonyEngine`, `RhythmEngine`, `ArrangementEngine`, `LyricsStudio`, `GenreLibrary`, `MoodLibrary`, `StyleLibrary`, `PromptStudio`, `GenerationQueue`, `GenerationHistory`, `MusicTemplates`, `MusicAssetLibrary`, `ModelRouter`

### Backend (`/api/v1/omnimusic/studio/ai`)

- `GET /providers` — model router registry
- `POST/GET /prompts/{projectId}` — prompt database
- `POST/GET/PATCH /jobs` — generation queue + history
- `POST /lyrics` — lyrics documents
- `GET /templates` — music templates
- `GET/POST /assets/{projectId}` — asset library

---

## Phase 2 — Audio Engine + Recording

Professional audio engine architecture wired to application state via Web Audio API (capture/playback/metering). No heavy DSP yet — ready for AI and plugin integration.

### Audio library (`frontend/lib/omnimusic-studio/audio/`)

| Module | Role |
|--------|------|
| `AudioSession.ts` | Session coordinator — play, record, autosave |
| `TransportEngine.ts` | Play/pause/stop/loop/seek/cycle/locators |
| `PlaybackEngine.ts` | Scheduled buffer playback |
| `RecordingEngine.ts` | getUserMedia + MediaRecorder + take management |
| `AudioDeviceManager.ts` | Input/output enumeration, buffer/rate/bit depth |
| `AudioCache.ts` | Waveform peak + buffer cache |
| `ClipProcessor.ts` | Normalize, fade, reverse, silence (array ops) |
| `TrackEngine.ts` | Arm, monitor, record enable |
| `MetronomeEngine.ts` | Scheduled click track |
| `UndoHistory.ts` | Undo/redo project snapshots |
| `ProjectRecovery.ts` | Autosave + crash recovery (localStorage) |
| `use-audio-bridge.ts` | React bridge → `useOmniMusicStudio()` |

### Audio UI (`frontend/components/omnimusic/audio/`)

`AudioEngine`, `AudioSession`, `AudioDeviceManager`, `RecordingEngine`, `PlaybackEngine`, `WaveformRenderer`, `WaveformEditor`, `TransportEngine`, `TempoManager`, `MetronomeEngine`, `LatencyManager`, `AudioCache`, `ClipProcessor`, `RegionEditor`, `TrackEngine`, `UndoHistory`, `ProjectRecovery`

---

## Phase 1 — Workspace shell

Phase 1 delivers a professional DAW workspace integrated into OmniMind OS — modular, dockable, resizable UI with typed project architecture.

## Route

- `/omnimusic` → **OmniMusic Studio** (`OmniMusicStudioShell`)

## Workspace layout

```
TransportBar (top)
├── MusicSidebar (left browser)
├── TrackTimeline + PianoRoll (center)
├── InspectorPanel (right)
├── MixerConsole (bottom)
└── StatusBar (footer)
```

## Library (`frontend/lib/omnimusic-studio/`)

| Module | Role |
|--------|------|
| `types.ts` | Tracks, clips, mixer, plugins, transport, MIDI, browser, export |
| `constants.ts` | Browser tabs, seed tracks, internal plugins |
| `TrackManager.ts` | Track and clip CRUD |
| `MixerEngine.ts` | Channel gain, pan, sends, metering stubs |
| `PluginManager.ts` | VST/AU placeholders, scanner, preset manager |
| `studio-api.ts` | Client for `/api/v1/omnimusic/studio` |
| `omnimusic-studio-context.tsx` | `OmniMusicStudioProvider` / `useOmniMusicStudio` |

## UI (`frontend/components/omnimusic/`)

`OmniMusicStudioShell`, `OmniMusicWorkspace`, `MusicSidebar`, `TransportBar`, `TrackTimeline`, `MixerConsole`, `PianoRoll`, `ClipLauncher`, `AudioEditor`, `MidiEditor`, `PluginRack`, `InstrumentBrowser`, `SampleBrowser`, `LoopBrowser`, `RecordingPanel`, `AutomationEditor`, `EffectsBrowser`, `MasterChannel`, `ExportCenter`, `StatusBar`, `InspectorPanel`

## Backend (`/api/v1/omnimusic/studio`)

- `GET/PUT /projects/{id}` — project save/load (tracks, clips, mixer, metadata)
- `POST /tracks/serialize` — track serialization
- `POST /mixer/serialize` — mixer state serialization
- `GET /plugins` — plugin database
- `GET/PUT /transport/{id}` — transport persistence
- `POST/GET /recording/sessions/{id}` — recording takes
- `POST/GET /waveform/cache` — waveform cache
- `GET /audio/metadata/{clipId}` — clip metadata
- `POST/GET /recovery/snapshots` — version snapshots

Streaming catalog APIs remain at `/api/v1/music` (unchanged).

## Constraints

- Does not modify OmniForge Engine, Visionary Studio, Medical Diagnostic, or SDK
- Entertainment streaming player (`OmniMusicView`) preserved for other routes; sovereign tool routes to DAW shell
