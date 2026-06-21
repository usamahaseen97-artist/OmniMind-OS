from __future__ import annotations

import httpx

from config import get_settings

TAVILY_URL = "https://api.tavily.com/search"


async def tavily_search(query: str, max_results: int = 4) -> str:
    from services.api_keys import get_key

    settings = get_settings()
    api_key = settings.tavily_api_key.strip() or get_key("TAVILY_API_KEY")
    if not api_key:
        return ""

    payload = {
        "api_key": api_key,
        "query": query,
        "search_depth": "basic",
        "max_results": max_results,
        "include_answer": True,
    }

    async with httpx.AsyncClient(timeout=8.0) as client:
        res = await client.post(TAVILY_URL, json=payload)
        res.raise_for_status()
        data = res.json()

    lines: list[str] = []
    answer = (data.get("answer") or "").strip()
    if answer:
        lines.append(f"**Summary:** {answer}")
    for item in data.get("results", [])[:max_results]:
        title = item.get("title", "Untitled")
        content = item.get("content", "")
        url = item.get("url", "")
        lines.append(f"- **{title}** ({url})\n  {content}")

    if not lines:
        return "No live search results found."

    return "Live web context:\n" + "\n".join(lines)
