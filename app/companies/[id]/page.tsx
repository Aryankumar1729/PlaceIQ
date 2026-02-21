"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookmarkPlus, ExternalLink, ChevronRight } from "lucide-react";

type Company = {
  id: string;
  name: string;
  shortName: string;
  type: string;
  baseCTC: number;
  tier: string;
  visitsTier2: boolean;
  rounds: number;
  _count: { pyqs: number };
};

type PYQ = {
  id: string;
  question: string;
  difficulty: string;
  category: string;
  tags: string[];
};

const difficultyColor: Record<string, string> = {
  Easy: "text-accent-green",
  Medium: "text-yellow-400",
  Hard: "text-accent-pink",
};

const difficultyDot: Record<string, string> = {
  Easy: "bg-accent-green",
  Medium: "bg-yellow-400",
  Hard: "bg-accent-pink",
};


const roundData: Record<string, {
  rounds: { title: string; duration: string; difficulty: string; tags: string[] }[]
}> = {
  service: {
    rounds: [
      { title: "Online Assessment", duration: "90 Mins", difficulty: "Medium", tags: ["Numerical Ability", "Verbal", "Reasoning"] },
      { title: "Technical Interview", duration: "45 Mins", difficulty: "Hard", tags: ["Data Structures", "DBMS", "Projects"] },
      { title: "Managerial Round", duration: "30 Mins", difficulty: "Easy", tags: ["Situational", "Case Study"] },
      { title: "HR Round", duration: "20 Mins", difficulty: "Easy", tags: ["Behavioral", "Salary"] },
    ]
  },
  product: {
    rounds: [
      { title: "Online Assessment", duration: "90 Mins", difficulty: "Hard", tags: ["DSA", "Problem Solving"] },
      { title: "Technical Round 1", duration: "60 Mins", difficulty: "Hard", tags: ["DSA", "Algorithms"] },
      { title: "Technical Round 2", duration: "60 Mins", difficulty: "Hard", tags: ["System Design", "CS Fundamentals"] },
      { title: "HR Round", duration: "30 Mins", difficulty: "Easy", tags: ["Leadership", "Culture Fit"] },
    ]
  },
  tier1: {
    rounds: [
      { title: "Online Assessment", duration: "120 Mins", difficulty: "Hard", tags: ["DSA", "Competitive Programming"] },
      { title: "Technical Round 1", duration: "60 Mins", difficulty: "Hard", tags: ["DSA", "System Design"] },
      { title: "Technical Round 2", duration: "60 Mins", difficulty: "Hard", tags: ["Architecture", "Scalability"] },
      { title: "Hiring Manager", duration: "45 Mins", difficulty: "Medium", tags: ["Leadership", "Projects"] },
      { title: "HR Round", duration: "30 Mins", difficulty: "Easy", tags: ["Culture", "Compensation"] },
    ]
  },
};

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [similarCompanies, setSimilarCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetAdded, setTargetAdded] = useState(false);

  useEffect(() => {
    const id = params.id as string;

    fetch(`/api/companies/${id}`)
      .then((r) => r.json())
      .then((companyData) => {
        setCompany(companyData);

        // Fetch PYQs using company name
        fetch(`/api/pyqs?company=${encodeURIComponent(companyData.name)}&page=1`)
          .then((r) => r.json())
          .then((pyqData) => setPyqs(pyqData.pyqs?.slice(0, 5) ?? []));

        // Fetch similar companies
        fetch(`/api/companies?tier=${companyData.tier}`)
          .then((r) => r.json())
          .then((data) => {
            setSimilarCompanies(data.filter((c: Company) => c.id !== companyData.id).slice(0, 3));
          });

        // Check if already in prep targets
        fetch("/api/prep-targets")
          .then((r) => r.json())
          .then((targets) => {
            const exists = targets.some((t: any) => t.companyId === companyData.id);
            setTargetAdded(exists);
          });

        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-8 lg:p-10 max-w-3xl animate-pulse">
        <div className="h-6 bg-surface2 rounded w-48 mb-6" />
        <div className="h-20 bg-surface2 rounded-2xl mb-4" />
        <div className="h-40 bg-surface2 rounded-2xl" />
      </div>
    );
  }

  if (!company) return <div className="p-10 text-muted">Company not found.</div>;

  const rounds = roundData[company.tier]?.rounds ?? roundData.service.rounds;
  const dsaPct = Math.round((pyqs.filter(q => q.category === "DSA").length / Math.max(pyqs.length, 1)) * 100) || 45;
  const aptPct = Math.round((pyqs.filter(q => q.category === "Aptitude").length / Math.max(pyqs.length, 1)) * 100) || 30;
  const hrPct = 100 - dsaPct - aptPct;

  return (
    <div className="p-8 lg:p-10 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted mb-6 animate-fade-up">
        <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-[var(--text)] transition-colors">
          <ArrowLeft size={14} />
          Back
        </button>
        <span>/</span>
        <Link href="/companies" className="hover:text-[var(--text)] transition-colors uppercase tracking-wider">
          Companies
        </Link>
        <span>/</span>
        <span className="text-accent uppercase tracking-wider">{company.name}</span>
      </div>

      {/* Hero */}
      <div className="card p-6 mb-4 animate-fade-up">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center font-syne font-bold text-sm text-accent shrink-0">
            {company.shortName.slice(0, 3)}
          </div>
          <div>
            <h1 className="font-syne font-extrabold text-2xl">{company.name}</h1>
            <p className="text-sm text-muted">{company.type} · {company.visitsTier2 ? "Visits 200+ colleges" : "Off-campus / Top colleges"}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          {company.visitsTier2 && (
            <span className="text-xs px-3 py-1 rounded-full border border-border-2 text-muted">
              ✅ Visits Tier-2
            </span>
          )}
          <span className="text-xs px-3 py-1 rounded-full border border-border-2 text-muted">
            {company.rounds} Rounds
          </span>
          <span className="text-xs px-3 py-1 rounded-full border border-border-2 text-muted">
            {company.baseCTC}L Base CTC
          </span>
        </div>

        {/* CTAs */}
        <div className="flex gap-3">
          <button
            onClick={async () => {
              await fetch("/api/prep-targets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ companyId: company.id }),
              });
              window.location.href = `/prep?company=${encodeURIComponent(company.name)}`;
            }}
            className="btn-primary flex items-center gap-2"
          >
            🎯 Start Prep →
          </button>
          <button
            onClick={async () => {
              // Add to job tracker
              await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  companyName: company.name,
                  role: "SDE",
                  status: "Applied",
                  ctc: `${company.baseCTC}L`,
                }),
              });

              // Add to prep targets simultaneously
              await fetch("/api/prep-targets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ companyId: company.id }),
              });

              setTargetAdded(true);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${targetAdded
                ? "border-accent-green/40 text-accent-green bg-accent-green/10"
                : "border-border-2 text-muted hover:text-[var(--text)] hover:border-accent/40"
              }`}
          >
            <BookmarkPlus size={15} />
            {targetAdded ? "✅ Added to Tracker" : "Add to Tracker"}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-4 animate-fade-up">
        <div className="card p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-2 mb-1">Total PYQs</p>
          <p className="font-syne font-extrabold text-3xl text-accent-green">{company._count.pyqs}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-2 mb-1">DSA Focus</p>
          <p className="font-syne font-extrabold text-3xl text-accent">{dsaPct}%</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-2 mb-1">Aptitude</p>
          <p className="font-syne font-extrabold text-3xl text-accent-pink">{aptPct}%</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-2 mb-1">HR & Others</p>
          <p className="font-syne font-extrabold text-3xl">{hrPct}%</p>
        </div>
      </div>

      {/* Interview Rounds */}
      <div className="mb-6 animate-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-syne font-bold text-lg">Interview Rounds</h2>
          <div className="flex-1 h-px bg-accent/30" />
        </div>
        <div className="flex flex-col gap-3">
          {rounds.map((round, i) => (
            <div key={i} className="card p-4 hover:border-border-2 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-bold text-accent">
                    {i + 1}
                  </span>
                  <p className="font-syne font-bold text-sm">{round.title}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${difficultyDot[round.difficulty]}`} />
                  <span className={`text-xs font-semibold ${difficultyColor[round.difficulty]}`}>
                    {round.difficulty.toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted mb-2">Duration: {round.duration}</p>
              <div className="flex flex-wrap gap-1.5">
                {round.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-surface2 border border-border text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top PYQs */}
      <div className="mb-6 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-syne font-bold text-lg">Top PYQs</h2>
          <Link
            href={`/prep?company=${encodeURIComponent(company.name)}`}
            className="flex items-center gap-1 text-xs text-accent hover:underline"
          >
            View all {company._count.pyqs} questions
            <ExternalLink size={11} />
          </Link>
        </div>

        {pyqs.length === 0 ? (
          <div className="card p-6 text-center text-muted text-sm">
            No questions scraped yet for this company.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {pyqs.map((q) => (
              <div key={q.id} className="card p-4 hover:border-border-2 transition-all cursor-pointer group">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-relaxed line-clamp-2">{q.question}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-bold uppercase ${difficultyColor[q.difficulty]}`}>
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-2">{q.category}</span>
                      {q.tags.slice(0, 1).map((t) => (
                        <span key={t} className="text-[10px] uppercase tracking-wider text-muted-2">{t}</span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-muted shrink-0 group-hover:text-accent transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Similar Companies */}
      {similarCompanies.length > 0 && (
        <div className="animate-fade-up">
          <h2 className="font-syne font-bold text-lg mb-4">Similar Companies</h2>
          <div className="grid grid-cols-3 gap-3">
            {similarCompanies.map((c) => (
              <Link
                key={c.id}
                href={`/companies/${c.id}`}
                className="card p-4 hover:border-border-2 hover:-translate-y-0.5 transition-all text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-surface2 border border-border flex items-center justify-center font-syne font-bold text-xs mx-auto mb-2">
                  {c.shortName.slice(0, 3)}
                </div>
                <p className="font-syne font-bold text-xs mb-1">{c.name.split(" ")[0]}</p>
                <p className="text-[10px] text-muted">{c.baseCTC}L CTC · {c._count.pyqs} PYQs</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
