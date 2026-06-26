"""OmniCore store and AI gateway production tests."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from lib import omnicore_store


@pytest.mark.unit
class TestOmniCoreStore:
    def test_save_and_load_roundtrip(self):
        omnicore_store.save("test_key", {"value": 42})
        assert omnicore_store.load("test_key", {}) == {"value": 42}

    def test_append_list_item(self):
        omnicore_store.save("test_list", [])
        items = omnicore_store.append_list_item("test_list", {"id": "a"})
        assert items[0]["id"] == "a"

    def test_status_shape(self):
        status = omnicore_store.status()
        assert "collection" in status
        assert "mongo" in status


@pytest.mark.integration
class TestOmniCoreAIComplete:
    def test_complete_requires_prompt(self, api: TestClient):
        res = api.post("/api/v1/omnicore/ai/complete", json={"prompt": ""})
        assert res.status_code == 400

    def test_complete_returns_real_gateway_shape(self, api: TestClient, monkeypatch: pytest.MonkeyPatch):
        async def fake_complete(**_kwargs):
            return "Production AI response"

        monkeypatch.setattr(
            "routers.omnicore_ai.superapp_ai.complete_text",
            fake_complete,
        )
        res = api.post(
            "/api/v1/omnicore/ai/complete",
            json={"prompt": "Hello OmniMind", "options": {"toolSlug": "omnimind"}},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["ok"] is True
        assert data["result"]["text"] == "Production AI response"
        assert "jobId" in data["result"]
        assert "[stub]" not in data["result"]["text"].lower()


@pytest.mark.integration
class TestOmniCorePersistence:
    def test_projects_persist_via_api(self, api: TestClient):
        projects = [
            {
                "id": "proj-test-001",
                "name": "Test Project",
                "kind": "tool-scoped",
                "toolSlugs": ["omnimind"],
                "pinned": False,
                "favorite": False,
                "metadata": {},
                "version": 1,
                "modifiedAt": "2026-06-17T00:00:00Z",
                "createdAt": "2026-06-17T00:00:00Z",
            }
        ]
        put = api.put("/api/v1/omnicore/projects", json={"projects": projects})
        assert put.status_code == 200
        get = api.get("/api/v1/omnicore/projects")
        assert get.status_code == 200
        listed = get.json()["projects"]
        assert any(p["id"] == "proj-test-001" for p in listed)

    def test_platform_status(self, api: TestClient):
        res = api.get("/api/v1/omnicore/platform/status")
        assert res.status_code == 200
        assert res.json().get("ok") is True
