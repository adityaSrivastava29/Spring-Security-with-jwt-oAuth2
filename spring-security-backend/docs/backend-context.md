# Backend Architecture & Security Context Specification

## 1. Project Overview & Tech Stack
* **Framework:** Spring Boot 3.x / Java 17+
* **Security & Auth:** Spring Security 6, `jjwt` (Java JWT), Spring Boot OAuth2 Client
* **Data Access:** Spring Data JPA, Hibernate, Relational DB (PostgreSQL / MySQL)
* **Base Package:** `in.adityasri.spring_security_backend`
* **Companion Frontend:** React (Vite) client using Redux Toolkit + RTK Query running on `http://localhost:5173`

---

## 2. Package Architecture

Ensure all code follows this package hierarchy strictly under `src/main/java/in/adityasri/spring_security_backend/`:

```text
in.adityasri.spring_security_backend/
├── advices/               # GlobalExceptionHandler, ApiError, ApiResponse<T>
├── config/                # SecurityConfig, WebMvcConfig (CORS), AppConfig (PasswordEncoder)
│   └── oauth2/            # OAuth2SuccessHandler, CustomOAuth2UserService
├── controllers/           # AuthController, UserController, AdminController
├── dto/                   # LoginRequestDto, SignupRequestDto, AuthResponseDto, UserDto
├── entities/              # UserEntity, RoleEntity (or Role enum), RefreshTokenEntity
├── exceptions/            # ResourceNotFoundException, BadCredentialsException, CustomAuthExceptions
├── filters/               # JwtAuthFilter (extends OncePerRequestFilter)
├── repositories/          # UserRepository, RoleRepository, RefreshTokenRepository
├── services/              # AuthService, UserService, JwtService, RefreshTokenService
└── SpringSecurityBackendApplication.java
```

---

## 3. Security & Architecture Guidelines

### Stateless Security Chain (`SecurityConfig`)
* Set `SessionCreationPolicy.STATELESS`.
* Disable CSRF (REST APIs use Bearer tokens for authenticated endpoints + strict SameSite cookie policies).
* Enable method security via `@EnableMethodSecurity(prePostEnabled = true)` for fine-grained authorization (e.g., `@PreAuthorize("hasRole('ADMIN')")`).
* Register `JwtAuthFilter` strictly before `UsernamePasswordAuthenticationFilter`.
* Configure CORS explicitly:
  * Allowed Origins: `http://localhost:5173` (Vite dev server)
  * Allowed Methods: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`
  * Allowed Headers: `Authorization`, `Content-Type`, `X-Requested-With`, `Accept`
  * `allowCredentials(true)` enabled to support cookies.

### Token Lifecycle & Management
* **Access Token:**
  * Short-lived (10–15 minutes).
  * Signed via HMAC-SHA256 (`Keys.hmacShaKeyFor`).
  * Claims include user ID, email/username, and authorities (`ROLE_USER`, `ROLE_MODERATOR`, `ROLE_ADMIN`).
  * Emitted in response body upon login/refresh.
* **Refresh Token:**
  * Long-lived (7 days).
  * Stored in the database with user association, expiration date, and revocation tracking.
  * Transmitted exclusively via an `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/api/v1/auth` cookie named `refreshToken`.
  * **Rotation:** Every call to `/api/v1/auth/refresh` revokes/deletes the old refresh token, persists a new one, and re-issues both a fresh access token in the response body and the new cookie.
* **Logout (`/api/v1/auth/logout`):**
  * Revokes the DB refresh token record and clears the cookie (`Max-Age=0`).

### Google OAuth2 Flow
* User triggers login via backend endpoint: `/oauth2/authorization/google`.
* Upon Google callback, `OAuth2SuccessHandler`:
  1. Extracts user details (email, full name, Google subject ID).
  2. Upserts user in `UserRepository` (auto-registers with `ROLE_USER` if first-time login).
  3. Creates and saves a new `RefreshTokenEntity`.
  4. Sets the `refreshToken` `HttpOnly` cookie.
  5. Redirects the browser back to React frontend: `http://localhost:5173/oauth2/redirect`.

### Error Handling & Validation
* Enforce validation on all DTOs (`@Valid`, `@NotBlank`, `@Email`, `@Size`).
* Centralize all exception processing in `advices/GlobalExceptionHandler` using `@RestControllerAdvice`.
* Return standardized error envelopes (`ApiError` with timestamp, status code, error message, and validation details).
* Never expose raw database entities directly from controller endpoints.