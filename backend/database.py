"""
MongoDB Atlas connection and OmniMind V11 collection initialization.
Reads MONGODB_URI (or MONGODB_URL) from environment via config / .env.
"""

from __future__ import annotations

import asyncio
import logging
import threading
from datetime import datetime, timezone
from typing import Any, Optional
from urllib.parse import quote_plus, unquote_plus

from pymongo import ASCENDING, DESCENDING, MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo.errors import ConfigurationError, OperationFailure, PyMongoError, ServerSelectionTimeoutError

from config import get_settings
from services import memory_store

logger = logging.getLogger(__name__)

DEFAULT_DB_NAME = "omnimind"

_client: Optional[MongoClient] = None
_db: Optional[Database] = None
_mongo_bg_started = False
_mongo_bg_lock = threading.Lock()


def sanitize_mongodb_uri(uri: str) -> str:
    """Strip quotes/whitespace from .env values."""
    return uri.strip().strip('"').strip("'")


def _normalize_double_encoding(value: str) -> str:
    """Fix %2540 → %40 style double-encoding from manual .env edits."""
    prev = None
    out = value
    while prev != out:
        prev = out
        out = out.replace("%2540", "%40").replace("%2523", "%23").replace("%2524", "%24")
    return out


def _split_mongodb_authority(rest: str) -> tuple[str, str, str] | None:
    """
    Split authority into (user, password, host_and_path).
    Uses last '@' so passwords may contain '@' when unencoded in .env.
    """
    path_start = len(rest)
    for sep in ("/", "?"):
        i = rest.find(sep)
        if i != -1:
            path_start = min(path_start, i)

    authority = rest[:path_start]
    path_query = rest[path_start:]

    if "@" not in authority:
        return None

    userinfo, host_part = authority.rsplit("@", 1)
    if ":" not in userinfo:
        return None

    user, password = userinfo.split(":", 1)
    return user, password, host_part + path_query


def fix_mongodb_uri(uri: str) -> str:
    """
    Normalize Atlas URI: decode user/password once, then URL-encode safely.
    Prevents double-encoding (%2540) and broken parsing when password contains @ # $ etc.
    """
    uri = _normalize_double_encoding(sanitize_mongodb_uri(uri))
    if not uri or not uri.startswith("mongodb"):
        return uri

    if "://" not in uri:
        return uri

    scheme, rest = uri.split("://", 1)
    parts = _split_mongodb_authority(rest)
    if parts is None:
        return uri

    user, password, host_path = parts
    user = unquote_plus(user)
    password = unquote_plus(password)

    user_enc = quote_plus(user, safe="")
    password_enc = quote_plus(password, safe="")

    return f"{scheme}://{user_enc}:{password_enc}@{host_path}"


def normalize_mongodb_host(host: str) -> str:
    """
    Strip scheme/credentials from MONGODB_HOST — keep hostname + path + single query string.
    Accepts: omnimind.xxx.mongodb.net  OR  mongodb+srv://user:pass@host/?appName=...
    """
    host = sanitize_mongodb_uri(host)
    for prefix in ("mongodb+srv://", "mongodb://"):
        if host.lower().startswith(prefix):
            host = host[len(prefix) :]
    if "@" in host:
        host = host.rsplit("@", 1)[-1]
    return host.lstrip("/")


def merge_mongodb_query(
    host_tail: str,
    *,
    defaults: str = "retryWrites=true&w=majority",
) -> str:
    """Merge default Atlas options without producing invalid double-? URIs."""
    if "?" not in host_tail:
        return f"{host_tail}?{defaults}"

    base, qs = host_tail.split("?", 1)
    params = [p for p in qs.split("&") if p]
    for part in defaults.split("&"):
        key = part.split("=")[0]
        if not any(existing.startswith(f"{key}=") for existing in params):
            params.append(part)
    return f"{base}?{'&'.join(params)}"


def build_mongodb_uri_from_parts(
    *,
    user: str,
    password: str,
    host: str,
) -> str:
    """Build srv URI from MONGODB_USER, MONGODB_PASSWORD, MONGODB_HOST in .env."""
    tail = merge_mongodb_query(normalize_mongodb_host(host))
    user_enc = quote_plus(user.strip(), safe="")
    password_enc = quote_plus(password.strip(), safe="")
    raw = f"mongodb+srv://{user_enc}:{password_enc}@{tail}"
    return fix_mongodb_uri(raw)


def resolve_mongodb_uri() -> str:
    """Single source of truth for MongoDB URI from .env."""
    settings = get_settings()
    uri = sanitize_mongodb_uri(settings.mongodb_uri)

    if uri:
        return fix_mongodb_uri(uri)

    user = settings.mongodb_user.strip()
    password = settings.mongodb_password.strip()
    host = settings.mongodb_host.strip()

    # Full connection string pasted into MONGODB_HOST (use as-is after normalize)
    if host.lower().startswith("mongodb") and "@" in host:
        return fix_mongodb_uri(host)

    if user and password and host:
        return build_mongodb_uri_from_parts(user=user, password=password, host=host)

    return ""


def uri_safe_diagnostics() -> dict[str, Any]:
    """Diagnostics for /health/db — never returns password."""
    raw = sanitize_mongodb_uri(get_settings().mongodb_uri)
    fixed = resolve_mongodb_uri()
    if not fixed:
        return {"configured": False, "hint": "Set MONGODB_URI in backend/.env"}

    parts = fixed.split("://", 1)
    rest = parts[1] if len(parts) > 1 else ""
    split = _split_mongodb_authority(rest)
    if not split:
        return {"configured": True, "parse_ok": False, "hint": "URI format invalid"}

    user, _password, host_path = split
    host_only = host_path.split("/")[0].split("?")[0]
    at_in_raw = raw.count("@")
    return {
        "configured": True,
        "parse_ok": True,
        "user": unquote_plus(user),
        "host": host_only,
        "raw_at_sign_count": at_in_raw,
        "password_url_encoded": "%" in _password,
        "hint": (
            "If password contains @ # $ etc., use %40 for @ in MONGODB_URI "
            "or set MONGODB_USER, MONGODB_PASSWORD, MONGODB_HOST separately."
        ),
    }


class Collections:
    """Core platform collections."""

    USERS = "users"
    SESSIONS = "sessions"
    CONVERSATIONS = "conversations"
    MESSAGES = "messages"
    USER_MEMORY = "user_memory"
    ARCHITECT_PROJECTS = "architect_projects"
    ARCHITECT_BLUEPRINTS = "architect_blueprints"
    MEDICAL_SCANS = "medical_scans"
    MEDICAL_REPORTS = "medical_reports"
    ANALYTICS_DATASETS = "analytics_datasets"
    ANALYTICS_REPORTS = "analytics_reports"
    ANALYTICS_INSIGHTS = "analytics_insights"
    SYSTEM_META = "system_meta"
    CHAT_LOGS = "chat_logs"
    VECTOR_MEMORY = "vector_memory"


COLLECTION_INDEXES: dict[str, list[tuple[list[tuple[str, int]], dict[str, Any]]]] = {
    Collections.USERS: [
        ([("user_id", ASCENDING)], {"unique": True, "name": "idx_users_user_id"}),
        ([("email", ASCENDING)], {"sparse": True, "name": "idx_users_email"}),
    ],
    Collections.SESSIONS: [
        ([("user_id", ASCENDING), ("created_at", DESCENDING)], {"name": "idx_sessions_user"}),
        ([("session_token", ASCENDING)], {"unique": True, "sparse": True, "name": "idx_sessions_token"}),
    ],
    Collections.CONVERSATIONS: [
        ([("user_id", ASCENDING), ("updated_at", DESCENDING)], {"name": "idx_conv_user_updated"}),
        ([("conversation_id", ASCENDING)], {"unique": True, "name": "idx_conv_id"}),
        ([("agent_id", ASCENDING)], {"name": "idx_conv_agent"}),
    ],
    Collections.VECTOR_MEMORY: [
        ([("user_id", ASCENDING), ("created_at", DESCENDING)], {"name": "idx_vec_user_created"}),
        ([("conversation_id", ASCENDING), ("created_at", DESCENDING)], {"name": "idx_vec_conv_created"}),
    ],
    Collections.MESSAGES: [
        ([("conversation_id", ASCENDING), ("created_at", ASCENDING)], {"name": "idx_msg_conv"}),
        ([("user_id", ASCENDING), ("created_at", DESCENDING)], {"name": "idx_msg_user"}),
    ],
    Collections.USER_MEMORY: [
        ([("user_id", ASCENDING)], {"unique": True, "name": "idx_memory_user"}),
    ],
    Collections.ARCHITECT_PROJECTS: [
        ([("user_id", ASCENDING), ("updated_at", DESCENDING)], {"name": "idx_arch_proj_user"}),
        ([("status", ASCENDING)], {"name": "idx_arch_proj_status"}),
    ],
    Collections.ARCHITECT_BLUEPRINTS: [
        ([("project_id", ASCENDING)], {"name": "idx_arch_bp_project"}),
        ([("user_id", ASCENDING), ("created_at", DESCENDING)], {"name": "idx_arch_bp_user"}),
    ],
    Collections.MEDICAL_SCANS: [
        ([("user_id", ASCENDING), ("created_at", DESCENDING)], {"name": "idx_med_scan_user"}),
        ([("scan_type", ASCENDING)], {"name": "idx_med_scan_type"}),
    ],
    Collections.MEDICAL_REPORTS: [
        ([("user_id", ASCENDING), ("created_at", DESCENDING)], {"name": "idx_med_report_user"}),
        ([("scan_id", ASCENDING)], {"name": "idx_med_report_scan"}),
    ],
    Collections.ANALYTICS_DATASETS: [
        ([("user_id", ASCENDING), ("uploaded_at", DESCENDING)], {"name": "idx_analytics_ds_user"}),
        ([("filename", ASCENDING)], {"name": "idx_analytics_ds_file"}),
    ],
    Collections.ANALYTICS_REPORTS: [
        ([("user_id", ASCENDING), ("created_at", DESCENDING)], {"name": "idx_analytics_rep_user"}),
        ([("dataset_id", ASCENDING)], {"name": "idx_analytics_rep_dataset"}),
    ],
    Collections.ANALYTICS_INSIGHTS: [
        ([("user_id", ASCENDING), ("generated_at", DESCENDING)], {"name": "idx_analytics_ins_user"}),
        ([("report_id", ASCENDING)], {"name": "idx_analytics_ins_report"}),
    ],
    Collections.CHAT_LOGS: [
        ([("userId", ASCENDING), ("timestamp", DESCENDING)], {"name": "idx_chat_logs_user"}),
        ([("conversation_id", ASCENDING)], {"name": "idx_chat_logs_conv", "sparse": True}),
    ],
}


def reset_client() -> None:
    """Drop cached client (e.g. after .env credential change)."""
    global _client, _db
    if _client is not None:
        try:
            _client.close()
        except Exception:
            pass
    _client = None
    _db = None


def enable_memory_fallback(reason: str = "atlas_unavailable") -> dict[str, Any]:
    """Switch to in-memory DB — API keeps running; chat works for this session."""
    reset_client()
    memory_store.enable(reason)
    logger.info("MongoDB fallback active (%s) — using in-memory store", reason)
    return {
        "connected": True,
        "initialized": True,
        "mode": "in_memory_fallback",
        "database": memory_store.get_db().name,
        "reason": reason,
        "hint": "Fix MONGODB_URI in .env for persistent Atlas storage.",
    }


def mongo_boot_pending() -> dict[str, Any]:
    """Non-blocking startup placeholder — does NOT lock out Atlas background connect."""
    return {
        "connected": True,
        "initialized": False,
        "mode": "connecting",
        "database": None,
        "reason": "mongodb_connecting_async",
    }


def _probe_failed(reason: str) -> dict[str, Any]:
    """Atlas probe failed — does NOT activate in-memory fallback (allows retries)."""
    return {
        "connected": False,
        "initialized": False,
        "mode": "unavailable",
        "reason": reason,
    }


def is_memory_fallback() -> bool:
    return memory_store.is_active()


def get_client() -> Optional[MongoClient]:
    """Return a singleton MongoClient or None if MONGODB_URI is not set."""
    global _client
    if memory_store.is_active():
        return None
    uri = resolve_mongodb_uri()
    if not uri:
        logger.warning("MONGODB_URI not set — database features disabled.")
        return None

    if _client is None:
        try:
            _client = MongoClient(
                uri,
                serverSelectionTimeoutMS=2500,
                connectTimeoutMS=2500,
                socketTimeoutMS=4000,
                retryWrites=True,
                connect=False,
            )
        except (ConfigurationError, PyMongoError) as exc:
            logger.debug("MongoDB client configuration error: %s", exc)
            _client = None
            return None
    return _client


def _run_init_collections_safe() -> dict[str, Any]:
    """Thread worker — never blocks the event loop or Uvicorn handshake."""
    try:
        return init_collections()
    except Exception as exc:
        logger.warning("MongoDB background init failed: %s", exc)
        return enable_memory_fallback("background_init_exception")


def start_mongodb_background() -> dict[str, Any]:
    """
    Fire-and-forget Atlas init — returns immediately so API boot never waits
    on serverSelection / auth handshake.
    """
    global _mongo_bg_started
    with _mongo_bg_lock:
        if _mongo_bg_started:
            if memory_store.is_active():
                return {
                    "connected": True,
                    "initialized": True,
                    "mode": "in_memory_fallback",
                    "database": memory_store.get_db().name,
                    "reason": memory_store.reason(),
                    "background": True,
                }
            db = get_database()
            if db is not None:
                return {
                    "connected": True,
                    "initialized": True,
                    "mode": "atlas",
                    "database": db.name,
                    "background": True,
                }
            return mongo_boot_pending()
        _mongo_bg_started = True

    threading.Thread(
        target=_run_init_collections_safe,
        name="omnimind-mongo-init",
        daemon=True,
    ).start()
    return mongo_boot_pending()


async def init_collections_async() -> dict[str, Any]:
    """Non-blocking asyncio wrapper — executor + instant fallback on timeout."""
    loop = asyncio.get_running_loop()
    try:
        return await asyncio.wait_for(
            loop.run_in_executor(None, _run_init_collections_safe),
            timeout=2.0,
        )
    except asyncio.TimeoutError:
        logger.warning("MongoDB asyncio init timed out — in-memory fallback")
        start_mongodb_background()
        return enable_memory_fallback("async_init_timeout")
    except Exception as exc:
        logger.warning("MongoDB asyncio init exception: %s", exc)
        return enable_memory_fallback("async_init_exception")


def get_database(db_name: Optional[str] = None) -> Optional[Database | Any]:
    """Return Atlas database or in-memory fallback."""
    if memory_store.is_active():
        return memory_store.get_db()

    global _db
    client = get_client()
    if client is None:
        return None

    if _db is None:
        settings = get_settings()
        name = db_name or settings.mongodb_db_name or DEFAULT_DB_NAME
        # Motor + PyMongo: bracket access only — never client.get_database()
        _db = client[name]
    return _db


def _database_from_client(client: Any, db_name: Optional[str] = None) -> Any:
    """Atlas/Motor/PyMongo — bracket access only (Motor has no get_database)."""
    settings = get_settings()
    name = db_name or settings.mongodb_db_name or DEFAULT_DB_NAME
    return client[name]


def get_collection(name: str) -> Optional[Collection | Any]:
    db = get_database()
    if db is None:
        return None
    return db[name]


def ping() -> dict[str, Any]:
    """Verify Atlas connectivity; reports fallback as connected for API health."""
    try:
        return _ping_impl()
    except Exception as exc:
        logger.debug("MongoDB ping bypassed: %s", exc)
        return enable_memory_fallback("ping_exception")


def _ping_impl() -> dict[str, Any]:
    """Inner ping — wrapped so callers never stall on Atlas handshake."""
    if memory_store.is_active():
        reason = memory_store.reason() or ""
        if reason not in (
            "mongodb_connecting_async",
            "background_pending",
            "boot_instant",
            "connecting",
        ):
            return {
                "connected": True,
                "mode": "in_memory_fallback",
                "database": memory_store.get_db().name,
                "reason": reason,
            }
        memory_store.disable()

    raw_uri = resolve_mongodb_uri()
    if not raw_uri:
        return _probe_failed("MONGODB_URI not configured")

    if "xxxx" in raw_uri.lower() or "YOUR_" in raw_uri.upper() or "PASSWORD" in raw_uri.upper():
        return _probe_failed("placeholder URI in .env")

    client = get_client()
    if client is None:
        return _probe_failed("client_unavailable")

    try:
        client.admin.command("ping")
        db = get_database()
        return {
            "connected": True,
            "mode": "atlas",
            "database": db.name if db is not None else DEFAULT_DB_NAME,
            "diagnostics": uri_safe_diagnostics(),
        }
    except OperationFailure as exc:
        reset_client()
        err = str(exc)
        code_name = ""
        if isinstance(getattr(exc, "details", None), dict):
            code_name = exc.details.get("codeName", "")
        if code_name == "AtlasError" or "auth" in err.lower() or getattr(exc, "code", None) == 8000:
            return enable_memory_fallback("AtlasError_auth")
        return enable_memory_fallback("operation_failure")
    except (ServerSelectionTimeoutError, PyMongoError, Exception):
        reset_client()
        return _probe_failed("atlas_unreachable")


def _ensure_indexes(collection: Collection, specs: list) -> None:
    for keys, options in specs:
        collection.create_index(keys, **options)


def init_collections() -> dict[str, Any]:
    """
    Atlas indexes when online; in-memory fallback when Atlas auth/network fails.
    Never raises — API always starts.
    """
    memory_store.disable()
    reset_client()
    status: dict[str, Any] = _probe_failed("not_connected")
    for _ in range(3):
        status = ping()
        if status.get("mode") == "atlas" and status.get("connected"):
            break
        reset_client()
        memory_store.disable()
    if status.get("mode") != "atlas" or not status.get("connected"):
        return enable_memory_fallback(status.get("reason", "not_connected"))

    db = get_database()
    if db is None:
        return enable_memory_fallback("no_database")

    try:
        initialized: list[str] = []
        for coll_name, index_specs in COLLECTION_INDEXES.items():
            coll = db[coll_name]
            _ensure_indexes(coll, index_specs)
            initialized.append(coll_name)

        meta = db[Collections.SYSTEM_META]
        meta.update_one(
            {"_id": "omnimind_v11_schema"},
            {
                "$set": {
                    "version": "1.0.0",
                    "collections": initialized,
                    "updated_at": datetime.now(timezone.utc),
                    "modules": {
                        "architect": [
                            Collections.ARCHITECT_PROJECTS,
                            Collections.ARCHITECT_BLUEPRINTS,
                        ],
                        "medical": [
                            Collections.MEDICAL_SCANS,
                            Collections.MEDICAL_REPORTS,
                        ],
                        "analytics": [
                            Collections.ANALYTICS_DATASETS,
                            Collections.ANALYTICS_REPORTS,
                            Collections.ANALYTICS_INSIGHTS,
                        ],
                    },
                }
            },
        )

        logger.info("MongoDB collections initialized: %s", ", ".join(initialized))
        return {
            "initialized": True,
            "mode": "atlas",
            "database": db.name,
            "collections": initialized,
            "count": len(initialized),
        }
    except (OperationFailure, PyMongoError) as exc:
        reset_client()
        logger.info("MongoDB init failed — using in-memory fallback: %s", exc)
        return enable_memory_fallback("init_failed")


def save_chat_turn(
    user_id: str,
    message: str,
    reply: str,
    conversation_id: str | None = None,
) -> None:
    """Store one turn in chat_logs collection (user schema)."""
    db = get_database()
    if db is None:
        return
    db[Collections.CHAT_LOGS].insert_one(
        {
            "userId": user_id,
            "message": message,
            "reply": reply,
            "conversation_id": conversation_id,
            "timestamp": datetime.now(timezone.utc),
        }
    )


def close_connection() -> None:
    """Close MongoDB client on shutdown."""
    reset_client()
