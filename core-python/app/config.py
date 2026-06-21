from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path


def _bootstrap_dotenv() -> None:
    """Load shared backend/.env so GITHUB_TOKEN is available when run from core-python/."""
    try:
        from dotenv import load_dotenv

        repo_root = Path(__file__).resolve().parents[2]
        load_dotenv(repo_root / "backend" / ".env", override=False, encoding="utf-8")
        load_dotenv(repo_root / "core-python" / ".env", override=True, encoding="utf-8")
    except OSError:
        pass


_bootstrap_dotenv()


def _env(key: str, default: str = "") -> str:
    return os.getenv(key, default).strip()


@lru_cache
def get_settings() -> "Settings":
    return Settings()


class Settings:
    github_token: str
    github_models_url: str
    github_models_default: str
    github_models_coder: str
    github_api_version: str
    chat_timeout: float
    community_sync_interval_sec: int
    community_cache_path: str

    def __init__(self) -> None:
        self.github_token = _env("GITHUB_TOKEN")
        self.github_models_url = _env(
            "GITHUB_MODELS_URL",
            "https://models.github.ai/inference/chat/completions",
        )
        self.github_models_default = _env(
            "GITHUB_MODELS_DEFAULT",
            "meta-llama/llama-3.3-70b-instruct",
        )
        self.github_models_coder = _env(
            "GITHUB_MODELS_CODER",
            "qwen/qwen2.5-coder-32b-instruct",
        )
        self.github_api_version = _env("GITHUB_API_VERSION", "2022-11-28")
        self.chat_timeout = float(_env("CORE_PYTHON_CHAT_TIMEOUT", "45"))
        self.community_sync_interval_sec = int(_env("COMMUNITY_API_SYNC_INTERVAL_SEC", "3600"))
        self.community_cache_path = _env(
            "COMMUNITY_API_CACHE_PATH",
            os.path.join(os.path.dirname(__file__), "..", "data", "community_apis.json"),
        )

    def github_configured(self) -> bool:
        return len(self.github_token) >= 8
