"""Enterprise API exceptions."""

from __future__ import annotations


class PlatformError(Exception):
    """Base platform error with HTTP mapping."""

    def __init__(
        self,
        detail: str,
        *,
        error: str = "platform_error",
        status_code: int = 400,
    ) -> None:
        super().__init__(detail)
        self.detail = detail
        self.error = error
        self.status_code = status_code


class PlatformAuthError(PlatformError):
    def __init__(self, detail: str = "Authentication required") -> None:
        super().__init__(detail, error="unauthorized", status_code=401)


class PlatformForbiddenError(PlatformError):
    def __init__(self, detail: str = "Permission denied") -> None:
        super().__init__(detail, error="forbidden", status_code=403)


class PlatformNotFoundError(PlatformError):
    def __init__(self, detail: str = "Resource not found") -> None:
        super().__init__(detail, error="not_found", status_code=404)
