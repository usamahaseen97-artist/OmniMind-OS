"""Ecosystem OS API tests."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
class TestEcosystemAPI:
    def test_dashboard(self, api: TestClient):
        res = api.get("/api/v1/omnicore/ecosystem/dashboard")
        assert res.status_code == 200
        assert res.json().get("ok") is True

    def test_system_metrics(self, api: TestClient):
        res = api.get("/api/v1/omnicore/ecosystem/system")
        assert res.status_code == 200
        data = res.json()
        assert "storageUsedGb" in data["system"]

    def test_activity_push(self, api: TestClient):
        res = api.post(
            "/api/v1/omnicore/ecosystem/activity",
            json={"kind": "ai-task", "title": "Test task", "status": "running"},
        )
        assert res.status_code == 200
        assert res.json()["item"]["title"] == "Test task"

    def test_background_agent(self, api: TestClient):
        res = api.post(
            "/api/v1/omnicore/ecosystem/background-agents",
            json={"kind": "code", "label": "Generate module", "toolSlug": "omniforge-engine"},
        )
        assert res.status_code == 200
        assert res.json()["job"]["detached"] is True
