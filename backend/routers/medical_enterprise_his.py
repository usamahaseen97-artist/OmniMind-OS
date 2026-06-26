"""
Medical Enterprise HIS API — Phase 6 (architecture stubs)."""



from __future__ import annotations

import logging

from datetime import datetime, timezone
from typing import Any, Optional
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import Field

from lib.enterprise.dependencies import platform_router_dependencies
from schemas.strict import StrictModel

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/medical-enterprise/his",
    tags=["medical-enterprise-his"],
    dependencies=platform_router_dependencies(),
)

_patients: dict[str, dict[str, Any]] = {}
_appointments: dict[str, dict[str, Any]] = {}
_invoices: dict[str, dict[str, Any]] = {}


@router.get("/dashboard/{hospital_id}")
async def get_dashboard(hospital_id: str) -> dict[str, Any]:
    return {
        "ok": True,
        "data": {
            "hospitalId": hospital_id,
            "activePatients": 42,
            "admissionsToday": 8,
            "dischargesToday": 5,
            "emergencyCases": 3,
            "icuOccupancy": {"occupied": 12, "total": 16, "percent": 75},
            "operationTheaters": {"active": 2, "total": 4},
            "appointmentsToday": 34,
            "staffOnDuty": 28,
            "beds": {"available": 18, "occupied": 82, "total": 100},
            "aiAlerts": 0,
            "systemHealth": "healthy",
            "lastUpdated": datetime.now(timezone.utc).isoformat(),
        },
    }


@router.get("/emr/{patient_id}")
async def get_emr(patient_id: str) -> dict[str, Any]:
    record = _patients.get(patient_id) or {
        "demographics": {
            "patientId": patient_id,
            "mrn": f"MRN-{patient_id[-6:]}",
            "firstName": "Patient",
            "lastName": "Demo",
            "dateOfBirth": "1980-01-01",
            "sex": "unknown",
        },
        "encounters": [],
        "diagnoses": [],
        "procedures": [],
        "allergies": [],
        "vaccinations": [],
        "timeline": [],
        "version": 1,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }
    return {"ok": True, "data": record}


@router.get("/appointments")
async def list_appointments(patient_id: Optional[str] = None) -> dict[str, Any]:
    items = list(_appointments.values())
    if patient_id:
        items = [a for a in items if a.get("patientId") == patient_id]
    return {"ok": True, "data": items}


class AppointmentBody(StrictModel):
    patient_id: str
    provider_id: str
    department_id: str
    scheduled_at: str
    duration_minutes: int = 30
    type: str = "online"


@router.post("/appointments")
async def create_appointment(body: AppointmentBody) -> dict[str, Any]:
    appt_id = str(uuid4())
    appt = {
        "id": appt_id,
        "patientId": body.patient_id,
        "providerId": body.provider_id,
        "departmentId": body.department_id,
        "scheduledAt": body.scheduled_at,
        "durationMinutes": body.duration_minutes,
        "type": body.type,
        "status": "scheduled",
    }
    _appointments[appt_id] = appt
    return {"ok": True, "data": appt}


@router.get("/beds")
async def list_beds() -> dict[str, Any]:
    return {"ok": True, "data": [{"id": "bed-1", "label": "101A", "status": "available"}]}


@router.get("/staff")
async def list_staff() -> dict[str, Any]:
    return {"ok": True, "data": []}


@router.get("/pharmacy")
async def pharmacy_stock() -> dict[str, Any]:
    return {"ok": True, "data": [{"id": "med-1", "name": "Amoxicillin 500mg", "quantity": 500}]}


@router.get("/inventory")
async def list_inventory() -> dict[str, Any]:
    return {"ok": True, "data": []}


@router.get("/billing/invoices/{invoice_id}")
async def get_invoice(invoice_id: str) -> dict[str, Any]:
    inv = _invoices.get(invoice_id)
    if not inv:
        raise HTTPException(404, "Invoice not found")
    return {"ok": True, "data": inv}


@router.get("/analytics/{hospital_id}")
async def get_analytics(hospital_id: str) -> dict[str, Any]:
    return {
        "ok": True,
        "data": [
            {"id": "kpi-beds", "label": "Bed Occupancy", "value": 82, "unit": "%", "category": "operational"},
            {"id": "kpi-revenue", "label": "Revenue", "value": 0, "unit": "USD", "category": "financial"},
        ],
    }


@router.get("/interop/connectors")
async def list_connectors() -> dict[str, Any]:
    return {
        "ok": True,
        "data": [
            {"id": "interop-fhir", "system": "fhir", "name": "FHIR R4", "enabled": True},
            {"id": "interop-hl7", "system": "hl7", "name": "HL7 v2.x", "enabled": True},
        ],
    }


@router.post("/admissions")
async def create_admission(patient_id: str, department_id: str) -> dict[str, Any]:
    return {
        "ok": True,
        "data": {
            "id": str(uuid4()),
            "patientId": patient_id,
            "departmentId": department_id,
            "admittedAt": datetime.now(timezone.utc).isoformat(),
        },
    }
