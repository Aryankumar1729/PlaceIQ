"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";


type PYQ = {
  id: string;
  question: string;
  difficulty: string;
  category: string;
  tags: string[];
  askedCount: number;
  lastSeen: string;
  company: { name: string };
};

const tabs = ["All", "DSA", "Aptitude", "HR", "Technical"] as const;
type Tab = (typeof tabs)[number];

const difficultyClass: Record<string, string> = {
  Easy: "badge-easy",
  Medium: "badge-medium",
  Hard: "badge-hard",
};

export default function PYQList() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") ?? "";

  const companyParam = searchParams.get("company"); // reads ?company=tcs from URL

  const [active, setActive] = useState<Tab>("All");
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    setPage(1);
    setPyqs([]);
    fetch(`/api/pyqs?category=${active}&company=${companyParam ?? ""}&page=1&search=${searchParam}`)
      .then((r) => r.json())
      .then((data) => {
        setPyqs(data.pyqs);
        setTotal(data.total);
        setLoading(false);
      });
  }, [active, companyParam, searchParam]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    fetch(`/api/pyqs?category=${active}&page=${nextPage}&search=${searchParam}`)
      .then((r) => r.json())
      .then((data) => {
        setPyqs((prev) => [...prev, ...data.pyqs]);
        setPage(nextPage);
        setLoadingMore(false);
      });
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 w-fit mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              active === tab
                ? "bg-surface2 text-[var(--text)] shadow-sm"
                : "text-muted hover:text-[var(--text)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-syne text-lg font-bold">Most Asked Questions</h2>
        <span className="text-xs text-muted">
          {pyqs.length} of {total} questions
        </span>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-surface2 rounded w-3/4 mb-3" />
              <div className="h-3 bg-surface2 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Questions list */}
          <div className="flex flex-col gap-3 stagger">
            {pyqs.map((q) => (
              <div
                key={q.id}
                className="card p-4 cursor-pointer hover:border-border-2 animate-fade-up"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-sm font-medium leading-relaxed">{q.question}</p>
                  <span
                    className={`badge shrink-0 ${
                      difficultyClass[q.difficulty] ?? "badge-medium"
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-[11px] text-muted">
                  <span>🏢 {q.company.name}</span>
                  <span>📊 {q.category}</span>
                  {q.tags.slice(0, 2).map((t) => (
                    <span key={t}>🏷 {t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Load more button */}
          {pyqs.length < total && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-3 rounded-xl border border-border-2 text-sm text-muted hover:text-[var(--text)] hover:border-accent/40 transition-all mt-4"
            >
              {loadingMore
                ? "Loading..."
                : `Load more (${total - pyqs.length} remaining)`}
            </button>
          )}

          {/* Empty state */}
          {pyqs.length === 0 && (
            <div className="card p-10 text-center text-muted">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-sm">No questions found for this category yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
