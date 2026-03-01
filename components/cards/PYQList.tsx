"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";

type PYQ = {
  id: string;
  question: string;
  difficulty: string;
  category: string;
  tags: string[];
  askedCount: number;
  company: { id: string; name: string };
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
  const companyParam = searchParams.get("company") ?? "";
  const searchParam = searchParams.get("search") ?? "";

  const [active, setActive] = useState<Tab>("All");
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Progress tracking
  const [hasTarget, setHasTarget] = useState(false);
  const [donePyqIds, setDonePyqIds] = useState<Set<string>>(new Set());
  const [companyId, setCompanyId] = useState<string>("");
  const [toggling, setToggling] = useState<string | null>(null);

  // Check if user has a prep target for this company
  useEffect(() => {
    if (!companyParam) return;
    fetch("/api/prep-targets")
      .then((r) => r.json())
      .then((targets) => {
        const target = targets.find(
          (t: any) => t.company.name.toLowerCase() === companyParam.toLowerCase()
        );
        if (target) {
          setHasTarget(true);
          setCompanyId(target.companyId);
          // Fetch which questions are done
          fetch(`/api/progress?companyId=${target.companyId}`)
            .then((r) => r.json())
            .then((ids: string[]) => setDonePyqIds(new Set(ids)));
        }
      });
  }, [companyParam]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setPyqs([]);
    fetch(`/api/pyqs?category=${active}&company=${companyParam}&search=${searchParam}&page=1`)
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
    fetch(`/api/pyqs?category=${active}&company=${companyParam}&search=${searchParam}&page=${nextPage}`)
      .then((r) => r.json())
      .then((data) => {
        setPyqs((prev) => [...prev, ...data.pyqs]);
        setPage(nextPage);
        setLoadingMore(false);
      });
  };

  const toggleDone = async (pyqId: string) => {
    if (!hasTarget || toggling) return;
    setToggling(pyqId);

    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pyqId, companyId }),
    });
    const data = await res.json();

    setDonePyqIds((prev) => {
      const next = new Set(prev);
      if (data.done) next.add(pyqId);
      else next.delete(pyqId);
      return next;
    });
    setToggling(null);
  };

  // Progress stats
  const doneCount = pyqs.filter((q) => donePyqIds.has(q.id)).length;
  const pct = total > 0 ? Math.round((donePyqIds.size / total) * 100) : 0;

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 bg-card-dark border border-white/5 rounded-xl p-1 w-fit mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              active === tab
                ? "bg-white/5 text-slate-100 shadow-sm"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Header + progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-lg font-bold">
            {searchParam ? `Results for "${searchParam}"` : "Most Asked Questions"}
          </h2>
          <span className="text-xs text-slate-400">{pyqs.length} of {total} questions</span>
        </div>

        {/* Progress bar — only show when prep target exists */}
        {hasTarget && total > 0 && (
          <div className="card p-3 mb-4 border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium">
                🎯 Prep Progress — <span className="text-primary">{donePyqIds.size}/{total} done</span>
              </p>
              <span className="text-xs text-slate-400">{pct}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: pct === 100 ? "#4ade80" : pct > 50 ? "#6366f1" : "#f472b6",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-3/4 mb-3" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 stagger">
            {pyqs.map((q) => {
              const isDone = donePyqIds.has(q.id);
              return (
                <div
                  key={q.id}
                  className={`card p-4 hover:border-white/10 animate-fade-up transition-all ${
                    isDone ? "opacity-60 border-green-400/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox — only when prep target exists */}
                    {hasTarget && (
                      <button
                        onClick={() => toggleDone(q.id)}
                        disabled={toggling === q.id}
                        className="shrink-0 mt-0.5 transition-all"
                      >
                        {isDone ? (
                          <CheckCircle2 size={18} className="text-green-400" />
                        ) : (
                          <Circle size={18} className="text-slate-400 hover:text-primary transition-colors" />
                        )}
                      </button>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <p className={`text-sm font-medium leading-relaxed ${isDone ? "line-through text-slate-400" : ""}`}>
                          {q.question}
                        </p>
                        <span className={`badge shrink-0 ${difficultyClass[q.difficulty] ?? "badge-medium"}`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
                        <span>🏢 {q.company.name}</span>
                        <span>📊 {q.category}</span>
                        {q.tags.slice(0, 2).map((t) => (
                          <span key={t}>🏷 {t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load more */}
          {pyqs.length < total && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-3 rounded-xl border border-white/10 text-sm text-slate-400 hover:text-slate-100 hover:border-primary/40 transition-all mt-4"
            >
              {loadingMore ? "Loading..." : `Load more (${total - pyqs.length} remaining)`}
            </button>
          )}

          {pyqs.length === 0 && (
            <div className="card p-10 text-center text-slate-400">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-sm">
                {searchParam
                  ? `No questions found for "${searchParam}".`
                  : "No questions found for this category yet."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}