"""API contract tests — response envelope and schema stability."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


PLATFORM_GET_CONTRACTS = [
    "/api/v1/omnicore/projects",
    "/api/v1/omnicore/security/dashboard",
    "/api/v1/omnicore/quality/health",
    "/api/v1/omnicore/infra/health",
    "/api/v1/omnicore/automation/workflows",
    "/api/v1/omnicore/ecosystem/dashboard",
    "/api/v1/omnicore/mission-control/dashboard",
    "/api/v1/omnicore/omnicloud/account",
]


@pytest.mark.contract
class TestPlatformResponseContract:
    @pytest.mark.parametrize("path", PLATFORM_GET_CONTRACTS)
    def test_ok_envelope(self, api: TestClient, path: str):
        res = api.get(path)
        assert res.status_code == 200
        data = res.json()
        assert data.get("ok") is True
        assert isinstance(data, dict)

    def test_error_envelope_shape(self, anon_api: TestClient):
        res = anon_api.get("/api/v1/omnicore/projects")
        assert res.status_code == 401
        assert "detail" in res.json()

    def test_ai_complete_contract(self, api: TestClient, monkeypatch: pytest.MonkeyPatch):
        async def fake_complete(**_kwargs):
            return "contract test"

        monkeypatch.setattr("routers.omnicore_ai.superapp_ai.complete_text", fake_complete)
        res = api.post(
            "/api/v1/omnicore/ai/complete",
            json={"prompt": "contract", "options": {}},
        )
        assert res.status_code == 200
        body = res.json()
        assert body["ok"] is True
        assert "result" in body
        assert "text" in body["result"]
        assert "jobId" in body["result"]
