"""
CrewAI + LangChain agents powered by Google Gemini 1.5 Pro.

Requires GEMINI_API_KEY in backend/.env (or GOOGLE_API_KEY in the shell).
"""

from __future__ import annotations

import base64
import mimetypes
import os
from pathlib import Path
from typing import Sequence

from config import get_settings
from services.api_keys import get_key

# CrewAI reads GOOGLE_API_KEY; OmniMind stores GEMINI_API_KEY in backend/.env.
_GEMINI_KEY = get_key("GEMINI_API_KEY") or get_key("GOOGLE_API_KEY")
if _GEMINI_KEY:
    os.environ.setdefault("GOOGLE_API_KEY", _GEMINI_KEY)
    os.environ.setdefault("GEMINI_API_KEY", _GEMINI_KEY)

AGENT_GEMINI_MODEL_DEFAULT = "gemini-1.5-flash"
GEMINI_CHAT_MODEL_CANDIDATES = ("gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-flash")


def resolve_agent_gemini_model() -> str:
    """Prefer AGENT_GEMINI_MODEL, then GEMINI_MODEL from .env, then default."""
    settings = get_settings()
    return (
        os.getenv("AGENT_GEMINI_MODEL", "").strip()
        or settings.gemini_model.strip()
        or AGENT_GEMINI_MODEL_DEFAULT
    )


def _require_api_key() -> str:
    key = get_key("GEMINI_API_KEY") or get_key("GOOGLE_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
    if not key.strip():
        raise RuntimeError(
            "Set GEMINI_API_KEY in backend/.env or export GOOGLE_API_KEY in your terminal."
        )
    return key.strip()


def get_langchain_gemini_llm(*, temperature: float = 0.4):
    """LangChain ChatGoogleGenerativeAI — supports multimodal (text + images)."""
    from langchain_google_genai import ChatGoogleGenerativeAI

    return ChatGoogleGenerativeAI(
        model=resolve_agent_gemini_model(),
        google_api_key=_require_api_key(),
        temperature=temperature,
        verbose=False,
    )


def get_crewai_gemini_llm(*, temperature: float = 0.4):
    """CrewAI LLM wrapper for Gemini 1.5 Pro."""
    try:
        from crewai import LLM
    except ImportError as exc:
        raise RuntimeError(
            "CrewAI is not installed. Use Python 3.10–3.13 (not 3.14), then run: "
            "pip install -r requirements-agents.txt"
        ) from exc

    model = resolve_agent_gemini_model()
    return LLM(
        model=f"gemini/{model}",
        api_key=_require_api_key(),
        temperature=temperature,
    )


def _image_part(path: str | Path) -> dict:
    """Build a Gemini/LangChain vision content block from a local image file."""
    p = Path(path)
    if not p.is_file():
        raise FileNotFoundError(f"Image not found: {p}")
    mime, _ = mimetypes.guess_type(p.name)
    mime = mime or "image/jpeg"
    b64 = base64.b64encode(p.read_bytes()).decode("ascii")
    return {
        "type": "image_url",
        "image_url": {"url": f"data:{mime};base64,{b64}"},
    }


def analyze_multimodal_inputs(
    text: str,
    image_paths: Sequence[str | Path] | None = None,
) -> str:
    """
    Run Gemini 1.5 Pro vision on text + optional images.
    Returns a concise context string for the researcher agent.
    """
    from langchain_core.messages import HumanMessage

    llm = get_langchain_gemini_llm(temperature=0.2)
    parts: list[dict | str] = [
        {
            "type": "text",
            "text": (
                "Summarize what you see and extract facts useful for research. "
                "User input:\n"
                f"{text.strip()}"
            ),
        }
    ]
    for img in image_paths or []:
        parts.append(_image_part(img))

    if len(parts) == 1:
        parts[0] = {
            "type": "text",
            "text": f"Summarize key points for research from:\n{text.strip()}",
        }

    response = llm.invoke([HumanMessage(content=parts)])
    content = getattr(response, "content", response)
    return str(content).strip()


def create_researcher_agent():
    """CrewAI researcher — uses Gemini 1.5 Pro; pair with analyze_multimodal_inputs for images."""
    try:
        from crewai import Agent
    except ImportError as exc:
        raise RuntimeError(
            "CrewAI is not installed. Use Python 3.10–3.13 (not 3.14), then run: "
            "pip install -r requirements-agents.txt"
        ) from exc

    return Agent(
        role="Senior Multimodal Researcher",
        goal=(
            "Deliver accurate, well-structured research from user questions and any "
            "supplied visual context (charts, screenshots, documents)."
        ),
        backstory=(
            "You are an expert analyst who combines web-grade reasoning with careful "
            "reading of images. You cite assumptions, separate facts from inference, "
            "and write clear answers in the user's language (Urdu or English)."
        ),
        llm=get_crewai_gemini_llm(temperature=0.35),
        verbose=True,
        allow_delegation=False,
    )


def run_research_langchain_only(
    query: str,
    *,
    image_paths: Sequence[str | Path] | None = None,
) -> str:
    """Gemini 1.5 Pro via LangChain when CrewAI is unavailable (e.g. Python 3.14)."""
    from langchain_core.messages import HumanMessage

    llm = get_langchain_gemini_llm(temperature=0.35)
    if image_paths:
        vision = analyze_multimodal_inputs(query, image_paths)
        prompt = (
            f"{query.strip()}\n\n--- Visual context ---\n{vision}\n\n"
            "Write a clear research brief with key findings and next steps."
        )
    else:
        prompt = (
            f"{query.strip()}\n\n"
            "Write a clear research brief with key findings and next steps."
        )
    response = llm.invoke([HumanMessage(content=prompt)])
    content = getattr(response, "content", response)
    return str(content).strip()


def run_research_task(
    query: str,
    *,
    image_paths: Sequence[str | Path] | None = None,
) -> tuple[str, str]:
    """
    Run researcher pipeline. Returns (report_text, engine) where engine is
    'crewai' or 'langchain'.
    """
    try:
        text = run_researcher_task(query, image_paths=image_paths)
        return text, "crewai"
    except ImportError:
        return run_research_langchain_only(query, image_paths=image_paths), "langchain"
    except RuntimeError as exc:
        if "CrewAI" not in str(exc):
            raise
        return run_research_langchain_only(query, image_paths=image_paths), "langchain"


def run_researcher_task(
    query: str,
    *,
    image_paths: Sequence[str | Path] | None = None,
) -> str:
    """
    Run a single researcher task. Handles multimodal input by pre-analyzing images
    with LangChain + Gemini vision, then passing context to CrewAI.
    """
    from crewai import Crew, Process, Task

    vision_context = ""
    if image_paths:
        vision_context = analyze_multimodal_inputs(query, image_paths)

    description = query.strip()
    if vision_context:
        description = (
            f"{query.strip()}\n\n"
            "--- Visual context (from attached images) ---\n"
            f"{vision_context}"
        )

    researcher = create_researcher_agent()
    task = Task(
        description=description,
        expected_output=(
            "A clear research brief with: key findings, bullet summary, "
            "and 2-3 suggested next steps."
        ),
        agent=researcher,
    )
    crew = Crew(
        agents=[researcher],
        tasks=[task],
        process=Process.sequential,
        verbose=True,
    )
    result = crew.kickoff()
    return str(result).strip()


if __name__ == "__main__":
    import sys

    get_settings()  # load backend/.env
    prompt = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "What is CrewAI?"
    text, engine = run_research_task(prompt)
    print(f"[{engine}]\n{text}")
