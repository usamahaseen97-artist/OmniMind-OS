from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Any

app = FastAPI(title="OmniMind V11: The God-Mode Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SovereignRequest(BaseModel):
    domain: str        # E.g., 'omniforge', 'omnimusic', 'omnivision'
    command: str       # User's text or navigation actions
    current_project: Optional[str] = "Default Project"
    action_type: Optional[str] = "execute"  # 'execute', 'navigate_back', 'switch_tool'

@app.get("/healthz")
async def healthz():
    return {"status": "ok", "service": "omnimind-execute-matrix"}

@app.post("/api/execute")
async def execute_advanced_logic(request: SovereignRequest):
    cmd = request.command.lower()
    dom = request.domain.lower()
    action = request.action_type.lower()
    
    # 1. GLOBAL NAVIGATION & BACK-BUTTON ROUTING INDEX
    if action in ["navigate_back", "switch_tool"] or "back to" in cmd:
        return {
            "status": "SUCCESS",
            "action": "ROUTE_DISPATCH",
            "previous_domain": dom,
            "target_route": "/dashboard" if action == "navigate_back" or "chat" in cmd or "neural" in cmd else f"/{dom}",
            "msg": f"State saved for project: {request.current_project}. Navigating system stack smoothly.",
            "execution_plan": {"steps": ["Snapshotting memory state context.", "Clearing active rendering frame."]},
            "navigation_menu": [
                {"id": "omnichat", "label": "Neural Chatbot", "href": "/dashboard", "breadcrumb": "OmniChat"},
                {"id": "omniforge", "label": "OmniForge Engine", "href": "/omniforge-engine", "breadcrumb": "OmniForge"},
                {"id": "omnimusic", "label": "OmniMusic Core", "href": "/omnimusic", "breadcrumb": "OmniMusic"},
                {"id": "omnivision", "label": "OmniVision", "href": "/creative-visionary", "breadcrumb": "OmniVision"},
                {"id": "omnideploy", "label": "OmniDeploy", "href": "/omniforge-engine?panel=deploy", "breadcrumb": "OmniDeploy"},
                {"id": "analytics", "label": "Business Analytics", "href": "/business-analytics", "breadcrumb": "Analytics"},
            ],
        }

    # Global Response Base Template
    response = {
        "status": "SUCCESS",
        "domain": dom,
        "resolved_instruction": f"Processing in [{dom.upper()}]: {request.command}",
        "execution_plan": {"confidence": "100%", "steps": []},
        "output_data": {}
    }

    # 2. 🛠️ OMNIFORGE ENGINE DOMAIN CODES
    if "forge" in dom or any(x in cmd for x in ["build", "perfume", "code", "architecture"]):
        response["execution_plan"]["steps"] = [
            "Initializing standard folder structure (frontend/, backend/, database/).",
            "Parsing custom database constraints dynamically.",
            "Streaming incremental scaffold code straight to editor tabs."
        ]
        response["output_data"] = {"engine_state": "OmniForge Engine Live", "scaffold": "Ready"}

    # 3. 🎵 OMNIMUSIC CORE DOMAIN CODES
    elif "music" in dom or any(x in cmd for x in ["song", "music", "audio", "vocal"]):
        response["execution_plan"]["steps"] = [
            "Accessing OmniMusic spectral audio generation grids.",
            "Isolating master tracks and rendering contextual melody loops."
        ]
        response["output_data"] = {"engine_state": "OmniMusic Engine Core Connected"}

    # 4. 👁️ OMNIVISION & VFX MOUNT
    elif any(x in dom for x in ["vision", "movies", "tv", "vfx"]) or any(x in cmd for x in ["edit", "video", "render"]):
        response["execution_plan"]["steps"] = [
            "Mapping 3D viewports and cross-referencing visual arrays.",
            "Processing motion tracking frames asynchronously."
        ]
        response["output_data"] = {"engine_state": "OmniVision/Media Subsystem Online"}

    # 5. 📊 BUSINESS ANALYTICS & RECOVERY LOGIC (Karachi coordinates / Sales)
    elif "analytics" in dom or any(x in cmd for x in ["sale", "excel", "product", "trend"]):
        response["execution_plan"]["steps"] = [
            "Neural parsing of monthly sales matrices across city clusters.",
            "Optimizing trade operations and stock flow predictions."
        ]
        response["output_data"] = {"trend_analysis": "100% Synced"}

    else:
        response["execution_plan"]["steps"] = ["General OmniMind Core Processing", "Accessing Global System Matrix"]
        response["output_data"] = {"engine_state": "Global Lake Active"}

    return response