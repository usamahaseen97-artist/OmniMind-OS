"""Tool 4 — Business Application Engine suite generator."""

from __future__ import annotations

import logging
from typing import Any, Optional
from uuid import uuid4

from services.mongo_pools import save_module_record

logger = logging.getLogger(__name__)

_SUITE_TEMPLATES: dict[str, dict[str, Any]] = {
    "accounting": {
        "modules": ["general_ledger", "accounts_payable", "accounts_receivable", "tax_reports"],
        "collections": ["transactions", "invoices", "vendors", "fiscal_periods"],
    },
    "hrm": {
        "modules": ["employees", "payroll", "leave", "performance"],
        "collections": ["staff", "departments", "attendance", "benefits"],
    },
    "crm": {
        "modules": ["leads", "pipeline", "contacts", "campaigns"],
        "collections": ["accounts", "opportunities", "activities", "segments"],
    },
    "erp": {
        "modules": ["finance", "inventory", "hr", "operations", "bi"],
        "collections": ["orders", "skus", "warehouses", "cost_centers", "dashboards"],
    },
}


async def generate_business_suite(
    *,
    prompt: str,
    suite_type: str = "erp",
    business_name: str = "OmniMind Corp",
    user_id: str = "anonymous",
    team_size: Optional[str] = None,
) -> dict[str, Any]:
    job_id = str(uuid4())
    key = suite_type.lower().strip()
    template = _SUITE_TEMPLATES.get(key, _SUITE_TEMPLATES["erp"])

    db_tree = {
        "root": f"biz_{business_name.lower().replace(' ', '_')[:32]}",
        "collections": template["collections"],
        "indexes": [{"collection": c, "fields": ["created_at", "status"]} for c in template["collections"]],
    }

    record = {
        "id": job_id,
        "user_id": user_id,
        "business_name": business_name,
        "suite_type": key,
        "team_size": team_size or "1-10",
        "prompt": prompt[:4000],
        "db_tree": db_tree,
        "modules": template["modules"],
    }
    await save_module_record("business", record)
    logger.info("Business suite job=%s type=%s", job_id, key)

    return {
        "ok": True,
        "job_id": job_id,
        "business_name": business_name,
        "suite_type": key,
        "modules": template["modules"],
        "database_tree": db_tree,
        "dashboard_layout": {
            "sidebar": template["modules"],
            "widgets": ["kpi_cards", "activity_feed", "approval_queue"],
        },
        "message": f"Generated {key.upper()} suite structure from prompt directives",
    }
