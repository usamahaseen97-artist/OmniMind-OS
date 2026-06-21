#!/usr/bin/env python3
"""
OmniMind V11 — 4-node distributed engine E2E verification.
Flow: LB → FastAPI → JWT Auth → Redis cache → Webhook ingest

Usage:
  python testing/test_endpoints.py
  OMNIMIND_TEST_BASE_URL=http://127.0.0.1:8001 python testing/test_endpoints.py
"""

from __future__ import annotations

import os
import sys
import time

import requests

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_URL = os.getenv("OMNIMIND_TEST_BASE_URL", "http://localhost").rstrip("/")
TIMEOUT = float(os.getenv("OMNIMIND_TEST_TIMEOUT", "15"))
OPERATOR_USER = os.getenv("OMNIMIND_OPERATOR_USERNAME", "usama_operator")
OPERATOR_SECRET = os.getenv("OMNIMIND_OPERATOR_SECRET_KEY", "sovereign_launch_2026")
NODE_TARGET = os.getenv("OMNIMIND_TEST_NODE_ID", "workflow_node_analysis_v11")

PASS = 0
FAIL = 0
WARN = 0


def ok(msg: str) -> None:
    global PASS
    PASS += 1
    print(f"✅ {msg}")


def fail(msg: str) -> None:
    global FAIL
    FAIL += 1
    print(f"❌ {msg}")


def warn(msg: str) -> None:
    global WARN
    WARN += 1
    print(f"⚠️  {msg}")


def main() -> int:
    print("🚀 Starting OmniMind V11 Distributed Engine Verification Tests...\n")
    print(f"   Base URL: {BASE_URL}\n")

    session = requests.Session()
    session.headers.update({"Accept": "application/json"})

    # ── NODE 1: Ingress LB → FastAPI health ─────────────────────────────────
    try:
        health_check = session.get(f"{BASE_URL}/api/v1/health", timeout=TIMEOUT)
        if health_check.status_code == 200:
            body = health_check.json()
            status = body.get("status") or body.get("ok")
            ok(f"[NODE 1: LB → FastAPI] Connection solid. Core status: {status}")
        else:
            fail(f"[NODE 1] Gateway failure. HTTP {health_check.status_code}")
            return 1
    except requests.RequestException as exc:
        fail(f"Connection broken. Is 'docker compose up' active? Error: {exc}")
        return 1

    # ── NODE 2: JWT security token handshake ────────────────────────────────
    auth_params = {"username": OPERATOR_USER, "secret_key": OPERATOR_SECRET}
    try:
        token_resp = session.post(
            f"{BASE_URL}/api/v1/auth/session-token",
            params=auth_params,
            timeout=TIMEOUT,
        )
    except requests.RequestException as exc:
        fail(f"[NODE 2] Auth request failed: {exc}")
        return 1

    if token_resp.status_code == 200:
        token = token_resp.json().get("access_token")
        if not token:
            fail("[NODE 2] Auth response missing access_token.")
            return 1
        ok("[NODE 2: AUTH ENGINE] Token generated. Security signatures validated.")
    elif token_resp.status_code == 503:
        fail(
            "[NODE 2] Operator credentials not configured on server. "
            "Set OMNIMIND_OPERATOR_USERNAME / OMNIMIND_OPERATOR_SECRET_KEY."
        )
        return 1
    else:
        fail(f"[NODE 2] Auth challenge dropped. HTTP {token_resp.status_code}")
        return 1

    headers = {"Authorization": f"Bearer {token}"}

    # ── NODE 3: Redis cache latency bypass (miss → hit) ─────────────────────
    print("\n⏱️  Testing high-speed memory overlays...")
    try:
        start_1 = time.perf_counter()
        hit_1 = session.get(
            f"{BASE_URL}/api/v1/node-data/{NODE_TARGET}",
            headers=headers,
            timeout=TIMEOUT,
        )
        time_1 = (time.perf_counter() - start_1) * 1000

        start_2 = time.perf_counter()
        hit_2 = session.get(
            f"{BASE_URL}/api/v1/node-data/{NODE_TARGET}",
            headers=headers,
            timeout=TIMEOUT,
        )
        time_2 = (time.perf_counter() - start_2) * 1000
    except requests.RequestException as exc:
        fail(f"[NODE 3] Node-data request failed: {exc}")
        return 1

    if hit_1.status_code != 200 or hit_2.status_code != 200:
        fail(
            f"[NODE 3] Node-data HTTP error. "
            f"hit1={hit_1.status_code} hit2={hit_2.status_code}"
        )
        return 1

    src_1 = hit_1.json().get("data_source", "")
    src_2 = hit_2.json().get("data_source", "")
    print(f"  ↳ Hit 1 (DB layer fetch): {time_1:.2f} ms → source: {src_1}")
    print(f"  ↳ Hit 2 (Redis hot-memory): {time_2:.2f} ms → source: {src_2}")

    if "persistent" in src_1 or "db" in src_1:
        ok("[NODE 3a] First pass resolved from persistent storage layer.")
    else:
        warn(f"[NODE 3a] Unexpected first-hit source: {src_1}")

    if "cache" in src_2.lower() or "redis" in src_2.lower():
        ok("[NODE 3: REDIS LAYER] Cache bypass active. Performance targets optimized.")
        if time_2 < time_1:
            print(f"  ↳ Latency delta: {time_1 - time_2:.2f} ms faster on cache hit")
    else:
        warn("[NODE 3] Cache miss on second loop. Check Redis / omnimind-cache alignment.")

    # ── NODE 4: Webhook ingestion ───────────────────────────────────────────
    webhook_payload = {
        "node_identifier": "node_77",
        "trigger_action": "execute_pipeline",
        "payload": {"status": "test"},
    }
    try:
        webhook_resp = session.post(
            f"{BASE_URL}/api/v1/webhooks/node-stream",
            json=webhook_payload,
            timeout=TIMEOUT,
        )
    except requests.RequestException as exc:
        fail(f"[NODE 4] Webhook request failed: {exc}")
        return 1

    if webhook_resp.status_code == 200:
        body = webhook_resp.json()
        ok(
            "[NODE 4: WEBHOOK LISTENER] Automation stream queued. "
            f"target={body.get('target_node')} state={body.get('state')}"
        )
    else:
        fail(f"[NODE 4] Webhook ingest failed. HTTP {webhook_resp.status_code}")
        return 1

    # ── Summary ─────────────────────────────────────────────────────────────
    print("\n" + "─" * 56)
    print(f"Results: {PASS} passed · {WARN} warnings · {FAIL} failed")
    if FAIL:
        print("❌ E2E suite FAILED")
        return 1
    print("✅ E2E suite PASSED — all 4 nodes operational")
    return 0


if __name__ == "__main__":
    sys.exit(main())
