"""OmniCloud API tests."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
class TestOmniCloudAPI:
    def test_account(self, api: TestClient):
        res = api.get("/api/v1/omnicore/omnicloud/account")
        assert res.status_code == 200
        data = res.json()
        assert data["ok"] is True
        assert "email" in data["account"]

    def test_register_device(self, api: TestClient):
        res = api.post(
            "/api/v1/omnicore/omnicloud/devices",
            json={"name": "Test Device", "kind": "web", "trusted": True, "fingerprint": "fp-test"},
        )
        assert res.status_code == 200
        assert res.json()["device"]["name"] == "Test Device"

    def test_sync_all(self, api: TestClient):
        res = api.post("/api/v1/omnicore/omnicloud/sync", json={"domains": ["projects", "settings"]})
        assert res.status_code == 200
        assert len(res.json()["results"]) == 2

    def test_project_snapshot(self, api: TestClient):
        res = api.post("/api/v1/omnicore/omnicloud/projects/proj-1/snapshots", json={"label": "Test snap"})
        assert res.status_code == 200
        snaps = api.get("/api/v1/omnicore/omnicloud/projects/proj-1/snapshots")
        assert any(s.get("label") == "Test snap" for s in snaps.json()["snapshots"])

    def test_remote_job(self, api: TestClient):
        res = api.post(
            "/api/v1/omnicore/omnicloud/remote/jobs",
            json={"kind": "generate-code", "label": "Test job"},
        )
        assert res.status_code == 200
        assert res.json()["job"]["status"] == "queued"

    def test_storage(self, api: TestClient):
        res = api.get("/api/v1/omnicore/omnicloud/storage")
        assert res.status_code == 200
        assert len(res.json()["buckets"]) >= 5

    def test_admin_dashboard(self, api: TestClient):
        res = api.get("/api/v1/omnicore/omnicloud/admin/dashboard")
        assert res.status_code == 200
        assert "usage" in res.json()["dashboard"]
