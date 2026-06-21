from __future__ import annotations

from dataclasses import dataclass


@dataclass
class CompressionResult:
    compressed_text: str
    token_estimate: int
    chunks: int


def estimate_tokens(text: str) -> int:
    # Lightweight estimate for async context guards.
    return max(1, len(text) // 4)


def truncate_and_compress(text: str, max_tokens: int = 12000) -> CompressionResult:
    token_est = estimate_tokens(text)
    if token_est <= max_tokens:
        return CompressionResult(compressed_text=text, token_estimate=token_est, chunks=1)

    max_chars = max_tokens * 4
    trimmed = text[:max_chars]
    # Placeholder for future semantic summarization pass (LangChain map-reduce).
    summary = trimmed + "\n\n[context truncated by core-python compression guard]"
    return CompressionResult(
        compressed_text=summary,
        token_estimate=estimate_tokens(summary),
        chunks=2,
    )
