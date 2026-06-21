from __future__ import annotations

import json
from typing import AsyncGenerator

import httpx

from config import get_settings

SYSTEM_PROMPT = """You are OmniMind V11 General Chatbot — respond like Google Gemini / ChatGPT.
Talk naturally and quickly. Understand typos and Roman Urdu; infer intent.

**POLYGLOT RULE:** Match the user's language AND script. Roman Latin input → Roman Latin output only.
Never auto-switch to Devanagari or Nastaliq unless explicitly requested.

Keep answers direct, concise, and human (1–4 short paragraphs). Use markdown when useful. Founder: USAMA HASEEN."""


async def stream_gemini(
    message: str,
    history: list[dict],
    extra_context: str = "",
    *,
    system_prompt: str | None = None,
    use_google_search: bool = False,
) -> AsyncGenerator[str, None]:
    settings = get_settings()
    if not settings.gemini_api_key:
        async for token in mock_stream(message, extra_context):
            yield token
        return

    contents = []
    for turn in history[-10:]:
        role = "user" if turn.get("role") == "user" else "model"
        contents.append({"role": role, "parts": [{"text": turn.get("content", "")}]})

    user_text = message
    if extra_context:
        user_text = f"{extra_context}\n\nUser question:\n{message}"

    contents.append({"role": "user", "parts": [{"text": user_text}]})

    model = settings.gemini_model.strip() or "gemini-2.0-flash"
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:streamGenerateContent?alt=sse"
        f"&key={settings.gemini_api_key}"
    )
    sys_text = system_prompt or SYSTEM_PROMPT
    body: dict = {
        "systemInstruction": {"parts": [{"text": sys_text}]},
        "contents": contents,
        "generationConfig": {
            "temperature": 0.85,
            "maxOutputTokens": 8192,
            "topP": 0.95,
        },
    }
    if use_google_search:
        body["tools"] = [{"google_search": {}}]

    timeout = httpx.Timeout(connect=5.0, read=90.0, write=15.0, pool=5.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        async with client.stream("POST", url, json=body) as response:
            if response.status_code >= 400:
                err_body = await response.aread()
                raise RuntimeError(
                    f"Gemini HTTP {response.status_code}: {err_body[:200]!r}"
                )
            async for line in response.aiter_lines():
                if not line.startswith("data: "):
                    continue
                payload = line[6:].strip()
                if not payload or payload == "[DONE]":
                    continue
                try:
                    chunk = json.loads(payload)
                    parts = chunk.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                    for part in parts:
                        text = part.get("text")
                        if text:
                            yield text
                except json.JSONDecodeError:
                    continue


async def stream_local_llm(message: str, history: list[dict]) -> AsyncGenerator[str, None]:
    settings = get_settings()
    base = settings.local_llm_url.rstrip("/")
    url = f"{base}/chat/completions"

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for turn in history[-12:]:
        messages.append({"role": turn.get("role", "user"), "content": turn.get("content", "")})
    messages.append({"role": "user", "content": message})

    from services.lm_studio import auth_headers

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                url,
                json={
                    "model": get_settings().effective_local_llm_model,
                    "messages": messages,
                    "stream": True,
                },
                headers=auth_headers(),
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    data = line[6:].strip()
                    if data == "[DONE]":
                        break
                    try:
                        parsed = json.loads(data)
                        delta = parsed["choices"][0]["delta"].get("content")
                        if delta:
                            yield delta
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue
    except Exception:
        async for token in mock_stream(message, ""):
            yield token


async def mock_stream(message: str, context: str) -> AsyncGenerator[str, None]:
    preview = message[:120]
    text = f"**OmniMind V11**\n\nYou asked: _{preview}_\n\n"
    if context:
        text += "Web context was retrieved.\n\n"
    text += "Add **GEMINI_API_KEY** in backend/.env for full Gemini-speed replies."
    for word in text.split(" "):
        yield word + " "
