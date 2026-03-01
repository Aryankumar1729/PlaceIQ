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
  tier1: "text-green-400 border-green-400/30 bg-green-400/10",
  product: "text-primary border-primary/30 bg-primary/10",
  service: "text-pink-400 border-pink-400/30 bg-pink-400/10",
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
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
          ● Company Database
        </p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight mb-2">
          {companies.length} companies,{" "}
          <span className="text-gradient">real data</span>
        </h1>
        <p className="text-slate-400 text-[15px]">
          Filter by CTC, tier, or role type. Click any company to see their PYQs.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 mb-8 animate-fade-up">
        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
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
          <div className="flex gap-1 bg-card-dark border border-white/5 rounded-xl p-1">
            {tierFilters.map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tier === t
                  ? "bg-white/5 text-slate-100"
                  : "text-slate-400 hover:text-slate-100"
                  }`}
              >
                {t === "All" ? "All Tiers" : tierLabel[t] ?? t}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex gap-1 bg-card-dark border border-white/5 rounded-xl p-1">
            {typeFilters.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${type === t
                  ? "bg-white/5 text-slate-100"
                  : "text-slate-400 hover:text-slate-100"
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
              <div className="h-5 bg-white/5 rounded w-2/3 mb-3" />
              <div className="h-3 bg-white/5 rounded w-1/2 mb-6" />
              <div className="h-10 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm">No companies found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {companies.map((c) => (
            <Link
              key={c.id}
              href={`/companies/${c.id}`}
              className="card p-5 cursor-pointer hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 animate-fade-up group"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-display font-bold text-xs">
                    {c.shortName.slice(0, 3)}
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm leading-tight">{c.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.type}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tierColor[c.tier] ?? "text-slate-400 border-white/10"
                    }`}
                >
                  {tierLabel[c.tier] ?? c.tier}
                </span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-white/5 rounded-lg p-2.5 text-center">
                  <p className="font-display font-bold text-sm text-primary">
                    {c.baseCTC}L
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Base CTC</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5 text-center">
                  <p className="font-display font-bold text-sm text-green-400">
                    {c._count.pyqs}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">PYQs</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5 text-center">
                  <p className="font-display font-bold text-sm">
                    {c.rounds} Rds
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Process</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-400">
                  {c.visitsTier2 ? "✅ Visits Tier-2" : "🎯 Off-campus"}
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/prep?company=${encodeURIComponent(c.name)}`}
                    className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all text-white hover:scale-105 hover:shadow-[0_0_12px_rgba(59,130,246,0.6)] active:scale-95"
                    style={{ background: "#3b82f6" }}
                  >
                    View PYQs
                  </Link>
                  <Link
                    href={`/companies/${c.id}`}
                    className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all text-white hover:scale-105 hover:shadow-[0_0_12px_rgba(29,78,216,0.6)] active:scale-95"
                    style={{ background: "#1d4ed8" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
