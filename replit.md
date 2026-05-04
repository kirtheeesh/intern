# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **File uploads**: multer (stored in `artifacts/api-server/uploads/`)

## Application: Aimstorm Internship Registration

A complete internship registration platform for "Aimstorm – 15 Days Business Bootcamp".

### Features
- **Landing page** with hero, about, what you'll learn, timeline, benefits, and CTA sections
- **Registration form** with all fields, file uploads (resume + photo), validation
- **Admin login** (username: `admin`, password: `admin123`)
- **Admin dashboard** with stats, search/filter, table, applicant detail modal, status management, notes
- **Click-to-call** phone icon on every applicant row (`tel:+91{number}`)
- **CSV export** of all or filtered registrations with UTF-8 BOM
- **File downloads** for resume and photo via `/api/uploads/{filename}`

### Brand
- Primary color: `#C40233`
- White + red theme, clean and professional

### Routes
- `/` — Landing page
- `/register` — Registration form
- `/register/success` — Submission confirmation
- `/admin/login` — Admin login
- `/admin` — Admin dashboard

### Admin Credentials
- Username: `admin`
- Password: `admin123`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Tables

- `registrations` — stores all internship registration submissions

## File Upload Storage

Files (resumes, photos) are stored on disk at `artifacts/api-server/uploads/` and served via `/api/uploads/{filename}`.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
