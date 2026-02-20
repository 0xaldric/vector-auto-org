# Admin Dashboard - Implementation Plan

## Overview
Build an admin dashboard using **Next.js (App Router)** + **NextAuth** + **Tailwind CSS** + **shadcn/ui** + **Orval** for managing users. The backend API is already running at `http://localhost:3000`.

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Auth | NextAuth v5 (Google OAuth + JWT from backend API) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (built on Tailwind CSS) |
| Primary Color | `#E31D25` (red) |
| API Client | Orval (auto-generated from OpenAPI spec) |
| State/Fetching | TanStack Query (via Orval) |
| Language | TypeScript |

---

## API Endpoints (from OpenAPI spec)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Login with email/password | No |
| POST | `/auth/google/authenticate` | Login with Google ID token | No |
| POST | `/auth/logout` | Logout | JWT |
| GET | `/auth/profile` | Get current user profile | JWT |
| GET | `/auth/admin/users` | Admin-only endpoint | JWT (admin) |
| GET | `/users` | Get paginated users list | JWT |
| GET | `/users/me` | Get current user info | JWT |
| POST | `/auth/register` | Register new user | No |

### Key Schemas
- **UserResponseDto**: `id`, `email`, `displayName`, `role` (admin/user/organizer), `tags[]`, `avatarUrl`
- **AuthResponseDto**: `user` + `token` (JWT)
- **Roles**: `admin`, `user`, `organizer`

---

## Project Structure

```
auto-org/
├── .env                          # Already exists (Google OAuth credentials)
├── swagger.json                  # OpenAPI spec (saved from backend)
├── orval.config.ts               # Orval configuration
├── next.config.ts
├── tailwind.config.ts
├── package.json
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx      # Login page (email/password + Google)
│   │   │   └── layout.tsx        # Auth layout (centered, no sidebar)
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx        # Dashboard layout (sidebar + header)
│   │   │   ├── page.tsx          # Dashboard home (stats overview)
│   │   │   └── users/
│   │   │       └── page.tsx      # User management page
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts  # NextAuth API route
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── sidebar.tsx       # App sidebar navigation
│   │   │   ├── header.tsx        # Top header with user menu
│   │   │   └── user-nav.tsx      # User dropdown (avatar, logout)
│   │   ├── auth/
│   │   │   ├── login-form.tsx    # Email/password login form
│   │   │   └── google-button.tsx # Google sign-in button
│   │   └── users/
│   │       ├── users-table.tsx   # Users data table
│   │       └── columns.tsx       # Table column definitions
│   ├── lib/
│   │   ├── auth.ts               # NextAuth configuration
│   │   ├── utils.ts              # shadcn/ui utils (cn helper)
│   │   └── api-client.ts         # Axios instance with JWT interceptor
│   ├── generated/                # Orval auto-generated API hooks
│   │   └── api/
│   ├── providers/
│   │   └── providers.tsx         # SessionProvider + QueryClientProvider
│   └── middleware.ts             # Route protection middleware
```

---

## Implementation Steps

### Step 1: Project Setup
- Initialize Next.js 15 project with TypeScript + Tailwind CSS + App Router
- Install dependencies: `next-auth`, `shadcn/ui`, `orval`, `@tanstack/react-query`, `axios`
- Configure Tailwind with primary color `#E31D25`
- Initialize shadcn/ui with custom theme

### Step 2: Orval Setup & API Generation
- Create `orval.config.ts` pointing to `swagger.json`
- Configure Orval to generate TanStack Query hooks + Axios client
- Generate API client code to `src/generated/`
- Create Axios instance with JWT token interceptor (`src/lib/api-client.ts`)

### Step 3: Authentication (NextAuth)
- Configure NextAuth with Google Provider
- Custom flow: after Google sign-in, send ID token to backend `/auth/google/authenticate` to get our JWT
- Store backend JWT in NextAuth session
- Also support email/password login via `/auth/login` using Credentials provider
- Create middleware to protect `/dashboard/*` routes
- Redirect unauthenticated users to `/login`

### Step 4: Auth Pages
- **Login Page** (`/login`):
  - Clean centered layout
  - Email + password form
  - "Sign in with Google" button
  - Brand logo/name with primary color accent
  - Error handling & loading states

### Step 5: Dashboard Layout
- **Sidebar**: Logo, navigation items (Dashboard, Users), collapse toggle
- **Header**: Page title, user avatar dropdown (profile info, logout)
- Responsive: sidebar collapses to icons on mobile
- Active nav highlighting

### Step 6: Dashboard Home Page
- Overview cards: Total Users, Admins, Organizers, New Users
- Simple stats using data from `/users` API
- Welcome message with user's name

### Step 7: User Management Page
- **Data Table** (using shadcn/ui `<DataTable>`):
  - Columns: Avatar, Name, Email, Role (badge), Tags, Actions
  - Pagination (server-side, using `page` & `limit` query params)
  - Role displayed as colored badges (admin=red, organizer=blue, user=gray)
- Uses Orval-generated `useGetUsers()` hook

---

## Auth Flow Detail

```
1. User clicks "Sign in with Google"
2. NextAuth redirects to Google OAuth consent
3. Google returns ID token to NextAuth callback
4. NextAuth callback sends ID token to backend: POST /auth/google/authenticate
5. Backend verifies token, returns { user, token (JWT) }
6. NextAuth stores JWT + user in session
7. All subsequent API calls use JWT in Authorization header
```

For email/password:
```
1. User enters email + password
2. NextAuth Credentials provider calls POST /auth/login
3. Backend returns { user, token (JWT) }
4. Same storage flow as above
```

---

## Theme Configuration

Primary color `#E31D25` applied as:
- CSS variables in `globals.css` (HSL format for shadcn)
- Sidebar active state, buttons, links, badges
- Login page accents
- Dashboard stat card highlights

---

## Key Decisions
1. **NextAuth v5** (Auth.js) for its App Router native support
2. **Orval + TanStack Query** for type-safe API calls with caching/pagination
3. **Credentials + Google** dual provider in NextAuth
4. **Backend JWT stored in NextAuth session** - NextAuth handles Google OAuth, then exchanges for backend JWT
5. **Middleware-based route protection** for `/dashboard/*` routes
6. **Server-side pagination** matching backend's `page` + `limit` params

---

## Dependencies to Install

```bash
# Core
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Auth
npm install next-auth@beta

# UI
npx shadcn@latest init
npx shadcn@latest add button input label card table badge avatar dropdown-menu separator sheet sidebar

# API
npm install orval @tanstack/react-query axios

# Dev
npm install -D orval
```

---

## Estimated File Count
~25 files to create/modify

Please review this plan and let me know if you'd like any changes before I start implementation.
