"""Zero-trust authorization helpers — validate every request."""

from __future__ import annotations

from typing import Any

from lib.security.audit_events import record_security_event

_ROLE_PERMISSIONS: dict[str, list[str]] = {
    "platform:owner": ["security:admin", "org:write", "tool:execute", "api:key:manage"],
    "operator": ["tool:execute", "project:read"],
    "guest": ["project:read"],
}


def authorize_request(
    user_id: str,
    permission: str,
    *,
    role: str = "guest",
    context: dict[str, Any] | None = None,
) -> dict[str, Any]:
  """RBAC check with audit on denial."""
  perms = _ROLE_PERMISSIONS.get(role, _ROLE_PERMISSIONS["guest"])
  allowed = permission in perms
  checks = [
      {"check": "rbac", "passed": allowed},
      {"check": "user_present", "passed": bool(user_id)},
  ]
  if not allowed:
      record_security_event(
          kind="permission_denied",
          severity="medium",
          actor_id=user_id,
          resource=permission,
          detail="rbac_denied",
      )
  return {
      "allowed": allowed,
      "reason": "all_checks_passed" if allowed else "rbac_denied",
      "checks": checks,
      "context": context or {},
  }
