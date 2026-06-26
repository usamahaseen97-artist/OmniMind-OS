"""Unit tests for enterprise foundation modules."""

from __future__ import annotations

import pytest

from lib.enterprise.context import get_request_id, set_request_id
from lib.enterprise.responses import api_ok
from lib.security.env_validation import validate_environment


@pytest.mark.unit
class TestEnterpriseResponses:
    def test_api_ok_envelope(self):
        payload = api_ok(service="test", status="healthy")
        assert payload["ok"] is True
        assert payload["service"] == "test"
        assert payload["status"] == "healthy"

    def test_api_ok_preserves_extra_fields(self):
        payload = api_ok(count=3)
        assert payload["ok"] is True
        assert payload["count"] == 3


@pytest.mark.unit
class TestRequestContext:
    def test_request_id_roundtrip(self):
        set_request_id("req-qa-001")
        assert get_request_id() == "req-qa-001"


@pytest.mark.unit
class TestEnvValidation:
    def test_testing_env_valid(self):
        result = validate_environment(production=False)
        assert result.get("ok") is True

    def test_production_requires_secrets(self, monkeypatch: pytest.MonkeyPatch):
        monkeypatch.setenv("JWT_SECRET_KEY", "")
        result = validate_environment(production=True)
        assert result.get("ok") is False
        assert "JWT_SECRET_KEY" in result.get("missingRequired", [])
