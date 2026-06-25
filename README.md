# 🎓 SchoolPilot

> The all-in-one school management platform built for Nigerian secondary schools.

SchoolPilot helps private secondary schools manage students, teachers, results, fee payments, attendance, and more — all from one place. Built mobile-first, multi-tenant, and designed to work on Nigeria's 3G networks.

---

## 🌐 Live URLs

| Portal | URL | Users |
|---|---|---|
| Super Admin | `superadmin.schoolpilot.ng` | SchoolPilot team only |
| Staff Portal | `staff.[school].schoolpilot.ng` | Admin, Bursar, Teachers |
| Student & Parent Portal | `[school].schoolpilot.ng` | Students, Parents |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Monorepo | Turborepo + pnpm workspaces |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Edge Functions | Supabase Edge Functions (Deno) |
| PDF Generation | Node.js + Puppeteer (standalone microservice) |
| Payments | Paystack (primary), Flutterwave (fallback) |
| SMS | Termii / Africa's Talking |
| Hosting | Vercel (frontend apps) + Railway (PDF service) |

---

## 📁 Project Structure

```
schoolpilot/
├── apps/
│   ├── super-admin/        # superadmin.schoolpilot.ng
│   ├── staff-portal/       # staff.[school].schoolpilot.ng
│   └── student-portal/     # [school].schoolpilot.ng (PWA)
├── packages/
│   ├── shared-types/       # TypeScript interfaces shared across all apps
│   ├── shared-utils/       # Reg number, PIN, grade calculator utilities
│   └── ui-kit/             # Shared base React components
├── supabase/
│   ├── migrations/         # PostgreSQL schema migrations (19 tables)
│   └── functions/          # Supabase Edge Functions
├── pdf-service/            # Standalone PDF generation microservice
└── infrastructure/         # Nginx config, Docker, docker-compose
```



## 👥 User Roles

| Role | Portal | Access Level |
|---|---|---|
| **Platform Super Admin** | Super Admin | Full platform control — all schools, billing, subscriptions |
| **School Admin** | Staff Portal | Full control within their school |
| **Bursar** | Staff Portal | Fee setup, payment tracking, reconciliation |
| **Teacher** | Staff Portal | Assigned classes only — attendance, scores, results |
| **Student** | Student Portal | Own profile, subjects, results, fees (read) |
| **Parent/Guardian** | Student Portal | Child's results, fees, attendance — can make payments |



## v1 Features

### 👨‍💼 School Admin
- School profile setup with logo and branding
- Create and manage academic sessions and terms
- Create class levels and arms (JSS1A → SS3E)
- Assign subjects to classes
- Assign teachers to subject-class combinations
- Add students individually or bulk import via CSV
- Auto-generate reg numbers and login PINs
- Generate and print student ID cards (batch PDF)
- Broadcast announcements to parents, students, or staff
- View result completion status across all subjects
- Unlock published results for correction (audit logged)
- Flag fee defaulters (restricts result and ID card access)

### 💰 Bursar
- Create fee items per term (school fees, levies, exam fees)
- Assign fees to specific class levels
- Track payments — per student, per class, per term
- Paystack integration — card, bank transfer, USSD
- Generate guest payment links for WhatsApp sharing
- Auto-generate PDF receipts on payment
- Daily collection summary and outstanding balance dashboard

### 👩‍🏫 Teacher
- View assigned subject-class combinations
- See full student roster per class (auto-populated)
- Mark attendance — present/absent per student, offline-capable
- Enter CA and exam scores per student
- Save scores as draft, publish when ready
- Published results locked — edit requires admin unlock

### 🎓 Student
- First-time login PIN change
- Complete own profile — bio data, guardian info, passport photo
- View all subjects offered that term with teacher names
- View published results — all terms, all sessions
- View fee balance and payment history
- Receive in-app and SMS notifications

### 👨‍👩‍👧 Parent / Guardian
- Register and link to child via reg number + linking code
- Manage multiple children under one account
- View child's results, attendance, and fee balance
- Pay fees directly via Paystack
- Pay via guest payment link without logging in
- Receive SMS alerts — absence, fee deadlines, results published



## 🗄️ Database Schema

19 tables across the following domains:

| Domain | Tables |
|---|---|
| **Tenancy** | `schools` |
| **Academic Calendar** | `sessions`, `terms` |
| **People** | `staff`, `students`, `parents`, `parent_students` |
| **Curriculum** | `classes`, `subjects`, `subject_assignments` |
| **Results** | `results`, `result_audit_logs` |
| **Attendance** | `attendance` |
| **Payments** | `fee_items`, `fee_item_classes`, `payments`, `guest_payment_links` |
| **Communication** | `announcements`, `notifications` |

All tables have **Row Level Security (RLS)** enabled. Every query is automatically scoped to the correct school — no cross-tenant data leakage is possible at the database level.

---

## 🔒 Security

- **Multi-tenant isolation** — RLS on every table; schools never see each other's data
- **Three-portal separation** — Super Admin, Staff, and Student portals independently hosted
- **JWT authentication** — Supabase Auth handles all session management
- **PIN hashing** — Student PINs hashed with bcrypt, never stored in plain text
- **Rate limiting** — Max 5 failed login attempts, then 15-minute lockout
- **Audit logs** — All result edits logged with timestamp, user, old values, new values, and reason
- **Result locking** — Published results locked; every unlock and edit is audit logged
- **HTTPS enforced** — Wildcard SSL covers all subdomains
- **Image optimization** — Student photos compressed client-side before upload (max 300KB)



## 📦 Shared Packages

| Package | Purpose |
|---|---|
| `@schoolpilot/shared-types` | TypeScript interfaces for all 19 entities |
| `@schoolpilot/shared-utils` | Reg number generator, PIN generator, grade calculator, formatters, validators |
| `@schoolpilot/ui-kit` | Base UI components — Button, Input, Modal, Table, Badge, Avatar |

Import in any app:
```ts
import { Student, Staff, Result } from '@schoolpilot/shared-types'
import { generateRegNumber, calculateGrade, formatCurrency } from '@schoolpilot/shared-utils'
import { Button, Input, Modal } from '@schoolpilot/ui-kit'
```

---

## 📲 Mobile & Offline

- **Mobile-first** — Student portal and teacher tools designed for Android phones first
- **PWA** — Student portal is installable on Android without the Play Store
- **Offline attendance** — Teachers mark attendance offline; syncs when connection returns
- **Offline score entry** — Scores saved locally, synced when connection returns
- **Low-bandwidth mode** — Compressed assets, optimized for 3G networks

---

## 💰 Pricing

| Plan | School Size | Annual Fee |
|---|---|---|
| **Starter** | Up to 290 students | ₦250,000 / session |
| **Growth** | 300 students and above | ₦450,000 / session |

- 1-month free trial on all plans
- School chains: 15% discount from second campus onwards
- One-time onboarding fee: ₦30,000–₦50,000

---

## 🚀 Getting Started (Development)

### Prerequisites
- Node.js 18+
- pnpm 8+
- Supabase CLI

### 1. Clone the repository
```bash
git clone https://github.com/poetrywithgod/schoolpilot.git
cd schoolpilot
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```

Fill in your Supabase URL, anon key, and Paystack public key in `.env`.

### 4. Push database migrations
```bash
supabase link
supabase db push
```

### 5. Start all apps
```bash
pnpm dev
```

This starts:
- Staff Portal → `http://localhost:5173`
- Student Portal → `http://localhost:5174`
- Super Admin → `http://localhost:5175`

---

## 🔄 Supabase Edge Functions

| Function | Trigger | Purpose |
|---|---|---|
| `paystack-webhook` | HTTP POST | Verify and record successful payments |
| `send-sms` | DB webhook | Send SMS via Termii on key events |
| `generate-guest-link` | HTTP POST | Create one-time fee payment links |
| `publish-results` | HTTP POST | Lock results and notify students + parents |
| `fee-reminder` | Scheduled (pg_cron) | SMS parents before fee deadlines |
| `attendance-alert` | Scheduled (pg_cron) | Daily absence SMS to parents |
| `subscription-check` | Scheduled (pg_cron) | Flag schools approaching expiry |

---

## 🗺️ Roadmap

### ✅ Phase 1 — Monorepo Foundation (Complete)
- Turborepo + pnpm workspaces
- Three Vite + React + TypeScript apps
- Tailwind CSS across all apps
- Shared packages (types, utils, ui-kit)
- GitHub repository

### ✅ Phase 2 — Database & Supabase (Complete)
- Supabase project (West EU - Ireland)
- 19-table PostgreSQL schema
- Row Level Security policies on all tables
- Supabase JS client connected to all apps
- Environment variables configured

### 🔄 Phase 3 — Staff Portal (In Progress)
- Authentication (login, protected routes, role guards)
- School profile & settings
- Class & subject setup
- Student management
- Staff management
- Attendance
- Score entry & result publishing
- Payments & fee setup
- Announcements
- ID card generation

### ⏳ Phase 4 — Student & Parent Portal
- Authentication (PIN login)
- Student dashboard & profile
- Subjects & results view
- Fee payment (Paystack)
- Parent registration & child linking

### ⏳ Phase 5 — PDF Service
- ID card generation
- Result slip generation
- Payment receipt generation

### ⏳ Phase 6 — Super Admin Panel
- School management
- Subscription management

### ⏳ Phase 7 — Integrations
- SMS via Termii
- Paystack webhooks
- Supabase Edge Functions
- PWA setup

---

## 📜 License

Private and proprietary. All rights reserved © 2026 SchoolPilot.

---

## 📞 Contact

Built with 🇳🇬 for Nigerian schools.
- Website: [schoolpilot.ng](https://schoolpilot.ng)
- Email: hello@schoolpilot.ng
- Support: support@schoolpilot.ng
