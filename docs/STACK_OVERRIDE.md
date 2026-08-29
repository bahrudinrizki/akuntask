# Stack Override Notes

File `AGENTS.md` di root mendeklarasikan environment:

> Linux / VPS (Ubuntu 24.04, Nginx, PHP 8.x, MySQL)

Namun PRD §6.2 menentukan tech stack:

> Backend: Node.js (NestJS) / Go (Gin)
> Database: PostgreSQL 15
> Frontend: React 18 + TypeScript + Tailwind

**Keputusan:** Mengikuti PRD §6.2 (Strict PRD) per konfirmasi product owner.

Alasan:
1. PRD adalah single source of truth untuk requirement
2. Stack NestJS+Postgres scalable ke microservices (PRD §6.1) tanpa rewrite
3. RBAC + multi-tenant lebih natural di Prisma + Postgres

**Tetap dipakai dari AGENTS.md:**
- Granular commit per fitur
- `php -l` analog → `pnpm typecheck` + `pnpm lint`
- Validasi sebelum push
- `.env` untuk secrets, tidak commit kredensial
- Tidak ada destructive command tanpa persetujuan

**Ditambah untuk setup ini:**
- SQLite untuk dev lokal (zero install, switch ke Postgres untuk prod dengan 1 line change di schema)
- pnpm workspaces untuk monorepo
- Vite untuk dev server web (fast HMR vs CRA)
