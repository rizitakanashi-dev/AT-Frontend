# Menyelesaikan Hosting Request (Frontend)

Aturan frontend untuk mengubah status hosting request menjadi **Selesai** (`completed`). Perubahan ini menyusul perbaikan `fix(hosting): allow completing request without hosting URL` (commit `485e799`).

## Alur status

```
pending → approved → in_progress → completed
```

Setiap transisi dikunci backend per-status — tidak bisa loncat:

| Aksi | Endpoint | Syarat status awal | Role |
|---|---|---|---|
| Setujui / tolak | `PUT /v1/hosting/request/{id}/approve` / `reject` | `pending` | PM, Admin |
| Mulai proses | `PUT /v1/hosting/request/{id}/start` | `approved` | DevOps, Admin |
| Selesaikan | `PUT /v1/hosting/request/{id}/complete` | `in_progress` | DevOps (handler), Admin |

## Siapa yang boleh menekan "Selesaikan hosting"

Ditentukan `hostingPermissions()` di `src/features/dashboard/hostingAccess.ts`:

```
complete = view && status === 'in_progress' && (Admin || (DevOps && user.id === idDevOpsHandler))
```

- Request harus berstatus **`in_progress`** — masih `approved` harus klik **Mulai proses** dulu.
- Untuk DevOps, hanya **handler** (`id_devops_handler` saat klik Mulai proses) yang bisa menyelesaikan. DevOps lain tidak melihat tombolnya. Admin bebas.
- Frontend menyamakan aturan backend (`id_devops_handler = @DevOpsId OR isAdmin`), jadi tombol tampil ⇔ request backend akan menerima.

## Aturan tautan hosting (field "Tautan hosting aktif")

**Opsional.** Bisa dibiarkan kosong — tombol Selesaikan tetap aktif, backend menerima `hostingUrl` null.

Kalau diisi, divalidasi `parseHostingUrlInput()`:

| Input | Hasil |
|---|---|
| kosong / spasi | Valid, dikirim tanpa URL |
| `https://example.com/app` | Valid, dipakai apa adanya |
| `rizi-takanashi.vercel.app` (domain polos) | Valid, otomatis jadi `https://rizi-takanashi.vercel.app/` |
| `javascript:alert(1)`, `ftp:...`, berkredensial | Ditolak — error merah di form |
| `not a url`, path saja (`/relative`) | Ditolak |
| isi invalid tapi kosong tidak | Submit diblokir, pesan: *"Masukkan tautan hosting HTTP/HTTPS yang valid, tanpa kredensial."* |

Skema `http://` juga diterima (bukan cuma https).

> **Catatan implementasi:** input memakai `type="text"` (bukan `type="url"`) disengaja. `type="url"` memicu native validation browser yang menolak domain polos dengan popup bahasa Inggris ("Please enter a URL.") sebelum JavaScript sempat berjalan.

## Komponen terkait

| File | Peran |
|---|---|
| `features/dashboard/hostingAccess.ts` | `hostingPermissions()`, `parseHostingUrlInput()`, `safeHostingUrl()` |
| `features/dashboard/components/HostingRequestActions.tsx` | Tombol + form Selesaikan hosting |
| `features/dashboard/hostingService.ts` | Pemanggilan API `completeHostingRequest()` |
| `features/dashboard/hostingAccess.test.ts` | Unit test aturan izin & parsing URL |

Jalankan test: `npm test` (vitest) dari root `AT-Frontend`.
