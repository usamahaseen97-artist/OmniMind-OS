"""
Spark-style analytics for OmniMovies — trending + personalized rows from watch history.
Uses PySpark when JVM is available; Python aggregation otherwise (Netflix case-study pattern).
"""

from __future__ import annotations

import logging
from collections import Counter, defaultdict
from typing import Any, Optional

from services.movie_analytics import load_movie_events

logger = logging.getLogger(__name__)

_ACTION_WEIGHT = {"play": 3, "click": 1, "view": 1}


def _python_trending(events: list[dict[str, Any]], *, limit: int = 24) -> list[dict[str, Any]]:
    scores: Counter[str] = Counter()
    meta: dict[str, dict[str, Any]] = {}
    for ev in events:
        mid = str(ev.get("movie_id") or "")
        if not mid:
            continue
        action = str(ev.get("action") or "click")
        scores[mid] += _ACTION_WEIGHT.get(action, 1)
        meta[mid] = ev.get("payload") or meta.get(mid) or {}

    ranked = [
        {"movie_id": mid, "score": sc, "meta": meta.get(mid) or {}}
        for mid, sc in scores.most_common(limit)
    ]
    return ranked


def _python_personalized(
    events: list[dict[str, Any]],
    user_id: str,
    *,
    limit: int = 24,
) -> list[dict[str, Any]]:
    uid = (user_id or "anonymous").strip()
    genre_scores: Counter[str] = Counter()
    movie_scores: Counter[str] = Counter()

    for ev in events:
        if str(ev.get("user_id") or "") != uid:
            continue
        mid = str(ev.get("movie_id") or "")
        action = str(ev.get("action") or "click")
        w = _ACTION_WEIGHT.get(action, 1)
        movie_scores[mid] += w
        payload = ev.get("payload") if isinstance(ev.get("payload"), dict) else {}
        for g in payload.get("genres") or []:
            genre_scores[str(g)] += w
        cat = payload.get("category")
        if cat:
            genre_scores[str(cat)] += w

    return [
        {
            "movie_id": mid,
            "score": sc,
            "preferred_genres": [g for g, _ in genre_scores.most_common(5)],
        }
        for mid, sc in movie_scores.most_common(limit)
    ]


def _spark_trending(events: list[dict[str, Any]], *, limit: int) -> Optional[list[dict[str, Any]]]:
    try:
        from services import spark_client

        spark = spark_client.get_spark_session()
        df = spark.createDataFrame(events)
        from pyspark.sql import functions as F

        weighted = (
            df.withColumn(
                "w",
                F.when(F.col("action") == "play", 3)
                .when(F.col("action") == "click", 1)
                .otherwise(1),
            )
            .groupBy("movie_id")
            .agg(F.sum("w").alias("score"))
            .orderBy(F.desc("score"))
            .limit(limit)
        )
        return [row.asDict() for row in weighted.collect()]
    except Exception as exc:
        logger.debug("Spark trending fallback: %s", exc)
        return None


def compute_movie_analytics(
    *,
    user_id: str = "anonymous",
    catalog_by_id: Optional[dict[str, dict[str, Any]]] = None,
    trending_limit: int = 20,
    personalized_limit: int = 20,
) -> dict[str, Any]:
    events = load_movie_events()
    catalog_by_id = catalog_by_id or {}

    spark_trending = _spark_trending(events, limit=trending_limit)
    trending_ids = (
        [str(r["movie_id"]) for r in spark_trending]
        if spark_trending
        else [r["movie_id"] for r in _python_trending(events, limit=trending_limit)]
    )

    personalized_meta = _python_personalized(events, user_id, limit=personalized_limit)
    personalized_ids = [str(r["movie_id"]) for r in personalized_meta]

    def pick_docs(ids: list[str]) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []
        seen: set[str] = set()
        for mid in ids:
            doc = catalog_by_id.get(mid)
            if doc and mid not in seen:
                seen.add(mid)
                out.append(doc)
        return out

    trending_docs = pick_docs(trending_ids)
    personalized_docs = pick_docs(personalized_ids)

    # Fill personalized from user's top genres if sparse
    if len(personalized_docs) < 6 and personalized_meta:
        top_genres = personalized_meta[0].get("preferred_genres") or []
        for genre in top_genres:
            for doc in catalog_by_id.values():
                if doc.get("category") == genre or genre in (doc.get("genres") or []):
                    if doc["id"] not in {d["id"] for d in personalized_docs}:
                        personalized_docs.append(doc)
                    if len(personalized_docs) >= personalized_limit:
                        break

    genre_rows: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for doc in catalog_by_id.values():
        cat = str(doc.get("category") or "International")
        if len(genre_rows[cat]) < 24:
            genre_rows[cat].append(doc)

    return {
        "engine": "pyspark" if spark_trending else "python",
        "event_count": len(events),
        "trending_now": trending_docs,
        "personalized_for_you": personalized_docs[:personalized_limit],
        "genre_rows": [{"genre": g, "items": items} for g, items in genre_rows.items()],
    }
