# SafeRef RBAC — 3-Role Access Control Design

**Date:** 2026-04-16
**Status:** Approved, ready for implementation

## Goal

Replace the current binary admin/public auth with a 3-role system: **ADMIN**, **SALES**, **MANAGEMENT**. Each role has distinct password, distinct access scope, and role-filtered UI navigation.

## Roles & Access Matrix

| Role | Password env var | Default page after login | Access |
|------|------------------|--------------------------|--------|
| **ADMIN** (owner) | `ADMIN_PASSWORD` | `/admin` | Everything |
| **SALES** | `SALES_PASSWORD` | `/sales` | `/sales/*` |
| **MANAGEMENT** | `MANAGEMENT_PASSWORD` | `/admin/products` | `/admin/gas`, `/applications`, `/space-types`, `/products`, `/discount-matrix`, `/calc-sheets` |

**ADMIN-only (not visible to MANAGEMENT or SALES):**
- `/admin/engine`, `/admin/engine-m2` (docs)
- `/admin/testlab`, `/admin/testlab-m2` (simulators)
- `/admin/simulator`, `/admin/simulator-m2` (live calculators)
- `/admin/traceability` (audit trail)

**Public (no login required):**
- `/` (homepage)
- `/products` (public catalog)
- `/configurator` (Designer wizard)
- `/selector` (Selector wizard)
- `/login`
- `/forbidden`

## Architecture

### Storage

Passwords stored as **bcrypt hashes** in `.env.local`:
```
ADMIN_PASSWORD_HASH=$2a$10$...
SALES_PASSWORD_HASH=$2a$10$...
MANAGEMENT_PASSWORD_HASH=$2a$10$...
SESSION_SECRET=<32-byte-random>
```

No DB changes needed — `AdminUser` table becomes unused (kept for future if we add per-user accounts).

### Session Cookie

- Cookie name: `saferef-session` (renamed from `refcalc-admin-session`)
- Payload: `{ role: 'admin' | 'sales' | 'management', loggedInAt: number }`
- Signed with HMAC-SHA256 using `SESSION_SECRET`
- Validity: **7 days** (Max-Age: 604800)
- Flags: `HttpOnly`, `SameSite=Lax`, `Secure` in production

### Login Flow

1. User visits `/login`
2. Selects role in dropdown (Admin / Sales / Management)
3. Enters password
4. POST `/api/login` with `{ role, password }`
5. Server runs `bcrypt.compare(password, hashOf(role))`
6. If valid: sign cookie, set, redirect to role default page (or `?from=`)
7. If invalid: return 401 + error message

### Route Protection (Middleware)

New file: `src/middleware.ts`

Mapping:
```ts
const ROUTE_ROLES: Record<string, Role[]> = {
  // Admin-only
  '/admin': ['admin'],
  '/admin/engine': ['admin'],
  '/admin/engine-m2': ['admin'],
  '/admin/testlab': ['admin'],
  '/admin/testlab-m2': ['admin'],
  '/admin/simulator': ['admin'],
  '/admin/simulator-m2': ['admin'],
  '/admin/traceability': ['admin'],
  // Admin + Management
  '/admin/gas': ['admin', 'management'],
  '/admin/applications': ['admin', 'management'],
  '/admin/space-types': ['admin', 'management'],
  '/admin/products': ['admin', 'management'],
  '/admin/discount-matrix': ['admin', 'management'],
  '/admin/calc-sheets': ['admin', 'management'],
  // Admin + Sales
  '/sales': ['admin', 'sales'],
  '/sales/quotes': ['admin', 'sales'],
  '/sales/quotes/[id]': ['admin', 'sales'],
};
```

Logic:
- Match request path against `ROUTE_ROLES` entries (longest prefix wins)
- If path is public → allow
- If cookie missing/invalid → redirect `/login?from=<encoded-path>`
- If role not in allowlist → redirect `/forbidden`
- Otherwise → allow

### API Protection

Replace `requireAdmin()` with `requireRole(allowedRoles: Role[])`:

| Endpoint | GET | POST/PUT/DELETE |
|----------|-----|-----------------|
| `/api/products` | public | `['admin', 'management']` |
| `/api/refrigerants-v5` | public | `['admin', 'management']` |
| `/api/applications` | public | `['admin', 'management']` |
| `/api/space-types` | public | `['admin', 'management']` |
| `/api/discount-matrix` | public | `['admin', 'management']` |
| `/api/calc-sheets` | public | `['admin', 'management']` |
| `/api/quotes` (+[id]) | public | `['admin', 'sales']` |
| `/api/quote-pdf/[id]` | public | N/A |
| `/api/gas-categories` | public | N/A |
| `/api/login` | N/A | public |

### UI Changes

**Admin nav** (`src/app/admin/nav.tsx`):
- Read session role server-side via server action or async component
- Filter `links[]` array based on role
- Add role badge: `🔴 ADMIN` / `🟢 MANAGEMENT`
- Add `Logout` button → POST `/api/logout` → redirect `/`

**Sales layout** (`src/app/sales/layout.tsx`):
- Add role badge `🔵 SALES` (or 🔴 ADMIN if admin is using sales)
- Add `Logout` button
- If role=admin, show link to `/admin`

**Login page** (`src/app/(auth)/login/page.tsx`):
- Replace email/password form with:
  - Role dropdown (Admin / Sales / Management)
  - Password input
  - Submit button
- On success: redirect to role default or `?from=` URL
- On error: show "Invalid password" message

**Forbidden page** (`src/app/forbidden/page.tsx`, new):
- Static page: "Access denied — this section is restricted"
- Button: "Back to [role's default page]"

### Removed/Changed

- `src/app/api/login/route.ts`: rewrite to use env vars + bcrypt
- `src/lib/auth.ts`: rename `requireAdmin` → `requireRole`, extend to check role array
- Cookie name change: old `refcalc-admin-session` cookies become invalid (users re-login once)

## Testing

- Unit tests for `signSession` / `verifySession` with role field
- Unit tests for `requireRole(['admin'])` allows admin, blocks others
- Integration test: POST `/api/login` with correct password → 200 + cookie
- Integration test: POST `/api/login` with wrong password → 401
- Integration test: access protected route without cookie → 401
- Integration test: access admin-only route as sales → 403

## Files Touched

**New:**
- `src/middleware.ts`
- `src/app/forbidden/page.tsx`
- `src/app/api/logout/route.ts`
- `scripts/hash-password.mjs` (helper to generate hashes for env)
- `src/lib/__tests__/auth.test.ts`

**Modified:**
- `src/lib/auth.ts`
- `src/app/api/login/route.ts`
- `src/app/(auth)/login/page.tsx`
- `src/app/admin/nav.tsx`
- `src/app/admin/layout.tsx` (add role badge + logout)
- `src/app/sales/layout.tsx`
- `src/app/api/products/route.ts`
- `src/app/api/refrigerants-v5/route.ts`
- `src/app/api/applications/route.ts`
- `src/app/api/space-types/route.ts`
- `src/app/api/discount-matrix/route.ts`
- `src/app/api/calc-sheets/route.ts`
- `src/app/api/quotes/route.ts`
- `src/app/api/quotes/[id]/route.ts`
- `.env.example` (add 4 new vars)

## Migration Steps (for the user)

1. Generate 3 bcrypt hashes via `node scripts/hash-password.mjs <password>`
2. Add to `.env.local`:
   ```
   ADMIN_PASSWORD_HASH=$2a$10$...
   SALES_PASSWORD_HASH=$2a$10$...
   MANAGEMENT_PASSWORD_HASH=$2a$10$...
   SESSION_SECRET=<random>
   ```
3. Restart server
4. Old admin cookies become invalid → re-login with role dropdown
