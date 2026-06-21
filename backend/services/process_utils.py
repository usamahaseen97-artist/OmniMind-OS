"""
Windows-safe subprocess helpers and optional binary resolution (docker, ffmpeg, yt-dlp).
"""

from __future__ import annotations

import logging
import os
import shutil
import subprocess
import sys
from functools import lru_cache
from pathlib import Path
from typing import Any, Mapping, Optional, Sequence, Union

logger = logging.getLogger(__name__)

IS_WINDOWS = sys.platform == "win32"

CmdArg = Union[str, list[str]]


def resolve_executable(
    name: str,
    *,
    env_var: Optional[str] = None,
    extra_paths: Optional[Sequence[str]] = None,
) -> Optional[str]:
    """Resolve a CLI binary via env override, PATH, or extra directories."""
    if env_var:
        raw = os.getenv(env_var, "").strip().strip('"')
        if raw:
            p = Path(raw)
            if p.is_file():
                return str(p.resolve())
            if p.is_dir():
                for candidate in (p / name, p / f"{name}.exe"):
                    if candidate.is_file():
                        return str(candidate.resolve())

    found = shutil.which(name)
    if found:
        return found

    if IS_WINDOWS and not name.lower().endswith(".exe"):
        found = shutil.which(f"{name}.exe")
        if found:
            return found

    for folder in extra_paths or ():
        base = Path(folder)
        for candidate in (base / name, base / f"{name}.exe"):
            if candidate.is_file():
                return str(candidate.resolve())
    return None


@lru_cache(maxsize=1)
def docker_executable() -> Optional[str]:
    return resolve_executable(
        "docker",
        env_var="DOCKER_BINARY",
        extra_paths=(
            r"C:\Program Files\Docker\Docker\resources\bin",
            os.path.expandvars(r"%ProgramFiles%\Docker\Docker\resources\bin"),
        ),
    )


@lru_cache(maxsize=1)
def ffmpeg_executable() -> Optional[str]:
    return resolve_executable("ffmpeg", env_var="FFMPEG_BINARY") or _imageio_ffmpeg_exe()


def _imageio_ffmpeg_exe() -> Optional[str]:
    try:
        import imageio_ffmpeg  # type: ignore

        exe = imageio_ffmpeg.get_ffmpeg_exe()
        return exe if exe and Path(exe).is_file() else None
    except Exception:
        return None


def ffmpeg_location_dir() -> Optional[str]:
    """Directory passed to yt-dlp ``ffmpeg_location``."""
    exe = ffmpeg_executable()
    if not exe:
        return None
    return str(Path(exe).resolve().parent)


def bootstrap_tool_path_env() -> None:
    """Prepend resolved tool directories to PATH (helps yt-dlp/ffprobe on Windows)."""
    folders: list[str] = []
    for exe in (ffmpeg_executable(), docker_executable()):
        if exe:
            folder = str(Path(exe).resolve().parent)
            if folder not in folders:
                folders.append(folder)
    if not folders:
        return
    path = os.environ.get("PATH", "")
    for folder in reversed(folders):
        if folder.casefold() not in path.casefold():
            path = folder + os.pathsep + path
    os.environ["PATH"] = path


def ytdlp_base_opts() -> dict[str, Any]:
    """Shared yt-dlp options; avoids spawning missing ffmpeg on Windows."""
    bootstrap_tool_path_env()
    opts: dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "noprogress": True,
    }
    loc = ffmpeg_location_dir()
    if loc:
        opts["ffmpeg_location"] = loc
    return opts


def subprocess_kwargs(
    *,
    hide_window: bool = True,
    extra: Optional[Mapping[str, Any]] = None,
) -> dict[str, Any]:
    """Extra kwargs for subprocess.run / Popen on Windows."""
    kw: dict[str, Any] = dict(extra or {})
    if not IS_WINDOWS or not hide_window:
        return kw
    if "startupinfo" in kw or "creationflags" in kw:
        return kw
    si = subprocess.STARTUPINFO()
    si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    kw["startupinfo"] = si
    kw["creationflags"] = getattr(subprocess, "CREATE_NO_WINDOW", 0)
    return kw


def prepare_subprocess_invocation(
    cmd: Sequence[str],
    *,
    allow_shell: bool = True,
) -> tuple[CmdArg, bool]:
    """
    Resolve executables and, on Windows, fall back to shell=True when needed.

    Returns (args, shell) suitable for subprocess.run / Popen.
    """
    parts = [str(x) for x in cmd]
    if not parts:
        raise FileNotFoundError("empty command")

    exe = parts[0]
    if Path(exe).is_file():
        return parts, False

    resolved = resolve_executable(exe)
    if resolved:
        parts[0] = resolved
        return parts, False

    if shutil.which(exe) or (IS_WINDOWS and shutil.which(f"{exe}.exe")):
        return parts, False

    if allow_shell and IS_WINDOWS:
        logger.debug("Windows shell fallback for missing executable: %s", exe)
        return subprocess.list2cmdline(parts), True

    raise FileNotFoundError(
        f"Executable not found: {exe!r} (not on PATH; set env override or install it)"
    )


def run_subprocess(
    cmd: Sequence[str],
    *,
    cwd: Optional[str] = None,
    timeout: Optional[float] = None,
    capture_output: bool = True,
    text: bool = True,
    check: bool = False,
    shell: Optional[bool] = None,
) -> subprocess.CompletedProcess[str]:
    """
    Run a subprocess with platform-appropriate kwargs.
    On Windows uses shell=True when the binary cannot be resolved as a direct path.
    """
    bootstrap_tool_path_env()
    use_shell = shell
    args: CmdArg = list(cmd)
    if use_shell is None:
        args, use_shell = prepare_subprocess_invocation(cmd)
    elif not use_shell:
        args, _ = prepare_subprocess_invocation(cmd, allow_shell=False)

    kwargs = subprocess_kwargs()
    return subprocess.run(
        args,
        cwd=cwd,
        capture_output=capture_output,
        text=text,
        timeout=timeout,
        check=check,
        shell=bool(use_shell),
        **kwargs,
    )


def run_subprocess_safe(
    cmd: Sequence[str],
    *,
    cwd: Optional[str] = None,
    timeout: Optional[float] = None,
    capture_output: bool = True,
    text: bool = True,
    check: bool = False,
    shell: Optional[bool] = None,
) -> tuple[Optional[subprocess.CompletedProcess[str]], Optional[str]]:
    """Like run_subprocess but returns (proc, error_message) instead of raising."""
    try:
        proc = run_subprocess(
            cmd,
            cwd=cwd,
            timeout=timeout,
            capture_output=capture_output,
            text=text,
            check=check,
            shell=shell,
        )
        return proc, None
    except FileNotFoundError as exc:
        logger.debug("Subprocess binary missing: %s", exc)
        return None, str(exc)
    except subprocess.TimeoutExpired:
        return None, f"Command timed out after {timeout}s"
    except OSError as exc:
        logger.debug("Subprocess OS error: %s", exc)
        return None, str(exc)


def popen_safe(
    cmd: Sequence[str],
    *,
    cwd: Optional[str] = None,
    shell: Optional[bool] = None,
    **popen_kwargs: Any,
) -> tuple[Optional[subprocess.Popen[Any]], Optional[str]]:
    """Start a subprocess; returns (process, error) instead of raising FileNotFoundError."""
    bootstrap_tool_path_env()
    try:
        use_shell = shell
        args: CmdArg = list(cmd)
        if use_shell is None:
            args, use_shell = prepare_subprocess_invocation(cmd)
        elif not use_shell:
            args, _ = prepare_subprocess_invocation(cmd, allow_shell=False)

        kw = subprocess_kwargs()
        kw.update(popen_kwargs)
        proc = subprocess.Popen(
            args,
            cwd=cwd,
            shell=bool(use_shell),
            **kw,
        )
        return proc, None
    except FileNotFoundError as exc:
        logger.debug("Popen binary missing: %s", exc)
        return None, str(exc)
    except OSError as exc:
        logger.debug("Popen OS error: %s", exc)
        return None, str(exc)
