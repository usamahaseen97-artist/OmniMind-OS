"""Backend smoke tests for OmniMind platform APIs."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


@pytest.mark.smoke
class TestAuthSmoke:
    def test_auth_health(self, api: TestClient):
        res = api.get("/api/v1/auth/health")
        assert res.status_code == 200
        data = res.json()
        assert data.get("ok") is True
        assert data.get("service") == "jwt"

    def test_login_invalid_credentials(self, anon_api: TestClient):
        res = anon_api.post("/api/v1/auth/login", json={"email": "bad@test.com", "password": "wrong"})
        assert res.status_code == 401


@pytest.mark.smoke
class TestSecurityAPI:
    def test_security_dashboard(self, api: TestClient):
        res = api.get("/api/v1/omnicore/security/dashboard")
        assert res.status_code == 200
        assert res.json().get("ok") is True

    def test_authorize_guest_denied(self, api: TestClient):
        res = api.post(
            "/api/v1/omnicore/security/authorize",
            json={"userId": "guest-1", "permission": "tool:execute", "role": "guest"},
        )
        data = res.json()
        assert data.get("ok") is True
        assert data.get("decision", {}).get("allowed") is False


@pytest.mark.smoke
class TestQualityAPI:
    def test_quality_health(self, api: TestClient):
        res = api.get("/api/v1/omnicore/quality/health")
        assert res.status_code == 200

    def test_quality_dashboard(self, api: TestClient):
        res = api.get("/api/v1/omnicore/quality/dashboard")
        assert res.status_code == 200
        assert "dashboard" in res.json()


@pytest.mark.smoke
class TestInfraAPI:
    def test_infra_health(self, api: TestClient):
        res = api.get("/api/v1/omnicore/infra/health")
        assert res.status_code == 200
        assert res.json().get("ok") is True

    def test_deployment_info(self, api: TestClient):
        res = api.get("/api/v1/omnicore/infra/deployment")
        assert res.status_code == 200
        assert "deployment" in res.json()

    def test_prometheus_metrics(self, api: TestClient):
        res = api.get("/api/v1/omnicore/infra/metrics/prometheus")
        assert res.status_code == 200
        assert "omnimind_up" in res.text


@pytest.mark.smoke
class TestOmniCoreAPI:
    def test_list_projects(self, api: TestClient):
        res = api.get("/api/v1/omnicore/projects")
        assert res.status_code == 200
        data = res.json()
        assert data.get("ok") is True
        assert "projects" in data


@pytest.mark.smoke
class TestPlatformOps:
    def test_platform_health_public(self, anon_api: TestClient):
        res = anon_api.get("/api/v1/platform/health")
        assert res.status_code == 200
        assert res.json().get("ok") is True

    def test_platform_live_public(self, anon_api: TestClient):
        res = anon_api.get("/api/v1/platform/live")
        assert res.status_code == 200

    def test_platform_ready_public(self, anon_api: TestClient):
        res = anon_api.get("/api/v1/platform/ready")
        assert res.status_code == 200
