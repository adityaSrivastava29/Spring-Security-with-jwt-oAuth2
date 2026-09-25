# AuthShield — Spring Security 6 & React RBAC Architecture

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring%20Security-6.x-6DB33F.svg)](https://spring.io/projects/spring-security)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-RTK%20Query-764ABC.svg)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![GitHub Stars](https://img.shields.io/github/stars/adityaSrivastava29/Spring-Security-with-jwt-oAuth2?style=flat&logo=github&color=ffd700)](https://github.com/adityaSrivastava29/Spring-Security-with-jwt-oAuth2/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-grade, full-stack reference implementation demonstrating **Stateless JWT Authentication**, **Google OAuth2 Social Login**, **HttpOnly Refresh Token Rotation with Mutex Protection**, **Granular Role-Based Access Control (RBAC)**, and **Multi-Tier B2B/B2C Account Separation**.

Frontend crafted using a curated **Claymorphism / Tech SaaS Design System** adhering to WCAG AA accessibility standards, featuring **Light Theme by default** and an interactive **Dark Theme Switcher**.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │          React 19 + Vite Client        │
                      │  - In-Memory Access Tokens (Redux)     │
                      │  - Silent Cookie Re-Auth (Mutex Lock)  │
                      │  - Granular Route Guards & UI Badges   │
                      │  - Claymorphic Design (Light / Dark)   │
                      └──────────────────┬─────────────────────┘
                                         │
                   Bearer JWT (Header)   │   HttpOnly Cookie (Strict)
                   + REST API Requests   │   + OAuth2 Handshake
                                         ▼
                      ┌────────────────────────────────────────┐
                      │       Spring Boot 3 REST Backend       │
                      │  - Spring Security 6 Filter Chain      │
                      │  - JwtAuthFilter (Stateless)           │
                      │  - CustomOAuth2UserService (Google)    │
                      │  - Method Security (@PreAuthorize)     │
                      │  - Global Exception Handling (403/401) │
                      └──────────────────┬─────────────────────┘
                                         │
                                         ▼
                      ┌────────────────────────────────────────┐
                      │          PostgreSQL Database           │
                      │  - Users, Roles, Account Tiers         │
                      │  - Cryptographic Refresh Tokens        │
                      └────────────────────────────────────────┘
```

---

## Key Security Features

1. **In-Memory JWT Access Token Storage:**
   - Access tokens are stored strictly in Redux memory. They are **never** persisted to `localStorage` or `sessionStorage`, eliminating persistent XSS token theft vectors.
2. **HttpOnly Refresh Token Rotation (RTR):**
   - Refresh tokens are written to `HttpOnly`, `SameSite=Strict` cookies that JavaScript cannot read. Each refresh cycle revokes the old token and issues a fresh pair.
3. **Async-Mutex Concurrency Lock:**
   - Client RTK Query `baseQueryWithReauth` uses an `async-mutex` to prevent duplicate parallel refresh requests when tokens expire under heavy traffic.
4. **Google OAuth2 Social Login:**
   - Authorization code exchange via Spring Security's `oauth2Login()`.
   - `CustomOAuth2UserService` performs automated account provisioning.
   - `OAuth2SuccessHandler` issues HttpOnly cookies and redirects to `/oauth2/redirect`.
5. **Multi-Tier RBAC (B2B vs. B2C):**
   - Accounts are segmented into `B2B` (Enterprise corporate quotas, dedicated SLA metrics) and `B2C` (Retail loyalty rewards).
6. **Graceful In-Page 403 Access Denied States:**
   - Routes like `/audit-vault` are visible in navigation to normal users, but when accessed, backend method security enforces `@PreAuthorize("hasRole('ADMIN')")`, returning `403 Forbidden` with an in-page permission breakdown.

---

## Pre-Seeded Test Credentials

The database is pre-seeded with test accounts across all roles:

| Role / Persona | Email | Password | Account Tier | Description |
| :--- | :--- | :--- | :--- | :--- |
| **System Admin** | `admin@example.com` | `admin123` | B2B | Full administrative powers, user directory, status toggle, audit vault |
| **B2B Enterprise Lead** | `enterprise@acme.com` | `b2b123` | B2B | Access to corporate SLA metrics, API usage quotas, enterprise tools |
| **B2C Customer** | `user@example.com` | `user123` | B2C | Standard consumer member portal, rewards points, discount coupons |

---

## Quick Start Guide

### 1. Prerequisites
- **Java 17+** (OpenJDK or Oracle)
- **Node.js 18+** & npm
- **PostgreSQL** running on `localhost:5432` with database `spring-security-db`

### 2. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
```
*(Optional: Add your Google OAuth2 credentials to `.env` to enable Google sign-in)*

### 3. Start Spring Boot Backend
```bash
cd spring-security-backend
./mvnw spring-boot:run
```
Backend will start on `http://localhost:8080`.

### 4. Start React Frontend
```bash
cd login-auth-app
npm install
npm run dev
```
Frontend will launch on `http://localhost:5174` (or `5173`).

---

## API Reference Summary

### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/signup` — Register local account with role and tier.
- `POST /api/v1/auth/login` — Authenticate and receive in-memory JWT + HttpOnly refresh cookie.
- `POST /api/v1/auth/refresh` — Rotate refresh token cookie and receive new access token.
- `POST /api/v1/auth/logout` — Revoke database refresh token and clear cookie.

### User & Tier Resources (`/api/v1/users`)
- `GET /api/v1/users/profile` — Fetch authenticated user profile.
- `PUT /api/v1/users/profile` — Update name or organization details.
- `GET /api/v1/users/b2b-data` — Enterprise B2B corporate quotas (requires B2B tier or ADMIN).
- `GET /api/v1/users/b2c-data` — Consumer B2C loyalty points.
- `GET /api/v1/users/moderator-data` — Moderator audit queue (`ROLE_MODERATOR` / `ROLE_ADMIN`).
- `GET /api/v1/users/audit-vault` — Cryptographic Security & Audit Vault (`ROLE_ADMIN`).

### Administrative Management (`/api/v1/admin`)
- `GET /api/v1/admin/dashboard` — System statistics (total users, tier breakdowns, privileged counts).
- `GET /api/v1/admin/users` — Full user directory.
- `PUT /api/v1/admin/users/{id}/roles` — Update assigned RBAC authorities.
- `PATCH /api/v1/admin/users/{id}/status` — Toggle active / suspended state.
- `PATCH /api/v1/admin/users/{id}/account-type` — Switch tier between B2B and B2C.
- `DELETE /api/v1/admin/users/{id}` — Irrevocably delete account.
- `GET /api/v1/admin/rbac-matrix` — Granular permission matrix for all routes.

---

## Documentation & Learning Notes

- 📘 [**Spring Security 6, JWT & OAuth2 Learning Notes**](docs/SPRING_SECURITY_JWT_OAUTH2_NOTES.md) — Comprehensive guide covering filter chains, stateless security, token rotation, and security hardening.
- 🍪 [**HttpOnly Cookie & UI Validation Flow Guide**](docs/HTTP_ONLY_COOKIE_AUTH_FLOW.md) — Deep dive into how HttpOnly cookies are set, validated, and managed across the React UI (RTK Query) and Spring Boot.
- 🤝 [**Contributing Guidelines**](CONTRIBUTING.md) — Coding conventions, Git branch standards, and PR workflows.

---

## 🌟 Support & Star

If this project helped you understand **Spring Security 6**, **JWT**, **OAuth2**, or **Granular RBAC**, please consider giving it a **Star** on GitHub! It helps other developers discover this learning blueprint.

[![Star on GitHub](https://img.shields.io/github/stars/adityaSrivastava29/Spring-Security-with-jwt-oAuth2?style=social)](https://github.com/adityaSrivastava29/Spring-Security-with-jwt-oAuth2)

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
