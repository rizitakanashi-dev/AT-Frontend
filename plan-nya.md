# Refactor AT-Frontend: unify the merged dashboard + fix the auth session — PR #2

## Context

`feat/piqri` → `main` shipped a partially-wired frontend: the axios `api` client, `authService` (`loginUser`), `ProtectedRoute`, and `absensiService` all exist, but the **login page and dashboard shell are stubs**, and the four role dashboards duplicate the same sidebar/stat-card/profile-bar JSX. Net effect: login puts you at `/dashboard` with no real session, `AbsensiPage` can't drive the rekap UI, and any maintenance to the nav shell must be repeated across 4 filesmers.

This plan wires those seams honestly: real auth (API login → `localStorage.token`/`user` → role-based redirect), protected+role-gated routes, a shared dashboard shell, and a real absensi API path — then deletes the dead copy.

## Goals (this merge must satisfy)

1. **Real login.** `LoginPage` calls `loginUser` (the existing `src/features/absensi/services/authService.ts`), stores `token`+`user`, and redirects by role (`Admin` → `/admin`, else PM/Guru → dashboard).
2. **Protected + role-gated routes.** `ProtectedRoute` reads `localStorage`; wrap `/dashboard/*`, `/pm`, `/guru`, `/admin` in `App.tsx`.
3. **Shared shell.** Extract the duplicated sidebar/stat-card/profile block into one reusable component; the 4 dashboard pages render it.
4. **Real absensi data.** `AbsensiPage` uses `absensiService` (`getRekapAbsensi`, `postAbsenMasuk`, `postAbsenPulang`) instead of hardcoded arrays.
5. **No binaries, no dead code.** Remove committed PNGs; remove unused imports/dead services.

**Non-goals:** no UI restyle, no test framework (none exists), no backend changes.

## The exact list (in order)

### A. Remove committed binaries
```bash
git rm src/lib/image.png src/image.png checkin_logo.png
```
(Verify names match the tree — re-run the grep before `git rm`.)

### B. Real credentials → login → role redirect
`src/features/auth/pages/LoginPage.tsx`:
- `handleLogin`: `loginUser({ nama, password })` → on success `localStorage.setItem('token', data.Token)` + `setItem('user', JSON.stringify(data))`; `navigate(role === 'Admin' ? '/admin' : '/dashboard', {replace:true})`.
- `errorMsg` set from `err.response?.data?.message ?? 'Login gagal'` on failure; stay on page.
- Drop the `console.log` stub + any `errorMsg`-reset-only path.

### C. Protected + role-gated routes (`src/App.tsx`)
- Wrap role pages with `ProtectedRoute` (with `allowedRoles`), and route `/unauthorized` — role check on `user.Role`.
- Root `/` stays public (LoginPage).

### D. Shared dashboard shell — `src/components/DashboardSidebar.tsx`
- Extract the sidebar+profile+nav (logo block `A` badge, user card, `navItems`, logout, search/bell/settings, stat cards grid) that DashboardGuru/PM/Admin/Dashboard pages repeat verbatim.
- Props: `navItems`, `activePath`, `userName`, `userRole`, `onLogout`, `onNavigate`, `errorMsg?`, `children`.
- 4 pages call it; each page keeps only its unique body + passes its nav items.

### E. Real absensi service (`src/features/dashboard/pages/AbsensiPage.tsx`)
- On mount: `getRekapAbsensi()` → render `rekap`.
- `handleCheckIn`: `postAbsenMasuk({ idProject,target,idStatus })` → refresh rekap.
- `handleCheckOut`: `postAbsenPulang({ idAbsensi,idTarget,idStatus })` → refresh rekap.

### F. Dead code sweep
- `git grep -n "console.log" src` → remove leftover debug logs in non-entry files.
- `git grep` for `checked in`/unused imports across the pages touched.
- `git status` → confirm working tree clean at HEAD before edits (binaries were the only drift).

### Verification
- `npm run build` (root) — `tsc -b && vite build` passes.
- `npm run dev`: `/` → login with bad creds shows error, no redirect; good creds → token+user in `localStorage`, redirected by role; refresh keeps session; navigate to a disallowed role URL → `/unauthorized`.
- `AbsensiPage` rekap/checkin call the `/v1/absensi/...` API (Network tab), no hardcoded rows.
- All 4 dashboard pages render the shared shell correctly; sidebar active state follows `location.pathname`.

## Notes
- The `frontend/` directory from the base scaffold is **not present** in this tree and is **not touched** (previous plan line about "hapus frontend/ seluruhnya" was based on stale state — corrected here).
- Reuse the existing `loginSchema`/`LoginFormValues` and `LoginResponse`/`AbsenRekapDTO` types; don't re-declare.
- All services already import `@/lib/api` (single `api` client); don't introduce a second client.
