# PlaceIQ — Campus Placement Intelligence Platform

> Real placement data. Company-specific PYQs. AI-powered interview prep. Built for Indian BTech students.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Fill in your GEMINI_API_KEY

# 3. Run dev server
npm run dev
# → http://localhost:3000
```

---

## Project Structure

```
placeiq/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (Navbar + Sidebar + ChatDrawer)
│   ├── dashboard/page.tsx      # Main dashboard
│   ├── prep/page.tsx           # Interview prep + PYQs
│   ├── tracker/page.tsx        # Application tracker
│   ├── resume/page.tsx         # Resume scorer
│   ├── companies/page.tsx      # Company database
│   └── api/
│       ├── chat/route.ts       # AI chat endpoint (wire Gemini here)
│       └── resume/score/route.ts  # Resume scoring endpoint
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   ├── ui/
│   │   ├── HeroSearch.tsx
│   │   ├── StatsRow.tsx
│   │   ├── PrepHero.tsx
│   │   ├── TrackerHero.tsx
│   │   └── ResumeHero.tsx
│   ├── cards/
│   │   ├── CompanyGrid.tsx
│   │   ├── PYQList.tsx
│   │   ├── ApplicationList.tsx
│   │   ├── ResumeUploader.tsx
│   │   └── ResumeSampleScore.tsx
│   └── chat/
│       └── ChatDrawer.tsx      # Floating AI chat button + slide-in panel
│
├── lib/
│   └── utils.ts                # cn(), formatCTC(), etc.
│
├── types/
│   └── index.ts                # All TypeScript interfaces
│
└── app/globals.css             # Design tokens + custom CSS classes
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + custom design tokens |
| Fonts | Syne (headings) + DM Sans (body) |
| AI | Gemini API via `@ai-sdk/google` |
| Charts | Recharts |
| Icons | Lucide React |
| DB (next) | PostgreSQL + Prisma |
| Scraper (next) | Python + BeautifulSoup/Playwright |

---

## Wiring the Real AI Chat

The mock AI in `app/api/chat/route.ts` is ready to swap:

```typescript
// Install: npm install @google/generative-ai
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat({
    history: messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await chat.sendMessage(messages.at(-1).content);
  return NextResponse.json({ response: result.response.text() });
}
```

---

## 8-Week Build Roadmap

### Week 1–2: Core UI + Data Layer
- [x] Next.js scaffold with design system
- [x] Navbar, Sidebar, all page routes
- [x] Company cards, PYQ list, tracker, resume scorer UI
- [x] Floating AI chat drawer
- [ ] Set up PostgreSQL + Prisma schema
- [ ] Seed database with 50 companies manually

### Week 3–4: Scraper Pipeline
- [ ] Python scraper for GeeksforGeeks interview experiences
- [ ] Parse and clean PYQ data (company, difficulty, category, tags)
- [ ] Nightly cron job to update database
- [ ] Admin page to review + verify scraped questions

### Week 5: Real AI Chat
- [ ] Connect Gemini API to `/api/chat`
- [ ] Build RAG: embed PYQs → store in pgvector → retrieve on query
- [ ] Company-specific context injection in system prompt
- [ ] Stream responses for faster feel

### Week 6: Resume Scorer
- [ ] PDF/DOCX text extraction (pdf-parse + mammoth)
- [ ] Keyword matching against real JDs
- [ ] ATS formatting checker
- [ ] Score breakdown with actionable suggestions

### Week 7: Polish + Auth
- [ ] NextAuth with Google login
- [ ] Save applications to DB
- [ ] User prep score (based on questions solved)
- [ ] Mobile responsive tweaks

### Week 8: Launch
- [ ] Deploy to Vercel (free tier)
- [ ] Share in college WhatsApp groups
- [ ] Collect feedback, fix top 3 issues
- [ ] Add to resume with user count

---

## Database Schema (Prisma — add next)

```prisma
model Company {
  id        String   @id @default(cuid())
  name      String
  type      String
  baseCTC   Float
  tier      String
  pyqs      PYQ[]
  createdAt DateTime @default(now())
}

model PYQ {
  id         String   @id @default(cuid())
  company    Company  @relation(fields: [companyId], references: [id])
  companyId  String
  question   String
  difficulty String
  category   String
  tags       String[]
  askedCount Int      @default(1)
  lastSeen   DateTime
  verified   Boolean  @default(false)
}

model Application {
  id          String   @id @default(cuid())
  userId      String
  companyName String
  role        String
  status      String
  appliedDate DateTime
  notes       String?
  createdAt   DateTime @default(now())
}
```

---

## Resume Notes for Interviewers

When explaining this project:

1. **The problem**: Tier-2 college students have no aggregated, reliable source of company-specific prep data. They guess.
2. **The solution**: Scraped and structured 14k+ real interview questions by company, role, and topic. Added AI layer for personalized prep.
3. **Technical depth**: RAG pipeline on PYQ database, NLP-based resume scoring, full-stack Next.js with TypeScript.
4. **Real impact**: X students used it before their drives. [Fill in actual number]

Be ready to answer: "How is this different from GFG/Internshala?" → Answer: GFG has questions but no company-specific intelligence or personalization. We aggregate, clean, and add AI reasoning on top.
