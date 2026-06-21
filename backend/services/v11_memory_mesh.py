"""
In-process memory mesh — bypasses Redis/Kafka ConnectionRefused without halting the app.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

logger = logging.getLogger("OmniMind_V11")


class DistributedMemoryBypassMesh:
    def __init__(self) -> None:
        self.kv_storage: dict[str, Any] = {}
        self.stream_topics: dict[str, list[str]] = {
            "navigation_logs": [],
            "system_events": [],
        }

    def get(self, key: str) -> Optional[Any]:
        return self.kv_storage.get(key)

    def set(self, key: str, value: Any) -> bool:
        self.kv_storage[key] = value
        return True

    def emit_kafka_mock_stream(self, topic: str, message: str) -> None:
        if topic not in self.stream_topics:
            self.stream_topics[topic] = []
        self.stream_topics[topic].append(message)
        logger.info("[MOCK KAFKA PRODUCER -> %s]: %s", topic, message)

    def status(self) -> dict[str, Any]:
        return {
            "redis_emulated_cache": True,
            "kafka_spark_streaming_mesh": "Active (Virtual In-Memory Layer)",
            "kv_keys": len(self.kv_storage),
            "topics": {k: len(v) for k, v in self.stream_topics.items()},
        }


v11_mesh = DistributedMemoryBypassMesh()
