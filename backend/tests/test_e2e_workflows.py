"""End-to-end workflow tests across OmniCore platform modules."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


@pytest.mark.e2e
class TestProjectWorkflow:
    def test_create_list_update_project(self, api: TestClient):
        project = {
            "id": "e2e-proj-001",
            "name": "E2E Project",
            "kind": "tool-scoped",
            "toolSlugs": ["omnimind"],
            "pinned": True,
            "favorite": False,
            "metadata": {"source": "e2e"},
            "version": 1,
            "modifiedAt": "2026-06-17T12:00:00Z",
            "createdAt": "2026-06-17T12:00:00Z",
        }
        put = api.put("/api/v1/omnicore/projects", json={"projects": [project]})
        assert put.status_code == 200

        listed = api.get("/api/v1/omnicore/projects").json()["projects"]
        match = next(p for p in listed if p["id"] == "e2e-proj-001")
        assert match["pinned"] is True

        status = api.get("/api/v1/omnicore/platform/status")
        assert status.status_code == 200
        assert status.json().get("ok") is True


@pytest.mark.e2e
class TestAutomationWorkflow:
    def test_template_to_execution(self, api: TestClient, monkeypatch: pytest.MonkeyPatch):
        async def fake_action(action_id, config, context):
            return "e2e-ok"

        async def fake_complete(**_kwargs):
            return "e2e-ai"

        monkeypatch.setattr("lib.automation.executor._run_action", fake_action)
        monkeypatch.setattr("lib.automation.executor.superapp_ai.complete_text", fake_complete)

        templates = api.get("/api/v1/omnicore/automation/templates").json()["templates"]
        assert len(templates) >= 1

        wf_id = "e2e-wf-001"
        wf = {
            "id": wf_id,
            "name": "E2E Flow",
            "description": "e2e",
            "version": 1,
            "nodes": [
                {
                    "id": "t1",
                    "kind": "trigger",
                    "triggerId": "manual",
                    "label": "Start",
                    "config": {},
                    "position": {"x": 0, "y": 0},
                }
            ],
            "templateId": templates[0].get("id"),
            "nestedWorkflowIds": [],
            "schedule": None,
            "enabled": True,
            "tags": ["e2e"],
        }
        api.put(f"/api/v1/omnicore/automation/workflows/{wf_id}", json=wf)
        run = api.post(f"/api/v1/omnicore/automation/workflows/{wf_id}/run", json={})
        assert run.status_code == 200
        assert run.json()["execution"]["status"] == "completed"

        metrics = api.get("/api/v1/omnicore/automation/metrics")
        assert metrics.status_code == 200


@pytest.mark.e2e
class TestOmniCloudWorkflow:
    def test_device_sync_snapshot(self, api: TestClient):
        api.post(
            "/api/v1/omnicore/omnicloud/devices",
            json={"name": "E2E Device", "kind": "desktop", "trusted": True, "fingerprint": "e2e-fp"},
        )
        sync = api.post("/api/v1/omnicore/omnicloud/sync", json={"domains": ["projects"]})
        assert sync.status_code == 200

        snap = api.post(
            "/api/v1/omnicore/omnicloud/projects/e2e-proj/snapshots",
            json={"label": "e2e-snapshot"},
        )
        assert snap.status_code == 200

        admin = api.get("/api/v1/omnicore/omnicloud/admin/dashboard")
        assert admin.status_code == 200
