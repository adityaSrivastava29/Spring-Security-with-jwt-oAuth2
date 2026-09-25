# Frontend Architecture & State Management Specification (RTK & RTK Query)

## 1. Project Overview & Tech Stack
* **Framework:** React 18+ (Vite)
* **State Management:** Redux Toolkit (`@reduxjs/toolkit`), React Redux (`react-redux`)
* **Data Fetching & Caching:** RTK Query
* **Routing:** React Router v6
* **Styling:** Tailwind CSS
* **Companion Backend:** Spring Boot 3 running on `http://localhost:8080/api/v1`

---

## 2. Directory Architecture

Structure the source code strictly under `src/`:

```text
src/
├── app/
│   ├── store.js                   # Redux store configuration with RTK Query middleware
│   ├── baseQueryWithReauth.js     # Custom fetchBaseQuery with async-mutex for silent token refresh
│   └── apiSlice.js                # Core createApi definition (baseQuery, tagTypes)
├── assets/                        # Static assets, SVG icons
├── components/                    # UI components (Navbar, Input, Button, Modal, Spinner)
├── features/
│   ├── auth/
│   │   ├── authSlice.js           # Auth state (user, token, isAuthenticated, status)
│   │   └── authApiSlice.js        # RTK Query auth endpoints (login, register, logout, refresh)
│   └── users/
│       └── userApiSlice.js        # User profile, moderator, and admin RTK Query endpoints
├── hooks/
│   ├── useAuth.js                 # Helper hook extracting user and roles from Redux
│   └── reduxHooks.js              # Typed / standard useDispatch & useSelector hooks
├── pages/                         # Home, Login, Register, Dashboard, AdminPanel, Unauthorized, OAuth2Redirect
├── routes/
│   ├── AppRoutes.jsx              # Application router switch
│   ├── ProtectedRoute.jsx         # Authentication guard (checks token / isAuthenticated)
│   └── RoleRoute.jsx              # RBAC guard (evaluates required roles)
├── App.jsx
└── main.jsx
```

---

## 3. Redux & RTK Query Implementation Rules

### Token & Auth State (`authSlice.js`)
* Keep the access token strictly in Redux memory (`state.auth.token`).
* **Never** store access tokens in `localStorage` or `sessionStorage` (mitigates XSS token leakage).
* Store user metadata: `{ id, email, roles: ['ROLE_USER', ...] }`.
* Expose actions: `setCredentials({ accessToken, user })` and `logOut()`.

### Silent Refresh & Mutex (`baseQueryWithReauth.js`)
* Use `fetchBaseQuery({ baseUrl: 'http://localhost:8080/api/v1', credentials: 'include' })`.
* In `prepareHeaders`, attach `Authorization: Bearer ${token}` from Redux `auth.token`.
* Use `async-mutex` inside `baseQueryWithReauth`:
  1. If a query returns `401 Unauthorized`:
  2. Acquire mutex lock (prevent duplicate concurrent refresh calls).
  3. Dispatch call to `/auth/refresh`.
  4. On success: Dispatch `setCredentials`, update access token in Redux, and retry original query.
  5. On failure: Dispatch `logOut`, clear state, and redirect to `/login`.
  6. Release mutex lock.

### Role-Based Access Control (RBAC) & Routes
* **Roles:** `ROLE_USER`, `ROLE_MODERATOR`, `ROLE_ADMIN`.
* **`<ProtectedRoute />`**: Verifies if user is logged in. If not, redirects to `/login`.
* **`<RoleRoute allowedRoles={['ROLE_ADMIN']} />`**:
  * Reads current user roles via `useAuth()`.
  * If authenticated but lacks role $\rightarrow$ renders `<Navigate to="/unauthorized" replace />`.
  * If authorized $\rightarrow$ renders `<Outlet />`.

### Google OAuth2 Redirect Handling (`OAuth2Redirect.jsx`)
* Route: `/oauth2/redirect`.
* Once Google redirects back from Spring Boot, this component mounts:
  1. Hits `/auth/refresh` or profile endpoint (`credentials: 'include'` sends the refresh cookie automatically).
  2. Receives fresh access token and user role payload.
  3. Dispatches `setCredentials`.
  4. Navigates user seamlessly to `/dashboard`.