"""Performance benchmark tests for critical platform endpoints."""

from __future__ import annotations

import time

import pytest
from fastapi.testclient import TestClient

# Enterprise SLA thresholds (milliseconds) — relaxed for CI/local cold-start
_READ_P95_MS = 3500
_WRITE_P95_MS = 3500


def _p95(samples: list[float]) -> float:
    ordered = sorted(samples)
    idx = max(0, int(len(ordered) * 0.95) - 1)
    return ordered[idx]


@pytest.mark.performance
class TestPlatformPerformance:
    def test_health_probe_latency(self, anon_api: TestClient):
        samples = []
        for _ in range(10):
            start = time.perf_counter()
            res = anon_api.get("/api/v1/platform/health")
            elapsed_ms = (time.perf_counter() - start) * 1000
            samples.append(elapsed_ms)
            assert res.status_code == 200
        assert _p95(samples) < _READ_P95_MS

    def test_projects_read_latency(self, api: TestClient):
        samples = []
        for _ in range(10):
            start = time.perf_counter()
            res = api.get("/api/v1/omnicore/projects")
            elapsed_ms = (time.perf_counter() - start) * 1000
            samples.append(elapsed_ms)
            assert res.status_code == 200
        assert _p95(samples) < _READ_P95_MS

    def test_project_write_latency(self, api: TestClient):
        samples = []
        for i in range(5):
            start = time.perf_counter()
            res = api.put(
                "/api/v1/omnicore/projects",
                json={"projects": []},
            )
            elapsed_ms = (time.perf_counter() - start) * 1000
            samples.append(elapsed_ms)
            assert res.status_code == 200
        assert _p95(samples) < _WRITE_P95_MS

    def test_mission_control_dashboard_latency(self, api: TestClient):
        samples = []
        for _ in range(5):
            start = time.perf_counter()
            res = api.get("/api/v1/omnicore/mission-control/dashboard")
            elapsed_ms = (time.perf_counter() - start) * 1000
            samples.append(elapsed_ms)
            assert res.status_code == 200
        assert _p95(samples) < _READ_P95_MS
