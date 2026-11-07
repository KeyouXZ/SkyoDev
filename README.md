# NIRAGA — Stock & Inventory

> Inventory management for small businesses: track products, record sales, scan barcodes, manage purchase orders, and get reorder suggestions before you run out.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-7-purple) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-green)

---

## Features

| Area | What you get |
|---|---|
| **Dashboard** | Total products, low-stock alerts, pending orders, inventory value — with count-up numbers and a sales chart |
| **Inventory** | CRUD products, search by name/SKU, low-stock filter, CSV export |
| **Purchase Orders** | Draft → Sent → Received flow with line items and confirm dialogs |
| **Suppliers** | Manage supplier contacts linked to products |
| **Sell** | Search + record sales; stock deducts automatically |
| **Barcode Scanner** | Camera scan (html5-qrcode) or manual SKU entry; receive stock or sell in seconds |
| **Forecast** | 30-day demand forecast (linear regression + seasonality) with reorder recommendations |
| **Notifications** | Low-stock + reorder alerts in the header bell, plus optional web push (VAPID) |
| **Preferences** | EN/ID language + USD/IDR currency (live rates, cached hourly) |
| **Account** | Edit name/phone from the header menu |

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4, Lucide icons |
| **Database** | PostgreSQL on Supabase, via Prisma 7 |
| **Data fetching** | SWR with shared hooks (`useProducts`, `useSuppliers`, `useOrders`, `useSales`) |
| **Charts** | Recharts |
| **Toasts** | Sonner |
| **Validation** | Zod |
| **Auth** | bcryptjs + session cookies |
| **Scanning** | html5-qrcode |
| **Push** | web-push (VAPID) |
| **Runtime** | Bun |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.4+ (Node 20+ works too)
- PostgreSQL (Supabase recommended)

### Setup

```bash
bun install
```

Create `.env`:

```env
# Database — use the transaction pooler (port 6543)
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"

# App URL (used for allowedDevOrigins in next.config.ts)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Web push keys — generate with: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_EMAIL="you@example.com"
```

> **Note:** Use port `6543` (transaction mode). Port `5432` (session mode) caps at ~15 connections and runs out fast in production.

```bash
bunx prisma migrate dev   # apply migrations
bun run seed              # demo account: demo@niraga.test / demo1234
bun run dev               # http://localhost:3000
```

### Camera on localhost

Browsers require a secure context for camera access. `http://localhost` counts as secure, so the scanner works out of the box in dev. For LAN testing from a phone, use HTTPS (e.g. via `mkcert`).

### Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start dev server |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run seed` | Seed demo account (7 days of data) |

---

## Project Layout

```
app/
├── (auth)/                  # Authenticated pages
│   ├── dashboard/           # Stats, sales chart, quick actions
│   ├── inventory/           # Product management
│   ├── purchase-orders/     # Purchase order management
│   ├── suppliers/           # Supplier management
│   ├── sell/                # Record sales
│   ├── scanner/             # Barcode / QR scanning
│   └── forecast/            # Demand forecast + reorder recommendations
├── api/                     # REST endpoints (see table below)
├── login/                   # Sign in / sign up
├── layout.tsx               # Root layout
├── error.tsx / global-error.tsx / not-found.tsx
components/                  # Header, Navigation, PageShell, dialogs, ...
hooks/                       # useProducts, useSuppliers, useOrders, useSales, useCountUp, ...
lib/                         # prisma, fetcher, format, i18n/, exchange-rate, forecast, ...
context/                     # UserContext, PreferencesContext (locale/currency)
auth/                        # Session + current-user helpers
prisma/                      # schema, migrations, seed
types/                       # Shared TypeScript types
next.config.ts               # allowedDevOrigins from NEXT_PUBLIC_APP_URL
```

---

## API

All endpoints require a logged-in session and return only your own data.

| Method | Endpoint | Description |
|---|---|---|
| `GET` / `POST` | `/api/products` | List / create products |
| `PUT` / `DELETE` | `/api/products/[id]` | Update / delete product |
| `GET` / `POST` | `/api/sales` | List / record sales (deducts stock) |
| `GET` / `POST` | `/api/purchase-orders` | List / create purchase orders |
| `PATCH` / `DELETE` | `/api/purchase-orders/[id]` | Update status / delete order |
| `GET` / `POST` | `/api/suppliers` | List / create suppliers |
| `PUT` / `DELETE` | `/api/suppliers/[id]` | Update / delete supplier |
| `GET` | `/api/scanner?sku=` | Look up product by SKU |
| `GET` / `POST` | `/api/suggestions` | List / create reorder suggestions |
| `GET` | `/api/forecast?horizon=` | Demand forecast per product |
| `GET` | `/api/notifications` | Low-stock + suggestion alerts |
| `POST` | `/api/notifications/subscribe` | Save push subscription |
| `GET` / `PATCH` | `/api/user` | Read / update current profile |
| `GET` / `POST` | `/api/compositions` | Product compositions (DB + API only) |

---

## Roadmap

### Coming next
- **Suggestions page** — review reorder suggestions and turn them into purchase orders
- **Barcode labels** — generate/print SKU labels with `jsbarcode`

### Planned
- **Teams & roles** — beyond single user
- **Deeper analytics** — margins, turnover, dead stock, custom ranges
- **Bulk tools** — CSV import, bulk price/stock updates
- **Audit log** — stock movement history

### Maybe later
- Dark mode

---

## License

MIT. See [LICENSE](LICENSE) for details.
