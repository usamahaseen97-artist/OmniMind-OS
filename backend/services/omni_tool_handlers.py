"""
Handlers for OmniMind universal chat tools.
"""

from __future__ import annotations

import re
from typing import Any, Optional

from services import memory
from services.app_builder_engine import build_app_bundle
from services.architecture_blueprint import build_blueprint
from services.execution_triggers import detect_execution_tool
from services.context_manager import ContextManager
from services.image_synthesis import synthesize_visual
from services.fast_image_response import synthesize_with_timeout
from services.image_url_utils import public_image_url
from services.tavily import tavily_search
from services.tool_context import get_session
from services.video_pipeline import run_video_pipeline


async def handle_create_image(
    *,
    user_id: str,
    message: str,
    image_refs: list[str],
    agent_id: str = "sovereign-core",
) -> dict[str, Any]:
    refs = ", ".join(image_refs) if image_refs else "none"
    ContextManager.set_active_chat_agent(user_id, agent_id)
    import os

    fast_default = os.getenv("OMNIMIND_IMAGE_FAST_PATH", "1").strip().lower() in (
        "1",
        "true",
        "yes",
    )
    if fast_default:
        from services.fast_image_response import _preview_from_pollinations

        result = _preview_from_pollinations(
            message=message,
            user_id=user_id,
            agent_id=agent_id,
        )
    else:
        result = await synthesize_with_timeout(
            user_id=user_id,
            message=message,
            agent_id=agent_id,
        )
    preview = result.get("preview") or {}
    if isinstance(preview, dict):
        preview["html"] = preview.get("html", "") + (
            f'<p style="font-size:10px;color:#71717a">Refs: {refs}</p>'
        )
    md_images = "\n".join(
        f"![{img.get('alt', 'Generated')}]({public_image_url(img.get('url', ''))})"
        for img in result.get("images", [])
        if img.get("url")
    )
    mode = result.get("mode", "generate")
    status_label = "In-paint edit complete" if mode == "inpaint" else "High-fidelity image ready"
    return {
        **result,
        "imageUrl": result.get("image_url"),
        "file_url": result.get("image_url"),
        "status": f"{status_label} via {result.get('provider', 'engine')}…",
        "message": (
            f"**{status_label}** ({result.get('provider')}).\n\n{md_images}\n\n"
            f"Prompt: _{result.get('prompt', message[:200])}_"
        ),
    }


async def handle_app_build(*, user_id: str, message: str) -> dict[str, Any]:
    bundle = build_app_bundle(message)
    files = bundle["files"]
    preview_html = bundle["preview_html"]
    tree = "\n".join(f"- `{f['path']}`" for f in files)
    return {
        "success": True,
        "tool": "app_build",
        "status": f"Bundling {bundle['title']}…",
        "files": files,
        "preview": {
            "html": preview_html,
            "type": "app_build",
            "files": files,
            "active_tab": "code",
        },
        "message": f"**{bundle['title']}** scaffold ready.\n\n{tree}\n\nOpen **Live Screen → Code / Live** to browse files and preview the UI.",
    }


async def handle_architecture(*, user_id: str, message: str) -> dict[str, Any]:
    bp = build_blueprint(message)
    specs = bp["specs"]
    spec_line = (
        f"{specs['width_ft']}×{specs['depth_ft']} ft · {specs['bedrooms']} bedrooms"
        + (" · courtyard" if specs.get("courtyard") else "")
        + (" · parking" if specs.get("parking") else "")
    )
    return {
        "success": True,
        "tool": "architecture",
        "status": "Rendering blueprint…",
        "specs": specs,
        "preview": bp["preview"],
        "message": f"**Floor plan generated** — {spec_line}. See the interactive blueprint in **Live Screen**.",
    }


async def handle_create_music(
    *,
    user_id: str,
    message: str,
    audio_refs: list[str],
) -> dict[str, Any]:
    song_query = message.strip()[:200]
    try:
        from services.music_fast import fast_play_music_payload

        payload = await fast_play_music_payload(song_query)
        track = payload.get("track") or payload
        if not payload.get("success"):
            return {
                "success": False,
                "tool": "create_music",
                "message": f"Could not play **{song_query}**: {payload.get('error', 'unknown')}",
            }
        from html import escape

        title = escape(str(track.get("title", song_query)))
        artist = escape(str(track.get("artist", "")))
        img = escape(str(track.get("album_image_url") or ""))
        stream = escape(str(track.get("audio_stream_url") or ""))
        img_tag = (
            f"<img src='{img}' alt='' style='max-width:120px;border-radius:8px;margin-top:8px'/>"
            if img
            else ""
        )
        html = f"""
        <div style="padding:16px;background:#0a0a0f;color:#e4e4e7;border:1px solid rgba(16,185,129,0.35);border-radius:12px">
          <p style="color:#10B981;font-weight:700">{title}</p>
          <p style="font-size:12px;color:#a1a1aa">{artist}</p>
          {img_tag}
          <audio controls src="{stream}" style="width:100%;margin-top:10px"></audio>
        </div>
        """
        return {
            "success": True,
            "tool": "create_music",
            "status": "Playing now",
            "preview": {"html": html, "type": "audio", "music_track": track, "track": track},
            "track": track,
            "message": f"**{title}** — {artist}\n\nPlaying now.",
        }
    except Exception as exc:
        return {
            "success": False,
            "tool": "create_music",
            "message": f"Music search failed: {exc}",
        }


async def handle_deep_research(*, user_id: str, message: str) -> dict[str, Any]:
    web = ""
    try:
        web = await tavily_search(message, max_results=8)
    except Exception as exc:
        web = f"(Search unavailable: {exc})"

    report = f"""# Deep Research Report

## Query
{message}

## Findings
{web or 'Enable TAVILY_API_KEY for live citations.'}

## Synthesis
Structured report generated by OmniMind Deep Research agent. Cross-check sources before publishing.
"""
    html = f'<pre style="white-space:pre-wrap;font-size:12px;padding:12px">{report}</pre>'
    return {
        "success": True,
        "tool": "deep_research",
        "status": "Thinking for 6s · gathering sources…",
        "thinking_seconds": 6,
        "preview": {"html": html, "type": "research"},
        "message": report,
        "sources_preview": web[:2000] if web else "",
    }


async def handle_web_search(*, message: str) -> dict[str, Any]:
    try:
        web = await tavily_search(message, max_results=6)
    except Exception as exc:
        return {"success": False, "tool": "web_search", "error": str(exc)}
    html = f'<div style="padding:12px"><p style="color:#00ff88">Web Search</p><pre style="font-size:11px">{web}</pre></div>'
    return {
        "success": True,
        "tool": "web_search",
        "status": "Searching live web…",
        "preview": {"html": html, "type": "search"},
        "message": web,
    }


async def handle_thinking(*, message: str, history: list[dict]) -> dict[str, Any]:
    ctx = "\n".join(f"{h.get('role')}: {h.get('content','')[:200]}" for h in history[-6:])
    analysis = f"""## Extended reasoning (Thinking mode)

**Question:** {message}

**Context:** {ctx[:1500] if ctx else 'none'}

### Step 1 — Decompose the problem
Break into facts, constraints, and unknowns.

### Step 2 — Evaluate options
List approaches with trade-offs.

### Step 3 — Conclusion
Provide the most defensible answer with explicit assumptions.
"""
    return {
        "success": True,
        "tool": "thinking",
        "status": "Thinking deeply…",
        "thinking_seconds": 8,
        "preview": {"html": f'<pre>{analysis}</pre>', "type": "reasoning"},
        "message": analysis,
    }


async def handle_uploads(
    *,
    user_id: str,
    message: str,
    files: list[dict[str, str]],
) -> dict[str, Any]:
    sess = get_session(user_id)
    for f in files:
        sess.uploads.append({**f, "at": str(__import__("datetime").datetime.now(__import__("datetime").timezone.utc))})
    summary = "\n".join(f"- **{f.get('name')}** ({f.get('kind', 'file')})" for f in files)
    html = f"<pre>Uploaded {len(files)} file(s):\n{summary}</pre>"
    return {
        "success": True,
        "tool": "uploads",
        "status": f"Processed {len(files)} upload(s)",
        "preview": {"html": html, "type": "uploads"},
        "message": f"Registered {len(files)} files. {message[:300]}",
        "files": files,
    }


async def handle_labs(*, user_id: str, message: str, prefs: Optional[dict]) -> dict[str, Any]:
    sess = get_session(user_id)
    if prefs:
        sess.labs_profile.update(prefs)
    if message.strip():
        sess.labs_profile["last_instruction"] = message.strip()
    mem = memory.get_user_memory(user_id)
    profile = {**sess.labs_profile, "stored_preferences": mem}
    html = f"<pre>Personal Intelligence Labs\n{profile}</pre>"
    return {
        "success": True,
        "tool": "personal_intelligence",
        "status": "Personalizing context…",
        "preview": {"html": html, "type": "labs"},
        "message": "Labs profile updated for personalized replies.",
        "profile": profile,
    }


def detect_active_tool(message: str, *, force_tool: Optional[str] = None) -> str:
    return detect_execution_tool(message, force_tool=force_tool)


async def _dispatch_tool_inner(
    *,
    user_id: str,
    message: str,
    tool: Optional[str] = None,
    image_refs: Optional[list[str]] = None,
    video_refs: Optional[list[str]] = None,
    audio_refs: Optional[list[str]] = None,
    file_refs: Optional[list[dict]] = None,
    history: Optional[list[dict]] = None,
    labs_prefs: Optional[dict] = None,
    agent_id: str = "sovereign-core",
) -> dict[str, Any]:
    ContextManager.set_active_chat_agent(user_id, agent_id)
    active = detect_active_tool(message, force_tool=tool)
    image_refs = image_refs or []
    video_refs = video_refs or []
    audio_refs = audio_refs or []
    file_refs = file_refs or []
    history = history or []

    if active == "video":
        return await run_video_pipeline(
            user_id=user_id,
            message=message,
            image_refs=image_refs,
            video_refs=video_refs,
            audio_refs=audio_refs,
        )
    if active == "create_image":
        return await handle_create_image(
            user_id=user_id,
            message=message,
            image_refs=image_refs,
            agent_id=agent_id,
        )
    if active == "app_build":
        return await handle_app_build(user_id=user_id, message=message)
    if active == "architecture":
        return await handle_architecture(user_id=user_id, message=message)
    if active == "create_music":
        return await handle_create_music(user_id=user_id, message=message, audio_refs=audio_refs)
    if active == "deep_research":
        return await handle_deep_research(user_id=user_id, message=message)
    if active == "web_search":
        return await handle_web_search(message=message)
    if active == "thinking":
        return await handle_thinking(message=message, history=history)
    if active == "uploads" or file_refs:
        files = file_refs or [{"name": "paste.txt", "kind": "text"}]
        return await handle_uploads(user_id=user_id, message=message, files=files)
    if active == "personal_intelligence":
        return await handle_labs(user_id=user_id, message=message, prefs=labs_prefs)

    return {"success": False, "tool": "chat", "message": "No specialized tool matched — use main chat stream."}


async def dispatch_tool(
    *,
    user_id: str,
    message: str,
    tool: Optional[str] = None,
    image_refs: Optional[list[str]] = None,
    video_refs: Optional[list[str]] = None,
    audio_refs: Optional[list[str]] = None,
    file_refs: Optional[list[dict]] = None,
    history: Optional[list[dict]] = None,
    labs_prefs: Optional[dict] = None,
    agent_id: str = "sovereign-core",
) -> dict[str, Any]:
    from services.integration_gateway import execute_tool_with_fallback

    active = detect_active_tool(message, force_tool=tool) or tool or "chat"

    async def _run(**kwargs: Any) -> dict[str, Any]:
        return await _dispatch_tool_inner(
            user_id=user_id,
            message=message,
            tool=tool,
            image_refs=image_refs,
            video_refs=video_refs,
            audio_refs=audio_refs,
            file_refs=file_refs,
            history=history,
            labs_prefs=labs_prefs,
            agent_id=agent_id,
        )

    return await execute_tool_with_fallback(
        active,
        _run,
        user_id=user_id,
        message=message,
        image_refs=image_refs,
        video_refs=video_refs,
        audio_refs=audio_refs,
        file_refs=file_refs,
        history=history,
        labs_prefs=labs_prefs,
        agent_id=agent_id,
    )
