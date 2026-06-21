from __future__ import annotations

import logging
import os
from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_log = logging.getLogger(__name__)

_PKG_ROOT = Path(__file__).resolve().parents[1]  # backend-fastapi/
_REPO_ROOT = _PKG_ROOT.parent
_BACKEND_ENV = _REPO_ROOT / "backend" / ".env"
_FASTAPI_ENV = _PKG_ROOT / ".env"


def _bootstrap_dotenv() -> None:
    """Load shared backend/.env then backend-fastapi/.env (same keys as monolith)."""
    try:
        from dotenv import dotenv_values, load_dotenv

        load_dotenv(_BACKEND_ENV, override=False, encoding="utf-8")
        load_dotenv(_FASTAPI_ENV, override=True, encoding="utf-8")

        if _BACKEND_ENV.is_file():
            for key, val in dotenv_values(_BACKEND_ENV).items():
                if val is None:
                    continue
                s = str(val).strip()
                if not s:
                    continue
                cur = os.environ.get(key)
                if cur is None or not str(cur).strip():
                    os.environ[key] = s
    except OSError as exc:
        _log.warning("dotenv bootstrap skipped: %s", exc)


_bootstrap_dotenv()

PLACEHOLDER_FRAGMENTS = (
    "lm-studio",
    "lm_studio",
    "your_",
    "changeme",
    "xxx",
    "placeholder",
    "paste_",
    "sk-xxx",
    "not-needed",
    "dummy",
)


def is_configured_secret(raw: str | None) -> bool:
    val = (raw or "").strip()
    if len(val) < 4:
        return False
    low = val.lower()
    return not any(p in low for p in PLACEHOLDER_FRAGMENTS)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(str(_BACKEND_ENV), str(_FASTAPI_ENV)),
        env_file_encoding="utf-8",
        extra="ignore",
        env_ignore_empty=True,
    )

    database_url: str = Field(
        default="postgresql+asyncpg://omnimind:omnimind@localhost:5432/omnimind",
        validation_alias="DATABASE_URL",
    )
    redis_url: str = Field(default="redis://localhost:6379/0", validation_alias="REDIS_URL")
    jwt_secret_key: str = Field(default="change-me", validation_alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", validation_alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, validation_alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=14, validation_alias="REFRESH_TOKEN_EXPIRE_DAYS")
    gateway_origin: str = Field(default="http://localhost:8080", validation_alias="GATEWAY_ORIGIN")
    frontend_origin: str = Field(default="http://localhost:3000", validation_alias="FRONTEND_ORIGIN")
    github_client_id: str = Field(default="", validation_alias="GITHUB_CLIENT_ID")
    github_client_secret: str = Field(default="", validation_alias="GITHUB_CLIENT_SECRET")
    github_oauth_callback: str = Field(
        default="http://localhost:8080/api/v1/auth/github/callback",
        validation_alias="GITHUB_OAUTH_CALLBACK",
    )
    node_service_url: str = Field(default="http://localhost:8091", validation_alias="NODE_SERVICE_URL")
    core_python_url: str = Field(default="http://127.0.0.1:8001", validation_alias="CORE_PYTHON_URL")
    github_token: str = Field(default="", validation_alias="GITHUB_TOKEN")

    omniforge_local_first: bool = Field(default=True, validation_alias="OMNIFORGE_LOCAL_FIRST")
    omniforge_chat_timeout: float = Field(default=45.0, validation_alias="OMNIFORGE_CHAT_TIMEOUT")

    gemini_api_key: str = Field(default="", validation_alias=AliasChoices("GEMINI_API_KEY", "GOOGLE_API_KEY"))
    gemini_model: str = Field(
        default="gemini-2.0-flash",
        validation_alias=AliasChoices("GEMINI_MODEL", "GEMINI_CHAT_MODEL"),
    )
    groq_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("GROQ_API_KEY", "GROK_API_KEY"),
    )
    groq_model: str = Field(
        default="llama-3.3-70b-versatile",
        validation_alias=AliasChoices("GROQ_MODEL", "GROQ_CHAT_MODEL"),
    )
    openai_api_key: str = Field(default="", validation_alias="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4o-mini", validation_alias="OPENAI_MODEL")
    deepseek_api_key: str = Field(default="", validation_alias="DEEPSEEK_API_KEY")
    deepseek_model: str = Field(default="deepseek-chat", validation_alias="DEEPSEEK_MODEL")
    anthropic_api_key: str = Field(default="", validation_alias="ANTHROPIC_API_KEY")
    anthropic_model: str = Field(
        default="claude-3-5-sonnet-latest",
        validation_alias="ANTHROPIC_MODEL",
    )
    local_llm_url: str = Field(
        default="",
        validation_alias=AliasChoices(
            "LOCAL_LLM_URL",
            "LOCAL_LLM_BASE_URL",
            "LM_STUDIO_URL",
            "OPENAI_BASE_URL",
        ),
    )
    local_llm_model: str = Field(
        default="local-model",
        validation_alias=AliasChoices("LOCAL_LLM_MODEL", "LM_STUDIO_MODEL"),
    )
    local_llm_api_key: str = Field(default="lm-studio", validation_alias="LOCAL_LLM_API_KEY")
    ollama_base_url: str = Field(default="", validation_alias=AliasChoices("OLLAMA_BASE_URL"))
    ollama_model: str = Field(default="llama3", validation_alias="OLLAMA_MODEL")

    def gemini_key(self) -> str | None:
        return self.gemini_api_key.strip() if is_configured_secret(self.gemini_api_key) else None

    def groq_key(self) -> str | None:
        key = self.groq_api_key.strip()
        return key if is_configured_secret(key) else None

    def openai_key(self) -> str | None:
        key = self.openai_api_key.strip()
        if not is_configured_secret(key) or key.startswith("sk-lm"):
            return None
        return key

    def deepseek_key(self) -> str | None:
        return self.deepseek_api_key.strip() if is_configured_secret(self.deepseek_api_key) else None

    def anthropic_key(self) -> str | None:
        return self.anthropic_api_key.strip() if is_configured_secret(self.anthropic_api_key) else None

    def local_llm_endpoint(self) -> str | None:
        url = self.local_llm_url.strip().rstrip("/")
        if not url:
            return None
        return url

    def ollama_endpoint(self) -> str | None:
        url = self.ollama_base_url.strip().rstrip("/")
        return url if url else None

    def configured_providers(self) -> list[str]:
        out: list[str] = []
        if self.gemini_key():
            out.append("gemini")
        if self.groq_key():
            out.append("groq")
        if self.local_llm_endpoint():
            out.append("local")
        if self.ollama_endpoint():
            out.append("ollama")
        if self.openai_key():
            out.append("openai")
        if self.deepseek_key():
            out.append("deepseek")
        if self.anthropic_key():
            out.append("anthropic")
        return out


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    if os.getenv("OMNIFORGE_DEV_SQLITE", "").strip().lower() in ("1", "true", "yes") and not os.getenv("DATABASE_URL"):
        return s.model_copy(update={"database_url": "sqlite+aiosqlite:///./omniforge.dev.db"})
    return s


settings = get_settings()
