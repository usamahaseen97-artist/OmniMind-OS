from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class SignupBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginBody(SignupBody):
    pass


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"


class RefreshBody(BaseModel):
    refresh_token: str = Field(min_length=16, max_length=512)


class GitHubLoginResponse(BaseModel):
    auth_url: str


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)


class FileUpsert(BaseModel):
    path: str = Field(min_length=1, max_length=1024)
    content: str = ""
    language: str = "plaintext"


class ChatBody(BaseModel):
    project_id: str
    message: str = Field(min_length=1, max_length=32000)
    provider_hint: str | None = None
    use_free_pipeline: bool = False
