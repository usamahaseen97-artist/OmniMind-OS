import json
import logging
import os
from functools import lru_cache
from pathlib import Path
from typing import Any

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parent
_ENV_FILE = _BACKEND_DIR / ".env"
_PRODUCTION_JSON = _BACKEND_DIR / "config" / "production.json"
_prod_log = logging.getLogger(__name__)


def _apply_backend_dotenv() -> None:
    """Always prefer backend/.env over empty inherited OS env (fixes stale uvicorn workers)."""
    if not _ENV_FILE.is_file():
        return
    try:
        from dotenv import dotenv_values

        for key, val in dotenv_values(_ENV_FILE).items():
            if val is None:
                continue
            s = str(val).strip()
            if not s:
                continue
            cur = os.environ.get(key)
            if cur is None or not str(cur).strip():
                os.environ[key] = s
    except OSError:
        pass


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
        env_ignore_empty=True,
    )

    gemini_api_key: str = ""
    gemini_model: str = Field(
        default="gemini-1.5-flash",
        validation_alias=AliasChoices("GEMINI_MODEL", "GEMINI_CHAT_MODEL"),
    )
    gemini_embedding_model: str = Field(
        default="models/text-embedding-004",
        validation_alias=AliasChoices("GEMINI_EMBEDDING_MODEL", "GEMINI_EMBED_MODEL"),
    )
    music_use_gemini_tool: bool = Field(
        default=False,
        validation_alias="MUSIC_USE_GEMINI_TOOL",
    )
    music_skip_ytdlp: bool = Field(
        default=True,
        validation_alias="MUSIC_SKIP_YTDLP",
    )
    music_global_search_ytdlp: bool = Field(
        default=True,
        validation_alias="MUSIC_GLOBAL_SEARCH_YTDLP",
    )
    music_ytdlp_timeout_seconds: float = Field(
        default=18.0,
        validation_alias="MUSIC_YTDLP_TIMEOUT_SECONDS",
    )
    elasticsearch_url: str = Field(
        default="http://localhost:9200",
        validation_alias=AliasChoices("ELASTICSEARCH_URL", "ES_URL"),
    )
    elasticsearch_enabled: bool = Field(
        default=True,
        validation_alias="ELASTICSEARCH_ENABLED",
    )
    elasticsearch_songs_index: str = Field(
        default="songs",
        validation_alias=AliasChoices("ELASTICSEARCH_SONGS_INDEX", "ES_SONGS_INDEX"),
    )
    elasticsearch_username: str = Field(
        default="",
        validation_alias=AliasChoices("ELASTICSEARCH_USERNAME", "ELASTIC_USERNAME"),
    )
    elasticsearch_password: str = Field(
        default="",
        validation_alias=AliasChoices("ELASTICSEARCH_PASSWORD", "ELASTIC_PASSWORD"),
    )
    elasticsearch_verify_ssl: bool = Field(
        default=False,
        validation_alias="ELASTICSEARCH_VERIFY_SSL",
    )
    replicate_api_token: str = Field(
        default="",
        validation_alias=AliasChoices("REPLICATE_API_TOKEN", "REPLICATE_API_KEY"),
    )
    stability_api_key: str = Field(default="", validation_alias="STABILITY_API_KEY")
    pollinations_api_key: str = Field(
        default="",
        validation_alias=AliasChoices(
            "POLLINATIONS_API_KEY",
            "POLLINATIONS_SECRET_KEY",
        ),
    )
    huggingface_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("HUGGINGFACE_API_KEY", "HF_TOKEN"),
    )
    wan_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("WAN_API_KEY", "WAN25_API_KEY"),
    )
    tavily_api_key: str = ""
    grok_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("GROK_API_KEY", "GROQ_API_KEY"),
    )
    openrouter_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("HUNYUAN_API_KEY", "OPENROUTER_API_KEY"),
    )
    google_maps_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("GOOGLE_MAPS_API_KEY", "MAPS_API_KEY"),
    )
    mongodb_uri: str = Field(
        default="",
        validation_alias=AliasChoices("MONGODB_URI", "MONGODB_URL"),
    )
    mongodb_user: str = Field(default="", validation_alias="MONGODB_USER")
    mongodb_password: str = Field(default="", validation_alias="MONGODB_PASSWORD")
    mongodb_host: str = Field(default="", validation_alias="MONGODB_HOST")
    mongodb_db_name: str = Field(default="omnimind", validation_alias="MONGODB_DB_NAME")
    mongodb_embedding_model: str = Field(
        default="models/text-embedding-004",
        validation_alias="MONGODB_EMBEDDING_MODEL",
    )
    local_llm_base_url: str = Field(
        default="http://localhost:1234/v1",
        validation_alias=AliasChoices(
            "LOCAL_LLM_BASE_URL",
            "LOCAL_LLM_URL",
            "OPENAI_BASE_URL",
            "LM_STUDIO_URL",
        ),
    )
    local_llm_api_key: str = Field(
        default="lm-studio",
        validation_alias="LOCAL_LLM_API_KEY",
    )
    local_llm_model: str = Field(
        default="meta-llama-3.1-8b-instruct",
        validation_alias=AliasChoices("LOCAL_LLM_MODEL", "LM_STUDIO_MODEL"),
    )
    # Legacy aliases (chat router / lm_studio)
    local_llm_url: str = Field(
        default="http://localhost:1234/v1",
        validation_alias="LOCAL_LLM_URL",
    )
    lm_studio_url: str = Field(default="", validation_alias="LM_STUDIO_URL")
    lm_studio_model: str = Field(default="", validation_alias="LM_STUDIO_MODEL")
    llm_provider: str = Field(default="auto", validation_alias="LLM_PROVIDER")
    openai_base_url: str = Field(
        default="http://localhost:1234/v1",
        validation_alias="OPENAI_BASE_URL",
    )
    openai_api_key: str = Field(default="lm-studio", validation_alias="OPENAI_API_KEY")
    allowed_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        validation_alias=AliasChoices("ALLOWED_ORIGINS", "OMNIMIND_ALLOWED_ORIGINS"),
    )
    rate_limit: str = "30/minute"
    supabase_url: str = ""
    supabase_anon_key: str = Field(default="", validation_alias="SUPABASE_ANON_KEY")
    supabase_service_key: str = Field(
        default="",
        validation_alias=AliasChoices("SUPABASE_SERVICE_KEY", "SUPABASE_SECRET_KEY"),
    )
    coingecko_api_key: str = ""
    finnhub_api_key: str = ""
    spotify_client_id: str = Field(default="", validation_alias="SPOTIFY_CLIENT_ID")
    spotify_client_secret: str = Field(
        default="",
        validation_alias="SPOTIFY_CLIENT_SECRET",
    )
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_client_id: str = "omnimind-api"
    kafka_events_topic: str = "omnimind.events"
    kafka_finance_topic: str = "omnimind.finance"
    kafka_entertainment_topic: str = "omnimind.entertainment"
    kafka_movie_analytics_topic: str = Field(
        default="movie-analytics",
        validation_alias="KAFKA_MOVIE_ANALYTICS_TOPIC",
    )
    kafka_movie_events_topic: str = Field(
        default="movie-events",
        validation_alias="KAFKA_MOVIE_EVENTS_TOPIC",
    )
    kafka_music_events_topic: str = Field(
        default="music-events",
        validation_alias="KAFKA_MUSIC_EVENTS_TOPIC",
    )
    kafka_tv_events_topic: str = Field(
        default="tv-events",
        validation_alias="KAFKA_TV_EVENTS_TOPIC",
    )
    tmdb_api_key: str = Field(default="", validation_alias="TMDB_API_KEY")
    bloomberg_mode: str = "mock"
    kafka_connect_retries: int = 30
    kafka_connect_retry_seconds: float = 2.0
    spark_master_url: str = "spark://localhost:7077"
    spark_ui_url: str = "http://localhost:8080"
    streaming_lazy_load: bool = True
    streaming_idle_timeout_seconds: int = 300
    streaming_watchdog_interval_seconds: int = 60
    streaming_compose_file: str = ""
    omnimind_public_api_url: str = Field(
        default="http://127.0.0.1:8001",
        validation_alias=AliasChoices(
            "OMNIMIND_PUBLIC_API_URL",
            "PUBLIC_API_URL",
            "NEXT_PUBLIC_BACKEND_URL",
        ),
    )
    n8n_enabled: bool = Field(default=True, validation_alias="N8N_ENABLED")
    n8n_base_url: str = Field(default="http://localhost:5678", validation_alias="N8N_BASE_URL")
    n8n_api_key: str = Field(default="", validation_alias="N8N_API_KEY")
    n8n_timeout_seconds: float = Field(default=30.0, validation_alias="N8N_TIMEOUT_SECONDS")
    n8n_webhook_deploy_staging: str = Field(
        default="/webhook/deploy-staging",
        validation_alias="N8N_WEBHOOK_DEPLOY_STAGING",
    )
    n8n_webhook_trading_alert: str = Field(
        default="/webhook/trading-alert",
        validation_alias="N8N_WEBHOOK_TRADING_ALERT",
    )
    n8n_webhook_notifications: str = Field(
        default="/webhook/notifications",
        validation_alias="N8N_WEBHOOK_NOTIFICATIONS",
    )
    jwt_secret_key: str = Field(
        default="",
        validation_alias=AliasChoices(
            "JWT_SECRET_KEY",
            "OMNIMIND_JWT_SECRET",
            "JWT_SECRET",
            "JWT_SIGNING_KEY",
        ),
    )
    jwt_access_expire_minutes: int = Field(
        default=60,
        validation_alias="JWT_ACCESS_EXPIRE_MINUTES",
    )
    jwt_refresh_expire_days: int = Field(
        default=14,
        validation_alias="JWT_REFRESH_EXPIRE_DAYS",
    )
    jwt_enforce_middleware: bool = Field(
        default=False,
        validation_alias="JWT_ENFORCE_MIDDLEWARE",
    )
    jwt_protected_prefix: str = Field(
        default="/api/v1/admin",
        validation_alias="JWT_PROTECTED_PREFIX",
    )
    redis_url: str = Field(
        default="redis://127.0.0.1:6379/0",
        validation_alias=AliasChoices("REDIS_URL", "OMNIMIND_REDIS_URL"),
    )
    redis_host: str = Field(default="", validation_alias="REDIS_HOST")
    redis_port: int = Field(default=6379, validation_alias="REDIS_PORT")
    redis_db: int = Field(default=0, validation_alias="REDIS_DB")
    redis_enabled: bool = Field(default=True, validation_alias="REDIS_ENABLED")
    redis_default_ttl_seconds: int = Field(
        default=300,
        validation_alias="REDIS_DEFAULT_TTL_SECONDS",
    )
    redis_connect_timeout_seconds: float = Field(
        default=3.0,
        validation_alias="REDIS_CONNECT_TIMEOUT_SECONDS",
    )
    webhook_signing_secret: str = Field(
        default="",
        validation_alias=AliasChoices(
            "WEBHOOK_SIGNING_SECRET",
            "OMNIMIND_WEBHOOK_SECRET",
            "N8N_WEBHOOK_SECRET",
        ),
    )
    omnimind_env: str = Field(
        default="development",
        validation_alias=AliasChoices("OMNIMIND_ENV", "NODE_ENV", "DEPLOY_ENV"),
    )
    s3_bucket: str = Field(default="", validation_alias=AliasChoices("S3_BUCKET", "OMNIMIND_S3_BUCKET"))
    s3_region: str = Field(default="us-east-1", validation_alias="S3_REGION")
    cdn_base_url: str = Field(default="", validation_alias=AliasChoices("CDN_BASE_URL", "OMNIMIND_CDN_URL"))
    otel_exporter_endpoint: str = Field(
        default="",
        validation_alias=AliasChoices("OTEL_EXPORTER_OTLP_ENDPOINT", "OTEL_ENDPOINT"),
    )
    metrics_public: bool = Field(
        default=False,
        validation_alias=AliasChoices("OMNIMIND_METRICS_PUBLIC", "METRICS_PUBLIC"),
    )

    @property
    def n8n_webhook_paths(self) -> dict[str, str]:
        return {
            "deploy_staging": self.n8n_webhook_deploy_staging,
            "trading_alert": self.n8n_webhook_trading_alert,
            "notifications": self.n8n_webhook_notifications,
        }

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def effective_redis_url(self) -> str:
        """Compose mesh uses REDIS_HOST/PORT; local dev may set REDIS_URL directly."""
        host = (self.redis_host or "").strip()
        if host:
            url = f"redis://{host}:{self.redis_port}/{self.redis_db}"
        else:
            url = (self.redis_url or "redis://127.0.0.1:6379/0").strip()
        # Redis 5.x on Windows speaks RESP2 only — redis-py 5+ defaults to RESP3 HELLO.
        if "protocol=" not in url:
            url = f"{url}{'&' if '?' in url else '?'}protocol=2"
        return url

    @property
    def effective_local_llm_base_url(self) -> str:
        return (
            self.local_llm_base_url
            or self.openai_base_url
            or self.lm_studio_url
            or self.local_llm_url
            or "http://localhost:1234/v1"
        ).rstrip("/")

    @property
    def effective_local_llm_model(self) -> str:
        return (
            self.local_llm_model
            or self.lm_studio_model
            or "meta-llama-3.1-8b-instruct"
        )


@lru_cache(maxsize=1)
def load_production_config() -> dict[str, Any]:
    """Deployment matrix from backend/config/production.json."""
    if not _PRODUCTION_JSON.is_file():
        return {}
    try:
        return json.loads(_PRODUCTION_JSON.read_text(encoding="utf-8"))
    except Exception as exc:
        _prod_log.warning("Failed to load production.json: %s", exc)
        return {}


def production_cors_origins() -> list[str]:
    """CORS allowlist from production.json (web + mobile shell origins)."""
    cfg = load_production_config()
    cors = cfg.get("cors") or {}
    origins = list(cors.get("allowed_origins") or [])
    mobile = cfg.get("mobile_shells") or {}
    origins.extend(mobile.get("ios_webview_origins") or [])
    origins.extend(mobile.get("android_webview_origins") or [])
    return [str(o).strip() for o in origins if str(o).strip()]


def get_settings() -> Settings:
    """Load settings from backend/.env via pydantic-settings (no hardcoded secrets)."""
    _apply_backend_dotenv()
    return Settings()
