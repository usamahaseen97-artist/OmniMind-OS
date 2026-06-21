"""
OmniMusic catalog — latest + classic hits (Pakistani, Bollywood, Hollywood, Turkish).

Playback is resolved at runtime via Audius (open catalog, free streams).
Catalog metadata is curated; audio_url is replaced by omnimusic_resolver on each request.
"""

from __future__ import annotations

import re
from typing import Any

SOUNDHELIX = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-{}.mp3"


def _audio(seed: str) -> str:
    n = (sum(ord(c) for c in seed) % 16) + 1
    return SOUNDHELIX.format(n)


def _category_from_playlist(playlist: str) -> str:
    if "Coke Studio" in playlist:
        return "Coke Studio"
    if "Classic" in playlist:
        return "Classics"
    if playlist in ("Hollywood Pop", "Punjabi Hits") or "Pop" in playlist:
        return "Pop"
    if "Latest" in playlist or "Hits" in playlist:
        return "Latest"
    return "Pop"


def _song(
    sid: str,
    title: str,
    artist: str,
    album: str,
    playlist: str,
    year: int,
    era: str,
    tags: list[str],
    *,
    category: str | None = None,
    duration: str = "4:32",
    duration_sec: int = 272,
) -> dict[str, Any]:
    cat = category or _category_from_playlist(playlist)
    return {
        "id": sid,
        "title": title,
        "artist": artist,
        "album": album,
        "playlist": playlist,
        "category": cat,
        "year": year,
        "era": era,
        "tags": tags,
        "duration": duration,
        "duration_sec": duration_sec,
        "thumbnail_url": f"https://picsum.photos/seed/omnimusic-{sid}/480/480",
        "audio_url": _audio(sid),
        "source": "public-cdn",
    }


# fmt: off
CATALOG: list[dict[str, Any]] = [
    # --- Latest Hits 2023–2025 ---
    _song("pasoori", "Pasoori", "Ali Sethi & Shae Gill", "Coke Studio 15", "Pakistani Latest", 2022, "latest", ["pasoori", "coke studio", "pakistani", "viral"]),
    _song("tu-hai-kahan", "Tu Hai Kahan", "AUR", "Single", "Pakistani Latest", 2023, "latest", ["aur", "pakistani", "romantic"]),
    _song("jhol", "Jhol", "Maanu & Annural Khalid", "Single", "Pakistani Latest", 2024, "latest", ["jhol", "maanu", "pakistani"]),
    _song("ishq", "Ishq", "Talha Anjum & Talhah Yunus", "Single", "Pakistani Latest", 2024, "latest", ["young stunners", "rap", "pakistani"]),
    _song("kesariya", "Kesariya", "Arijit Singh", "Brahmastra", "Bollywood Latest", 2022, "latest", ["bollywood", "arijit", "romantic"]),
    _song("chaleya", "Chaleya", "Arijit Singh", "Jawan", "Bollywood Latest", 2023, "latest", ["bollywood", "shahrukh", "romantic"]),
    _song("apna-bana-le", "Apna Bana Le", "Arijit Singh", "Bhediya", "Bollywood Latest", 2022, "latest", ["bollywood", "arijit"]),
    _song("tum-hi-ho", "Tum Hi Ho", "Arijit Singh", "Aashiqui 2", "Bollywood Latest", 2013, "latest", ["bollywood", "arijit", "romantic"]),
    _song("blinding-lights", "Blinding Lights", "The Weeknd", "After Hours", "Hollywood Pop", 2020, "latest", ["hollywood", "pop", "english"]),
    _song("flowers", "Flowers", "Miley Cyrus", "Endless Summer", "Hollywood Pop", 2023, "latest", ["hollywood", "pop", "english"]),
    _song("anti-hero", "Anti-Hero", "Taylor Swift", "Midnights", "Hollywood Pop", 2022, "latest", ["hollywood", "pop", "english"]),
    _song("as-it-was", "As It Was", "Harry Styles", "Harry's House", "Hollywood Pop", 2022, "latest", ["hollywood", "pop", "english"]),
    _song("cruel-summer", "Cruel Summer", "Taylor Swift", "Lover", "Hollywood Pop", 2019, "latest", ["hollywood", "pop"]),
    _song("shape-of-you", "Shape of You", "Ed Sheeran", "Divide", "Hollywood Pop", 2017, "latest", ["hollywood", "pop", "english"]),
    _song("ertugral-theme", "Ertugral Ghazi Theme", "Zaynah & Zanjabeel", "Dirilis Ertugrul", "Turkish Drama", 2020, "latest", ["turkish", "ertugral", "urdu", "drama"]),
    _song("kalimannu-theme", "Kurulus Osman Theme", "Orchestra", "Kurulus Osman", "Turkish Drama", 2023, "latest", ["turkish", "osman", "drama"]),
    # --- Pakistani Classics ---
    _song("dil-dil-pakistan", "Dil Dil Pakistan", "Vital Signs", "Vital Signs 1", "Pakistani Classics", 1987, "classic", ["pakistani", "classic", "patriotic", "vital signs"]),
    _song("afreen-afreen", "Afreen Afreen", "Nusrat Fateh Ali Khan", "Mustt Mustt", "Pakistani Classics", 1995, "classic", ["nusrat", "qawwali", "pakistani", "classic"]),
    _song("tajdar-e-haram", "Tajdar-e-Haram", "Atif Aslam", "Coke Studio 8", "Pakistani Classics", 2015, "classic", ["atif", "coke studio", "qawwali", "pakistani"]),
    _song("woh lamhe", "Woh Lamhe", "Atif Aslam", "Zeher", "Pakistani Classics", 2005, "classic", ["atif", "pakistani", "romantic"]),
    _song("pehli dafa", "Pehli Dafa", "Atif Aslam", "Single", "Pakistani Classics", 2017, "classic", ["atif", "pakistani"]),
    _song("rahat-jiya-dhadak", "Jiya Dhadak Dhadak", "Rahat Fateh Ali Khan", "Kalyug", "Pakistani Classics", 2005, "classic", ["rahat", "bollywood", "pakistani"]),
    _song("damadam-mast", "Damadam Mast Qalandar", "Abida Parveen", "Sufi Sessions", "Pakistani Classics", 2010, "classic", ["abida", "sufi", "qawwali", "pakistani"]),
    _song("humsafar-ost", "Humsafar OST", "Quratulain Balouch", "Humsafar", "Pakistani Classics", 2011, "classic", ["humsafar", "drama", "ost", "pakistani"]),
    _song("mann-ja", "Mann Ja", "Atif Aslam", "Coke Studio 9", "Pakistani Classics", 2016, "classic", ["atif", "coke studio"]),
    _song("billo-de-ghar", "Billo De Ghar", "Abrar-ul-Haq", "Billo", "Pakistani Classics", 1995, "classic", ["punjabi", "bhangra", "pakistani"]),
    _song("lahore-da-paranda", "Lahore Da Paranda", "Bohemia", "Vich Pardesan", "Pakistani Classics", 2006, "classic", ["punjabi", "rap", "bohemia"]),
    _song("coke-rang", "Rang", "Shuja Haider", "Coke Studio 9", "Coke Studio", 2016, "classic", ["coke studio", "pakistani"]),
    _song("coke-afreen", "Afreen Afreen (Coke Studio)", "Rahat & Momina", "Coke Studio 9", "Coke Studio", 2016, "classic", ["coke studio", "rahat"]),
    # --- Bollywood Classics ---
    _song("lag-ja-gale", "Lag Ja Gale", "Lata Mangeshkar", "Woh Kaun Thi", "Bollywood Classics", 1964, "classic", ["bollywood", "old", "lata", "classic"]),
    _song("kal-ho-na-ho", "Kal Ho Naa Ho", "Sonu Nigam", "Kal Ho Naa Ho", "Bollywood Classics", 2003, "classic", ["bollywood", "shahrukh", "sonu", "classic"]),
    _song("kabhi-kabhi", "Kabhi Kabhi Mere Dil Mein", "Lata Mangeshkar", "Kabhi Kabhi", "Bollywood Classics", 1976, "classic", ["bollywood", "old", "romantic"]),
    _song("pehla-nasha", "Pehla Nasha", "Udit Narayan", "Jo Jeeta Wohi Sikandar", "Bollywood Classics", 1992, "classic", ["bollywood", "romantic", "classic"]),
    _song("tujhe-dekha", "Tujhe Dekha Toh", "Lata & Kumar Sanu", "DDLJ", "Bollywood Classics", 1995, "classic", ["bollywood", "srk", "ddl", "classic"]),
    _song("channa-mereya", "Channa Mereya", "Arijit Singh", "Ae Dil Hai Mushkil", "Bollywood Classics", 2016, "classic", ["bollywood", "arijit", "sad"]),
    _song("raabta", "Raabta", "Arijit Singh", "Agent Vinod", "Bollywood Classics", 2012, "classic", ["bollywood", "arijit"]),
    _song("gerua", "Gerua", "Arijit Singh", "Dilwale", "Bollywood Classics", 2015, "classic", ["bollywood", "srk", "romantic"]),
    _song("shiddat-title", "Shiddat Title Track", "Manan Bhardwaj", "Shiddat", "Bollywood Classics", 2021, "classic", ["bollywood", "romantic"]),
    _song("raataan-lambiyan", "Raataan Lambiyan", "Arijit Singh", "Shershaah", "Bollywood Latest", 2021, "latest", ["bollywood", "sidharth", "romantic"]),
    _song("kesariya-brahm", "Kesariya (Extended)", "Arijit Singh", "Brahmastra", "Bollywood Latest", 2022, "latest", ["bollywood", "ranbir"]),
    # --- Hollywood / International Classics ---
    _song("bohemian", "Bohemian Rhapsody", "Queen", "A Night at the Opera", "Hollywood Classics", 1975, "classic", ["hollywood", "rock", "classic", "english"]),
    _song("imagine", "Imagine", "John Lennon", "Imagine", "Hollywood Classics", 1971, "classic", ["hollywood", "classic", "english"]),
    _song("hotel-california", "Hotel California", "Eagles", "Hotel California", "Hollywood Classics", 1977, "classic", ["hollywood", "rock", "classic"]),
    _song("thriller", "Thriller", "Michael Jackson", "Thriller", "Hollywood Classics", 1982, "classic", ["hollywood", "pop", "mj", "classic"]),
    _song("billie-jean", "Billie Jean", "Michael Jackson", "Thriller", "Hollywood Classics", 1983, "classic", ["hollywood", "pop", "mj"]),
    _song("stairway", "Stairway to Heaven", "Led Zeppelin", "Led Zeppelin IV", "Hollywood Classics", 1971, "classic", ["hollywood", "rock", "classic"]),
    _song("sweet-child", "Sweet Child O Mine", "Guns N Roses", "Appetite", "Hollywood Classics", 1987, "classic", ["hollywood", "rock"]),
    _song("smells-like", "Smells Like Teen Spirit", "Nirvana", "Nevermind", "Hollywood Classics", 1991, "classic", ["hollywood", "grunge", "rock"]),
    _song("rolling-stone", "Paint It Black", "The Rolling Stones", "Aftermath", "Hollywood Classics", 1966, "classic", ["hollywood", "rock", "classic"]),
    _song("yesterday", "Yesterday", "The Beatles", "Help!", "Hollywood Classics", 1965, "classic", ["hollywood", "beatles", "classic"]),
    _song("perfect", "Perfect", "Ed Sheeran", "Divide", "Hollywood Pop", 2017, "latest", ["hollywood", "pop", "wedding"]),
    _song("someone-like-you", "Someone Like You", "Adele", "21", "Hollywood Pop", 2011, "classic", ["hollywood", "pop", "adele", "sad"]),
    _song("hello-adele", "Hello", "Adele", "25", "Hollywood Pop", 2015, "classic", ["hollywood", "pop", "adele"]),
    _song("uptown-funk", "Uptown Funk", "Bruno Mars", "Uptown Special", "Hollywood Pop", 2014, "classic", ["hollywood", "pop", "dance"]),
    _song("bad-guy", "Bad Guy", "Billie Eilish", "When We All Fall Asleep", "Hollywood Pop", 2019, "latest", ["hollywood", "pop", "english"]),
    _song("levitating", "Levitating", "Dua Lipa", "Future Nostalgia", "Hollywood Pop", 2020, "latest", ["hollywood", "pop", "dance"]),
    # --- Turkish / Urdu Drama ---
    _song("cukur-theme", "Cukur Theme", "Orchestra", "Cukur", "Turkish Drama", 2017, "classic", ["turkish", "drama", "urdu"]),
    _song("muhtesem-yuzyil", "Muhtesem Yuzyil Theme", "Fahir Atasoy", "Magnificent Century", "Turkish Drama", 2011, "classic", ["turkish", "drama", "historical"]),
    _song("kara-sevda", "Kara Sevda Theme", "Orchestra", "Endless Love", "Turkish Drama", 2015, "classic", ["turkish", "drama", "romantic"]),
    # --- Punjabi / Party ---
    _song("browntown", "Brown Rang", "Yo Yo Honey Singh", "International Villager", "Punjabi Hits", 2011, "classic", ["punjabi", "party", "honey singh"]),
    _song("high-rated", "High Rated Gabru", "Guru Randhawa", "High Rated Gabru", "Punjabi Hits", 2018, "latest", ["punjabi", "party", "guru"]),
    _song("lehanga", "Lehanga", "Jass Manak", "Lehanga", "Punjabi Hits", 2019, "latest", ["punjabi", "jass manak"]),
    _song("munda-badnam", "Munda Badnam", "Harrdy Sandhu", "Single", "Punjabi Hits", 2020, "latest", ["punjabi", "harrdy"]),
    # --- Coke Studio bundle ---
    _song("coke-ranjish", "Ranjish Hi Sahi", "Ali Sethi", "Coke Studio 14", "Coke Studio", 2021, "latest", ["coke studio", "ghazal", "ali sethi"]),
    _song("coke-gul", "Gul", "Ali Sethi", "Coke Studio 14", "Coke Studio", 2021, "latest", ["coke studio", "ali sethi"]),
    _song("coke-tu-jhoom", "Tu Jhoom", "Abida & Bilal", "Coke Studio 14", "Coke Studio", 2022, "latest", ["coke studio", "abida", "bilal"]),
]
# fmt: on

PRODUCTION_SONGS: list[dict[str, Any]] = CATALOG
PLAYLISTS = sorted({s["playlist"] for s in CATALOG})
CATEGORIES = ["Latest", "Classics", "Coke Studio", "Pop"]


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.strip().lower()).strip("-") or "track"


def _score(track: dict[str, Any], query: str) -> int:
    if not query:
        return 1
    q = query.lower()
    tokens = [t for t in re.split(r"\s+", q) if len(t) > 1]
    fields = " ".join(
        [
            track["title"],
            track["artist"],
            track["album"],
            track["playlist"],
            " ".join(track.get("tags", [])),
            str(track.get("year", "")),
        ]
    ).lower()
    if q in fields:
        return 100
    score = 0
    for tok in tokens:
        if tok in fields:
            score += 30
        if any(tok in f for f in [track["title"].lower(), track["artist"].lower()]):
            score += 20
    return score


def dynamic_track(query: str) -> dict[str, Any]:
    """When user searches any song name, always return a playable match."""
    q = query.strip()
    title = q.title() if q else "Unknown Track"
    sid = f"dyn-{_slug(q)[:48]}"
    return {
        "id": sid,
        "title": title,
        "artist": "OmniMusic · Live Search",
        "album": "Search Match",
        "playlist": "Search Results",
        "year": 2024,
        "era": "latest",
        "tags": ["search", "dynamic", q.lower()],
        "duration": "4:18",
        "duration_sec": 258,
        "category": "Latest",
        "thumbnail_url": f"https://picsum.photos/seed/omnimusic-{sid}/480/480",
        "audio_url": _audio(sid),
        "source": "search-match",
        "dynamic": True,
    }


def search_tracks(query: str = "", playlist: str | None = None, limit: int = 80) -> list[dict[str, Any]]:
    q = query.strip()
    results: list[tuple[int, dict[str, Any]]] = []

    for track in CATALOG:
        if playlist and playlist != "all" and track["playlist"] != playlist:
            continue
        sc = _score(track, q)
        if sc > 0 or not q:
            results.append((sc, track))

    results.sort(key=lambda x: (-x[0], -x[1].get("year", 0), x[1]["title"]))

    out = [t for _, t in results[:limit]]

    if q:
        has_strong = any(_score(t, q) >= 30 for t in out)
        if not has_strong:
            out = [dynamic_track(q)] + out

    if not q:
        latest = [t for t in out if t.get("era") == "latest"]
        classic = [t for t in out if t.get("era") == "classic"]
        out = latest + classic

    return out[:limit]


def list_categories() -> list[str]:
    return CATEGORIES


def list_playlists(query: str = "") -> list[str]:
    q = query.strip().lower()
    if not q:
        return PLAYLISTS
    hits = [p for p in PLAYLISTS if q in p.lower()]
    tag_hits = sorted({t["playlist"] for t in CATALOG if _score(t, q) > 0})
    return list(dict.fromkeys(hits + tag_hits))
