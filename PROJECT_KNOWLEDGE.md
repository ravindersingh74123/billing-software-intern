# Project Knowledge: BanavatNest

## Project Summary
**BanavatNest** is a comprehensive financial and billing platform designed primarily for Indian business owners, freelancers, and individual investors. It bridges the gap between traditional business management (Invoicing, GST compliance) and modern financial tracking (Crypto portfolios, EMI/Tax calculators).

- **Problem Solved:** Fragmentation of financial tasks.
- **Target Users:** Indian SMBs, freelancers, crypto investors.
- **Stage:** Active Development / Prototype.

## Tech Stack Summary
| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.2.4 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma (with `@prisma/adapter-pg`) |
| **Auth** | Custom JWT + Bcryptjs + `httpOnly` Cookies |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Lucide React, Framer Motion |
| **Charts** | Recharts |
| **Exports** | `xlsx` for Excel generation |

## Repository Structure
```text
D:\ravinder\billing antigravity\billing-software-intern\
├───app\
│   ├───api\ (Route Handlers for Auth, Crypto, Customers, Invoices, Items)
│   ├───components\ (Shared UI and Calculator implementations)
│   ├───dashboard\ (Billing CRM: Customers, Invoices, Items)
│   ├───generated\prisma\ (Custom output path for Prisma Client)
│   ├───(calculators)\ (EMI, GST, Income Tax, Crypto Calculator pages)
│   ├───login\ (Auth entry point)
│   └───layout.tsx (Root layout with TopBar and Auth check)
├───lib\
│   ├───auth.ts (JWT and Hashing utilities)
│   └───prisma.ts (Prisma client singleton with PG adapter)
└───prisma\ (Schema and migrations)
```

## Responsibility Mapping
- **`app/api/`**: Handles all data mutations and authentication logic.
- **`app/dashboard/`**: Protected routes for managing the core business entities.
- **`app/components/`**: Contains both reusable UI (TopBar) and domain-specific logic (GST/EMI calculators).
- **`lib/`**: Core infrastructure initialization (DB, Auth).

## Coding Conventions & Patterns
- **Auth Pattern:** Manual JWT verification in Route Handlers using a `getUser()` helper. `httpOnly` cookies for token storage.
- **Data Flow:** React Server Components (RSC) fetch data for layouts; Client Components handle form submissions and interactive logic via API calls.
- **Logic Placement:** Financial logic (GST/EMI/Profit) is currently contained within the respective components or Route Handlers.
- **Prisma Usage:** Uses a custom output directory (`app/generated/prisma`) and the `pg` adapter for PostgreSQL compatibility.
- **Error Handling:** Try-catch blocks in Route Handlers returning `NextResponse.json` with appropriate status codes.

## Application Flow
1. **Auth:** `login` -> `api/auth/login` -> sets cookie -> redirects to `dashboard`.
2. **Dashboard:** Sidebar navigation for Invoices/Customers/Items.
3. **Calculators:** Accessed via TopBar; mostly client-side logic with some persistence (Crypto).
4. **Billing:** `Customer` -> `Item` -> `Invoice` (with backend-side total calculation for security).

## Key Constraints
- **Financial Accuracy:** Totals and GST must be calculated on the backend (`api/invoices`) to prevent frontend tampering.
- **Environment:** Requires `DATABASE_URL` and `JWT_SECRET`.
- **Naming:** Follows standard Next.js and TypeScript conventions.

## Extension Guide
- **New Features:** Add a folder in `app/dashboard` for UI and `app/api` for logic.
- **New Calculators:** Add a folder in `app/` and a link in `TopBar.tsx`.
- **Database Changes:** Update `prisma/schema.prisma` and run `npx prisma migrate dev`.
