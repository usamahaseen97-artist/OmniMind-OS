"""400 responses with explicit validation reasons (no vague errors)."""

from __future__ import annotations

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError


def format_validation_errors(exc: RequestValidationError | ValidationError) -> list[dict[str, str]]:
    items = []
    for err in exc.errors():
        loc = ".".join(str(x) for x in err.get("loc", ()))
        items.append(
            {
                "field": loc or "body",
                "message": err.get("msg", "invalid"),
                "type": err.get("type", "value_error"),
            }
        )
    return items


def validation_error_response(
    exc: RequestValidationError | ValidationError,
    *,
    path: str,
) -> JSONResponse:
    errors = format_validation_errors(exc)
    return JSONResponse(
        status_code=400,
        content={
            "error": "validation_failed",
            "detail": "Request data failed strict validation. Fix the fields below.",
            "errors": errors,
            "path": path,
        },
    )


async def request_validation_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return validation_error_response(exc, path=str(request.url.path))


async def pydantic_validation_handler(request: Request, exc: ValidationError) -> JSONResponse:
    return validation_error_response(exc, path=str(request.url.path))
