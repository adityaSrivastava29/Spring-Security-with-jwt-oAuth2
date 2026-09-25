# Spring Security 6, JWT & OAuth2: Architectural Blueprint & Learning Notes

A comprehensive reference guide for mastering modern stateless authentication, social identity integration (OAuth2), and granular Role-Based Access Control (RBAC) in Spring Boot 3+ and React.

---

## 1. Spring Security 6 Internal Architecture

### 1.1 The DelegatingFilterProxy and SecurityFilterChain
Spring Security operates as a series of servlet filters positioned before your controllers:
```
Client Request
     │
     ▼
[Servlet Container / Tomcat]
     │
     ▼
[DelegatingFilterProxy]  ──► Bridges standard servlet filter lifecycle to Spring ApplicationContext
     │
     ▼
[FilterChainProxy]       ──► Evaluates SecurityFilterChain beans
     │
     ├──► 1. CorsFilter (Validates Origin and Allowed Methods/Headers)
     ├──► 2. CsrfFilter (Disabled for stateless Bearer APIs)
     ├──► 3. JwtAuthFilter (Extracts 'Bearer <token>', validates, populates SecurityContext)
     ├──► 4. UsernamePasswordAuthenticationFilter (Used for form login / bypassed in JWT)
     ├──► 5. OAuth2LoginAuthenticationFilter (Intercepts /login/oauth2/code/*)
     └──► 6. AuthorizationFilter (Enforces URL matchers: permitAll(), hasRole())
     │
     ▼
[DispatcherServlet] ──► Controller (@PreAuthorize method checks)
```

### 1.2 The SecurityContextHolder Lifecycle
- **Stateless Guarantee:** When `sessionCreationPolicy(SessionCreationPolicy.STATELESS)` is configured, Spring never writes a `JSESSIONID` cookie and never stores security context in `HttpSession`.
- **Per-Request Context:** Every incoming request arrives without an established security context.
- **The JwtAuthFilter Contract:**
  1. Inspect header `Authorization: Bearer <token>`.
  2. If missing or invalid, do not throw an error; let the filter chain proceed.
  3. If valid, build a `UsernamePasswordAuthenticationToken(userPrincipal, null, authorities)` and commit it to:
     ```java
     SecurityContextHolder.getContext().setAuthentication(authenticationToken);
     ```
  4. At the end of the request, `SecurityContextPersistenceFilter` / `SecurityContextHolderFilter` cleans the thread-local storage to prevent cross-request thread pollution.

---

## 2. JWT Architecture: Access Tokens vs. Refresh Tokens

### 2.1 The Two-Token Security Model

| Property | Access Token | Refresh Token |
| :--- | :--- | :--- |
| **Lifespan** | Ephemeral (15 minutes) | Extended (7 days) |
| **Storage Location** | Client Redux/React Memory | HttpOnly, Secure, SameSite=Strict Cookie |
| **XSS Vulnerability** | **Immune** to persistence (wiped on page close) | **Immune** (JavaScript cannot read HttpOnly) |
| **CSRF Vulnerability** | **Immune** (sent via `Authorization: Bearer`) | Protected via SameSite and token rotation |
| **Database Check** | None (stateless cryptographic signature check) | Validated against database for revocation |

### 2.2 Why Access Tokens Must NEVER Reside in `localStorage`
- Storing access tokens in `localStorage` or `sessionStorage` exposes them to any Third-Party script, CDN vulnerability, or Cross-Site Scripting (XSS) payload.
- By holding the access token **only in React/Redux memory**, an attacker cannot siphon tokens across sessions.
- When the page is reloaded, the application triggers a silent refresh using the HttpOnly cookie.

### 2.3 Refresh Token Rotation (RTR) & Mutex Locks
To prevent replay attacks if a refresh token is compromised:
1. Every time `/api/v1/auth/refresh` is invoked, the used refresh token is invalidated or deleted.
2. A brand-new refresh token is issued and set back into the HttpOnly cookie.
3. **Frontend Mutex Protection:** If a user makes 5 parallel API calls when the access token expires, all 5 could attempt refresh simultaneously. Without concurrency controls, the first request invalidates the refresh token, causing the other 4 to fail. An `async-mutex` ensures only one refresh request fires while others wait and queue.

---

## 3. Google OAuth2 Social Login Integration

### 3.1 Authorization Code Flow with PKCE
```
User Browser                  Spring Boot Backend (:8080)            Google Auth Server
     │                                    │                                  │
     │ ── 1. "Sign in with Google" ─────► │                                  │
     │                                    │ ── 2. Redirect to Google Auth ──►│
     │ ◄── 3. Google Login Screen ───────────────────────────────────────────│
     │ ── 4. User Consents Credentials ─────────────────────────────────────►│
     │                                    │ ◄── 5. Redirect code to Backend ─│
     │                                    │ ── 6. Exchange code for UserInfo►│
     │                                    │ ◄── 7. Profile Payload ──────────│
     │                                    │ (CustomOAuth2UserService: provision/update)
     │                                    │ (OAuth2SuccessHandler: issue HttpOnly cookie)
     │ ◄── 8. Redirect to /oauth2/redirect?token=<jwt> ─────────────────────│
     │ (OAuth2Redirect.tsx extracts JWT into memory)
     │ ── 9. Navigate to /dashboard ─────►│
```

### 3.2 Automated User Provisioning (`CustomOAuth2UserService`)
When an external OAuth2 provider returns a verified email:
1. Check if a local `UserEntity` exists by email.
2. If absent: create a new user entity with `provider = AuthProvider.GOOGLE`, default `ROLE_USER`, and account type `B2C`.
3. If present: update profile metadata (name, avatar) without overwriting locally configured passwords.

---

## 4. Granular RBAC and Method Security

### 4.1 Roles vs. Authorities in Spring Security
- Spring Security enforces that roles are prefixed with `ROLE_` internally:
  - `hasRole('ADMIN')` looks for authority `ROLE_ADMIN`.
  - `hasAuthority('ROLE_ADMIN')` checks for the literal authority string.
- Never mix raw role names and `ROLE_` prefixes inconsistently.

### 4.2 Multi-Tier B2B vs. B2C Access Separation
In enterprise SaaS systems, authorization extends beyond simple admin checks:
```java
@GetMapping("/b2b-data")
public ResponseEntity<ApiResponse<Map<String, Object>>> getB2BData(Principal principal) {
    UserDto user = userService.getUserProfile(principal.getName());
    boolean isB2B = user.getAccountType() == AccountType.B2B || user.getRoles().contains("ROLE_ADMIN");
    if (!isB2B) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(...);
    }
    return ResponseEntity.ok(...);
}
```

### 4.3 Declarative Method Security (`@PreAuthorize`)
Enabled via `@EnableMethodSecurity(prePostEnabled = true)`:
```java
// Protected against any user without the required role
@GetMapping("/audit-vault")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<ApiResponse<Map<String, Object>>> getAuditVault(Principal principal) {
    // Business logic
}
```
When a non-admin triggers this route, Spring throws `AccessDeniedException`, which is intercepted by your `@RestControllerAdvice` to emit a standardized `403 Forbidden` response.

---

## 5. Security Best Practices & Hardening Checklist

### 5.1 Password Hashing
- Use `BCryptPasswordEncoder` with strength $\ge 12$ or `Argon2PasswordEncoder`.
- Never store raw passwords, MD5, or SHA-1 hashes.

### 5.2 Cookie Hardening
```java
ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
        .httpOnly(true)
        .secure(false) // Set to true in production with HTTPS
        .sameSite("Strict")
        .path("/")
        .maxAge(Duration.ofDays(7))
        .build();
```

### 5.3 CORS Defense
- Never use `allowedOrigins("*")` alongside `allowCredentials(true)`. Browsers strictly reject wildcards with credentials.
- Explicitly whitelist trusted frontend client domains:
  ```java
  configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174", "https://yourdomain.com"));
  configuration.setAllowCredentials(true);
  ```

### 5.4 Production Secrets Strategy
- Never commit active Google Client Secrets or JWT Private Keys to source control.
- Read secrets from environment variables with fallback defaults for local development:
  ```properties
  spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID:placeholder}
  jwt.secret=${JWT_SECRET:your-256-bit-secret-key-minimum-32-characters}
  ```
