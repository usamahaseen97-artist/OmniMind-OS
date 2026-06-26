# OmniMind Authentication Architecture

**Version:** Sprint 3 (3.0.0)  
**Principle:** Never expose secrets to the client; verify every session.

---

## Auth Stack Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION                              │
│  AuthButton (Supabase OAuth) · auth/callback · future passkey UI │
├─────────────────────────────────────────────────────────────────┤
│                        APPLICATION                               │
│  lib/shared/secure-session.ts · omnicore-security-api.ts         │
│  useOmniCoreBridge → authorizeAction · securitySnapshot          │
├─────────────────────────────────────────────────────────────────┤
│                        DOMAIN                                    │
│  core/security/OmniAuthEngine.ts                               │
│  core/security/OmniSessionRegistry.ts                          │
│  core/security/OmniTrustedDeviceManager.ts                     │
├─────────────────────────────────────────────────────────────────┤
│                        INFRASTRUCTURE                            │
│  backend/auth/router.py · backend/auth/security.py               │
│  backend/routers/omnicore_security.py                            │
│  middleware/jwt_interceptor.py                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Supported Providers (Architecture)

| Provider | Frontend | Backend | Status |
|----------|----------|---------|--------|
| Email/Password | `OmniAuthEngine.loginEmail` | `POST /api/v1/auth/login` | ✅ Bootstrap user |
| Passkeys (WebAuthn) | `passkeyRegisterChallenge` | `POST /auth/passkey/*/options` | Architecture |
| Google | `oauthAuthorizeUrl` + Supabase | `GET /oauth/google/authorize` | Partial (Supabase) |
| Microsoft | Placeholder | `GET /oauth/microsoft/authorize` | Architecture |
| GitHub | Placeholder | `GET /oauth/github/authorize` | Architecture |
| Apple | Placeholder | `GET /oauth/apple/authorize` | Architecture |
| SAML SSO | `ssoLoginUrl` | `GET /sso/saml/{orgId}/login` | Architecture |
| OIDC SSO | `ssoLoginUrl` | `GET /sso/oidc/{orgId}/login` | Architecture |
| Sovereign session | — | `POST /api/v1/auth/session` | ✅ Env-gated |
| Operator token | — | `POST /api/v1/auth/session-token` | ✅ Env-gated |

---

## Token Flow (JWT)

```
Client                          Backend
  │                                │
  │ POST /api/v1/auth/login        │
  │──────────────────────────────►│ verify bcrypt
  │◄──────────────────────────────│ access_token + refresh_token
  │                                │
  │ secureSession.setAccessToken   │
  │ (sessionStorage only)          │
  │                                │
  │ API call + Bearer header       │
  │──────────────────────────────►│ JWTInterceptor (if enforced)
  │                                │ decode_token(type=access)
  │◄──────────────────────────────│
  │                                │
  │ POST /api/v1/auth/refresh      │
  │──────────────────────────────►│ decode refresh token
  │◄──────────────────────────────│ new access_token
```

### Token claims

| Claim | Purpose |
|-------|---------|
| `sub` | User email or ID |
| `type` | `access` or `refresh` |
| `role` | RBAC role (`operator`, `root_operator`, etc.) |
| `exp` / `iat` | Expiry and issued-at |

**Algorithm:** HS256  
**Signing key:** `JWT_SECRET_KEY` (server only)

---

## Session Management

### Multi-device sessions (`OmniSessionRegistry`)

- Register session per device fingerprint
- `touch()` updates `lastActiveAt`
- `revoke()` / `revokeAllExcept()` for security response
- `purgeExpired()` on interval (via OmniCore bridge cleanup)

### Trusted devices (`OmniTrustedDeviceManager`)

- Fingerprint: UA length + screen dimensions (upgrade to crypto fingerprint in prod)
- Used by ABAC / zero trust: `deviceTrusted` attribute
- User can revoke devices (API Sprint 4)

---

## Client Storage Rules

| Data | Storage | Rule |
|------|---------|------|
| Access token | `sessionStorage` | Tab-scoped; cleared on close |
| Refresh token | **httpOnly cookie** (target) | Never JS-accessible |
| Password | Never stored | Transmitted once over TLS |
| API secrets | Never on client | `OmniSecretManager` blocklist |

---

## Middleware

`JWTInterceptorMiddleware` (optional via `JWT_ENFORCE_MIDDLEWARE`):

- Skips OPTIONS
- Public prefix allowlist (review for production)
- Protected prefix: `JWT_PROTECTED_PREFIX` setting
- Validates `Authorization: Bearer <access>`

---

## Integration Points

```typescript
// Domain
import { omniSecurity } from "@/core/security";
omniSecurity.auth.oauthAuthorizeUrl("google");

// OmniCore facade
omniCore.security.auth.activeSession();

// React bridge
const { authorizeAction, securitySnapshot } = useOmniCore();

// HTTP client (automatic when token present)
import { secureSession } from "@/lib/shared/secure-session";
secureSession.setAccessToken(accessToken);
```

---

## Production Checklist

- [ ] Set `JWT_SECRET_KEY` (32+ bytes random)
- [ ] Set `OMNIMIND_BOOTSTRAP_PASSWORD_HASH` (bcrypt)
- [ ] Enable `JWT_ENFORCE_MIDDLEWARE=true`
- [ ] Configure OAuth client IDs server-side only
- [ ] Move refresh tokens to httpOnly Secure SameSite cookies
- [ ] Configure SAML/OIDC metadata per org
- [ ] Enable MFA for admin roles (collaboration `mfaRequired` policy)
- [ ] Log auth events to durable store

---

*Auth UI (AuthButton) unchanged — Supabase Google OAuth continues to work in guest-configured environments.*
