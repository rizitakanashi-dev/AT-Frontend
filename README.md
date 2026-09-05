# 🚀 AbsensiApp - System Management & Daily Work Log

Aplikasi manajemen absensi dan laporan kerja harian (daily work log) berbasis **.NET 8 Minimal API** untuk Backend dan **React + TypeScript (Vite)** untuk Frontend.

---

## 📁 Project Structure

```text
absensi-app/
├── backend/                       # .NET 8 Minimal API Project
│   ├── Controllers/               # Grouping Route Handler / Endpoint Map
│   │   └── AuthController.cs      # Endpoint autentikasi (Login, Register, Refresh, Me)
│   ├── Models/                    # Data Transfer Objects (DTO) & Entity Models
│   │   ├── AdminOTD.cs            # DTO pendaftaran admin
│   │   ├── User.cs                # Model dasar entity User
│   │   └── UserSessionModel.cs    # Model sesi user & DTO Login Response
│   ├── Services/                  # Business Logic Layer & Database Interactions
│   │   ├── AuthServices.cs        # Logic query Dapper (MySQL) untuk Autentikasi
│   │   ├── JWTService.cs          # Generator & validator JWT Token
│   │   └── PasswordService.cs     # Helper hashing & verifikasi BCrypt
│   ├── Properties/                # Konfigurasi launch settings (.NET)
│   │   └── launchSettings.json    # Port server & environment settings
│   ├── Program.cs                 # Root entry point, DI Registration, & Middleware
│   └── appsettings.json           # Connection String MySQL & JWT Keys
│
├── frontend/                      # React + TypeScript (Vite) Project
│   ├── public/                    # Static assets (Favicon, Logo, Images)
│   └── src/
│       ├── assets/                # Asset gambar, ilustrasi, atau ikon internal
│       ├── components/            # Reusable UI Components (Radix / Shadcn / Custom)
│       │   └── ui/                # Atomic design system (Button, Input, Card, Checkbox)
│       ├── features/              # Feature-based Module Design
│       │   ├── auth/              # Fitur Autentikasi
│       │   │   ├── components/    # Component khusus Auth (LoginForm, RegisterForm)
│       │   │   ├── pages/         # Halaman LoginPage, RegisterPage
│       │   │   └── schemas/       # Skema validasi Zod (loginSchema)
│       │   └── dashboard/         # Fitur Dashboard Multi-Role
│       │       ├── components/    # Card Summary, WorkLog Table, Progress Bar
│       │       └── pages/         # Dashboard Student, PM, Teacher, & Admin
│       ├── hooks/                 # Custom React Hooks (useAuth, useLocalStorage)
│       ├── lib/                   # Configuration utilities (Axios Client, Utils)
│       ├── routes/                # Routing configuration & Protected Routes
│       ├── App.tsx                # Main Application Container
│       └── main.tsx               # Entry point React (DOM Rendering)
│
└── README.md                      # Dokumentasi proyek
