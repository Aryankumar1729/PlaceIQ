"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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

const companyColors: Record<string, string> = {
  TCS: "bg-blue-500/10 text-blue-500",
  GOO: "bg-red-500/10 text-red-500",
  INF: "bg-yellow-500/10 text-yellow-600",
  AMZ: "bg-orange-500/10 text-orange-500",
  MIC: "bg-sky-500/10 text-sky-500",
  COG: "bg-purple-500/10 text-purple-500",
  WIP: "bg-teal-500/10 text-teal-500",
  HCL: "bg-blue-500/10 text-blue-400",
  ACC: "bg-violet-500/10 text-violet-500",
  ATL: "bg-blue-600/10 text-blue-600",
  UBE: "bg-slate-400/10 text-slate-300",
  VIS: "bg-amber-500/10 text-amber-500",
  JPM: "bg-slate-500/10 text-slate-400",
  GOL: "bg-blue-500/10 text-blue-300",
};

function getColorClass(shortName: string) {
  return companyColors[shortName.slice(0, 3).toUpperCase()] ?? "bg-primary/10 text-primary";
}

export default function CompanyGrid() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((data) => {
        const sorted = data
          .sort((a: Company, b: Company) => b._count.pyqs - a._count.pyqs)
          .slice(0, 4);
        setCompanies(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="mb-8">
        <h3 className="text-2xl font-display font-bold text-white mb-6">Trending Companies</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card-dark border border-white/5 rounded-2xl p-6 h-24 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-end mb-10">
        <div>
          <h3 className="text-2xl font-display font-bold text-white">Trending Companies</h3>
          <p className="text-slate-500 mt-1">Hiring active for 2026 graduate roles</p>
        </div>
        <Link
          href="/companies"
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-4">
        {companies.map((c) => (
          <Link
            key={c.id}
            href={`/companies/${c.id}`}
            className="group relative bg-card-dark border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 block"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Company info */}
              <div className="flex items-center gap-5 md:w-1/3">
                <div className={`w-14 h-14 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-lg ${getColorClass(c.shortName)}`}>
                  {c.shortName.slice(0, 3)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{c.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                    <span>{c.type}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span>{c.visitsTier2 ? "Visits 200+ colleges" : "Off-campus"}</span>
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-1 items-center justify-between gap-6">
                <div className="text-center">
                  <p className="text-xl font-display font-bold text-white">{c.baseCTC}L</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Base CTC</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-display font-bold text-white">{c._count.pyqs}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">PYQs</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-display font-bold text-white">{c.rounds} Rds</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Process</p>
                </div>
              </div>

              {/* Topic distribution bar */}
              <div className="md:w-1/4">
                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">
                  <span>Topic distribution</span>
                </div>
                <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-white/5">
                  <div className="h-full bg-indigo-500 w-[50%]" />
                  <div className="h-full bg-pink-500 w-[30%] ml-[2px]" />
                  <div className="h-full bg-green-500 w-[20%] ml-[2px]" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}