# Repository Guidelines

## Project Structure & Module Organization

KAMEGA Shop is a Next.js 15 (App Router) e-commerce + POS platform with PostgreSQL via Prisma 7 Accelerate. French-facing UI.

**Three app areas:**
- **Public Shop** (`/`, `/shop`, `/cart`, `/checkout`) — landing page, product catalog with filters, cart (Zustand persist), guest checkout
- **Customer Portal** (`/customer/*`) — auth-gated, dashboard, orders list with receipt download, profile
- **Admin Panel** (`/admin/*`) — role-gated (ADMIN only), dashboard, products/categories CRUD, orders management, customers, inventory, POS, analytics

**Key directories:**
- `app/api/` — REST route handlers. Each resource has `route.ts` + `[id]/route.ts`. All paginated with `paginated()` helper.
- `lib/` — `prisma.ts` (singleton), `auth.ts` + `auth.config.ts` (NextAuth v5 split for Edge), `types.ts` (shared types), `validators.ts` (Zod schemas), `api-response.ts` (ok/fail/notFound/paginated helpers), `numbers.ts` (money formatter), `receipt.ts` (text receipt + Vercel Blob upload)
- `services/` — Client-side Axios service layer, fully typed. Shared `http.ts` base (`baseURL: "/api"`).
- `hooks/` — TanStack React Query hooks with mutations and cache invalidation. One per domain.
- `stores/` — Zustand: `cart-store.ts` (persisted), `pos-store.ts`, `ui-store.ts`
- `components/ui/` — Shadcn UI components (Button, Card, Dialog, Sheet, Select, Toast, Badge, etc.)
- `components/` — App components: `public-header.tsx`, `admin-shell.tsx`, `customer-shell.tsx`, `product-card.tsx`, `stat-card.tsx`, `empty-state.tsx`, `confirm-dialog.tsx`

**Auth:** NextAuth v5 (beta) with Credentials provider. JWT sessions. `middleware.ts` uses Edge-compatible `auth.config.ts`. Full auth with Prisma in `auth.ts`. Passwords hashed with bcryptjs.

## Build, Test, and Development Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint via next lint
npm run db:generate  # Regenerate Prisma client (prisma generate)
npm run db:push      # Push schema to database (prisma db push)
npm run db:seed      # Seed database (npx tsx prisma/seed.ts)
```

Admin login after seed: phone `+200000000000` or email `admin@kamegashop.com`, password `admin123`.

## Coding Style & Naming Conventions

- **TypeScript** with `strict: true`. Path alias `@/*` → project root.
- **Tailwind CSS 3** with `tailwindcss-animate`, dark mode via `class` strategy. Custom tokens: `ink`, `paper`, `line`, `ring`, `soft`.
- **Shadcn UI** pattern: components in `components/ui/`, utility `cn()` in `lib/utils.ts`.
- **Zod** for validation in `lib/validators.ts`. Used with `@hookform/resolvers` in forms.
- **API pattern**: `ok(data)`, `paginated(data, total, page, pageSize)`, `fail(error, status)`, `notFound()`.
- **Service pattern**: typed Axios calls returning `ApiEnvelope<T>` or `PaginatedEnvelope<T>`.
- **Hook pattern**: single hook per domain exporting query + mutation objects.

## Data Layer

Prisma 7 with PostgreSQL via Accelerate. Models: User, Category, Product, Cart, Order/OrderItem, Sale/SaleItem, InventoryMovement. All IDs use `cuid()`. Monetary fields `Decimal(10,2)`. Generated client in `generated/prisma/`.

Inventory is shared between online orders and POS sales — stock decremented atomically in transactions.
