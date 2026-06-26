"""Authentication and authorization tests for OmniCore platform APIs."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


@pytest.mark.auth
class TestPlatformAuthentication:
    def test_protected_route_requires_bearer(self, anon_api: TestClient):
        res = anon_api.get("/api/v1/omnicore/projects")
        assert res.status_code == 401
        assert res.json().get("detail") == "Bearer token required"

    def test_invalid_token_rejected(self, anon_api: TestClient):
        anon_api.headers.update({"Authorization": "Bearer invalid-token"})
        res = anon_api.get("/api/v1/omnicore/projects")
        assert res.status_code == 401
        assert "Invalid" in res.json().get("detail", "")

    def test_operator_token_grants_read(self, api: TestClient):
        res = api.get("/api/v1/omnicore/projects")
        assert res.status_code == 200

    def test_public_probes_no_auth(self, anon_api: TestClient):
        for path in ("/api/v1/platform/health", "/api/v1/platform/live", "/api/v1/platform/ready"):
            res = anon_api.get(path)
            assert res.status_code == 200, path


@pytest.mark.auth
class TestPlatformAuthorization:
    def test_guest_write_denied(self, guest_api: TestClient):
        res = guest_api.put(
            "/api/v1/omnicore/projects",
            json={"projects": []},
        )
        assert res.status_code == 403

    def test_operator_write_allowed(self, api: TestClient):
        res = api.put("/api/v1/omnicore/projects", json={"projects": []})
        assert res.status_code == 200

    def test_guest_read_allowed(self, guest_api: TestClient):
        res = guest_api.get("/api/v1/omnicore/projects")
        assert res.status_code == 200
