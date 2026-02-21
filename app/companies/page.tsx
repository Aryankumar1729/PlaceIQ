"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

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

const tierFilters = ["All", "tier1", "product", "service"];
const typeFilters = ["All", "IT Services", "Product", "E-commerce", "Fintech"];

const tierLabel: Record<string, string> = {
  tier1: "Tier 1",
  product: "Product",
  service: "Service",
};

const tierColor: Record<string, string> = {
  tier1: "text-accent-green border-accent-green/30 bg-accent-green/10",
  product: "text-accent border-accent/30 bg-accent/10",
  service: "text-accent-pink border-accent-pink/30 bg-accent-pink/10",
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [tier, setTier] = useState("All");
  const [type, setType] = useState("All");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tier !== "All") params.set("tier", tier);
    if (type !== "All") params.set("type", type);

    fetch(`/api/companies?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setCompanies(data);
        setLoading(false);
      });
  }, [search, tier, type]);

  return (
    <div className="p-8 lg:p-10">
      {/* Hero */}
      <div className="mb-8 animate-fade-up">
        <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
          ● Company Database
        </p>
        <h1 className="font-syne text-4xl font-extrabold tracking-tight mb-2">
          {companies.length} companies,{" "}
          <span className="text-gradient">real data</span>
        </h1>
        <p className="text-muted text-[15px]">
          Filter by CTC, tier, or role type. Click any company to see their PYQs.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 mb-8 animate-fade-up">
        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            className="input-field pl-10 w-full max-w-md"
            placeholder="Search company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-4">
          {/* Tier filter */}
          <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
            {tierFilters.map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tier === t
                    ? "bg-surface2 text-[var(--text)]"
                    : "text-muted hover:text-[var(--text)]"
                  }`}
              >
                {t === "All" ? "All Tiers" : tierLabel[t] ?? t}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
            {typeFilters.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${type === t
                    ? "bg-surface2 text-[var(--text)]"
                    : "text-muted hover:text-[var(--text)]"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Company Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 bg-surface2 rounded w-2/3 mb-3" />
              <div className="h-3 bg-surface2 rounded w-1/2 mb-6" />
              <div className="h-10 bg-surface2 rounded" />
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="card p-12 text-center text-muted">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm">No companies found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {companies.map((c) => (
            <Link
              key={c.id}
              href={`/companies/${c.id}`}
              className="card p-5 cursor-pointer hover:border-border-2 hover:-translate-y-0.5 transition-all duration-200 animate-fade-up group"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface2 border border-border flex items-center justify-center font-syne font-bold text-xs">
                    {c.shortName.slice(0, 3)}
                  </div>
                  <div>
                    <p className="font-syne font-bold text-sm leading-tight">{c.name}</p>
                    <p className="text-xs text-muted mt-0.5">{c.type}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tierColor[c.tier] ?? "text-muted border-border"
                    }`}
                >
                  {tierLabel[c.tier] ?? c.tier}
                </span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-surface2 rounded-lg p-2.5 text-center">
                  <p className="font-syne font-bold text-sm text-accent">
                    {c.baseCTC}L
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">Base CTC</p>
                </div>
                <div className="bg-surface2 rounded-lg p-2.5 text-center">
                  <p className="font-syne font-bold text-sm text-accent-green">
                    {c._count.pyqs}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">PYQs</p>
                </div>
                <div className="bg-surface2 rounded-lg p-2.5 text-center">
                  <p className="font-syne font-bold text-sm">
                    {c.rounds} Rds
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">Process</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>
                  {c.visitsTier2 ? "✅ Visits Tier-2" : "🎯 Off-campus"}
                </span>
                <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  View PYQs →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
