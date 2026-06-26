# OmniMind Mission Control

**Version:** 2.0.0  
**Facade:** `omniCore.missionControl`  
**Route:** `/mission-control`

## Purpose

Mission Control is the professional desktop command center for the entire OmniMind ecosystem. Everything happening inside the OS is visible and controllable from one surface.

## Surfaces

| Panel | Module | Description |
|-------|--------|-------------|
| Overview | `dashboard()` | Live status, workspace, AI, health |
| AI Control Center | `aiCenter` | Agents — pause, resume, cancel, retry |
| Project Command | `projects` | Progress, health, deployments |
| Live Terminals | `terminals` | 8 terminal streams |
| Background Engine | `background` | Renders, deploys, automation jobs |
| Resource Manager | `resources` | CPU, tokens, workers, cost |
| Security Center | `security` | Threats, audit, events |
| System Logs | `logs` | Centralized log stream |
| Analytics | `analytics` | Performance & usage series |
| Quick Actions | `actions` | Sync, deploy, diagnostics |

## API

`GET /api/v1/omnicore/mission-control/dashboard`

## Constraints

OmniForge and Architectural Designer are not modified. Mission Control composes existing OmniCore, ecosystem, automation, quality, and security modules.
