from __future__ import annotations

import secrets
from datetime import datetime, timezone
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db import get_db
from app.models import OAuthAccount, RefreshToken, User
from app.redis_client import cache_delete, cache_get_json, cache_set_json
from app.schemas import GitHubLoginResponse, LoginBody, RefreshBody, SignupBody, TokenResponse
from app.security import (
    create_access_token,
    create_refresh_token_value,
    hash_password,
    hash_refresh_token,
    refresh_token_expires_at,
    verify_password,
)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"


async def _issue_tokens(user_id: str, db: AsyncSession) -> TokenResponse:
    access = create_access_token(user_id)
    refresh_value = create_refresh_token_value()
    db.add(
        RefreshToken(
            user_id=user_id,
            token_hash=hash_refresh_token(refresh_value),
            expires_at=refresh_token_expires_at(),
        )
    )
    await db.commit()
    return TokenResponse(access_token=access, refresh_token=refresh_value)


@router.post("/signup", response_model=TokenResponse)
async def signup(body: SignupBody, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    exists = await db.scalar(select(User).where(User.email == body.email))
    if exists:
        raise HTTPException(status_code=409, detail="Email already exists")
    user = User(email=body.email, password_hash=hash_password(body.password))
    db.add(user)
    await db.flush()
    return await _issue_tokens(user.id, db)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginBody, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    user = await db.scalar(select(User).where(User.email == body.email))
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return await _issue_tokens(user.id, db)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshBody, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    token_hash = hash_refresh_token(body.refresh_token)
    row = await db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked_at.is_(None),
        )
    )
    if not row or row.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    row.revoked_at = datetime.now(timezone.utc)
    return await _issue_tokens(row.user_id, db)


@router.get("/github/login", response_model=GitHubLoginResponse)
async def github_login() -> GitHubLoginResponse:
    if not settings.github_client_id:
        raise HTTPException(status_code=503, detail="GitHub OAuth is not configured")
    state = secrets.token_urlsafe(24)
    await cache_set_json(f"github_oauth_state:{state}", {"ok": True}, ttl_seconds=600)
    params = {
        "client_id": settings.github_client_id,
        "redirect_uri": settings.github_oauth_callback,
        "scope": "read:user user:email repo",
        "state": state,
    }
    return GitHubLoginResponse(auth_url=f"{GITHUB_AUTH_URL}?{urlencode(params)}")


@router.get("/github/callback")
async def github_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    if not settings.github_client_id or not settings.github_client_secret:
        raise HTTPException(status_code=503, detail="GitHub OAuth is not configured")

    cached = await cache_get_json(f"github_oauth_state:{state}")
    if not cached:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")
    await cache_delete(f"github_oauth_state:{state}")

    async with httpx.AsyncClient(timeout=20) as client:
        token_res = await client.post(
            GITHUB_TOKEN_URL,
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": settings.github_oauth_callback,
            },
        )
        token_res.raise_for_status()
        token_data = token_res.json()
        gh_access = token_data.get("access_token")
        if not gh_access:
            raise HTTPException(status_code=400, detail="GitHub token exchange failed")

        user_res = await client.get(
            GITHUB_USER_URL,
            headers={"Authorization": f"Bearer {gh_access}", "Accept": "application/json"},
        )
        user_res.raise_for_status()
        gh_user = user_res.json()

        email = gh_user.get("email")
        if not email:
            emails_res = await client.get(
                GITHUB_EMAILS_URL,
                headers={"Authorization": f"Bearer {gh_access}", "Accept": "application/json"},
            )
            emails_res.raise_for_status()
            for item in emails_res.json():
                if item.get("primary") and item.get("verified"):
                    email = item.get("email")
                    break
            if not email and emails_res.json():
                email = emails_res.json()[0].get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Unable to resolve GitHub email")

    gh_id = str(gh_user["id"])
    oauth = await db.scalar(
        select(OAuthAccount).where(OAuthAccount.provider == "github", OAuthAccount.provider_user_id == gh_id)
    )
    if oauth:
        user = await db.scalar(select(User).where(User.id == oauth.user_id))
    else:
        user = await db.scalar(select(User).where(User.email == email))
        if not user:
            user = User(
                email=email,
                password_hash=None,
                display_name=gh_user.get("name") or gh_user.get("login"),
                avatar_url=gh_user.get("avatar_url"),
            )
            db.add(user)
            await db.flush()
        oauth = OAuthAccount(
            user_id=user.id,
            provider="github",
            provider_user_id=gh_id,
            access_token=gh_access,
            refresh_token=token_data.get("refresh_token"),
        )
        db.add(oauth)

    oauth.access_token = gh_access
    oauth.refresh_token = token_data.get("refresh_token") or oauth.refresh_token
    user.display_name = user.display_name or gh_user.get("name") or gh_user.get("login")
    user.avatar_url = gh_user.get("avatar_url") or user.avatar_url
    await db.flush()

    tokens = await _issue_tokens(user.id, db)
    redirect_url = (
        f"{settings.frontend_origin}/auth/callback"
        f"?access_token={tokens.access_token}&refresh_token={tokens.refresh_token or ''}"
    )
    return RedirectResponse(url=redirect_url, status_code=302)
