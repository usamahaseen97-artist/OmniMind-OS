"""
Premium international movie collections — thematic categories (Netflix case study).
"""

from __future__ import annotations

from typing import Any

from services.omnistream_catalog import FEATURED_CATALOG, _entry, _poster

# Verified HLS pool from featured catalog
_HLS = [
    e["stream_url"]
    for e in FEATURED_CATALOG
    if str(e.get("stream_url", "")).endswith(".m3u8")
]
_MP4 = [
    e["stream_url"]
    for e in FEATURED_CATALOG
    if str(e.get("stream_url", "")).endswith(".mp4")
]


def _stream_at(i: int) -> tuple[str, str]:
    pool = _HLS or _MP4 or [""]
    url = pool[i % len(pool)]
    kind = "hls" if ".m3u8" in url else "file"
    return url, kind


INTERNATIONAL_COLLECTIONS: list[dict[str, Any]] = [
    {
        "collection": "Mind-Bending Sci-Fi",
        "theme": "cyberpunk-dark",
        "movies": [
            ("inception", "Inception", 2010, 8.8, "A thief enters dreams to plant an idea — reality bends."),
            ("interstellar", "Interstellar", 2014, 8.7, "Explorers travel through a wormhole to save humanity."),
            ("shutter-island", "Shutter Island", 2010, 8.2, "A marshal investigates a psychiatric facility on an isolated island."),
            ("arrival", "Arrival", 2016, 7.9, "A linguist communicates with extraterrestrial visitors."),
            ("blade-runner-2049", "Blade Runner 2049", 2017, 8.0, "A young blade runner uncovers a secret that could destabilize society."),
        ],
    },
    {
        "collection": "Hollywood Blockbusters",
        "theme": "cinema-gold",
        "movies": [
            ("dark-knight", "The Dark Knight", 2008, 9.0, "Batman faces the Joker in Gotham City."),
            ("mad-max-fury", "Mad Max: Fury Road", 2015, 8.1, "A post-apocalyptic chase across the wasteland."),
            ("dune-2021", "Dune", 2021, 8.0, "Paul Atreides leads a rebellion on the desert planet Arrakis."),
            ("oppenheimer", "Oppenheimer", 2023, 8.3, "The story of the physicist who built the atomic bomb."),
        ],
    },
    {
        "collection": "Psychological Thrillers",
        "theme": "cyberpunk-dark",
        "movies": [
            ("fight-club", "Fight Club", 1999, 8.4, "An insomniac office worker forms an underground fight club."),
            ("gone-girl", "Gone Girl", 2014, 8.1, "A media frenzy erupts when a woman disappears on her anniversary."),
            ("prestige", "The Prestige", 2006, 8.5, "Two magicians engage in a deadly rivalry."),
        ],
    },
]


def build_international_catalog() -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    idx = 0
    for block in INTERNATIONAL_COLLECTIONS:
        collection = block["collection"]
        theme = block["theme"]
        for mid, title, year, rating, desc in block["movies"]:
            url, kind = _stream_at(idx)
            idx += 1
            doc = _entry(mid, title, collection, year, url, desc, rating)
            doc["genres"] = [collection, "International", "Hollywood"]
            doc["theme"] = theme
            doc["collection"] = collection
            doc["poster_url"] = _poster(mid)
            doc["backdrop_url"] = f"https://picsum.photos/seed/omni-back-{mid}/1280/720"
            doc["source"] = "international"
            out.append(doc)
    for row in FEATURED_CATALOG:
        if row["id"] not in {d["id"] for d in out}:
            extra = dict(row)
            extra["source"] = "featured"
            out.append(extra)
    return out
