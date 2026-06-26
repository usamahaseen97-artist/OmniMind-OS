"""OmniMind Automation SDK — Python client for Universal Automation Engine V2.0."""

from __future__ import annotations

from typing import Any

import httpx

DEFAULT_BASE = "http://127.0.0.1:8000/api/v1/omnicore/automation"


class OmniAutomationClient:
    def __init__(self, base_url: str = DEFAULT_BASE, *, timeout: float = 60.0) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def list_workflows(self) -> list[dict[str, Any]]:
        with httpx.Client(timeout=self.timeout) as client:
            res = client.get(f"{self.base_url}/workflows")
            res.raise_for_status()
            return res.json().get("workflows", [])

    def save_workflow(self, workflow: dict[str, Any]) -> dict[str, Any]:
        wf_id = workflow["id"]
        with httpx.Client(timeout=self.timeout) as client:
            res = client.put(f"{self.base_url}/workflows/{wf_id}", json=workflow)
            res.raise_for_status()
            return res.json()["workflow"]

    def run(self, workflow_id: str, *, background: bool = False, priority: int = 5) -> dict[str, Any]:
        with httpx.Client(timeout=self.timeout) as client:
            res = client.post(
                f"{self.base_url}/workflows/{workflow_id}/run",
                json={"background": background, "priority": priority},
            )
            res.raise_for_status()
            return res.json()["execution"]

    def generate(self, prompt: str) -> dict[str, Any]:
        with httpx.Client(timeout=self.timeout) as client:
            res = client.post(f"{self.base_url}/generate", json={"prompt": prompt})
            res.raise_for_status()
            return res.json()["workflow"]

    def metrics(self) -> dict[str, Any]:
        with httpx.Client(timeout=self.timeout) as client:
            res = client.get(f"{self.base_url}/metrics")
            res.raise_for_status()
            return res.json()["metrics"]
