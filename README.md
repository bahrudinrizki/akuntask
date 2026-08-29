# Akuntask

Aplikasi Akuntansi & Manajemen Bisnis Online — implementasi PRD v1.0.

## Stack (per PRD §6.2)

- **Backend:** NestJS 10 + Prisma 5 + SQLite (dev) / PostgreSQL 15 (prod)
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Monorepo:** pnpm workspaces
- **Cache/Queue/Storage:** Redis, RabbitMQ, MinIO — ditambah saat Phase 4+ (PRD §6.2)

> **Override catatan:** `AGENTS.md` mendeklarasikan stack PHP+MySQL+Nginx. Setup ini meng-override mengikuti PRD §6.2 (NestJS+Postgres+React) sesuai keputusan product owner. Aturan workflow AGENTS (granular commit, validasi sebelum push) tetap dipakai.

## Struktur

```
apps/
  api/      NestJS backend (port 3000, prefix /api/v1)
  web/      React+Vite frontend (port 5173)
packages/
  shared/   Shared TypeScript types (DTOs)
```

## Prasyarat

- Node.js >= 20
- pnpm >= 9 (`npm i -g pnpm`)
- Untuk prod: PostgreSQL 15+ (dev pakai SQLite, zero install)

## Setup Lokal

```bash
# 1. Install deps (semua workspace)
pnpm install

# 2. Setup env
cp .env.example .env
# Edit JWT_SECRET & JWT_REFRESH_SECRET ke random 64 chars

# 3. Generate Prisma client + migrate + seed
pnpm --filter @akuntask/api exec prisma generate
pnpm --filter @akuntask/api exec prisma migrate dev --name init
pnpm db:seed

# 4. Jalankan API + Web paralel
pnpm dev
```

Akses:
- API: http://localhost:3000/api/v1/health
- Web: http://localhost:5173

## Akun Seed (dev)

| Email | Password | Role |
|-------|----------|------|
| owner@contoh.co.id | password123 | OWNER |

## Endpoint yang Tersedia (Phase 0.5)

| Method | Path | Auth | Keterangan |
|--------|------|------|------------|
| GET | /api/v1/health | Public | Health check |
| POST | /api/v1/auth/register | Public | Daftar company + owner |
| POST | /api/v1/auth/login | Public | Login, dapat JWT |
| GET | /api/v1/users/me | JWT | Profil user login |
| POST | /api/v1/users | JWT | Invite user ke company |
| GET | /api/v1/companies | JWT | List companies |
| GET | /api/v1/companies/me | JWT | Company milik user |
| POST | /api/v1/companies | JWT | Buat company baru |

## Roadmap (PRD §12)

- **Phase 1 (MVP):** Auth, Company, COA, Jurnal, Laba Rugi, Neraca — target Nov 2026
- **Phase 2:** Sales & Purchase cycle
- **Phase 3:** Inventory & POS
- **Phase 4:** 200+ Reports, e-Faktur, e-payment
- **Phase 5:** AI Assistant, public API
- **Phase 6:** Scale & optimize

## Migrasi ke PostgreSQL (prod)

1. Edit `apps/api/prisma/schema.prisma` → `provider = "postgresql"`
2. Set `DATABASE_URL` ke connection string Postgres
3. `pnpm db:migrate` (generate migration SQL baru)
4. Seed ulang

## Keamanan

- Password di-hash dengan bcrypt (10 rounds)
- JWT untuk auth, secret di `.env` (JANGAN commit `.env`)
- ValidationPipe whitelist + forbidNonWhitelisted → tolak field tak dikenal
- CORS aktif (perkecil origin di prod)
- Audit log table siap untuk track semua perubahan (PRD §9.1)
