"""Enterprise QA fixtures — auth tokens, clients, and test environment."""

from __future__ import annotations

import os

# Must run before test modules import `main`.
os.environ.setdefault("REDIS_ENABLED", "false")
os.environ.setdefault("JWT_SECRET_KEY", "enterprise-qa-test-secret-32chars-minimum")
os.environ.setdefault("OMNIMIND_ENV", "testing")

import pytest
from fastapi.testclient import TestClient

from auth.security import create_access_token
from main import app


@pytest.fixture(scope="session")
def operator_token() -> str:
    return create_access_token("qa-operator", extra={"role": "operator"})


@pytest.fixture(scope="session")
def guest_token() -> str:
    return create_access_token("qa-guest", extra={"role": "guest"})


@pytest.fixture
def operator_headers(operator_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {operator_token}"}


@pytest.fixture
def guest_headers(guest_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {guest_token}"}


@pytest.fixture
def api(operator_headers: dict[str, str]) -> TestClient:
    client = TestClient(app)
    client.headers.update(operator_headers)
    return client


@pytest.fixture
def guest_api(guest_headers: dict[str, str]) -> TestClient:
    client = TestClient(app)
    client.headers.update(guest_headers)
    return client


@pytest.fixture
def anon_api() -> TestClient:
    return TestClient(app)
