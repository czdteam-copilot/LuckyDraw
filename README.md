# 🧧 Lì Xì Online — Lucky Money Web App

A beautiful Lunar New Year "Lucky Money (Lì Xì)" web application built with **Next.js 16**, **Tailwind CSS 4**, and **Supabase**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Fair Draw** | Atomic PL/pgSQL function with `FOR UPDATE SKIP LOCKED` — zero race conditions |
| 🧧 **Red Envelope** | Animated red envelope with shake + float effects |
| 🎉 **Confetti** | Confetti explosion on winning |
| 💳 **Bank Form** | Winners submit bank details (name, account number, owner) |
| 🔐 **Admin Dashboard** | Password-protected `/admin` route to view winners & transfer money |
| 🍪 **Replay Prevention** | Cookie-based check prevents accidental double draws |
| 📱 **Responsive** | Works on mobile, tablet, and desktop |

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** and run the contents of `supabase/migration.sql`.
3. Copy your project URL, anon key, and service role key.

### 3. Configure Environment

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
ADMIN_PASSWORD=your-secret-password
```

### 4. Run Development Server

```bash
npm run dev
```

- Landing page: [http://localhost:3000](http://localhost:3000)
- Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🗄️ Database Schema

### `prizes` table
| Column | Type | Description |
|---|---|---|
| id | BIGINT | Auto-increment PK |
| label | TEXT | Display name (e.g. "50,000 VND") |
| amount | INTEGER | Value in VND |
| quantity | INTEGER | Remaining count |

### `winners` table
| Column | Type | Description |
|---|---|---|
| id | BIGINT | Auto-increment PK |
| prize_id | BIGINT | FK → prizes.id |
| prize_label | TEXT | Cached label |
| prize_amount | INTEGER | Cached amount |
| bank_name | TEXT | Bank or e-wallet name |
| account_number | TEXT | Account / phone number |
| account_owner | TEXT | Account holder name |
| created_at | TIMESTAMPTZ | Timestamp |

### `draw_prize()` — PL/pgSQL Function

The core draw mechanism uses `SELECT ... FOR UPDATE SKIP LOCKED` to:
1. Pick a random prize with `quantity > 0`
2. Lock that specific row (other concurrent requests skip it)
3. Decrement the quantity
4. Insert a winner record

This guarantees **no two users can win the same last prize**.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Tailwind + custom animations
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Entry point
│   ├── home-page.tsx        # Main client component (draw flow)
│   ├── admin/
│   │   └── page.tsx         # Admin dashboard
│   └── api/
│       ├── draw/route.ts    # POST — atomic prize draw
│       ├── prizes/route.ts  # GET — prize pool status
│       └── winners/route.ts # GET/POST — winners list & bank form
├── components/
│   ├── Envelope.tsx         # Red envelope UI
│   ├── ResultCard.tsx       # Prize result display
│   ├── BankForm.tsx         # Bank details form
│   └── Particles.tsx        # Floating particles background
├── lib/
│   ├── supabase.ts          # Public Supabase client
│   └── supabase-admin.ts    # Service-role Supabase client
supabase/
    └── migration.sql        # Full DB schema + seed data + draw function
```

---

## 🔧 Customization

- **Prize pool:** Edit the `INSERT INTO prizes` block in `supabase/migration.sql`, or update values directly in Supabase's table editor.
- **Admin password:** Set `ADMIN_PASSWORD` in `.env.local`.
- **Theme & animations:** Edit `src/app/globals.css`.

---

## 📦 Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (PostgreSQL + RLS + RPC)
- [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- [js-cookie](https://www.npmjs.com/package/js-cookie)
