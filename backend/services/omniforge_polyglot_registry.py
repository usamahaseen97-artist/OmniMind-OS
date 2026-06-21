"""Polyglot plugin registry — languages, domains, build/run profiles for OmniForge Engine."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

DomainId = Literal[
    "web_saas",
    "web_ecommerce",
    "web_portfolio",
    "mobile_android",
    "mobile_ios",
    "mobile_flutter",
    "desktop_win",
    "desktop_mac",
    "desktop_linux",
    "game_2d",
    "game_3d",
    "microservice",
    "data_science",
    "browser_extension",
    "enterprise",
]

LanguageId = Literal[
    "html", "css", "javascript", "typescript", "python", "c", "cpp", "csharp",
    "java", "kotlin", "swift", "dart", "php", "go", "rust", "ruby", "lua", "r", "sql", "bash", "powershell",
]


@dataclass(frozen=True)
class LanguagePlugin:
    id: LanguageId
    label: str
    extensions: tuple[str, ...]
    monaco_id: str
    compile_cmd: str | None = None
    run_cmd: str | None = None


@dataclass(frozen=True)
class DomainProfile:
    id: DomainId
    label: str
    default_languages: tuple[LanguageId, ...]
    scaffold_adapter: str
    preview_mode: str = "web_blob"


LANGUAGE_PLUGINS: dict[str, LanguagePlugin] = {
    "html": LanguagePlugin("html", "HTML", (".html", ".htm"), "html"),
    "css": LanguagePlugin("css", "CSS", (".css", ".scss"), "css"),
    "javascript": LanguagePlugin("javascript", "JavaScript", (".js", ".mjs", ".cjs"), "javascript", run_cmd="node {file}"),
    "typescript": LanguagePlugin("typescript", "TypeScript", (".ts", ".tsx"), "typescript", compile_cmd="tsc", run_cmd="node {file}"),
    "python": LanguagePlugin("python", "Python", (".py",), "python", run_cmd="python {file}"),
    "c": LanguagePlugin("c", "C", (".c", ".h"), "c", compile_cmd="gcc {file} -o {out}"),
    "cpp": LanguagePlugin("cpp", "C++", (".cpp", ".hpp", ".cc"), "cpp", compile_cmd="g++ {file} -o {out}"),
    "csharp": LanguagePlugin("csharp", "C#", (".cs",), "csharp", compile_cmd="dotnet build"),
    "java": LanguagePlugin("java", "Java", (".java",), "java", compile_cmd="javac {file}", run_cmd="java {class}"),
    "kotlin": LanguagePlugin("kotlin", "Kotlin", (".kt", ".kts"), "kotlin"),
    "swift": LanguagePlugin("swift", "Swift", (".swift",), "swift"),
    "dart": LanguagePlugin("dart", "Dart", (".dart",), "dart", run_cmd="dart run {file}"),
    "php": LanguagePlugin("php", "PHP", (".php",), "php", run_cmd="php {file}"),
    "go": LanguagePlugin("go", "Go", (".go",), "go", run_cmd="go run {file}"),
    "rust": LanguagePlugin("rust", "Rust", (".rs",), "rust", compile_cmd="cargo build"),
    "ruby": LanguagePlugin("ruby", "Ruby", (".rb",), "ruby", run_cmd="ruby {file}"),
    "lua": LanguagePlugin("lua", "Lua", (".lua",), "lua"),
    "r": LanguagePlugin("r", "R", (".r", ".R"), "r"),
    "sql": LanguagePlugin("sql", "SQL", (".sql",), "sql"),
    "bash": LanguagePlugin("bash", "Bash", (".sh",), "shell"),
    "powershell": LanguagePlugin("powershell", "PowerShell", (".ps1",), "powershell"),
}

DOMAIN_PROFILES: dict[str, DomainProfile] = {
    "web_saas": DomainProfile("web_saas", "Web SaaS", ("typescript", "javascript", "html", "css", "python"), "app-builder", "web_blob"),
    "web_ecommerce": DomainProfile("web_ecommerce", "E-Commerce", ("typescript", "html", "css", "python"), "business-site-maker", "web_blob"),
    "web_portfolio": DomainProfile("web_portfolio", "Portfolio", ("html", "css", "javascript"), "app-builder", "web_blob"),
    "mobile_flutter": DomainProfile("mobile_flutter", "Flutter Mobile", ("dart",), "app-builder", "device_frame"),
    "mobile_android": DomainProfile("mobile_android", "Android", ("kotlin",), "app-builder", "device_frame"),
    "mobile_ios": DomainProfile("mobile_ios", "iOS", ("swift",), "app-builder", "device_frame"),
    "desktop_win": DomainProfile("desktop_win", "Windows Desktop", ("csharp",), "app-builder", "desktop_frame"),
    "game_2d": DomainProfile("game_2d", "2D Game", ("csharp", "javascript"), "game-dev", "game_preview"),
    "game_3d": DomainProfile("game_3d", "3D Game", ("csharp", "cpp"), "game-dev", "game_preview"),
    "microservice": DomainProfile("microservice", "Microservices", ("go", "python", "typescript"), "app-builder", "api_panel"),
    "data_science": DomainProfile("data_science", "AI / Data Science", ("python", "r", "sql"), "app-builder", "notebook"),
    "browser_extension": DomainProfile("browser_extension", "Browser Extension", ("javascript", "typescript", "html"), "app-builder", "web_blob"),
    "enterprise": DomainProfile("enterprise", "Enterprise", ("java", "csharp", "sql"), "business-site-maker", "web_blob"),
}


def resolve_language(path: str) -> LanguageId | None:
    low = path.lower()
    for plugin in LANGUAGE_PLUGINS.values():
        if any(low.endswith(ext) for ext in plugin.extensions):
            return plugin.id
    return None


def register_language(plugin: LanguagePlugin) -> None:
    """Dynamic plugin registration hook."""
    LANGUAGE_PLUGINS[plugin.id] = plugin


def register_domain(profile: DomainProfile) -> None:
    DOMAIN_PROFILES[profile.id] = profile


def registry_snapshot() -> dict[str, Any]:
    return {
        "languages": [p.id for p in LANGUAGE_PLUGINS.values()],
        "domains": [d.id for d in DOMAIN_PROFILES.values()],
        "language_count": len(LANGUAGE_PLUGINS),
        "domain_count": len(DOMAIN_PROFILES),
    }
