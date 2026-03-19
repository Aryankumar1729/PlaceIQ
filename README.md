# PlaceIQ 🎯

> Campus placement intelligence platform built for Indian BTech students tired of scattered WhatsApp forwards and outdated PDFs.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?style=flat-square&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)
![Groq](https://img.shields.io/badge/AI-Groq%20%2F%20Llama%203.3%2070B-orange?style=flat-square)

---

## The Problem

Every placement season, 2M+ Indian BTech students face the same chaos — interview questions scattered across 50 GFG tabs, company data buried in WhatsApp groups, and zero way to track which companies they've applied to. PlaceIQ fixes this.

---

## What It Does

- **1500+ real PYQs** scraped from GeeksforGeeks and LeetCode Discuss across 15+ companies
- **Company-specific prep targets** — set a target for Google, Wipro, Atlassian separately and track progress per company
- **AI-powered chat** using Groq (Llama 3.3 70B) to answer placement-related queries instantly
- **Job application tracker** — track every drive, OA, interview round, and offer in one place
- **Smart search** — search "arrays" → prep page with DSA questions, search "TCS" → company page
- **JWT authentication** — secure register/login with bcrypt password hashing
- **Real-time dashboard** — live company count, PYQ count, and student count from actual database

---

## Companies Covered

| Company | PYQs | Type |
|---------|------|------|
| Tata Consultancy Services | 82+ | IT Services |
| Infosys | 47+ | IT Services |
| Cognizant | 104+ | IT Services |
| Accenture | 89+ | IT Services |
| HCL Technologies | 62+ | IT Services |
| Google India | 97+ | Product |
| Amazon | 50+ | Product |
| Microsoft | 150+ | Product |
| JP Morgan | 60+ | BFSI |
| Goldman Sachs | 90+ | BFSI |
| Natwest Group | 20+ | BFSI |
| Wipro | 60+ | IT Services |
| Atlassian | 90+ | Product |
| Uber | 50+ | Product |
| Visa | 120+ | Fintech |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (serverless) |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma 5.22 |
| Auth | Custom JWT (jsonwebtoken + bcrypt) |
| AI | Groq API — Llama 3.3 70B |
| Scraper | Python (BeautifulSoup, Requests, psycopg2) |
| Deployment | Vercel + Neon |
| Fonts | Syne (headings) + DM Sans (body) |

---

## Features In Detail

### 🔐 Authentication
- Email + password registration with bcrypt hashing (12 rounds)
- JWT tokens stored in httpOnly cookies (7-day expiry)
- Middleware-based route protection
- Profile management with college, branch, CGPA, grad year

### 📚 Interview Prep
- 500+ questions categorized as DSA, Aptitude, HR, Technical
- Difficulty tagging (Easy / Medium / Hard)
- Pagination with "Load More" (20 questions per page)
- Filter by category + search by topic simultaneously
- Company-specific question filtering

### 🎯 Prep Targets
- Set prep targets per company (Google OA, Wipro OA separately)
- Track questions marked as done per company
- Progress bar on dashboard (12/97 questions · 12%)
- Visual progress — color changes green as you complete more

### 🏢 Company Intelligence
- Dedicated company detail pages with round breakdowns
- CTC data, tier classification, campus visit info
- Topic distribution (DSA % / Aptitude % / HR %)
- Similar companies section

### 📋 Job Tracker
- Add applications with company, role, CTC, status
- Status pipeline: Applied → OA → Interview → Offer / Rejected
- Stats row showing count per status
- Expandable cards with notes and next steps

### 🤖 AI Chat
- Powered by Groq (Llama 3.3 70B) — fastest inference available
- Placement-context aware responses
- Floating chat widget accessible from all pages

---

## Data Pipeline

```
GFG / LeetCode Discuss
        ↓
Python Scraper (BeautifulSoup + GraphQL)
        ↓
Question extraction + classification
        ↓
PostgreSQL (Neon) via psycopg2
        ↓
Prisma ORM → Next.js API Routes
        ↓
React Frontend
```

Scraper auto-classifies questions into DSA / Aptitude / HR / Technical and tags difficulty based on keyword analysis. Unique constraint on `(question, companyId)` prevents duplicates on re-runs.

---

## Project Structure

```
placeiq/
├── app/
│   ├── api/
│   │   ├── auth/          # register, login, logout, me
│   │   ├── companies/     # list + detail
│   │   ├── pyqs/          # paginated questions with search
│   │   ├── applications/  # job tracker CRUD
│   │   ├── prep-targets/  # company prep targets
│   │   ├── progress/      # question completion tracking
│   │   ├── stats/         # real-time dashboard counts
│   │   └── chat/          # Groq AI chat
│   ├── companies/[id]/    # company detail page
│   ├── dashboard/
│   ├── prep/
│   ├── tracker/
│   └── profile/
├── components/
│   ├── cards/             # PYQList, CompanyGrid, PrepTargets, Tracker
│   ├── layout/            # Navbar, Sidebar
│   └── ui/                # PrepHero, HeroSearch, ThemeSwitcher
├── scraper/
│   ├── main.py            # orchestrator
│   ├── scraper.py         # GFG scraper
│   ├── leetcode_scraper.py # LeetCode Discuss GraphQL scraper
│   └── db.py              # Neon insert logic
├── lib/
│   ├── auth.ts            # JWT + bcrypt helpers
│   └── prisma.ts          # Prisma client singleton
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

---

## Getting Started

```bash
# Clone
git clone https://github.com/yourusername/placeiq.git
cd placeiq

# Install
npm install

# Environment variables
cp .env.example .env.local
# Fill in DATABASE_URL, JWT_SECRET, GROQ_API_KEY

# Database
npx prisma migrate dev
npx prisma db seed

# Run scraper
cd scraper
pip install -r requirements.txt
python main.py

# Start dev server
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_here
GROQ_API_KEY=gsk_...
NEXTAUTH_URL=http://localhost:3000
ADMIN_REVIEW_KEY=strong_random_key_for_admin_pyq_review_api
```

### PYQ Verification Pipeline (v1)

- New quality fields on each PYQ: confidence score, source metadata, dedupe group, and review status.
- Default listing (`/api/pyqs`) now returns only `approved` PYQs and auto-ranks by quality + frequency + recency.
- Admin review API:
        - `GET /api/admin/pyqs/review?status=pending&limit=25`
        - `PATCH /api/admin/pyqs/review` with `{ pyqId, action, reviewNotes?, confidenceScore?, sourceType?, sourceUrl?, sourceReputation?, reviewedBy? }`
        - Auth: logged-in user with `User.role = "admin"`
        - Optional emergency access: header `x-admin-review-key: <ADMIN_REVIEW_KEY>`
- `action` values: `approve`, `reject`, `needs_changes`.

### Promote a user to admin

Run once in your project root:

```bash
node -e 'const {PrismaClient}=require("@prisma/client"); const prisma=new PrismaClient(); (async()=>{ const email="your-email@example.com"; const r=await prisma.user.update({where:{email}, data:{role:"admin"}}); console.log("Promoted:", r.email); await prisma.$disconnect(); })().catch(async(e)=>{console.error(e); await prisma.$disconnect(); process.exit(1);});'
```

---

## Roadmap

- [ ] User-submitted interview experiences (crowdsourced PYQ growth)
- [ ] Email alerts for upcoming campus drives
- [ ] AmbitionBox scraper integration
- [ ] Mobile app (React Native)
- [ ] College-specific drive calendar
- [ ] Resume ATS scorer

---

## Why This Exists

Built this during placement season after watching batchmates scramble through 20 browser tabs trying to find "what does TCS ask in round 2". The data exists — it's just fragmented across the internet. PlaceIQ puts it in one place, organized, searchable, and personalized to your actual shortlists.
---

*Built by a BTech student, for BTech students.*
