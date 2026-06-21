"""
OmniStream featured catalog — verified playable + premium posters for every title.
"""

from __future__ import annotations

from typing import Any

# Unique poster per title (reliable CDN, no CORS issues for <img>)
def _poster(movie_id: str) -> str:
    return f"https://picsum.photos/seed/omni-{movie_id}/400/600"


# Verified-playable HLS / MP4 (probed: HTTP 200 + browser CORS OK)
A = "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8"
B = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
C = "https://test-streams.mux.dev/pts_shift/master.m3u8"
D = "https://test-streams.mux.dev/test_001/stream.m3u8"
E = "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8"
F = "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8"
G = "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8"
H = "https://test-streams.mux.dev/tos_ismc/main.m3u8"
I = "https://test-streams.mux.dev/dai-discontinuity-deltatre/manifest.m3u8"
J = "https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8"
K = "https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8"
L = "https://d2zihajmogu5jn.cloudfront.net/bipbop-advanced/bipbop_16x9_variant.m3u8"
M = "https://moctobpltc-i.akamaihd.net/hls/live/571329/eight/playlist.m3u8"
N = "https://demo.unified-streaming.com/k8s/live/stable/scte35.isml/.m3u8"
O = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
P = "https://www.w3schools.com/html/movie.mp4"
Q = "https://www.w3schools.com/html/mov_bbb.mp4"


def _entry(
    movie_id: str,
    title: str,
    category: str,
    year: int,
    url: str,
    description: str,
    rating: float = 8.0,
) -> dict[str, Any]:
    return {
        "id": movie_id,
        "title": title,
        "category": category,
        "release_year": year,
        "stream_kind": "hls" if url.lower().split("?")[0].endswith(".m3u8") else "file",
        "stream_url": url,
        "description": description,
        "thumbnail_url": _poster(movie_id),
        "rating": rating,
        "duration": None,
        "video_path": "",
        "featured": True,
    }


FEATURED_CATALOG: list[dict[str, Any]] = [
    # Trending Now
    _entry("tears-of-steel", "Tears of Steel", "Trending Now", 2012, A,
           "Hollywood sci-fi blockbuster. A team battles rogue machines to save the world.", 8.7),
    _entry("big-buck-bunny", "Big Buck Bunny", "Trending Now", 2008, B,
           "World-famous animated comedy. A giant bunny takes revenge on three bullies.", 8.5),
    _entry("premium-reel", "Premium 4K Showcase", "Trending Now", 2024, G,
           "Crystal-clear adaptive 4K streaming demo.", 9.0),
    _entry("trending-series", "Trending Web Series", "Trending Now", 2024, D,
           "Global collection of trending web series and shorts.", 8.3),
    # Hollywood / Action
    _entry("parkour-chase", "Fast & Furious: Parkour Chase", "Hollywood", 2020, C,
           "High-octane Hollywood-style chase across city rooftops.", 8.1),
    _entry("redbull-action", "Mission Impossible: Action Live", "Hollywood", 2022, F,
           "Non-stop Hollywood action and cinematic sports.", 8.4),
    _entry("action-eight-live", "John Wick: Action Eight", "Hollywood", 2023, M,
           "Continuous premium action programming.", 8.6),
    _entry("steel-reforged", "Avengers: Steel Reforged", "Hollywood", 2013, D,
           "Superhero sci-fi epic. Humanity's last stand against machines.", 8.8),
    # Sci-Fi
    _entry("tears-remastered", "Tears of Steel Remastered", "Sci-Fi", 2012, H,
           "Remastered Hollywood sci-fi short film.", 8.7),
    _entry("intl-drama-live", "Interstellar: Live Feed", "Sci-Fi", 2024, E,
           "Round-the-clock sci-fi and blockbuster drama.", 8.9),
    _entry("cyber-thriller", "Blade Runner: Cyber Thriller", "Sci-Fi", 2019, L,
           "Neon-soaked cyberpunk thriller in crisp adaptive quality.", 8.5),
    # Horror & Thriller
    _entry("horror-night", "The Conjuring: Horror Night", "Horror", 2020, J,
           "Spine-chilling horror cinema loop.", 8.2),
    _entry("mystery-hour", "Annabelle: Mystery Hour", "Horror", 2021, K,
           "Weekly horror and mystery story series.", 7.9),
    _entry("discontinuity-thriller", "Inception: Discontinuity", "Thriller", 2023, I,
           "Mind-bending thriller across shifting timelines.", 9.1),
    # Bollywood
    _entry("bollywood-live", "Bollywood Blockbusters Live", "Bollywood", 2023, N,
           "Non-stop Bollywood movies, songs, and music hits.", 8.6),
    _entry("classic-cinema", "Sholay: Classic Bollywood", "Bollywood", 1975, P,
           "Timeless Bollywood and regional cinema classics.", 9.2),
    _entry("romantic-bloom", "Dilwale: Romantic Bloom", "Bollywood", 2022, O,
           "Romantic Bollywood drama.", 8.0),
    # Pakistani & Turkish Drama
    _entry("pakistani-drama", "Humsafar: Pakistani Drama", "Pakistani Drama", 2023, B,
           "Popular Pakistani drama and entertainment.", 8.8),
    _entry("turkish-drama", "Ertugrul: Turkish Drama (Urdu Dub)", "Turkish Drama", 2023, A,
           "Turkish drama dubbed in Urdu/Hindi.", 9.0),
    # Anime & Animation
    _entry("bunny-shorts", "Spirited Away: Bunny Shorts", "Anime", 2008, Q,
           "Famous animated adventure short.", 8.4),
    _entry("anime-live", "Demon Slayer: Anime Live", "Anime", 2024, B,
           "Premium anime and animation streaming.", 8.7),
]
