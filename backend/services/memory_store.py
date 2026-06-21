"""
In-memory MongoDB fallback when Atlas is offline or auth fails.
Enables chat/history tools to work locally without blocking API startup.
"""

from __future__ import annotations

import copy
from datetime import datetime, timezone
from typing import Any, Iterator, Optional


class InMemoryCursor:
    def __init__(self, docs: list[dict]) -> None:
        self._docs = docs

    def sort(self, key: str, direction: int = 1) -> InMemoryCursor:
        reverse = direction < 0
        self._docs.sort(key=lambda d: d.get(key) or datetime.min.replace(tzinfo=timezone.utc), reverse=reverse)
        return self

    def limit(self, n: int) -> InMemoryCursor:
        self._docs = self._docs[:n]
        return self

    def __iter__(self) -> Iterator[dict]:
        return iter(self._docs)


class InMemoryCollection:
    def __init__(self, name: str, store: dict[str, list[dict]]) -> None:
        self.name = name
        self._store = store
        if name not in store:
            store[name] = []

    def insert_one(self, doc: dict) -> None:
        self._store[self.name].append(copy.deepcopy(doc))

    def find(self, query: dict) -> InMemoryCursor:
        docs = [d for d in self._store[self.name] if _match(d, query)]
        return InMemoryCursor(docs)

    def find_one(self, query: dict) -> Optional[dict]:
        for d in self._store[self.name]:
            if _match(d, query):
                return d
        return None

    def update_one(self, query: dict, update: dict) -> None:
        for d in self._store[self.name]:
            if _match(d, query):
                if "$set" in update:
                    d.update(update["$set"])
                return
        if "$set" in update and "_id" in query:
            self.insert_one({**query, **update["$set"]})

    def create_index(self, *_args: Any, **_kwargs: Any) -> None:
        pass


class InMemoryDatabase:
    def __init__(self, name: str = "omnimind_v11_fallback") -> None:
        self.name = name
        self._store: dict[str, list[dict]] = {}

    def __getitem__(self, name: str) -> InMemoryCollection:
        return InMemoryCollection(name, self._store)


def _match(doc: dict, query: dict) -> bool:
    for k, v in query.items():
        if doc.get(k) != v:
            return False
    return True


_active = False
_reason: Optional[str] = None
_db = InMemoryDatabase()


def enable(reason: str = "atlas_unavailable") -> InMemoryDatabase:
    global _active, _reason, _db
    _active = True
    _reason = reason
    _db = InMemoryDatabase()
    return _db


def disable() -> None:
    """Allow Atlas reconnect after a transient boot/connecting state."""
    global _active, _reason
    _active = False
    _reason = None


def is_active() -> bool:
    return _active


def reason() -> Optional[str]:
    return _reason


def get_db() -> InMemoryDatabase:
    return _db
