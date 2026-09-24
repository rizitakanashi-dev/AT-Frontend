# Dokumentasi Proyek — AbsensiApp Frontend

Dokumentasi menyeluruh frontend **AbsensiApp**: aplikasi manajemen absensi, target kerja, dan pengajuan hosting berbasis React + TypeScript. Backend pendampingnya adalah .NET Minimal API (repo terpisah, port `5072`).

> Dokumen ini menggantikan deskripsi struktur lama di README yang sudah kedaluwarsa.

---

## 1. Ringkasan & Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | React 19 + TypeScript (Vite 8) |
| Routing | `react-router-dom` v7 (`BrowserRouter`, lazy routes) |
| Server state | SWR 2.5 (cache + revalidate) |
| HTTP | Axios (interceptor Bearer + auto-refresh token) |
| Form & validasi | `react-hook-form` + Zod 4 (`@hookform/resolvers`) |
| UI | shadcn/ui + Radix UI, Tailwind CSS 4 (`@tailwindcss/vite`) |
| Ikon / animasi / toast | `lucide-react`, `animejs` 4, `sonner` |
| Tema | `next-themes` (gelap/terang) + Geist Variable font |
| Test / lint / format | Vitest 5, ESLint 10 (flat config), Prettier |
| Deploy | Vercel (`vercel.json`, SPA rewrite) |

Semua dependensi ada di `package.json`. Path alias `@/` → `src/` (dikonfigurasi di `vite.config.ts` dan `vitest.config.ts`).

---

## 2. Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server Vite + proxy `/api` → `http://localhost:5072` |
| `npm run build` | `tsc --noEmit` lalu `vite build` → `dist/` |
| `npm run typecheck` | Cek tipe tanpa build |
| `npm test` | Vitest sekali jalan (`vitest run`) |
| `npm run lint` | ESLint seluruh file |
| `npm run preview` | Preview build produksi |

---

## 3. Struktur Proyek

```text
AT-Frontend/
├── docs/                          # Dokumentasi
│   ├── frontend-project.md        # Dokumen ini
│   ├── hosting-complete.md        # Aturan menyelesaikan hosting request
│   └── backend-api-specification.json
├── src/
│   ├── App.tsx                    # Definisi seluruh route + guard per role
│   ├── main.tsx                   # Entry point React
│   ├── components/                # Shell aplikasi bersama
│   │   ├── DashboardLayout.tsx    # Sidebar, search Ctrl+K, logout, tema
│   │   ├── ProtectedRoute.tsx     # Guard: session + /v1/auth/me + role
│   │   ├── DataState.tsx          # LoadingState / ErrorState / EmptyState
│   │   ├── PageMotion.tsx         # Animasi transisi halaman (animejs)
│   │   ├── Brand.tsx, NameDialog.tsx, ThemeProvider.tsx, WorkspaceControls.tsx
│   │   └── ui/                    # 20 komponen shadcn/ui (button, dialog, table…)
│   ├── features/                  # Modul fitur (feature-based)
│   │   ├── auth/                  # Login: LoginPage, LoginForm, loginSchema (Zod)
│   │   ├── absensi/
│   │   │   ├── schemas/absenSchema.ts      # skema Zod absen masuk/pulang
│   │   │   └── services/authService.ts     # loginUser / logoutUser
│   │   └── dashboard/
│   │       ├── pages/             # 9 halaman (lihat §5)
│   │       ├── components/        # Panel & dialog per fitur
│   │       ├── absensiService.ts  # Semua API absensi/project/target/user
│   │       ├── hostingService.ts  # Semua API hosting request
│   │       ├── hostingAccess.ts   # Izin per role/status + parsing URL
│   │       ├── hostingStatus.ts   # Label/ikon/varian badge status
│   │       ├── useWorkspace.ts    # useProfile (SWR /v1/auth/me), useToday
│   │       └── *.test.ts          # Unit test (vitest, environment node)
│   ├── lib/
│   │   ├── api.ts                 # Axios instance, interceptor refresh, errorMessage()
│   │   ├── session.ts             # Sesi di localStorage (token + user)
│   │   ├── roles.ts               # Konstanta role, normalizeRole, roleHomePath
│   │   └── utils.ts               # cn() utility class
│   └── types/                     # DTO TypeScript: absensi.ts, auth.ts, hosting.ts
├── vite.config.ts                 # Alias @, proxy /api → :5072
├── vitest.config.ts               # include: src/**/*.test.ts, env node
├── vercel.json                    # SPA rewrite + security headers
└── eslint.config.js
```

Prinsipnya **feature-based**: satu fitur punya `pages/`, `components/`, `schemas/` (Zod), dan `services/` sendiri. Service layer adalah satu-satunya tempat memanggil API — komponen tidak memanggil Axios langsung.

---

## 4. Arsitektur Inti

### 4.1 Autentikasi & sesi

```text
Login (Zod) → POST /v1/auth/login
  → { token, refresh_Token, nama, role } disimpan di localStorage
  → redirect ke roleHomePath(role)

Setiap request → interceptor menambahkan Authorization: Bearer <token>
Respons 401 → refresh tunggal (single-flight) POST /v1/auth/refresh
  → berhasil: retry request sekali dengan token baru
  → gagal: clearSession() + redirect /login
Logout → POST /v1/auth/logout (best effort) + clearSession()
```

Detail penting (`src/lib/api.ts`, `src/lib/session.ts`):

- **Single-flight refresh** — banyak 401 barengan hanya memicu satu panggilan refresh (`refreshPromise` di-share).
- **Refresh tertunda gak menghidupkan sesi mati** — hasil refresh dibuang kalau `refresh_Token` di localStorage sudah berubah (logout/login lain di tengah jalan).
- **`baseURL`** = `VITE_API_BASE_URL` atau `/api` (default). Di dev, Vite mem-proxy `/api` ke backend `localhost:5072` supaya CORS tidak jadi masalah.
- **`errorMessage(error)`** — penerjemah error Axios ke pesan Indonesia ramah user (401/403/429/offline/`message` dari backend).
- Field `refresh_Token` sengaja campur case — mengikuti output serializer backend.
- Token disimpan di `localStorage` (bukan HttpOnly) — kontrak bearer sederhana; menggantinya butuh perubahan backend.

### 4.2 Guard route (`ProtectedRoute`)

```text
Tidak ada session        → /login
GET /v1/auth/me gagal    → layar error + tombol kembali ke login
Role tidak dikenal       → /unauthorized
Role benar tapi route    → redirect ke roleHomePath (mis. Admin buka /dashboard → /admin)
Sesuai                  → render halaman
```

`/v1/auth/me` dijalankan lewat SWR di setiap guard, jadi **state user divalidasi per-request terhadap backend** (akun dihapus / role diturunkan langsung ketahuan walau token masih berlaku 7 hari).

### 4.3 Sistem role

| Role | Label | Home | Cakupan utama |
|---|---|---|---|
| `Admin` | Administrator | `/admin` | Semua fitur + divisi + hosting + hapus user |
| `PM` | Project Manager | `/pm` | Rekap, proyek, target, user, review hosting |
| `Guru` | Guru Pengawas | `/guru` | Rekap, proyek, target, user |
| `Anggota` | Pelajar | `/dashboard` | Absensi sendiri, target, riwayat, ajukan hosting |
| `DevOps` | DevOps Engineer | `/devops` | Workspace hosting (proses & selesaikan) |

- `Pelajar` ditoleransi sebagai alias legacy `Anggota` (lihat `lib/roles.ts`).
- `normalizeRole()` / `roleHomePath()` adalah satu-satunya sumber benar untuk mapping role → path.

### 4.4 State data (SWR)

- Kunci umum: URL endpoint (`/v1/auth/me`), atau array berprefiks fitur (`['users-workspace', profile.id, admin]`, `['hosting-detail', profile.id, id]`, `['hosting-workspace', …]`).
- Mutasi memicu revalidasi via `mutate(...)` — helper `useRefreshWorkspace()` me-revalidate semua kecuali `/v1/auth/me`.
- `useToday()` — tanggal hari ini (`YYYY-MM-DD`), refresh otomatis tiap 30 detik (anti-stale saat lewat tengah malam).

---

## 5. Route & Halaman

Semua halaman dimuat `lazy()` (code-split per role).

| Path | Role | Halaman | Isi |
|---|---|---|---|
| `/login` | publik | `LoginPage` | Form login Zod + cerita brand + toggle tema |
| `/unauthorized` | publik | `UnauthorizedPage` | Role tidak dikenal |
| `/dashboard` | Anggota | `DashboardPage` | Ringkasan pribadi |
| `/dashboard/absensi` | Anggota | `AbsensiPage` | Absen masuk/pulang + target hari ini |
| `/dashboard/project` | Anggota | `ProjectsPage` | Proyek miliknya |
| `/dashboard/targets` | Anggota | `TargetsPage` | Target pribadi |
| `/dashboard/riwayat` | Anggota | `RiwayatPage` | Riwayat kehadiran |
| `/dashboard/hosting` | Anggota | `HostingPage` | Pengajuan hosting sendiri |
| `/{admin\|pm\|guru}` | masing-masing | `ManagementOverview` | Dashboard manajemen |
| `/{…}/projects` | Admin/PM/Guru | `ProjectsPage` | Kelola proyek + anggota |
| `/{…}/absensi` | Admin/PM/Guru | `RiwayatPage` | Rekap kehadiran (paginasi) |
| `/{…}/targets` | Admin/PM/Guru | `TargetsPage` | Target semua / pribadi |
| `/{…}/users` | Admin/PM/Guru | `UsersPage` | Manajemen pengguna |
| `/admin/divisions` | Admin | `DivisionsPage` | Divisi (CRUD) + referensi role/status (read-only) |
| `/admin/hosting` | Admin | `HostingPage` | Monitor semua hosting |
| `/pm/hosting` | PM | `HostingPage` | Review approve/reject |
| `/devops` | DevOps | `HostingPage` | Workspace DevOps |

`*` (path tak dikenal) → redirect `/login`.

`DashboardLayout` membangun menu sidebar sesuai role (termasuk item "Hosting" khusus Anggota/PM/Admin, dan nav khusus DevOps), plus search palette **Ctrl/Cmd+K** dan tombol logout.

---

## 6. Fitur

### 6.1 Absensi (Anggota & rekap)

- **Masuk**: `POST /v1/absen/masuk` dengan `{ idProject, target, idStatus }` — divalidasi `absenMasukSchema` (Zod).
- **Pulang**: `PUT /v1/absen/pulang` dengan `{ idAbsensi, idTarget, idStatus }` — `absenPulangSchema`.
- **Rekap harian**: `GET /v1/absen?tanggal&page&pageSize` (server paginated); `getRekapAbsensi()` menggabungkan semua halaman.
- **"Absensi saya"**: rekap tidak punya ID user, jadi difilter dengan memasukkan `idTarget` terhadap `GET /v1/target/my` — join by ID, bukan nama tampilan.

### 6.2 Proyek & keanggotaan

`GET/POST/PUT/DELETE /v1/project`, anggota proyek via `/v1/project-anggota`, daftar Guru/DevOps via `/v1/guru` dan `/v1/devops`.

### 6.3 Target kerja

`/v1/target` (semua, untuk staf) dan `/v1/target/my` (pribadi), referensi status dari `/v1/status`.

### 6.4 Pengguna

- Utama: `GET/POST/PUT/DELETE /v1/admin/users`.
- **Fallback**: kalau endpoint admin 404 (backend lama), otomatis gabung `/v1/anggota` + `/v1/guru` + `/v1/pm` + `/v1/devops`.
- Password opsional saat update (dikirim hanya jika diisi).
- `canManageUser()` membatasi akses per role.

### 6.5 Hosting request

Alur status: `pending → approved → in_progress → completed` (plus `rejected`, `cancelled`).

| Aksi | Siapa | Endpoint |
|---|---|---|
| Ajukan / edit | Anggota (pemilik) | `POST/PUT /v1/hosting/request` |
| Setujui / tolak | PM, Admin | `PUT /v1/hosting/request/{id}/approve` / `reject` |
| Mulai proses | DevOps, Admin | `PUT …/{id}/start` |
| Selesaikan | DevOps (handler), Admin | `PUT …/{id}/complete` — tautan **opsional**, domain polos otomatis `https://` |
| Catatan DevOps | handler, Admin | `PUT …/{id}/notes` |
| Batalkan / hapus | pemilik / Admin | `DELETE …/{id}/cancel` / `DELETE …/{id}` |

Otorisasi frontend terpusat di `hostingPermissions()` (`hostingAccess.ts`): `view / edit / review / start / complete / notes / delete / resubmit`. Hanya **handler** (`id_devops_handler`) atau Admin yang boleh complete/notes.

Detail lengkap (tabel validasi URL, kenapa `type="text"`, file terkait): **[docs/hosting-complete.md](hosting-complete.md)**.

---

## 7. UI & UX

- **Desain sistem**: komponen shadcn/ui di `src/components/ui/` (button, dialog, alert-dialog, table, tabs, sheet, toast-trigger via sonner, dsb.), utility `cn()` dari `lib/utils.ts`.
- **Layout**: `DashboardLayout` — sidebar desktop, `Sheet` (drawer) untuk mobile, header dengan search, avatar, `ThemeToggle`.
- **State visual**: `LoadingState` / `ErrorState` (dengan tombol retry) / `EmptyState` dari `DataState.tsx` dipakai konsisten di semua halaman.
- **Animasi**: `PageMotion` (animejs) untuk transisi halaman.
- **Toast**: `sonner` — sukses/gagal mutasi.
- **Aksesibilitas**: shortcut Ctrl/Cmd+K, `aria-label` pada tombol ikon, fokus dialog dari Radix.

---

## 8. Testing

- Runner: **Vitest** — environment `node`, include hanya `src/**/*.test.ts` (bukan `.tsx`, jadi belum ada test komponen React).
- Jalankan: `npm test` (59 test saat ini).

| File | Cakupan |
|---|---|
| `lib/api.test.ts` | Interceptor & perilaku lapisan API |
| `features/dashboard/absensiService.test.ts` | Rekap, join "absensi saya", user CRUD |
| `features/dashboard/hostingAccess.test.ts` | Izin per role/status + `safeHostingUrl` + `parseHostingUrlInput` |
| `features/dashboard/hostingService.test.ts` | Penggabungan workspace hosting per role |

Konvensi: **test dulu (RED) → implementasi (GREEN)**; unit test memanggil fungsi murni, bukan mock komponen.

---

## 9. Konfigurasi & Deploy

### Environment

| Variabel | Default | Keterangan |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Basis URL API. Diisi URL absolut backend bila tidak pakai proxy Vite. |

Tidak ada variabel lain yang dibaca aplikasi (JWT dikelola backend).

### Dev

```bash
# Terminal 1 — backend (repo backend, port 5072)
dotnet run          # atau docker compose up

# Terminal 2 — frontend
npm run dev         # http://localhost:5173 → proxy /api → :5072
```

### Produksi (Vercel)

- Build: `npm run build` (`tsc` + `vite build`), output `dist/`.
- `rewrites`: semua path kecuali `/api/*` → `index.html` (SPA routing).
- Security headers otomatis: HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- Saat deploy, set **`VITE_API_BASE_URL`** di dashboard Vercel ke URL backend (mis. `https://api-contoh.com/api`) karena proxy Vite hanya ada di dev.

---

## 10. Catatan & jebakan yang diketahui

1. **`Pelajar` = alias legacy `Anggota`** — jangan tambah role baru tanpa update `lib/roles.ts` + `session.ts` (daftar role valid di dua tempat).
2. **`type="text"` pada input URL hosting disengaja** — `type="url"` memicu native validation browser yang menolak domain polos sebelum JS jalan. Jangan "diperbaiki" kembali ke `type="url"`.
3. **Daftar role valid di-hardcode** di `session.ts` dan `ProtectedRoute.tsx` — kalau backend menambah role, dua tempat itu harus ikut.
4. **Test hanya `.ts`** — tambahan komponen `.tsx` tidak ikut ter-execute vitest kecuali `vitest.config.ts` ikut diubah.
5. **README struktur proyek lama sudah tidak akurat** — yang benar adalah §3 dokumen ini.
6. **Spec API backend** ada di `docs/backend-api-specification.json` (JSON, bukan Markdown).
