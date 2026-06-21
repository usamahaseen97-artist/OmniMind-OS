"""
Optional LM Studio smoke test — NOT the FastAPI server.
Run the API with:  uvicorn main:app --reload --host 127.0.0.1 --port 8001

Usage:
  python app.py
"""
from __future__ import annotations

import os
import sys

from dotenv import load_dotenv

load_dotenv()


def main() -> int:
    base_url = (
        os.getenv("OPENAI_BASE_URL")
        or os.getenv("LM_STUDIO_URL")
        or os.getenv("LOCAL_LLM_URL")
        or "http://127.0.0.1:1234/v1"
    ).rstrip("/")

    api_key = os.getenv("OPENAI_API_KEY") or "lm-studio"
    model = os.getenv("LM_STUDIO_MODEL") or "meta-llama-3-8b-instruct"

    print(f"Testing LM Studio at {base_url} ...")

    try:
        from openai import OpenAI

        client = OpenAI(base_url=base_url, api_key=api_key, timeout=30.0)
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Say hello in one short sentence."}],
            max_tokens=64,
        )
        print("OK:", response.choices[0].message.content)
        return 0
    except Exception as exc:
        print("Connection failed:", type(exc).__name__, str(exc)[:200])
        print("\nChecklist:")
        print("  1. Open LM Studio and load a model")
        print("  2. Start Server on port 1234 (not 12341)")
        print("  3. Set in .env: OPENAI_BASE_URL=http://127.0.0.1:1234/v1")
        print("  4. Start API: uvicorn main:app --reload --host 127.0.0.1 --port 8001")
        return 1


if __name__ == "__main__":
    sys.exit(main())
