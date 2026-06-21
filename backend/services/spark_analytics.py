"""
Apache Spark-style real-time analytics over Kafka telemetry (in-memory + JSONL stream).

- Collaborative filtering taste matrices
- Dynamic UI mood (/api/v1/user/current-mood)
- Self-healing HLS buffer recommendations
"""

from __future__ import annotations

import logging
import time
from collections import Counter, defaultdict
from typing import Any, Optional

from services.kafka_pipeline import TOPIC_BY_DOMAIN, load_topic_events

logger = logging.getLogger(__name__)

MOOD_THEMES: dict[str, dict[str, Any]] = {
    "cyberpunk-dark": {
        "label": "Cyberpunk Dark",
        "genres": ["sci-fi", "science fiction", "thriller", "dark", "mind-bending"],
        "css": {
            "--omni-accent": "#00f0ff",
            "--omni-accent-glow": "rgba(0, 240, 255, 0.45)",
            "--omni-bg": "#050508",
            "--omni-card": "#0d0d14",
            "--omni-border": "rgba(0, 240, 255, 0.35)",
            "--omni-text": "#e8f4ff",
        },
        "tailwind": "mood-cyberpunk",
    },
    "neon-retro": {
        "label": "Neon Retro",
        "genres": ["lo-fi", "lofi", "synthwave", "electronic", "chill", "ambient"],
        "css": {
            "--omni-accent": "#ff2d95",
            "--omni-accent-glow": "rgba(255, 45, 149, 0.5)",
            "--omni-bg": "#0f0618",
            "--omni-card": "#1a0a28",
            "--omni-border": "rgba(255, 45, 149, 0.4)",
            "--omni-text": "#ffe8f7",
        },
        "tailwind": "mood-neon-retro",
    },
    "clean-emerald": {
        "label": "Clean Emerald",
        "genres": ["sports", "football", "cricket", "news", "live", "documentary"],
        "css": {
            "--omni-accent": "#10b981",
            "--omni-accent-glow": "rgba(16, 185, 129, 0.45)",
            "--omni-bg": "#060b09",
            "--omni-card": "#0f1814",
            "--omni-border": "rgba(16, 185, 129, 0.35)",
            "--omni-text": "#d1fae5",
        },
        "tailwind": "mood-emerald",
    },
    "cinema-gold": {
        "label": "Cinema Gold",
        "genres": ["hollywood", "drama", "international", "blockbuster", "mind-bending"],
        "css": {
            "--omni-accent": "#E50914",
            "--omni-accent-glow": "rgba(229, 9, 20, 0.5)",
            "--omni-bg": "#0B0B0F",
            "--omni-card": "#16161c",
            "--omni-border": "rgba(229, 9, 20, 0.4)",
            "--omni-text": "#f5f5f5",
        },
        "tailwind": "mood-cinema",
    },
}

_STATUS_WEIGHT = {"play": 4, "click": 2, "view": 1, "pause": 1, "skip": -1, "stop": 0, "buffer": 3}


def _all_events(*, max_per_topic: int = 3000) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for topic in TOPIC_BY_DOMAIN.values():
        rows.extend(load_topic_events(topic, max_lines=max_per_topic))
    return rows


def _spark_aggregate(events: list[dict[str, Any]], key: str) -> Optional[list[tuple[str, float]]]:
    try:
        from services import spark_client

        spark = spark_client.get_spark_session()
        df = spark.createDataFrame(events)
        from pyspark.sql import functions as F

        weighted = (
            df.withColumn(
                "w",
                F.when(F.col("playback_status") == "play", 4)
                .when(F.col("playback_status") == "click", 2)
                .otherwise(1),
            )
            .groupBy(key)
            .agg(F.sum("w").alias("score"))
            .orderBy(F.desc("score"))
            .limit(50)
        )
        return [(r[key], float(r["score"])) for r in weighted.collect() if r[key]]
    except Exception as exc:
        logger.debug("Spark aggregate fallback: %s", exc)
        return None


def _user_events(events: list[dict[str, Any]], user_id: str) -> list[dict[str, Any]]:
    uid = (user_id or "anonymous").strip()
    return [e for e in events if str(e.get("user_id") or "") == uid]


def compute_taste_matrix(user_id: str) -> dict[str, Any]:
    """Collaborative filtering — genre affinity per domain."""
    events = _user_events(_all_events(), user_id)
    by_domain: dict[str, Counter[str]] = defaultdict(Counter)
    content_scores: Counter[str] = Counter()

    for ev in events:
        domain = str(ev.get("domain") or "movie")
        genre = str(ev.get("genre") or "General").lower()
        status = str(ev.get("playback_status") or "view")
        w = _STATUS_WEIGHT.get(status, 1)
        by_domain[domain][genre] += w
        cid = str(ev.get("content_id") or "")
        if cid:
            content_scores[cid] += w

    genre_affinity = {
        dom: [{"genre": g, "score": s} for g, s in ctr.most_common(12)]
        for dom, ctr in by_domain.items()
    }
    top_content = [{"content_id": c, "score": s} for c, s in content_scores.most_common(24)]

    return {
        "user_id": user_id,
        "genre_affinity": genre_affinity,
        "top_content": top_content,
        "event_count": len(events),
    }


def _dominant_genre(active: list[dict[str, Any]]) -> str:
    """Weight recent play events higher."""
    now = time.time()
    scores: Counter[str] = Counter()
    for ev in active:
        if str(ev.get("playback_status")) not in ("play", "click", "view", "buffer"):
            continue
        age = max(0.0, now - float(ev.get("timestamp") or now))
        decay = max(0.2, 1.0 - age / 3600.0)
        genre = str(ev.get("genre") or "general").lower()
        scores[genre] += decay * _STATUS_WEIGHT.get(str(ev.get("playback_status")), 1)
    if not scores:
        return "general"
    return scores.most_common(1)[0][0]


def resolve_mood_theme(genre: str) -> str:
    g = genre.lower()
    for theme_id, spec in MOOD_THEMES.items():
        if any(k in g for k in spec["genres"]):
            return theme_id
    if "music" in g or "pop" in g:
        return "neon-retro"
    return "cinema-gold"


def compute_current_mood(user_id: str) -> dict[str, Any]:
    """Dynamic UI mood from dominant active playback genre."""
    events = _user_events(_all_events(), user_id)
    recent = [e for e in events if time.time() - float(e.get("timestamp") or 0) < 7200]
    genre = _dominant_genre(recent or events)
    theme_id = resolve_mood_theme(genre)
    spec = MOOD_THEMES[theme_id]
    active_domain = "movie"
    if recent:
        dom_ctr = Counter(str(e.get("domain") or "movie") for e in recent)
        active_domain = dom_ctr.most_common(1)[0][0]

    return {
        "user_id": user_id,
        "theme_id": theme_id,
        "theme_label": spec["label"],
        "dominant_genre": genre,
        "active_domain": active_domain,
        "css_variables": spec["css"],
        "tailwind_class": spec["tailwind"],
        "updated_at": time.time(),
    }


def compute_buffer_healing(user_id: str) -> dict[str, Any]:
    """
    Self-healing: if packet_loss or low bitrate spikes, recommend lower HLS variant.
    """
    events = _user_events(_all_events(), user_id)
    recent = [
        e
        for e in events
        if time.time() - float(e.get("timestamp") or 0) < 300
        and float(e.get("packet_loss_ratio") or 0) >= 0
    ]
    if not recent:
        return {
            "user_id": user_id,
            "healing_required": False,
            "recommended_variant": "auto",
            "target_bitrate_kbps": 4500,
            "reason": "no recent network telemetry",
        }

    loss_vals = [float(e.get("packet_loss_ratio") or 0) for e in recent]
    bitrate_vals = [float(e.get("network_bitrate") or 0) for e in recent if e.get("network_bitrate")]
    avg_loss = sum(loss_vals) / len(loss_vals)
    avg_bitrate = sum(bitrate_vals) / len(bitrate_vals) if bitrate_vals else 4500.0

    healing = avg_loss > 0.02 or avg_bitrate < 800.0
    if avg_loss > 0.08 or avg_bitrate < 400.0:
        variant = "360p"
        target = 400
    elif healing:
        variant = "720p"
        target = 1500
    else:
        variant = "1080p"
        target = 4500

    return {
        "user_id": user_id,
        "healing_required": healing,
        "recommended_variant": variant,
        "target_bitrate_kbps": target,
        "avg_packet_loss_ratio": round(avg_loss, 4),
        "avg_network_bitrate_kbps": round(avg_bitrate, 1),
        "force_adaptive_switch": healing,
        "hls_variants": [
            {"label": "1080p", "bitrate_kbps": 4500},
            {"label": "720p", "bitrate_kbps": 1500},
            {"label": "480p", "bitrate_kbps": 800},
            {"label": "360p", "bitrate_kbps": 400},
        ],
        "reason": "packet_loss_spike" if avg_loss > 0.02 else ("low_bitrate" if avg_bitrate < 800 else "stable"),
    }


def collaborative_recommendations(
    user_id: str,
    *,
    domain: str,
    catalog: list[dict[str, Any]],
    limit: int = 20,
) -> list[dict[str, Any]]:
    """Reorder catalog by taste matrix + similar users (genre overlap)."""
    events = _all_events()
    taste = compute_taste_matrix(user_id)
    aff = taste.get("genre_affinity") or {}
    domain_genres = {g["genre"].lower(): g["score"] for g in aff.get(domain, [])}

    def score_item(item: dict[str, Any]) -> float:
        s = 0.0
        for g in item.get("genres") or [item.get("genre") or item.get("category") or ""]:
            s += domain_genres.get(str(g).lower(), 0)
        s += domain_genres.get(str(item.get("category") or "").lower(), 0) * 0.5
        if str(item.get("id")) in {t["content_id"] for t in taste.get("top_content") or []}:
            s += 5.0
        rating = item.get("rating")
        if isinstance(rating, (int, float)):
            s += float(rating) * 0.3
        return s

    ranked = sorted(catalog, key=score_item, reverse=True)
    return ranked[:limit]


def process_stream_batch() -> dict[str, Any]:
    """Simulated Spark Streaming micro-batch over all topics."""
    counts = {t: len(load_topic_events(t, max_lines=500)) for t in TOPIC_BY_DOMAIN.values()}
    return {
        "engine": "spark-streaming-sim",
        "topics": counts,
        "processed_at": time.time(),
    }
