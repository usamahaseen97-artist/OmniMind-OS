import asyncio
import sys

sys.path.insert(0, ".")

from services.omnimusic_store import search_songs  # noqa: E402


async def main():
    rows = await search_songs("pasoori", limit=3)
    for r in rows:
        print(r["title"], "|", r["artist"], "|", r.get("source"), "|", r.get("audio_url", "")[:80])


asyncio.run(main())
