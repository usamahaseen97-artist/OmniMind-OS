"""OmniCore automation API tests."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
class TestAutomationAPI:
    def test_list_workflows(self, api: TestClient):
        res = api.get("/api/v1/omnicore/automation/workflows")
        assert res.status_code == 200
        assert res.json().get("ok") is True

    def test_templates(self, api: TestClient):
        res = api.get("/api/v1/omnicore/automation/templates")
        assert res.status_code == 200
        assert len(res.json()["templates"]) >= 10

    def test_save_and_run_workflow(self, api: TestClient, monkeypatch: pytest.MonkeyPatch):
        async def fake_action(action_id, config, context):
            return "ok"

        async def fake_complete(**_kwargs):
            return "Step done"

        monkeypatch.setattr("lib.automation.executor._run_action", fake_action)
        monkeypatch.setattr("lib.automation.executor.superapp_ai.complete_text", fake_complete)

        wf = {
            "id": "wf-test-001",
            "name": "Test Flow",
            "description": "test",
            "version": 1,
            "nodes": [
                {
                    "id": "n1",
                    "kind": "trigger",
                    "triggerId": "manual",
                    "label": "Manual",
                    "config": {},
                    "position": {"x": 0, "y": 0},
                },
                {
                    "id": "n2",
                    "kind": "action",
                    "actionId": "execute-sdk",
                    "label": "SDK",
                    "config": {},
                    "position": {"x": 100, "y": 0},
                },
            ],
            "templateId": None,
            "nestedWorkflowIds": [],
            "schedule": None,
            "enabled": True,
            "tags": [],
        }
        put = api.put("/api/v1/omnicore/automation/workflows/wf-test-001", json=wf)
        assert put.status_code == 200
        run = api.post("/api/v1/omnicore/automation/workflows/wf-test-001/run", json={})
        assert run.status_code == 200
        assert run.json()["execution"]["status"] == "completed"

    def test_metrics(self, api: TestClient):
        res = api.get("/api/v1/omnicore/automation/metrics")
        assert res.status_code == 200
        assert "successRate" in res.json()["metrics"]
