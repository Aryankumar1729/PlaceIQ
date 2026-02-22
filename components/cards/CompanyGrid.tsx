"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Company = {
  id: string;
  name: string;
  shortName: string;
  type: string;
  baseCTC: number;
  rounds: number;
  visitsTier2: boolean;
  tier: string;
  _count: { pyqs: number };
};

export default function CompanyGrid() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((data) => {
        // Sort by PYQ count descending, take top 4
        const sorted = data
          .sort((a: Company, b: Company) => b._count.pyqs - a._count.pyqs)
          .slice(0, 4);
        setCompanies(sorted);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-syne font-bold text-xl">Trending Companies</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5 h-40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-syne font-bold text-xl">Trending Companies</h2>
        <Link href="/companies" className="text-xs text-accent hover:underline">
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {companies.map((c) => (
          <div key={c.id} className="card p-5 hover:border-border-2 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center font-syne font-bold text-xs text-accent">
                {c.shortName.slice(0, 3)}
              </div>
              <div>
                <p className="font-syne font-bold text-sm">{c.name}</p>
                <p className="text-[11px] text-muted">
                  {c.type} · {c.visitsTier2 ? "Visits 200+ colleges" : "Off-campus"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-surface2 rounded-lg p-2 text-center">
                <p className="font-syne font-bold text-sm text-accent">{c.baseCTC}L</p>
                <p className="text-[10px] text-muted">Base CTC</p>
              </div>
              <div className="bg-surface2 rounded-lg p-2 text-center">
                <p className="font-syne font-bold text-sm text-accent-green">{c._count.pyqs}</p>
                <p className="text-[10px] text-muted">PYQs</p>
              </div>
              <div className="bg-surface2 rounded-lg p-2 text-center">
                <p className="font-syne font-bold text-sm">{c.rounds} Rds</p>
                <p className="text-[10px] text-muted">Process</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted">
                {c.visitsTier2 ? "✅ Visits Tier-2" : "🎯 Off-campus"}
              </span>
              <div className="flex gap-2">
                <Link
                  href={`/prep?company=${encodeURIComponent(c.name)}`}
                  className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all text-white hover:scale-105 hover:shadow-[0_0_12px_rgba(59,130,246,0.6)] active:scale-95"
                  style={{ background: "#3b82f6" }}
                >
                  View PYQs →
                </Link>
                <Link
                  href={`/companies/${c.id}`}
                  className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all text-white hover:scale-105 hover:shadow-[0_0_12px_rgba(29,78,216,0.6)] active:scale-95"
                  style={{ background: "#1d4ed8" }}
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}