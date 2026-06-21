"""
Gemini function calling — play_music tool for OmniMind chatbot.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Optional

import httpx

from config import get_settings

logger = logging.getLogger(__name__)

PLAY_MUSIC_TOOL = {
    "function_declarations": [
        {
            "name": "play_music",
            "description": (
                "Use this tool when the user wants to play, listen, or search for a song or music."
            ),
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "song_name": {
                        "type": "STRING",
                        "description": (
                            "The exact name or keywords of the song requested by the user."
                        ),
                    }
                },
                "required": ["song_name"],
            },
        }
    ]
}


def _build_contents(message: str, history: list[dict], extra_context: str) -> list[dict]:
    contents: list[dict] = []
    for turn in history[-12:]:
        role = "user" if turn.get("role") == "user" else "model"
        contents.append({"role": role, "parts": [{"text": turn.get("content", "")}]})
    user_text = message
    if extra_context:
        user_text = f"{extra_context}\n\nUser question:\n{message}"
    contents.append({"role": "user", "parts": [{"text": user_text}]})
    return contents


def _extract_function_calls(data: dict[str, Any]) -> list[dict[str, Any]]:
    calls: list[dict[str, Any]] = []
    for cand in data.get("candidates") or []:
        content = cand.get("content") or {}
        for part in content.get("parts") or []:
            fc = part.get("functionCall") or part.get("function_call")
            if fc:
                calls.append(fc)
    return calls


def _song_name_from_call(call: dict[str, Any]) -> str:
    args = call.get("args") or call.get("arguments") or {}
    if isinstance(args, str):
        try:
            args = json.loads(args)
        except json.JSONDecodeError:
            args = {"song_name": args}
    return str(args.get("song_name") or "").strip()


async def execute_play_music(song_name: str) -> dict[str, Any]:
    """
    play_music tool — Elasticsearch multi_match fuzzy search first, then Audius fallback.
    No MongoDB query or slow direct API chain on the hot path.
    """
    from services.music_fast import fast_play_music_payload

    return await fast_play_music_payload(song_name)


async def gemini_try_play_music_tool(
    *,
    message: str,
    history: list[dict],
    extra_context: str = "",
    system_prompt: str | None = None,
) -> Optional[dict[str, Any]]:
    """
    One-shot Gemini generateContent with play_music tool registered.
    Returns music_player payload if the model triggers play_music, else None.
    """
    settings = get_settings()
    if not settings.gemini_api_key:
        return None

    from services.gemini_stream import SYSTEM_PROMPT

    model = settings.gemini_model.strip() or "gemini-2.0-flash"
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent?key={settings.gemini_api_key}"
    )
    body = {
        "systemInstruction": {"parts": [{"text": system_prompt or SYSTEM_PROMPT}]},
        "contents": _build_contents(message, history, extra_context),
        "tools": [PLAY_MUSIC_TOOL],
    }

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(url, json=body)
            if response.status_code >= 400:
                logger.warning("Gemini tools call HTTP %s: %s", response.status_code, response.text[:300])
                return None
            data = response.json()
    except Exception as exc:
        logger.warning("Gemini tools call failed: %s", exc)
        return None

    for call in _extract_function_calls(data):
        name = call.get("name") or ""
        if name != "play_music":
            continue
        song_name = _song_name_from_call(call)
        if not song_name:
            song_name = message.strip()[:200]
        return await execute_play_music(song_name)

    return None
