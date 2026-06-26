"""Centralized exception handlers for enterprise API surface."""

from __future__ import annotations

import logging

from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from lib.enterprise.exceptions import PlatformError
from lib.enterprise.responses import api_error
from services.validation_handlers import validation_error_response

logger = logging.getLogger(__name__)


async def platform_error_handler(request: Request, exc: PlatformError) -> JSONResponse:
    logger.warning("platform_error path=%s error=%s", request.url.path, exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content=api_error(error=exc.error, detail=exc.detail, status_code=exc.status_code),
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=api_error(
            error="http_error",
            detail=str(exc.detail),
            status_code=exc.status_code,
        ),
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("unhandled_exception path=%s", request.url.path)
    return JSONResponse(
        status_code=500,
        content=api_error(
            error="internal_error",
            detail="Internal server error",
            status_code=500,
        ),
    )


async def enterprise_validation_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return validation_error_response(exc, path=str(request.url.path))


async def enterprise_pydantic_handler(request: Request, exc: ValidationError) -> JSONResponse:
    return validation_error_response(exc, path=str(request.url.path))
