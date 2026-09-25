# Contributing Guidelines

Thank you for contributing to **AuthShield (Spring Security 6 & React RBAC Architecture)**. We welcome community contributions, bug reports, and feature proposals!

---

## 1. Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please treat all contributors with respect and professionalism.

---

## 2. Getting Started & Development Setup

### 2.1 Prerequisites
- **Java:** JDK 17 or higher
- **Node.js:** v18 or higher (v20+ recommended)
- **Database:** PostgreSQL running locally or in Docker on port `5432` with database `spring-security-db`

### 2.2 Local Environment Setup
1. Fork the repository and clone your fork:
   ```bash
   git clone https://github.com/adityaSrivastava29/Spring-Security-with-jwt-oAuth2.git
   cd Spring-Security-with-jwt-oAuth2
   ```

2. Create your local `.env` from template:
   ```bash
   cp .env.example .env
   ```

3. Launch the Spring Boot backend:
   ```bash
   cd spring-security-backend
   ./mvnw spring-boot:run
   ```

4. Launch the React Vite frontend:
   ```bash
   cd ../login-auth-app
   npm install
   npm run dev
   ```

---

## 3. Branching Strategy & Workflow

1. Create a descriptive feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or for bug fixes:
   git checkout -b fix/issue-description
   ```
2. Keep commits atomic and self-contained.
3. Verify test runs and builds before submitting a Pull Request:
   ```bash
   # Backend validation
   cd spring-security-backend && ./mvnw test

   # Frontend validation
   cd login-auth-app && npm run build
   ```

---

## 4. Commit Message Conventions

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification. Format:

```
<type>(<scope>): <short description>

[optional body explaining context and rationale]
```

### Supported Types
- `feat`: A new feature or endpoint.
- `fix`: A bug fix or security patch.
- `docs`: Documentation updates.
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `chore`: Build process, dependencies, or configuration changes.
- `test`: Adding or updating test suites.

### Examples
- `feat(backend): add MFA TOTP authentication provider`
- `fix(frontend): prevent token refresh race condition with mutex`
- `docs(notes): update OAuth2 PKCE security notes`

---

## 5. Coding Standards

### Backend (Java & Spring Boot)
- **Statelessness:** Never introduce stateful `HttpSession` or `JSESSIONID` reliance.
- **Security Interception:** Prefer declarative method security (`@PreAuthorize`) over hardcoded controller role checks.
- **Exception Handling:** Route all domain errors through `GlobalExceptionHandler` with typed `ApiError` payloads.
- **Lombok Usage:** Use `@RequiredArgsConstructor` for constructor dependency injection.

### Frontend (React & TypeScript)
- **Strict Typing:** Never use `any` unless required for third-party boundary catch clauses.
- **In-Memory Token Safety:** Do NOT write access tokens to `localStorage` or `sessionStorage`.
- **UI Design System:** Adhere to the curated Claymorphism and SaaS Blueprint tokens defined in `.antigravity/skill.md`. Support both Light (default) and Dark theme variants.
- **Responsive Layout:** Ensure clean rendering on mobile (`sm`), tablet (`md`), and desktop (`lg/xl`).

---

## 6. Security Vulnerability Reporting

If you discover a security vulnerability, **please do not open a public GitHub issue**. Instead, report it privately to the maintainers at [EMAIL_ADDRESS] or via GitHub Security Advisories.
