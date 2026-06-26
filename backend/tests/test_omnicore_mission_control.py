"""Mission Control API tests."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
class TestMissionControlAPI:
    def test_dashboard(self, api: TestClient):
        res = api.get("/api/v1/omnicore/mission-control/dashboard")
        assert res.status_code == 200
        data = res.json()
        assert data["ok"] is True
        assert "health" in data["dashboard"]
        assert "system" in data["dashboard"]

    def test_system(self, api: TestClient):
        res = api.get("/api/v1/omnicore/mission-control/system")
        assert res.status_code == 200
        assert "api" in res.json()["system"]

    def test_append_log(self, api: TestClient):
        res = api.post(
            "/api/v1/omnicore/mission-control/logs",
            json={"source": "backend", "message": "test log", "level": "info"},
        )
        assert res.status_code == 200
        logs = api.get("/api/v1/omnicore/mission-control/logs")
        assert any(l.get("message") == "test log" for l in logs.json()["logs"])

    def test_analytics(self, api: TestClient):
        res = api.get("/api/v1/omnicore/mission-control/analytics")
        assert res.status_code == 200
        assert len(res.json()["series"]) >= 1
