# Frontend Architecture — Role-Based Layout

This document describes how the DocFlies frontend is organized by **role** (HR, Finance, Legal, Marketing, Admin) and what is **shared** across all roles.

---

## 1. Role-Based Access

| Role     | After login   | Sidebar / visible content                         | Common to all   |
|----------|---------------|---------------------------------------------------|-----------------|
| HR       | `/app/hr`     | Document Chat + HR only (dashboard, employees, candidates, onboarding, editor) | Document Chat   |
| Finance  | `/app/finance`| Document Chat + Finance only (dashboard, reports, editor)                       | Document Chat   |
| Legal    | `/app/legal`  | Document Chat + Legal only (dashboard, editor)                                  | Document Chat   |
| Marketing| `/app/marketing` | Document Chat + Marketing only                                               | Document Chat   |
| Admin    | `/app/dashboard` | Full nav (Overview, Document Chat, HR, Finance, Legal, Docs, Marketing)     | Document Chat   |

- **Document Chat** (`/app/chat`) is the **only shared feature**: every role sees it and can use it.
- **Module users** (HR, Finance, Legal, Marketing) do not see Overview or other modules; they cannot access other modules’ URLs (route guard redirects to their module home).
- **Admin** (or users without `user.module`) see the full sidebar and can access all routes.

---

## 2. Route Protection

- **ProtectedRoute** (`src/auth/ProtectedRoute.jsx`): Ensures the user is authenticated for `/app/*`. Unauthenticated users are redirected to `/`.
- **ModuleRouteGuard** (`src/auth/ModuleRouteGuard.jsx`): For users with `user.module` in `hr | finance | legal | marketing`, allows only:
  - `/app` (index)
  - `/app/chat`
  - `/app/{module}` and `/app/{module}/*`
  Any other path (e.g. HR user visiting `/app/finance`) redirects to `/app/{user.module}`.

---

## 3. Repository Layout (Per-Role vs Shared)

### Shared (all roles)

- **Auth:** `src/auth/` — AuthContext, ProtectedRoute, ModuleRouteGuard.
- **Document Chat:** `src/pages/app/ChatWorkspacePage.jsx` — the common “Document Chat” page inside the app; route `/app/chat`.
- **Layout:** `src/pages/app/AppShell.jsx` — app shell, sidebar (filtered by role), header.
- **Components used by multiple modules:** `src/components/shared/` (dashboard primitives, DocumentViewer, FileUploadSidebar, AIChatSidebar), `src/components/layout/`, `src/components/common/`, `src/components/editors/`, `src/components/preview/`, `src/components/progress/`, `src/components/chat/`, `src/components/connect/`.
- **API, hooks, utils:** `src/api/`, `src/hooks/`, `src/utils/` — used by all modules.
- **Landing and public pages:** `src/pages/LandingPage.jsx`, `src/pages/ChatPage.jsx`, `src/pages/EditorPage.jsx` (public tools).

### Per-role (module-specific)

- **HR:** `src/pages/app/hr/` — HRDashboard, EmployeesDirectory, CandidatesList, CandidateDetail, CandidateNew, OnboardingQueue, OnboardingDetail, OnboardingNew, HRSectionEditor. Components: `src/components/hr/`.
- **Finance:** `src/pages/app/finance/` — FinanceDashboard, FinanceSectionEditor, ReportsQueue, ReportDetail. Components: `src/components/finance/`.
- **Legal:** `src/pages/app/legal/` — LegalDashboard, LegalSectionEditor. Components: (none yet or shared).
- **Marketing:** `src/pages/app/marketing/` — MarketingDashboard.

### Admin-only

- **Overview:** `src/pages/app/DashboardPage.jsx` — admin dashboard with SectionCards to all departments; route `/app/dashboard`. Shown only in sidebar for admin / users without `user.module`.
- **Knowledge Base:** `src/pages/app/DocsDashboard.jsx` — route `/app/docs`; in full nav for admin.

---

## 4. Sidebar Logic (AppShell)

- **Admin or no module:** Full nav (Overview, Document Chat, HR Workspace, Finance Hub, Legal & Compliance, Knowledge Base, Marketing).
- **Module user:** Only **Document Chat** + **one entry for their module** (e.g. “HR Workspace”, “Finance Hub”). No Overview.

---

## 5. Optional Future Reorganization

The codebase can be reorganized into an explicit module structure, for example:

- `src/modules/hr/`, `src/modules/finance/`, `src/modules/legal/`, `src/modules/marketing/` — each with `pages/` and optionally `components/`.
- `src/shared/` — auth, Document Chat page, layout, api, hooks, utils, shared components.

Current layout keeps pages under `src/pages/app/{hr,finance,legal,marketing}/` and documents role vs shared here; a physical move can be done in a later refactor.
