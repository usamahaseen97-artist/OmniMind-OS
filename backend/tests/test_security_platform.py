"""Security tests — zero-trust, audit events, and rate limiting."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from limits import parse

from lib.enterprise.dependencies import is_public_platform_path
from lib.security.zero_trust import authorize_request


@pytest.mark.security
class TestZeroTrust:
    def test_guest_cannot_write_platform(self):
        decision = authorize_request("guest-1", "platform:write", role="guest")
        assert decision.get("allowed") is False

    def test_operator_has_execute_permission(self):
        decision = authorize_request("op-1", "tool:execute", role="operator")
        assert decision.get("allowed") is True

    def test_public_paths_exempt(self):
        assert is_public_platform_path("/api/v1/platform/health") is True
        assert is_public_platform_path("/api/v1/omnicore/projects") is False


@pytest.mark.security
class TestSecurityAPI:
    def test_security_events_endpoint(self, api: TestClient):
        res = api.get("/api/v1/omnicore/security/events")
        assert res.status_code == 200
        assert "events" in res.json()

    def test_security_compliance(self, api: TestClient):
        res = api.get("/api/v1/omnicore/security/compliance")
        assert res.status_code == 200
        assert res.json().get("ok") is True


@pytest.mark.security
class TestRateLimiting:
    def test_limiter_hit_and_exhaust(self):
        from limits import parse

        from main import app

        limiter = app.state.limiter
        limit_item = parse("3/minute")
        args = ["platform:qa-test-ip", "platform-writes-qa"]
        limiter.limiter.clear(limit_item, *args)
        for _ in range(3):
            assert limiter.limiter.hit(limit_item, *args)
        assert not limiter.limiter.hit(limit_item, *args)

    def test_enforce_raises_when_exhausted(self, monkeypatch: pytest.MonkeyPatch):
        import asyncio

        from slowapi.errors import RateLimitExceeded
        from starlette.requests import Request

        from lib.enterprise import dependencies as deps
        from main import app

        class FakeSettings:
            platform_write_rate_limit = "1/minute"

        monkeypatch.setattr(deps, "get_settings", lambda: FakeSettings())

        limiter = app.state.limiter
        limit_item = parse("1/minute")
        limit_key = "platform:127.0.0.1"
        args = [limit_key, deps._PLATFORM_WRITE_SCOPE]
        if limiter._key_prefix:
            args = [limiter._key_prefix, *args]
        limiter.limiter.clear(limit_item, *args)
        limiter.limiter.hit(limit_item, *args)

        scope = {
            "type": "http",
            "method": "POST",
            "path": "/api/v1/omnicore/ecosystem/activity",
            "headers": [],
            "query_string": b"",
            "client": ("127.0.0.1", 12345),
            "app": app,
        }
        request = Request(scope)
        with pytest.raises(RateLimitExceeded):
            asyncio.run(deps.enforce_platform_rate_limit(request))
