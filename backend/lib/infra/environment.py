"""Environment resolution for OmniMind deployment tiers."""

from __future__ import annotations

from enum import Enum

from config import get_settings


class DeployEnvironment(str, Enum):
    DEVELOPMENT = "development"
    TESTING = "testing"
    QA = "qa"
    STAGING = "staging"
    PRODUCTION = "production"
    PREVIEW = "preview"


def current_environment() -> DeployEnvironment:
    raw = (get_settings().omnimind_env or "development").strip().lower()
    aliases = {
        "dev": DeployEnvironment.DEVELOPMENT,
        "test": DeployEnvironment.TESTING,
        "prod": DeployEnvironment.PRODUCTION,
        "local": DeployEnvironment.DEVELOPMENT,
    }
    if raw in aliases:
        return aliases[raw]
    try:
        return DeployEnvironment(raw)
    except ValueError:
        return DeployEnvironment.DEVELOPMENT


def is_production() -> bool:
    return current_environment() == DeployEnvironment.PRODUCTION


def deployment_snapshot() -> dict:
    env = current_environment()
    settings = get_settings()
    return {
        "environment": env.value,
        "isProduction": env == DeployEnvironment.PRODUCTION,
        "redisEnabled": settings.redis_enabled,
        "otelConfigured": bool(settings.otel_exporter_endpoint),
        "cdnConfigured": bool(settings.cdn_base_url),
        "objectStorageConfigured": bool(settings.s3_bucket),
    }
